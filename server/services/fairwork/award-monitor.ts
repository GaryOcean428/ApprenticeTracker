/**
 * Fair Work Award Monitor Service
 *
 * This service monitors Fair Work awards for updates and notifies administrators
 * when new award versions are available. It also provides functionality for
 * administrators to update award links and data.
 */

import { awards, awardUpdateChecks } from '@shared/schema/awards';
import { eq, desc } from 'drizzle-orm';
import axios from 'axios';
import { db } from '../../db';
import logger from '../../utils/logger';
import { sendEmailNotification } from '../notification-service';
import { FairWorkApiClient } from './api-client';
import { scrapeAwardData } from './award-scraper';
import { awardAIAnalyzer } from './award-ai-analyzer';

// Constants
const CHECK_INTERVAL_DAYS = 7; // Check for updates weekly
const FWC_AWARDS_LIST_URL = 'https://www.fwc.gov.au/document-search/modern-awards-list';

/**
 * Interface representing an award update record
 */
interface AwardUpdateCheck {
  id: number;
  awardCode: string;
  awardName: string;
  checkDate: Date;
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  updateUrl: string | null;
  lastNotifiedDate: Date | null;
  status: 'pending' | 'notified' | 'updated' | 'ignored';
}

/**
 * Service for monitoring and managing Fair Work award updates
 */
export class AwardMonitorService {
  private fairworkApiClient: FairWorkApiClient;

  constructor(fairworkApiClient?: FairWorkApiClient) {
    // If a client is provided, use it, otherwise create a default one
    this.fairworkApiClient =
      fairworkApiClient ||
      new FairWorkApiClient({
        baseUrl: process.env.FAIRWORK_API_URL || 'https://api.fairwork.gov.au',
        apiKey: process.env.FAIRWORK_API_KEY || '',
      });
  }

  /**
   * Initialize the award monitoring process
   * This schedules regular checks for award updates
   */
  public initialize(): void {
    // Schedule the check function to run at the defined interval
    logger.info('Initializing Fair Work award monitoring service');

    // Run an initial check on startup
    this.checkForAwardUpdates().catch(error => {
      logger.error('Error during initial award update check', { error });
    });

    // Calculate milliseconds for the check interval
    const checkIntervalMs = CHECK_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

    // Schedule regular checks
    setInterval(() => {
      this.checkForAwardUpdates().catch(error => {
        logger.error('Error during scheduled award update check', { error });
      });
    }, checkIntervalMs);

    logger.info(`Award update checks scheduled to run every ${CHECK_INTERVAL_DAYS} days`);
  }

  /**
   * Check for updates to Fair Work awards
   * This checks both the API and scrapes the FWC website for updates
   */
  public async checkForAwardUpdates(): Promise<void> {
    try {
      logger.info('Checking for Fair Work award updates');

      // Get all active awards from the database
      const activeAwards = await db.select().from(awards);

      // Track which awards were checked
      const checkedAwards: Record<string, boolean> = {};

      // Check each award for updates
      for (const award of activeAwards) {
        try {
          checkedAwards[award.code] = true;

          // First, try to get the latest award info from the API
          const apiAward = await this.fairworkApiClient.getAward(award.code);

          if (apiAward) {
            // Check if the version or effective date has changed
            const isNewVersion = this.isNewVersion(award, apiAward);

            if (isNewVersion) {
              // Record this update
              await this.recordAwardUpdate(award.code, award.name, {
                currentVersion: award.version || '1.0',
                latestVersion: apiAward.version_number?.toString() || 'Unknown',
                updateUrl: `https://www.fwc.gov.au/documents/awards/${award.code}.pdf`,
              });
            }
          }
        } catch (error) {
          logger.error(`Error checking for updates to award ${award.code}`, { error });
        }
      }

      // Also check the Fair Work website for any new awards
      await this.checkFairWorkWebsiteForUpdates(checkedAwards);

      // Process any pending updates and send notifications
      await this.processAwardUpdateNotifications();

      logger.info('Completed checking for Fair Work award updates');
    } catch (error) {
      logger.error('Error checking for Fair Work award updates', { error });
      throw error;
    }
  }

