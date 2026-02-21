const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Allow all origins if CORS_ORIGINS includes '*'
    if (corsOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // If no CORS_ORIGINS is set in production, allow all origins for now
    if (!process.env.CORS_ORIGINS) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}));

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'Icon Medellín API' });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, msg: 'Server is healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});

module.exports = app;
