// Production server entry point that uses pre-compiled JavaScript
// This is used for deployment since Node.js can't directly run TypeScript files
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express server
const app = express();
app.use(express.json());

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, 'dist/client')));

// Health check endpoint for deployment
app.get('/', (req, res) => {
  res.status(200).send('Health check OK');
});

// API health check endpoint
app.get('/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Import server routes from the compiled JavaScript
import { registerRoutes } from './dist/index.js';

// Register API routes
try {
  registerRoutes(app);
} catch (error) {
  console.error('Error registering routes:', error);
}

// Fallback route - serve the SPA for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Port configuration for deployment
const port = process.env.PORT || 5000;

// Start server
app.listen(port, () => {
  console.log(`Production server running on port ${port}`);
});