// lib/db.js
import mysql from 'mysql2/promise';

const poolOptions = {
    host: process.env.TIDB_HOST,
    port: parseInt(process.env.TIDB_PORT || '4000', 10),
    user: process.env.TIDB_USERNAME,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000, // close idle connections after 60 seconds
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
};

let pool;

// In development, cache the pool on the global object to prevent connection leaks during hot-reloads
if (process.env.NODE_ENV === 'production') {
    pool = mysql.createPool(poolOptions);
} else {
    if (!global._mysqlPool) {
        global._mysqlPool = mysql.createPool(poolOptions);
    }
    pool = global._mysqlPool;
}

export default pool;