  /**
   * Check the Fair Work website for updates to awards
   * This uses web scraping to find new awards or updates
   */
  private async checkFairWorkWebsiteForUpdates(
    checkedAwards: Record<string, boolean>
  ): Promise<void> {
    try {
      logger.info('Checking Fair Work website for award updates');

      // Make a request to the Fair Work Commission awards list page
      const response = await axios.get(FWC_AWARDS_LIST_URL);

      if (response.status !== 200) {
        throw new Error(`Failed to fetch FWC awards list, status: ${response.status}`);
      }

      // Extract the award data from the HTML
      // In a production environment, this would use a proper HTML parser
      // like cheerio to extract award codes, names, and dates

      // Simplified example - in reality, this would be more robust
      const html = response.data;
      const awardLinks = html.match(/<a href="[^"]*\/awards\/[^"]*"[^>]*>([^<]+)<\/a>/g) || [];

      // Process each potential award link
      for (const link of awardLinks) {
        // Extract the code and name
        const codeMatch = link.match(/\/awards\/([A-Z0-9]+)/) || [];
        const nameMatch = link.match(/>([^<]+)<\/a>/) || [];

        if (codeMatch.length > 1 && nameMatch.length > 1) {
          const code = codeMatch[1];
          const name = nameMatch[1].trim();

          // Skip if we already checked this award from the API
          if (checkedAwards[code]) {
            continue;
          }

          // Check if this award exists in our database
          const [existingAward] = await db.select().from(awards).where(eq(awards.code, code));

          if (!existingAward) {
            // This is a new award we don't have
            logger.info(`Found new award on FWC website: ${code} - ${name}`);

            // Record this as a new award to add
            await this.recordAwardUpdate(code, name, {
              currentVersion: 'Not in system',
              latestVersion: 'New',
              updateUrl: `https://www.fwc.gov.au/documents/awards/${code}.pdf`,
            });
          }
        }
      }

      logger.info('Completed checking Fair Work website for award updates');
    } catch (error) {
      logger.error('Error checking Fair Work website for award updates', { error });
    }
  }

  /**
   * Record an award update in the database
   */
  private async recordAwardUpdate(
    awardCode: string,
    awardName: string,
    updateInfo: {
      currentVersion: string;
      latestVersion: string;
      updateUrl: string;
    }
  ): Promise<string | null> {
    try {
      // Check if we already have a pending update for this award
      const [existingUpdate] = await db
        .select()
        .from(awardUpdateChecks)
        .where(eq(awardUpdateChecks.awardCode, awardCode), eq(awardUpdateChecks.status, 'pending'));

      let updateId: string;

      if (existingUpdate) {
        // Update the existing record
        await db
          .update(awardUpdateChecks)
          .set({
            checkDate: new Date(),
            latestVersion: updateInfo.latestVersion,
            updateUrl: updateInfo.updateUrl,
          })
          .where(eq(awardUpdateChecks.id, existingUpdate.id));

        updateId = existingUpdate.id;
        logger.info(`Updated existing award update record for ${awardCode}`);
      } else {
        // Create a new record
        const [newRecord] = await db
          .insert(awardUpdateChecks)
          .values({
            awardCode,
            awardName,
            checkDate: new Date(),
            currentVersion: updateInfo.currentVersion,
            latestVersion: updateInfo.latestVersion,
            updateAvailable: true,
            updateUrl: updateInfo.updateUrl,
            status: 'pending',
          })
          .returning();

        updateId = newRecord.id;
        logger.info(`Created new award update record for ${awardCode}`);
      }

      // If AI analysis is available, process the award update with AI
      if (awardAIAnalyzer.isAvailable()) {
        await this.processUpdateWithAI(
          updateId,
          awardCode,
          awardName,
          updateInfo.currentVersion,
          updateInfo.latestVersion,
          updateInfo.updateUrl
        );
      }

      return updateId;
    } catch (error) {
      logger.error(`Error recording award update for ${awardCode}`, { error });
      return null;
    }
  }

