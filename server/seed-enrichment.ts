import { db } from './db';
import { enrichmentPrograms, enrichmentParticipants, enrichmentWorkshops, workshopAttendees } from '@shared/schema';
import { sql } from 'drizzle-orm';

/**
 * Seeds the database with sample enrichment program data
 */
export async function seedEnrichmentData() {
  console.log('Seeding Enrichment Program data...');
  
  try {
    // Check if enrichment data already exists
    const [programCount] = await db
      .select({ count: sql`count(*)` })
      .from(enrichmentPrograms);
    
    if (programCount && programCount.count && parseInt(programCount.count.toString()) > 0) {
      console.log('Enrichment Program data already seeded. Skipping...');
      return;
    }
    
    // Seed enrichment programs
    const programs = [
      {
        name: 'Leadership Development',
        description: 'A comprehensive program focused on developing leadership skills for senior apprentices preparing for supervisory roles. Includes modules on communication, conflict resolution, and team management.',
        category: 'professional development',
        status: 'active',
        startDate: '2025-06-01',
        endDate: '2025-08-30',
        tags: ['leadership', 'communication', 'management'],
        facilitator: 'Sarah Johnson',
        location: 'Main Training Center',
        maxParticipants: 20,
        cost: 1500.00,
        fundingSource: 'GTO Development Grant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Safety First Workshop Series',
        description: 'Essential safety training tailored for construction apprentices. Covers workplace hazards, proper equipment usage, and emergency procedures.',
        category: 'safety',
        status: 'upcoming',
        startDate: '2025-07-15',
        endDate: '2025-07-30',
        tags: ['safety', 'construction', 'certification'],
        facilitator: 'Michael Thompson',
        location: 'Safety Training Facility',
        maxParticipants: 30,
        cost: 800.00,
        fundingSource: 'Workplace Safety Fund',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Digital Skills Bootcamp',
        description: 'Intensive training on essential digital tools and software used in modern workplaces. Includes sessions on office productivity software, communication tools, and basic coding concepts.',
        category: 'technical',
        status: 'active',
        startDate: '2025-05-10',
        endDate: '2025-06-15',
        tags: ['digital', 'technology', 'software'],
        facilitator: 'Alex Chen',
        location: 'Tech Hub',
        maxParticipants: 25,
        cost: 1200.00,
        fundingSource: 'Digital Transformation Grant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Professional Communication Skills',
        description: 'A focused program on developing effective verbal and written communication skills for the workplace. Includes presentation techniques, email etiquette, and client interaction strategies.',
        category: 'soft skills',
        status: 'completed',
        startDate: '2025-03-01',
        endDate: '2025-04-15',
        tags: ['communication', 'presentations', 'workplace'],
        facilitator: 'Emily Roberts',
        location: 'Conference Center',
        maxParticipants: 20,
        cost: 900.00,
        fundingSource: 'Apprentice Development Fund',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        name: 'Financial Literacy for Apprentices',
        description: 'Essential financial education for young professionals. Covers budgeting, saving strategies, tax basics, and planning for future career advancement.',
        category: 'life skills',
        status: 'upcoming',
        startDate: '2025-08-10',
        endDate: '2025-08-31',
        tags: ['finance', 'budgeting', 'career planning'],
        facilitator: 'David Wilson',
        location: 'Community Center',
        maxParticipants: 40,
        cost: 500.00,
        fundingSource: 'Financial Education Grant',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Insert programs and get the inserted programs with IDs
    const insertedPrograms = await db.insert(enrichmentPrograms).values(programs).returning();
    console.log(`Created ${insertedPrograms.length} enrichment programs`);
    
    // Seed program participants - use actual apprentice IDs from the database
    const apprentices = await db.query.apprentices.findMany({ limit: 10 });
    
    if (apprentices.length > 0) {
      // Create participants for various programs
      const participants = [];
      
      // Add participants to the leadership program (first program)
      apprentices.slice(0, 5).forEach(apprentice => {
        participants.push({
          programId: insertedPrograms[0].id,
          apprenticeId: apprentice.id,
          enrollmentDate: '2025-05-15',
          status: 'enrolled',
          completionDate: null,
          feedback: null,
          rating: null,
          notes: 'Enrolled through field officer recommendation',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      
      // Add participants to the digital skills program (third program)
      apprentices.slice(3, 8).forEach(apprentice => {
        participants.push({
          programId: insertedPrograms[2].id,
          apprenticeId: apprentice.id,
          enrollmentDate: '2025-05-01',
          status: 'enrolled',
          completionDate: null,
          feedback: null,
          rating: null,
          notes: 'Self-enrolled through portal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      
      // Add completed participants for the communication skills program (fourth program)
      apprentices.slice(1, 7).forEach(apprentice => {
        participants.push({
          programId: insertedPrograms[3].id,
          apprenticeId: apprentice.id,
          enrollmentDate: '2025-02-20',
          status: 'completed',
          completionDate: '2025-04-15',
          feedback: 'Very helpful program with practical skills I can use at work immediately',
          rating: 4,
          notes: 'Finished all modules and presented final project',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      
      const insertedParticipants = await db.insert(enrichmentParticipants).values(participants).returning();
      console.log(`Created ${insertedParticipants.length} program participants`);
      
      // Seed workshops for the safety program (second program)
      const safetyWorkshops = [
        {
          programId: insertedPrograms[1].id,
          name: 'Workplace Hazard Identification',
          description: 'Learn to identify common workplace hazards in construction environments and implement proper risk mitigation strategies.',
          workshopDate: '2025-07-15',
          startTime: '09:00',
          endTime: '12:00',
          location: 'Safety Training Room A',
          facilitator: 'Michael Thompson',
          maxAttendees: 20,
          notes: 'Includes practical exercises and site walk-through',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          programId: insertedPrograms[1].id,
          name: 'Personal Protective Equipment',
          description: 'Comprehensive overview of PPE requirements, proper usage, maintenance, and when different types of protection are required by law.',
          workshopDate: '2025-07-20',
          startTime: '09:00',
          endTime: '15:00',
          location: 'Safety Training Room B',
          facilitator: 'James Wilson',
          maxAttendees: 30,
          notes: 'Equipment will be provided for hands-on practice',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          programId: insertedPrograms[1].id,
          name: 'Emergency Response Procedures',
          description: 'Training on proper responses to workplace emergencies including injuries, fires, structural issues, and evacuation protocols.',
          workshopDate: '2025-07-25',
          startTime: '09:00',
          endTime: '13:00',
          location: 'Safety Training Center',
          facilitator: 'Michael Thompson',
          maxAttendees: 30,
          notes: 'Includes first aid certification component',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          programId: insertedPrograms[1].id,
          name: 'Safety Certification Exam',
          description: 'Final assessment for the Safety First Workshop Series. Successful completion results in a recognized safety certification.',
          workshopDate: '2025-07-30',
          startTime: '10:00',
          endTime: '12:00',
          location: 'Testing Center',
          facilitator: 'Michael Thompson',
          maxAttendees: 30,
          notes: 'Bring identification and arrive 15 minutes early',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      const insertedWorkshops = await db.insert(enrichmentWorkshops).values(safetyWorkshops).returning();
      console.log(`Created ${insertedWorkshops.length} workshops`);
      
      // Register some apprentices for the workshops
      const workshopRegistrations = [];
      
      // Register apprentices for the first workshop
      apprentices.slice(0, 5).forEach(apprentice => {
        workshopRegistrations.push({
          workshopId: insertedWorkshops[0].id,
          apprenticeId: apprentice.id,
          status: 'registered',
          registrationDate: '2025-06-01',
          feedback: null,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      
      // Register apprentices for the second workshop
      apprentices.slice(2, 7).forEach(apprentice => {
        workshopRegistrations.push({
          workshopId: insertedWorkshops[1].id,
          apprenticeId: apprentice.id,
          status: 'registered',
          registrationDate: '2025-06-05',
          feedback: null,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      
      const insertedRegistrations = await db.insert(workshopAttendees).values(workshopRegistrations).returning();
      console.log(`Created ${insertedRegistrations.length} workshop registrations`);
    }
    
    console.log('Enrichment Program data seeding completed successfully');
    return true;
  } catch (error) {
    console.error('Error seeding enrichment program data:', error);
    return false;
  }
}
