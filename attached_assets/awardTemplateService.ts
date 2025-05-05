import { supabase } from './supabaseClient';
import { ApprenticeYear, AwardTemplate } from '../types';

// Local storage keys
const LOCAL_AWARDS_KEY = 'r8calculator_award_templates';

// Get the current financial year (July-June)
function getCurrentFinancialYear(): number {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  
  // If we're in July-December, FY is the current year
  // If we're in January-June, FY is the previous year
  return currentMonth >= 6 ? currentYear : currentYear - 1;
}

// Default fallback data - organized by financial year
const CURRENT_FY = getCurrentFinancialYear();

const DEFAULT_AWARD_TEMPLATES: AwardTemplate[] = [
  {
    id: '1',
    code: 'MA000020',
    name: 'Building and Construction Award',
    rates: {
      year1: 23.47,
      year2: 28.17,
      year3: 32.86,
      year4: 37.56,
      qualified: 46.95
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1, // Rates effective July 1, so calendar year is FY + 1
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    code: 'MA000036',
    name: 'Plumbing and Fire Sprinklers Award',
    rates: {
      year1: 24.38,
      year2: 28.93,
      year3: 33.95,
      year4: 39.01,
      qualified: 48.76
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1, // Rates effective July 1, so calendar year is FY + 1
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    code: 'MA000025',
    name: 'Electrical Award',
    rates: {
      year1: 25.77,
      year2: 30.24,
      year3: 34.71,
      year4: 39.22,
      qualified: 49.02
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1, // Rates effective July 1, so calendar year is FY + 1
    updated_at: new Date().toISOString()
  }
];

// Add adult apprentice rates
const DEFAULT_ADULT_AWARD_TEMPLATES: AwardTemplate[] = [
  {
    id: '1-adult',
    code: 'MA000020',
    name: 'Building and Construction Award (Adult)',
    rates: {
      year1: 42.25,
      year2: 42.25,
      year3: 42.25,
      year4: 42.25,
      qualified: 46.95
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1,
    updated_at: new Date().toISOString(),
    is_adult: true
  },
  {
    id: '2-adult',
    code: 'MA000036',
    name: 'Plumbing and Fire Sprinklers Award (Adult)',
    rates: {
      year1: 43.89,
      year2: 43.89,
      year3: 43.89,
      year4: 43.89,
      qualified: 48.76
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1,
    updated_at: new Date().toISOString(),
    is_adult: true
  }
];

// Add sector-specific rates
const DEFAULT_SECTOR_AWARD_TEMPLATES: AwardTemplate[] = [
  {
    id: '1-residential',
    code: 'MA000020',
    name: 'Building and Construction Award (Residential)',
    rates: {
      year1: 22.30,
      year2: 26.76,
      year3: 31.22,
      year4: 35.68,
      qualified: 44.60
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1,
    updated_at: new Date().toISOString(),
    sector: 'residential'
  },
  {
    id: '1-commercial',
    code: 'MA000020',
    name: 'Building and Construction Award (Commercial)',
    rates: {
      year1: 23.47,
      year2: 28.17,
      year3: 32.86,
      year4: 37.56,
      qualified: 46.95
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1,
    updated_at: new Date().toISOString(),
    sector: 'commercial'
  },
  {
    id: '1-civil',
    code: 'MA000020',
    name: 'Building and Construction Award (Civil)',
    rates: {
      year1: 24.64,
      year2: 29.58,
      year3: 34.50,
      year4: 39.44,
      qualified: 49.30
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1,
    updated_at: new Date().toISOString(),
    sector: 'civil'
  }
];

// Add year 12 completion rates
const DEFAULT_YEAR12_AWARD_TEMPLATES: AwardTemplate[] = [
  {
    id: '1-year12',
    code: 'MA000020',
    name: 'Building and Construction Award (Year 12 Completed)',
    rates: {
      year1: 25.82,
      year2: 30.52,
      year3: 32.86,
      year4: 37.56,
      qualified: 46.95
    },
    financial_year: CURRENT_FY,
    calendar_year: CURRENT_FY + 1,
    updated_at: new Date().toISOString(),
    has_completed_year12: true
  }
];

// Historical rates for previous financial years (used as fallback)
const DEFAULT_HISTORICAL_AWARDS: Record<number, AwardTemplate[]> = {
  [CURRENT_FY-1]: [
    {
      id: '1-prev',
      code: 'MA000020',
      name: 'Building and Construction Award',
      rates: {
        year1: 22.28,
        year2: 26.74,
        year3: 31.20,
        year4: 35.65,
        qualified: 44.55
      },
      financial_year: CURRENT_FY-1,
      calendar_year: CURRENT_FY, // Rates effective July 1, so calendar year is FY + 1
      updated_at: new Date().toISOString()
    },
    {
      id: '2-prev',
      code: 'MA000036',
      name: 'Plumbing and Fire Sprinklers Award',
      rates: {
        year1: 23.17,
        year2: 27.50,
        year3: 32.26,
        year4: 37.07,
        qualified: 46.36
      },
      financial_year: CURRENT_FY-1,
      calendar_year: CURRENT_FY, // Rates effective July 1, so calendar year is FY + 1
      updated_at: new Date().toISOString()
    },
    {
      id: '3-prev',
      code: 'MA000025',
      name: 'Electrical Award',
      rates: {
        year1: 24.50,
        year2: 28.75,
        year3: 33.00,
        year4: 37.27,
        qualified: 46.60
      },
      financial_year: CURRENT_FY-1,
      calendar_year: CURRENT_FY, // Rates effective July 1, so calendar year is FY + 1
      updated_at: new Date().toISOString()
    }
  ],
  [CURRENT_FY-2]: [
    {
      id: '1-prev2',
      code: 'MA000020',
      name: 'Building and Construction Award',
      rates: {
        year1: 21.08,
        year2: 25.30,
        year3: 29.51,
        year4: 33.73,
        qualified: 42.14
      },
      financial_year: CURRENT_FY-2,
      calendar_year: CURRENT_FY-1, // Rates effective July 1, so calendar year is FY + 1
      updated_at: new Date().toISOString()
    },
    {
      id: '2-prev2',
      code: 'MA000036',
      name: 'Plumbing and Fire Sprinklers Award',
      rates: {
        year1: 21.92,
        year2: 26.02,
        year3: 30.52,
        year4: 35.06,
        qualified: 43.84
      },
      financial_year: CURRENT_FY-2,
      calendar_year: CURRENT_FY-1, // Rates effective July 1, so calendar year is FY + 1
      updated_at: new Date().toISOString()
    },
    {
      id: '3-prev2',
      code: 'MA000025',
      name: 'Electrical Award',
      rates: {
        year1: 23.18,
        year2: 27.20,
        year3: 31.21,
        year4: 35.26,
        qualified: 44.08
      },
      financial_year: CURRENT_FY-2,
      calendar_year: CURRENT_FY-1, // Rates effective July 1, so calendar year is FY + 1
      updated_at: new Date().toISOString()
    }
  ]
};

/**
 * Load award templates from local storage
 */
export async function loadAwardTemplatesFromLocalStorage(): Promise<AwardTemplate[]> {
  try {
    const storedAwards = localStorage.getItem(LOCAL_AWARDS_KEY);
    if (storedAwards) {
      return JSON.parse(storedAwards);
    }
  } catch (error) {
    console.error('Error loading award templates from local storage:', error);
  }
  
  // If nothing in storage or error, use defaults and save them
  const allTemplates = [
    ...DEFAULT_AWARD_TEMPLATES,
    ...DEFAULT_ADULT_AWARD_TEMPLATES,
    ...DEFAULT_SECTOR_AWARD_TEMPLATES,
    ...DEFAULT_YEAR12_AWARD_TEMPLATES,
    ...DEFAULT_HISTORICAL_AWARDS[CURRENT_FY-1] || [],
    ...DEFAULT_HISTORICAL_AWARDS[CURRENT_FY-2] || []
  ];
  
  saveAwardTemplatesToLocalStorage(allTemplates);
  return allTemplates;
}

/**
 * Save award templates to local storage
 */
export function saveAwardTemplatesToLocalStorage(awards: AwardTemplate[]): void {
  try {
    localStorage.setItem(LOCAL_AWARDS_KEY, JSON.stringify(awards));
  } catch (error) {
    console.error('Error saving award templates to local storage:', error);
  }
}

/**
 * Fetch all available award templates
 * First tries from Supabase, falls back to local storage if needed
 */
export async function fetchAwardTemplates(year?: number): Promise<AwardTemplate[]> {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (isAuthenticated) {
      try {
        // Try to fetch from Supabase
        let query = supabase
          .from('award_templates')
          .select('*')
          .order('name');
          
        // If year is specified, filter by that year
        if (year) {
          query = query.eq('calendar_year', year);
        }

        const { data, error } = await query;

        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
            return await loadAwardTemplatesFromLocalStorage();
          }
          throw error;
        }

        if (data && data.length > 0) {
          // Also update local storage with the latest data
          saveAwardTemplatesToLocalStorage(data);
          return data;
        }
      } catch (error) {
        console.warn('Error fetching award templates from Supabase:', error);
        // Fall back to local storage
        return await loadAwardTemplatesFromLocalStorage();
      }
    }

    // Not authenticated or no data from DB
    return await loadAwardTemplatesFromLocalStorage();
  } catch (error) {
    console.error('Error in fetchAwardTemplates:', error);
    
    // Use appropriate default templates based on year
    if (year) {
      // Find matching financial year
      const fy = year - 1; // Convert calendar year to financial year
      if (DEFAULT_HISTORICAL_AWARDS[fy]) {
        return DEFAULT_HISTORICAL_AWARDS[fy];
      }
    }
    
    return DEFAULT_AWARD_TEMPLATES;
  }
}

/**
 * Fetch a specific award template by ID
 * Tries Supabase first, falls back to local storage
 */
export async function fetchAwardTemplateById(id: string): Promise<AwardTemplate | null> {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    // If using a local ID format, get from local storage
    if (id.startsWith('local-')) {
      const templates = await loadAwardTemplatesFromLocalStorage();
      return templates.find(t => t.id === id) || null;
    }
    
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('award_templates')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
            const templates = await loadAwardTemplatesFromLocalStorage();
            return templates.find(t => t.id === id) || null;
          }
          throw error;
        }
        
        return data;
      } catch (error) {
        console.warn('Error fetching award template by ID from Supabase:', error);
        // Fall back to local storage
        const templates = await loadAwardTemplatesFromLocalStorage();
        return templates.find(t => t.id === id) || null;
      }
    }
    
    // Not authenticated, use local storage
    const templates = await loadAwardTemplatesFromLocalStorage();
    return templates.find(t => t.id === id) || null;
  } catch (error) {
    console.error('Error in fetchAwardTemplateById:', error);
    return null;
  }
}