  /**
   * Process an award update with AI analysis
   */
  private async processUpdateWithAI(
    updateId: string,
    awardCode: string,
    awardName: string,
    currentVersion: string,
    latestVersion: string,
    updateUrl: string | null
  ): Promise<void> {
    try {
      logger.info(`Processing award update with AI for ${awardCode}`, { updateId });

      // Analyze the changes using AI
      const analysis = await awardAIAnalyzer.analyzeAwardChanges(
        awardCode,
        awardName,
        currentVersion,
        latestVersion,
        updateUrl
      );

      // Generate notification message
      const notificationMessage = await awardAIAnalyzer.generateNotificationMessage(
        awardCode,
        awardName,
        analysis
      );

      // Update the record with AI analysis
      const success = await awardAIAnalyzer.updateRecordWithAnalysis(
        updateId,
        analysis,
        notificationMessage
      );

      if (success) {
        logger.info(`Successfully updated record with AI analysis for ${awardCode}`, { updateId });
      } else {
        logger.warn(`Failed to update record with AI analysis for ${awardCode}`, { updateId });
      }
    } catch (error) {
      logger.error(`Error processing award update with AI for ${awardCode}`, { error, updateId });
    }
  }

  /**
   * Process pending award updates and send notifications
   */
  private async processAwardUpdateNotifications(): Promise<void> {
    try {
      // Get all pending update notifications
      const pendingUpdates = await db
        .select()
        .from(awardUpdateChecks)
        .where(eq(awardUpdateChecks.status, 'pending'));

      if (pendingUpdates.length === 0) {
        logger.info('No pending award updates to process');
        return;
      }

      logger.info(`Processing ${pendingUpdates.length} pending award updates`);

      // Group updates by whether they're new awards or updates to existing ones
      const newAwards = pendingUpdates.filter(u => u.currentVersion === 'Not in system');
      const updatedAwards = pendingUpdates.filter(u => u.currentVersion !== 'Not in system');

      // Send notification email to administrators
      if (newAwards.length > 0 || updatedAwards.length > 0) {
        await this.sendAwardUpdateNotification(newAwards, updatedAwards);

        // Update the notification status
        for (const update of pendingUpdates) {
          await db
            .update(awardUpdateChecks)
            .set({
              status: 'notified',
              lastNotifiedDate: new Date(),
            })
            .where(eq(awardUpdateChecks.id, update.id));
        }
      }
    } catch (error) {
      logger.error('Error processing award update notifications', { error });
    }
  }

  /**
   * Send email notification about award updates
   */
  private async sendAwardUpdateNotification(newAwards: any[], updatedAwards: any[]): Promise<void> {
    try {
      // Create notification content
      const emailSubject = 'Fair Work Award Updates Available';
      let emailContent = '<h2>Fair Work Award Updates</h2>';

      // Add information about new awards
      if (newAwards.length > 0) {
        emailContent += '<h3>New Awards Available</h3>';
        emailContent += '<ul>';
        for (const award of newAwards) {
          emailContent += `<li><strong>${award.awardCode}</strong>: ${award.awardName}`;
          if (award.updateUrl) {
            emailContent += ` - <a href="${award.updateUrl}">View Award</a>`;
          }
          emailContent += '</li>';
        }
        emailContent += '</ul>';
      }

      // Add information about updated awards
      if (updatedAwards.length > 0) {
        emailContent += '<h3>Award Updates Available</h3>';
        emailContent += '<ul>';
        for (const award of updatedAwards) {
          emailContent += `<li><strong>${award.awardCode}</strong>: ${award.awardName} - `;
          emailContent += `Current version: ${award.currentVersion}, Latest version: ${award.latestVersion}`;
          if (award.updateUrl) {
            emailContent += ` - <a href="${award.updateUrl}">View Updated Award</a>`;
          }
          emailContent += '</li>';
        }
        emailContent += '</ul>';
      }

      // Add action instructions
      emailContent += '<h3>Actions Required</h3>';
      emailContent +=
        '<p>To update these awards in the system, please access the Award Management section in the admin dashboard.</p>';

      // Send the notification
      await sendEmailNotification({
        recipients: ['admin@example.com'], // This would be configured in settings
        subject: emailSubject,
        htmlContent: emailContent,
      });

      logger.info('Sent award update notification email');
    } catch (error) {
      logger.error('Error sending award update notification', { error });
    }
  }

