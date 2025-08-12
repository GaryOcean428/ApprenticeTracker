import { readFileSync } from 'fs';
import { join } from 'path';
import { contactTags, contacts, contactGroups, contactGroupMembers } from '@shared/schema';
import { parse } from 'csv-parse';
import chalk from 'chalk';
import { eq } from 'drizzle-orm';
import { db } from '../db';

/**
 * Seed contact tags in the system
 */
export async function seedContactTags() {
  try {
    console.log('[INFO] Seeding system contact tags...');

    // Check if contact tags already exist
    const existingTags = await db.select().from(contactTags).where(eq(contactTags.isSystem, true));

    if (existingTags.length > 0) {
      console.log('[INFO] System contact tags already exist. Skipping...');
      return;
    }

    // Define system tags
    const systemTags = [
      {
        name: 'Apprentice',
        description: 'Registered apprentice in training',
        color: '#3B82F6', // blue
        isSystem: true, // system tags cannot be deleted
      },
      {
        name: 'Trainee',
        description: 'Registered trainee in a training program',
        color: '#10B981', // green
        isSystem: true,
      },
      {
        name: 'Field Officer',
        description: 'Group training field officer',
        color: '#F59E0B', // amber
        isSystem: true,
      },
      {
        name: 'Host Employer',
        description: 'Primary contact at host employer',
        color: '#6366F1', // indigo
        isSystem: true,
      },
      {
        name: 'Supervisor',
        description: 'Day-to-day supervisor at work site',
        color: '#8B5CF6', // violet
        isSystem: true,
      },
      {
        name: 'Client',
        description: 'Client contact person',
        color: '#EC4899', // pink
        isSystem: true,
      },
      {
        name: 'Worker',
        description: 'Labour hire worker',
        color: '#F97316', // orange
        isSystem: true,
      },
      {
        name: 'RTO',
        description: 'Registered Training Organization contact',
        color: '#06B6D4', // cyan
        isSystem: true,
      },
      {
        name: 'Compliance',
        description: 'Compliance and regulatory contact',
        color: '#EF4444', // red
        isSystem: true,
      },
      {
        name: 'Support',
        description: 'Support services contact',
        color: '#14B8A6', // teal
        isSystem: true,
      },
    ];

    // Insert system tags
    await db.insert(contactTags).values(systemTags);

    console.log('[INFO] System contact tags seeded successfully');
  } catch (error) {
    console.error('[ERROR] Error seeding contact tags:', error);
  }
}

/**
 * Seed contact groups in the system
 */
export async function seedContactGroups() {
  try {
    console.log('[INFO] Seeding contact groups...');

    // Check if contact groups already exist
    const existingGroups = await db.select().from(contactGroups);

    if (existingGroups.length > 0) {
      console.log('[INFO] Contact groups already exist. Skipping...');
      return;
    }

    // Define default groups
    const defaultGroups = [
      {
        name: 'Apprentice Mentors',
        description: 'Contacts who serve as mentors for apprentices',
        createdBy: 1,
        isPrivate: false,
      },
      {
        name: 'Field Officers',
        description: 'Group of field officers for easy communication',
        createdBy: 1,
        isPrivate: false,
      },
      {
        name: 'Host Employer Contacts',
        description: 'Primary contacts at host employers',
        createdBy: 1,
        isPrivate: false,
      },
      {
        name: 'RTO Coordinators',
        description: 'Training coordinators at partner RTOs',
        createdBy: 1,
        isPrivate: false,
      },
      {
        name: 'Compliance Partners',
        description: 'Regulatory and compliance contacts',
        createdBy: 1,
        isPrivate: false,
      },
    ];

    // Insert default groups
    await db.insert(contactGroups).values(defaultGroups);

    console.log('[INFO] Contact groups seeded successfully');
  } catch (error) {
    console.error('[ERROR] Error seeding contact groups:', error);
  }
}

