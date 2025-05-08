import { db } from '../server/db';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { hostEmployers } from '@shared/schema';
import { sql } from 'drizzle-orm';
import path from 'path';
import chalk from 'chalk';

interface CSVRecord {
  'Client ID': string;
  'Legal Name': string;
  'Client Name': string;
  'Branch': string;
  'Last Contact': string;
  'Client Type': string;
  'Industry Sectors': string;
  'Phone': string;
  'Account Manager': string;
  'Handler': string;
}

/**
 * Import host employers from CSV file
 */
async function importHostEmployers() {
  console.log(chalk.blue('Importing host employers from CSV...'));
  
  try {
    // Read the CSV file
    const filePath = path.resolve('./attached_assets/Search All Clients - Search All Clients.csv');
    const fileContent = readFileSync(filePath, { encoding: 'utf-8' });
    
    // Parse the CSV content
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as CSVRecord[];
    
    console.log(chalk.blue(`Found ${records.length} records in CSV`));
    
    // Check if we already have host employers in the database
    const existingCount = await db.select({ count: sql`count(*)::int` }).from(hostEmployers);
    const count = Number(existingCount[0]?.count || 0);
    
    if (count > 20) {
      console.log(chalk.yellow('Database already has host employers. Skipping import.'));
      return;
    }
    
    // Process the records and insert them into the database
    const hostEmployersData = records.map((record) => {
      // Map the CSV fields to the database schema
      return {
        name: record['Client Name'] || 'Unknown',
        industry: mapIndustry(record['Industry Sectors']),
        contactPerson: record['Handler'] || record['Account Manager'] || 'Unknown',
        email: generateEmail(record['Client Name']),
        phone: record['Phone'] || '',
        address: '',  // Not available in the CSV
        status: record['Client Type'] === 'Current' ? 'active' : 'inactive',
        safetyRating: Math.floor(Math.random() * 5) + 1,  // Random rating 1-5
        complianceStatus: 'pending',
        notes: `Imported from CSV. Branch: ${record['Branch'] || ''}`,
        organizationId: 1,  // Default organization ID
      };
    });
    
    // Insert the data in batches
    const batchSize = 50;
    for (let i = 0; i < hostEmployersData.length; i += batchSize) {
      const batch = hostEmployersData.slice(i, i + batchSize);
      await db.insert(hostEmployers).values(batch);
      console.log(chalk.green(`Inserted batch ${Math.floor(i / batchSize) + 1}`));
    }
    
    console.log(chalk.green(`Successfully imported ${hostEmployersData.length} host employers`));
  } catch (error) {
    console.error(chalk.red('Error importing host employers:'), error);
    throw error;
  }
}

/**
 * Map industry sector to a standard industry
 */
function mapIndustry(industrySector: string): string {
  const industries = [
    'Construction',
    'Manufacturing',
    'Electrical',
    'Plumbing',
    'Automotive',
    'Hospitality',
    'Retail',
    'Transport',
    'Mining',
    'Agriculture',
    'Education',
    'Healthcare',
  ];
  
  // If the industry sector is a number (like '2005'), use a default industry
  if (!isNaN(Number(industrySector))) {
    const index = Number(industrySector) % industries.length;
    return industries[index];
  }
  
  // Otherwise, try to map the industry sector to a standard industry
  for (const industry of industries) {
    if (industrySector?.toLowerCase().includes(industry.toLowerCase())) {
      return industry;
    }
  }
  
  // Default to Construction if we can't determine the industry
  return 'Construction';
}

/**
 * Generate an email address based on the client name
 */
function generateEmail(clientName: string): string {
  if (!clientName) return 'contact@example.com';
  
  // Remove special characters, replace spaces with dots
  const namePart = clientName
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '.')
    .toLowerCase();
  
  return `contact@${namePart}.com`;
}

// In ESM, we can check if the file was executed directly this way:
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

// Run the import function if this file is executed directly
if (isMainModule) {
  importHostEmployers()
    .then(() => {
      console.log(chalk.green('Import completed successfully!'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('Import failed:'), error);
      process.exit(1);
    });
}

export { importHostEmployers };