/**
 * Create a new award template
 * Tries Supabase if authenticated, falls back to local storage
 */
export async function createAwardTemplate(
  award: Omit<AwardTemplate, 'id' | 'updated_at'>
): Promise<{ award: AwardTemplate | null; isLocal: boolean; error: any }> {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    // Ensure calendar_year and financial_year are set
    if (!award.calendar_year) {
      award.calendar_year = CURRENT_FY + 1; // Current FY + 1 for rates effective July 1
    }
    
    if (!award.financial_year) {
      award.financial_year = award.calendar_year - 1; // Calendar year - 1 for financial year
    }
    
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('award_templates')
          .insert({
            ...award,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
            return await createAwardTemplateInLocalStorage(award);
          }
          return { award: null, isLocal: false, error };
        }
        
        // Also update local storage
        const localTemplates = await loadAwardTemplatesFromLocalStorage();
        saveAwardTemplatesToLocalStorage([...localTemplates, data]);
        
        return { award: data, isLocal: false, error: null };
      } catch (error) {
        console.warn('Error creating award template in Supabase:', error);
        return await createAwardTemplateInLocalStorage(award);
      }
    }
    
    // Not authenticated, use local storage
    return await createAwardTemplateInLocalStorage(award);
  } catch (error) {
    console.error('Error in createAwardTemplate:', error);
    return { award: null, isLocal: true, error };
  }
}

