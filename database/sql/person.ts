import { QueryConfig } from "pg";

/**
 * Person table
 *
 */
export class PersonTable {
    /**
     * Create Person table
     * 
     * @returns QueryConfig
     */
    static create(): QueryConfig {
        return {
            text: `CREATE TABLE person (
                discord_id text NOT NULL UNIQUE,
                color text NOT NULL DEFAULT '#ff0000',
                PRIMARY KEY (discord_id)
            );`
        };
    }

    /**
     * Get Person
     * 
     * @param discordId
     * @returns QueryConfig
     */
        static get(discordId: string): QueryConfig {
            return {
                text: `SELECT color FROM person WHERE discord_id = $1 LIMIT 1;`,
                values: [discordId]
            };
        }

    /**
     * Upsert Person
     * 
     * @param discordId
     * @returns QueryConfig
     */
    static upsert(discordId: string): QueryConfig {
        return {
            text: `INSERT INTO person (discord_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING TRUE;`,
            values: [discordId]
        };
    }

    /**
     * Set node color
     * 
     * @param discordId
     * @param color
     * @returns QueryConfig
     */
    static setColor(discordId: string, color: string): QueryConfig {
        return {
            text: `UPDATE person SET color = $2 WHERE discord_id = $1;`,
            values: [discordId, color]
        };
    }
};
