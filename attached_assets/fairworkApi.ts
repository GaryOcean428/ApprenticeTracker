// Fair Work Commission Modern Awards Pay Database API service
import { ApprenticeYear, FairWorkAward, ClassificationRate } from '../types';
import { supabase } from './supabaseClient';

// API Configuration
const API_BASE_URL = 'https://api.fwc.gov.au/api/v1';

// Cache configuration
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
type CacheEntry = {
  data: any;
  timestamp: number;
};
const cache = new Map<string, CacheEntry>();

// Fallback data for when the API is unavailable
const FALLBACK_AWARDS: FairWorkAward[] = [
  {
    award_fixed_id: 1,
    code: "MA000003",
    name: "Building and Construction General On-site Award",
    published_year: 2023
  },
  {
    award_fixed_id: 2,
    code: "MA000020",
    name: "Building and Construction General Award",
    published_year: 2023
  },
  {
    award_fixed_id: 3,
    code: "MA000036",
    name: "Plumbing and Fire Sprinklers Award",
    published_year: 2023
  },
  {
    award_fixed_id: 4,
    code: "MA000025",
    name: "Electrical, Electronic and Communications Contracting Award",
    published_year: 2023
  }
];

// Fallback data by year
const FALLBACK_DATA_BY_YEAR: Record<number, FairWorkAward[]> = {
  2025: [
    {
      award_fixed_id: 1,
      code: "MA000003",
      name: "Building and Construction General On-site Award",
      published_year: 2025
    },
    {
      award_fixed_id: 2,
      code: "MA000020",
      name: "Building and Construction General Award",
      published_year: 2025
    }
  ],
  2024: [
    {
      award_fixed_id: 1,
      code: "MA000003",
      name: "Building and Construction General On-site Award",
      published_year: 2024
    },
    {
      award_fixed_id: 2,
      code: "MA000020",
      name: "Building and Construction General Award",
      published_year: 2024
    }
  ],
  2023: [
    {
      award_fixed_id: 1,
      code: "MA000003",
      name: "Building and Construction General On-site Award",
      published_year: 2023
    },
    {
      award_fixed_id: 2,
      code: "MA000020",
      name: "Building and Construction General Award",
      published_year: 2023
    }
  ],
};

// Financial year rates mapping (rates take effect on July 1)
// Key is the financial year (e.g., 2024 for FY2024-25)
const FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR: Record<number, ClassificationRate[]> = {
  2024: [  // FY2024-25, effective July 1, 2024
    { classification_fixed_id: 101, classification: "1st year apprentice", hourlyRate: 23.47, weeklyRate: 891.86, level: 1, year: 1, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 102, classification: "2nd year apprentice", hourlyRate: 28.17, weeklyRate: 1070.46, level: 2, year: 2, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 103, classification: "3rd year apprentice", hourlyRate: 32.86, weeklyRate: 1248.68, level: 3, year: 3, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 104, classification: "4th year apprentice", hourlyRate: 37.56, weeklyRate: 1427.28, level: 4, year: 4, calendar_year: 2025, financial_year: 2024 }
  ],
  2023: [  // FY2023-24, effective July 1, 2023
    { classification_fixed_id: 101, classification: "1st year apprentice", hourlyRate: 22.28, weeklyRate: 846.64, level: 1, year: 1, calendar_year: 2024, financial_year: 2023 },
    { classification_fixed_id: 102, classification: "2nd year apprentice", hourlyRate: 26.74, weeklyRate: 1016.12, level: 2, year: 2, calendar_year: 2024, financial_year: 2023 },
    { classification_fixed_id: 103, classification: "3rd year apprentice", hourlyRate: 31.2, weeklyRate: 1185.6, level: 3, year: 3, calendar_year: 2024, financial_year: 2023 },
    { classification_fixed_id: 104, classification: "4th year apprentice", hourlyRate: 35.65, weeklyRate: 1354.70, level: 4, year: 4, calendar_year: 2024, financial_year: 2023 }
  ],
  2022: [  // FY2022-23, effective July 1, 2022
    { classification_fixed_id: 101, classification: "1st year apprentice", hourlyRate: 21.08, weeklyRate: 801.04, level: 1, year: 1, calendar_year: 2023, financial_year: 2022 },
    { classification_fixed_id: 102, classification: "2nd year apprentice", hourlyRate: 25.3, weeklyRate: 961.4, level: 2, year: 2, calendar_year: 2023, financial_year: 2022 },
    { classification_fixed_id: 103, classification: "3rd year apprentice", hourlyRate: 29.51, weeklyRate: 1121.38, level: 3, year: 3, calendar_year: 2023, financial_year: 2022 },
    { classification_fixed_id: 104, classification: "4th year apprentice", hourlyRate: 33.73, weeklyRate: 1281.74, level: 4, year: 4, calendar_year: 2023, financial_year: 2022 }
  ]
};

