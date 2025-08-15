/**
 * Scheduled tasks for the application
 *
 * This module contains tasks that run on a schedule, such as syncing
 * qualifications from the Training.gov.au API and managing WHS inspections.
 */

import { sql } from 'drizzle-orm';
import { whs_inspections } from '../shared/schema/whs';
import { tgaService } from './services/tga-service';
import { db } from './db';
import { sendEmailNotification, sendSystemAlert } from './services/notification-service';

// List of search terms to sync qualifications for
const QUALIFICATION_SEARCH_TERMS = [
  'Certificate III',
  'Certificate IV',
  'Diploma',
  'Advanced Diploma',
  'Business',
  'Construction',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Automotive',
  'Engineering',
  'Information Technology',
  'Commercial Cookery',
  'Agriculture',
  'Health',
];

/**
 * Sync qualifications from Training.gov.au
 *
 * This function fetches qualifications from the Training.gov.au API
 * based on predefined search terms and imports them into our database.
 * Uses a cache to avoid unnecessary API calls for recently fetched qualifications.
 */
export async function syncQualifications() {
  console.log('Starting scheduled qualification sync...');

  let totalImported = 0;

  for (const searchTerm of QUALIFICATION_SEARCH_TERMS) {
    try {
      console.log(`Syncing qualifications for: ${searchTerm}`);

      // Set a higher limit for important search terms
      const limit = searchTerm.includes('Certificate') || searchTerm.includes('Diploma') ? 20 : 10;

      // Use the optimized caching TGA service
      const importedCount = await tgaService.syncQualifications(searchTerm, limit);
      totalImported += importedCount;
      console.log(`Imported ${importedCount} qualifications for '${searchTerm}'`);

      // Add a small delay between requests to avoid rate limiting
      // Longer delay for larger result sets
      const delayTime = limit > 10 ? 1000 : 500;
      await new Promise(resolve => setTimeout(resolve, delayTime));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error syncing qualifications for '${searchTerm}': ${errorMessage}`);
    }
  }

  console.log(`Qualification sync completed. Total imported: ${totalImported}`);
}

/**
 * Check for overdue WHS inspections and send notifications
 */
export async function checkOverdueInspections() {
  console.log('Checking for overdue WHS inspections...');

  try {
    const now = new Date();

    // Find inspections that are scheduled but past due
    const overdueInspections = await db.select().from(whs_inspections).where(sql`
        ${whs_inspections.status} = 'scheduled' AND 
        ${whs_inspections.inspection_date} < ${now}
      `);

    if (overdueInspections.length > 0) {
      console.log(`Found ${overdueInspections.length} overdue inspections`);

      // Update status to overdue
      await db.update(whs_inspections).set({
        status: 'overdue',
        updated_at: new Date(),
      }).where(sql`
          ${whs_inspections.status} = 'scheduled' AND 
          ${whs_inspections.inspection_date} < ${now}
        `);

      // Send notifications for overdue inspections
      const whsAdminEmails = process.env.WHS_ADMIN_EMAILS?.split(',') || [];

      if (whsAdminEmails.length > 0) {
        const inspectionsList = overdueInspections
          .map(
            inspection =>
              `• ${inspection.title} at ${inspection.location} (Due: ${new Date(inspection.inspection_date).toLocaleDateString()})`
          )
          .join('\n');

        await sendEmailNotification({
          recipients: whsAdminEmails.filter(email => email.trim()),
          subject: `${overdueInspections.length} WHS Inspections Overdue`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; color: white;">WHS Inspections Overdue</h2>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; margin: 0;">
                <p>The following ${overdueInspections.length} inspection(s) are now overdue and require immediate attention:</p>
                <ul style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                  ${overdueInspections
                    .map(
                      inspection =>
                        `<li style="margin-bottom: 10px;">
                      <strong>${inspection.title}</strong><br/>
                      Location: ${inspection.location}<br/>
                      Due Date: ${new Date(inspection.inspection_date).toLocaleDateString()}<br/>
                      Inspector: ${inspection.inspector_name || 'Unassigned'}
                    </li>`
                    )
                    .join('')}
                </ul>
                <p>Please schedule these inspections as soon as possible to maintain compliance.</p>
              </div>
            </div>
          `,
          textContent: `WHS Inspections Overdue\n\n${overdueInspections.length} inspection(s) are overdue:\n\n${inspectionsList}`,
        });

        // Send system alert for overdue inspections
        await sendSystemAlert(
          `${overdueInspections.length} WHS inspection(s) are overdue and require immediate attention`,
          'high'
        );
      }
    } else {
      console.log('No overdue inspections found');
    }
  } catch (error) {
    console.error('Error checking overdue inspections:', error);
  }
}

