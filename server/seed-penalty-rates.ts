import { createTestPenaltyRates } from './seeds/create-test-penalty-rates';

/**
 * Run this script to seed the database with test penalty rates
 */
async function main() {
  try {
    console.log('Starting penalty rates seeding...');
    await createTestPenaltyRates();
    console.log('Penalty rates seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding penalty rates:', error);
    process.exit(1);
  }
}

main();