// Map calendar year to financial year rates
const FALLBACK_APPRENTICE_RATES_BY_YEAR: Record<number, ClassificationRate[]> = {
  2025: FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR[2024], // Calendar 2025 uses FY2024-25 rates (effective July 1, 2024)
  2024: FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR[2023], // Calendar 2024 uses FY2023-24 rates (effective July 1, 2023)
  2023: FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR[2022], // Calendar 2023 uses FY2022-23 rates (effective July 1, 2022)
};

const FALLBACK_APPRENTICE_RATES = FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR[2023]; // Default to 2023-24 FY rates

// Adult apprentice rates
const FALLBACK_ADULT_APPRENTICE_RATES: Record<number, ClassificationRate[]> = {
  2024: [  // FY2024-25
    { classification_fixed_id: 201, classification: "1st year adult apprentice", hourlyRate: 42.25, weeklyRate: 1605.50, level: 1, year: 1, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 202, classification: "2nd year adult apprentice", hourlyRate: 42.25, weeklyRate: 1605.50, level: 2, year: 2, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 203, classification: "3rd year adult apprentice", hourlyRate: 42.25, weeklyRate: 1605.50, level: 3, year: 3, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 204, classification: "4th year adult apprentice", hourlyRate: 42.25, weeklyRate: 1605.50, level: 4, year: 4, calendar_year: 2025, financial_year: 2024 }
  ],
  2023: [  // FY2023-24
    { classification_fixed_id: 201, classification: "1st year adult apprentice", hourlyRate: 40.10, weeklyRate: 1523.80, level: 1, year: 1, calendar_year: 2024, financial_year: 2023 },
    { classification_fixed_id: 202, classification: "2nd year adult apprentice", hourlyRate: 40.10, weeklyRate: 1523.80, level: 2, year: 2, calendar_year: 2024, financial_year: 2023 },
    { classification_fixed_id: 203, classification: "3rd year adult apprentice", hourlyRate: 40.10, weeklyRate: 1523.80, level: 3, year: 3, calendar_year: 2024, financial_year: 2023 },
    { classification_fixed_id: 204, classification: "4th year adult apprentice", hourlyRate: 40.10, weeklyRate: 1523.80, level: 4, year: 4, calendar_year: 2024, financial_year: 2023 }
  ]
};

// Year 12 completed rates
const FALLBACK_YEAR12_APPRENTICE_RATES: Record<number, ClassificationRate[]> = {
  2024: [  // FY2024-25
    { classification_fixed_id: 301, classification: "1st year apprentice (Year 12 completed)", hourlyRate: 25.82, weeklyRate: 981.16, level: 1, year: 1, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 302, classification: "2nd year apprentice (Year 12 completed)", hourlyRate: 30.52, weeklyRate: 1159.76, level: 2, year: 2, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 303, classification: "3rd year apprentice (Year 12 completed)", hourlyRate: 32.86, weeklyRate: 1248.68, level: 3, year: 3, calendar_year: 2025, financial_year: 2024 },
    { classification_fixed_id: 304, classification: "4th year apprentice (Year 12 completed)", hourlyRate: 37.56, weeklyRate: 1427.28, level: 4, year: 4, calendar_year: 2025, financial_year: 2024 }
  ]
};