/**
 * Create an award template in local storage
 */
async function createAwardTemplateInLocalStorage(
  award: Omit<AwardTemplate, 'id' | 'updated_at'>
): Promise<{ award: AwardTemplate | null; isLocal: boolean; error: any }> {
  try {
    const templates = await loadAwardTemplatesFromLocalStorage();
    
    const newTemplate: AwardTemplate = {
      ...award,
      id: `local-${Date.now()}`,
      updated_at: new Date().toISOString()
    };
    
    const updatedTemplates = [...templates, newTemplate];
    saveAwardTemplatesToLocalStorage(updatedTemplates);
    
    return { award: newTemplate, isLocal: true, error: null };
  } catch (error) {
    console.error('Error creating award template in local storage:', error);
    return { award: null, isLocal: true, error };
  }
}

/**
 * Update an existing award template
 * Tries Supabase if authenticated, falls back to local storage
 */
export async function updateAwardTemplate(
  id: string, 
  updates: Partial<AwardTemplate>
): Promise<{ award: AwardTemplate | null; isLocal: boolean; error: any }> {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    // If using a local ID format, update in local storage
    if (id.startsWith('local-')) {
      return await updateAwardTemplateInLocalStorage(id, updates);
    }
    
    if (isAuthenticated) {
      try {
        // Don't send the id in the updates
        const { id: _, ...updateData } = updates;
        
        const { data, error } = await supabase
          .from('award_templates')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
            return await updateAwardTemplateInLocalStorage(id, updates);
          }
          return { award: null, isLocal: false, error };
        }
        
        // Also update local storage
        const localTemplates = await loadAwardTemplatesFromLocalStorage();
        const updatedTemplates = localTemplates.map(t => t.id === id ? data : t);
        saveAwardTemplatesToLocalStorage(updatedTemplates);
        
        return { award: data, isLocal: false, error: null };
      } catch (error) {
        console.warn('Error updating award template in Supabase:', error);
        return await updateAwardTemplateInLocalStorage(id, updates);
      }
    }
    
    // Not authenticated, use local storage
    return await updateAwardTemplateInLocalStorage(id, updates);
  } catch (error) {
    console.error('Error in updateAwardTemplate:', error);
    return { award: null, isLocal: true, error };
  }
}

