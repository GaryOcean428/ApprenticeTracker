/**
 * Enhanced Fair Work API integration
 * Provides advanced award interpretation features similar to WorkforceOne
 */

import { Router, Request, Response } from "express";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Sample awards data - in production, this would come from Fair Work API
const AWARDS = [
  {
    id: "MA000003",
    code: "MA000003",
    name: "Building and Construction General On-site Award",
    publishedYear: 2025,
    industry: "Construction",
    sectors: ["commercial", "residential", "civil"]
  },
  {
    id: "MA000020",
    code: "MA000020",
    name: "Building and Construction General Award",
    publishedYear: 2025,
    industry: "Construction",
    sectors: ["commercial", "residential"]
  },
  {
    id: "MA000036",
    code: "MA000036",
    name: "Plumbing and Fire Sprinklers Award",
    publishedYear: 2025,
    industry: "Construction",
    sectors: ["commercial", "residential"]
  },
  {
    id: "MA000025",
    code: "MA000025",
    name: "Electrical, Electronic and Communications Contracting Award",
    publishedYear: 2025,
    industry: "Electrical",
    sectors: ["commercial", "residential", "industrial"]
  }
];

// Function to calculate apprentice pay rates based on various factors
function calculateApprenticeRate(params: {
  awardCode: string;
  year: number;
  apprenticeYear: number;
  isAdult: boolean;
  hasCompletedYear12: boolean;
  sector?: string;
}) {
  const { awardCode, year, apprenticeYear, isAdult, hasCompletedYear12, sector } = params;
  
  // Base rates depend on award and year level
  let baseHourlyRate = 0;
  
  // Building and Construction General On-site Award
  if (awardCode === "MA000003") {
    baseHourlyRate = 22.50 + (apprenticeYear * 3.25);
  }
  // Electrical Award
  else if (awardCode === "MA000025") {
    baseHourlyRate = 23.75 + (apprenticeYear * 3.50);
  }
  // Plumbing Award
  else if (awardCode === "MA000036") {
    baseHourlyRate = 23.25 + (apprenticeYear * 3.40);
  }
  // Default Building Award
  else {
    baseHourlyRate = 22.00 + (apprenticeYear * 3.00);
  }
  
  // Apply modifiers
  const adultBonus = isAdult ? 5.50 : 0;
  const year12Bonus = hasCompletedYear12 ? 1.75 : 0;
  
  // Sector multipliers
  let sectorMultiplier = 1.0;
  if (sector === "commercial") sectorMultiplier = 1.1;
  else if (sector === "civil") sectorMultiplier = 1.2;
  else if (sector === "industrial") sectorMultiplier = 1.15;
  
  // Year adjustments (reflect annual increases)
  const currentYear = new Date().getFullYear();
  const yearAdjustment = (year - currentYear) * 0.03; // 3% annual increase
  
  // Calculate final rates
  const hourlyRate = (baseHourlyRate + adultBonus + year12Bonus) * 
                     sectorMultiplier * (1 + yearAdjustment);
  const weeklyRate = hourlyRate * 38; // Standard 38-hour week
  
  return {
    hourlyRate: parseFloat(hourlyRate.toFixed(2)),
    weeklyRate: parseFloat(weeklyRate.toFixed(2)),
    factors: {
      baseRate: parseFloat(baseHourlyRate.toFixed(2)),
      adultBonus: parseFloat(adultBonus.toFixed(2)),
      year12Bonus: parseFloat(year12Bonus.toFixed(2)),
      sectorMultiplier: parseFloat(sectorMultiplier.toFixed(2)),
      yearAdjustment: parseFloat(yearAdjustment.toFixed(3))
    }
  };
}

/**
 * @route GET /api/fairwork-enhanced/awards
 * @desc Get all awards with additional metadata
 * @access Private
 */
router.get('/awards', isAuthenticated, (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: AWARDS
    });
  } catch (error) {
    console.error('Error fetching enhanced awards:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch awards' 
    });
  }
});

/**
 * @route GET /api/fairwork-enhanced/apprentice-rates
 * @desc Get detailed apprentice rates with calculation factors
 * @access Private
 */