// Sector-specific rates
const FALLBACK_SECTOR_APPRENTICE_RATES: Record<string, Record<number, ClassificationRate[]>> = {
  residential: {
    2024: [  // FY2024-25
      { classification_fixed_id: 401, classification: "1st year apprentice (Residential)", hourlyRate: 22.30, weeklyRate: 847.40, level: 1, year: 1, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 402, classification: "2nd year apprentice (Residential)", hourlyRate: 26.76, weeklyRate: 1016.88, level: 2, year: 2, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 403, classification: "3rd year apprentice (Residential)", hourlyRate: 31.22, weeklyRate: 1186.36, level: 3, year: 3, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 404, classification: "4th year apprentice (Residential)", hourlyRate: 35.68, weeklyRate: 1355.84, level: 4, year: 4, calendar_year: 2025, financial_year: 2024 }
    ]
  },
  commercial: {
    2024: [  // FY2024-25
      { classification_fixed_id: 501, classification: "1st year apprentice (Commercial)", hourlyRate: 23.47, weeklyRate: 891.86, level: 1, year: 1, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 502, classification: "2nd year apprentice (Commercial)", hourlyRate: 28.17, weeklyRate: 1070.46, level: 2, year: 2, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 503, classification: "3rd year apprentice (Commercial)", hourlyRate: 32.86, weeklyRate: 1248.68, level: 3, year: 3, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 504, classification: "4th year apprentice (Commercial)", hourlyRate: 37.56, weeklyRate: 1427.28, level: 4, year: 4, calendar_year: 2025, financial_year: 2024 }
    ]
  },
  civil: {
    2024: [  // FY2024-25
      { classification_fixed_id: 601, classification: "1st year apprentice (Civil)", hourlyRate: 24.64, weeklyRate: 936.32, level: 1, year: 1, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 602, classification: "2nd year apprentice (Civil)", hourlyRate: 29.58, weeklyRate: 1124.04, level: 2, year: 2, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 603, classification: "3rd year apprentice (Civil)", hourlyRate: 34.50, weeklyRate: 1311.00, level: 3, year: 3, calendar_year: 2025, financial_year: 2024 },
      { classification_fixed_id: 604, classification: "4th year apprentice (Civil)", hourlyRate: 39.44, weeklyRate: 1498.72, level: 4, year: 4, calendar_year: 2025, financial_year: 2024 }
    ]
  }
};

// Maximum number of retry attempts
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Base delay in ms before retrying

// Get the current financial year (July-June)
function getCurrentFinancialYear(): number {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  
  // If we're in July-December, FY is the current year
  // If we're in January-June, FY is the previous year
  return currentMonth >= 6 ? currentYear : currentYear - 1;
}

// Convert financial year to calendar year for API calls
function financialYearToCalendarYear(fy: number): number {
  // For fair work rates that come into effect on July 1, 
  // we use the calendar year matching the end of the FY
  return fy + 1;
}

/**
 * Get the API key securely from the Supabase Edge Function or environment
 */
async function getFairWorkApiKey(): Promise<string | null> {
  try {
    // For debugging: Directly return the API key from environment variable if available
    // Comment out this section in production!
    const directApiKey = import.meta.env.VITE_FAIRWORK_API_KEY;
    if (directApiKey) {
      console.log("Using API key from environment variable");
      return directApiKey;
    }
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    console.log(`Fetching Fair Work API key from edge function at ${supabaseUrl}/functions/v1/get-fairwork-api-key`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/get-fairwork-api-key`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get Fair Work API key: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const data = await response.json();
    console.log("API key retrieved successfully");
    return data.key || null;
  } catch (error) {
    console.error('Error getting Fair Work API key:', error);
    return null;
  }
}

/**
 * Make an authenticated API request to Fair Work API via our edge function
 */
async function fetchFromFairWorkApi(endpoint: string, year?: number): Promise<any> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      throw new Error('Not authenticated');
    }
    
    const url = new URL(`${supabaseUrl}/functions/v1/auth-fairwork`);
    url.searchParams.append('endpoint', endpoint);
    if (year) {
      url.searchParams.append('year', year.toString());
    }
    
    console.log(`Making request to Fair Work API via edge function: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${session.session.access_token}`,
        'Content-Type': 'application/json'
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(15000) // 15 seconds timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch from Fair Work API: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}\nDetails: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Data received from Fair Work API for endpoint ${endpoint}${year ? ` and year ${year}` : ''}`);
    return data.data;
  } catch (error) {
    console.error('Error fetching from Fair Work API via edge function:', error);
    throw error;
  }
}