/**
 * Update an award template in local storage
 */
async function updateAwardTemplateInLocalStorage(
  id: string, 
  updates: Partial<AwardTemplate>
): Promise<{ award: AwardTemplate | null; isLocal: boolean; error: any }> {
  try {
    const templates = await loadAwardTemplatesFromLocalStorage();
    
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) {
      return { award: null, isLocal: true, error: 'Award template not found' };
    }
    
    const updatedTemplate = {
      ...templates[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const updatedTemplates = [
      ...templates.slice(0, index),
      updatedTemplate,
      ...templates.slice(index + 1)
    ];
    
    saveAwardTemplatesToLocalStorage(updatedTemplates);
    
    return { award: updatedTemplate, isLocal: true, error: null };
  } catch (error) {
    console.error('Error updating award template in local storage:', error);
    return { award: null, isLocal: true, error };
  }
}

/**
 * Delete an award template
 * Tries Supabase if authenticated, falls back to local storage
 */
export async function deleteAwardTemplate(
  id: string
): Promise<{ success: boolean; isLocal: boolean; error: any }> {
  try {
    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    // If using a local ID format, delete from local storage
    if (id.startsWith('local-')) {
      return await deleteAwardTemplateFromLocalStorage(id);
    }
    
    if (isAuthenticated) {
      try {
        const { error } = await supabase
          .from('award_templates')
          .delete()
          .eq('id', id);
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
            return await deleteAwardTemplateFromLocalStorage(id);
          }
          return { success: false, isLocal: false, error };
        }
        
        // Also update local storage
        const localTemplates = await loadAwardTemplatesFromLocalStorage();
        const updatedTemplates = localTemplates.filter(t => t.id !== id);
        saveAwardTemplatesToLocalStorage(updatedTemplates);
        
        return { success: true, isLocal: false, error: null };
      } catch (error) {
        console.warn('Error deleting award template from Supabase:', error);
        return await deleteAwardTemplateFromLocalStorage(id);
      }
    }
    
    // Not authenticated, use local storage
    return await deleteAwardTemplateFromLocalStorage(id);
  } catch (error) {
    console.error('Error in deleteAwardTemplate:', error);
    return { success: false, isLocal: true, error };
  }
}

