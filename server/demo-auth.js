#!/usr/bin/env node

/**
 * Demo script showcasing the 100x improved authentication routes
 * 
 * Run with: node server/demo-auth.js
 */

import express from 'express';
import { authRouter } from './api/auth-routes.js';

const app = express();
const PORT = 3001;

// Basic Express setup
app.use(express.json());
app.use('/api/auth', authRouter);

// Demo homepage
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Enhanced Authentication Demo Server',
    features: [
      'Rate limiting (5 login attempts per 15min)',
      'Comprehensive audit logging', 
      'Input validation & sanitization',
      'Security headers (XSS, CSRF protection)',
      'JWT token refresh mechanism',
      'User caching for performance',
      'Development fallback authentication',
      'Standardized error responses'
    ],
    endpoints: {
      'GET /api/auth/health': 'System health check',
      'POST /api/auth/login': 'User authentication',
      'POST /api/auth/register': 'User registration', 
      'GET /api/auth/verify': 'Token verification',
      'POST /api/auth/refresh': 'Refresh JWT token',
      'POST /api/auth/logout': 'User logout',
      'GET /api/auth/profile': 'User profile'
    },
    testCommands: [
      'curl -X GET http://localhost:3001/api/auth/health',
      'curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d \'{"email":"demo@example.com","password":"demopassword"}\'',
      'curl -X GET http://localhost:3001/api/auth/verify -H "Authorization: Bearer YOUR_TOKEN_HERE"'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Enhanced Auth Demo Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('🔐 Authentication Improvements Demonstrated:');
  console.log('  ✅ Rate limiting prevents brute force attacks');
  console.log('  ✅ Comprehensive audit logging tracks all auth events');
  console.log('  ✅ Input validation blocks malicious payloads');
  console.log('  ✅ Security headers protect against XSS/CSRF');
  console.log('  ✅ JWT tokens include issuer/audience validation');
  console.log('  ✅ User data caching improves performance');
  console.log('  ✅ Development fallback enables testing without DB');
  console.log('  ✅ Standardized error responses improve debugging');
  console.log('');
  console.log('🧪 Try these commands:');
  console.log(`  curl -X GET http://localhost:${PORT}/api/auth/health`);
  console.log(`  curl -X POST http://localhost:${PORT}/api/auth/login \\`);
  console.log('    -H "Content-Type: application/json" \\');
  console.log('    -d \'{"email":"demo@example.com","password":"demo123"}\'');
  console.log('');
  console.log('📊 Watch the audit logs in real-time as requests come in!');
});