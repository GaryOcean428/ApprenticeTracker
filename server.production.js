// Simple production server for Replit deployment
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use port 5000 for production deployment (Replit maps this to external port 80)
const PORT = process.env.PORT || 5000;

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