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

// Health check endpoint for deployment monitoring (not on root path)
app.get('/health-check', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    environment: 'production'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: 'production',
    timestamp: new Date().toISOString()
  });
});

// Import and register server routes from the compiled JavaScript
try {
  const { registerRoutes } = await import('./dist/server/index.js');
  await registerRoutes(app);
  console.log('API routes registered successfully');
} catch (error) {
  console.error('Error registering routes:', error);
  // Continue serving static files even if API routes fail
}

// Serve static files from the client build directory
const clientPath = path.join(__dirname, 'dist/public');
app.use(express.static(clientPath, { index: 'index.html' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(`Server Error: ${err.message}`);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message 
  });
});

// Serve React app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  // Skip API routes and health checks
  if (req.path.startsWith('/api') || req.path === '/health-check' || req.path === '/health') {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  
  const indexPath = path.join(clientPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({
        status: 'healthy',
        environment: 'production',
        timestamp: new Date().toISOString(),
        note: 'Frontend build not available, showing health status'
      });
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});