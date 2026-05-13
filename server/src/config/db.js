const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.query('SELECT NOW()')
    .then(() => console.log('Database connected successfully'))
    .catch((error) => {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    });

module.exports = pool;
