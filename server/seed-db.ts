import { storage } from "./storage";
import { InsertUser, InsertApprentice, InsertHostEmployer, InsertTrainingContract, InsertPlacement, InsertDocument, InsertComplianceRecord, InsertTask, InsertActivityLog } from "@shared/schema";

// Helper function to convert JavaScript Date to ISO string (date part only)
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Seeds the database with initial sample data
 */
export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");
    
    // Create default roles if they don't exist
    console.log("Creating default roles...");
    let adminRoleId = 0;
    try {
      const existingAdminRole = await storage.getRoleByName("admin");
      if (existingAdminRole) {
        adminRoleId = existingAdminRole.id;
        console.log("Admin role already exists with ID:", adminRoleId);
      } else {
        const adminRole = await storage.createRole({
          name: "admin",
          description: "System administrator with full access",
          isSystem: true
        });
        adminRoleId = adminRole.id;
        console.log("Created admin role with ID:", adminRoleId);
      }

      // Create developer role if it doesn't exist
      const existingDevRole = await storage.getRoleByName("developer");
      if (!existingDevRole) {
        const devRole = await storage.createRole({
          name: "developer",
          description: "Platform-level developer with access to all organizations",
          isSystem: true
        });
        console.log("Created developer role with ID:", devRole.id);
      } else {
        console.log("Developer role already exists with ID:", existingDevRole.id);
      }
      
      // Other default roles
      const defaultRoles = [
        { name: "organization_admin", description: "Organization administrator", isSystem: true },
        { name: "field_officer", description: "Field officer for apprentice management", isSystem: true },
        { name: "host_employer", description: "Host employer representative", isSystem: true },
        { name: "apprentice", description: "Apprentice or trainee", isSystem: true },
        { name: "rto_admin", description: "RTO/TAFE administrator", isSystem: true }
      ];
      
      for (const roleData of defaultRoles) {
        const existingRole = await storage.getRoleByName(roleData.name);
        if (!existingRole) {
          const role = await storage.createRole(roleData);
          console.log(`Created ${roleData.name} role with ID:`, role.id);
        } else {
          console.log(`${roleData.name} role already exists with ID:`, existingRole.id);
        }
      }
    } catch (error) {
      console.error("Error creating default roles:", error);
    }
    
    // Add admin user
    const adminUser: InsertUser = {
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      email: "admin@crm7.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      roleId: adminRoleId, // Use the admin role ID
      profileImage: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&ixid=eyJhcHBfaWQiOjE3Nzg0fQ"
    };
    
    const admin = await storage.createUser(adminUser);
    console.log("Admin user created:", admin.id);
    
    // Add sample apprentices
    const apprentices: InsertApprentice[] = [
      {
        userId: admin.id,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        phone: "123-456-7890",
        dateOfBirth: "1995-05-15",
        trade: "Electrical",
        status: "active",
        profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        progress: 75,
        startDate: formatDate(new Date("2023-01-15")),
        endDate: formatDate(new Date("2026-01-15")),
        notes: "Excellent progress in technical skills",
      },
      {
        userId: null,
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.j@example.com",
        phone: "123-456-7891",
        dateOfBirth: "1998-08-22",
        trade: "Carpentry",
        status: "active",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        progress: 45,
        startDate: formatDate(new Date("2023-03-10")),
        endDate: formatDate(new Date("2026-03-10")),
        notes: "Needs improvement in time management",
      },
      {
        userId: null,
        firstName: "Michael",
        lastName: "Chen",
        email: "m.chen@example.com",
        phone: "123-456-7892",
        dateOfBirth: "1997-11-30",
        trade: "IT Support",
        status: "active",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        progress: 90,
        startDate: formatDate(new Date("2022-09-05")),
        endDate: formatDate(new Date("2025-09-05")),
        notes: "Excellent technical skills",
      },
      {
        userId: null,
        firstName: "David",
        lastName: "Wilson",
        email: "d.wilson@example.com",
        phone: "123-456-7893",
        dateOfBirth: "1996-04-12",
        trade: "Plumbing",
        status: "on_hold",
        profileImage: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        progress: 30,
        startDate: formatDate(new Date("2023-02-20")),
        endDate: formatDate(new Date("2026-02-20")),
        notes: "Currently on hold due to personal reasons",
      }
    ];
    
    const createdApprentices = [];
    for (const apprentice of apprentices) {
      const created = await storage.createApprentice(apprentice);
      createdApprentices.push(created);
      console.log("Apprentice created:", created.id);
    }
    
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
    
    const createdHostEmployers = [];
    for (const hostEmployer of hostEmployers) {
      const created = await storage.createHostEmployer(hostEmployer);
      createdHostEmployers.push(created);
      console.log("Host employer created:", created.id);
    }
    
    // Add sample training contracts
    const contracts: InsertTrainingContract[] = [
      {
        apprenticeId: createdApprentices[0].id,
        contractNumber: "TC-2023-001",
        startDate: formatDate(new Date("2023-01-15")),
        endDate: formatDate(new Date("2026-01-15")),
        status: "active",
        documentUrl: "/documents/contracts/TC-2023-001.pdf",
        terms: {},
        approvedBy: "HR Manager",
        approvalDate: formatDate(new Date("2023-01-10")),
      },
      {
        apprenticeId: createdApprentices[1].id,
        contractNumber: "TC-2023-002",
        startDate: formatDate(new Date("2023-03-10")),
        endDate: formatDate(new Date("2026-03-10")),
        status: "active",
        documentUrl: "/documents/contracts/TC-2023-002.pdf",
        terms: {},
        approvedBy: "HR Manager",
        approvalDate: formatDate(new Date("2023-03-05")),
      },
      {
        apprenticeId: createdApprentices[2].id,
        contractNumber: "TC-2022-015",
        startDate: formatDate(new Date("2022-09-05")),
        endDate: formatDate(new Date("2025-09-05")),
        status: "active",
        documentUrl: "/documents/contracts/TC-2022-015.pdf",
        terms: {},
        approvedBy: "HR Manager",
        approvalDate: formatDate(new Date("2022-09-01")),
      },
      {
        apprenticeId: createdApprentices[3].id,
        contractNumber: "TC-2023-003",
        startDate: formatDate(new Date("2023-02-20")),
        endDate: formatDate(new Date("2026-02-20")),
        status: "on_hold",
        documentUrl: "/documents/contracts/TC-2023-003.pdf",
        terms: {},
        approvedBy: "HR Manager",
        approvalDate: formatDate(new Date("2023-02-15")),
      }
    ];
    
    const createdContracts = [];
    for (const contract of contracts) {
      const created = await storage.createTrainingContract(contract);
      createdContracts.push(created);
      console.log("Training contract created:", created.id);
    }
    
    // Add sample placements
    const placements: InsertPlacement[] = [
      {
        apprenticeId: createdApprentices[0].id,
        hostEmployerId: createdHostEmployers[0].id,
        startDate: formatDate(new Date("2023-01-20")),
        endDate: formatDate(new Date("2023-07-20")),
        status: "active",
        position: "Electrical Apprentice",
        supervisor: "Thomas Edison",
        supervisorContact: "t.edison@powertech.com",
        notes: "Performing well in all areas",
      },
      {
        apprenticeId: createdApprentices[1].id,
        hostEmployerId: createdHostEmployers[1].id,
        startDate: formatDate(new Date("2023-03-15")),
        endDate: formatDate(new Date("2023-09-15")),
        status: "active",
        position: "Carpentry Apprentice",
        supervisor: "Bob Builder",
        supervisorContact: "b.builder@buildwell.com",
        notes: "Needs more practice with advanced techniques",
      },
      {
        apprenticeId: createdApprentices[2].id,
        hostEmployerId: createdHostEmployers[2].id,
        startDate: formatDate(new Date("2022-09-10")),
        endDate: formatDate(new Date("2023-03-10")),
        status: "completed",
        position: "IT Support Apprentice",
        supervisor: "Ada Lovelace",
        supervisorContact: "a.lovelace@techsolutions.com",
        notes: "Excellent technical skills, completed ahead of schedule",
      },
      {
        apprenticeId: createdApprentices[2].id,
        hostEmployerId: createdHostEmployers[2].id,
        startDate: formatDate(new Date("2023-04-01")),
        endDate: formatDate(new Date("2023-10-01")),
        status: "active",
        position: "IT Support Apprentice - Advanced",
        supervisor: "Ada Lovelace",
        supervisorContact: "a.lovelace@techsolutions.com",
        notes: "Second placement with increased responsibilities",
      },
      {
        apprenticeId: createdApprentices[3].id,
        hostEmployerId: createdHostEmployers[3].id,
        startDate: formatDate(new Date("2023-02-25")),
        endDate: formatDate(new Date("2023-08-25")),
        status: "on_hold",
        position: "Plumbing Apprentice",
        supervisor: "Joe Plumber",
        supervisorContact: "j.plumber@flowmasters.com",
        notes: "Placement on hold due to apprentice personal circumstances",
      }
    ];
    
    for (const placement of placements) {
      const created = await storage.createPlacement(placement);
      console.log("Placement created:", created.id);
    }
    
    // Add sample documents
    const documents: InsertDocument[] = [
      {
        title: "Safety Manual v2.3",
        type: "safety",
        url: "/documents/safety/manual_v2.3.pdf",
        uploadedBy: admin.id,
        relatedTo: "system",
        relatedId: 0,
        expiryDate: null,
        status: "active",
      },
      {
        title: "Monthly Progress Report",
        type: "report",
        url: "/documents/reports/progress_report_202305.xlsx",
        uploadedBy: admin.id,
        relatedTo: "system",
        relatedId: 0,
        expiryDate: null,
        status: "active",
      },
      {
        title: "Contract Template",
        type: "template",
        url: "/documents/templates/contract_template.docx",
        uploadedBy: admin.id,
        relatedTo: "system",
        relatedId: 0,
        expiryDate: null,
        status: "active",
      }
    ];
    
    for (const document of documents) {
      const created = await storage.createDocument(document);
      console.log("Document created:", created.id);
    }
    
    // Add sample compliance records
    const complianceRecords: InsertComplianceRecord[] = [
      {
        type: "safety",
        relatedTo: "host",
        relatedId: createdHostEmployers[3].id,
        status: "pending",
        dueDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
        completionDate: null,
        notes: "Workplace safety assessment due",
      },
      {
        type: "document",
        relatedTo: "apprentice",
        relatedId: createdApprentices[1].id,
        status: "non-compliant",
        dueDate: formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
        completionDate: null,
        notes: "Updated certifications required",
      },
      {
        type: "contract",
        relatedTo: "apprentice",
        relatedId: createdApprentices[0].id,
        status: "compliant",
        dueDate: formatDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)), // 10 days ago
        completionDate: formatDate(new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)), // 12 days ago
        notes: "Annual contract review completed",
      }
    ];
    
    for (const record of complianceRecords) {
      const created = await storage.createComplianceRecord(record);
      console.log("Compliance record created:", created.id);
    }
    
    // Add sample tasks
    const tasks: InsertTask[] = [
      {
        title: "Review new apprentice applications",
        description: "Review and process the applications received this week",
        assignedTo: admin.id,
        dueDate: formatDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), // 2 days from now
        priority: "high",
        status: "pending",
        relatedTo: null,
        relatedId: null,
        createdBy: admin.id,
      },
      {
        title: "Schedule safety training for hosts",
        description: "Set up the quarterly safety training session for host employers",
        assignedTo: admin.id,
        dueDate: formatDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)), // 10 days from now
        priority: "medium",
        status: "pending",
        relatedTo: null,
        relatedId: null,
        createdBy: admin.id,
      },
      {
        title: "Update compliance documentation",
        description: "Ensure all compliance documents are up to date for the upcoming audit",
        assignedTo: admin.id,
        dueDate: formatDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)), // 5 days from now
        priority: "urgent",
        status: "in_progress",
        relatedTo: null,
        relatedId: null,
        createdBy: admin.id,
      }
    ];
    
    for (const task of tasks) {
      const created = await storage.createTask(task);
      console.log("Task created:", created.id);
    }
    
    // Add sample activity logs
    const activityLogs: InsertActivityLog[] = [
      {
        userId: admin.id,
        action: "created",
        relatedTo: "apprentice",
        relatedId: createdApprentices[0].id,
        details: { message: "Created new apprentice profile" },
      },
      {
        userId: admin.id,
        action: "updated",
        relatedTo: "host",
        relatedId: createdHostEmployers[2].id,
        details: { message: "Updated host employer contact information" },
      },
      {
        userId: admin.id,
        action: "created",
        relatedTo: "placement",
        relatedId: 1, // First placement ID
        details: { message: "Created new apprentice placement" },
      }
    ];
    
    for (const log of activityLogs) {
      const created = await storage.createActivityLog(log);
      console.log("Activity log created:", created.id);
    }
    
    console.log("Database seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
}