/**
 * Delete an award template from local storage
 */
async function deleteAwardTemplateFromLocalStorage(
  id: string
): Promise<{ success: boolean; isLocal: boolean; error: any }> {
  try {
    const templates = await loadAwardTemplatesFromLocalStorage();
    
    const updatedTemplates = templates.filter(t => t.id !== id);
    if (updatedTemplates.length === templates.length) {
      return { success: false, isLocal: true, error: 'Award template not found' };
    }
    
    saveAwardTemplatesToLocalStorage(updatedTemplates);
    
    return { success: true, isLocal: true, error: null };
  } catch (error) {
    console.error('Error deleting award template from local storage:', error);
    return { success: false, isLocal: true, error };
  }
}

/**
 * Get the pay rate for a specific apprentice year from an award template
 */
export function getApprenticeRateForYear(award: AwardTemplate, year: ApprenticeYear): number | null {
  if (!award || !award.rates) return null;

  switch (year) {
    case 1:
      return award.rates.year1;
    case 2:
      return award.rates.year2;
    case 3:
      return award.rates.year3;
    case 4:
      return award.rates.year4;
    default:
      return null;
  }
}

/**
 * Update an apprentice profile with an award template
 */
export async function updateApprenticeWithAward(
  apprenticeId: string, 
  awardId: string, 
  year: ApprenticeYear
): Promise<{ success: boolean; isLocal: boolean; error: any }> {
  try {
    // First, fetch the award template to get the rates
    const award = await fetchAwardTemplateById(awardId);
    if (!award) {
      return { success: false, isLocal: false, error: 'Award template not found' };
    }

    // Get the rate for the specific year
    const rate = getApprenticeRateForYear(award, year);
    if (rate === null) {
      return { success: false, isLocal: false, error: `No rate found for year ${year}` };
    }

    // Check if user is authenticated
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (isAuthenticated) {
      try {
        // Update the apprentice profile in Supabase
        const { error } = await supabase
          .from('apprentice_profiles')
          .update({
            award_template_id: awardId,
            base_pay_rate: rate,
            updated_at: new Date().toISOString()
          })
          .eq('id', apprenticeId);

        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for apprentice_profiles table');
            // We'll handle this in context, no local storage update needed here
            return { success: false, isLocal: false, error: 'Permission denied' };
          }
          return { success: false, isLocal: false, error };
        }

        return { success: true, isLocal: false, error: null };
      } catch (error) {
        console.warn('Error updating apprentice profile with award in Supabase:', error);
        return { success: false, isLocal: false, error };
      }
    }

    // Not authenticated or database error, handle via context API
    return { success: false, isLocal: true, error: 'Not authenticated' };
  } catch (error) {
    console.error('Error updating apprentice with award:', error);
    return { success: false, isLocal: true, error };
  }
}

