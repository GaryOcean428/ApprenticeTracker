import { db } from './db';
import { gtoComplianceStandards } from '@shared/schema';
import { InsertGtoComplianceStandard } from '@shared/schema';

/**
 * Seeds the GTO Compliance Standards from the Australian National Standards for GTOs
 */
export async function seedGtoComplianceStandards() {
  console.log('Seeding GTO Compliance Standards...');

  try {
    // Check if the standards have already been seeded
    const existingStandards = await db.select().from(gtoComplianceStandards);

    if (existingStandards.length > 0) {
      console.log('GTO Compliance Standards already seeded. Skipping...');
      return;
    }

    // Define the Australian National Standards for GTOs
    const standards: InsertGtoComplianceStandard[] = [
      {
        standardNumber: '1.1',
        standardName: 'Recruitment, Employment and Induction',
        standardDescription:
          'The GTO recruits, employs and inducts apprentices and trainees in accordance with government requirements, funding arrangements, modern awards and legislative requirements.',
        category: 'Recruitment',
        requiredEvidence: [
          'Recruitment policies and procedures',
          'Employment contracts',
          'Induction materials and checklists',
          'Modern award compliance documents',
        ],
      },
      {
        standardNumber: '1.2',
        standardName: 'Monitoring and Supporting Apprentices and Trainees',
        standardDescription:
          'The GTO provides services that meet the individual needs of apprentices and trainees to facilitate the continuity of the training contract to completion and the quality and breadth of the training experience.',
        category: 'Monitoring',
        requiredEvidence: [
          'Training plans',
          'Contact records with apprentices',
          'Support service records',
          'Performance reviews',
        ],
      },
      {
        standardNumber: '1.3',
        standardName: "GTO's Relationships with Host Employers",
        standardDescription:
          'The GTO develops and monitors host employer arrangements to ensure that host employers provide a safe and supportive environment for apprentices and trainees.',
        category: 'Monitoring',
        requiredEvidence: [
          'Host employer agreements',
          'WHS assessment records',
          'Host employer induction materials',
          'Host monitoring records',
        ],
      },
      {
        standardNumber: '2.1',
        standardName: 'Compliance with Legislative Requirements and Government Initiatives',
        standardDescription:
          'The GTO complies with Commonwealth, State and Territory legislation, regulatory requirements, and initiatives relevant to GTOs, apprentices, trainees and host employers.',
        category: 'Governance',
        requiredEvidence: [
          'Compliance register',
          'Policy documents',
          'Statutory declarations',
          'Registration documents',
        ],
      },
      {
        standardNumber: '2.2',
        standardName: 'Governance and Administration',
        standardDescription:
          'The GTO is well governed and administers its operations soundly to provide quality services to apprentices, trainees and host employers.',
        category: 'Governance',
        requiredEvidence: [
          'Organizational structure',
          'Strategic and business plans',
          'Financial viability statements',
          'Insurance certificates',
        ],
      },
      {
        standardNumber: '2.3',
        standardName: 'GTO Performance Management and Continuous Improvement',
        standardDescription:
          'The GTO monitors and continually improves its performance using good practices for the management and operations of a GTO.',
        category: 'Governance',
        requiredEvidence: [
          'Performance monitoring reports',
          'Client feedback records',
          'Continuous improvement register',
          'Staff training records',
        ],
      },
      {
        standardNumber: '3.1',
        standardName: 'Joint Responsibilities of RTOs and GTOs',
        standardDescription:
          "The GTO works with the nominated RTO to provide a coordinated approach to the development and delivery of training that meets the apprentice's or trainee's needs.",
        category: 'Monitoring',
        requiredEvidence: [
          'RTO agreements',
          'Training plan reviews',
          'Coordination meeting records',
          'Training progress reports',
        ],
      },
      {
        standardNumber: '3.2',
        standardName: 'Complaints and Appeals Management',
        standardDescription:
          'The GTO has established processes to effectively manage complaints and appeals.',
        category: 'Governance',
        requiredEvidence: [
          'Complaints policy',
          'Appeals policy',
          'Complaint register',
          'Resolution records',
        ],
      },
      {
        standardNumber: '3.3',
        standardName: 'Access and Equity',
        standardDescription:
          'The GTO implements the principles of access and equity and maximizes outcomes for apprentices and trainees.',
        category: 'Governance',
        requiredEvidence: [
          'Access and equity policy',
          'Support service records',
          'Demographic participation data',
          'Reasonable adjustment records',
        ],
      },
      {
        standardNumber: '3.4',
        standardName: 'Marketing and Information',
        standardDescription:
          'The GTO provides clear, accurate and truthful information to prospective apprentices, trainees and host employers.',
        category: 'Recruitment',
        requiredEvidence: [
          'Marketing materials',
          'Information disclosure documents',
          'Website content',
          'Information accuracy reviews',
        ],
      },
    ];

    // Insert the standards
    const insertedStandards = await db.insert(gtoComplianceStandards).values(standards).returning();

    console.log(`Successfully seeded ${insertedStandards.length} GTO Compliance Standards`);
  } catch (error) {
    console.error('Error seeding GTO Compliance Standards:', error);
    throw error;
  }
}
