import { QueryConfig } from 'pg';
import dotenv from 'dotenv';
import pool from 'pg';
const { Pool } = pool;

dotenv.config();

class PgClient {
    private pool;

    public constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }

    public getPool() {
        return this.pool;
    }

    public async query(queryConfig: QueryConfig) {
        return this.pool.query(queryConfig.text, queryConfig.values);
    }
}

export { PgClient };
