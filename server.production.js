// Clean production server for Replit deployment
// This file avoids importing the development server code to prevent port conflicts
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express server
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle favicon request to prevent 500 errors
app.get('/favicon.ico', (req, res) => {
  // Try to serve the actual favicon first
  const faviconPath = path.join(__dirname, 'dist/public/favicon.ico');
  res.sendFile(faviconPath, (err) => {
    if (err) {
      // If file doesn't exist, return 204 No Content
      res.status(204).end();
    }
  });
});

// Essential health check endpoint for deployment
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health-check', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'apprentice-tracker'
  });
});

// Essential API routes for production
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'apprentice-tracker',
    environment: 'production'
  });
});

// Try to import and register full API routes
try {
  const { registerRoutes } = await import('./dist/index.js');
  if (registerRoutes && typeof registerRoutes === 'function') {
    const httpServer = { listen: () => {} }; // Mock HTTP server for route registration
    await registerRoutes(app, httpServer);
    console.log('Full API routes registered successfully');
  }
} catch (error) {
  console.log('Could not load full API routes, using fallback endpoints');
  
  // Fallback essential routes
  app.get('/api/auth/verify', (req, res) => {
    res.status(200).json({ user: null, authenticated: false });
  });
  
  app.post('/api/auth/login', (req, res) => {
    res.status(401).json({ error: 'Authentication service unavailable' });
  });
  
  app.get('/api/fairwork/award-updates', (req, res) => {
    res.status(200).json({ success: true, data: [] });
  });
  
  // Catch-all for other API routes
  app.use('/api/*', (req, res) => {
    res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'API routes not loaded properly'
    });
  });
}

// Serve static files
const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));

// Basic error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Server error' });
});

// Catch-all handler
app.get('*', (req, res) => {
  const indexFile = path.join(staticPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(404).send('Application not found');
    }
  });
});

// Start server with error handling
// Use port 5000 for Replit deployment (which maps to external port 80)
const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Production server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
      if (port === 5000) {
        console.log('Trying alternative port 8080...');
        startServer(8080);
      } else if (port === 8080) {
        console.log('Trying alternative port 3000...');
        startServer(3000);
      } else {
        console.error('No available ports found');
        process.exit(1);
      }
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });

  return server;
};

const server = startServer(PORT);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});