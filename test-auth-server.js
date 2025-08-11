#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { authRouter } from './api/auth-routes.js';

const app = express();
const port = 5001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-test-server',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', authRouter);

// Start server
app.listen(port, () => {
  console.log(`🚀 Auth test server running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/auth/health');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/register');
  console.log('  GET  /api/auth/verify');
});