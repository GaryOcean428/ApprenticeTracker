import { saveAs } from 'file-saver';
import { ApprenticeProfile } from '../types';

export interface ExportData {
  apprentices: ApprenticeProfile[];
  exportDate: string;
  version: string;
}

/**
 * Validates an apprentice profile object
 */
function validateApprenticeProfile(apprentice: any): string | null {
  if (!apprentice) return 'Apprentice profile is null or undefined';
  if (!apprentice.id) return 'Apprentice ID is missing';
  if (!apprentice.name) return 'Apprentice name is missing';
  if (![1, 2, 3, 4].includes(apprentice.year)) return 'Invalid apprentice year, must be between 1 and 4';
  if (typeof apprentice.basePayRate !== 'number') return 'Base pay rate must be a number';
  if (apprentice.basePayRate <= 0) return 'Base pay rate must be greater than 0';
  if (!apprentice.costConfig) return 'Cost configuration is missing';
  if (!apprentice.workConfig) return 'Work configuration is missing';
  if (!apprentice.billableOptions) return 'Billable options are missing';
  
  // Validate cost config
  const cc = apprentice.costConfig;
  if (typeof cc.superRate !== 'number') return 'Superannuation rate must be a number';
  if (typeof cc.wcRate !== 'number') return 'Workers compensation rate must be a number';
  if (typeof cc.payrollTaxRate !== 'number') return 'Payroll tax rate must be a number';
  if (typeof cc.leaveLoading !== 'number') return 'Leave loading rate must be a number';
  if (typeof cc.studyCost !== 'number') return 'Study cost must be a number';
  if (typeof cc.ppeCost !== 'number') return 'PPE cost must be a number';
  if (typeof cc.adminRate !== 'number') return 'Admin rate must be a number';
  if (typeof cc.defaultMargin !== 'number') return 'Default margin must be a number';
  if (typeof cc.adverseWeatherDays !== 'number') return 'Adverse weather days must be a number';
  
  // Validate work config
  const wc = apprentice.workConfig;
  if (typeof wc.hoursPerDay !== 'number') return 'Hours per day must be a number';
  if (typeof wc.daysPerWeek !== 'number') return 'Days per week must be a number';
  if (typeof wc.weeksPerYear !== 'number') return 'Weeks per year must be a number';
  if (typeof wc.annualLeaveDays !== 'number') return 'Annual leave days must be a number';
  if (typeof wc.publicHolidays !== 'number') return 'Public holidays must be a number';
  if (typeof wc.sickLeaveDays !== 'number') return 'Sick leave days must be a number';
  if (typeof wc.trainingWeeks !== 'number') return 'Training weeks must be a number';
  
  // Validate billable options
  const bo = apprentice.billableOptions;
  if (typeof bo.includeAnnualLeave !== 'boolean') return 'Include annual leave must be a boolean';
  if (typeof bo.includePublicHolidays !== 'boolean') return 'Include public holidays must be a boolean';
  if (typeof bo.includeSickLeave !== 'boolean') return 'Include sick leave must be a boolean';
  if (typeof bo.includeTrainingTime !== 'boolean') return 'Include training time must be a boolean';
  if (typeof bo.includeAdverseWeather !== 'boolean') return 'Include adverse weather must be a boolean';
  
  return null; // No errors found
}

/**
 * Export apprentice data as a JSON file
 */
export function exportApprenticeData(apprentices: ApprenticeProfile[]): boolean {
  try {
    // Validate each apprentice profile
    const invalidApprentices = apprentices.map(apprentice => {
      const error = validateApprenticeProfile(apprentice);
      return { apprentice, error };
    }).filter(result => result.error !== null);
    
    if (invalidApprentices.length > 0) {
      console.error('Invalid apprentice profiles detected:', invalidApprentices);
      throw new Error(`Found ${invalidApprentices.length} invalid apprentice profiles. First error: ${invalidApprentices[0].error}`);
    }
    
    // Prepare data for export
    const exportData: ExportData = {
      apprentices,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob and save the file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = `r8-calculator-export-${new Date().toISOString().split('T')[0]}.json`;
    
    saveAs(blob, filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting apprentice data:', error);
    return false;
  }
}

/**
 * Import apprentice data from a JSON file
 */
export function importApprenticeData(file: File): Promise<ApprenticeProfile[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        
        if (typeof result !== 'string') {
          reject(new Error('Invalid file format'));
          return;
        }
        
        let importData: ExportData;
        try {
          importData = JSON.parse(result) as ExportData;
        } catch (error) {
          reject(new Error('Invalid JSON format'));
          return;
        }
        
        // Validate the data structure
        if (!importData.apprentices || !Array.isArray(importData.apprentices)) {
          reject(new Error('Invalid import data structure: missing apprentices array'));
          return;
        }
        
        if (!importData.version) {
          console.warn('Import data does not include version information');
        }
        
        // Check each apprentice for validity
        for (let i = 0; i < importData.apprentices.length; i++) {
          const apprentice = importData.apprentices[i];
          const validationError = validateApprenticeProfile(apprentice);
          
          if (validationError) {
            reject(new Error(`Invalid apprentice profile at position ${i}: ${validationError}`));
            return;
          }
        }
        
        // Fix dates - JSON.parse doesn't automatically convert date strings to Date objects
        const fixedApprentices = importData.apprentices.map(apprentice => ({
          ...apprentice,
          createdAt: new Date(apprentice.createdAt),
          updatedAt: new Date(apprentice.updatedAt)
        }));
        
        resolve(fixedApprentices);
      } catch (error) {
        reject(new Error(`Failed to parse import file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = (error) => {
      reject(new Error('Error reading file: ' + (error?.target?.error?.message || 'Unknown error')));
    };
    
    reader.readAsText(file);
  });
}

export default {
  exportApprenticeData,
  importApprenticeData
};