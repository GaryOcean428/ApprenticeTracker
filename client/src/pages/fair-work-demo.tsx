import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Info, Calculator } from 'lucide-react';
import EnhancedAwardSelector from '@/components/fair-work/EnhancedAwardSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define types for charge rate calculations
interface CostConfig {
  superRate: number;        // e.g., 0.115 for 11.5%
  wcRate: number;           // workers' compensation rate
  payrollTaxRate: number;   // payroll tax rate
  leaveLoading: number;     // leave loading percentage
  adminRate: number;        // admin overhead rate
  profitMargin: number;     // profit margin percentage
}

export default function FairWorkDemoPage() {
  // State for award rate
  const [selectedBaseRate, setSelectedBaseRate] = useState<number | null>(null);
  const [selectedAward, setSelectedAward] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  
  // State for charge rate calculations
  const [costConfig, setCostConfig] = useState<CostConfig>({
    superRate: 0.115,        // 11.5% superannuation
    wcRate: 0.035,           // 3.5% workers' compensation
    payrollTaxRate: 0.0485,  // 4.85% payroll tax
    leaveLoading: 0.175,     // 17.5% leave loading
    adminRate: 0.12,         // 12% admin overhead
    profitMargin: 0.15       // 15% profit margin
  });
  
  // Calculated charge rate
  const [chargeRate, setChargeRate] = useState<number | null>(null);
  const [wageBreakdown, setWageBreakdown] = useState<{ label: string, amount: number, percentage: number }[]>([]);
  const [activeTab, setActiveTab] = useState('wages');

  // Handle rate selection from the award interpreter
  const handleRateSelected = (rate: number, award: string, year: number) => {
    console.log(`Selected rate: $${rate.toFixed(2)} for award ${award} in year ${year}`);
    
    // Use the pure base rate for calculations
    // This is the rate before any adjustments like adult, year12, sector
    // The API response includes this as a separate field we can access via the EnhancedAwardSelector
    setSelectedBaseRate(rate);
    setSelectedAward(award);
    setSelectedYear(year);
  };

  // Calculate charge rate when base rate or cost config changes
  useEffect(() => {
    if (selectedBaseRate === null) return;
    
    // Calculate on-costs
    const baseSalary = selectedBaseRate;
    const superannuation = baseSalary * costConfig.superRate;
    const workersComp = baseSalary * costConfig.wcRate;
    const payrollTax = baseSalary * costConfig.payrollTaxRate;
    const leaveLoading = baseSalary * costConfig.leaveLoading / 5; // Approximate per hour
    const adminCost = baseSalary * costConfig.adminRate;
    
    // Calculate total cost
    const totalCost = baseSalary + superannuation + workersComp + payrollTax + leaveLoading + adminCost;
    
    // Add profit margin
    const profitAmount = totalCost * costConfig.profitMargin;
    const finalChargeRate = totalCost + profitAmount;
    
    setChargeRate(finalChargeRate);
    
    // Create breakdown for visualization
    setWageBreakdown([
      { label: 'Base Wage', amount: baseSalary, percentage: (baseSalary / finalChargeRate) * 100 },
      { label: 'Superannuation', amount: superannuation, percentage: (superannuation / finalChargeRate) * 100 },
      { label: 'Workers Comp', amount: workersComp, percentage: (workersComp / finalChargeRate) * 100 },
      { label: 'Payroll Tax', amount: payrollTax, percentage: (payrollTax / finalChargeRate) * 100 },
      { label: 'Leave Loading', amount: leaveLoading, percentage: (leaveLoading / finalChargeRate) * 100 },
      { label: 'Admin Overhead', amount: adminCost, percentage: (adminCost / finalChargeRate) * 100 },
      { label: 'Profit Margin', amount: profitAmount, percentage: (profitAmount / finalChargeRate) * 100 }
    ]);
  }, [selectedBaseRate, costConfig]);

  // Format as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  // Handle cost config changes
  const handleCostConfigChange = (key: keyof CostConfig, value: number) => {
    setCostConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
        
        <div className="mt-4">
          <h1 className="text-3xl font-bold">Fair Work Award Interpreter</h1>
          <p className="text-muted-foreground mt-2">
            Advanced award interpretation for calculating apprentice wages and charge rates
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wages">Award Wages</TabsTrigger>
          <TabsTrigger value="charge-rates">Charge Rate Calculator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wages" className="space-y-8">
          <EnhancedAwardSelector 
            onRateSelected={handleRateSelected}
            defaultAwardCode="MA000025"
            defaultApprenticeYear={2}
          />
        </TabsContent>
        
        <TabsContent value="charge-rates" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                <span>Charge Rate Calculator</span>
              </CardTitle>
              <CardDescription>
                Convert award wage rates into charge rates based on operational costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Wage Rate Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="baseRate">Base Hourly Wage Rate</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input 
                            id="baseRate"
                            type="number"
                            value={selectedBaseRate !== null ? selectedBaseRate.toString() : ''}
                            onChange={(e) => setSelectedBaseRate(parseFloat(e.target.value) || 0)}
                            className="w-full"
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('wages')}
                            className="whitespace-nowrap"
                          >
                            Use Award Rate
                          </Button>
                        </div>
                        {selectedAward && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Current award rate from {selectedAward} ({selectedYear})
                          </p>
                        )}
                      </div>
                      
                      {/* Charge Rate Result */}
                      {chargeRate !== null && (
                        <div className="bg-primary/10 p-4 rounded-lg border mt-6">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Calculated Charge Rate</h3>
                              <p className="text-3xl font-bold text-primary">{formatCurrency(chargeRate)} <span className="text-sm font-normal text-muted-foreground">per hour</span></p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Markup</p>
                              <p className="text-lg">{((chargeRate / (selectedBaseRate || 1) - 1) * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Cost Parameters */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium mb-2">Cost Components</h3>
                    
                    <div className="space-y-6">
                      {/* Superannuation */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="superRate">Superannuation</Label>
                          <span className="text-sm">{(costConfig.superRate * 100).toFixed(1)}%</span>
                        </div>
                        <Slider 
                          id="superRate"
                          value={[costConfig.superRate * 100]}
                          min={10.5}
                          max={15}
                          step={0.1}
                          onValueChange={(value) => handleCostConfigChange('superRate', value[0] / 100)}
                        />
                      </div>
                      
                      {/* Workers Comp */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="wcRate">Workers Compensation</Label>
                          <span className="text-sm">{(costConfig.wcRate * 100).toFixed(1)}%</span>
                        </div>
                        <Slider 
                          id="wcRate"
                          value={[costConfig.wcRate * 100]}
                          min={1}
                          max={8}
                          step={0.1}
                          onValueChange={(value) => handleCostConfigChange('wcRate', value[0] / 100)}
                        />
                      </div>
                      
                      {/* Payroll Tax */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="payrollTaxRate">Payroll Tax</Label>
                          <span className="text-sm">{(costConfig.payrollTaxRate * 100).toFixed(2)}%</span>
                        </div>
                        <Slider 
                          id="payrollTaxRate"
                          value={[costConfig.payrollTaxRate * 100]}
                          min={0}
                          max={6}
                          step={0.01}
                          onValueChange={(value) => handleCostConfigChange('payrollTaxRate', value[0] / 100)}
                        />
                      </div>
                      
                      {/* Leave Loading */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="leaveLoading">Leave Loading</Label>
                          <span className="text-sm">{(costConfig.leaveLoading * 100).toFixed(1)}%</span>
                        </div>
                        <Slider 
                          id="leaveLoading"
                          value={[costConfig.leaveLoading * 100]}
                          min={0}
                          max={25}
                          step={0.5}
                          onValueChange={(value) => handleCostConfigChange('leaveLoading', value[0] / 100)}
                        />
                      </div>
                      
                      {/* Admin Rate */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="adminRate">Admin Overhead</Label>
                          <span className="text-sm">{(costConfig.adminRate * 100).toFixed(1)}%</span>
                        </div>
                        <Slider 
                          id="adminRate"
                          value={[costConfig.adminRate * 100]}
                          min={5}
                          max={25}
                          step={0.5}
                          onValueChange={(value) => handleCostConfigChange('adminRate', value[0] / 100)}
                        />
                      </div>
                      
                      {/* Profit Margin */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="profitMargin">Profit Margin</Label>
                          <span className="text-sm">{(costConfig.profitMargin * 100).toFixed(1)}%</span>
                        </div>
                        <Slider 
                          id="profitMargin"
                          value={[costConfig.profitMargin * 100]}
                          min={5}
                          max={35}
                          step={0.5}
                          onValueChange={(value) => handleCostConfigChange('profitMargin', value[0] / 100)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Rate Breakdown */}
                {chargeRate !== null && wageBreakdown.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Charge Rate Breakdown</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {wageBreakdown.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.label}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                            <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell className="font-bold">Total Charge Rate</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(chargeRate)}</TableCell>
                          <TableCell className="text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="p-6 border rounded-lg bg-muted/30 mt-8">
        <h2 className="text-xl font-semibold mb-4">About Fair Work Award Interpretation</h2>
        <p className="mb-4">
          This enhanced Fair Work award interpreter allows you to calculate precise apprentice wages based on multiple factors:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Modern award selection from the Fair Work Commission</li>
          <li>Apprentice year progression (1st through 4th year)</li>
          <li>Adult apprentice status (different rates for apprentices 21 years or older)</li>
          <li>Year 12 completion bonus rates</li>
          <li>Industry sector variations (commercial, residential, industrial)</li>
          <li>Historical rate trends for financial planning</li>
          <li>Detailed penalty rates and allowances</li>
        </ul>
        <p>
          Proper award interpretation is essential for GTOs to maintain compliance with Fair Work regulations and ensure apprentices are paid correctly while host employers are charged appropriate rates.
        </p>
      </div>
    </div>
  );
}