router.get('/apprentice-rates', isAuthenticated, (req: Request, res: Response) => {
  try {
    const awardCode = req.query.awardCode as string;
    const yearStr = req.query.year as string;
    const apprenticeYearStr = req.query.apprenticeYear as string;
    const isAdultStr = req.query.isAdult as string;
    const hasCompletedYear12Str = req.query.hasCompletedYear12 as string;
    const sector = req.query.sector as string;
    
    if (!awardCode) {
      return res.status(400).json({
        success: false,
        error: 'Award code is required'
      });
    }
    
    // Parse and validate parameters
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();
    const apprenticeYear = apprenticeYearStr ? parseInt(apprenticeYearStr) : 1;
    const isAdult = isAdultStr === 'true';
    const hasCompletedYear12 = hasCompletedYear12Str === 'true';
    
    // Find award
    const award = AWARDS.find(a => a.code === awardCode);
    if (!award) {
      return res.status(404).json({
        success: false,
        error: 'Award not found'
      });
    }
    
    // Calculate rates
    const rates = calculateApprenticeRate({
      awardCode,
      year,
      apprenticeYear,
      isAdult,
      hasCompletedYear12,
      sector
    });
    
    res.json({
      success: true,
      data: {
        award: {
          code: award.code,
          name: award.name
        },
        parameters: {
          year,
          apprenticeYear,
          isAdult,
          hasCompletedYear12,
          sector: sector || 'standard'
        },
        rates: {
          hourly: rates.hourlyRate,
          weekly: rates.weeklyRate,
          annual: parseFloat((rates.weeklyRate * 52).toFixed(2))
        },
        calculationFactors: rates.factors
      }
    });
  } catch (error) {
    console.error('Error calculating apprentice rates:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to calculate rates' 
    });
  }
});

/**
 * @route GET /api/fairwork-enhanced/historical-rates
 * @desc Get historical pay rate data for trend analysis
 * @access Private
 */
router.get('/historical-rates', isAuthenticated, (req: Request, res: Response) => {
  try {
    const awardCode = req.query.awardCode as string;
    const apprenticeYearStr = req.query.apprenticeYear as string;
    const isAdultStr = req.query.isAdult as string;
    const hasCompletedYear12Str = req.query.hasCompletedYear12 as string;
    const sector = req.query.sector as string;
    
    if (!awardCode) {
      return res.status(400).json({
        success: false,
        error: 'Award code is required'
      });
    }
    
    // Parse parameters
    const apprenticeYear = apprenticeYearStr ? parseInt(apprenticeYearStr) : 1;
    const isAdult = isAdultStr === 'true';
    const hasCompletedYear12 = hasCompletedYear12Str === 'true';
    
    // Find award
    const award = AWARDS.find(a => a.code === awardCode);
    if (!award) {
      return res.status(404).json({
        success: false,
        error: 'Award not found'
      });
    }
    
    // Generate historical data for the past 5 years
    const currentYear = new Date().getFullYear();
    const historicalData = [];
    
    for (let year = currentYear - 4; year <= currentYear; year++) {
      const rates = calculateApprenticeRate({
        awardCode,
        year,
        apprenticeYear,
        isAdult,
        hasCompletedYear12,
        sector
      });
      
      // Calculate year-over-year percentage change
      let percentageChange = null;
      if (year > currentYear - 4) {
        const prevRates = calculateApprenticeRate({
          awardCode,
          year: year - 1,
          apprenticeYear,
          isAdult,
          hasCompletedYear12,
          sector
        });
        
        percentageChange = parseFloat(
          (((rates.hourlyRate / prevRates.hourlyRate) - 1) * 100).toFixed(1)
        );
      }
      
      historicalData.push({
        year,
        rates: {
          hourly: rates.hourlyRate,
          weekly: rates.weeklyRate,
          annual: parseFloat((rates.weeklyRate * 52).toFixed(2))
        },
        percentageChange
      });
    }
    
    res.json({
      success: true,
      data: {
        award: {
          code: award.code,
          name: award.name
        },
        parameters: {
          apprenticeYear,
          isAdult,
          hasCompletedYear12,
          sector: sector || 'standard'
        },
        historicalRates: historicalData
      }
    });
  } catch (error) {
    console.error('Error fetching historical rates:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch historical rates' 
    });
  }
});

/**
 * @route GET /api/fairwork-enhanced/penalty-rates
 * @desc Get penalty rates for overtime, weekend, and holiday work
 * @access Private
 */
