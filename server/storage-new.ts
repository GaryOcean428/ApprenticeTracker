import { and, desc, eq } from 'drizzle-orm';
import { db } from './db';
import {
  Apprentice,
  Document,
  HostEmployer,
  InsertApprentice,
  InsertDocument,
  InsertHostEmployer,
  InsertPlacement,
  InsertTrainingContract,
  InsertUser,
  Placement,
  TrainingContract,
  User,
  users,
  apprentices,
  hostEmployers,
  trainingContracts,
  placements,
  documents,
  complianceRecords,
  timesheets,
  timesheetDetails,
  activityLogs,
  tasks,
  InsertComplianceRecord,
  ComplianceRecord,
  InsertTimesheet,
  Timesheet,
  InsertTimesheetDetail,
  TimesheetDetail,
  InsertActivityLog,
  ActivityLog,
  InsertTask,
  Task,
} from '@shared/schema';

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Apprentices
  getAllApprentices(): Promise<Apprentice[]>;
  getApprentice(id: number): Promise<Apprentice | undefined>;
  createApprentice(apprentice: InsertApprentice): Promise<Apprentice>;
  updateApprentice(
    id: number,
    apprentice: Partial<InsertApprentice>
  ): Promise<Apprentice | undefined>;
  deleteApprentice(id: number): Promise<boolean>;

  // Host Employers
  getAllHostEmployers(): Promise<HostEmployer[]>;
  getHostEmployer(id: number): Promise<HostEmployer | undefined>;
  createHostEmployer(hostEmployer: InsertHostEmployer): Promise<HostEmployer>;
  updateHostEmployer(
    id: number,
    hostEmployer: Partial<InsertHostEmployer>
  ): Promise<HostEmployer | undefined>;
  deleteHostEmployer(id: number): Promise<boolean>;

  // Training Contracts
  getAllTrainingContracts(): Promise<TrainingContract[]>;
  getTrainingContract(id: number): Promise<TrainingContract | undefined>;
  getTrainingContractsByApprentice(apprenticeId: number): Promise<TrainingContract[]>;
  createTrainingContract(contract: InsertTrainingContract): Promise<TrainingContract>;
  updateTrainingContract(
    id: number,
    contract: Partial<InsertTrainingContract>
  ): Promise<TrainingContract | undefined>;
  deleteTrainingContract(id: number): Promise<boolean>;

  // Placements
  getAllPlacements(): Promise<Placement[]>;
  getPlacement(id: number): Promise<Placement | undefined>;
  getPlacementsByApprentice(apprenticeId: number): Promise<Placement[]>;
  getPlacementsByHost(hostEmployerId: number): Promise<Placement[]>;
  createPlacement(placement: InsertPlacement): Promise<Placement>;
  updatePlacement(id: number, placement: Partial<InsertPlacement>): Promise<Placement | undefined>;
  deletePlacement(id: number): Promise<boolean>;

  // Documents
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByRelation(relatedTo: string, relatedId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Compliance Records
  getAllComplianceRecords(): Promise<ComplianceRecord[]>;
  getComplianceRecord(id: number): Promise<ComplianceRecord | undefined>;
  getComplianceRecordsByRelation(relatedTo: string, relatedId: number): Promise<ComplianceRecord[]>;
  createComplianceRecord(record: InsertComplianceRecord): Promise<ComplianceRecord>;
  updateComplianceRecord(
    id: number,
    record: Partial<InsertComplianceRecord>
  ): Promise<ComplianceRecord | undefined>;
  deleteComplianceRecord(id: number): Promise<boolean>;

  // Timesheets
  getAllTimesheets(): Promise<Timesheet[]>;
  getTimesheet(id: number): Promise<Timesheet | undefined>;
  getTimesheetsByApprentice(apprenticeId: number): Promise<Timesheet[]>;
  createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: number, timesheet: Partial<InsertTimesheet>): Promise<Timesheet | undefined>;
  deleteTimesheet(id: number): Promise<boolean>;

  // Timesheet Details
  getTimesheetDetails(timesheetId: number): Promise<TimesheetDetail[]>;
  createTimesheetDetail(detail: InsertTimesheetDetail): Promise<TimesheetDetail>;
  updateTimesheetDetail(
    id: number,
    detail: Partial<InsertTimesheetDetail>
  ): Promise<TimesheetDetail | undefined>;
  deleteTimesheetDetail(id: number): Promise<boolean>;

  // Activity Logs
  getAllActivityLogs(): Promise<ActivityLog[]>;
  getRecentActivityLogs(limit: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Tasks
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByAssignee(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number): Promise<Task | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Apprentices
  async getAllApprentices(): Promise<Apprentice[]> {
    return await db.select().from(apprentices);
  }

  async getApprentice(id: number): Promise<Apprentice | undefined> {
    const [apprentice] = await db.select().from(apprentices).where(eq(apprentices.id, id));
    return apprentice || undefined;
  }

  async createApprentice(insertApprentice: InsertApprentice): Promise<Apprentice> {
    const [apprentice] = await db.insert(apprentices).values(insertApprentice).returning();
    return apprentice;
  }

  async updateApprentice(
    id: number,
    apprenticeData: Partial<InsertApprentice>
  ): Promise<Apprentice | undefined> {
    const [updatedApprentice] = await db
      .update(apprentices)
      .set(apprenticeData)
      .where(eq(apprentices.id, id))
      .returning();
    return updatedApprentice || undefined;
  }

  async deleteApprentice(id: number): Promise<boolean> {
    await db.delete(apprentices).where(eq(apprentices.id, id));
    return true;
  }

  // Host Employers
  async getAllHostEmployers(): Promise<HostEmployer[]> {
    return await db.select().from(hostEmployers);
  }

  async getHostEmployer(id: number): Promise<HostEmployer | undefined> {
    const [hostEmployer] = await db.select().from(hostEmployers).where(eq(hostEmployers.id, id));
    return hostEmployer || undefined;
  }

  async createHostEmployer(insertHostEmployer: InsertHostEmployer): Promise<HostEmployer> {
    const [hostEmployer] = await db.insert(hostEmployers).values(insertHostEmployer).returning();
    return hostEmployer;
  }

  async updateHostEmployer(
    id: number,
    hostEmployerData: Partial<InsertHostEmployer>
  ): Promise<HostEmployer | undefined> {
    const [updatedHostEmployer] = await db
      .update(hostEmployers)
      .set(hostEmployerData)
      .where(eq(hostEmployers.id, id))
      .returning();
    return updatedHostEmployer || undefined;
  }

  async deleteHostEmployer(id: number): Promise<boolean> {
    await db.delete(hostEmployers).where(eq(hostEmployers.id, id));
    return true;
  }

  // Training Contracts
  async getAllTrainingContracts(): Promise<TrainingContract[]> {
    return await db.select().from(trainingContracts);
  }

  async getTrainingContract(id: number): Promise<TrainingContract | undefined> {
    const [contract] = await db
      .select()
      .from(trainingContracts)
      .where(eq(trainingContracts.id, id));
    return contract || undefined;
  }

  async getTrainingContractsByApprentice(apprenticeId: number): Promise<TrainingContract[]> {
    return await db
      .select()
      .from(trainingContracts)
      .where(eq(trainingContracts.apprenticeId, apprenticeId));
  }

  async createTrainingContract(insertContract: InsertTrainingContract): Promise<TrainingContract> {
    const [contract] = await db.insert(trainingContracts).values(insertContract).returning();
    return contract;
  }

  async updateTrainingContract(
    id: number,
    contractData: Partial<InsertTrainingContract>
  ): Promise<TrainingContract | undefined> {
    const [updatedContract] = await db
      .update(trainingContracts)
      .set(contractData)
      .where(eq(trainingContracts.id, id))
      .returning();
    return updatedContract || undefined;
  }

  async deleteTrainingContract(id: number): Promise<boolean> {
    await db.delete(trainingContracts).where(eq(trainingContracts.id, id));
    return true;
  }

  // Placements
  async getAllPlacements(): Promise<Placement[]> {
    return await db.select().from(placements);
  }

  async getPlacement(id: number): Promise<Placement | undefined> {
    const [placement] = await db.select().from(placements).where(eq(placements.id, id));
    return placement || undefined;
  }

  async getPlacementsByApprentice(apprenticeId: number): Promise<Placement[]> {
    return await db.select().from(placements).where(eq(placements.apprenticeId, apprenticeId));
  }

  async getPlacementsByHost(hostEmployerId: number): Promise<Placement[]> {
    return await db.select().from(placements).where(eq(placements.hostEmployerId, hostEmployerId));
  }

  async createPlacement(insertPlacement: InsertPlacement): Promise<Placement> {
    const [placement] = await db.insert(placements).values(insertPlacement).returning();
    return placement;
  }

  async updatePlacement(
    id: number,
    placementData: Partial<InsertPlacement>
  ): Promise<Placement | undefined> {
    const [updatedPlacement] = await db
      .update(placements)
      .set(placementData)
      .where(eq(placements.id, id))
      .returning();
    return updatedPlacement || undefined;
  }

  async deletePlacement(id: number): Promise<boolean> {
    await db.delete(placements).where(eq(placements.id, id));
    return true;
  }

  // Documents
  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByRelation(relatedTo: string, relatedId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.relatedTo, relatedTo), eq(documents.relatedId, relatedId)));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(
    id: number,
    documentData: Partial<InsertDocument>
  ): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set(documentData)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  // Compliance Records
  async getAllComplianceRecords(): Promise<ComplianceRecord[]> {
    return await db.select().from(complianceRecords);
  }

  async getComplianceRecord(id: number): Promise<ComplianceRecord | undefined> {
    const [record] = await db.select().from(complianceRecords).where(eq(complianceRecords.id, id));
    return record || undefined;
  }

  async getComplianceRecordsByRelation(
    relatedTo: string,
    relatedId: number
  ): Promise<ComplianceRecord[]> {
    return await db
      .select()
      .from(complianceRecords)
      .where(
        and(eq(complianceRecords.relatedTo, relatedTo), eq(complianceRecords.relatedId, relatedId))
      );
  }

  async createComplianceRecord(insertRecord: InsertComplianceRecord): Promise<ComplianceRecord> {
    const [record] = await db.insert(complianceRecords).values(insertRecord).returning();
    return record;
  }

  async updateComplianceRecord(
    id: number,
    recordData: Partial<InsertComplianceRecord>
  ): Promise<ComplianceRecord | undefined> {
    const [updatedRecord] = await db
      .update(complianceRecords)
      .set(recordData)
      .where(eq(complianceRecords.id, id))
      .returning();
    return updatedRecord || undefined;
  }

  async deleteComplianceRecord(id: number): Promise<boolean> {
    await db.delete(complianceRecords).where(eq(complianceRecords.id, id));
    return true;
  }

  // Timesheets
  async getAllTimesheets(): Promise<Timesheet[]> {
    return await db.select().from(timesheets);
  }

  async getTimesheet(id: number): Promise<Timesheet | undefined> {
    const [timesheet] = await db.select().from(timesheets).where(eq(timesheets.id, id));
    return timesheet || undefined;
  }

  async getTimesheetsByApprentice(apprenticeId: number): Promise<Timesheet[]> {
    return await db.select().from(timesheets).where(eq(timesheets.apprenticeId, apprenticeId));
  }

  async createTimesheet(insertTimesheet: InsertTimesheet): Promise<Timesheet> {
    const [timesheet] = await db.insert(timesheets).values(insertTimesheet).returning();
    return timesheet;
  }

  async updateTimesheet(
    id: number,
    timesheetData: Partial<InsertTimesheet>
  ): Promise<Timesheet | undefined> {
    const [updatedTimesheet] = await db
      .update(timesheets)
      .set(timesheetData)
      .where(eq(timesheets.id, id))
      .returning();
    return updatedTimesheet || undefined;
  }

  async deleteTimesheet(id: number): Promise<boolean> {
    await db.delete(timesheets).where(eq(timesheets.id, id));
    return true;
  }

  // Timesheet Details
  async getTimesheetDetails(timesheetId: number): Promise<TimesheetDetail[]> {
    return await db
      .select()
      .from(timesheetDetails)
      .where(eq(timesheetDetails.timesheetId, timesheetId));
  }

  async createTimesheetDetail(insertDetail: InsertTimesheetDetail): Promise<TimesheetDetail> {
    const [detail] = await db.insert(timesheetDetails).values(insertDetail).returning();
    return detail;
  }

  async updateTimesheetDetail(
    id: number,
    detailData: Partial<InsertTimesheetDetail>
  ): Promise<TimesheetDetail | undefined> {
    const [updatedDetail] = await db
      .update(timesheetDetails)
      .set(detailData)
      .where(eq(timesheetDetails.id, id))
      .returning();
    return updatedDetail || undefined;
  }

  async deleteTimesheetDetail(id: number): Promise<boolean> {
    await db.delete(timesheetDetails).where(eq(timesheetDetails.id, id));
    return true;
  }

  // Activity Logs
  async getAllActivityLogs(): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs);
  }

  async getRecentActivityLogs(limit: number): Promise<ActivityLog[]> {
    return await db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values(insertLog).returning();
    return log;
  }

  // Tasks
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, userId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db.update(tasks).set(taskData).where(eq(tasks.id, id)).returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];

    const [task] = await db
      .update(tasks)
      .set({ status: 'completed', completedAt: formattedDate })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }
}

// Use DatabaseStorage for the app
export const storage = new DatabaseStorage();
