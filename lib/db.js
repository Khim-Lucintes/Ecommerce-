// lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    port: 4000,
    user: process.env.TIDB_USERNAME,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: { rejectUnauthorized: true }, // required for TiDB Cloud
});

export default pool;