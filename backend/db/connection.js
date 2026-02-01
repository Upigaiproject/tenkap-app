const { Pool } = require('pg');

// Default to development logic if DATABASE_URL is not set
// In a real scenario, you'd likely fail or fallback, but for now we'll just log
if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL is not set. Database features will fail unless using Mock DB.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});

// Test connection on startup (non-blocking)
if (process.env.DATABASE_URL) {
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('❌ Database connection failed:', err);
        } else {
            console.log('✅ Database connected:', res.rows[0].now);
        }
    });
}

module.exports = pool;
