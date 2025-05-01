import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed-db";
import { migrateFairWorkSchema } from "./migrate-db";
import { migrateGtoComplianceSchema } from "./migrate-gto-compliance";
import { seedGtoComplianceStandards } from "./seed-gto-compliance";
import { migrateVetSchema } from "./migrate-vet";
import { migrateRolesSchema } from "./migrate-roles";
import { migrateHostPreferredQualifications } from "./migrate-host-preferred-quals";
import { initializeScheduledTasks } from "./scheduled-tasks";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  } catch (error) {
    log("Error seeding database: " + error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Initialize scheduled tasks
    initializeScheduledTasks();
    log("Scheduled tasks initialized");
  });
})();
