import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define types for API responses
interface Award {
  id: string;
  code: string;
  name: string;
  publishedYear: number;
  industry: string;
  sectors: string[];
}

interface ApprenticeRate {
  baseHourly: number;
  hourly: number;
  weekly: number;
  annual: number;
}

interface CalculationFactors {
  baseRate: number;
  adultBonus: number;
  year12Bonus: number;
  sectorMultiplier: number;
  yearAdjustment: number;
}

interface ApprenticeRateResponse {
  success: boolean;
  data: {
    award: {
      code: string;
      name: string;
    };
    parameters: {
      year: number;
      apprenticeYear: number;
      isAdult: boolean;
      hasCompletedYear12: boolean;
      sector: string;
    };
    rates: ApprenticeRate;
    calculationFactors: CalculationFactors;
  };
}

interface HistoricalRate {
  year: number;
  rates: ApprenticeRate;
  percentageChange: number | null;
}

interface HistoricalRatesResponse {
  success: boolean;
  data: {
    award: {
      code: string;
      name: string;
    };
    parameters: {
      apprenticeYear: number;
      isAdult: boolean;
      hasCompletedYear12: boolean;
      sector: string;
    };
    historicalRates: HistoricalRate[];
  };
}

interface Allowance {
  name: string;
  amount: number;
  period: string;
  trade?: string;
  description?: string;
}

interface AllowancesResponse {
  success: boolean;
  data: {
    award: {
      code: string;
      name: string;
    };
    allowances: {
      industry: Allowance[];
      expense: Allowance[];
      skill?: Allowance[];
    };
  };
}

interface PenaltyRates {
  overtime: {
    firstTwoHours: number;
    afterTwoHours: number;
    sunday: number;
    publicHoliday: number;
  };
  weekend: {
    saturday: number;
    sunday: number;
  };
  publicHoliday: number;
  shiftWork: {
    [key: string]: number;
  };
}

interface PenaltyRatesResponse {
  success: boolean;
  data: {
    award: {
      code: string;
      name: string;
    };
    penaltyRates: PenaltyRates;
  };
}

interface EnhancedAwardSelectorProps {
  onRateSelected?: (rate: number, award: string, year: number) => void;
  onAwardSelected?: (award: Award) => void;
  defaultAwardCode?: string;
  defaultYear?: number;
  defaultApprenticeYear?: number;
  defaultIsAdult?: boolean;
  defaultHasCompletedYear12?: boolean;
  defaultSector?: string;
  showDetails?: boolean;
}

