// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting middleware - More specific targeting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health'
});

// Apply rate limiting only to sensitive routes
app.use('/api/bookings', limiter);
app.use('/api/users', limiter);

// Simplified CORS configuration - More permissive for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001', // In case you need different ports
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));

// Body parsing middleware - Simplified without custom verification
app.use(express.json({ 
  limit: '10mb'
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware - Simplified
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  // Only log booking requests in development
  if (process.env.NODE_ENV === 'development' && req.method === 'POST' && req.path.includes('/bookings')) {
    console.log('Booking request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Environment info
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
console.log(`📧 Email User: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);

// Routes - Import with better error handling
let userRoutes, bookingRoutes;

try {
  userRoutes = require('./routes/userRoutes');
  bookingRoutes = require('./routes/bookingRoutes');
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  process.exit(1);
}

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'WanderWise API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: 'Connected',
    emailService: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
    uptime: process.uptime()
  });
});

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    message: 'WanderWise API Documentation',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      users: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        logout: 'POST /api/users/logout',
        profile: 'GET /api/users/profile',
        all: 'GET /api/users/all'
      },
      bookings: {
        create: 'POST /api/bookings',
        getAll: 'GET /api/bookings',
        getById: 'GET /api/bookings/:id',
        getByReference: 'GET /api/bookings/reference/:reference',
        updateStatus: 'PUT /api/bookings/:id/status',
        cancel: 'DELETE /api/bookings/:id',
        testValidation: 'POST /api/bookings/test-validation'
      }
    },
    requiredFields: {
      booking: {
        user: 'string (2-50 chars)',
        customerEmail: 'valid email',
        contactNumber: 'phone number (10-16 digits)',
        destination: 'string',
        date: 'ISO date (future date)',
        people: 'number (1-20)',
        totalAmount: 'number (>= 0)',
        specialRequests: 'string (optional, max 500 chars)'
      }
    }
  });
});

// Test route for debugging
app.post('/api/test', (req, res) => {
  console.log('Test route hit with body:', req.body);
  res.json({
    success: true,
    message: 'Test endpoint working',
    receivedData: req.body,
    headers: {
      'content-type': req.get('Content-Type'),
      'user-agent': req.get('User-Agent'),
      origin: req.get('Origin')
    }
  });
});

// Global error handling middleware - Improved
app.use((err, req, res, next) => {
  console.error('Global error handler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      success: false,
      message: 'CORS error: Origin not allowed' 
    });
  }
  
  // JSON parsing error
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid JSON in request body' 
    });
  }
  
  // Rate limit error
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /api/health',
      'GET /api',
      'POST /api/bookings',
      'GET /api/bookings',
      'POST /api/users/register',
      'POST /api/test'
    ]
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('Forcing shutdown...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 WanderWise API Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
  }
});

module.exports = app;