/**
 * Main Server Application - Plaque Registration System Backend
 * 
 * This is the main entry point for the backend API server of the
 * Plaque Registration System for the Democratic Republic of Congo.
 * 
 * The server provides:
 * - RESTful API endpoints for plaque management
 * - User authentication and authorization
 * - SQLite database integration
 * - CORS support for frontend integration
 * - Request logging and error handling
 * - Health check endpoints
 * 
 * @author Ahmed
 * @version 1.0.0
 * @since 2024
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const database = require('./database/database');

// Import routes
const authRoutes = require('./routes/auth');
const plaqueRoutes = require('./routes/plaques');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Plaque Registration System API'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/plaques', plaqueRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// Database connection and server startup
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    
    // Start server
    const server = app.listen(config.port, () => {
      console.log(`🚗 Plaque Registration System API running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🗄️  Database: ${config.dbPath}`);
      console.log(`🌐 CORS enabled for frontend on port 3000`);
      console.log(`\n🎯 Available endpoints:`);
      console.log(`   GET  /health - Health check`);
      console.log(`   POST /api/auth/login - User login`);
      console.log(`   POST /api/auth/register - User registration`);
      console.log(`   GET  /api/auth/me - Get current user`);
      console.log(`   GET  /api/plaques - Get all plaques`);
      console.log(`   POST /api/plaques - Register new plaque`);
      console.log(`   GET  /api/plaques/:id - Get plaque by ID`);
      console.log(`   PUT  /api/plaques/:id - Update plaque`);
      console.log(`   DELETE /api/plaques/:id - Delete plaque (admin only)`);
      console.log(`   GET  /api/plaques/stats/overview - Get statistics`);
      console.log(`\n📝 Default admin credentials:`);
      console.log(`   Email: admin@example.com`);
      console.log(`   Password: password`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received, shutting down gracefully...');
      server.close(async () => {
        await database.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received, shutting down gracefully...');
      server.close(async () => {
        await database.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 