router.get('/penalty-rates', isAuthenticated, (req: Request, res: Response) => {
  try {
    const awardCode = req.query.awardCode as string;
    
    if (!awardCode) {
      return res.status(400).json({
        success: false,
        error: 'Award code is required'
      });
    }
    
    // Find award
    const award = AWARDS.find(a => a.code === awardCode);
    if (!award) {
      return res.status(404).json({
        success: false,
        error: 'Award not found'
      });
    }
    
    // Generate penalty rates based on award
    // In production, these would come from the actual award data
    let penaltyRates;
    
    if (awardCode === "MA000025") { // Electrical Award
      penaltyRates = {
        overtime: {
          firstTwoHours: 1.5,
          afterTwoHours: 2.0,
          sunday: 2.0,
          publicHoliday: 2.5
        },
        weekend: {
          saturday: 1.5,
          sunday: 2.0
        },
        publicHoliday: 2.5,
        shiftWork: {
          afternoon: 1.15,
          night: 1.2,
          permanentNight: 1.3
        }
      };
    } else { // Default Construction Awards
      penaltyRates = {
        overtime: {
          firstTwoHours: 1.5,
          afterTwoHours: 2.0,
          sunday: 2.0,
          publicHoliday: 2.5
        },
        weekend: {
          saturday: 1.5,
          sunday: 2.0
        },
        publicHoliday: 2.5,
        shiftWork: {
          earlyMorning: 1.5,
          afternoon: 1.5,
          night: 1.5
        }
      };
    }
    
    res.json({
      success: true,
      data: {
        award: {
          code: award.code,
          name: award.name
        },
        penaltyRates
      }
    });
  } catch (error) {
    console.error('Error fetching penalty rates:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch penalty rates' 
    });
  }
});

/**
 * @route GET /api/fairwork-enhanced/allowances
 * @desc Get allowances for an award
 * @access Private
 */
router.get('/allowances', isAuthenticated, (req: Request, res: Response) => {
  try {
    const awardCode = req.query.awardCode as string;
    
    if (!awardCode) {
      return res.status(400).json({
        success: false,
        error: 'Award code is required'
      });
    }
    
    // Find award
    const award = AWARDS.find(a => a.code === awardCode);
    if (!award) {
      return res.status(404).json({
        success: false,
        error: 'Award not found'
      });
    }
    
    // Generate allowances based on award
    // In production, these would come from the actual award data
    let allowances;
    
    if (awardCode === "MA000003") { // Building and Construction Award
      allowances = {
        industry: [
          { name: "Tool allowance", amount: 32.56, period: "weekly", trade: "carpentry" },
          { name: "Tool allowance", amount: 23.37, period: "weekly", trade: "plumbing" },
          { name: "Industry allowance", amount: 31.69, period: "weekly", description: "For construction work conditions" }
        ],
        expense: [
          { name: "Meal allowance", amount: 16.91, period: "per occasion", description: "When working overtime" },
          { name: "Travel allowance", amount: 0.89, period: "per km", description: "For using own vehicle for work" }
        ],
        skill: [
          { name: "First aid allowance", amount: 3.22, period: "per day", description: "For designated first aid officer" },
          { name: "Leading hand allowance", amount: 47.73, period: "weekly", description: "When supervising 3-10 employees" }
        ]
      };
    } else if (awardCode === "MA000025") { // Electrical Award
      allowances = {
        industry: [
          { name: "Tool allowance", amount: 19.70, period: "weekly", trade: "electrical" },
          { name: "Industry allowance", amount: 29.46, period: "weekly", description: "For electrical work conditions" }
        ],
        expense: [
          { name: "Meal allowance", amount: 15.91, period: "per occasion", description: "When working overtime" },
          { name: "Vehicle allowance", amount: 0.91, period: "per km", description: "For using own vehicle for work" }
        ],
        skill: [
          { name: "License allowance", amount: 27.65, period: "weekly", description: "For electrical license holders" }
        ]
      };
    } else { // Default
      allowances = {
        industry: [
          { name: "Tool allowance", amount: 15.50, period: "weekly" },
          { name: "Industry allowance", amount: 25.00, period: "weekly" }
        ],
        expense: [
          { name: "Meal allowance", amount: 15.00, period: "per occasion" },
          { name: "Travel allowance", amount: 0.80, period: "per km" }
        ]
      };
    }
    
    res.json({
      success: true,
      data: {
        award: {
          code: award.code,
          name: award.name
        },
        allowances
      }
    });
  } catch (error) {
    console.error('Error fetching allowances:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch allowances' 
    });
  }
});

export default router;