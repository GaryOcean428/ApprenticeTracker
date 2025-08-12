import { contactTags } from '@shared/schema/contacts';
import { db } from './db';

export async function seedContactTags() {
  console.log('[INFO] Seeding system contact tags...');

  // Check if we already have system tags
  const existingTags = await db.select().from(contactTags).where({ isSystem: true });

  if (existingTags.length > 0) {
    console.log('[INFO] System contact tags already exist. Skipping...');
    return;
  }

  // Create default system tags for different contact roles
  const systemTags = [
    {
      name: 'Apprentice',
      description: 'Current apprentice or trainee in the system',
      color: '#3b82f6', // Blue
      isSystem: true,
    },
    {
      name: 'Trainee',
      description: 'Current trainee in the system',
      color: '#8b5cf6', // Purple
      isSystem: true,
    },
    {
      name: 'Host Employer',
      description: 'Contact at a host employer organization',
      color: '#10b981', // Green
      isSystem: true,
    },
    {
      name: 'Field Officer',
      description: 'Field officer who manages apprentices and host employers',
      color: '#f59e0b', // Amber
      isSystem: true,
    },
    {
      name: 'Supervisor',
      description: 'Workplace supervisor for apprentices and trainees',
      color: '#ef4444', // Red
      isSystem: true,
    },
    {
      name: 'RTO Contact',
      description: 'Contact at a Registered Training Organization',
      color: '#6366f1', // Indigo
      isSystem: true,
    },
    {
      name: 'Client',
      description: 'Client contact for general business purposes',
      color: '#0891b2', // Cyan
      isSystem: true,
    },
    {
      name: 'Supplier',
      description: 'Supplier contact for vendor management',
      color: '#84cc16', // Lime
      isSystem: true,
    },
    {
      name: 'Government',
      description: 'Government or regulatory contact',
      color: '#7c3aed', // Violet
      isSystem: true,
    },
    {
      name: 'Labour Hire',
      description: 'Labour hire worker not under apprenticeship',
      color: '#f97316', // Orange
      isSystem: true,
    },
  ];

  // Insert the system tags
  await db.insert(contactTags).values(systemTags);

  console.log('[INFO] System contact tags created successfully');
}
