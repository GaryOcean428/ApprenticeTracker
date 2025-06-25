// Production server entry point that uses pre-compiled JavaScript
// This is used for deployment since Node.js can't directly run TypeScript files
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Remove duplicate favicon handler - moved below

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
  // Try importing the compiled server module
  let routesRegistered = false;
  
  try {
    const { registerRoutes } = await import('./dist/index.js');
    if (registerRoutes && typeof registerRoutes === 'function') {
      await registerRoutes(app);
      routesRegistered = true;
      console.log('API routes registered successfully from registerRoutes');
    }
  } catch (importError) {
    console.log('Could not import registerRoutes, trying alternative method');
  }
  
  if (!routesRegistered) {
    // Manual route registration for essential endpoints
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
    
    console.log('Essential API routes registered manually');
  }
} catch (error) {
  console.error('Error setting up routes:', error);
  // Essential fallback routes
  app.get('/api/*', (req, res) => {
    res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'API routes not loaded'
    });
  });
}

// Serve static files from the client build directory with explicit favicon handling
const clientPath = path.join(__dirname, 'public');

// Ensure favicon exists at root level for production
const rootFaviconPath = path.join(__dirname, 'favicon.ico');
const distFaviconPath = path.join(__dirname, 'dist', 'public', 'favicon.ico');
try {
  if (!fs.existsSync(rootFaviconPath) && fs.existsSync(distFaviconPath)) {
    fs.copyFileSync(distFaviconPath, rootFaviconPath);
    console.log('Favicon copied to root for production serving');
  }
} catch (error) {
  console.log('Could not copy favicon:', error.message);
}

// Priority favicon route before static middleware
app.get('/favicon.ico', (req, res) => {
  // Try multiple potential favicon locations
  const faviconPaths = [
    path.join(__dirname, 'favicon.ico'),
    path.join(__dirname, 'public', 'favicon.ico'),
    path.join(__dirname, 'dist', 'public', 'favicon.ico'),
    path.join(__dirname, 'client', 'public', 'favicon.ico')
  ];
  
  let served = false;
  
  const tryNextPath = (index) => {
    if (index >= faviconPaths.length || served) {
      if (!served) {
        res.status(204).end();
      }
      return;
    }
    
    const currentPath = faviconPaths[index];
    res.sendFile(currentPath, (err) => {
      if (err) {
        tryNextPath(index + 1);
      } else {
        served = true;
        console.log(`Favicon served from: ${currentPath}`);
      }
    });
  };
  
  tryNextPath(0);
});

// Serve static files with proper error handling
app.use(express.static(clientPath, { 
  index: false, // Don't auto-serve index.html
  setHeaders: (res, filePath) => {
    // Set proper MIME types for assets
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  }
}));

// Add specific handling for common asset types that might be missing
app.get('*.css', (req, res) => {
  console.log(`CSS file requested but not found: ${req.path}`);
  res.status(404).type('text/css').send('/* CSS file not found */');
});

app.get('*.js', (req, res) => {
  console.log(`JS file requested but not found: ${req.path}`);
  res.status(404).type('application/javascript').send('// JS file not found');
});

// Serve assets from attached_assets directory
app.use('/assets', express.static(path.join(__dirname, 'attached_assets')));

// Error handler with proper JSON responses
app.use((err, req, res, next) => {
  console.error(`Server Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  
  // Ensure we always return JSON for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message 
    });
  }
  
  // For non-API routes, return HTML error page
  res.status(500).send(`
    <!DOCTYPE html>
    <html>
    <head><title>Server Error</title></head>
    <body>
      <h1>Server Error</h1>
      <p>Something went wrong. Please try again later.</p>
    </body>
    </html>
  `);
});

// Handle all remaining requests
app.use('*', (req, res) => {
  // API routes that weren't handled by route registration
  if (req.path.startsWith('/api/')) {
    console.log(`Unhandled API route: ${req.method} ${req.path}`);
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  }
  
  // Serve React app for all other routes
  const indexPath = path.join(clientPath, 'index.html');
  
  // Check if build files exist before attempting to serve
  if (!fs.existsSync(indexPath)) {
    console.error('Frontend build files not found at:', indexPath);
    return res.status(503).json({
      error: 'Application not ready',
      message: 'Frontend build files are missing. Please run npm run build first.'
    });
  }
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({
        error: 'Frontend not available',
        message: 'Build files not found'
      });
    }
  });
});

// Start server with error handling
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Static files served from: ${clientPath}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

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