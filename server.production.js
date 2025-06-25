// Simple production server for Replit deployment
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
});