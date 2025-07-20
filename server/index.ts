import express, { type Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import { seedDatabase } from './seed-db';
import { migrateFairWorkSchema } from './migrate-db';
import { migrateGtoComplianceSchema } from './migrate-gto-compliance';
import { seedGtoComplianceStandards } from './seed-gto-compliance';
import { seedEnrichmentData } from './seed-enrichment';
import { migrateVetSchema } from './migrate-vet';
import { migrateRolesSchema } from './migrate-roles';
import { migrateHostPreferredQualifications } from './migrate-host-preferred-quals';
import { migrateEnrichmentSchema } from './migrate-enrichment';
import { migrateProgressReviewsSchema } from './migrate-progress-reviews';
import { migrateHostEmployersFields } from './migrate-host-employers-fields';
import { migrateWHS } from './migrate-whs';
import { migrateWhsDocuments } from './migrate-whs-documents';
import { migrateWhsRiskAssessments } from './migrate-whs-risk-assessments';
import { migrateLabourHireSchema } from './migrate-labour-hire';
import { migrateUnifiedContactsSystem, seedContactTags } from './migrate-unified-contacts';
import { initializeScheduledTasks } from './scheduled-tasks';

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Common React dev port
    'http://localhost:5000', // Same port as server
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000', 
    'http://127.0.0.1:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Favicon handler
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Dynamic port (default 5000 for dev, from env for prod)
const port = parseInt(process.env.PORT || '5000', 10);

// Health routes
if (process.env.NODE_ENV === 'production') {
  app.get('/', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      environment: 'production',
      timestamp: new Date().toISOString(),
      port,
    });
  });
}
app.get('/health-check', (_req, res) => res.status(200).send('OK'));
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'apprentice-tracker',
    environment: process.env.NODE_ENV || 'development',
    fairwork_api: {
      url_configured: !!process.env.FAIRWORK_API_URL,
      key_configured: !!process.env.FAIRWORK_API_KEY,
    },
  });
});

// API request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + '…';
      log(logLine);
    }
  });
  next();
});

(async () => {
  // Migrations, with error logging
  try {
    await migrateRolesSchema(); log('Role Management schema migration completed');
    await migrateFairWorkSchema(); log('Fair Work schema migration completed');
    await migrateGtoComplianceSchema(); log('GTO Compliance schema migration completed');
    await migrateVetSchema(); log('VET Training schema migration completed');
    await migrateHostPreferredQualifications(); log('Host Preferred Qualifications schema migration completed');
    await migrateEnrichmentSchema(); log('Enrichment Program schema migration completed');
    await migrateProgressReviewsSchema(); log('Progress Reviews schema migration completed');
    await migrateHostEmployersFields(); log('Host Employers Fields migration completed');
    await migrateWHS(); log('Work Health and Safety (WHS) tables migration completed');
    await migrateWhsDocuments(); log('WHS documents schema updated successfully');
    await migrateWhsRiskAssessments(); log('WHS Risk Assessments schema updated successfully');
    await migrateLabourHireSchema(); log('Labour Hire Workers schema migration completed');
    await migrateUnifiedContactsSystem(); log('Unified Contacts and Clients schema migration completed');
  } catch (error) {
    log('Error migrating database schema: ' + error);
  }

  // Seeding, with error logging
  try {
    await seedDatabase(); log('Database seeded successfully');
    await seedGtoComplianceStandards(); log('GTO Compliance Standards seeded successfully');
    await seedEnrichmentData(); log('Enrichment Program data seeded successfully');
    await seedContactTags(); log('Contact Tags seeded successfully');
  } catch (error) {
    log('Error seeding database: ' + error);
  }

  // Register API/app routes
  const server = await registerRoutes(app);

  // Unmatched API routes (for debugging 404s)
  app.use('/api/*', (req, res) => {
    log(`[404] Unmatched API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
      success: false,
      message: `API route not found: ${req.method} ${req.originalUrl}`,
      availableRoutes: [
        'GET /api/health',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/auth/verify',
      ],
    });
  });

  // Attach error handler for API errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    log(`[ERROR] ${status}: ${message}`);
    res.status(status).json({ message });
    throw err;
  });

  // Vite/static serving (dev vs prod)
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    log(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  log(`Using port: ${port}`);

  // Port robust start: fallback to alt ports if needed
  const startServerWithFallback = (targetPort: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const instance = server.listen({
        port: targetPort,
        host: '0.0.0.0',
        reusePort: true,
      }, () => {
        log(`Server successfully started on port ${targetPort}`);
        try {
          initializeScheduledTasks();
          log('Scheduled tasks initialized');
        } catch (error) {
          log(`Failed to initialize scheduled tasks: ${error}`);
        }
        resolve(instance);
      });
      instance.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          log(`Port ${targetPort} is already in use`);
          reject(error);
        } else {
          log(`Server error on port ${targetPort}: ${error.message}`);
          reject(error);
        }
      });
    });
  };

  let serverInstance;
  try {
    serverInstance = await startServerWithFallback(port);
  } catch (error) {
    // Try fallback ports if default in use
    const alternatives = process.env.NODE_ENV === 'production'
      ? [8080, 3000, 5001]
      : [5002, 5003, 8080];
    let started = false;
    for (const alt of alternatives) {
      try {
        log(`Trying alternative port ${alt}...`);
        serverInstance = await startServerWithFallback(alt);
        started = true;
        break;
      } catch {
        log(`Port ${alt} also in use, trying next...`);
      }
    }
    if (!started) {
      log('No available ports found. Exiting...');
      process.exit(1);
    }
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    serverInstance.close(() => log('Process terminated'));
  });
  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully');
    serverInstance.close(() => log('Process terminated'));
  });
})().catch(error => {
  log(`Fatal error during startup: ${error}`);
  process.exit(1);
});

// Export routes for prod server
export { registerRoutes } from './routes';