  /**
   * Check if an award from the API represents a new version
   */
  private isNewVersion(dbAward: any, apiAward: any): boolean {
    // If the API award has a version number and it's different, that's a new version
    const dbVersion = dbAward.version || '1.0';

    if (apiAward.version_number && dbVersion !== apiAward.version_number.toString()) {
      return true;
    }

    // If the API award has an effective date and it's newer, that's a new version
    if (apiAward.effective_date && dbAward.effectiveFrom) {
      const apiDate = new Date(apiAward.effective_date);
      const dbDate = new Date(dbAward.effectiveFrom);

      if (apiDate > dbDate) {
        return true;
      }
    }

    return false;
  }

  /**
   * Update an award with new information
   * This can be called from the admin UI when updating awards
   */
  public async updateAward(
    awardCode: string,
    updateData: {
      name?: string;
      url?: string;
      version?: string;
      effectiveDate?: string | Date;
      description?: string;
    }
  ): Promise<boolean> {
    try {
      logger.info(`Updating award ${awardCode}`, { updateData });

      // Find the award
      const [award] = await db.select().from(awards).where(eq(awards.code, awardCode));

      if (!award) {
        logger.warn(`Attempted to update non-existent award: ${awardCode}`);
        return false;
      }

      // Prepare update data
      const updateValues: any = {};

      if (updateData.name) updateValues.name = updateData.name;
      if (updateData.url) updateValues.url = updateData.url;
      if (updateData.version) updateValues.version = updateData.version;
      if (updateData.effectiveDate) updateValues.effectiveDate = new Date(updateData.effectiveDate);
      if (updateData.description) updateValues.description = updateData.description;

      // Add update timestamp
      updateValues.updatedAt = new Date();

      // Update the award record
      await db.update(awards).set(updateValues).where(eq(awards.code, awardCode));

      // If there's an update check record, mark it as updated
      await db
        .update(awardUpdateChecks)
        .set({
          status: 'updated',
          currentVersion: updateData.version || award.version,
          latestVersion: updateData.version || award.version,
          updateAvailable: false,
        })
        .where(
          eq(awardUpdateChecks.awardCode, awardCode),
          eq(awardUpdateChecks.status, 'notified')
        );

      // If a URL was provided, try to scrape award data
      if (updateData.url) {
        await scrapeAwardData(awardCode, updateData.url);
      }

      logger.info(`Successfully updated award ${awardCode}`);
      return true;
    } catch (error) {
      logger.error(`Error updating award ${awardCode}`, { error });
      return false;
    }
  }

  /**
   * Manually trigger a check for award updates
   * This can be called from the admin UI
   */
  public async manualCheckForUpdates(): Promise<number> {
    try {
      logger.info('Manually triggering check for award updates');
      await this.checkForAwardUpdates();

      // Return the count of pending updates
      const pendingUpdates = await db
        .select()
        .from(awardUpdateChecks)
        .where(eq(awardUpdateChecks.status, 'pending'));

      return pendingUpdates.length;
    } catch (error) {
      logger.error('Error during manual award update check', { error });
      throw error;
    }
  }

  /**
   * Get all award updates based on status
   * This can be used in the admin UI to show pending and completed updates
   */
  public async getAwardUpdates(
    status?: 'pending' | 'notified' | 'updated' | 'ignored'
  ): Promise<AwardUpdateCheck[]> {
    try {
      let query = db.select().from(awardUpdateChecks).orderBy(desc(awardUpdateChecks.checkDate));

      if (status) {
        query = query.where(eq(awardUpdateChecks.status, status));
      }

      return query;
    } catch (error) {
      logger.error('Error fetching award updates', { error, status });
      return [];
    }
  }

  /**
   * Ignore an award update
   * This can be used in the admin UI to dismiss updates that don't need action
   */
  public async ignoreAwardUpdate(updateId: string): Promise<boolean> {
    try {
      await db
        .update(awardUpdateChecks)
        .set({
          status: 'ignored',
          updateAvailable: false,
        })
        .where(eq(awardUpdateChecks.id, updateId));

      logger.info(`Award update ${updateId} marked as ignored`);
      return true;
    } catch (error) {
      logger.error(`Error ignoring award update ${updateId}`, { error });
      return false;
    }
  }
}

// Export a singleton instance
export const awardMonitor = new AwardMonitorService();
