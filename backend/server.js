require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRedis, isRedisHealthy } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  : ['http://localhost:5173', 'http://localhost:3000'];

// Add production frontend URL if both are set
if (process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
} else if (process.env.NODE_ENV !== 'production') {
  // Development mode - allow localhost
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.FRONTEND_URL || '*')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const redisHealthy = await isRedisHealthy();

  res.status(redisHealthy ? 200 : 503).json({
    success: redisHealthy,
    message: redisHealthy ? 'Server is running' : 'Server degraded — Redis unavailable',
    redis: redisHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/resume-versions', require('./routes/resumeRoutes'));

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectRedis()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Redis connection failed: ${error.message}`);
    process.exit(1);
  });
