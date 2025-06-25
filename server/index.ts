import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed-db";
import { migrateFairWorkSchema } from "./migrate-db";
import { migrateGtoComplianceSchema } from "./migrate-gto-compliance";
import { seedGtoComplianceStandards } from "./seed-gto-compliance";
import { seedEnrichmentData } from "./seed-enrichment";
import { migrateVetSchema } from "./migrate-vet";
import { migrateRolesSchema } from "./migrate-roles";
import { migrateHostPreferredQualifications } from "./migrate-host-preferred-quals";
import { migrateEnrichmentSchema } from "./migrate-enrichment";
import { migrateProgressReviewsSchema } from "./migrate-progress-reviews";
import { migrateHostEmployersFields } from "./migrate-host-employers-fields";
import { migrateWHS } from "./migrate-whs";
import { migrateWhsDocuments } from "./migrate-whs-documents";
import { migrateWhsRiskAssessments } from "./migrate-whs-risk-assessments";
import { migrateLabourHireSchema } from "./migrate-labour-hire";
import { migrateUnifiedContactsSystem, seedContactTags } from "./migrate-unified-contacts";
import { initializeScheduledTasks } from "./scheduled-tasks";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Handle favicon request specifically to prevent 500 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Use PORT from environment variable for deployment compatibility
// Use port 5000 for development (workflow expects this port)
const port = process.env.PORT || 5000;

// Health check endpoint only for production deployment
if (process.env.NODE_ENV === 'production') {
  app.get('/', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      environment: 'production',
      timestamp: new Date().toISOString(),
      port: port
    });
  });
}

// Additional health check endpoint for API testing
app.get('/health-check', (req, res) => {
  // Simple text response for health checks
  res.status(200).send('OK');
});

app.get('/api/health', (req, res) => {
  // Detailed JSON response for API health checks
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'apprentice-tracker',
    environment: process.env.NODE_ENV || 'development',
    fairwork_api: {
      url_configured: !!process.env.FAIRWORK_API_URL,
      key_configured: !!process.env.FAIRWORK_API_KEY
    }
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Perform database migrations if needed
  try {
    // Migrate Role Management schema
    await migrateRolesSchema();
    log("Role Management schema migration completed");
    
    // Migrate Fair Work schema
    await migrateFairWorkSchema();
    log("Fair Work schema migration completed");

    // Migrate GTO Compliance schema
    await migrateGtoComplianceSchema();
    log("GTO Compliance schema migration completed");
    
    // Migrate VET Training schema
    await migrateVetSchema();
    log("VET Training schema migration completed");
    
    // Migrate Host Employer Preferred Qualifications schema
    await migrateHostPreferredQualifications();
    log("Host Preferred Qualifications schema migration completed");
    
    // Migrate Enrichment Program tables
    await migrateEnrichmentSchema();
    log("Enrichment Program schema migration completed");
    
    // Migrate Progress Reviews schema
    await migrateProgressReviewsSchema();
    log("Progress Reviews schema migration completed");
    
    // Migrate Host Employers Fields
    await migrateHostEmployersFields();
    log("Host Employers Fields migration completed");
    
    // Migrate Work Health and Safety (WHS) tables
    await migrateWHS();
    log("Work Health and Safety (WHS) tables migration completed");
    
    // Update WHS documents schema with missing relationship fields
    await migrateWhsDocuments();
    log("WHS documents schema updated successfully");
    
    // Update WHS Risk Assessments schema with new fields
    await migrateWhsRiskAssessments();
    log("WHS Risk Assessments schema updated successfully");
    
    // Migrate Labour Hire Workers schema
    await migrateLabourHireSchema();
    log("Labour Hire Workers schema migration completed");
    
    // Migrate Unified Contacts and Clients schema
    await migrateUnifiedContactsSystem();
    log("Unified Contacts and Clients schema migration completed");
  } catch (error) {
    log("Error migrating database schema: " + error);
  }

  // Seed the database with initial data if needed
  try {
    // Seed main database tables
    await seedDatabase();
    log("Database seeded successfully");
    
    // Seed GTO Compliance Standards
    await seedGtoComplianceStandards();
    log("GTO Compliance Standards seeded successfully");
    
    // Seed Enrichment Program data
    await seedEnrichmentData();
    log("Enrichment Program data seeded successfully");
    
    // Seed Contact Tags for unified contact system
    await seedContactTags();
    log("Contact Tags seeded successfully");
  } catch (error) {
    log("Error seeding database: " + error);
  }
  
  const server = await registerRoutes(app);

  // Add a catch-all for unmatched API routes to help debug 404s
  app.use('/api/*', (req, res) => {
    log(`[404] Unmatched API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      success: false, 
      message: `API route not found: ${req.method} ${req.originalUrl}`,
      availableRoutes: [
        'GET /api/health',
        'POST /api/auth/login',
        'POST /api/auth/register', 
        'GET /api/auth/verify'
      ]
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`[ERROR] ${status}: ${message}`);
    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // This health check is already defined above - removing duplicate

  // Global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    log(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  // Log environment information for debugging
  log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  log(`Using port: ${port}`);
  
  // Add port conflict detection and graceful handling
  const startServerWithFallback = (targetPort: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const serverInstance = server.listen({
        port: targetPort,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`Server successfully started on port ${targetPort}`);
        
        // Initialize scheduled tasks with error handling
        try {
          initializeScheduledTasks();
          log("Scheduled tasks initialized");
        } catch (error) {
          log(`Failed to initialize scheduled tasks: ${error}`);
        }
        
        resolve(serverInstance);
      });

      serverInstance.on('error', (error: any) => {
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
    // Try alternative ports if the default port is in use
    const alternativePorts = process.env.NODE_ENV === 'production' 
      ? [8080, 3000, 5001] 
      : [5002, 5003, 8080];
    
    let started = false;
    for (const altPort of alternativePorts) {
      try {
        log(`Trying alternative port ${altPort}...`);
        serverInstance = await startServerWithFallback(altPort);
        started = true;
        break;
      } catch (altError) {
        log(`Port ${altPort} also in use, trying next...`);
      }
    }
    
    if (!started) {
      log('No available ports found. Exiting...');
      process.exit(1);
    }
  }

  // Ensure the server keeps running
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    serverInstance.close(() => {
      log('Process terminated');
    });
  });

  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully');
    serverInstance.close(() => {
      log('Process terminated');
    });
  });
})().catch((error) => {
  log(`Fatal error during startup: ${error}`);
  process.exit(1);
});

// Export registerRoutes for production server
export { registerRoutes } from './routes';
