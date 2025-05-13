import { 
  roles, permissions, rolePermissions, subscriptionPlans, users, 
  apprentices, hostEmployers, trainingContracts, placements, 
  documents, complianceRecords, timesheets, timesheetDetails, 
  activityLogs, tasks, qualifications, hostEmployerPreferredQualifications,
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
  type Task, type InsertTask,
  type Qualification, type InsertQualification,
  type HostEmployerPreferredQualification, type InsertHostEmployerPreferredQualification
} from "@shared/schema";

// Import labour hire types
import {
  labourHireWorkers, labourHirePlacements, labourHireTimesheets, 
  labourHireTimesheetDetails, labourHireWorkerDocuments,
  type LabourHireWorker, type InsertLabourHireWorker,
  type LabourHirePlacement, type InsertLabourHirePlacement,
  type LabourHireTimesheet, type InsertLabourHireTimesheet,
  type LabourHireTimesheetDetail, type InsertLabourHireTimesheetDetail,
  type LabourHireWorkerDocument, type InsertLabourHireWorkerDocument
} from "@shared/schema";

// Import unified contacts and clients types
import {
  contacts, contactTags, contactTagAssignments, contactGroups, 
  contactGroupMembers, contactInteractions, clients, clientTypes, 
  clientContacts, clientServices, clientInteractions,
  type Contact, type InsertContact,
  type ContactTag, type InsertContactTag,
  type ContactTagAssignment, type InsertContactTagAssignment,
  type ContactGroup, type InsertContactGroup,
  type ContactGroupMember, type InsertContactGroupMember,
  type ContactInteraction, type InsertContactInteraction,
  type Client, type InsertClient,
  type ClientType, type InsertClientType,
  type ClientContact, type InsertClientContact,
  type ClientService, type InsertClientService,
  type ClientInteraction, type InsertClientInteraction
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, type SQL } from "drizzle-orm";
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

  // Apprentice methods
  getApprentice(id: number): Promise<Apprentice | undefined>;
  getApprenticeByEmail(email: string): Promise<Apprentice | undefined>;
  getAllApprentices(): Promise<Apprentice[]>;
  createApprentice(apprentice: InsertApprentice): Promise<Apprentice>;
  updateApprentice(id: number, apprentice: Partial<InsertApprentice>): Promise<Apprentice | undefined>;
  deleteApprentice(id: number): Promise<boolean>;

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

  // Training Contract methods
  getTrainingContract(id: number): Promise<TrainingContract | undefined>;
  getAllTrainingContracts(): Promise<TrainingContract[]>;
  getTrainingContractsByApprentice(apprenticeId: number): Promise<TrainingContract[]>;
  createTrainingContract(contract: InsertTrainingContract): Promise<TrainingContract>;
  updateTrainingContract(id: number, contract: Partial<InsertTrainingContract>): Promise<TrainingContract | undefined>;
  deleteTrainingContract(id: number): Promise<boolean>;

  // Placement methods
  getPlacement(id: number): Promise<Placement | undefined>;
  getAllPlacements(): Promise<Placement[]>;
  getPlacementsByApprentice(apprenticeId: number): Promise<Placement[]>;
  getPlacementsByHost(hostEmployerId: number): Promise<Placement[]>;
  createPlacement(placement: InsertPlacement): Promise<Placement>;
  updatePlacement(id: number, placement: Partial<InsertPlacement>): Promise<Placement | undefined>;
  deletePlacement(id: number): Promise<boolean>;
  
  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  getDocumentsByRelation(relatedTo: string, relatedId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Compliance Record methods
  getAllComplianceRecords(): Promise<ComplianceRecord[]>;
  getComplianceRecordsByRelation(relatedTo: string, relatedId: number): Promise<ComplianceRecord[]>;
  createComplianceRecord(record: InsertComplianceRecord): Promise<ComplianceRecord>;
  updateComplianceRecord(id: number, record: Partial<InsertComplianceRecord>): Promise<ComplianceRecord | undefined>;

  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByAssignee(assigneeId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  completeTask(id: number): Promise<Task | undefined>;
  
  // Timesheet methods
  getAllTimesheets(): Promise<Timesheet[]>;
  getTimesheet(id: number): Promise<Timesheet | undefined>;
  getTimesheetsByApprentice(apprenticeId: number): Promise<Timesheet[]>;
  createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: number, timesheet: Partial<InsertTimesheet>): Promise<Timesheet | undefined>;

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

  // Host Employer Preferred Qualifications methods
  getHostEmployerPreferredQualifications(hostEmployerId: number): Promise<HostEmployerPreferredQualification[]>;
  getHostEmployerPreferredQualification(id: number): Promise<HostEmployerPreferredQualification | undefined>;
  addHostEmployerPreferredQualification(qualification: InsertHostEmployerPreferredQualification): Promise<HostEmployerPreferredQualification>;
  updateHostEmployerPreferredQualification(id: number, qualification: Partial<InsertHostEmployerPreferredQualification>): Promise<HostEmployerPreferredQualification | undefined>;
  removeHostEmployerPreferredQualification(id: number): Promise<boolean>;
  
  // Qualification methods
  getQualification(id: number): Promise<Qualification | undefined>;
  getAllQualifications(): Promise<Qualification[]>;
  searchQualifications(query: string): Promise<Qualification[]>;
  
  // Labour Hire Worker methods
  getLabourHireWorker(id: number): Promise<LabourHireWorker | undefined>;
  getLabourHireWorkerByEmail(email: string): Promise<LabourHireWorker | undefined>;
  getAllLabourHireWorkers(): Promise<LabourHireWorker[]>;
  createLabourHireWorker(worker: InsertLabourHireWorker): Promise<LabourHireWorker>;
  updateLabourHireWorker(id: number, worker: Partial<InsertLabourHireWorker>): Promise<LabourHireWorker | undefined>;
  deleteLabourHireWorker(id: number): Promise<boolean>;
  
  // Labour Hire Placement methods
  getLabourHirePlacement(id: number): Promise<LabourHirePlacement | undefined>;
  getAllLabourHirePlacements(): Promise<LabourHirePlacement[]>;
  getLabourHirePlacementsByWorker(workerId: number): Promise<LabourHirePlacement[]>;
  getLabourHirePlacementsByHost(hostEmployerId: number): Promise<LabourHirePlacement[]>;
  createLabourHirePlacement(placement: InsertLabourHirePlacement): Promise<LabourHirePlacement>;
  updateLabourHirePlacement(id: number, placement: Partial<InsertLabourHirePlacement>): Promise<LabourHirePlacement | undefined>;
  deleteLabourHirePlacement(id: number): Promise<boolean>;
  
  // Labour Hire Timesheet methods
  getLabourHireTimesheet(id: number): Promise<LabourHireTimesheet | undefined>;
  getAllLabourHireTimesheets(): Promise<LabourHireTimesheet[]>;
  getLabourHireTimesheetsByWorker(workerId: number): Promise<LabourHireTimesheet[]>;
  getLabourHireTimesheetsByPlacement(placementId: number): Promise<LabourHireTimesheet[]>;
  createLabourHireTimesheet(timesheet: InsertLabourHireTimesheet): Promise<LabourHireTimesheet>;
  updateLabourHireTimesheet(id: number, timesheet: Partial<InsertLabourHireTimesheet>): Promise<LabourHireTimesheet | undefined>;
  submitLabourHireTimesheet(id: number): Promise<LabourHireTimesheet | undefined>;
  approveLabourHireTimesheet(id: number, approvedBy: number): Promise<LabourHireTimesheet | undefined>;
  rejectLabourHireTimesheet(id: number, reason: string): Promise<LabourHireTimesheet | undefined>;
  
  // Labour Hire Worker Document methods
  getLabourHireWorkerDocument(id: number): Promise<LabourHireWorkerDocument | undefined>;
  getLabourHireWorkerDocuments(workerId: number): Promise<LabourHireWorkerDocument[]>;
  createLabourHireWorkerDocument(document: InsertLabourHireWorkerDocument): Promise<LabourHireWorkerDocument>;
  updateLabourHireWorkerDocument(id: number, document: Partial<InsertLabourHireWorkerDocument>): Promise<LabourHireWorkerDocument | undefined>;
  verifyLabourHireWorkerDocument(id: number, verifiedBy: number): Promise<LabourHireWorkerDocument | undefined>;
  rejectLabourHireWorkerDocument(id: number, reason: string): Promise<LabourHireWorkerDocument | undefined>;
  
  // Unified Contacts methods
  getContact(id: number): Promise<Contact | undefined>;
  getContactByEmail(email: string): Promise<Contact | undefined>;
  getAllContacts(options?: { primaryRole?: string, isActive?: boolean, organizationId?: number }): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deactivateContact(id: number): Promise<boolean>;
  deleteContact(id: number): Promise<boolean>;
  
  // Contact Tags methods
  getContactTag(id: number): Promise<ContactTag | undefined>;
  getAllContactTags(): Promise<ContactTag[]>;
  createContactTag(tag: InsertContactTag): Promise<ContactTag>;
  updateContactTag(id: number, tag: Partial<InsertContactTag>): Promise<ContactTag | undefined>;
  deleteContactTag(id: number): Promise<boolean>;
  
  // Contact Tag Assignment methods
  assignTagToContact(assignment: InsertContactTagAssignment): Promise<ContactTagAssignment>;
  removeTagFromContact(contactId: number, tagId: number): Promise<boolean>;
  getContactTags(contactId: number): Promise<ContactTag[]>;
  getTaggedContacts(tagId: number): Promise<Contact[]>;
  
  // Contact Groups methods
  getContactGroup(id: number): Promise<ContactGroup | undefined>;
  getAllContactGroups(organizationId?: number): Promise<ContactGroup[]>;
  createContactGroup(group: InsertContactGroup): Promise<ContactGroup>;
  updateContactGroup(id: number, group: Partial<InsertContactGroup>): Promise<ContactGroup | undefined>;
  deleteContactGroup(id: number): Promise<boolean>;
  
  // Contact Group Members methods
  addContactToGroup(member: InsertContactGroupMember): Promise<ContactGroupMember>;
  removeContactFromGroup(groupId: number, contactId: number): Promise<boolean>;
  getGroupMembers(groupId: number): Promise<Contact[]>;
  getContactGroups(contactId: number): Promise<ContactGroup[]>;
  
  // Contact Interactions methods
  getContactInteraction(id: number): Promise<ContactInteraction | undefined>;
  getContactInteractions(contactId: number): Promise<ContactInteraction[]>;
  createContactInteraction(interaction: InsertContactInteraction): Promise<ContactInteraction>;
  updateContactInteraction(id: number, interaction: Partial<InsertContactInteraction>): Promise<ContactInteraction | undefined>;
  deleteContactInteraction(id: number): Promise<boolean>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getAllClients(options?: { clientType?: string, status?: string, organizationId?: number }): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deactivateClient(id: number): Promise<boolean>;
  deleteClient(id: number): Promise<boolean>;
  
  // Client Types methods
  getClientType(id: number): Promise<ClientType | undefined>;
  getAllClientTypes(): Promise<ClientType[]>;
  createClientType(type: InsertClientType): Promise<ClientType>;
  updateClientType(id: number, type: Partial<InsertClientType>): Promise<ClientType | undefined>;
  deleteClientType(id: number): Promise<boolean>;
  
  // Client Contacts methods
  getClientContact(id: number): Promise<ClientContact | undefined>;
  getClientContacts(clientId: number): Promise<Contact[]>;
  addContactToClient(clientContact: InsertClientContact): Promise<ClientContact>;
  updateClientContact(id: number, clientContact: Partial<InsertClientContact>): Promise<ClientContact | undefined>;
  removeContactFromClient(clientId: number, contactId: number): Promise<boolean>;
  setPrimaryContact(clientId: number, contactId: number): Promise<boolean>;
  
  // Client Services methods
  getClientService(id: number): Promise<ClientService | undefined>;
  getClientServices(clientId: number): Promise<ClientService[]>;
  addServiceToClient(service: InsertClientService): Promise<ClientService>;
  updateClientService(id: number, service: Partial<InsertClientService>): Promise<ClientService | undefined>;
  removeServiceFromClient(id: number): Promise<boolean>;
  
  // Client Interactions methods
  getClientInteraction(id: number): Promise<ClientInteraction | undefined>;
  getClientInteractions(clientId: number): Promise<ClientInteraction[]>;
  createClientInteraction(interaction: InsertClientInteraction): Promise<ClientInteraction>;
  updateClientInteraction(id: number, interaction: Partial<InsertClientInteraction>): Promise<ClientInteraction | undefined>;
  deleteClientInteraction(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }
  
  // Labour Hire Worker methods
  async getLabourHireWorker(id: number): Promise<LabourHireWorker | undefined> {
    const [worker] = await db
      .select()
      .from(labourHireWorkers)
      .where(eq(labourHireWorkers.id, id));
    return worker;
  }
  
  async getLabourHireWorkerByEmail(email: string): Promise<LabourHireWorker | undefined> {
    const [worker] = await db
      .select()
      .from(labourHireWorkers)
      .where(eq(labourHireWorkers.email, email));
    return worker;
  }
  
  async getAllLabourHireWorkers(): Promise<LabourHireWorker[]> {
    return await db
      .select()
      .from(labourHireWorkers)
      .orderBy(labourHireWorkers.lastName, labourHireWorkers.firstName);
  }
  
  async createLabourHireWorker(worker: InsertLabourHireWorker): Promise<LabourHireWorker> {
    const [createdWorker] = await db
      .insert(labourHireWorkers)
      .values({
        ...worker,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return createdWorker;
  }
  
  async updateLabourHireWorker(id: number, worker: Partial<InsertLabourHireWorker>): Promise<LabourHireWorker | undefined> {
    const [updatedWorker] = await db
      .update(labourHireWorkers)
      .set({
        ...worker,
        updatedAt: new Date()
      })
      .where(eq(labourHireWorkers.id, id))
      .returning();
    return updatedWorker;
  }
  
  async deleteLabourHireWorker(id: number): Promise<boolean> {
    const result = await db
      .delete(labourHireWorkers)
      .where(eq(labourHireWorkers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Labour Hire Placement methods
  async getLabourHirePlacement(id: number): Promise<LabourHirePlacement | undefined> {
    const [placement] = await db
      .select()
      .from(labourHirePlacements)
      .where(eq(labourHirePlacements.id, id));
    return placement;
  }
  
  async getAllLabourHirePlacements(): Promise<LabourHirePlacement[]> {
    return await db
      .select()
      .from(labourHirePlacements)
      .orderBy(desc(labourHirePlacements.startDate));
  }
  
  async getLabourHirePlacementsByWorker(workerId: number): Promise<LabourHirePlacement[]> {
    return await db
      .select()
      .from(labourHirePlacements)
      .where(eq(labourHirePlacements.workerId, workerId))
      .orderBy(desc(labourHirePlacements.startDate));
  }
  
  async getLabourHirePlacementsByHost(hostEmployerId: number): Promise<LabourHirePlacement[]> {
    return await db
      .select()
      .from(labourHirePlacements)
      .where(eq(labourHirePlacements.hostEmployerId, hostEmployerId))
      .orderBy(desc(labourHirePlacements.startDate));
  }
  
  async createLabourHirePlacement(placement: InsertLabourHirePlacement): Promise<LabourHirePlacement> {
    const [createdPlacement] = await db
      .insert(labourHirePlacements)
      .values({
        ...placement,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return createdPlacement;
  }
  
  async updateLabourHirePlacement(id: number, placement: Partial<InsertLabourHirePlacement>): Promise<LabourHirePlacement | undefined> {
    const [updatedPlacement] = await db
      .update(labourHirePlacements)
      .set({
        ...placement,
        updatedAt: new Date()
      })
      .where(eq(labourHirePlacements.id, id))
      .returning();
    return updatedPlacement;
  }
  
  async deleteLabourHirePlacement(id: number): Promise<boolean> {
    const result = await db
      .delete(labourHirePlacements)
      .where(eq(labourHirePlacements.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Labour Hire Timesheet methods
  async getLabourHireTimesheet(id: number): Promise<LabourHireTimesheet | undefined> {
    const [timesheet] = await db
      .select()
      .from(labourHireTimesheets)
      .where(eq(labourHireTimesheets.id, id));
    return timesheet;
  }
  
  async getAllLabourHireTimesheets(): Promise<LabourHireTimesheet[]> {
    return await db
      .select()
      .from(labourHireTimesheets)
      .orderBy(desc(labourHireTimesheets.weekStarting));
  }
  
  async getLabourHireTimesheetsByWorker(workerId: number): Promise<LabourHireTimesheet[]> {
    return await db
      .select()
      .from(labourHireTimesheets)
      .where(eq(labourHireTimesheets.workerId, workerId))
      .orderBy(desc(labourHireTimesheets.weekStarting));
  }
  
  async getLabourHireTimesheetsByPlacement(placementId: number): Promise<LabourHireTimesheet[]> {
    return await db
      .select()
      .from(labourHireTimesheets)
      .where(eq(labourHireTimesheets.placementId, placementId))
      .orderBy(desc(labourHireTimesheets.weekStarting));
  }
  
  async createLabourHireTimesheet(timesheet: InsertLabourHireTimesheet): Promise<LabourHireTimesheet> {
    const [createdTimesheet] = await db
      .insert(labourHireTimesheets)
      .values({
        ...timesheet,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return createdTimesheet;
  }
  
  async updateLabourHireTimesheet(id: number, timesheet: Partial<InsertLabourHireTimesheet>): Promise<LabourHireTimesheet | undefined> {
    const [updatedTimesheet] = await db
      .update(labourHireTimesheets)
      .set({
        ...timesheet,
        updatedAt: new Date()
      })
      .where(eq(labourHireTimesheets.id, id))
      .returning();
    return updatedTimesheet;
  }
  
  async submitLabourHireTimesheet(id: number): Promise<LabourHireTimesheet | undefined> {
    const [updatedTimesheet] = await db
      .update(labourHireTimesheets)
      .set({
        status: 'submitted',
        submittedDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(labourHireTimesheets.id, id))
      .returning();
    return updatedTimesheet;
  }
  
  async approveLabourHireTimesheet(id: number, approvedBy: number): Promise<LabourHireTimesheet | undefined> {
    const [updatedTimesheet] = await db
      .update(labourHireTimesheets)
      .set({
        status: 'approved',
        approvedBy,
        approvalDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(labourHireTimesheets.id, id))
      .returning();
    return updatedTimesheet;
  }
  
  async rejectLabourHireTimesheet(id: number, reason: string): Promise<LabourHireTimesheet | undefined> {
    const [updatedTimesheet] = await db
      .update(labourHireTimesheets)
      .set({
        status: 'rejected',
        notes: reason,
        updatedAt: new Date()
      })
      .where(eq(labourHireTimesheets.id, id))
      .returning();
    return updatedTimesheet;
  }
  
  // Labour Hire Worker Document methods
  async getLabourHireWorkerDocument(id: number): Promise<LabourHireWorkerDocument | undefined> {
    const [document] = await db
      .select()
      .from(labourHireWorkerDocuments)
      .where(eq(labourHireWorkerDocuments.id, id));
    return document;
  }
  
  async getLabourHireWorkerDocuments(workerId: number): Promise<LabourHireWorkerDocument[]> {
    return await db
      .select()
      .from(labourHireWorkerDocuments)
      .where(eq(labourHireWorkerDocuments.workerId, workerId))
      .orderBy(labourHireWorkerDocuments.documentType);
  }
  
  async createLabourHireWorkerDocument(document: InsertLabourHireWorkerDocument): Promise<LabourHireWorkerDocument> {
    const [createdDocument] = await db
      .insert(labourHireWorkerDocuments)
      .values({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return createdDocument;
  }
  
  async updateLabourHireWorkerDocument(id: number, document: Partial<InsertLabourHireWorkerDocument>): Promise<LabourHireWorkerDocument | undefined> {
    const [updatedDocument] = await db
      .update(labourHireWorkerDocuments)
      .set({
        ...document,
        updatedAt: new Date()
      })
      .where(eq(labourHireWorkerDocuments.id, id))
      .returning();
    return updatedDocument;
  }
  
  async verifyLabourHireWorkerDocument(id: number, verifiedBy: number): Promise<LabourHireWorkerDocument | undefined> {
    const [updatedDocument] = await db
      .update(labourHireWorkerDocuments)
      .set({
        verificationStatus: 'verified',
        verifiedBy,
        verificationDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(labourHireWorkerDocuments.id, id))
      .returning();
    return updatedDocument;
  }
  
  async rejectLabourHireWorkerDocument(id: number, reason: string): Promise<LabourHireWorkerDocument | undefined> {
    const [updatedDocument] = await db
      .update(labourHireWorkerDocuments)
      .set({
        verificationStatus: 'rejected',
        notes: reason,
        updatedAt: new Date()
      })
      .where(eq(labourHireWorkerDocuments.id, id))
      .returning();
    return updatedDocument;
  }
  
  // Host Employer Preferred Qualifications methods
  async getHostEmployerPreferredQualifications(hostEmployerId: number): Promise<HostEmployerPreferredQualification[]> {
    return await db
      .select()
      .from(hostEmployerPreferredQualifications)
      .where(eq(hostEmployerPreferredQualifications.hostEmployerId, hostEmployerId));
  }
  
  async getHostEmployerPreferredQualification(id: number): Promise<HostEmployerPreferredQualification | undefined> {
    const [qualification] = await db
      .select()
      .from(hostEmployerPreferredQualifications)
      .where(eq(hostEmployerPreferredQualifications.id, id));
    return qualification;
  }
  
  async addHostEmployerPreferredQualification(qualification: InsertHostEmployerPreferredQualification): Promise<HostEmployerPreferredQualification> {
    const [created] = await db
      .insert(hostEmployerPreferredQualifications)
      .values(qualification)
      .returning();
    return created;
  }
  
  async updateHostEmployerPreferredQualification(id: number, qualification: Partial<InsertHostEmployerPreferredQualification>): Promise<HostEmployerPreferredQualification | undefined> {
    const [updated] = await db
      .update(hostEmployerPreferredQualifications)
      .set({
        ...qualification,
        updatedAt: new Date()
      })
      .where(eq(hostEmployerPreferredQualifications.id, id))
      .returning();
    return updated;
  }
  
  async removeHostEmployerPreferredQualification(id: number): Promise<boolean> {
    const result = await db
      .delete(hostEmployerPreferredQualifications)
      .where(eq(hostEmployerPreferredQualifications.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Qualification methods
  async getQualification(id: number): Promise<Qualification | undefined> {
    const [qualification] = await db
      .select()
      .from(qualifications)
      .where(eq(qualifications.id, id));
    return qualification;
  }
  
  async getAllQualifications(): Promise<Qualification[]> {
    return await db
      .select()
      .from(qualifications)
      .orderBy(qualifications.qualificationTitle);
  }
  
  async searchQualifications(query: string): Promise<Qualification[]> {
    const searchTerm = query.trim().toLowerCase();
    const allQualifications = await db
      .select()
      .from(qualifications);
      
    // Filter qualifications that match the search term in a case-insensitive way
    return allQualifications.filter(qualification => {
      const title = qualification.qualificationTitle?.toLowerCase() || '';
      const code = qualification.qualificationCode?.toLowerCase() || '';
      const desc = qualification.qualificationDescription?.toLowerCase() || '';
      
      return title.includes(searchTerm) || 
             code.includes(searchTerm) || 
             desc.includes(searchTerm);
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

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
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
    const [hostEmployer] = await db
      .select({
        id: hostEmployers.id,
        name: hostEmployers.name,
        industry: hostEmployers.industry,
        contactPerson: sql<string>`contact_person`,
        email: hostEmployers.email,
        phone: hostEmployers.phone,
        address: hostEmployers.address,
        status: hostEmployers.status,
        safetyRating: sql<number>`safety_rating`,
        complianceStatus: sql<string>`compliance_status`,
        notes: hostEmployers.notes,
        isGto: sql<boolean>`is_gto`,
        labourHireLicenceNo: sql<string>`labour_hire_licence_no`
      })
      .from(hostEmployers)
      .where(eq(hostEmployers.id, id));
    
    return hostEmployer as HostEmployer | undefined;
  }

  async getAllHostEmployers(): Promise<HostEmployer[]> {
    const employers = await db
      .select({
        id: hostEmployers.id,
        name: hostEmployers.name,
        industry: hostEmployers.industry,
        contactPerson: sql<string>`contact_person`,
        email: hostEmployers.email,
        phone: hostEmployers.phone,
        address: hostEmployers.address,
        status: hostEmployers.status,
        safetyRating: sql<number>`safety_rating`,
        complianceStatus: sql<string>`compliance_status`,
        notes: hostEmployers.notes,
        isGto: sql<boolean>`is_gto`,
        labourHireLicenceNo: sql<string>`labour_hire_licence_no`
      })
      .from(hostEmployers)
      .orderBy(hostEmployers.name);
    
    return employers as HostEmployer[];
  }

  async createHostEmployer(employer: InsertHostEmployer): Promise<HostEmployer> {
    // Use SQL template literals for safer parameter handling
    const result = await db.execute(sql`
      INSERT INTO host_employers (
        name, industry, contact_person, email, phone, address, 
        status, safety_rating, compliance_status, notes
      ) VALUES (
        ${employer.name}, 
        ${employer.industry}, 
        ${employer.contactPerson}, 
        ${employer.email}, 
        ${employer.phone || null}, 
        ${employer.address || null}, 
        ${employer.status || 'active'}, 
        ${employer.safetyRating || null}, 
        ${employer.complianceStatus || 'pending'}, 
        ${employer.notes || null}
      ) RETURNING 
        id, name, industry, contact_person as "contactPerson", 
        email, phone, address, status, 
        safety_rating as "safetyRating", 
        compliance_status as "complianceStatus", 
        notes, is_gto as "isGto", 
        labour_hire_licence_no as "labourHireLicenceNo"
    `);
    
    if (result.rows.length === 0) {
      throw new Error('Failed to create host employer');
    }
    return result.rows[0] as HostEmployer;
  }

  async updateHostEmployer(id: number, employer: Partial<InsertHostEmployer>): Promise<HostEmployer | undefined> {
    // If no fields to update, return the existing record
    if (Object.keys(employer).length === 0) {
      return await this.getHostEmployer(id);
    }
    
    // Build a dynamic SQL query with included fields
    let query = sql`UPDATE host_employers SET `;
    let setClauses: SQL[] = [];
    
    if (employer.name !== undefined) setClauses.push(sql`name = ${employer.name}`);
    if (employer.industry !== undefined) setClauses.push(sql`industry = ${employer.industry}`);
    if (employer.contactPerson !== undefined) setClauses.push(sql`contact_person = ${employer.contactPerson}`);
    if (employer.email !== undefined) setClauses.push(sql`email = ${employer.email}`);
    if (employer.phone !== undefined) setClauses.push(sql`phone = ${employer.phone}`);
    if (employer.address !== undefined) setClauses.push(sql`address = ${employer.address}`);
    if (employer.status !== undefined) setClauses.push(sql`status = ${employer.status}`);
    if (employer.safetyRating !== undefined) setClauses.push(sql`safety_rating = ${employer.safetyRating}`);
    if (employer.complianceStatus !== undefined) setClauses.push(sql`compliance_status = ${employer.complianceStatus}`);
    if (employer.notes !== undefined) setClauses.push(sql`notes = ${employer.notes}`);
    if (employer.isGto !== undefined) setClauses.push(sql`is_gto = ${employer.isGto}`);
    if (employer.labourHireLicenceNo !== undefined) setClauses.push(sql`labour_hire_licence_no = ${employer.labourHireLicenceNo}`);
    
    // Join the SET clauses
    for (let i = 0; i < setClauses.length; i++) {
      query = sql`${query}${setClauses[i]}`;
      if (i < setClauses.length - 1) {
        query = sql`${query}, `;
      }
    }
    
    query = sql`${query} WHERE id = ${id} RETURNING 
      id, name, industry, contact_person as "contactPerson", 
      email, phone, address, status, 
      safety_rating as "safetyRating", 
      compliance_status as "complianceStatus", 
      notes, is_gto as "isGto", 
      labour_hire_licence_no as "labourHireLicenceNo"`;
    
    const result = await db.execute(query);
    return result.rows.length > 0 ? result.rows[0] as HostEmployer : undefined;
  }

  async deleteHostEmployer(id: number): Promise<boolean> {
    const result = await db.delete(hostEmployers).where(eq(hostEmployers.id, id));
    return result.rowCount > 0;
  }

  // Apprentice methods
  async getApprentice(id: number): Promise<Apprentice | undefined> {
    const [apprentice] = await db.select().from(apprentices).where(eq(apprentices.id, id));
    return apprentice;
  }

  async getApprenticeByEmail(email: string): Promise<Apprentice | undefined> {
    const [apprentice] = await db.select().from(apprentices).where(eq(apprentices.email, email));
    return apprentice;
  }

  async getAllApprentices(): Promise<Apprentice[]> {
    return await db.select().from(apprentices);
  }

  async createApprentice(apprentice: InsertApprentice): Promise<Apprentice> {
    const [createdApprentice] = await db.insert(apprentices).values(apprentice).returning();
    return createdApprentice;
  }

  async updateApprentice(id: number, apprentice: Partial<InsertApprentice>): Promise<Apprentice | undefined> {
    const [updatedApprentice] = await db
      .update(apprentices)
      .set(apprentice)
      .where(eq(apprentices.id, id))
      .returning();
    return updatedApprentice;
  }

  async deleteApprentice(id: number): Promise<boolean> {
    const result = await db.delete(apprentices).where(eq(apprentices.id, id));
    return result.rowCount > 0;
  }

  // Training Contract methods
  async getTrainingContract(id: number): Promise<TrainingContract | undefined> {
    const [contract] = await db.select().from(trainingContracts).where(eq(trainingContracts.id, id));
    return contract;
  }

  async getAllTrainingContracts(): Promise<TrainingContract[]> {
    return await db.select().from(trainingContracts);
  }

  async getTrainingContractsByApprentice(apprenticeId: number): Promise<TrainingContract[]> {
    return await db.select().from(trainingContracts).where(eq(trainingContracts.apprenticeId, apprenticeId));
  }

  async createTrainingContract(contract: InsertTrainingContract): Promise<TrainingContract> {
    const [createdContract] = await db.insert(trainingContracts).values(contract).returning();
    return createdContract;
  }

  async updateTrainingContract(id: number, contract: Partial<InsertTrainingContract>): Promise<TrainingContract | undefined> {
    const [updatedContract] = await db
      .update(trainingContracts)
      .set(contract)
      .where(eq(trainingContracts.id, id))
      .returning();
    return updatedContract;
  }

  async deleteTrainingContract(id: number): Promise<boolean> {
    const result = await db.delete(trainingContracts).where(eq(trainingContracts.id, id));
    return result.rowCount > 0;
  }

  // Placement methods
  async getPlacement(id: number): Promise<Placement | undefined> {
    const [placement] = await db.select().from(placements).where(eq(placements.id, id));
    return placement;
  }

  async getAllPlacements(): Promise<Placement[]> {
    return await db.select().from(placements);
  }

  async getPlacementsByApprentice(apprenticeId: number): Promise<Placement[]> {
    return await db.select().from(placements).where(eq(placements.apprenticeId, apprenticeId));
  }

  async getPlacementsByHost(hostEmployerId: number): Promise<Placement[]> {
    return await db.select().from(placements).where(eq(placements.hostEmployerId, hostEmployerId));
  }

  async createPlacement(placement: InsertPlacement): Promise<Placement> {
    const [createdPlacement] = await db.insert(placements).values(placement).returning();
    return createdPlacement;
  }

  async updatePlacement(id: number, placement: Partial<InsertPlacement>): Promise<Placement | undefined> {
    const [updatedPlacement] = await db
      .update(placements)
      .set(placement)
      .where(eq(placements.id, id))
      .returning();
    return updatedPlacement;
  }

  async deletePlacement(id: number): Promise<boolean> {
    const result = await db.delete(placements).where(eq(placements.id, id));
    return result.rowCount > 0;
  }
  
  // Document methods
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocumentsByRelation(relatedTo: string, relatedId: number): Promise<Document[]> {
    return await db.select().from(documents)
      .where(
        and(
          eq(documents.relatedTo, relatedTo),
          eq(documents.relatedId, relatedId)
        )
      );
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [createdDocument] = await db.insert(documents).values(document).returning();
    return createdDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.rowCount > 0;
  }
  
  // Compliance Record methods
  async getAllComplianceRecords(): Promise<ComplianceRecord[]> {
    return await db.select().from(complianceRecords);
  }

  async getComplianceRecordsByRelation(relatedTo: string, relatedId: number): Promise<ComplianceRecord[]> {
    return await db.select().from(complianceRecords)
      .where(
        and(
          eq(complianceRecords.relatedTo, relatedTo),
          eq(complianceRecords.relatedId, relatedId)
        )
      );
  }

  async createComplianceRecord(record: InsertComplianceRecord): Promise<ComplianceRecord> {
    const [createdRecord] = await db.insert(complianceRecords).values(record).returning();
    return createdRecord;
  }

  async updateComplianceRecord(id: number, record: Partial<InsertComplianceRecord>): Promise<ComplianceRecord | undefined> {
    const [updatedRecord] = await db
      .update(complianceRecords)
      .set(record)
      .where(eq(complianceRecords.id, id))
      .returning();
    return updatedRecord;
  }
  
  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.dueDate));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByAssignee(assigneeId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, assigneeId)).orderBy(desc(tasks.dueDate));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [createdTask] = await db.insert(tasks).values(task).returning();
    return createdTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const [completedTask] = await db
      .update(tasks)
      .set({
        status: 'completed',
        completedAt: new Date()
      })
      .where(eq(tasks.id, id))
      .returning();
    return completedTask;
  }
  
  // Timesheet methods
  async getAllTimesheets(): Promise<Timesheet[]> {
    return await db.select().from(timesheets).orderBy(desc(timesheets.weekStarting));
  }

  async getTimesheet(id: number): Promise<Timesheet | undefined> {
    const [timesheet] = await db.select().from(timesheets).where(eq(timesheets.id, id));
    return timesheet;
  }

  async getTimesheetsByApprentice(apprenticeId: number): Promise<Timesheet[]> {
    return await db.select().from(timesheets)
      .where(eq(timesheets.apprenticeId, apprenticeId))
      .orderBy(desc(timesheets.weekStarting));
  }

  async createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet> {
    const [createdTimesheet] = await db.insert(timesheets).values(timesheet).returning();
    return createdTimesheet;
  }

  async updateTimesheet(id: number, timesheet: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const [updatedTimesheet] = await db
      .update(timesheets)
      .set(timesheet)
      .where(eq(timesheets.id, id))
      .returning();
    return updatedTimesheet;
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
  
  // =============== UNIFIED CONTACTS SYSTEM ===============
  
  // Unified Contacts methods
  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));
    return contact;
  }
  
  async getContactByEmail(email: string): Promise<Contact | undefined> {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.email, email));
    return contact;
  }
  
  async getAllContacts(options?: { primaryRole?: string, isActive?: boolean, organizationId?: number }): Promise<Contact[]> {
    let query = db.select().from(contacts);
    
    if (options) {
      if (options.primaryRole) {
        query = query.where(eq(contacts.primaryRole, options.primaryRole));
      }
      
      if (options.isActive !== undefined) {
        query = query.where(eq(contacts.isActive, options.isActive));
      }
      
      if (options.organizationId) {
        query = query.where(eq(contacts.organizationId, options.organizationId));
      }
    }
    
    return await query.orderBy(contacts.lastName, contacts.firstName);
  }
  
  async createContact(contact: InsertContact): Promise<Contact> {
    const [createdContact] = await db
      .insert(contacts)
      .values({
        ...contact,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return createdContact;
  }
  
  async updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact | undefined> {
    const [updatedContact] = await db
      .update(contacts)
      .set({
        ...contact,
        updatedAt: new Date()
      })
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }
  
  async deactivateContact(id: number): Promise<boolean> {
    const [updatedContact] = await db
      .update(contacts)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(contacts.id, id))
      .returning();
    return !!updatedContact;
  }
  
  async deleteContact(id: number): Promise<boolean> {
    const result = await db
      .delete(contacts)
      .where(eq(contacts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Contact Tags methods
  async getContactTag(id: number): Promise<ContactTag | undefined> {
    const [tag] = await db
      .select()
      .from(contactTags)
      .where(eq(contactTags.id, id));
    return tag;
  }
  
  async getAllContactTags(): Promise<ContactTag[]> {
    try {
      console.log("Getting all contact tags...");
      
      // Debugging information
      console.log("ContactTags schema:", JSON.stringify(contactTags, null, 2));
      
      const query = db
        .select()
        .from(contactTags)
        .orderBy(contactTags.name);
      
      console.log("Query:", query.toSQL());
      
      const tags = await query;
      console.log("Tags retrieved:", tags.length);
      return tags;
    } catch (error) {
      console.error("Error getting all contact tags:", error);
      console.error("Error details:", error.stack);
      throw error;
    }
  }
  
  async createContactTag(tag: InsertContactTag): Promise<ContactTag> {
    const [createdTag] = await db
      .insert(contactTags)
      .values(tag)
      .returning();
    return createdTag;
  }
  
  async updateContactTag(id: number, tag: Partial<InsertContactTag>): Promise<ContactTag | undefined> {
    const [updatedTag] = await db
      .update(contactTags)
      .set(tag)
      .where(eq(contactTags.id, id))
      .returning();
    return updatedTag;
  }
  
  async deleteContactTag(id: number): Promise<boolean> {
    const result = await db
      .delete(contactTags)
      .where(eq(contactTags.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Contact Tag Assignment methods
  async assignTagToContact(assignment: InsertContactTagAssignment): Promise<ContactTagAssignment> {
    const [createdAssignment] = await db
      .insert(contactTagAssignments)
      .values(assignment)
      .returning();
    return createdAssignment;
  }
  
  async removeTagFromContact(contactId: number, tagId: number): Promise<boolean> {
    const result = await db
      .delete(contactTagAssignments)
      .where(
        and(
          eq(contactTagAssignments.contactId, contactId),
          eq(contactTagAssignments.tagId, tagId)
        )
      );
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getContactTags(contactId: number): Promise<ContactTag[]> {
    return await db
      .select({
        id: contactTags.id,
        name: contactTags.name,
        color: contactTags.color,
        description: contactTags.description,
        organizationId: contactTags.organizationId,
        isSystem: contactTags.isSystem,
        createdAt: contactTags.createdAt,
        updatedAt: contactTags.updatedAt
      })
      .from(contactTagAssignments)
      .innerJoin(contactTags, eq(contactTagAssignments.tagId, contactTags.id))
      .where(eq(contactTagAssignments.contactId, contactId))
      .orderBy(contactTags.name);
  }
  
  async getTaggedContacts(tagId: number): Promise<Contact[]> {
    return await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        mobile: contacts.mobile,
        position: contacts.position,
        primaryRole: contacts.primaryRole,
        notes: contacts.notes,
        isActive: contacts.isActive,
        organizationId: contacts.organizationId,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt
      })
      .from(contactTagAssignments)
      .innerJoin(contacts, eq(contactTagAssignments.contactId, contacts.id))
      .where(eq(contactTagAssignments.tagId, tagId))
      .orderBy(contacts.lastName, contacts.firstName);
  }
  
  // Contact Groups methods
  async getContactGroup(id: number): Promise<ContactGroup | undefined> {
    const [group] = await db
      .select()
      .from(contactGroups)
      .where(eq(contactGroups.id, id));
    return group;
  }
  
  async getAllContactGroups(organizationId?: number): Promise<ContactGroup[]> {
    let query = db.select().from(contactGroups);
    
    if (organizationId) {
      query = query.where(eq(contactGroups.organizationId, organizationId));
    }
    
    return await query.orderBy(contactGroups.name);
  }
  
  async createContactGroup(group: InsertContactGroup): Promise<ContactGroup> {
    const [createdGroup] = await db
      .insert(contactGroups)
      .values({
        ...group,
        createdAt: new Date()
      })
      .returning();
    return createdGroup;
  }
  
  async updateContactGroup(id: number, group: Partial<InsertContactGroup>): Promise<ContactGroup | undefined> {
    const [updatedGroup] = await db
      .update(contactGroups)
      .set(group)
      .where(eq(contactGroups.id, id))
      .returning();
    return updatedGroup;
  }
  
  async deleteContactGroup(id: number): Promise<boolean> {
    const result = await db
      .delete(contactGroups)
      .where(eq(contactGroups.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Contact Group Members methods
  async addContactToGroup(member: InsertContactGroupMember): Promise<ContactGroupMember> {
    const [createdMember] = await db
      .insert(contactGroupMembers)
      .values(member)
      .returning();
    return createdMember;
  }
  
  async removeContactFromGroup(groupId: number, contactId: number): Promise<boolean> {
    const result = await db
      .delete(contactGroupMembers)
      .where(
        and(
          eq(contactGroupMembers.groupId, groupId),
          eq(contactGroupMembers.contactId, contactId)
        )
      );
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getGroupMembers(groupId: number): Promise<Contact[]> {
    return await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        mobile: contacts.mobile,
        position: contacts.position,
        primaryRole: contacts.primaryRole,
        notes: contacts.notes,
        isActive: contacts.isActive,
        organizationId: contacts.organizationId,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt
      })
      .from(contactGroupMembers)
      .innerJoin(contacts, eq(contactGroupMembers.contactId, contacts.id))
      .where(eq(contactGroupMembers.groupId, groupId))
      .orderBy(contacts.lastName, contacts.firstName);
  }
  
  async getContactGroups(contactId: number): Promise<ContactGroup[]> {
    return await db
      .select({
        id: contactGroups.id,
        name: contactGroups.name,
        description: contactGroups.description,
        organizationId: contactGroups.organizationId,
        createdAt: contactGroups.createdAt
      })
      .from(contactGroupMembers)
      .innerJoin(contactGroups, eq(contactGroupMembers.groupId, contactGroups.id))
      .where(eq(contactGroupMembers.contactId, contactId))
      .orderBy(contactGroups.name);
  }
  
  // Contact Interactions methods
  async getContactInteraction(id: number): Promise<ContactInteraction | undefined> {
    const [interaction] = await db
      .select()
      .from(contactInteractions)
      .where(eq(contactInteractions.id, id));
    return interaction;
  }
  
  async getContactInteractions(contactId: number): Promise<ContactInteraction[]> {
    return await db
      .select()
      .from(contactInteractions)
      .where(eq(contactInteractions.contactId, contactId))
      .orderBy(desc(contactInteractions.date));
  }
  
  async createContactInteraction(interaction: InsertContactInteraction): Promise<ContactInteraction> {
    const [createdInteraction] = await db
      .insert(contactInteractions)
      .values({
        ...interaction,
        createdAt: new Date()
      })
      .returning();
    return createdInteraction;
  }
  
  async updateContactInteraction(id: number, interaction: Partial<InsertContactInteraction>): Promise<ContactInteraction | undefined> {
    const [updatedInteraction] = await db
      .update(contactInteractions)
      .set(interaction)
      .where(eq(contactInteractions.id, id))
      .returning();
    return updatedInteraction;
  }
  
  async deleteContactInteraction(id: number): Promise<boolean> {
    const result = await db
      .delete(contactInteractions)
      .where(eq(contactInteractions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // =============== CLIENT MANAGEMENT SYSTEM ===============
  
  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id));
    return client;
  }
  
  async getAllClients(options?: { clientType?: string, status?: string, organizationId?: number }): Promise<Client[]> {
    let query = db.select().from(clients);
    
    if (options) {
      if (options.clientType) {
        query = query.where(eq(clients.clientType, options.clientType));
      }
      
      if (options.status) {
        query = query.where(eq(clients.status, options.status));
      }
      
      if (options.organizationId) {
        query = query.where(eq(clients.organizationId, options.organizationId));
      }
    }
    
    return await query.orderBy(clients.name);
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const [createdClient] = await db
      .insert(clients)
      .values({
        ...client,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return createdClient;
  }
  
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set({
        ...client,
        updatedAt: new Date()
      })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }
  
  async deactivateClient(id: number): Promise<boolean> {
    const [updatedClient] = await db
      .update(clients)
      .set({
        status: 'inactive',
        updatedAt: new Date()
      })
      .where(eq(clients.id, id))
      .returning();
    return !!updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(eq(clients.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Client Types methods
  async getClientType(id: number): Promise<ClientType | undefined> {
    const [type] = await db
      .select()
      .from(clientTypes)
      .where(eq(clientTypes.id, id));
    return type;
  }
  
  async getAllClientTypes(): Promise<ClientType[]> {
    return await db
      .select()
      .from(clientTypes)
      .orderBy(clientTypes.name);
  }
  
  async createClientType(type: InsertClientType): Promise<ClientType> {
    const [createdType] = await db
      .insert(clientTypes)
      .values(type)
      .returning();
    return createdType;
  }
  
  async updateClientType(id: number, type: Partial<InsertClientType>): Promise<ClientType | undefined> {
    const [updatedType] = await db
      .update(clientTypes)
      .set(type)
      .where(eq(clientTypes.id, id))
      .returning();
    return updatedType;
  }
  
  async deleteClientType(id: number): Promise<boolean> {
    const result = await db
      .delete(clientTypes)
      .where(eq(clientTypes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Client Contacts methods
  async getClientContact(id: number): Promise<ClientContact | undefined> {
    const [clientContact] = await db
      .select()
      .from(clientContacts)
      .where(eq(clientContacts.id, id));
    return clientContact;
  }
  
  async getClientContacts(clientId: number): Promise<Contact[]> {
    return await db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        mobile: contacts.mobile,
        position: contacts.position,
        primaryRole: contacts.primaryRole,
        notes: contacts.notes,
        isActive: contacts.isActive,
        organizationId: contacts.organizationId,
        createdAt: contacts.createdAt,
        updatedAt: contacts.updatedAt
      })
      .from(clientContacts)
      .innerJoin(contacts, eq(clientContacts.contactId, contacts.id))
      .where(eq(clientContacts.clientId, clientId))
      .orderBy(contacts.lastName, contacts.firstName);
  }
  
  async addContactToClient(clientContact: InsertClientContact): Promise<ClientContact> {
    const [createdClientContact] = await db
      .insert(clientContacts)
      .values(clientContact)
      .returning();
    return createdClientContact;
  }
  
  async updateClientContact(id: number, clientContact: Partial<InsertClientContact>): Promise<ClientContact | undefined> {
    const [updatedClientContact] = await db
      .update(clientContacts)
      .set(clientContact)
      .where(eq(clientContacts.id, id))
      .returning();
    return updatedClientContact;
  }
  
  async removeContactFromClient(clientId: number, contactId: number): Promise<boolean> {
    const result = await db
      .delete(clientContacts)
      .where(
        and(
          eq(clientContacts.clientId, clientId),
          eq(clientContacts.contactId, contactId)
        )
      );
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async setPrimaryContact(clientId: number, contactId: number): Promise<boolean> {
    // First, reset all contacts for this client to non-primary
    await db
      .update(clientContacts)
      .set({ isPrimary: false })
      .where(eq(clientContacts.clientId, clientId));
    
    // Then set the specified contact as primary
    const [updatedContact] = await db
      .update(clientContacts)
      .set({ isPrimary: true })
      .where(
        and(
          eq(clientContacts.clientId, clientId),
          eq(clientContacts.contactId, contactId)
        )
      )
      .returning();
    
    return !!updatedContact;
  }
  
  // Client Services methods
  async getClientService(id: number): Promise<ClientService | undefined> {
    const [service] = await db
      .select()
      .from(clientServices)
      .where(eq(clientServices.id, id));
    return service;
  }
  
  async getClientServices(clientId: number): Promise<ClientService[]> {
    return await db
      .select()
      .from(clientServices)
      .where(eq(clientServices.clientId, clientId))
      .orderBy(clientServices.serviceType);
  }
  
  async addServiceToClient(service: InsertClientService): Promise<ClientService> {
    const [createdService] = await db
      .insert(clientServices)
      .values({
        ...service,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return createdService;
  }
  
  async updateClientService(id: number, service: Partial<InsertClientService>): Promise<ClientService | undefined> {
    const [updatedService] = await db
      .update(clientServices)
      .set({
        ...service,
        updatedAt: new Date()
      })
      .where(eq(clientServices.id, id))
      .returning();
    return updatedService;
  }
  
  async removeServiceFromClient(id: number): Promise<boolean> {
    const result = await db
      .delete(clientServices)
      .where(eq(clientServices.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Client Interactions methods
  async getClientInteraction(id: number): Promise<ClientInteraction | undefined> {
    const [interaction] = await db
      .select()
      .from(clientInteractions)
      .where(eq(clientInteractions.id, id));
    return interaction;
  }
  
  async getClientInteractions(clientId: number): Promise<ClientInteraction[]> {
    return await db
      .select()
      .from(clientInteractions)
      .where(eq(clientInteractions.clientId, clientId))
      .orderBy(desc(clientInteractions.date));
  }
  
  async createClientInteraction(interaction: InsertClientInteraction): Promise<ClientInteraction> {
    const [createdInteraction] = await db
      .insert(clientInteractions)
      .values({
        ...interaction,
        createdAt: new Date()
      })
      .returning();
    return createdInteraction;
  }
  
  async updateClientInteraction(id: number, interaction: Partial<InsertClientInteraction>): Promise<ClientInteraction | undefined> {
    const [updatedInteraction] = await db
      .update(clientInteractions)
      .set(interaction)
      .where(eq(clientInteractions.id, id))
      .returning();
    return updatedInteraction;
  }
  
  async deleteClientInteraction(id: number): Promise<boolean> {
    const result = await db
      .delete(clientInteractions)
      .where(eq(clientInteractions.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();