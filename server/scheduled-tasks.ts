/**
 * Scheduled tasks for the application
 * 
 * This module contains tasks that run on a schedule, such as syncing
 * qualifications from the Training.gov.au API.
 */

import { tgaService } from "./services/tga-service";

// List of search terms to sync qualifications for
const QUALIFICATION_SEARCH_TERMS = [
  "Certificate III",
  "Certificate IV",
  "Diploma",
  "Advanced Diploma",
  "Business",
  "Construction",
  "Electrical",
  "Plumbing",
  "Carpentry",
  "Automotive",
  "Engineering",
  "Information Technology",
  "Commercial Cookery",
  "Agriculture",
  "Health"
];

/**
 * Sync qualifications from Training.gov.au
 * 
 * This function fetches qualifications from the Training.gov.au API
 * based on predefined search terms and imports them into our database.
 */
export async function syncQualifications() {
  console.log("Starting scheduled qualification sync...");
  
  let totalImported = 0;
  
  for (const searchTerm of QUALIFICATION_SEARCH_TERMS) {
    try {
      console.log(`Syncing qualifications for: ${searchTerm}`);
      const importedCount = await tgaService.syncQualifications(searchTerm, 10);
      totalImported += importedCount;
      console.log(`Imported ${importedCount} qualifications for '${searchTerm}'`);
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error syncing qualifications for '${searchTerm}':`, error);
    }
  }
  
  console.log(`Qualification sync completed. Total imported: ${totalImported}`);
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
    console.log(`Next qualification sync scheduled in ${Math.round(timeUntilNextSync / (60 * 60 * 1000))} hours`);
    
    setTimeout(() => {
      // Run the sync
      syncQualifications().catch(error => {
        console.error("Error in scheduled qualification sync:", error);
      });
      
      // Schedule the next run
      scheduleNextSync();
    }, timeUntilNextSync);
  };
  
  // Start the scheduling
  scheduleNextSync();
}
