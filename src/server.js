require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const salesRoutes = require('./routes/sales.routes');

const app = express();

// connect DB
connectDB();

// security
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

// rate limiter
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 120
}));

// health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Great Nexus API', ts: new Date().toISOString() });
});

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/erp/sales', salesRoutes);

// catch-all
app.all('*', (req, res) => res.status(404).json({ error: 'not_found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Great Nexus API running on port ${PORT}`);
});
