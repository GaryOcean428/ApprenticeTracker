import { 
  CostConfig, 
  WorkConfig, 
  BillableOptions, 
  CalculationResult, 
  OnCosts, 
  ApprenticeProfile 
} from '../types';

export function calculateTotalAnnualHours(workConfig: WorkConfig): number {
  return workConfig.hoursPerDay * workConfig.daysPerWeek * workConfig.weeksPerYear;
}

export function calculateBillableHours(
  workConfig: WorkConfig, 
  costConfig: CostConfig, 
  billableOptions: BillableOptions
): number {
  let unbilledDays = 0;
  let unbilledWeeks = 0;
  
  // Only count days/weeks as unbilled if they should NOT be included in billable time
  if (!billableOptions.includeAnnualLeave) {
    unbilledDays += workConfig.annualLeaveDays;
  }
  if (!billableOptions.includePublicHolidays) {
    unbilledDays += workConfig.publicHolidays;
  }
  if (!billableOptions.includeSickLeave) {
    unbilledDays += workConfig.sickLeaveDays;
  }
  if (!billableOptions.includeAdverseWeather) {
    unbilledDays += costConfig.adverseWeatherDays;
  }
  
  // Convert unbilled days to weeks
  unbilledWeeks += unbilledDays / workConfig.daysPerWeek;
  
  // Add training weeks if they should not be included
  if (!billableOptions.includeTrainingTime) {
    unbilledWeeks += workConfig.trainingWeeks;
  }

  const billableWeeks = workConfig.weeksPerYear - unbilledWeeks;
  return workConfig.hoursPerDay * workConfig.daysPerWeek * billableWeeks;
}

export function calculateOnCosts(payRate: number, totalHours: number, config: CostConfig): OnCosts {
  const baseWage = payRate * totalHours;
  const annualLeaveHours = Math.min(totalHours, 152); // Max 4 weeks at 38 hours/week
  return {
    superannuation: baseWage * config.superRate,
    workersComp: baseWage * config.wcRate,
    payrollTax: baseWage * config.payrollTaxRate,
    leaveLoading: payRate * annualLeaveHours * config.leaveLoading,
    studyCost: config.studyCost,
    ppeCost: config.ppeCost,
    adminCost: baseWage * config.adminRate,
  };
}

export function calculateChargeRate(
  payRate: number,
  workConfig: WorkConfig,
  costConfig: CostConfig,
  billableOptions: BillableOptions,
  margin: number = costConfig.defaultMargin
): CalculationResult {
  const totalHours = calculateTotalAnnualHours(workConfig);
  const billableHours = calculateBillableHours(workConfig, costConfig, billableOptions);
  const baseWage = payRate * totalHours;
  const oncosts = calculateOnCosts(payRate, totalHours, costConfig);
  const totalOnCosts = Object.values(oncosts).reduce((sum, cost) => sum + cost, 0);
  const totalCost = baseWage + totalOnCosts;
  const costPerHour = totalCost / billableHours;
  const chargeRate = costPerHour * (1 + margin);

  return {
    payRate,
    totalHours,
    billableHours,
    baseWage,
    oncosts,
    totalCost,
    costPerHour,
    chargeRate,
  };
}

export function calculateAllApprentices(apprentices: ApprenticeProfile[]): ApprenticeProfile[] {
  return apprentices.map(apprentice => {
    const result = calculateChargeRate(
      apprentice.basePayRate,
      apprentice.workConfig,
      apprentice.costConfig,
      apprentice.billableOptions,
      apprentice.costConfig.defaultMargin
    );
    
    return {
      ...apprentice,
      result,
      updatedAt: new Date()
    };
  });
}

// Default configurations
export const initialCostConfig: CostConfig = {
  superRate: 0.115,         // 11.5% superannuation
  wcRate: 0.047,            // 4.7% workers' compensation
  payrollTaxRate: 0.0485,   // 4.85% payroll tax
  leaveLoading: 0.175,      // 17.5% leave loading
  studyCost: 850,           // $850/year study cost
  ppeCost: 300,             // $300/year PPE cost
  adminRate: 0.17,          // 17% admin overhead
  defaultMargin: 0.15,      // 15% profit margin
  adverseWeatherDays: 5,    // 5 days of adverse weather per year
};

export const initialWorkConfig: WorkConfig = {
  hoursPerDay: 7.6,
  daysPerWeek: 5,
  weeksPerYear: 52,
  annualLeaveDays: 20,
  publicHolidays: 10,
  sickLeaveDays: 10,
  trainingWeeks: 5,
};

export const initialBillableOptions: BillableOptions = {
  includeAnnualLeave: false,
  includePublicHolidays: false,
  includeSickLeave: false,
  includeTrainingTime: false,
  includeAdverseWeather: false,
};

// Generate default apprentice profiles for each year
export function generateDefaultApprenticeProfiles(): ApprenticeProfile[] {
  // Default pay rates for each year based on typical progression
  const defaultRates = {
    1: 20.50, // 1st year
    2: 24.75, // 2nd year
    3: 28.90, // 3rd year
    4: 33.25  // 4th year
  };

  // Generate one profile for each apprentice year
  return [1, 2, 3, 4].map(year => ({
    id: `default-year-${year}`,
    name: `Year ${year} Apprentice`,
    year: year as 1 | 2 | 3 | 4,
    basePayRate: defaultRates[year as 1 | 2 | 3 | 4],
    customSettings: false,
    costConfig: { ...initialCostConfig },
    workConfig: { ...initialWorkConfig },
    billableOptions: { ...initialBillableOptions },
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

// Format helpers
export const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
export const formatHours = (value: number) => `${value.toFixed(1)}`;
export const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;