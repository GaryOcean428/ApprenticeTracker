/**
 * Award AI Analyzer Service
 *
 * This service uses OpenAI's models to analyze award changes and provide summaries,
 * impact assessments, and notification messages.
 */

import OpenAI from 'openai';
import { awardUpdateChecks } from '@shared/schema/awards';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import logger from '../../utils/logger';

/**
 * Interface for AI analysis result
 */
export interface AwardAnalysisResult {
  summary: string;
  keyChanges: string[];
  impactLevel: 'low' | 'medium' | 'high';
}

/**
 * Service for analyzing award changes using AI
 */
export class AwardAIAnalyzer {
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey?.trim()) {
      logger.warn('No OpenAI API key provided, AI analysis will not be available');
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
        timeout: 20000, // 20s timeout
      });
      logger.info('AI analysis features enabled');
    } catch (error) {
      logger.error('Failed to initialize OpenAI client', { error });
      this.openai = null;
    }
  }

  /**
   * Check if AI analysis is available (API key is configured and client initialized)
   */
  public isAvailable(): boolean {
    return this.openai !== null;
  }

  /**
   * Analyze changes between award versions
   */
  public async analyzeAwardChanges(
    awardCode: string,
    awardName: string,
    oldVersion: string,
    newVersion: string,
    updateUrl: string | null
  ): Promise<AwardAnalysisResult> {
    if (!this.isAvailable() || !this.openai) {
      logger.info('AI analysis requested but OpenAI client is not available, using fallback', {
        awardCode,
      });
      return this.generateFallbackAnalysis(awardCode, awardName);
    }

    try {
      logger.info('Analyzing award changes using AI', { awardCode, oldVersion, newVersion });

      // Default to a basic analysis if no specific model is available
      let aiResult: any;

      try {
        // Attempt to use the gpt-4.1-mini model with tools if available
        aiResult = await this.openai.chat.completions.create({
          model: 'gpt-4o', // Use gpt-4o as the newest OpenAI model. We can replace with gpt-4.1-mini when available
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in Australian employment law and Fair Work Commission awards. You need to analyze changes between award versions and determine their impact for employers.',
            },
            {
              role: 'user',
              content: `Analyze the changes between version ${oldVersion} and ${newVersion} of the Fair Work award ${awardCode} (${awardName}).
              ${updateUrl ? `The new version can be found at: ${updateUrl}` : ''}
              
              Please provide:
              1. A concise summary of the likely changes (2-3 sentences maximum)
              2. Key changes that are likely to affect pay rates or working conditions (list 3-5 points)
              3. The impact level (low, medium, high) of these changes for employers
              
              Format your response as follows:
              SUMMARY: [your summary here]
              KEY_CHANGES:
              - [point 1]
              - [point 2]
              - [point 3]
              IMPACT: [low/medium/high]`,
            },
          ],
          temperature: 0.3,
        });
      } catch (error) {
        logger.error('Error using gpt-4o model, falling back to simpler model', { error });

        // Fall back to a simpler model if needed
        aiResult = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert in Australian employment law and Fair Work Commission awards.',
            },
            {
              role: 'user',
              content: `Analyze the changes between version ${oldVersion} and ${newVersion} of the Fair Work award ${awardCode} (${awardName}).
              
              Please provide:
              1. A brief summary of likely changes
              2. Likely key changes that affect pay rates or working conditions
              3. The impact level (low, medium, high) of these changes for employers
              
              Format your response as follows:
              SUMMARY: [your summary here]
              KEY_CHANGES:
              - [point 1]
              - [point 2]
              - [point 3]
              IMPACT: [low/medium/high]`,
            },
          ],
          temperature: 0.3,
        });
      }

      // Parse the AI response
      const aiResponse = aiResult.choices[0].message.content;

      // Extract summary, key changes, and impact level
      const summaryMatch = aiResponse.match(/SUMMARY:(.*?)(?=KEY_CHANGES:|$)/s);
      const keyChangesMatch = aiResponse.match(/KEY_CHANGES:(.*?)(?=IMPACT:|$)/s);
      const impactMatch = aiResponse.match(/IMPACT:(.*?)$/s);

      const summary = summaryMatch ? summaryMatch[1].trim() : 'Award has been updated.';

      let keyChanges: string[] = [];
      if (keyChangesMatch && keyChangesMatch[1]) {
        keyChanges = keyChangesMatch[1]
          .split('\n')
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(Boolean);
      } else {
        keyChanges = ['Changes to work conditions and pay rates may apply.'];
      }

      let impactLevel: 'low' | 'medium' | 'high' = 'medium';
      if (impactMatch && impactMatch[1]) {
        const impactText = impactMatch[1].trim().toLowerCase();
        if (impactText.includes('low')) {
          impactLevel = 'low';
        } else if (impactText.includes('high')) {
          impactLevel = 'high';
        }
      }

      return {
        summary,
        keyChanges,
        impactLevel,
      };
    } catch (error) {
      logger.error('Error analyzing award changes with AI', { error, awardCode });
      return this.generateFallbackAnalysis(awardCode, awardName);
    }
  }

  /**
   * Generate a notification message for award changes
   */
  public async generateNotificationMessage(
    awardCode: string,
    awardName: string,
    analysis: AwardAnalysisResult
  ): Promise<string> {
    if (!this.isAvailable() || !this.openai) {
      logger.info(
        'AI notification generation requested but OpenAI client is not available, using fallback',
        { awardCode }
      );
      return this.generateFallbackNotification(awardCode, awardName, analysis.impactLevel);
    }

    try {
      logger.info('Generating notification message for award update', { awardCode });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are an assistant that generates clear, concise notifications about Fair Work award updates for Australian businesses.',
          },
          {
            role: 'user',
            content: `Generate a notification message about updates to the ${awardName} (${awardCode}) award. 
            The impact level is ${analysis.impactLevel}.
            
            Summary of changes: ${analysis.summary}
            
            Key changes:
            ${analysis.keyChanges.join('\n')}
            
            Make the message brief but informative, highlighting the most important changes that affect employers.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      return (
        response.choices[0].message.content ||
        this.generateFallbackNotification(awardCode, awardName, analysis.impactLevel)
      );
    } catch (error) {
      logger.error('Error generating notification message', { error, awardCode });
      return this.generateFallbackNotification(awardCode, awardName, analysis.impactLevel);
    }
  }

  /**
   * Generate a fallback analysis when AI is not available
   */
  private generateFallbackAnalysis(awardCode: string, awardName: string): AwardAnalysisResult {
    return {
      summary: `The ${awardName} (${awardCode}) has been updated. Manual review required.`,
      keyChanges: [
        'Potential changes to pay rates',
        'Possible updates to working conditions',
        'Review required to ensure compliance',
      ],
      impactLevel: 'medium',
    };
  }

  /**
   * Generate a fallback notification when AI is not available
   */
  private generateFallbackNotification(
    awardCode: string,
    awardName: string,
    impactLevel: 'low' | 'medium' | 'high'
  ): string {
    const impactText =
      impactLevel === 'high' ? 'important' : impactLevel === 'medium' ? 'significant' : 'minor';

    return `ATTENTION: ${awardName} (${awardCode}) has been updated. This update includes ${impactText} changes that may affect your compliance obligations. Please review the updates as soon as possible.`;
  }

  /**
   * Update an award update check record with AI analysis
   */
  public async updateRecordWithAnalysis(
    updateId: string,
    analysis: AwardAnalysisResult,
    notificationMessage: string
  ): Promise<boolean> {
    try {
      await db
        .update(awardUpdateChecks)
        .set({
          aiAnalysis: JSON.stringify(analysis),
          notificationMessage,
          impactLevel: analysis.impactLevel,
          updatedAt: new Date(),
        })
        .where(eq(awardUpdateChecks.id, updateId));

      return true;
    } catch (error) {
      logger.error('Error updating record with AI analysis', { error, updateId });
      return false;
    }
  }
}

export const awardAIAnalyzer = new AwardAIAnalyzer();