/**
 * Generate upcoming inspection reminders
 */
export async function sendUpcomingInspectionReminders() {
  console.log('Checking for upcoming WHS inspections...');

  try {
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(now.getDate() + 7); // 7 days ahead

    // Find inspections scheduled within the next 7 days
    const upcomingInspections = await db.select().from(whs_inspections).where(sql`
        ${whs_inspections.status} = 'scheduled' AND 
        ${whs_inspections.inspection_date} BETWEEN ${now} AND ${reminderDate}
      `);

    if (upcomingInspections.length > 0) {
      console.log(`Found ${upcomingInspections.length} upcoming inspections`);

      const whsAdminEmails = process.env.WHS_ADMIN_EMAILS?.split(',') || [];

      if (whsAdminEmails.length > 0) {
        await sendEmailNotification({
          recipients: whsAdminEmails.filter(email => email.trim()),
          subject: `${upcomingInspections.length} WHS Inspections Due This Week`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #d97706; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; color: white;">Upcoming WHS Inspections</h2>
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; margin: 0;">
                <p>The following ${upcomingInspections.length} inspection(s) are scheduled for this week:</p>
                <ul style="background: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                  ${upcomingInspections
                    .map(
                      inspection =>
                        `<li style="margin-bottom: 10px;">
                      <strong>${inspection.title}</strong><br/>
                      Location: ${inspection.location}<br/>
                      Scheduled: ${new Date(inspection.inspection_date).toLocaleDateString()}<br/>
                      Inspector: ${inspection.inspector_name || 'Unassigned'}
                    </li>`
                    )
                    .join('')}
                </ul>
                <p>Please ensure all necessary preparations are completed.</p>
              </div>
            </div>
          `,
          textContent: `Upcoming WHS Inspections\n\n${upcomingInspections.length} inspection(s) due this week`,
        });
      }
    } else {
      console.log('No upcoming inspections found');
    }
  } catch (error) {
    console.error('Error checking upcoming inspections:', error);
  }
}

/**
 * Initialize scheduled tasks
 *
 * This function sets up all scheduled tasks for the application.
 */
export function initializeScheduledTasks() {
  // Schedule qualification sync to run every day at 2 AM
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  // Function to calculate time until next run
  const getTimeUntilNextSync = () => {
    const now = new Date();
    const targetHour = 2; // 2 AM

    // Set target time to 2 AM today
    const targetTime = new Date(now);
    targetTime.setHours(targetHour, 0, 0, 0);

    // If it's already past 2 AM, schedule for tomorrow
    if (now.getTime() > targetTime.getTime()) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime.getTime() - now.getTime();
  };

  // Schedule the first run
  const scheduleNextSync = () => {
    const timeUntilNextSync = getTimeUntilNextSync();
    console.log(
      `Next qualification sync scheduled in ${Math.round(timeUntilNextSync / (60 * 60 * 1000))} hours`
    );

    setTimeout(() => {
      // Run the sync
      syncQualifications().catch(error => {
        console.error('Error in scheduled qualification sync:', error);
      });

      // Schedule the next run
      scheduleNextSync();
    }, timeUntilNextSync);
  };

  // Start the scheduling
  scheduleNextSync();

  // Schedule WHS inspection checks to run every 6 hours
  const scheduleWHSChecks = () => {
    const sixHours = 6 * 60 * 60 * 1000;

    setTimeout(() => {
      // Check for overdue inspections
      checkOverdueInspections().catch(error => {
        console.error('Error checking overdue inspections:', error);
      });

      // Recursively schedule next check
      scheduleWHSChecks();
    }, sixHours);
  };

  // Schedule weekly reminders for upcoming inspections (run every Monday at 9 AM)
  const scheduleWeeklyReminders = () => {
    const now = new Date();
    const monday = new Date(now);

    // Calculate days until next Monday
    const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
    monday.setDate(now.getDate() + daysUntilMonday);
    monday.setHours(9, 0, 0, 0); // 9 AM

    const timeUntilMonday = monday.getTime() - now.getTime();

    setTimeout(() => {
      // Send upcoming inspection reminders
      sendUpcomingInspectionReminders().catch(error => {
        console.error('Error sending inspection reminders:', error);
      });

      // Schedule next weekly run (7 days later)
      setTimeout(() => scheduleWeeklyReminders(), 7 * 24 * 60 * 60 * 1000);
    }, timeUntilMonday);
  };

  // Start WHS scheduling
  console.log('Initializing WHS inspection monitoring...');
  scheduleWHSChecks();
  scheduleWeeklyReminders();

  console.log('All scheduled tasks initialized successfully');
}
