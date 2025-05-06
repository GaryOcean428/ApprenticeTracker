import { db } from '../db';
import { penaltyRules } from '../../shared/schema';

/**
 * Seed the database with test penalty rate rules for Fair Work awards
 */
export async function createTestPenaltyRates() {
  console.log('Creating test penalty rules...');
  
  // Check if we already have penalty rules
  const existingRules = await db.select().from(penaltyRules);
  
  if (existingRules.length > 0) {
    console.log(`Found ${existingRules.length} existing penalty rules. Skipping seeding.`);
    return;
  }

  // Building and Construction Award (ID 1) penalties
  const buildingPenalties = [
    {
      awardId: 1,
      penaltyName: 'Weekend - Saturday',
      penaltyType: 'weekend',
      multiplier: 1.5, // 50% loading
      daysOfWeek: [6], // Saturday
      notes: 'Saturday work penalty for Building and Construction Award'
    },
    {
      awardId: 1,
      penaltyName: 'Weekend - Sunday',
      penaltyType: 'weekend',
      multiplier: 2.0, // 100% loading
      daysOfWeek: [0], // Sunday (0 = Sunday in JavaScript Date objects)
      notes: 'Sunday work penalty for Building and Construction Award'
    },
    {
      awardId: 1,
      penaltyName: 'Public Holiday',
      penaltyType: 'public_holiday',
      multiplier: 2.5, // 150% loading
      notes: 'Public holiday penalty for Building and Construction Award'
    },
    {
      awardId: 1,
      penaltyName: 'Overtime - First 2 Hours',
      penaltyType: 'overtime',
      multiplier: 1.5, // 50% loading
      notes: 'First 2 hours of overtime penalty - Building and Construction Award'
    },
    {
      awardId: 1,
      penaltyName: 'Overtime - After 2 Hours',
      penaltyType: 'overtime',
      multiplier: 2.0, // 100% loading
      notes: 'After 2 hours of overtime penalty - Building and Construction Award'
    }
  ];

  // Create Building and Construction Award penalties
  try {
    await Promise.all(buildingPenalties.map(penalty => {
      return db.insert(penaltyRules).values({
        awardId: penalty.awardId,
        penaltyName: penalty.penaltyName,
        penaltyType: penalty.penaltyType,
        multiplier: penalty.multiplier,
        daysOfWeek: penalty.daysOfWeek ? JSON.stringify(penalty.daysOfWeek) : null,
        startTime: penalty.startTime || null,
        endTime: penalty.endTime || null,
        notes: penalty.notes
      });
    }));
    console.log(`Created ${buildingPenalties.length} penalty rules for Building and Construction Award`);
  } catch (error) {
    console.error('Error creating Building and Construction Award penalty rules:', error);
  }

  // Manufacturing Award (ID 3) penalties
  const manufacturingPenalties = [
    {
      awardId: 3,
      penaltyName: 'Weekend - Saturday (First 3 hours)',
      penaltyType: 'weekend',
      multiplier: 1.5, // 50% loading
      daysOfWeek: [6], // Saturday
      notes: 'Saturday work penalty (first 3 hours) for Manufacturing Award'
    },
    {
      awardId: 3,
      penaltyName: 'Weekend - Saturday (After 3 hours)',
      penaltyType: 'weekend',
      multiplier: 2.0, // 100% loading
      daysOfWeek: [6], // Saturday
      notes: 'Saturday work penalty (after 3 hours) for Manufacturing Award'
    },
    {
      awardId: 3,
      penaltyName: 'Weekend - Sunday',
      penaltyType: 'weekend',
      multiplier: 2.0, // 100% loading
      daysOfWeek: [0], // Sunday
      notes: 'Sunday work penalty for Manufacturing Award'
    },
    {
      awardId: 3,
      penaltyName: 'Public Holiday',
      penaltyType: 'public_holiday',
      multiplier: 2.5, // 150% loading
      notes: 'Public holiday penalty for Manufacturing Award'
    },
    {
      awardId: 3,
      penaltyName: 'Night Shift',
      penaltyType: 'evening_shift',
      multiplier: 1.15, // 15% loading
      startTime: '18:00',
      endTime: '06:00',
      notes: 'Night shift penalty for Manufacturing Award'
    }
  ];
  
  // Create Manufacturing Award penalties
  try {
    await Promise.all(manufacturingPenalties.map(penalty => {
      return db.insert(penaltyRules).values({
        awardId: penalty.awardId,
        penaltyName: penalty.penaltyName,
        penaltyType: penalty.penaltyType,
        multiplier: penalty.multiplier,
        daysOfWeek: penalty.daysOfWeek ? JSON.stringify(penalty.daysOfWeek) : null,
        startTime: penalty.startTime || null,
        endTime: penalty.endTime || null,
        notes: penalty.notes
      });
    }));
    console.log(`Created ${manufacturingPenalties.length} penalty rules for Manufacturing Award`);
  } catch (error) {
    console.error('Error creating Manufacturing Award penalty rules:', error);
  }

  // Hospitality Award (ID 6) penalties
  const hospitalityPenalties = [
    {
      awardId: 6,
      penaltyName: 'Weekend - Saturday',
      penaltyType: 'weekend',
      multiplier: 1.25, // 25% loading
      daysOfWeek: [6], // Saturday
      notes: 'Saturday work penalty for Hospitality Award'
    },
    {
      awardId: 6,
      penaltyName: 'Weekend - Sunday',
      penaltyType: 'weekend',
      multiplier: 1.5, // 50% loading
      daysOfWeek: [0], // Sunday
      notes: 'Sunday work penalty for Hospitality Award'
    },
    {
      awardId: 6,
      penaltyName: 'Public Holiday',
      penaltyType: 'public_holiday',
      multiplier: 2.25, // 125% loading
      notes: 'Public holiday penalty for Hospitality Award'
    },
    {
      awardId: 6,
      penaltyName: 'Evening Work (Mon-Fri)',
      penaltyType: 'evening_shift',
      multiplier: 1.1, // 10% loading
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '19:00',
      endTime: '24:00',
      notes: 'Evening work penalty for Hospitality Award (Monday to Friday)'
    },
    {
      awardId: 6,
      penaltyName: 'Overnight Work (Mon-Fri)',
      penaltyType: 'night_shift',
      multiplier: 1.15, // 15% loading
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '00:00',
      endTime: '06:00',
      notes: 'Overnight work penalty for Hospitality Award (Monday to Friday)'
    }
  ];
  
  // Create Hospitality Award penalties
  try {
    await Promise.all(hospitalityPenalties.map(penalty => {
      return db.insert(penaltyRules).values({
        awardId: penalty.awardId,
        penaltyName: penalty.penaltyName,
        penaltyType: penalty.penaltyType,
        multiplier: penalty.multiplier,
        daysOfWeek: penalty.daysOfWeek ? JSON.stringify(penalty.daysOfWeek) : null,
        startTime: penalty.startTime || null,
        endTime: penalty.endTime || null,
        notes: penalty.notes
      });
    }));
    console.log(`Created ${hospitalityPenalties.length} penalty rules for Hospitality Award`);
  } catch (error) {
    console.error('Error creating Hospitality Award penalty rules:', error);
  }

  const totalPenalties = buildingPenalties.length + manufacturingPenalties.length + hospitalityPenalties.length;
  console.log(`Successfully created ${totalPenalties} penalty rules`);
}
