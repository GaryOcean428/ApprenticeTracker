import React, { useState, useEffect, useRef } from 'react';
import { Search, Award, ChevronDown, ChevronUp, Check, AlertCircle, RefreshCw, X, Calendar } from 'lucide-react';
import { ApprenticeYear, FairWorkAward, ClassificationRate, AwardTemplate } from '../types';
import { fetchAwards, fetchApprenticeRates, getAvailableYears } from '../services/fairworkApi';
import { 
  fetchAwardTemplates, 
  getApprenticeRateForYear, 
  fetchAwardTemplatesByYear,
  fetchAwardTemplatesByFinancialYear,
  fetchAwardTemplatesBySector,
  fetchAdultAwardTemplates,
  fetchYear12AwardTemplates
} from '../services/awardTemplateService';

interface AwardRateSelectorProps {
  onRateSelected: (rate: number) => void;
  apprenticeYear: ApprenticeYear;
  currentRate?: number;
  isAdult?: boolean;
  hasCompletedYear12?: boolean;
  sector?: string;
}

const AwardRateSelector: React.FC<AwardRateSelectorProps> = ({ 
  onRateSelected, 
  apprenticeYear,
  currentRate,
  isAdult = false,
  hasCompletedYear12 = false,
  sector
}) => {
  const [awards, setAwards] = useState<FairWorkAward[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAward, setSelectedAward] = useState<FairWorkAward | null>(null);
  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<ApprenticeYear>(apprenticeYear);
  const [apprenticeRates, setApprenticeRates] = useState<ClassificationRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [financialYear, setFinancialYear] = useState<number>(getCurrentFinancialYear());
  const [availableFinancialYears, setAvailableFinancialYears] = useState<number[]>([]);
  const [awardTemplates, setAwardTemplates] = useState<AwardTemplate[]>([]);
  const [filterType, setFilterType] = useState<'standard' | 'adult' | 'year12' | 'sector'>('standard');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Get current financial year (July to June)
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
  
  // Format financial year for display
  function formatFinancialYear(fy: number): string {
    return `FY ${fy}/${String(fy + 1).slice(2)}`;
  }
  
  // Fetch awards on component mount
  useEffect(() => {
    const loadAwards = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        // Convert financial year to calendar year for API calls
        const calendarYear = financialYearToCalendarYear(financialYear);
        
        // Load appropriate templates based on filter type
        let dbAwards: AwardTemplate[] = [];
        
        if (filterType === 'adult') {
          dbAwards = await fetchAdultAwardTemplates();
        } else if (filterType === 'year12') {
          dbAwards = await fetchYear12AwardTemplates();
        } else if (filterType === 'sector' && sector) {
          dbAwards = await fetchAwardTemplatesBySector(sector);
        } else {
          // Try to load from Supabase award_templates first for the selected calendar year
          dbAwards = await fetchAwardTemplatesByYear(calendarYear);
        }
        
        if (dbAwards && dbAwards.length > 0) {
          // Convert to the format expected by this component
          const convertedAwards: FairWorkAward[] = dbAwards.map(award => ({
            award_fixed_id: parseInt(award.id) || Math.floor(Math.random() * 1000000), // Use a random ID if conversion fails
            code: award.code,
            name: award.name,
            published_year: award.calendar_year || new Date(award.updated_at).getFullYear() || 2025
          }));
          
          setAwards(convertedAwards);
          setAwardTemplates(dbAwards);
          
          // Collect available years from the awards - these are calendar years
          const calendarYears = dbAwards
            .map(award => award.calendar_year || new Date(award.updated_at).getFullYear())
            .filter((year): year is number => year !== undefined);
          
          // Convert calendar years to financial years and add current FY if missing
          const fyYears = Array.from(new Set(calendarYears.map(cy => cy - 1)));
          const currentFY = getCurrentFinancialYear();
          if (!fyYears.includes(currentFY)) {
            fyYears.push(currentFY);
          }
          
          // Sort financial years in descending order
          const uniqueYears = fyYears.sort((a, b) => b - a);
          setAvailableFinancialYears(uniqueYears);
        } else {
          // Fallback to Fair Work API data
          const apiAwards = await fetchAwards(calendarYear);
          setAwards(apiAwards);
          
          // Set available years based on API data or defaults
          const currentFY = getCurrentFinancialYear();
          setAvailableFinancialYears([
            currentFY,
            currentFY - 1,
            currentFY - 2
          ]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load awards. Please try again later.';
        setError(errorMessage);
        console.error('Error loading awards:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAwards();
  }, [financialYear, filterType, sector]);

  // Set up click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  // Initialize selected year and rate from props
  useEffect(() => {
    setSelectedYear(apprenticeYear);
    if (currentRate) {
      setSelectedRate(currentRate);
    }
  }, [apprenticeYear, currentRate]);
  
  // Function to retry loading awards
  const retryLoadAwards = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const calendarYear = financialYearToCalendarYear(financialYear);
      const dbAwards = await fetchAwardTemplatesByYear(calendarYear);
      
      if (dbAwards && dbAwards.length > 0) {
        const convertedAwards: FairWorkAward[] = dbAwards.map(award => ({
          award_fixed_id: parseInt(award.id) || Math.floor(Math.random() * 1000000),
          code: award.code,
          name: award.name,
          published_year: award.calendar_year || new Date(award.updated_at).getFullYear() || 2025
        }));
        
        setAwards(convertedAwards);
        setAwardTemplates(dbAwards);
        
        // Update available years
        const calendarYears = dbAwards
          .map(award => award.calendar_year || new Date(award.updated_at).getFullYear())
          .filter((year): year is number => year !== undefined);
        
        // Convert to financial years
        const fyYears = Array.from(new Set(calendarYears.map(cy => cy - 1)));
        const currentFY = getCurrentFinancialYear();
        if (!fyYears.includes(currentFY)) {
          fyYears.push(currentFY);
        }
        
        const uniqueYears = fyYears.sort((a, b) => b - a);
        setAvailableFinancialYears(uniqueYears);
      } else {
        const apiAwards = await fetchAwards(calendarYear);
        setAwards(apiAwards);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load awards. Please try again later.';
      setError(errorMessage);
      console.error('Error retrying to load awards:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter awards based on search query
  const filteredAwards = searchQuery
    ? awards.filter(award => 
        award.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        award.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : awards;
  
  // Handle award selection and fetch apprentice rates
  const handleAwardSelect = async (award: FairWorkAward): Promise<void> => {
    setSelectedAward(award);
    setIsDropdownOpen(false);
    setIsLoading(true);
    setError(null);
    
    try {
      // Calendar year for the rates (FY + 1)
      const calendarYear = financialYearToCalendarYear(financialYear);
      
      // Find the matching award template
      const matchingTemplate = awardTemplates.find(template => 
        template.code === award.code && 
        (template.name === award.name || template.id === String(award.award_fixed_id))
      );
      
      if (matchingTemplate) {
        // Generate rates for all years from the template
        const allRates: ClassificationRate[] = [];
        
        for (let year = 1; year <= 4; year++) {
          const rate = getApprenticeRateForYear(matchingTemplate, year as ApprenticeYear);
          
          if (rate !== null) {
            allRates.push({
              classification_fixed_id: year,
              classification: `Year ${year} apprentice`,
              hourlyRate: rate,
              weeklyRate: rate * 38, // Assuming 38-hour week
              level: year as ApprenticeYear,
              year: year as ApprenticeYear,
              calendar_year: matchingTemplate.calendar_year,
              financial_year: matchingTemplate.financial_year
            });
          }
        }
        
        if (allRates.length > 0) {
          setApprenticeRates(allRates);
          // Select rate for current apprentice year if available, otherwise select first rate
          const rateForYear = allRates.find(rate => rate.year === selectedYear);
          if (rateForYear) {
            setSelectedRate(rateForYear.hourlyRate);
          } else if (allRates.length > 0) {
            setSelectedRate(allRates[0].hourlyRate);
            setSelectedYear(allRates[0].year || 1);
          }
        } else {
          setApprenticeRates([]);
          setError(`No rates found in this award.`);
        }
      } else {
        // Fallback to the Fair Work API
        const rates = await fetchApprenticeRates(award.award_fixed_id, calendarYear);
        
        // Ensure rates have years and financial_year assigned
        const processedRates = rates.map(rate => {
          // If no year is set, try to extract from classification text
          if (!rate.year) {
            const yearMatch = rate.classification.match(/(\d+)(?:st|nd|rd|th)\s+year/i);
            if (yearMatch) {
              const year = parseInt(yearMatch[1]);
              if (year >= 1 && year <= 4) {
                return { 
                  ...rate, 
                  year: year as ApprenticeYear, 
                  calendar_year: calendarYear,
                  financial_year: calendarYear - 1  // Add financial year field
                };
              }
            }
            // Default to level as year if no match in text
            if (rate.level >= 1 && rate.level <= 4) {
              return { 
                ...rate, 
                year: rate.level as ApprenticeYear, 
                calendar_year: calendarYear,
                financial_year: calendarYear - 1 // Add financial year field
              };
            }
          }
          // Ensure calendar_year and financial_year are set
          if (!rate.calendar_year) {
            return { 
              ...rate, 
              calendar_year: calendarYear,
              financial_year: calendarYear - 1 // Add financial year field
            };
          }
          if (!rate.financial_year) {
            return {
              ...rate,
              financial_year: rate.calendar_year - 1
            };
          }
          return rate;
        });
        
        setApprenticeRates(processedRates);
        
        // Auto-select the rate for the current apprentice year if available
        const rateForYear = processedRates.find(rate => rate.year === selectedYear);
        if (rateForYear) {
          setSelectedRate(rateForYear.hourlyRate);
        } else if (processedRates.length > 0) {
          // If no exact match, select the first rate
          setSelectedRate(processedRates[0].hourlyRate);
          if (processedRates[0].year) {
            setSelectedYear(processedRates[0].year);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load apprentice rates. Please try again later.';
      setError(errorMessage);
      console.error('Error loading apprentice rates:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle rate refresh
  const handleRefreshRates = async (): Promise<void> => {
    if (!selectedAward) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const calendarYear = financialYearToCalendarYear(financialYear);
      const rates = await fetchApprenticeRates(selectedAward.award_fixed_id, calendarYear);
      
      // Add financial year to rates
      const processedRates = rates.map(rate => ({
        ...rate, 
        financial_year: calendarYear - 1
      }));
      
      setApprenticeRates(processedRates);
      
      // Auto-select the rate for the current apprentice year if available
      const rateForYear = processedRates.find(rate => rate.year === selectedYear);
      if (rateForYear) {
        setSelectedRate(rateForYear.hourlyRate);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh apprentice rates. Please try again later.';
      setError(errorMessage);
      console.error('Error refreshing apprentice rates:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle year selection
  const handleYearChange = (year: ApprenticeYear): void => {
    setSelectedYear(year);
    
    // Find rate for selected year
    const rateForYear = apprenticeRates.find(rate => rate.year === year);
    if (rateForYear) {
      setSelectedRate(rateForYear.hourlyRate);
    } else {
      // If no exact match, try to find a rate with matching level
      const rateForLevel = apprenticeRates.find(rate => rate.level === year);
      if (rateForLevel) {
        setSelectedRate(rateForLevel.hourlyRate);
      }
      // Otherwise keep the current selection
    }
  };
  
  const handleRateSelection = (rate: number, year?: ApprenticeYear): void => {
    setSelectedRate(rate);
    if (year && year !== selectedYear) {
      setSelectedYear(year);
    }
  };

  // Handle financial year change
  const handleFinancialYearChange = (fy: number): void => {
    setFinancialYear(fy);
    // Reset selected award and rates when changing financial year
    setSelectedAward(null);
    setSelectedRate(null);
    setApprenticeRates([]);
  };

  // Handle filter type change
  const handleFilterTypeChange = (type: 'standard' | 'adult' | 'year12' | 'sector'): void => {
    setFilterType(type);
    // Reset selected award and rates when changing filter
    setSelectedAward(null);
    setSelectedRate(null);
    setApprenticeRates([]);
  };

  // Handle keyboard navigation in dropdown
  const handleDropdownKeyDown = (e: React.KeyboardEvent, award?: FairWorkAward) => {
    switch (e.key) {
      case 'Enter':
      case 'Space':
        if (award) {
          handleAwardSelect(award);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        e.preventDefault();
        break;
      case 'ArrowDown':
        if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
          e.currentTarget.nextElementSibling.focus();
        }
        e.preventDefault();
        break;
      case 'ArrowUp':
        if (e.currentTarget.previousElementSibling instanceof HTMLElement) {
          e.currentTarget.previousElementSibling.focus();
        }
        e.preventDefault();
        break;
    }
  };
  
  // Get year badge color
  const getYearBadgeColor = (year: ApprenticeYear) => {
    switch(year) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-purple-100 text-purple-800';
      case 4: return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Check if the current rates are the most recent
  const isCurrentRate = financialYear === getCurrentFinancialYear();
  
  return (
    <div className="space-y-4">
      {/* Filter type selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Apprentice Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleFilterTypeChange('standard')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              filterType === 'standard' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => handleFilterTypeChange('adult')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              filterType === 'adult' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Adult
          </button>
          <button
            type="button"
            onClick={() => handleFilterTypeChange('year12')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              filterType === 'year12' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Year 12 Completed
          </button>
          <button
            type="button"
            onClick={() => handleFilterTypeChange('sector')}
            className={`py-2 px-3 rounded-md text-sm font-medium ${
              filterType === 'sector' 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By Sector
          </button>
        </div>
      </div>

      {/* Sector selector (only shown when sector filter is active) */}
      {filterType === 'sector' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry Sector
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => sector !== 'residential' && handleFilterTypeChange('sector')}
              className={`py-2 px-3 rounded-md text-sm font-medium ${
                sector === 'residential' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Residential
            </button>
            <button
              type="button"
              onClick={() => sector !== 'commercial' && handleFilterTypeChange('sector')}
              className={`py-2 px-3 rounded-md text-sm font-medium ${
                sector === 'commercial' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Commercial
            </button>
            <button
              type="button"
              onClick={() => sector !== 'civil' && handleFilterTypeChange('sector')}
              className={`py-2 px-3 rounded-md text-sm font-medium ${
                sector === 'civil' 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Civil
            </button>
          </div>
        </div>
      )}

      {/* Financial Year selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Financial Year
        </label>
        <div className="relative">
          <div className="flex items-center gap-2">
            <select
              value={financialYear}
              onChange={(e) => handleFinancialYearChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Select financial year for award rates"
            >
              {availableFinancialYears.length > 0 ? (
                availableFinancialYears.map(year => (
                  <option key={year} value={year}>{formatFinancialYear(year)}</option>
                ))
              ) : (
                <>
                  <option value={getCurrentFinancialYear()}>{formatFinancialYear(getCurrentFinancialYear())}</option>
                  <option value={getCurrentFinancialYear() - 1}>{formatFinancialYear(getCurrentFinancialYear() - 1)}</option>
                  <option value={getCurrentFinancialYear() - 2}>{formatFinancialYear(getCurrentFinancialYear() - 2)}</option>
                </>
              )}
            </select>
            <div className="flex-shrink-0 bg-blue-50 border border-blue-100 rounded-md p-2">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          {!isCurrentRate && (
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
              <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full">Historical</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {isCurrentRate 
            ? "Current financial year rates in effect from July 1" 
            : "Historical rates from previous financial years"}
        </p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <label id="award-select-label" className="block text-sm font-medium text-gray-700 mb-1">
          Select Award
        </label>
        <div className="relative">
          <button
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
            aria-labelledby="award-select-label"
          >
            <div className="flex items-center gap-2 truncate">
              {selectedAward ? (
                <React.Fragment>
                  <Award className="w-4 h-4 text-blue-500" />
                  <span className="truncate">
                    {selectedAward.name} ({selectedAward.code})
                    {selectedAward.published_year && 
                      <span className="ml-1 text-gray-500 text-sm">({selectedAward.published_year})</span>
                    }
                  </span>
                </React.Fragment>
              ) : (
                <span className="text-gray-500">Select an award</span>
              )}
            </div>
            {isDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {isDropdownOpen ? (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-80 overflow-auto" role="listbox" aria-labelledby="award-select-label">
              <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search awards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    ref={searchInputRef}
                    aria-label="Search awards"
                  />
                </div>
              </div>

              {isLoading && !awards.length ? (
                <div className="p-4 text-center text-gray-500" role="status">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Loading awards...</span>
                  </div>
                </div>
              ) : error && !awards.length ? (
                <div className="p-4 text-center" role="alert">
                  <div className="text-red-500 mb-2 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                  <button 
                    onClick={retryLoadAwards}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-1 text-sm"
                    aria-label="Retry loading awards"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Retry
                  </button>
                </div>
              ) : filteredAwards.length > 0 ? (
                <ul role="listbox">
                  {filteredAwards.map((award) => (
                    <li key={award.award_fixed_id} role="option" aria-selected={selectedAward?.award_fixed_id === award.award_fixed_id}>
                      <button
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${selectedAward?.award_fixed_id === award.award_fixed_id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleAwardSelect(award)}
                        onKeyDown={(e) => handleDropdownKeyDown(e, award)}
                        aria-label={`Select award ${award.name}`}
                        tabIndex={0}
                      >
                        {selectedAward?.award_fixed_id === award.award_fixed_id && (
                          <Check className="w-4 h-4 text-blue-500" />
                        )}
                        <div className="ml-2 flex-1">
                          <div className="font-medium">{award.name}</div>
                          <div className="text-xs text-gray-500 flex items-center justify-between">
                            <span>{award.code}</span>
                            {award.published_year && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                {award.published_year}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No awards found matching "{searchQuery}"
                </div>
              )}
            </div>            
          ) : null}
        </div>
      </div>
      
      {selectedAward ? (
        <div>
          {/* Year selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Apprentice Year
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`py-2 rounded-md flex items-center justify-center ${
                    selectedYear === year 
                      ? getYearBadgeColor(year as ApprenticeYear) 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => handleYearChange(year as ApprenticeYear)}
                  aria-pressed={selectedYear === year}
                  aria-label={`Year ${year}`}
                >
                  Year {year}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700" id="apprentice-rates-label">
              Apprentice Rates
            </label>
            
            <button
              onClick={handleRefreshRates}
              className="text-blue-600 hover:text-blue-800 p-1" 
              disabled={isLoading}
              title="Refresh rates"
              aria-label="Refresh apprentice rates"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {isLoading ? (
            <div className="bg-gray-50 p-3 rounded-md text-center text-gray-500 text-sm flex items-center justify-center gap-2" role="status">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Loading rates...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-3 rounded-md" role="alert">
              <div className="flex items-center gap-2 text-red-700 text-sm mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              <button 
                onClick={handleRefreshRates} 
                className="mt-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-1 text-sm"
                aria-label="Retry loading rates"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          ) : apprenticeRates.length > 0 ? (
            <div className="bg-gray-50 p-3 rounded-md" role="radiogroup" aria-labelledby="apprentice-rates-label">
              <div className="space-y-2">
                {/* Group and sort rates by year */}
                {[1, 2, 3, 4].map((year) => {
                  // Find rates for this year
                  const ratesForYear = apprenticeRates.filter(rate => 
                    rate.year === year || 
                    (!rate.year && rate.level === year) || 
                    (!rate.year && rate.classification.toLowerCase().includes(`${year}${getOrdinalSuffix(year)} year`))
                  );
                  
                  if (ratesForYear.length === 0) {
                    return null;
                  }
                  
                  return (
                    <div key={year} className={`p-2 rounded ${selectedYear === year ? 'bg-gray-100' : ''}`}>
                      <div className={`text-xs font-medium mb-1 ${getYearBadgeColor(year as ApprenticeYear)} inline-block px-2 py-0.5 rounded`}>
                        Year {year} Rates
                      </div>
                      {ratesForYear.map((rate) => (
                        <div 
                          key={`${rate.classification_fixed_id}-${year}`} 
                          className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                            selectedRate === rate.hourlyRate && selectedYear === year ? 'bg-blue-100 border border-blue-200' : 'hover:bg-gray-100'
                          }`}
                          role="radio"
                          aria-checked={selectedRate === rate.hourlyRate && selectedYear === year}
                          tabIndex={0}
                          onClick={() => handleRateSelection(rate.hourlyRate, year as ApprenticeYear)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleRateSelection(rate.hourlyRate, year as ApprenticeYear);
                              e.preventDefault();
                            }
                          }}
                        >
                          <span className="font-medium">{rate.classification}</span>
                          <span className="text-gray-700">${rate.hourlyRate.toFixed(2)}/hr</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
                
                {/* If no rates are shown for any year, display message */}
                {!apprenticeRates.some(rate => [1, 2, 3, 4].includes(rate.year || rate.level)) && (
                  <div className="p-2 text-center text-gray-500">
                    No apprentice rates found for any year.
                  </div>
                )}
              </div>
              
              {/* Only show this message if there are rates but none for the selected year */}
              {apprenticeRates.length > 0 && 
              !apprenticeRates.some(rate => rate.year === selectedYear || rate.level === selectedYear) && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm" role="alert">
                  No rate found for Year {selectedYear} apprentice in this award.
                  Please select another year or award.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-md text-center text-gray-500 text-sm">
              No apprentice rates found for this award.
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 italic">
          Select an award to view apprentice rates.
        </div>
      )}
      
      {selectedRate && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-blue-600 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded ${getYearBadgeColor(selectedYear)}`}>
              Year {selectedYear}
            </span>
            <span>${selectedRate.toFixed(2)}/hr</span>
            <span className="ml-1 text-xs text-gray-500">
              ({formatFinancialYear(financialYear)})
            </span>
            {isCurrentRate && (
              <span className="ml-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full">
                Current
              </span>
            )}
          </div>
          <button 
            onClick={() => onRateSelected(selectedRate)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Use selected rate"
          >Use This Rate</button>
        </div>        
      )}
    </div>
  );
};

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}

// Add Info component for tooltip
function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export default AwardRateSelector;