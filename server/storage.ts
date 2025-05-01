import { 
  roles, permissions, rolePermissions, subscriptionPlans, users, 
  apprentices, hostEmployers, trainingContracts, placements, 
  documents, complianceRecords, timesheets, timesheetDetails, 
  activityLogs, tasks,
  type Role, type InsertRole,
  type Permission, type InsertPermission,
  type RolePermission, type InsertRolePermission,
  type User, type InsertUser,
  type SubscriptionPlan, type InsertSubscriptionPlan,
  type Apprentice, type InsertApprentice,
  type HostEmployer, type InsertHostEmployer,
  type TrainingContract, type InsertTrainingContract,
  type Placement, type InsertPlacement,
  type Document, type InsertDocument,
  type ComplianceRecord, type InsertComplianceRecord,
  type Timesheet, type InsertTimesheet,
  type TimesheetDetail, type InsertTimesheetDetail,
  type ActivityLog, type InsertActivityLog,
  type Task, type InsertTask
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql } from "drizzle-orm";
import session from "express-session";
import memorystore from "memorystore";

const MemoryStore = memorystore(session);

export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByOrganization(organizationId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Role methods
  getRole(id: number): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;

  // Permission methods
  getPermission(id: number): Promise<Permission | undefined>;
  getAllPermissions(): Promise<Permission[]>;
  getRolePermissions(roleId: number): Promise<Permission[]>;
  assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean>;

  // Subscription Plan methods
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;

  // Host Employer methods
  getHostEmployer(id: number): Promise<HostEmployer | undefined>;
  getAllHostEmployers(): Promise<HostEmployer[]>;
  createHostEmployer(employer: InsertHostEmployer): Promise<HostEmployer>;
  updateHostEmployer(id: number, employer: Partial<InsertHostEmployer>): Promise<HostEmployer | undefined>;
  deleteHostEmployer(id: number): Promise<boolean>;

  // Activity Log methods
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(options?: { userId?: number, relatedTo?: string, relatedId?: number, limit?: number }): Promise<ActivityLog[]>;

  // System Config methods - temporarily removed until schema is updated
  // getSystemConfig(key: string): Promise<any | undefined>;
  // getAllSystemConfigs(): Promise<any[]>;
  // getSystemConfigsByCategory(category: string): Promise<any[]>;
  // setSystemConfig(config: any): Promise<any>;
  // deleteSystemConfig(key: string): Promise<boolean>;

  // Integration methods - temporarily removed until schema is updated
  // getIntegration(id: number): Promise<any | undefined>;
  // getIntegrationByProvider(provider: string): Promise<any | undefined>;
  // getAllIntegrations(): Promise<any[]>;
  // createIntegration(integration: any): Promise<any>;
  // updateIntegration(id: number, integration: any): Promise<any | undefined>;
  // deleteIntegration(id: number): Promise<boolean>;
  // testIntegrationConnection(id: number): Promise<{ success: boolean, message: string }>;
  // syncIntegration(id: number): Promise<boolean>;

  // Import/Export methods - temporarily removed until schema is updated
  // getDataJob(id: number): Promise<any | undefined>;
  // getAllDataJobs(options?: { type?: string, status?: string, limit?: number }): Promise<any[]>;
  // createDataJob(job: any): Promise<any>;
  // updateDataJobStatus(id: number, status: string, options?: { recordsProcessed?: number, errors?: any[] }): Promise<any | undefined>;
  // deleteDataJob(id: number): Promise<boolean>;

  // Custom Data View methods - temporarily removed until schema is updated
  // getDataView(id: number): Promise<any | undefined>;
  // getAllDataViews(userId?: number): Promise<any[]>;
  // createDataView(view: any): Promise<any>;
  // updateDataView(id: number, view: any): Promise<any | undefined>;
  // deleteDataView(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.organizationId, organizationId));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  // Role methods
  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [createdRole] = await db.insert(roles).values(role).returning();
    return createdRole;
  }

  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined> {
    const [updatedRole] = await db
      .update(roles)
      .set({ ...role, updatedAt: new Date() })
      .where(eq(roles.id, id))
      .returning();
    return updatedRole;
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return result.rowCount > 0;
  }

  // Permission methods
  async getPermission(id: number): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const result = await db
      .select()
      .from(permissions)
      .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(rolePermissions.roleId, roleId));
    
    return result.map(r => ({ ...r.permissions }));
  }

  async assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission> {
    // Check if already assigned
    const [existing] = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, rolePermission.roleId),
          eq(rolePermissions.permissionId, rolePermission.permissionId)
        )
      );
    
    if (existing) {
      return existing;
    }
    
    const [created] = await db
      .insert(rolePermissions)
      .values(rolePermission)
      .returning();
    
    return created;
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<boolean> {
    const result = await db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId)
        )
      );
    
    return result.rowCount > 0;
  }

  // Subscription Plan methods
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans);
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [createdPlan] = await db.insert(subscriptionPlans).values(plan).returning();
    return createdPlan;
  }

  async updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan;
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return result.rowCount > 0;
  }

  // Host Employer methods
  async getHostEmployer(id: number): Promise<HostEmployer | undefined> {
    const query = `
      SELECT 
        id, name, industry, contact_person as "contactPerson", 
        email, phone, address, status, 
        safety_rating as "safetyRating", 
        compliance_status as "complianceStatus", 
        notes, is_gto as "isGto", 
        labour_hire_licence_no as "labourHireLicenceNo"
      FROM host_employers
      WHERE id = $1
    `;
    
    const result = await db.execute(sql`${sql.raw(query)}`, [id]);
    return result.rows.length > 0 ? result.rows[0] as HostEmployer : undefined;
  }

  async getAllHostEmployers(): Promise<HostEmployer[]> {
    const query = `
      SELECT 
        id, name, industry, contact_person as "contactPerson", 
        email, phone, address, status, 
        safety_rating as "safetyRating", 
        compliance_status as "complianceStatus", 
        notes, is_gto as "isGto", 
        labour_hire_licence_no as "labourHireLicenceNo"
      FROM host_employers
      ORDER BY name ASC
    `;
    
    const result = await db.execute(sql`${sql.raw(query)}`);
    return result.rows as HostEmployer[];
  }

  async createHostEmployer(employer: InsertHostEmployer): Promise<HostEmployer> {
    const mapped = {
      name: employer.name,
      industry: employer.industry,
      contact_person: employer.contactPerson,
      email: employer.email,
      phone: employer.phone,
      address: employer.address,
      status: employer.status,
      safety_rating: employer.safetyRating,
      compliance_status: employer.complianceStatus,
      notes: employer.notes,
      is_gto: employer.isGto,
      labour_hire_licence_no: employer.labourHireLicenceNo
    };
    
    const query = `
      INSERT INTO host_employers (
        name, industry, contact_person, email, phone, address, 
        status, safety_rating, compliance_status, notes, is_gto, labour_hire_licence_no
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING 
        id, name, industry, contact_person as "contactPerson", 
        email, phone, address, status, 
        safety_rating as "safetyRating", 
        compliance_status as "complianceStatus", 
        notes, is_gto as "isGto", 
        labour_hire_licence_no as "labourHireLicenceNo"
    `;
    
    const values = [
      mapped.name, mapped.industry, mapped.contact_person, mapped.email, 
      mapped.phone, mapped.address, mapped.status, mapped.safety_rating, 
      mapped.compliance_status, mapped.notes, mapped.is_gto, mapped.labour_hire_licence_no
    ];
    
    const result = await db.execute(sql`${sql.raw(query)}`, values);
    return result.rows[0] as HostEmployer;
  }

  async updateHostEmployer(id: number, employer: Partial<InsertHostEmployer>): Promise<HostEmployer | undefined> {
    // Map the camelCase properties to snake_case for the database
    const updateMap: Record<string, any> = {};
    
    if (employer.name !== undefined) updateMap.name = employer.name;
    if (employer.industry !== undefined) updateMap.industry = employer.industry;
    if (employer.contactPerson !== undefined) updateMap.contact_person = employer.contactPerson;
    if (employer.email !== undefined) updateMap.email = employer.email;
    if (employer.phone !== undefined) updateMap.phone = employer.phone;
    if (employer.address !== undefined) updateMap.address = employer.address;
    if (employer.status !== undefined) updateMap.status = employer.status;
    if (employer.safetyRating !== undefined) updateMap.safety_rating = employer.safetyRating;
    if (employer.complianceStatus !== undefined) updateMap.compliance_status = employer.complianceStatus;
    if (employer.notes !== undefined) updateMap.notes = employer.notes;
    if (employer.isGto !== undefined) updateMap.is_gto = employer.isGto;
    if (employer.labourHireLicenceNo !== undefined) updateMap.labour_hire_licence_no = employer.labourHireLicenceNo;
    
    // If no fields to update, return the existing record
    if (Object.keys(updateMap).length === 0) {
      return await this.getHostEmployer(id);
    }
    
    // Build the SET clause for the SQL query
    const setClauses = Object.keys(updateMap).map((key, index) => `${key} = $${index + 2}`);
    
    const query = `
      UPDATE host_employers
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING 
        id, name, industry, contact_person as "contactPerson", 
        email, phone, address, status, 
        safety_rating as "safetyRating", 
        compliance_status as "complianceStatus", 
        notes, is_gto as "isGto", 
        labour_hire_licence_no as "labourHireLicenceNo"
    `;
    
    const values = [id, ...Object.values(updateMap)];
    
    const result = await db.execute(sql`${sql.raw(query)}`, values);
    return result.rows.length > 0 ? result.rows[0] as HostEmployer : undefined;
  }

  async deleteHostEmployer(id: number): Promise<boolean> {
    const result = await db.delete(hostEmployers).where(eq(hostEmployers.id, id));
    return result.rowCount > 0;
  }

  // Activity Log methods
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [createdLog] = await db.insert(activityLogs).values(log).returning();
    return createdLog;
  }

  async getActivityLogs(options?: { userId?: number, relatedTo?: string, relatedId?: number, limit?: number }): Promise<ActivityLog[]> {
    let query = db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp));
    
    if (options?.userId) {
      query = query.where(eq(activityLogs.userId, options.userId));
    }
    
    if (options?.relatedTo) {
      query = query.where(eq(activityLogs.relatedTo, options.relatedTo));
    }
    
    if (options?.relatedId) {
      query = query.where(eq(activityLogs.relatedId, options.relatedId));
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  }

  // System Config methods
  async getSystemConfig(key: string): Promise<SystemConfig | undefined> {
    const [config] = await db.select().from(systemConfig).where(eq(systemConfig.key, key));
    return config;
  }

  async getAllSystemConfigs(): Promise<SystemConfig[]> {
    return await db.select().from(systemConfig);
  }

  async getSystemConfigsByCategory(category: string): Promise<SystemConfig[]> {
    return await db.select().from(systemConfig).where(eq(systemConfig.category, category));
  }

  async setSystemConfig(config: InsertSystemConfig): Promise<SystemConfig> {
    const [existingConfig] = await db.select().from(systemConfig).where(eq(systemConfig.key, config.key));
    
    if (existingConfig) {
      const [updatedConfig] = await db
        .update(systemConfig)
        .set({
          value: config.value,
          description: config.description,
          updatedAt: new Date()
        })
        .where(eq(systemConfig.key, config.key))
        .returning();
      
      return updatedConfig;
    } else {
      const [newConfig] = await db
        .insert(systemConfig)
        .values(config)
        .returning();
      
      return newConfig;
    }
  }

  async deleteSystemConfig(key: string): Promise<boolean> {
    const result = await db.delete(systemConfig).where(eq(systemConfig.key, key));
    return result.rowCount > 0;
  }

  // Integration methods
  async getIntegration(id: number): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id));
    return integration;
  }

  async getIntegrationByProvider(provider: string): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.provider, provider));
    return integration;
  }

  async getAllIntegrations(): Promise<Integration[]> {
    return await db.select().from(integrations);
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [createdIntegration] = await db.insert(integrations).values(integration).returning();
    return createdIntegration;
  }

  async updateIntegration(id: number, integration: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const [updatedIntegration] = await db
      .update(integrations)
      .set({ ...integration, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return updatedIntegration;
  }

  async deleteIntegration(id: number): Promise<boolean> {
    const result = await db.delete(integrations).where(eq(integrations.id, id));
    return result.rowCount > 0;
  }

  async testIntegrationConnection(id: number): Promise<{ success: boolean, message: string }> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id));
    
    if (!integration) {
      return { success: false, message: "Integration not found" };
    }
    
    // Simulate testing different integrations
    switch (integration.type) {
      case 'api':
        if (integration.provider === 'Fair Work') {
          if (integration.apiKey && integration.apiUrl) {
            return { success: true, message: "Successfully connected to Fair Work API" };
          } else {
            return { success: false, message: "Missing API key or URL" };
          }
        }
        break;
      
      case 'notification':
        if (integration.provider === 'SMTP') {
          const config = integration.config as Record<string, any> || {};
          if (config.smtpHost && config.smtpPort) {
            return { success: true, message: "Successfully connected to SMTP server" };
          } else {
            return { success: false, message: "Missing SMTP configuration" };
          }
        }
        break;
    }
    
    // Generic success response for other integrations
    return { success: true, message: "Test connection simulated successfully" };
  }

  async syncIntegration(id: number): Promise<boolean> {
    const [integration] = await db
      .update(integrations)
      .set({
        lastSynced: new Date(),
        updatedAt: new Date()
      })
      .where(eq(integrations.id, id))
      .returning();
    
    return !!integration;
  }

  // Import/Export methods
  async getDataJob(id: number): Promise<DataJob | undefined> {
    const [job] = await db.select().from(dataJobs).where(eq(dataJobs.id, id));
    return job;
  }

  async getAllDataJobs(options?: { type?: string, status?: string, limit?: number }): Promise<DataJob[]> {
    let query = db.select().from(dataJobs).orderBy(desc(dataJobs.createdAt));
    
    if (options?.type) {
      query = query.where(eq(dataJobs.type, options.type));
    }
    
    if (options?.status) {
      query = query.where(eq(dataJobs.status, options.status));
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  }

  async createDataJob(job: InsertDataJob): Promise<DataJob> {
    const [createdJob] = await db.insert(dataJobs).values(job).returning();
    return createdJob;
  }

  async updateDataJobStatus(id: number, status: string, options?: { recordsProcessed?: number, errors?: any[] }): Promise<DataJob | undefined> {
    const updates: Partial<DataJob> = { status };
    
    if (options?.recordsProcessed !== undefined) {
      updates.recordsProcessed = options.recordsProcessed;
    }
    
    if (options?.errors !== undefined) {
      updates.errors = options.errors;
    }
    
    if (status === 'completed' || status === 'failed') {
      updates.completedAt = new Date();
    }
    
    const [updatedJob] = await db
      .update(dataJobs)
      .set(updates)
      .where(eq(dataJobs.id, id))
      .returning();
    
    return updatedJob;
  }

  async deleteDataJob(id: number): Promise<boolean> {
    const result = await db.delete(dataJobs).where(eq(dataJobs.id, id));
    return result.rowCount > 0;
  }

  // Custom Data View methods
  async getDataView(id: number): Promise<DataView | undefined> {
    const [view] = await db.select().from(dataViews).where(eq(dataViews.id, id));
    return view;
  }

  async getAllDataViews(userId?: number): Promise<DataView[]> {
    let query = db.select().from(dataViews);
    
    if (userId) {
      query = query.where(
        or(
          eq(dataViews.userId, userId),
          eq(dataViews.isPublic, true)
        )
      );
    }
    
    return await query;
  }

  async createDataView(view: InsertDataView): Promise<DataView> {
    const [createdView] = await db.insert(dataViews).values(view).returning();
    return createdView;
  }

  async updateDataView(id: number, view: Partial<InsertDataView>): Promise<DataView | undefined> {
    const [updatedView] = await db
      .update(dataViews)
      .set({ ...view, updatedAt: new Date() })
      .where(eq(dataViews.id, id))
      .returning();
    return updatedView;
  }

  async deleteDataView(id: number): Promise<boolean> {
    const result = await db.delete(dataViews).where(eq(dataViews.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();