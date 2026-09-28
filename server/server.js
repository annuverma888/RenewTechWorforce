require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Initialize MongoDB connection
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Dynamic CORS configuration supporting environment URLs, Vercel deployments, and local development
const rawAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const envOrigins = [process.env.CLIENT_URL, process.env.FRONTEND_URL]
  .filter(Boolean)
  .flatMap((url) => url.split(',').map((u) => u.trim().replace(/\/+$/, '')));

const allowedOrigins = [...new Set([...rawAllowedOrigins, ...envOrigins])];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin server requests
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    // 1. Check explicit list
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    // 2. Allow any Vercel domain (e.g. *.vercel.app)
    if (/\.vercel\.app$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // 3. Allow local dev ports in non-production
    if (process.env.NODE_ENV !== 'production') {
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
        return callback(null, true);
      }
    }

    // Block unknown origins in production
    console.warn(`[CORS Blocked]: Request from unauthorized origin: ${origin}`);
    return callback(new Error(`CORS blocked request from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static folder for uploaded files/documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/technicians', require('./routes/technicianRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/matching', require('./routes/matchingRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/workforce', require('./routes/workforceRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RenewTech Workforce API is running',
    status: 'healthy',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RenewTech Workforce API is healthy',
    status: 'healthy',
  });
});

// Global 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[RenewTech API Server]: Running in ${process.env.NODE_ENV || 'development'} mode on http://127.0.0.1:${PORT}`);
});

// Handle uncaught exceptions and unhandled promise rejections safely
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]:', err);
});

module.exports = app;
