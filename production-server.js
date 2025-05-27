// Production server entry point that uses pre-compiled JavaScript
// This is used for deployment since Node.js can't directly run TypeScript files
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for deployment
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: 'production',
    timestamp: new Date().toISOString()
  });
});

// API health check endpoint
app.get('/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    environment: 'production'
  });
});

// Serve static files from the client build directory
const clientPath = path.join(__dirname, 'dist/client');
app.use(express.static(clientPath));

// Import and register server routes from the compiled JavaScript
try {
  const { registerRoutes } = await import('./dist/server/index.js');
  await registerRoutes(app);
  console.log('API routes registered successfully');
} catch (error) {
  console.error('Error registering routes:', error);
  // Continue without API routes for basic health check
}

// Error handler
app.use((err, req, res, next) => {
  console.error(`Server Error: ${err.message}`);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message 
  });
});

// Fallback route - serve the SPA for all other requests
app.get('*', (req, res) => {
  const indexPath = path.join(clientPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Application not available');
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});