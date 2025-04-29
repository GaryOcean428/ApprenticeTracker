import {
  users, User, InsertUser,
  apprentices, Apprentice, InsertApprentice,
  hostEmployers, HostEmployer, InsertHostEmployer,
  trainingContracts, TrainingContract, InsertTrainingContract,
  placements, Placement, InsertPlacement,
  documents, Document, InsertDocument,
  complianceRecords, ComplianceRecord, InsertComplianceRecord,
  timesheets, Timesheet, InsertTimesheet,
  timesheetDetails, TimesheetDetail, InsertTimesheetDetail,
  activityLogs, ActivityLog, InsertActivityLog,
  tasks, Task, InsertTask
} from "@shared/schema";

// Storage interface with CRUD operations
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
  updateApprentice(id: number, apprentice: Partial<InsertApprentice>): Promise<Apprentice | undefined>;
  deleteApprentice(id: number): Promise<boolean>;
  
  // Host Employers
  getAllHostEmployers(): Promise<HostEmployer[]>;
  getHostEmployer(id: number): Promise<HostEmployer | undefined>;
  createHostEmployer(hostEmployer: InsertHostEmployer): Promise<HostEmployer>;
  updateHostEmployer(id: number, hostEmployer: Partial<InsertHostEmployer>): Promise<HostEmployer | undefined>;
  deleteHostEmployer(id: number): Promise<boolean>;
  
  // Training Contracts
  getAllTrainingContracts(): Promise<TrainingContract[]>;
  getTrainingContract(id: number): Promise<TrainingContract | undefined>;
  getTrainingContractsByApprentice(apprenticeId: number): Promise<TrainingContract[]>;
  createTrainingContract(contract: InsertTrainingContract): Promise<TrainingContract>;
  updateTrainingContract(id: number, contract: Partial<InsertTrainingContract>): Promise<TrainingContract | undefined>;
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
  updateComplianceRecord(id: number, record: Partial<InsertComplianceRecord>): Promise<ComplianceRecord | undefined>;
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
  updateTimesheetDetail(id: number, detail: Partial<InsertTimesheetDetail>): Promise<TimesheetDetail | undefined>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apprentices: Map<number, Apprentice>;
  private hostEmployers: Map<number, HostEmployer>;
  private trainingContracts: Map<number, TrainingContract>;
  private placements: Map<number, Placement>;
  private documents: Map<number, Document>;
  private complianceRecords: Map<number, ComplianceRecord>;
  private timesheets: Map<number, Timesheet>;
  private timesheetDetails: Map<number, TimesheetDetail>;
  private activityLogs: Map<number, ActivityLog>;
  private tasks: Map<number, Task>;
  
  // ID counters
  private userIdCounter: number;
  private apprenticeIdCounter: number;
  private hostEmployerIdCounter: number;
  private contractIdCounter: number;
  private placementIdCounter: number;
  private documentIdCounter: number;
  private complianceRecordIdCounter: number;
  private timesheetIdCounter: number;
  private timesheetDetailIdCounter: number;
  private activityLogIdCounter: number;
  private taskIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.apprentices = new Map();
    this.hostEmployers = new Map();
    this.trainingContracts = new Map();
    this.placements = new Map();
    this.documents = new Map();
    this.complianceRecords = new Map();
    this.timesheets = new Map();
    this.timesheetDetails = new Map();
    this.activityLogs = new Map();
    this.tasks = new Map();
    
    this.userIdCounter = 1;
    this.apprenticeIdCounter = 1;
    this.hostEmployerIdCounter = 1;
    this.contractIdCounter = 1;
    this.placementIdCounter = 1;
    this.documentIdCounter = 1;
    this.complianceRecordIdCounter = 1;
    this.timesheetIdCounter = 1;
    this.timesheetDetailIdCounter = 1;
    this.activityLogIdCounter = 1;
    this.taskIdCounter = 1;
    
    // Initialize with some sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Add sample users
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      email: "admin@crm7.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      profileImage: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
    };
    this.createUser(adminUser);
    
    // Add sample apprentices
    const apprentices: InsertApprentice[] = [
      {
        userId: 1,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "123-456-7890",
        dateOfBirth: new Date("1995-05-15"),
        trade: "Electrical",
        status: "active",
        profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        progress: 75,
        startDate: new Date("2023-01-15"),
        endDate: new Date("2026-01-15"),
        notes: "Excellent progress in technical skills",
      },
      {
        userId: null,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.j@example.com",
        phone: "123-456-7891",
        dateOfBirth: new Date("1998-08-22"),
        trade: "Carpentry",
        status: "active",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        progress: 45,
        startDate: new Date("2023-03-10"),
        endDate: new Date("2026-03-10"),
        notes: "Needs improvement in time management",
      },
      {
        userId: null,
        firstName: "Michael",
        lastName: "Chen",
        email: "m.chen@example.com",
        phone: "123-456-7892",
        dateOfBirth: new Date("1997-11-30"),
        trade: "IT Support",
        status: "active",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        progress: 90,
        startDate: new Date("2022-09-05"),
        endDate: new Date("2025-09-05"),
        notes: "Excellent technical skills",
      },
      {
        userId: null,
        firstName: "David",
        lastName: "Wilson",
        email: "d.wilson@example.com",
        phone: "123-456-7893",
        dateOfBirth: new Date("1996-04-12"),
        trade: "Plumbing",
        status: "on_hold",
        profileImage: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        progress: 30,
        startDate: new Date("2023-02-20"),
        endDate: new Date("2026-02-20"),
        notes: "Currently on hold due to personal reasons",
      }
    ];
    
    apprentices.forEach(apprentice => this.createApprentice(apprentice));
    
    // Add sample host employers
    const hostEmployers: InsertHostEmployer[] = [
      {
        name: "PowerTech Industries",
        industry: "Electrical",
        contactPerson: "James Wilson",
        email: "j.wilson@powertech.com",
        phone: "123-456-7894",
        address: "123 Power Ave, Metropolis",
        status: "active",
        safetyRating: 9,
        complianceStatus: "compliant",
        notes: "Long-standing partner with excellent safety record",
      },
      {
        name: "BuildWell Construction",
        industry: "Construction",
        contactPerson: "Emma Roberts",
        email: "e.roberts@buildwell.com",
        phone: "123-456-7895",
        address: "456 Builder St, Constructown",
        status: "active",
        safetyRating: 8,
        complianceStatus: "compliant",
        notes: "Multiple apprentice placements annually",
      },
      {
        name: "TechSolutions Inc.",
        industry: "Information Technology",
        contactPerson: "Alex Chen",
        email: "a.chen@techsolutions.com",
        phone: "123-456-7896",
        address: "789 Tech Blvd, Silicon Valley",
        status: "active",
        safetyRating: 10,
        complianceStatus: "compliant",
        notes: "Excellent mentoring program for IT apprentices",
      },
      {
        name: "FlowMasters Ltd.",
        industry: "Plumbing",
        contactPerson: "Robert Johnson",
        email: "r.johnson@flowmasters.com",
        phone: "123-456-7897",
        address: "101 Plumber Lane, Watertown",
        status: "active",
        safetyRating: 7,
        complianceStatus: "pending",
        notes: "Safety compliance review in progress",
      }
    ];
    
    hostEmployers.forEach(host => this.createHostEmployer(host));
    
    // Add sample training contracts
    const contracts: InsertTrainingContract[] = [
      {
        apprenticeId: 1,
        contractNumber: "TC-2023-001",
        startDate: new Date("2023-01-15"),
        endDate: new Date("2026-01-15"),
        status: "active",
        documentUrl: "/documents/contracts/TC-2023-001.pdf",
        terms: {},
        approvedBy: "HR Manager",
        approvalDate: new Date("2023-01-10"),
      },
      {
        apprenticeId: 2,
        contractNumber: "TC-2023-002",
        startDate: new Date("2023-03-10"),
        endDate: new Date("2026-03-10"),
        status: "active",
        documentUrl: "/documents/contracts/TC-2023-002.pdf",
        terms: {},
        approvedBy: "HR Manager",
        approvalDate: new Date("2023-03-05"),
      },
      {
        apprenticeId: 3,
        contractNumber: "TC-2022-015",
        startDate: new Date("2022-09-05"),
        endDate: new Date("2025-09-05"),
        status: "active",
        documentUrl: "/documents/contracts/TC-2022-015.pdf",
        terms: {},
        approvedBy: "HR Manager",
        approvalDate: new Date("2022-09-01"),
      },
      {
        apprenticeId: 4,
        contractNumber: "TC-2023-003",
        startDate: new Date("2023-02-20"),
        endDate: new Date("2026-02-20"),
        status: "on_hold",
        documentUrl: "/documents/contracts/TC-2023-003.pdf",
        terms: {},
        approvedBy: "HR Manager",
        approvalDate: new Date("2023-02-15"),
      }
    ];
    
    contracts.forEach(contract => this.createTrainingContract(contract));
    
    // Add sample placements
    const placements: InsertPlacement[] = [
      {
        apprenticeId: 1,
        hostEmployerId: 1,
        startDate: new Date("2023-01-20"),
        endDate: new Date("2023-07-20"),
        status: "active",
        position: "Electrical Apprentice",
        supervisor: "Thomas Edison",
        supervisorContact: "t.edison@powertech.com",
        notes: "Performing well in all areas",
      },
      {
        apprenticeId: 2,
        hostEmployerId: 2,
        startDate: new Date("2023-03-15"),
        endDate: new Date("2023-09-15"),
        status: "active",
        position: "Carpentry Apprentice",
        supervisor: "Bob Builder",
        supervisorContact: "b.builder@buildwell.com",
        notes: "Needs more practice with advanced techniques",
      },
      {
        apprenticeId: 3,
        hostEmployerId: 3,
        startDate: new Date("2022-09-10"),
        endDate: new Date("2023-03-10"),
        status: "completed",
        position: "IT Support Apprentice",
        supervisor: "Ada Lovelace",
        supervisorContact: "a.lovelace@techsolutions.com",
        notes: "Excellent technical skills, completed ahead of schedule",
      },
      {
        apprenticeId: 3,
        hostEmployerId: 3,
        startDate: new Date("2023-04-01"),
        endDate: new Date("2023-10-01"),
        status: "active",
        position: "IT Support Apprentice - Advanced",
        supervisor: "Ada Lovelace",
        supervisorContact: "a.lovelace@techsolutions.com",
        notes: "Second placement with increased responsibilities",
      },
      {
        apprenticeId: 4,
        hostEmployerId: 4,
        startDate: new Date("2023-02-25"),
        endDate: new Date("2023-08-25"),
        status: "on_hold",
        position: "Plumbing Apprentice",
        supervisor: "Joe Plumber",
        supervisorContact: "j.plumber@flowmasters.com",
        notes: "Placement on hold due to apprentice personal circumstances",
      }
    ];
    
    placements.forEach(placement => this.createPlacement(placement));
    
    // Add sample documents
    const documents: InsertDocument[] = [
      {
        title: "Safety Manual v2.3",
        type: "safety",
        url: "/documents/safety/manual_v2.3.pdf",
        uploadedBy: 1,
        relatedTo: "system",
        relatedId: 0,
        expiryDate: null,
        status: "active",
      },
      {
        title: "Monthly Progress Report",
        type: "report",
        url: "/documents/reports/progress_report_202305.xlsx",
        uploadedBy: 1,
        relatedTo: "system",
        relatedId: 0,
        expiryDate: null,
        status: "active",
      },
      {
        title: "Contract Template",
        type: "template",
        url: "/documents/templates/contract_template.docx",
        uploadedBy: 1,
        relatedTo: "system",
        relatedId: 0,
        expiryDate: null,
        status: "active",
      },
      {
        title: "Training Guidelines",
        type: "guidelines",
        url: "/documents/guidelines/training_guidelines.pdf",
        uploadedBy: 1,
        relatedTo: "system",
        relatedId: 0,
        expiryDate: null,
        status: "active",
      }
    ];
    
    documents.forEach(doc => this.createDocument(doc));
    
    // Add sample activity logs
    const activities: InsertActivityLog[] = [
      {
        userId: 1,
        action: "created",
        relatedTo: "apprentice",
        relatedId: 1,
        details: { message: "New apprentice John Doe registered" },
      },
      {
        userId: 1,
        action: "approved",
        relatedTo: "contract",
        relatedId: 1,
        details: { message: "Contract #45928 approved by HR" },
      },
      {
        userId: 1,
        action: "warning",
        relatedTo: "host",
        relatedId: 4,
        details: { message: "Safety compliance warning for WorkSafe Construction" },
      },
      {
        userId: 1,
        action: "completed",
        relatedTo: "training",
        relatedId: 0,
        details: { message: "Training module completed by 15 apprentices" },
      }
    ];
    
    activities.forEach(activity => this.createActivityLog(activity));
    
    // Add sample tasks
    const tasks: InsertTask[] = [
      {
        title: "Review new apprentice applications",
        description: "Review and process 5 new apprentice applications",
        assignedTo: 1,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        priority: "urgent",
        status: "pending",
        relatedTo: "apprentice",
        relatedId: null,
        createdBy: 1,
      },
      {
        title: "Prepare monthly compliance report",
        description: "Compile and submit the monthly compliance report",
        assignedTo: 1,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        priority: "high",
        status: "pending",
        relatedTo: "compliance",
        relatedId: null,
        createdBy: 1,
      },
      {
        title: "Follow up with TechWorks regarding placement openings",
        description: "Call TechWorks to confirm available placement slots for next quarter",
        assignedTo: 1,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: "medium",
        status: "pending",
        relatedTo: "placement",
        relatedId: null,
        createdBy: 1,
      },
      {
        title: "Update training materials for electrical apprentices",
        description: "Review and update electrical apprentice training materials with new safety procedures",
        assignedTo: 1,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        priority: "medium",
        status: "completed",
        relatedTo: "training",
        relatedId: null,
        createdBy: 1,
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        title: "Schedule quarterly review meeting with hosts",
        description: "Set up the quarterly review meeting with all active host employers",
        assignedTo: 1,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        priority: "medium",
        status: "pending",
        relatedTo: "host",
        relatedId: null,
        createdBy: 1,
      }
    ];
    
    tasks.forEach(task => this.createTask(task));
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Apprentice methods
  async getAllApprentices(): Promise<Apprentice[]> {
    return Array.from(this.apprentices.values());
  }
  
  async getApprentice(id: number): Promise<Apprentice | undefined> {
    return this.apprentices.get(id);
  }
  
  async createApprentice(insertApprentice: InsertApprentice): Promise<Apprentice> {
    const id = this.apprenticeIdCounter++;
    const apprentice: Apprentice = { ...insertApprentice, id };
    this.apprentices.set(id, apprentice);
    return apprentice;
  }
  
  async updateApprentice(id: number, apprenticeData: Partial<InsertApprentice>): Promise<Apprentice | undefined> {
    const apprentice = this.apprentices.get(id);
    if (!apprentice) return undefined;
    
    const updatedApprentice: Apprentice = { ...apprentice, ...apprenticeData };
    this.apprentices.set(id, updatedApprentice);
    return updatedApprentice;
  }
  
  async deleteApprentice(id: number): Promise<boolean> {
    return this.apprentices.delete(id);
  }
  
  // Host Employer methods
  async getAllHostEmployers(): Promise<HostEmployer[]> {
    return Array.from(this.hostEmployers.values());
  }
  
  async getHostEmployer(id: number): Promise<HostEmployer | undefined> {
    return this.hostEmployers.get(id);
  }
  
  async createHostEmployer(insertHostEmployer: InsertHostEmployer): Promise<HostEmployer> {
    const id = this.hostEmployerIdCounter++;
    const hostEmployer: HostEmployer = { ...insertHostEmployer, id };
    this.hostEmployers.set(id, hostEmployer);
    return hostEmployer;
  }
  
  async updateHostEmployer(id: number, hostEmployerData: Partial<InsertHostEmployer>): Promise<HostEmployer | undefined> {
    const hostEmployer = this.hostEmployers.get(id);
    if (!hostEmployer) return undefined;
    
    const updatedHostEmployer: HostEmployer = { ...hostEmployer, ...hostEmployerData };
    this.hostEmployers.set(id, updatedHostEmployer);
    return updatedHostEmployer;
  }
  
  async deleteHostEmployer(id: number): Promise<boolean> {
    return this.hostEmployers.delete(id);
  }
  
  // Training Contract methods
  async getAllTrainingContracts(): Promise<TrainingContract[]> {
    return Array.from(this.trainingContracts.values());
  }
  
  async getTrainingContract(id: number): Promise<TrainingContract | undefined> {
    return this.trainingContracts.get(id);
  }
  
  async getTrainingContractsByApprentice(apprenticeId: number): Promise<TrainingContract[]> {
    return Array.from(this.trainingContracts.values()).filter(
      contract => contract.apprenticeId === apprenticeId
    );
  }
  
  async createTrainingContract(insertContract: InsertTrainingContract): Promise<TrainingContract> {
    const id = this.contractIdCounter++;
    const contract: TrainingContract = { ...insertContract, id };
    this.trainingContracts.set(id, contract);
    return contract;
  }
  
  async updateTrainingContract(id: number, contractData: Partial<InsertTrainingContract>): Promise<TrainingContract | undefined> {
    const contract = this.trainingContracts.get(id);
    if (!contract) return undefined;
    
    const updatedContract: TrainingContract = { ...contract, ...contractData };
    this.trainingContracts.set(id, updatedContract);
    return updatedContract;
  }
  
  async deleteTrainingContract(id: number): Promise<boolean> {
    return this.trainingContracts.delete(id);
  }
  
  // Placement methods
  async getAllPlacements(): Promise<Placement[]> {
    return Array.from(this.placements.values());
  }
  
  async getPlacement(id: number): Promise<Placement | undefined> {
    return this.placements.get(id);
  }
  
  async getPlacementsByApprentice(apprenticeId: number): Promise<Placement[]> {
    return Array.from(this.placements.values()).filter(
      placement => placement.apprenticeId === apprenticeId
    );
  }
  
  async getPlacementsByHost(hostEmployerId: number): Promise<Placement[]> {
    return Array.from(this.placements.values()).filter(
      placement => placement.hostEmployerId === hostEmployerId
    );
  }
  
  async createPlacement(insertPlacement: InsertPlacement): Promise<Placement> {
    const id = this.placementIdCounter++;
    const placement: Placement = { ...insertPlacement, id };
    this.placements.set(id, placement);
    return placement;
  }
  
  async updatePlacement(id: number, placementData: Partial<InsertPlacement>): Promise<Placement | undefined> {
    const placement = this.placements.get(id);
    if (!placement) return undefined;
    
    const updatedPlacement: Placement = { ...placement, ...placementData };
    this.placements.set(id, updatedPlacement);
    return updatedPlacement;
  }
  
  async deletePlacement(id: number): Promise<boolean> {
    return this.placements.delete(id);
  }
  
  // Document methods
  async getAllDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async getDocumentsByRelation(relatedTo: string, relatedId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      doc => doc.relatedTo === relatedTo && doc.relatedId === relatedId
    );
  }
  
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const document: Document = { 
      ...insertDocument, 
      id,
      uploadDate: new Date()
    };
    this.documents.set(id, document);
    return document;
  }
  
  async updateDocument(id: number, documentData: Partial<InsertDocument>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument: Document = { ...document, ...documentData };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // Compliance Record methods
  async getAllComplianceRecords(): Promise<ComplianceRecord[]> {
    return Array.from(this.complianceRecords.values());
  }
  
  async getComplianceRecord(id: number): Promise<ComplianceRecord | undefined> {
    return this.complianceRecords.get(id);
  }
  
  async getComplianceRecordsByRelation(relatedTo: string, relatedId: number): Promise<ComplianceRecord[]> {
    return Array.from(this.complianceRecords.values()).filter(
      record => record.relatedTo === relatedTo && record.relatedId === relatedId
    );
  }
  
  async createComplianceRecord(insertRecord: InsertComplianceRecord): Promise<ComplianceRecord> {
    const id = this.complianceRecordIdCounter++;
    const record: ComplianceRecord = { ...insertRecord, id };
    this.complianceRecords.set(id, record);
    return record;
  }
  
  async updateComplianceRecord(id: number, recordData: Partial<InsertComplianceRecord>): Promise<ComplianceRecord | undefined> {
    const record = this.complianceRecords.get(id);
    if (!record) return undefined;
    
    const updatedRecord: ComplianceRecord = { ...record, ...recordData };
    this.complianceRecords.set(id, updatedRecord);
    return updatedRecord;
  }
  
  async deleteComplianceRecord(id: number): Promise<boolean> {
    return this.complianceRecords.delete(id);
  }
  
  // Timesheet methods
  async getAllTimesheets(): Promise<Timesheet[]> {
    return Array.from(this.timesheets.values());
  }
  
  async getTimesheet(id: number): Promise<Timesheet | undefined> {
    return this.timesheets.get(id);
  }
  
  async getTimesheetsByApprentice(apprenticeId: number): Promise<Timesheet[]> {
    return Array.from(this.timesheets.values()).filter(
      timesheet => timesheet.apprenticeId === apprenticeId
    );
  }
  
  async createTimesheet(insertTimesheet: InsertTimesheet): Promise<Timesheet> {
    const id = this.timesheetIdCounter++;
    const timesheet: Timesheet = { 
      ...insertTimesheet, 
      id,
      submittedDate: new Date(),
      approvalDate: null
    };
    this.timesheets.set(id, timesheet);
    return timesheet;
  }
  
  async updateTimesheet(id: number, timesheetData: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const timesheet = this.timesheets.get(id);
    if (!timesheet) return undefined;
    
    const updatedTimesheet: Timesheet = { ...timesheet, ...timesheetData };
    this.timesheets.set(id, updatedTimesheet);
    return updatedTimesheet;
  }
  
  async deleteTimesheet(id: number): Promise<boolean> {
    return this.timesheets.delete(id);
  }
  
  // Timesheet Detail methods
  async getTimesheetDetails(timesheetId: number): Promise<TimesheetDetail[]> {
    return Array.from(this.timesheetDetails.values()).filter(
      detail => detail.timesheetId === timesheetId
    );
  }
  
  async createTimesheetDetail(insertDetail: InsertTimesheetDetail): Promise<TimesheetDetail> {
    const id = this.timesheetDetailIdCounter++;
    const detail: TimesheetDetail = { ...insertDetail, id };
    this.timesheetDetails.set(id, detail);
    return detail;
  }
  
  async updateTimesheetDetail(id: number, detailData: Partial<InsertTimesheetDetail>): Promise<TimesheetDetail | undefined> {
    const detail = this.timesheetDetails.get(id);
    if (!detail) return undefined;
    
    const updatedDetail: TimesheetDetail = { ...detail, ...detailData };
    this.timesheetDetails.set(id, updatedDetail);
    return updatedDetail;
  }
  
  async deleteTimesheetDetail(id: number): Promise<boolean> {
    return this.timesheetDetails.delete(id);
  }
  
  // Activity Log methods
  async getAllActivityLogs(): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getRecentActivityLogs(limit: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogIdCounter++;
    const log: ActivityLog = { 
      ...insertLog, 
      id,
      timestamp: new Date()
    };
    this.activityLogs.set(id, log);
    return log;
  }
  
  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      task => task.assignedTo === userId
    );
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = { 
      ...insertTask, 
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  async completeTask(id: number): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const completedTask: Task = { 
      ...task, 
      status: "completed",
      completedAt: new Date()
    };
    this.tasks.set(id, completedTask);
    return completedTask;
  }
}

export const storage = new MemStorage();
