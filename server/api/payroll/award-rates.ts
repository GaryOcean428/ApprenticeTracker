import { Request, Response } from 'express';
import { db } from '../../db';
import { awards, awardClassifications, payRates } from '@shared/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

/**
 * Get all awards
 * @route GET /api/payroll/awards
 */
export async function getAwards(req: Request, res: Response) {
  try {
    const awardsData = await db.select({
      id: awards.id,
      code: awards.code,
      name: awards.name,
      description: awards.description,
    }).from(awards);

    return res.status(200).json(awardsData);
  } catch (error) {
    console.error('Error fetching awards:', error);
    return res.status(500).json({ message: 'Failed to fetch awards' });
  }
}

/**
 * Get classifications and rates for a specific award
 * @route GET /api/payroll/rates/:awardCode
 */
export async function getAwardRates(req: Request, res: Response) {
  const { awardCode } = req.params;

  if (!awardCode) {
    return res.status(400).json({ message: 'Award code is required' });
  }

  try {
    // First, get the award ID
    const [award] = await db.select({ id: awards.id })
      .from(awards)
      .where(eq(awards.code, awardCode));

    if (!award) {
      return res.status(404).json({ message: 'Award not found' });
    }

    // Get all classifications for this award
    const classifications = await db.select({
      id: awardClassifications.id,
      code: awardClassifications.code,
      name: awardClassifications.name,
      level: awardClassifications.level,
      awardId: awardClassifications.awardId,
    })
      .from(awardClassifications)
      .where(eq(awardClassifications.awardId, award.id));

    // Get the latest rates for each classification
    const rates = [];

    for (const classification of classifications) {
      // Get the most recent rate for this classification
      const [latestRate] = await db.select({
        id: payRates.id,
        hourlyRate: payRates.hourlyRate,
        weeklyRate: payRates.weeklyRate,
        annualRate: payRates.annualRate,
        effectiveFrom: payRates.effectiveFrom,
        effectiveTo: payRates.effectiveTo,
      })
        .from(payRates)
        .where(
          and(
            eq(payRates.classificationId, classification.id),
            isNull(payRates.effectiveTo)
          )
        )
        .orderBy(desc(payRates.effectiveFrom))
        .limit(1);

      if (latestRate) {
        rates.push({
          id: latestRate.id,
          awardCode,
          awardName: award.name,
          classificationCode: classification.code,
          classificationName: classification.name,
          hourlyRate: latestRate.hourlyRate,
          weeklyRate: latestRate.weeklyRate,
          annualRate: latestRate.annualRate,
          effectiveFrom: latestRate.effectiveFrom,
          effectiveTo: latestRate.effectiveTo,
          allowances: [], // To be populated if needed
        });
      }
    }

    return res.status(200).json(rates);
  } catch (error) {
    console.error('Error fetching award rates:', error);
    return res.status(500).json({ message: 'Failed to fetch award rates' });
  }
}
