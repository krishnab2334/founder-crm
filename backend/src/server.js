// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { initializeWebSocket } = require('./utils/websocket');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const taskRoutes = require('./routes/tasks');
const dealRoutes = require('./routes/deals');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');

// Initialize express app
const app = express();
const server = http.createServer(app);

// ------------------- CORS ------------------- //
// Allow multiple origins: localhost + deployed frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://founder-crm-eight.vercel.app' // Add your deployed frontend URL
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser requests (like Postman)
    if(allowedOrigins.includes(origin)){
      return callback(null, true);
    } else {
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true
}));

// ------------------- Middleware ------------------- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ------------------- Health Check ------------------- //
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Founder CRM API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ------------------- API Routes ------------------- //
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// ------------------- 404 Handler ------------------- //
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ------------------- Error Handling ------------------- //
app.use((err, req, res, next) => {
  console.error('Error:', err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ------------------- WebSocket ------------------- //
initializeWebSocket(server);

// ------------------- Start Server ------------------- //
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection(); // Test database connection

    server.listen(PORT, () => {
      console.log('=================================');
      console.log('🚀 Founder CRM API Server');
      console.log('=================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket ready`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
