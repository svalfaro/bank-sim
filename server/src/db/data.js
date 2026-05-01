/*
 * data.js — database connection pool
 *
 * A pool maintains multiple open connections to PostgreSQL.
 * Instead of opening and closing a connection on every request
 * (expensive), the pool keeps connections alive and reuses them.
 *
 * Why pool and not a single connection?
 * Multiple users hit your server simultaneously. A single connection
 * handles one query at a time — everyone else waits. A pool of 10
 * connections handles 10 simultaneous queries. That's concurrency.
 *
 * Why dotenv-safe instead of dotenv?
 * dotenv loads variables silently — missing variables are just undefined.
 * dotenv-safe checks against .env.example and throws immediately if
 * anything required is missing. Fail fast, fail loud.
 */

import 'dotenv-safe/config.js';
import pg from 'pg'

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // max connection in the pool
    max: 10,

    // how long to wait for a connection before throwing (ms)
    connectionTimeoutMillis: 5000,

    // how long a connection can sit idle before being closed (ms)
    idleTimeoutMillis: 30000,
});

/*
 * testConnection -> verifies the pool can reach postgresql on startup
 * called once when the server starts; if it fails, the server exists
 * immediately rather than starting in a broken state.
 * the error bubbles up whenever testConnection() is called, re: server.js decides what to do if it fails
 */

export async function testConnection() {
    const client = await pool.connect();
    try {
        await client.query('SELECT NOW()');
        console.log('Database connected successfully.');
    } finally {
        client.release();
    }
}

export default pool;