export default function EnhancedAwardSelector({
  onRateSelected,
  onAwardSelected,
  defaultAwardCode,
  defaultYear,
  defaultApprenticeYear = 1,
  defaultIsAdult = false,
  defaultHasCompletedYear12 = false,
  defaultSector,
  showDetails = true,
}: EnhancedAwardSelectorProps) {
  // State
  const [selectedAwardCode, setSelectedAwardCode] = useState<string>(defaultAwardCode || '');
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear || new Date().getFullYear());
  const [apprenticeYear, setApprenticeYear] = useState<number>(defaultApprenticeYear);
  const [isAdult, setIsAdult] = useState<boolean>(defaultIsAdult);
  const [hasCompletedYear12, setHasCompletedYear12] = useState<boolean>(defaultHasCompletedYear12);
  const [selectedSector, setSelectedSector] = useState<string>(defaultSector || 'standard');
  const [activeTab, setActiveTab] = useState<string>('rates');

  // Fetch awards
  const { data: awardsData, isLoading: isLoadingAwards } = useQuery<{
    success: boolean;
    data: Award[];
  }>({
    queryKey: ['/api/fairwork-enhanced/awards'],
  });

  // Build query parameters for apprentice rates
  const buildApprenticeRateQueryUrl = () => {
    if (!selectedAwardCode) return '';

    const params = new URLSearchParams();
    params.append('awardCode', selectedAwardCode);
    params.append('year', selectedYear.toString());
    params.append('apprenticeYear', apprenticeYear.toString());
    params.append('isAdult', isAdult.toString());
    params.append('hasCompletedYear12', hasCompletedYear12.toString());
    if (selectedSector) params.append('sector', selectedSector);

    return `/api/fairwork-enhanced/apprentice-rates?${params.toString()}`;
  };

  // Fetch award rates
  const { data: rateData, isLoading: isLoadingRates } = useQuery<ApprenticeRateResponse>({
    queryKey: [buildApprenticeRateQueryUrl()],
    enabled: !!selectedAwardCode,
  });

  // Build query for historical rates
  const buildHistoricalRatesQueryUrl = () => {
    if (!selectedAwardCode) return '';

    const params = new URLSearchParams();
    params.append('awardCode', selectedAwardCode);
    params.append('apprenticeYear', apprenticeYear.toString());
    params.append('isAdult', isAdult.toString());
    params.append('hasCompletedYear12', hasCompletedYear12.toString());
    if (selectedSector) params.append('sector', selectedSector);

    return `/api/fairwork-enhanced/historical-rates?${params.toString()}`;
  };

  // Build query for allowances
  const buildAllowancesQueryUrl = () => {
    if (!selectedAwardCode) return '';

    const params = new URLSearchParams();
    params.append('awardCode', selectedAwardCode);

    return `/api/fairwork-enhanced/allowances?${params.toString()}`;
  };

  // Build query for penalty rates
  const buildPenaltyRatesQueryUrl = () => {
    if (!selectedAwardCode) return '';

    const params = new URLSearchParams();
    params.append('awardCode', selectedAwardCode);

    return `/api/fairwork-enhanced/penalty-rates?${params.toString()}`;
  };

  // Fetch historical rates
  const { data: historicalData, isLoading: isLoadingHistorical } =
    useQuery<HistoricalRatesResponse>({
      queryKey: [buildHistoricalRatesQueryUrl()],
      enabled: !!selectedAwardCode && activeTab === 'historical',
    });

  // Fetch allowances
  const { data: allowancesData, isLoading: isLoadingAllowances } = useQuery<AllowancesResponse>({
    queryKey: [buildAllowancesQueryUrl()],
    enabled: !!selectedAwardCode && activeTab === 'allowances',
  });

  // Fetch penalty rates
  const { data: penaltyRatesData, isLoading: isLoadingPenalties } = useQuery<PenaltyRatesResponse>({
    queryKey: [buildPenaltyRatesQueryUrl()],
    enabled: !!selectedAwardCode && activeTab === 'penalties',
  });

  // When award rates are loaded, notify parent component
  useEffect(() => {
    if (rateData?.success && rateData.data) {
      // Override rates for MA000025 (Electrical Award) with exact values
      let baseRate = rateData.data.rates.baseHourly;

      // Apply correct 2024/2025 FY rates for Electrical Award
      if (selectedAwardCode === 'MA000025') {
        if (isAdult) {
          // Adult apprentice exact rates
          switch (apprenticeYear) {
            case 1:
              baseRate = 23.91;
              break;
            case 2:
              baseRate = 26.42;
              break;
            case 3:
              baseRate = 26.42;
              break;
            case 4:
              baseRate = 26.42;
              break;
            default:
              baseRate = 23.91;
          }
        } else if (hasCompletedYear12) {
          // Junior apprentice with Year 12 completion
          switch (apprenticeYear) {
            case 1:
              baseRate = 16.62;
              break;
            case 2:
              baseRate = 19.53;
              break;
            case 3:
              baseRate = 20.99;
              break;
            case 4:
              baseRate = 24.49;
              break;
            default:
              baseRate = 16.62;
          }
        } else {
          // Junior apprentice without Year 12 completion
          switch (apprenticeYear) {
            case 1:
              baseRate = 15.16;
              break;
            case 2:
              baseRate = 18.08;
              break;
            case 3:
              baseRate = 20.99;
              break;
            case 4:
              baseRate = 24.49;
              break;
            default:
              baseRate = 15.16;
          }
        }
      }

      if (onRateSelected) {
        // Pass the correct base rate to the parent component
        onRateSelected(baseRate, selectedAwardCode, selectedYear);
      }
    }
  }, [
    rateData,
    selectedAwardCode,
    selectedYear,
    apprenticeYear,
    isAdult,
    hasCompletedYear12,
    onRateSelected,
  ]);

  // When award is selected, notify parent component
  useEffect(() => {
    if (awardsData?.success && selectedAwardCode) {
      const selectedAward = awardsData.data.find(
        (award: Award) => award.code === selectedAwardCode
      );
      if (selectedAward && onAwardSelected) {
        onAwardSelected(selectedAward);
      }
    }
  }, [awardsData, selectedAwardCode, onAwardSelected]);

  // Handle award selection
  const handleAwardSelect = (awardCode: string) => {
    setSelectedAwardCode(awardCode);

    // Reset to standard sector if the current sector isn't available for this award
    const award = awardsData?.data.find((a: Award) => a.code === awardCode);
    if (award && !award.sectors.includes(selectedSector) && selectedSector !== 'standard') {
      setSelectedSector('standard');
    }
  };

  // Handle sector change
  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  // Get color for the percentage change
  const getPercentageChangeColor = (change: number | null) => {
    if (change === null) return 'text-gray-500';
    if (change > 3.5) return 'text-green-600';
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (isLoadingAwards) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading awards data...</span>
      </div>
    );
  }

  const awards = awardsData?.success ? awardsData.data : [];
  const selectedAward = Array.isArray(awards)
    ? awards.find((award: Award) => award.code === selectedAwardCode)
    : undefined;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Award Rates Interpreter</CardTitle>
        <CardDescription>
          Calculate apprentice wage rates based on award, year level, and other factors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Award Selection */}
          <div className="space-y-2">
            <Label htmlFor="award">Award</Label>
            <Select value={selectedAwardCode} onValueChange={handleAwardSelect}>
              <SelectTrigger id="award">
                <SelectValue placeholder="Select an award" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(awards) &&
                  awards.map((award: Award) => (
                    <SelectItem key={award.code} value={award.code}>
                      {award.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAward && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Year Selection */}
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={value => setSelectedYear(parseInt(value))}
                  >
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[selectedYear - 2, selectedYear - 1, selectedYear, selectedYear + 1].map(
                        year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Apprentice Year */}
                <div className="space-y-2">
                  <Label htmlFor="apprenticeYear">Apprentice Year</Label>
                  <Select
                    value={apprenticeYear.toString()}
                    onValueChange={value => setApprenticeYear(parseInt(value))}
                  >
                    <SelectTrigger id="apprenticeYear">
                      <SelectValue placeholder="Apprentice year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      <SelectItem value="3">Third Year</SelectItem>
                      <SelectItem value="4">Fourth Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sector */}
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector</Label>
                  <Select value={selectedSector} onValueChange={handleSectorChange}>
                    <SelectTrigger id="sector">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      {selectedAward.sectors.map(sector => (
                        <SelectItem key={sector} value={sector}>
                          {sector.charAt(0).toUpperCase() + sector.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Adult Status */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdult"
                    checked={isAdult}
                    onCheckedChange={checked => setIsAdult(checked === true)}
                  />
                  <Label htmlFor="isAdult" className="cursor-pointer">
                    Adult apprentice (21 years or older)
                  </Label>
                </div>

                {/* Year 12 Completion */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasCompletedYear12"
                    checked={hasCompletedYear12}
                    onCheckedChange={checked => setHasCompletedYear12(checked === true)}
                  />
                  <Label htmlFor="hasCompletedYear12" className="cursor-pointer">
                    Has completed Year 12
                  </Label>
                </div>
              </div>

              {/* Results Display */}
              <div className="mt-6 bg-muted/40 p-4 rounded-lg">
                {isLoadingRates ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Calculating rates...</span>
                  </div>
                ) : rateData?.success ? (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{rateData.data.award.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getOrdinalSuffix(rateData.data.parameters.apprenticeYear)} Year
                          Apprentice ({selectedYear})
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {selectedSector === 'standard'
                            ? 'Standard'
                            : selectedSector.charAt(0).toUpperCase() + selectedSector.slice(1)}{' '}
                          Sector
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 mt-4">
                      <RateCard
                        title="Base Hourly Wage"
                        amount={rateData.data.rates.baseHourly}
                        period="per hour"
                        subtitle="Pure award base rate"
                      />
                      <RateCard
                        title="Modified Hourly Rate"
                        amount={rateData.data.rates.hourly}
                        period="per hour"
                        subtitle="With all applicable adjustments"
                      />
                      <RateCard
                        title="Weekly Wage"
                        amount={rateData.data.rates.weekly}
                        period="per week"
                        subtitle="38-hour standard week"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <RateCard
                        title="Annual Wage"
                        amount={rateData.data.rates.annual}
                        period="per year"
                        subtitle="52-week calculation"
                      />
                      <div className="bg-muted/30 rounded-md p-3 border">
                        <h4 className="text-sm font-medium">Sector</h4>
                        <div className="mt-1 text-sm">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {rateData.data.parameters.sector === 'standard'
                              ? 'Standard Rates'
                              : `${rateData.data.parameters.sector.charAt(0).toUpperCase()}${rateData.data.parameters.sector.slice(1)} Sector`}
                          </Badge>
                          {rateData.data.parameters.sector === 'standard' && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Standard rates apply when no specific sector is selected
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    <p>No rate data available for the selected combination.</p>
                  </div>
                )}
              </div>

              {/* Detailed Information */}
              {showDetails && (
                <div className="mt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="rates">Calculation</TabsTrigger>
                      <TabsTrigger value="historical">Historical</TabsTrigger>
                      <TabsTrigger value="allowances">Allowances</TabsTrigger>
                      <TabsTrigger value="penalties">Penalties</TabsTrigger>
                    </TabsList>

                    {/* Calculation Factors Tab */}
                    <TabsContent value="rates">
                      {isLoadingRates ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : rateData?.success ? (
                        <div className="space-y-4 py-2">
                          <h3 className="text-sm font-medium">Rate Calculation Factors</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Factor</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>Base Rate</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(rateData.data.calculationFactors.baseRate)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Adult Loading</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(rateData.data.calculationFactors.adultBonus)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Year 12 Completion</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(rateData.data.calculationFactors.year12Bonus)}
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Sector Multiplier</TableCell>
                                <TableCell className="text-right">
                                  {rateData.data.calculationFactors.sectorMultiplier}x
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Year Adjustment</TableCell>
                                <TableCell className="text-right">
                                  {(rateData.data.calculationFactors.yearAdjustment * 100).toFixed(
                                    1
                                  )}
                                  %
                                </TableCell>
                              </TableRow>
                              <TableRow className="font-medium">
                                <TableCell>Final Hourly Rate</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(rateData.data.rates.hourly)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No calculation factors available.</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Historical Rates Tab */}
                    <TabsContent value="historical">
                      {isLoadingHistorical ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : historicalData?.success ? (
                        <div className="space-y-4 py-2">
                          <h3 className="text-sm font-medium">Historical Rates (Last 5 Years)</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Year</TableHead>
                                <TableHead className="text-right">Hourly Rate</TableHead>
                                <TableHead className="text-right">Weekly Rate</TableHead>
                                <TableHead className="text-right">Change</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {historicalData.data.historicalRates.map(record => (
                                <TableRow key={record.year}>
                                  <TableCell>{record.year}</TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(record.rates.hourly)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrency(record.rates.weekly)}
                                  </TableCell>
                                  <TableCell
                                    className={`text-right ${getPercentageChangeColor(record.percentageChange)}`}
                                  >
                                    {record.percentageChange !== null
                                      ? `${record.percentageChange}%`
                                      : '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No historical data available.</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Allowances Tab */}
                    <TabsContent value="allowances">
                      {isLoadingAllowances ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : allowancesData?.success ? (
                        <div className="space-y-4 py-2">
                          <h3 className="text-sm font-medium">Applicable Allowances</h3>

                          <div className="space-y-6">
                            {/* Industry Allowances */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Industry Allowances</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Allowance</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Period</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {allowancesData.data.allowances.industry.map(
                                    (allowance, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {allowance.name}
                                          {allowance.trade && (
                                            <span className="text-xs text-muted-foreground ml-1">
                                              ({allowance.trade})
                                            </span>
                                          )}
                                          {allowance.description && (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Info className="h-3.5 w-3.5 inline-block ml-1 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p className="max-w-xs">
                                                    {allowance.description}
                                                  </p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(allowance.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {allowance.period}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Expense Allowances */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Expense Allowances</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Allowance</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Period</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {allowancesData.data.allowances.expense.map(
                                    (allowance, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {allowance.name}
                                          {allowance.description && (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <Info className="h-3.5 w-3.5 inline-block ml-1 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p className="max-w-xs">
                                                    {allowance.description}
                                                  </p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(allowance.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {allowance.period}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Skill Allowances */}
                            {allowancesData.data.allowances.skill && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Skill Allowances</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Allowance</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                      <TableHead className="text-right">Period</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {allowancesData.data.allowances.skill.map(
                                      (allowance, index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            {allowance.name}
                                            {allowance.description && (
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Info className="h-3.5 w-3.5 inline-block ml-1 text-muted-foreground" />
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p className="max-w-xs">
                                                      {allowance.description}
                                                    </p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {formatCurrency(allowance.amount)}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {allowance.period}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No allowance data available.</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Penalty Rates Tab */}
                    <TabsContent value="penalties">
                      {isLoadingPenalties ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : penaltyRatesData?.success ? (
                        <div className="space-y-4 py-2">
                          <h3 className="text-sm font-medium">Penalty Rates</h3>

                          <div className="space-y-6">
                            {/* Overtime */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Overtime Rates</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Condition</TableHead>
                                    <TableHead className="text-right">Multiplier</TableHead>
                                    <TableHead className="text-right">Hourly Rate</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>First two hours</TableCell>
                                    <TableCell className="text-right">
                                      {penaltyRatesData.data.penaltyRates.overtime.firstTwoHours}x
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {rateData?.success &&
                                        formatCurrency(
                                          rateData.data.rates.hourly *
                                            penaltyRatesData.data.penaltyRates.overtime
                                              .firstTwoHours
                                        )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>After two hours</TableCell>
                                    <TableCell className="text-right">
                                      {penaltyRatesData.data.penaltyRates.overtime.afterTwoHours}x
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {rateData?.success &&
                                        formatCurrency(
                                          rateData.data.rates.hourly *
                                            penaltyRatesData.data.penaltyRates.overtime
                                              .afterTwoHours
                                        )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Sunday</TableCell>
                                    <TableCell className="text-right">
                                      {penaltyRatesData.data.penaltyRates.overtime.sunday}x
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {rateData?.success &&
                                        formatCurrency(
                                          rateData.data.rates.hourly *
                                            penaltyRatesData.data.penaltyRates.overtime.sunday
                                        )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Public Holiday</TableCell>
                                    <TableCell className="text-right">
                                      {penaltyRatesData.data.penaltyRates.overtime.publicHoliday}x
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {rateData?.success &&
                                        formatCurrency(
                                          rateData.data.rates.hourly *
                                            penaltyRatesData.data.penaltyRates.overtime
                                              .publicHoliday
                                        )}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>

                            {/* Weekend Rates */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Weekend Rates</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Day</TableHead>
                                    <TableHead className="text-right">Multiplier</TableHead>
                                    <TableHead className="text-right">Hourly Rate</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell>Saturday</TableCell>
                                    <TableCell className="text-right">
                                      {penaltyRatesData.data.penaltyRates.weekend.saturday}x
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {rateData?.success &&
                                        formatCurrency(
                                          rateData.data.rates.hourly *
                                            penaltyRatesData.data.penaltyRates.weekend.saturday
                                        )}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell>Sunday</TableCell>
                                    <TableCell className="text-right">
                                      {penaltyRatesData.data.penaltyRates.weekend.sunday}x
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {rateData?.success &&
                                        formatCurrency(
                                          rateData.data.rates.hourly *
                                            penaltyRatesData.data.penaltyRates.weekend.sunday
                                        )}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>

                            {/* Shift Work */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">Shift Work</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Shift Type</TableHead>
                                    <TableHead className="text-right">Multiplier</TableHead>
                                    <TableHead className="text-right">Hourly Rate</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.entries(penaltyRatesData.data.penaltyRates.shiftWork).map(
                                    ([key, value]) => (
                                      <TableRow key={key}>
                                        <TableCell>
                                          {key
                                            .replace(/([A-Z])/g, ' $1')
                                            .trim()
                                            .charAt(0)
                                            .toUpperCase() +
                                            key
                                              .replace(/([A-Z])/g, ' $1')
                                              .trim()
                                              .slice(1)}
                                        </TableCell>
                                        <TableCell className="text-right">{value}x</TableCell>
                                        <TableCell className="text-right">
                                          {rateData?.success &&
                                            formatCurrency(rateData.data.rates.hourly * value)}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No penalty rate data available.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Rates are calculated using the Fair Work Commission guidelines
        </p>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper component for rate display
function RateCard({
  title,
  amount,
  period,
  subtitle,
}: {
  title: string;
  amount: number;
  period: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-background rounded-md p-3 border">
      <h4 className="text-sm text-muted-foreground">{title}</h4>
      <div className="mt-1">
        <span className="text-2xl font-semibold">
          {new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
          }).format(amount)}
        </span>
        <span className="text-xs text-muted-foreground ml-1">{period}</span>
      </div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  );
}

// Helper function to get ordinal suffix for numbers
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return num + 'st';
  }
  if (j === 2 && k !== 12) {
    return num + 'nd';
  }
  if (j === 3 && k !== 13) {
    return num + 'rd';
  }
  return num + 'th';
}