/**
 * Fetch award templates for a specific calendar year
 * If no templates are found for the specified year, returns templates for the most recent year
 */
export async function fetchAwardTemplatesByYear(year: number): Promise<AwardTemplate[]> {
  try {
    // First try to get templates for the specified year
    let templates = await fetchAwardTemplates(year);
    
    // If no templates found for specified year, try to get the most recent year's templates
    if (templates.length === 0) {
      const allTemplates = await loadAwardTemplatesFromLocalStorage();
      
      // Group templates by year
      const templatesByCalendarYear: Record<number, AwardTemplate[]> = {};
      allTemplates.forEach(template => {
        const templateYear = template.calendar_year || CURRENT_FY + 1;
        if (!templatesByCalendarYear[templateYear]) {
          templatesByCalendarYear[templateYear] = [];
        }
        templatesByCalendarYear[templateYear].push(template);
      });
      
      // Find the most recent year that has templates
      const years = Object.keys(templatesByCalendarYear).map(Number).sort((a, b) => b - a);
      if (years.length > 0) {
        templates = templatesByCalendarYear[years[0]];
      } else {
        // If still no templates, use default templates
        templates = DEFAULT_AWARD_TEMPLATES;
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Error fetching award templates by year:', error);
    
    // Try to get default templates for the specified financial year
    const fy = year - 1; // Calendar year to financial year
    if (DEFAULT_HISTORICAL_AWARDS[fy]) {
      return DEFAULT_HISTORICAL_AWARDS[fy];
    }
    
    return DEFAULT_AWARD_TEMPLATES;
  }
}

/**
 * Fetch award templates for a specific financial year
 */
export async function fetchAwardTemplatesByFinancialYear(financialYear: number): Promise<AwardTemplate[]> {
  try {
    // Convert financial year to calendar year for API calls
    const calendarYear = financialYear + 1;
    
    // First try to get from Supabase
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('award_templates')
          .select('*')
          .eq('financial_year', financialYear)
          .order('name');
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
          } else {
            throw error;
          }
        } else if (data && data.length > 0) {
          // Update local storage with the latest data
          saveAwardTemplatesToLocalStorage([
            ...await loadAwardTemplatesFromLocalStorage().then(templates => 
              templates.filter(t => t.financial_year !== financialYear)
            ),
            ...data
          ]);
          return data;
        }
      } catch (error) {
        console.warn('Error fetching award templates by financial year from Supabase:', error);
      }
    }
    
    // Fall back to local storage
    const allTemplates = await loadAwardTemplatesFromLocalStorage();
    const templatesForFY = allTemplates.filter(t => t.financial_year === financialYear);
    
    if (templatesForFY.length > 0) {
      return templatesForFY;
    }
    
    // If no templates in local storage for the financial year, use default templates
    if (DEFAULT_HISTORICAL_AWARDS[financialYear]) {
      return DEFAULT_HISTORICAL_AWARDS[financialYear];
    }
    
    // If no default templates for the financial year, use current FY templates
    return DEFAULT_AWARD_TEMPLATES;
  } catch (error) {
    console.error('Error fetching award templates by financial year:', error);
    
    // Try to get default templates for the specified financial year
    if (DEFAULT_HISTORICAL_AWARDS[financialYear]) {
      return DEFAULT_HISTORICAL_AWARDS[financialYear];
    }
    
    return DEFAULT_AWARD_TEMPLATES;
  }
}

/**
 * Fetch award templates by sector
 */