/**
 * Import contacts from the EmployeeDetail CSV file
 */
export async function importContactsFromEmployeeCSV() {
  try {
    console.log('[INFO] Importing contacts from employee CSV file...');

    // Check if contacts already exist
    const existingContacts = await db.select().from(contacts);

    if (existingContacts.length > 10) {
      console.log('[INFO] Contacts already imported. Skipping...');
      return;
    }

    // Read CSV file
    const csvFilePath = join(
      process.cwd(),
      'attached_assets',
      'EmployeeDetail - EmployeeDetail.csv'
    );
    const fileContent = readFileSync(csvFilePath, { encoding: 'utf-8' });

    // Parse CSV
    const records: any[] = await new Promise((resolve, reject) => {
      parse(
        fileContent,
        {
          columns: true,
          skip_empty_lines: true,
        },
        (err, records) => {
          if (err) reject(err);
          else resolve(records);
        }
      );
    });

    console.log(`[INFO] Found ${records.length} employee records in CSV`);

    // Take the first 50 records for initial import
    const contactsToImport = records.slice(0, 50).map(record => ({
      firstName: record.EMP_GIVENNAMES || 'Unknown',
      lastName: record.EMP_SURNAME || 'Unknown',
      displayName: record.EMPLOYEENAME || undefined,
      email:
        record.EMP_EMAIL ||
        `${record.EMP_GIVENNAMES?.toLowerCase() || 'unknown'}${record.EMP_SURNAME?.toLowerCase() || 'user'}@example.com`,
      phone: record.EMP_PHONE || undefined,
      mobile: record.EMP_MOBILE || undefined,
      address: record.EMPLOYEEADDRESS || undefined,
      city: undefined,
      state: record.EMP_TRAINEESHIPSTATE_KEY || undefined,
      postalCode: undefined,
      country: 'Australia',
      contactType: 'person',
      primaryRole:
        record.EMP_APPRENTICESHIP === 'T'
          ? 'apprentice'
          : record.EMP_TRAINEE === 'T'
            ? 'trainee'
            : 'worker',
      companyName: record.EMP_BUSINESSNAME || undefined,
      jobTitle: undefined,
      department: undefined,
      notes: record.EMP_NOTES || undefined,
      profileImage: undefined,
      isActive: record.EMP_ACTIVE === 'T',
    }));

    // Insert contacts
    if (contactsToImport.length > 0) {
      await db.insert(contacts).values(contactsToImport);
      console.log(`[INFO] Imported ${contactsToImport.length} contacts from employee CSV`);
    }

    console.log('[INFO] Employee contacts import completed');
  } catch (error) {
    console.error('[ERROR] Error importing contacts from employee CSV:', error);
  }
}

/**
 * Import client contacts from the Search All Clients CSV file
 */
