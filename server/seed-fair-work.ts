import { db } from "./db";
import { awards, awardClassifications, enterpriseAgreements } from "@shared/schema";

/**
 * Seeds the database with sample Fair Work data (awards, classifications, etc.)
 */
export async function seedFairWorkData() {
  console.log("Seeding Fair Work data...");
  
  // Check if awards exist already
  const existingAwards = await db.select({ count: { value: awards.id } }).from(awards);
  const existingEAs = await db.select({ count: { value: enterpriseAgreements.id } }).from(enterpriseAgreements);
  
  if (existingAwards[0]?.count.value > 0 && existingEAs[0]?.count.value > 0) {
    console.log("Fair Work data already seeded. Skipping...");
    return;
  }

  // Sample awards
  const sampleAwards = [
    {
      name: "Building and Construction General On-site Award",
      code: "MA000020",
      fairWorkReference: "MA000020",
      fairWorkTitle: "Building and Construction General On-site Award 2020",
      description: "Covers employers in on-site building, engineering and civil construction industries and their employees.",
      effectiveDate: new Date("2020-11-01"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Clerks Private Sector Award",
      code: "MA000002",
      fairWorkReference: "MA000002",
      fairWorkTitle: "Clerks Private Sector Award 2020",
      description: "Covers employers in the private sector who employ clerical and administrative employees.",
      effectiveDate: new Date("2020-11-01"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Manufacturing and Associated Industries Award",
      code: "MA000010",
      fairWorkReference: "MA000010",
      fairWorkTitle: "Manufacturing and Associated Industries and Occupations Award 2020",
      description: "Covers employers in manufacturing and associated industries and their employees.",
      effectiveDate: new Date("2020-11-01"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Electrical, Electronic and Communications Contracting Award",
      code: "MA000025",
      fairWorkReference: "MA000025",
      fairWorkTitle: "Electrical, Electronic and Communications Contracting Award 2020",
      description: "Covers employers in electrical, electronic and communications contracting industry and their employees.",
      effectiveDate: new Date("2020-11-01"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Graphic Arts, Printing and Publishing Award",
      code: "MA000026",
      fairWorkReference: "MA000026",
      fairWorkTitle: "Graphic Arts, Printing and Publishing Award 2020",
      description: "Covers employers in the graphic arts, printing and publishing industries and their employees.",
      effectiveDate: new Date("2020-11-01"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Hospitality Industry Award",
      code: "MA000009",
      fairWorkReference: "MA000009",
      fairWorkTitle: "Hospitality Industry (General) Award 2020",
      description: "Covers employers in the hospitality industry and their employees.",
      effectiveDate: new Date("2020-11-01"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  ];

  // Insert awards
  for (const award of sampleAwards) {
    const inserted = await db.insert(awards).values(award).returning();
    console.log(`Award created: ${inserted[0].name} (ID: ${inserted[0].id})`);
    
    // Add some classifications for each award
    if (inserted[0].id) {
      const awardId = inserted[0].id;
      
      // Different classification levels based on award type
      let classifications = [];
      
      if (award.code === "MA000020") { // Building and Construction
        classifications = [
          { level: "Level 1", name: "CW1 - Labourer", minHourlyRate: 22.76 },
          { level: "Level 2", name: "CW2 - Trades Assistant", minHourlyRate: 23.67 },
          { level: "Level 3", name: "CW3 - Concrete Finisher", minHourlyRate: 24.53 },
          { level: "Level 4", name: "CW4 - Form Worker", minHourlyRate: 25.62 },
          { level: "Level 5", name: "CW5 - Carpenter", minHourlyRate: 26.42 },
          { level: "Level 6", name: "CW6 - Advanced Carpenter", minHourlyRate: 27.25 },
          { level: "Level 7", name: "CW7 - Special Class Tradesperson", minHourlyRate: 28.12 },
          { level: "Level 8", name: "CW8 - Dual Trade Qualified", minHourlyRate: 29.25 },
        ];
      } else if (award.code === "MA000002") { // Clerks Private Sector
        classifications = [
          { level: "Level 1", name: "Year 1", minHourlyRate: 21.54 },
          { level: "Level 1", name: "Year 2", minHourlyRate: 22.70 },
          { level: "Level 1", name: "Year 3", minHourlyRate: 23.39 },
          { level: "Level 2", name: "Year 1", minHourlyRate: 23.67 },
          { level: "Level 2", name: "Year 2", minHourlyRate: 24.11 },
          { level: "Level 3", name: "General Clerk", minHourlyRate: 25.25 },
          { level: "Level 4", name: "Administrative Officer", minHourlyRate: 26.40 },
          { level: "Level 5", name: "Senior Administrative Officer", minHourlyRate: 27.50 },
        ];
      } else if (award.code === "MA000010") { // Manufacturing
        classifications = [
          { level: "C14", name: "Engineering/Production Employee Level I", minHourlyRate: 21.33 },
          { level: "C13", name: "Engineering/Production Employee Level II", minHourlyRate: 22.10 },
          { level: "C12", name: "Engineering/Production Employee Level III", minHourlyRate: 23.33 },
          { level: "C11", name: "Engineering/Production Employee Level IV", minHourlyRate: 24.12 },
          { level: "C10", name: "Engineering Tradesperson Level I", minHourlyRate: 25.79 },
          { level: "C9", name: "Engineering Tradesperson Level II", minHourlyRate: 26.73 },
          { level: "C8", name: "Engineering Tradesperson Special Class Level I", minHourlyRate: 27.62 },
          { level: "C7", name: "Engineering Tradesperson Special Class Level II", minHourlyRate: 28.39 },
        ];
      } else {
        // Generic classifications for other awards
        classifications = [
          { level: "Level 1", name: "Entry Level", minHourlyRate: 21.38 },
          { level: "Level 2", name: "Intermediate", minHourlyRate: 22.70 },
          { level: "Level 3", name: "Experienced", minHourlyRate: 24.40 },
          { level: "Level 4", name: "Advanced", minHourlyRate: 25.62 },
          { level: "Level 5", name: "Specialist", minHourlyRate: 26.98 },
        ];
      }
      
      for (const classification of classifications) {
        await db.insert(awardClassifications).values({
          awardId,
          level: classification.level,
          name: classification.name,
          minHourlyRate: classification.minHourlyRate,
          description: `Classification for ${award.name}`,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log(`Added ${classifications.length} classifications for award ID ${awardId}`);
    }
  }

  // Sample enterprise agreements
  const sampleEnterpriseAgreements = [
    {
      agreementName: "ABC Construction Enterprise Agreement",
      agreementCode: "EA2023-001",
      description: "Enterprise agreement for ABC Construction covering all construction trades and support staff.",
      effectiveDate: new Date("2023-01-01"),
      expiryDate: new Date("2026-12-31"),
      agreementStatus: "active",
      notes: "Includes special provisions for remote site work",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      agreementName: "XYZ Manufacturing Enterprise Agreement",
      agreementCode: "EA2022-045",
      description: "Enterprise agreement for XYZ Manufacturing covering production workers, maintenance, and warehouse staff.",
      effectiveDate: new Date("2022-07-01"),
      expiryDate: new Date("2025-06-30"),
      agreementStatus: "active",
      notes: "Includes productivity bonus structure",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      agreementName: "City Metro Services Agreement",
      agreementCode: "EA2021-112",
      description: "Enterprise agreement for City Metro Services covering administrative and customer service staff.",
      effectiveDate: new Date("2021-10-01"),
      expiryDate: new Date("2024-09-30"),
      agreementStatus: "active",
      notes: "Special allowances for inner city work",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      agreementName: "TechSolve IT Staff Agreement",
      agreementCode: "EA2023-089",
      description: "Enterprise agreement for TechSolve covering developers, analysts, and IT support staff.",
      effectiveDate: new Date("2023-03-15"),
      expiryDate: new Date("2026-03-14"),
      agreementStatus: "active",
      notes: "Includes flexible work arrangements and training provisions",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Insert enterprise agreements
  for (const agreement of sampleEnterpriseAgreements) {
    const inserted = await db.insert(enterpriseAgreements).values(agreement).returning();
    console.log(`Enterprise Agreement created: ${inserted[0].agreementName} (ID: ${inserted[0].id})`);
  }

  console.log("Fair Work data seeding completed!");
}
