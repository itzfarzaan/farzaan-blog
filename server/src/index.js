require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pool = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            success: true,
            message: 'Server is healthy',
            timestamp: result.rows[0].now,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Database connection failed',
        });
    }
});

app.use('/api', routes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Blog API running on port ${PORT}`);
});
