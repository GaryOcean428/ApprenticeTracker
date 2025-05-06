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
    for (const penalty of buildingPenalties) {
      await db.insert(penaltyRules).values(penalty);
    }
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
    for (const penalty of manufacturingPenalties) {
      await db.insert(penaltyRules).values(penalty);
    }
    console.log(`Created ${manufacturingPenalties.length} penalty rules for Manufacturing Award`);
  } catch (error) {
    console.error('Error creating Manufacturing Award penalty rules:', error);
  }

  // Hospitality Award (ID 6) penalties
  const hospitalityPenalties = [
    {
      awardId: 6,
      name: 'Weekend - Saturday',
      description: 'Saturday work penalty for Hospitality Award',
      appliesTo: 'all',
      applyWhen: '{"dayOfWeek": 6}',
      penaltyType: 'percentage',
      penaltyValue: 25,
      isActive: true
    },
    {
      awardId: 6,
      name: 'Weekend - Sunday',
      description: 'Sunday work penalty for Hospitality Award',
      appliesTo: 'all',
      applyWhen: '{"dayOfWeek": 0}',
      penaltyType: 'percentage',
      penaltyValue: 50,
      isActive: true
    },
    {
      awardId: 6,
      name: 'Public Holiday',
      description: 'Public holiday penalty for Hospitality Award',
      appliesTo: 'all',
      applyWhen: '{"isPublicHoliday": true}',
      penaltyType: 'percentage',
      penaltyValue: 125,
      isActive: true
    },
    {
      awardId: 6,
      name: 'Evening Work (Mon-Fri)',
      description: 'Evening work penalty for Hospitality Award (Monday to Friday)',
      appliesTo: 'all',
      applyWhen: '{"dayOfWeek": [1, 2, 3, 4, 5], "timeOfDay": {"startHour": 19, "endHour": 24}}',
      penaltyType: 'percentage',
      penaltyValue: 10,
      isActive: true
    },
    {
      awardId: 6,
      name: 'Overnight Work (Mon-Fri)',
      description: 'Overnight work penalty for Hospitality Award (Monday to Friday)',
      appliesTo: 'all',
      applyWhen: '{"dayOfWeek": [1, 2, 3, 4, 5], "timeOfDay": {"startHour": 0, "endHour": 6}}',
      penaltyType: 'percentage',
      penaltyValue: 15,
      isActive: true
    }
  ];
  
  // Create Hospitality Award penalties
  try {
    for (const penalty of hospitalityPenalties) {
      await db.insert(penaltyRules).values(penalty);
    }
    console.log(`Created ${hospitalityPenalties.length} penalty rules for Hospitality Award`);
  } catch (error) {
    console.error('Error creating Hospitality Award penalty rules:', error);
  }

  const totalPenalties = buildingPenalties.length + manufacturingPenalties.length + hospitalityPenalties.length;
  console.log(`Successfully created ${totalPenalties} penalty rules`);
}
