// only handles database connectivity, pooling, etc.

import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config() // load .env vars

const { Pool } = pg;
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

// testing connection
async function testConnection() {
    const client = await pool.connect();
    console.log('Database is connected successfully.');
    client.release();
}

// run test immediately
// testConnection().catch(err => {
//     console.error('Database connection failed', err.stack);
//     process.exit(1);
// });

export default pool;