import { PgClient } from '../database/pg-client.js';
import { PersonTable } from '../database/sql/person.js';
import { AncestryTable } from '../database/sql/ancestry.js';

const pgClient = new PgClient();

await pgClient.query(PersonTable.create());
await pgClient.query(AncestryTable.create());
await pgClient.query(AncestryTable.createDetectCycle());
await pgClient.query(AncestryTable.createAncestryLink());
await pgClient.query(AncestryTable.createGetAncestor());
await pgClient.query(AncestryTable.createGetDescendant());
await pgClient.getPool().end();
