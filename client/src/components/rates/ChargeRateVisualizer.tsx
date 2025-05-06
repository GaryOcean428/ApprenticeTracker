import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail } from 'lucide-react';

interface OnCosts {
  superannuation: number;
  workersComp: number;
  payrollTax: number;
  leaveLoading: number;
  studyCost: number;
  ppeCost: number;
  adminCost: number;
}

interface PenaltyEstimates {
  [key: string]: number;
}

interface CalculationResult {
  payRate: number;
  totalHours: number;
  billableHours: number;
  baseWage: number;
  oncosts: OnCosts;
  totalCost: number;
  costPerHour: number;
  chargeRate: number;
  penaltyEstimates?: PenaltyEstimates;
}

interface ChargeRateVisualizerProps {
  calculation: CalculationResult;
  showExportOptions?: boolean;
  apprenticeName?: string;
  hostEmployerName?: string;
  awardName?: string;
  classificationName?: string;
  calculationId?: number;
  calculationDate?: string;
  approved?: boolean;
}

export function ChargeRateVisualizer({
  calculation,
  showExportOptions = true,
  apprenticeName,
  hostEmployerName,
  awardName,
  classificationName,
  calculationId,
  calculationDate,
  approved = false,
}: ChargeRateVisualizerProps) {
  // Format numbers as currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(value);
  };

  // Format numbers as percentages
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en', {
      style: 'percent',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Prepare data for the pie chart (cost breakdown)
  const costBreakdownData = [
    { name: 'Base Wage', value: calculation.baseWage },
    { name: 'Superannuation', value: calculation.oncosts.superannuation },
    { name: 'Workers Comp', value: calculation.oncosts.workersComp },
    { name: 'Payroll Tax', value: calculation.oncosts.payrollTax },
    { name: 'Leave Loading', value: calculation.oncosts.leaveLoading },
    { name: 'Study Cost', value: calculation.oncosts.studyCost },
    { name: 'PPE Cost', value: calculation.oncosts.ppeCost },
    { name: 'Admin Cost', value: calculation.oncosts.adminCost },
  ];

  // Prepare data for the bar chart (penalties)
  const penaltyData = calculation.penaltyEstimates 
    ? Object.entries(calculation.penaltyEstimates).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

  // Calculate profit margin as a percentage
  const marginPercentage = (calculation.chargeRate - calculation.costPerHour) / calculation.costPerHour;

  // Helper to calculate percentage of total cost
  const getPercentageOfTotal = (value: number) => {
    return value / calculation.totalCost;
  };

  // Calculate billable percentage
  const billablePercentage = calculation.billableHours / calculation.totalHours;

  // Helper function to print the breakdown
  const handlePrint = () => {
    window.print();
  };

  // Helper function to download as CSV
  const handleDownloadCSV = () => {
    const rows = [
      ['Charge Rate Calculation Summary'],
      [''],
      ['Calculation ID', calculationId?.toString() || 'N/A'],
      ['Calculation Date', calculationDate || new Date().toLocaleDateString()],
      ['Apprentice', apprenticeName || 'N/A'],
      ['Host Employer', hostEmployerName || 'N/A'],
      ['Award', awardName || 'N/A'],
      ['Classification', classificationName || 'N/A'],
      ['Status', approved ? 'Approved' : 'Pending Approval'],
      [''],
      ['Rate Summary'],
      ['Pay Rate', formatCurrency(calculation.payRate)],
      ['Cost Per Hour', formatCurrency(calculation.costPerHour)],
      ['Charge Rate', formatCurrency(calculation.chargeRate)],
      ['Margin', formatPercent(marginPercentage)],
      [''],
      ['Hours Breakdown'],
      ['Total Hours', calculation.totalHours.toString()],
      ['Billable Hours', calculation.billableHours.toString()],
      ['Billable Percentage', formatPercent(billablePercentage)],
      [''],
      ['Cost Breakdown'],
      ['Base Wage', formatCurrency(calculation.baseWage)],
      ['Superannuation', formatCurrency(calculation.oncosts.superannuation)],
      ['Workers Comp', formatCurrency(calculation.oncosts.workersComp)],
      ['Payroll Tax', formatCurrency(calculation.oncosts.payrollTax)],
      ['Leave Loading', formatCurrency(calculation.oncosts.leaveLoading)],
      ['Study Cost', formatCurrency(calculation.oncosts.studyCost)],
      ['PPE Cost', formatCurrency(calculation.oncosts.ppeCost)],
      ['Admin Cost', formatCurrency(calculation.oncosts.adminCost)],
      ['Total Cost', formatCurrency(calculation.totalCost)],
    ];

    // Add penalty data if available
    if (calculation.penaltyEstimates && Object.keys(calculation.penaltyEstimates).length > 0) {
      rows.push(['']);
      rows.push(['Penalty Estimates']);
      Object.entries(calculation.penaltyEstimates).forEach(([name, value]) => {
        rows.push([name, formatCurrency(value)]);
      });
    }

    // Convert to CSV
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `charge-rate-calculation-${calculationId || new Date().getTime()}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header with basic calculation info */}
      <div className="flex flex-col space-y-2">
        {calculationId && (
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">Calculation ID:</span>
              <span className="ml-2 font-medium">{calculationId}</span>
            </div>
            <Badge variant={approved ? 'default' : 'outline'}>
              {approved ? 'Approved' : 'Pending Approval'}
            </Badge>
          </div>
        )}
        
        {calculationDate && (
          <div>
            <span className="text-sm text-muted-foreground">Date:</span>
            <span className="ml-2">{new Date(calculationDate).toLocaleDateString()}</span>
          </div>
        )}
        
        {(apprenticeName || hostEmployerName) && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
            {apprenticeName && (
              <div className="mb-2 sm:mb-0">
                <span className="text-sm text-muted-foreground">Apprentice:</span>
                <span className="ml-2 font-medium">{apprenticeName}</span>
              </div>
            )}
            {hostEmployerName && (
              <div>
                <span className="text-sm text-muted-foreground">Host Employer:</span>
                <span className="ml-2 font-medium">{hostEmployerName}</span>
              </div>
            )}
          </div>
        )}
        
        {(awardName || classificationName) && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
            {awardName && (
              <div className="mb-2 sm:mb-0">
                <span className="text-sm text-muted-foreground">Award:</span>
                <span className="ml-2">{awardName}</span>
              </div>
            )}
            {classificationName && (
              <div>
                <span className="text-sm text-muted-foreground">Classification:</span>
                <span className="ml-2">{classificationName}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Rate summary card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Rate Summary</CardTitle>
          <CardDescription>Pay rate, cost, and charge rate comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center p-4 border rounded-md">
              <span className="text-sm text-muted-foreground mb-1">Pay Rate</span>
              <span className="text-2xl font-bold">{formatCurrency(calculation.payRate)}</span>
              <span className="text-xs text-muted-foreground">per hour</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 border rounded-md">
              <span className="text-sm text-muted-foreground mb-1">Cost Per Hour</span>
              <span className="text-2xl font-bold">{formatCurrency(calculation.costPerHour)}</span>
              <span className="text-xs text-muted-foreground">with all costs</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-primary/5">
              <span className="text-sm text-muted-foreground mb-1">Charge Rate</span>
              <span className="text-3xl font-bold text-primary">{formatCurrency(calculation.chargeRate)}</span>
              <span className="text-xs text-muted-foreground">including {formatPercent(marginPercentage)} margin</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Hours Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Total Hours:</span>
                <span className="ml-2 font-medium">{calculation.totalHours}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Billable Hours:</span>
                <span className="ml-2 font-medium">{calculation.billableHours}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Billable %:</span>
                <span className="ml-2 font-medium">{formatPercent(billablePercentage)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Cost breakdown section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Detailed view of all costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${formatPercent(percent)}`}
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cost Details</CardTitle>
            <CardDescription>Breakdown of all cost components</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px] p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="font-medium">Component</span>
                  <div className="flex space-x-4">
                    <span className="font-medium">Amount</span>
                    <span className="font-medium w-16 text-right">%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span>Base Wage</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.baseWage)}</span>
                    <span className="w-16 text-right">{formatPercent(getPercentageOfTotal(calculation.baseWage))}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span>Superannuation</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.oncosts.superannuation)}</span>
                    <span className="w-16 text-right">{formatPercent(getPercentageOfTotal(calculation.oncosts.superannuation))}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span>Workers Compensation</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.oncosts.workersComp)}</span>
                    <span className="w-16 text-right">{formatPercent(getPercentageOfTotal(calculation.oncosts.workersComp))}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span>Payroll Tax</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.oncosts.payrollTax)}</span>
                    <span className="w-16 text-right">{formatPercent(getPercentageOfTotal(calculation.oncosts.payrollTax))}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span>Leave Loading</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.oncosts.leaveLoading)}</span>
                    <span className="w-16 text-right">{formatPercent(getPercentageOfTotal(calculation.oncosts.leaveLoading))}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span>Study Cost</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.oncosts.studyCost)}</span>
                    <span className="w-16 text-right">{formatPercent(getPercentageOfTotal(calculation.oncosts.studyCost))}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span>PPE Cost</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.oncosts.ppeCost)}</span>
                    <span className="w-16 text-right">{formatPercent(getPercentageOfTotal(calculation.oncosts.ppeCost))}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-1">
                  <span>Administration</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.oncosts.adminCost)}</span>
                    <span className="w-16 text-right">{formatPercent(getPercentageOfTotal(calculation.oncosts.adminCost))}</span>
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center py-1 font-medium">
                  <span>Total Cost</span>
                  <div className="flex space-x-4">
                    <span>{formatCurrency(calculation.totalCost)}</span>
                    <span className="w-16 text-right">100%</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Penalty estimates section */}
      {calculation.penaltyEstimates && Object.keys(calculation.penaltyEstimates).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Penalty Estimates</CardTitle>
            <CardDescription>Estimated additional costs for penalties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={penaltyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 70,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 12 }} 
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="value" name="Additional Cost" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Export options */}
      {showExportOptions && (
        <div className="flex justify-end space-x-2 mt-4 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      )}
    </div>
  );
}
