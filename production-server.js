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

// API endpoints - in production, we'd import these from compiled files
// For this minimal deployment server, we're just providing a health check

// Fallback route - serve the SPA for all other requests
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