export async function importClientContactsFromCSV() {
  try {
    console.log('[INFO] Importing client contacts from CSV file...');

    // Read CSV file
    const csvFilePath = join(
      process.cwd(),
      'attached_assets',
      'Search All Clients - Search All Clients.csv'
    );
    const fileContent = readFileSync(csvFilePath, { encoding: 'utf-8' });

    // Parse CSV
    const records: any[] = await new Promise((resolve, reject) => {
      parse(
        fileContent,
        {
          columns: true,
          skip_empty_lines: true,
        },
        (err, records) => {
          if (err) reject(err);
          else resolve(records);
        }
      );
    });

    console.log(`[INFO] Found ${records.length} client records in CSV`);

    // Take the first 50 records for initial import
    const clientContactsToImport = records.slice(0, 50).map(record => {
      // Parse the client name to try and extract first/last name if possible
      let firstName = 'Contact';
      let lastName = record['Client Name'] || 'Unknown';

      // Try to break up the client name into first and last if it follows a pattern
      if (record['Account Manager'] && record['Account Manager'].includes(' ')) {
        const nameParts = record['Account Manager'].split(' ');
        firstName = nameParts[0] || 'Contact';
        lastName = nameParts.slice(1).join(' ') || record['Client Name'] || 'Unknown';
      }

      return {
        firstName,
        lastName,
        displayName: record['Client Name'] || undefined,
        email: `contact@${record['Client Name']?.toLowerCase().replace(/\s+/g, '') || 'client'}.com`,
        phone: record['Phone'] || undefined,
        mobile: undefined,
        address: undefined,
        city: undefined,
        state: record['Branch']?.split(' ')[0] || undefined,
        postalCode: undefined,
        country: 'Australia',
        contactType: 'person',
        primaryRole: 'client',
        companyName: record['Legal Name'] || record['Client Name'] || undefined,
        jobTitle: 'Client Manager',
        department: undefined,
        notes: `Client ID: ${record['Client ID']}, Client Type: ${record['Client Type']}`,
        profileImage: undefined,
        isActive: record['Client Type'] === 'Current',
      };
    });

    // Insert client contacts
    if (clientContactsToImport.length > 0) {
      await db.insert(contacts).values(clientContactsToImport);
      console.log(`[INFO] Imported ${clientContactsToImport.length} contacts from client CSV`);
    }

    console.log('[INFO] Client contacts import completed');
  } catch (error) {
    console.error('[ERROR] Error importing client contacts from CSV:', error);
  }
}

/**
 * Assign contacts to appropriate groups
 */
export async function assignContactsToGroups() {
  try {
    console.log('[INFO] Assigning contacts to groups...');

    // Check if we already have group assignments
    const existingAssignments = await db.select().from(contactGroupMembers);

    if (existingAssignments.length > 0) {
      console.log('[INFO] Contact group assignments already exist. Skipping...');
      return;
    }

    // Get all contacts
    const allContacts = await db.select().from(contacts);

    // Get all groups
    const allGroups = await db.select().from(contactGroups);

    if (allGroups.length === 0) {
      console.log('[INFO] No groups found. Skipping group assignments.');
      return;
    }

    const groupIdsByName: Record<string, number> = {};
    allGroups.forEach(group => {
      groupIdsByName[group.name] = group.id;
    });

    const assignmentBatch: { groupId: number; contactId: number; addedBy: number }[] = [];

    // Assign contacts to appropriate groups based on their primaryRole
    allContacts.forEach(contact => {
      if (contact.primaryRole === 'apprentice' || contact.primaryRole === 'trainee') {
        // Don't add to any group yet
      } else if (contact.primaryRole === 'worker') {
        // Don't add to any group yet
      } else if (
        contact.companyName?.toLowerCase().includes('rto') &&
        groupIdsByName['RTO Coordinators']
      ) {
        assignmentBatch.push({
          groupId: groupIdsByName['RTO Coordinators'],
          contactId: contact.id,
          addedBy: 1,
        });
      } else if (contact.primaryRole === 'client' && groupIdsByName['Host Employer Contacts']) {
        assignmentBatch.push({
          groupId: groupIdsByName['Host Employer Contacts'],
          contactId: contact.id,
          addedBy: 1,
        });
      }
    });

    // Insert group assignments
    if (assignmentBatch.length > 0) {
      await db.insert(contactGroupMembers).values(assignmentBatch);
      console.log(`[INFO] Assigned ${assignmentBatch.length} contacts to groups`);
    }

    console.log('[INFO] Contact group assignments completed');
  } catch (error) {
    console.error('[ERROR] Error assigning contacts to groups:', error);
  }
}

/**
 * Main function to seed all contact data
 */
export async function seedContacts() {
  console.log(chalk.blue('=== Starting Contacts Data Seeding ==='));

  await seedContactTags();
  await seedContactGroups();
  await importContactsFromEmployeeCSV();
  await importClientContactsFromCSV();
  await assignContactsToGroups();

  console.log(chalk.green('=== Contacts Data Seeding Completed ==='));
}
