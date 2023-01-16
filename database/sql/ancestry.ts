import { QueryConfig } from "pg";

/**
 * Ancesty table
 *
 */
export class AncestryTable {
    /**
     * Create Ancestry table
     * 
     * @returns QueryConfig
     */
    static create(): QueryConfig {
        return {
            text: `CREATE TABLE ancestry (
                parent_id text,
                child_id text,
                PRIMARY KEY (parent_id, child_id),
                FOREIGN KEY (parent_id) REFERENCES person(discord_id),
                FOREIGN KEY (child_id) REFERENCES person(discord_id)
            );`
        };
    }

    /**
     * Create detect_cycle function
     * 
     * @returns QueryConfig
     */
    static createDetectCycle(): QueryConfig {
        return {
            text: `CREATE FUNCTION detect_cycle()
                RETURNS TRIGGER AS
            $$
            BEGIN
                IF NOT EXISTS (WITH RECURSIVE c AS (
                    SELECT NULL::text, NEW.child_id AS child_id
                    UNION ALL
                    SELECT a.parent_id, a.child_id
                    FROM ancestry a JOIN c ON a.parent_id = c.child_id
                ) SELECT 1 FROM c WHERE child_id = NEW.parent_id) THEN
                    IF EXISTS (SELECT 1 FROM ancestry WHERE parent_id = NEW.parent_id AND child_id = NEW.child_id) THEN
                        NOTIFY cycle_watcher, 'DUPE';
                        RETURN NULL;
                    ELSE
                        NOTIFY cycle_watcher, 'SUCCESS';
                        RETURN NEW;
                    END IF;
                ELSE
                    NOTIFY cycle_watcher, 'CYCLE';
                    RETURN NULL;
                END IF;
            END;
            $$ LANGUAGE plpgsql VOLATILE;`
        };
    }

    /**
     * Create get_descendant function
     * 
     * @returns QueryConfig
     */
    static createGetDescendant(): QueryConfig {
        return {
            text: `CREATE FUNCTION get_descendant(cid text, gen int default 5)
                RETURNS TABLE (
                    parent_id text,
                    child_id text,
                    counter int
                ) AS
            $$
            BEGIN
                RETURN QUERY WITH RECURSIVE c AS (
                    SELECT NULL::text AS parent_id, cid AS child_id, 0 AS cnt, gen AS generations
                    UNION ALL
                    SELECT a.parent_id, a.child_id, cnt - 1, generations - 1
                    FROM ancestry a JOIN c ON a.parent_id = c.child_id
                    WHERE generations > 0
                ) SELECT c.parent_id, c.child_id, c.cnt AS counter FROM c ORDER BY c.cnt;
            END;
            $$ LANGUAGE plpgsql VOLATILE;`
        };
    }

    /**
     * Create get_ancestor function
     * 
     * @returns QueryConfig
     */
    static createGetAncestor(): QueryConfig {
        return {
            text: `CREATE FUNCTION get_ancestor(pid text, gen int default 5)
                RETURNS TABLE (
                    parent_id text,
                    child_id text,
                    counter int
                ) AS
            $$
            BEGIN
                RETURN QUERY WITH RECURSIVE c AS (
                    SELECT pid AS parent_id, NULL::text AS child_id, 0 AS cnt, gen AS generations
                    UNION ALL
                    SELECT a.parent_id, a.child_id, cnt + 1, generations - 1
                    FROM ancestry a JOIN c ON a.child_id = c.parent_id
                    WHERE generations > 0
                ) SELECT c.parent_id, c.child_id, c.cnt AS counter FROM c BY c.cnt;
            END;
            $$ LANGUAGE plpgsql VOLATILE;`
        };
    }

    /**
     * Create get_ancestry function
     * 
     * @returns QueryConfig
     */
    static getAncestry(id: string, generations: number): QueryConfig {
        return {
            text: `SELECT parent_id, child_id, counter FROM get_ancestor($1, $2) UNION SELECT parent_id, child_id, counter FROM get_descendant($1, $2) ORDER BY counter;`,
            values: [id, generations]
        };
    }

    /**
     * Create ancestry_link trigger
     * 
     * @returns QueryConfig
     */
    static createAncestryLink(): QueryConfig {
        return {
            text: `CREATE TRIGGER ancestry_link
            BEFORE INSERT ON ancestry
            FOR EACH ROW EXECUTE PROCEDURE detect_cycle();`
        };
    }

    /**
     * Insert Ancestry
     * 
     * @param parentId
     * @param childId
     * @returns QueryConfig
     */
    static insert(parentId: string, childId: string): QueryConfig {
        return {
            name: 'insert-ancestry',
            text: `INSERT INTO ancestry (parent_id, child_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING TRUE AS is_inserted;`,
            values: [parentId, childId]
        };
    }
};