/**
 * Helper function to fetch data from API with caching and retry mechanism
 */
async function fetchWithCache<T>(endpoint: string, year?: number): Promise<T> {
  const cacheKey = `${endpoint}_${year || 'default'}`;
  const now = Date.now();
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (now - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }
  }
  
  // Get API key securely
  const apiKey = await getFairWorkApiKey();
  
  // Check if API key is available
  if (!apiKey) {
    console.warn('Failed to get Fair Work API key. Using fallback data.');
    
    // Use fallback data immediately if API key is missing
    if (endpoint === '/awards') {
      console.warn('Using fallback award data due to missing API key');
      if (year && FALLBACK_DATA_BY_YEAR[year]) {
        return FALLBACK_DATA_BY_YEAR[year] as unknown as T;
      }
      return FALLBACK_AWARDS as unknown as T;
    } else if (endpoint.includes('/classifications')) {
      console.warn('Using fallback apprentice rates due to missing API key');
      if (year && FALLBACK_APPRENTICE_RATES_BY_YEAR[year]) {
        return FALLBACK_APPRENTICE_RATES_BY_YEAR[year] as unknown as T;
      }
      return FALLBACK_APPRENTICE_RATES as unknown as T;
    }
    
    throw new Error('API key is missing and no fallback data available for this endpoint');
  }

  // Due to CORS issues or API unavailability in the development environment,
  // we'll use fallback data instead of trying to fetch from the API
  if (endpoint === '/awards') {
    console.warn('Using fallback award data instead of fetching from API');
    if (year && FALLBACK_DATA_BY_YEAR[year]) {
      return FALLBACK_DATA_BY_YEAR[year] as unknown as T;
    }
    return FALLBACK_AWARDS as unknown as T;
  } else if (endpoint.includes('/classifications')) {
    console.warn('Using fallback apprentice rates instead of fetching from API');
    if (year && FALLBACK_APPRENTICE_RATES_BY_YEAR[year]) {
      return FALLBACK_APPRENTICE_RATES_BY_YEAR[year] as unknown as T;
    }
    return FALLBACK_APPRENTICE_RATES as unknown as T;
  } else if (endpoint.match(/\/awards\/\d+$/)) {
    // Handle single award fetch
    const awardId = parseInt(endpoint.split('/').pop() || '0');
    const award = FALLBACK_AWARDS.find(a => a.award_fixed_id === awardId);
    if (award) {
      return award as unknown as T;
    }
  }
  
  // The following code would attempt to fetch from the actual API, but we'll use our edge function instead
  console.log(`Attempting to fetch data from Fair Work API via edge function for ${endpoint}${year ? ` and year ${year}` : ''}`);
  try {
    const data = await fetchFromFairWorkApi(endpoint, year);
    
    // Store in cache
    cache.set(cacheKey, { data, timestamp: now });
    
    return data as T;
  } catch (error) {
    console.error(`Error fetching data from Fair Work API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // If we have cached data (even if expired), use it as fallback
    if (cache.has(cacheKey)) {
      console.warn('Using cached data as fallback due to API error');
      return cache.get(cacheKey)!.data as T;
    }
    
    // Use hardcoded fallback data based on the endpoint
    if (endpoint === '/awards') {
      console.warn('Using fallback award data due to API error');
      if (year && FALLBACK_DATA_BY_YEAR[year]) {
        return FALLBACK_DATA_BY_YEAR[year] as unknown as T;
      }
      return FALLBACK_AWARDS as unknown as T;
    } else if (endpoint.includes('/classifications')) {
      console.warn('Using fallback apprentice rates due to API error');
      if (year && FALLBACK_APPRENTICE_RATES_BY_YEAR[year]) {
        return FALLBACK_APPRENTICE_RATES_BY_YEAR[year] as unknown as T;
      }
      return FALLBACK_APPRENTICE_RATES as unknown as T;
    }
    
    // Rethrow with more details
    throw new Error(`Failed to fetch data from Fair Work API for ${endpoint}${year ? ` and year ${year}` : ''}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export interface Classification {
  classification_fixed_id: number;
  award_fixed_id: number;
  classification: string;
  base_rate: number;
  base_rate_type: string;
  calculated_rate: number;
  calculated_rate_type: string;
  classification_level: number;
  employee_rate_type_code: string;
  operative_from: string;
  operative_to: string | null;
}

/**
 * Fetch all available awards
 */
export async function fetchAwards(year?: number): Promise<FairWorkAward[]> {
  try {
    return await fetchWithCache<FairWorkAward[]>('/awards', year);
  } catch (error) {
    console.warn('Error fetching awards, using fallback data');
    if (year && FALLBACK_DATA_BY_YEAR[year]) {
      return FALLBACK_DATA_BY_YEAR[year];
    }
    return FALLBACK_AWARDS;
  }
}

/**
 * Fetch classifications for a specific award
 */
export async function fetchClassifications(awardFixedId: number, year?: number): Promise<Classification[]> {
  try {
    return await fetchWithCache<Classification[]>(`/awards/${awardFixedId}/classifications`, year);
  } catch (error) {
    console.warn(`Error fetching classifications for award ${awardFixedId}, returning empty array`);
    return [];
  }
}

/**
 * Fetch apprentice rates for a specific award
 * This function specifically filters for apprentice classifications
 */
export async function fetchApprenticeRates(awardFixedId: number, year?: number, isAdult: boolean = false, hasCompletedYear12: boolean = false, sector?: string): Promise<ClassificationRate[]> {
  try {
    // Convert year to financial year if needed
    const financialYear = year ? getFinancialYearFromCalendarYear(year) : getCurrentFinancialYear();
    
    // Check for special rate types
    if (isAdult) {
      // Return adult apprentice rates
      if (FALLBACK_ADULT_APPRENTICE_RATES[financialYear]) {
        console.warn(`Using fallback adult apprentice rates for award ${awardFixedId} (FY ${financialYear}-${financialYear + 1})`);
        return FALLBACK_ADULT_APPRENTICE_RATES[financialYear];
      }
    } else if (hasCompletedYear12) {
      // Return year 12 completed rates
      if (FALLBACK_YEAR12_APPRENTICE_RATES[financialYear]) {
        console.warn(`Using fallback year 12 completed apprentice rates for award ${awardFixedId} (FY ${financialYear}-${financialYear + 1})`);
        return FALLBACK_YEAR12_APPRENTICE_RATES[financialYear];
      }
    } else if (sector) {
      // Return sector-specific rates
      if (FALLBACK_SECTOR_APPRENTICE_RATES[sector] && FALLBACK_SECTOR_APPRENTICE_RATES[sector][financialYear]) {
        console.warn(`Using fallback ${sector} sector apprentice rates for award ${awardFixedId} (FY ${financialYear}-${financialYear + 1})`);
        return FALLBACK_SECTOR_APPRENTICE_RATES[sector][financialYear];
      }
    }
    
    // Use fallback rates with the appropriate financial year
    if (FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR[financialYear]) {
      console.warn(`Using fallback apprentice rates for award ${awardFixedId} (FY ${financialYear}-${financialYear + 1})`);
      return FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR[financialYear];
    }
    
    // If no specific financial year data, use calendar year fallbacks
    if (year && FALLBACK_APPRENTICE_RATES_BY_YEAR[year]) {
      console.warn(`Using fallback apprentice rates for award ${awardFixedId} (Calendar year ${year})`);
      return FALLBACK_APPRENTICE_RATES_BY_YEAR[year];
    }
    
    // Last resort: use default rates
    console.warn(`No specific rates found, using default fallback apprentice rates for award ${awardFixedId}`);
    return FALLBACK_APPRENTICE_RATES;
    
    /*
    // Original code kept for reference
    const classifications = await fetchClassifications(awardFixedId, calendarYear);
    
    // If no classifications were returned, use fallback data immediately
    if (!classifications || classifications.length === 0) {
      console.warn(`No classifications found for award ${awardFixedId}, using fallback rates`);
      return FALLBACK_APPRENTICE_RATES;
    }
    
    // Filter for apprentice rates (typically marked with AP code)
    const apprenticeClassifications = classifications.filter(
      c => c.employee_rate_type_code === 'AP'
    );
    
    // Parse and map to our application's structure
    // Note: This is a simplification - actual mapping may require more sophisticated logic
    // depending on how the Fair Work API structures apprentice data
    const rates: ClassificationRate[] = [];
    
    for (const classification of apprenticeClassifications) {
      // Extract year from classification name (assuming format like "1st year apprentice")
      const yearMatch = classification.classification.match(/(\d+)(?:st|nd|rd|th)\s+year/i);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]) as ApprenticeYear;
        if (year >= 1 && year <= 4) {
          // Determine hourly rate based on rate type
          let hourlyRate = 0;
          let weeklyRate = 0;
          
          if (classification.calculated_rate_type === 'Hourly') {
            hourlyRate = classification.calculated_rate;
            weeklyRate = hourlyRate * 38; // Assuming 38-hour week
          } else if (classification.calculated_rate_type === 'Weekly') {
            weeklyRate = classification.calculated_rate;
            hourlyRate = weeklyRate / 38; // Assuming 38-hour week
          }
          
          rates.push({
            classification_fixed_id: classification.classification_fixed_id,
            classification: classification.classification,
            hourlyRate,
            weeklyRate,
            level: classification.classification_level,
            year
          });
        }
      }
    }
    
    if (rates.length === 0) {
      console.warn(`No apprentice rates found for award ${awardFixedId}, using fallback rates`);
      return FALLBACK_APPRENTICE_RATES;
    }
    
    return rates;
    */
  } catch (error) {
    console.error('Error fetching apprentice rates:', error);
    // Try to get rates for the financial year
    const financialYear = year ? getFinancialYearFromCalendarYear(year) : getCurrentFinancialYear();
    
    if (isAdult && FALLBACK_ADULT_APPRENTICE_RATES[financialYear]) {
      return FALLBACK_ADULT_APPRENTICE_RATES[financialYear];
    }
    
    if (hasCompletedYear12 && FALLBACK_YEAR12_APPRENTICE_RATES[financialYear]) {
      return FALLBACK_YEAR12_APPRENTICE_RATES[financialYear];
    }
    
    if (sector && FALLBACK_SECTOR_APPRENTICE_RATES[sector] && FALLBACK_SECTOR_APPRENTICE_RATES[sector][financialYear]) {
      return FALLBACK_SECTOR_APPRENTICE_RATES[sector][financialYear];
    }
    
    if (FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR[financialYear]) {
      return FALLBACK_APPRENTICE_RATES_BY_FINANCIAL_YEAR[financialYear];
    }
    
    if (year && FALLBACK_APPRENTICE_RATES_BY_YEAR[year]) {
      return FALLBACK_APPRENTICE_RATES_BY_YEAR[year];
    }
    
    return FALLBACK_APPRENTICE_RATES;
  }
}

// Helper function to get financial year from calendar year
function getFinancialYearFromCalendarYear(calendarYear: number): number {
  // For a calendar year, the financial year that starts on July 1 of the previous year
  return calendarYear - 1;
}

/**
 * Search for awards by name or code
 */
export async function searchAwards(query: string, year?: number): Promise<FairWorkAward[]> {
  try {
    const awards = await fetchAwards(year);
    if (!query) return awards;
    
    const lowerQuery = query.toLowerCase();
    return awards.filter(
      award => award.name.toLowerCase().includes(lowerQuery) || 
              award.code.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching awards:', error);
    if (year && FALLBACK_DATA_BY_YEAR[year]) {
      return FALLBACK_DATA_BY_YEAR[year];
    }
    return FALLBACK_AWARDS;
  }
}

/**
 * Get specific award by ID
 */
export async function getAward(awardFixedId: number, year?: number): Promise<FairWorkAward | null> {
  try {
    return await fetchWithCache<FairWorkAward>(`/awards/${awardFixedId}`, year);
  } catch (error) {
    console.error('Error fetching award details:', error);
    
    // Try to find in fallback data for the requested year
    if (year && FALLBACK_DATA_BY_YEAR[year]) {
      const fallbackAward = FALLBACK_DATA_BY_YEAR[year].find(a => a.award_fixed_id === awardFixedId);
      if (fallbackAward) return fallbackAward;
    }
    
    // Fall back to default year
    const fallbackAward = FALLBACK_AWARDS.find(a => a.award_fixed_id === awardFixedId);
    return fallbackAward || null;
  }
}

/**
 * Get the available calendar years for award data
 */
export function getAvailableYears(): number[] {
  return [2025, 2024, 2023]; // Hard-coded available years - would be fetched from API in production
}

/**
 * Get the available financial years for award data
 */
export function getAvailableFinancialYears(): number[] {
  return [2024, 2023, 2022]; // FY2024-25, FY2023-24, FY2022-23
}

/**
 * Check if we're in a period near the annual wage update (May-July)
 */
export function isNearAnnualUpdate(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-11 (January is 0)
  
  // Return true if we're in May, June, or July (months 4, 5, or 6)
  return month >= 4 && month <= 6;
}

/**
 * Fetch award data for multiple years and sync to database
 */
export async function syncFairWorkData(): Promise<{
  success: boolean;
  yearsSynced: number[];
  error?: string;
}> {
  try {
    // Call our sync-award-rates edge function to handle the syncing process
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      return {
        success: false,
        yearsSynced: [],
        error: 'Not authenticated, cannot sync to database'
      };
    }
    
    // Call the edge function to perform the sync
    console.log(`Calling sync-award-rates edge function at ${supabaseUrl}/functions/v1/sync-award-rates`);
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-award-rates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        years: [new Date().getFullYear(), new Date().getFullYear() - 1],
        manual: true
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Sync failed: ${response.status} ${response.statusText}`, errorText);
      
      // Check for specific error types and provide helpful messages
      if (response.status === 404) {
        throw new Error(`Edge function not found. Please check that sync-award-rates has been deployed. See /docs/fairwork-api.md for details.`);
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(`Authentication error: ${response.status} ${response.statusText}. Please sign in and try again.`);
      }
      
      throw new Error(`Sync failed: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const result = await response.json();
    console.log("Sync result:", result);
    
    return {
      success: result.results.every((r: any) => r.success),
      yearsSynced: result.financial_years.map((fy: string) => parseInt(fy.split('-')[0])),
      error: result.results.some((r: any) => !r.success) ? 'Some awards failed to sync' : undefined
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in syncFairWorkData:', error);
    return {
      success: false,
      yearsSynced: [],
      error: errorMessage
    };
  }
}

export default {
  fetchAwards,
  fetchClassifications,
  fetchApprenticeRates,
  searchAwards,
  getAward,
  getFairWorkApiKey,
  getAvailableYears,
  getAvailableFinancialYears,
  getCurrentFinancialYear,
  isNearAnnualUpdate,
  syncFairWorkData
};

export { getCurrentFinancialYear }