export async function fetchAwardTemplatesBySector(sector: string): Promise<AwardTemplate[]> {
  try {
    // First try to get from Supabase
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('award_templates')
          .select('*')
          .eq('sector', sector)
          .order('name');
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
          } else {
            throw error;
          }
        } else if (data && data.length > 0) {
          return data;
        }
      } catch (error) {
        console.warn('Error fetching award templates by sector from Supabase:', error);
      }
    }
    
    // Fall back to local storage
    const allTemplates = await loadAwardTemplatesFromLocalStorage();
    const templatesForSector = allTemplates.filter(t => t.sector === sector);
    
    if (templatesForSector.length > 0) {
      return templatesForSector;
    }
    
    // If no templates in local storage for the sector, use default sector templates
    const defaultSectorTemplates = DEFAULT_SECTOR_AWARD_TEMPLATES.filter(t => t.sector === sector);
    if (defaultSectorTemplates.length > 0) {
      return defaultSectorTemplates;
    }
    
    // If no default templates for the sector, return empty array
    return [];
  } catch (error) {
    console.error('Error fetching award templates by sector:', error);
    return DEFAULT_SECTOR_AWARD_TEMPLATES.filter(t => t.sector === sector);
  }
}

/**
 * Fetch award templates for adult apprentices
 */
export async function fetchAdultAwardTemplates(): Promise<AwardTemplate[]> {
  try {
    // First try to get from Supabase
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('award_templates')
          .select('*')
          .eq('is_adult', true)
          .order('name');
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
          } else {
            throw error;
          }
        } else if (data && data.length > 0) {
          return data;
        }
      } catch (error) {
        console.warn('Error fetching adult award templates from Supabase:', error);
      }
    }
    
    // Fall back to local storage
    const allTemplates = await loadAwardTemplatesFromLocalStorage();
    const adultTemplates = allTemplates.filter(t => t.is_adult === true);
    
    if (adultTemplates.length > 0) {
      return adultTemplates;
    }
    
    // If no templates in local storage, use default adult templates
    return DEFAULT_ADULT_AWARD_TEMPLATES;
  } catch (error) {
    console.error('Error fetching adult award templates:', error);
    return DEFAULT_ADULT_AWARD_TEMPLATES;
  }
}

/**
 * Fetch award templates for apprentices who completed year 12
 */
export async function fetchYear12AwardTemplates(): Promise<AwardTemplate[]> {
  try {
    // First try to get from Supabase
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session;
    
    if (isAuthenticated) {
      try {
        const { data, error } = await supabase
          .from('award_templates')
          .select('*')
          .eq('has_completed_year12', true)
          .order('name');
        
        if (error) {
          if (error.message.includes('permission denied')) {
            console.warn('Permission denied for award_templates table, using local storage');
          } else {
            throw error;
          }
        } else if (data && data.length > 0) {
          return data;
        }
      } catch (error) {
        console.warn('Error fetching year 12 award templates from Supabase:', error);
      }
    }
    
    // Fall back to local storage
    const allTemplates = await loadAwardTemplatesFromLocalStorage();
    const year12Templates = allTemplates.filter(t => t.has_completed_year12 === true);
    
    if (year12Templates.length > 0) {
      return year12Templates;
    }
    
    // If no templates in local storage, use default year 12 templates
    return DEFAULT_YEAR12_AWARD_TEMPLATES;
  } catch (error) {
    console.error('Error fetching year 12 award templates:', error);
    return DEFAULT_YEAR12_AWARD_TEMPLATES;
  }
}

/**
 * Check if a new financial year has started recently
 */
export function hasFinancialYearChanged(): boolean {
  // Check if we're in July (month index 6)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  
  // Return true if we're in July (first month of new FY) and within the first 14 days
  return currentMonth === 6 && currentDate <= 14;
}

export default {
  fetchAwardTemplates,
  fetchAwardTemplateById,
  getApprenticeRateForYear,
  updateApprenticeWithAward,
  createAwardTemplate,
  updateAwardTemplate,
  deleteAwardTemplate,
  loadAwardTemplatesFromLocalStorage,
  saveAwardTemplatesToLocalStorage,
  fetchAwardTemplatesByYear,
  fetchAwardTemplatesByFinancialYear,
  fetchAwardTemplatesBySector,
  fetchAdultAwardTemplates,
  fetchYear12AwardTemplates,
  hasFinancialYearChanged,
  getCurrentFinancialYear
};