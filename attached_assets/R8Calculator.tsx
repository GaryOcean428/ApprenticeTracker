import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, Calculator, Info, X, DollarSign, Clock, BarChart, Calendar, Users, Briefcase, List, CheckCircle2, LucideCrop as LucideProps } from 'lucide-react';
import FairWorkUpdateNotification from './FairWorkUpdateNotification';

// Interfaces for Type Safety
interface CostConfig {
  superRate: number;        // e.g., 0.115 for 11.5%
  wcRate: number;           // workers' compensation rate
  payrollTaxRate: number;   // payroll tax rate
  leaveLoading: number;     // leave loading percentage
  studyCost: number;        // annual study cost
  ppeCost: number;          // annual protective clothing cost
  adminRate: number;        // administration overhead rate
  defaultMargin: number;    // default profit margin
  adverseWeatherDays: number; // days lost to adverse weather
}

interface WorkConfig {
  hoursPerDay: number;
  daysPerWeek: number;
  weeksPerYear: number;
  annualLeaveDays: number;
  publicHolidays: number;
  sickLeaveDays: number;
  trainingWeeks: number;
}

interface BillableOptions {
  includeAnnualLeave: boolean;
  includePublicHolidays: boolean;
  includeSickLeave: boolean;
  includeTrainingTime: boolean;
  includeAdverseWeather: boolean;
}

interface OnCosts {
  superannuation: number;
  workersComp: number;
  payrollTax: number;
  leaveLoading: number;
  studyCost: number;
  ppeCost: number;
  adminCost: number;
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
}

// Default Configuration
const initialCostConfig: CostConfig = {
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

const initialWorkConfig: WorkConfig = {
  hoursPerDay: 7.6,
  daysPerWeek: 5,
  weeksPerYear: 52,
  annualLeaveDays: 20,
  publicHolidays: 10,
  sickLeaveDays: 10,
  trainingWeeks: 5,
};

const initialBillableOptions: BillableOptions = {
  includeAnnualLeave: false,
  includePublicHolidays: false,
  includeSickLeave: false,
  includeTrainingTime: false,
  includeAdverseWeather: false,
};

// Calculation Functions
function calculateTotalAnnualHours(workConfig: WorkConfig): number {
  return workConfig.hoursPerDay * workConfig.daysPerWeek * workConfig.weeksPerYear;
}

function calculateBillableHours(
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

function calculateOnCosts(payRate: number, totalHours: number, config: CostConfig): OnCosts {
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

function calculateChargeRate(
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

// Component for icons with labels
const IconLabel: React.FC<{
  icon: React.FC<LucideProps>;
  label: string;
  className?: string;
}> = ({ icon: Icon, label, className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </div>
);

// Input Field Component
const InputField: React.FC<{
  label: string;
  type: string;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
  suffix?: string;
  tooltip?: string;
}> = ({ label, type, value, onChange, min, max, step, className = "", suffix, tooltip }) => (
  <div className="relative group">
    <label className="flex flex-col">
      <div className="flex items-center gap-2 mb-1.5 text-sm font-medium text-gray-700">
        <span>{label}</span>
        {tooltip && (
          <div className="relative">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
            <div className="absolute left-0 bottom-full mb-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
              <div className="bg-gray-800 text-white text-xs rounded py-1.5 px-2.5 w-56">
                {tooltip}
                <div className="absolute top-full left-1.5 w-2 h-2 bg-gray-800 transform rotate-45"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            suffix ? "pr-9" : ""
          } ${className}`}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    </label>
  </div>
);

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
}> = ({ id, checked, onChange, label, description }) => (
  <div className="flex items-start space-x-3 py-2">
    <div className="flex items-center h-5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
    </div>
    <div className="ml-3 text-sm">
      <label htmlFor={id} className="font-medium text-gray-700">
        {label}
      </label>
      {description && <p className="text-gray-500">{description}</p>}
    </div>
  </div>
);

// Card Component
const Card: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleIcon?: React.FC<LucideProps>;
}> = ({ title, children, className = "", titleIcon: Icon }) => (
  <div
    className={`bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    {title && (
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="flex items-center gap-2 font-semibold text-gray-800 text-base">
          {Icon && <Icon className="w-4 h-4 text-blue-600" />}
          {title}
        </h3>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

// Tab Component
const Tab: React.FC<{
  id: string;
  activeTab: string;
  setActiveTab: (id: string) => void;
  icon: React.FC<LucideProps>;
  label: string;
}> = ({ id, activeTab, setActiveTab, icon: Icon, label }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex items-center gap-2 px-4 py-2.5 transition-colors ${
      activeTab === id
        ? "text-blue-600 border-b-2 border-blue-600 font-medium"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: string | number;
  format?: (value: number) => string;
  icon: React.FC<LucideProps>;
  highlight?: boolean;
  tooltip?: string;
}> = ({ label, value, format, icon: Icon, highlight = false, tooltip }) => (
  <div className={`relative group rounded-lg p-4 ${highlight ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gray-50'}`}>
    <div className="flex justify-between mb-2">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <Icon className={`w-4 h-4 ${highlight ? 'text-blue-500' : 'text-gray-400'}`} />
    </div>
    <p className={`text-2xl font-bold ${highlight ? 'text-blue-700' : 'text-gray-800'}`}>
      {typeof value === "number" && format ? format(value) : value}
    </p>
    
    {tooltip && (
      <div className="absolute left-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-20">
        <div className="bg-gray-800 text-white text-xs rounded py-1.5 px-2.5 w-56">
          {tooltip}
          <div className="absolute bottom-full left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
        </div>
      </div>
    )}
  </div>
);

// Progress Steps Component
const ProgressSteps: React.FC<{
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}> = ({ steps, currentStep, onStepClick }) => (
  <div className="flex items-center justify-between mb-6 pt-2">
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        {index > 0 && (
          <div
            className={`flex-1 h-0.5 ${
              index <= currentStep ? "bg-blue-500" : "bg-gray-300"
            }`}
          ></div>
        )}
        <button
          onClick={() => onStepClick(index)}
          className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors
          ${
            index < currentStep
              ? "bg-blue-600 text-white"
              : index === currentStep
              ? "bg-blue-500 text-white ring-4 ring-blue-100"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {index < currentStep ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
          <span className="absolute -bottom-6 transform -translate-x-1/2 left-1/2 whitespace-nowrap text-sm font-medium">
            {step}
          </span>
        </button>
      </React.Fragment>
    ))}
  </div>
);

// Main Component
const R8Calculator: React.FC = () => {
  const [payRate, setPayRate] = useState<number>(29.5);
  const [costConfig, setCostConfig] = useState<CostConfig>(initialCostConfig);
  const [workConfig, setWorkConfig] = useState<WorkConfig>(initialWorkConfig);
  const [billableOptions, setBillableOptions] = useState<BillableOptions>(initialBillableOptions);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('costs');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const steps = ["Pay Rate", "Cost Settings", "Work Setup", "Billable Options"];

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    switch (step) {
      case 0:
        // Pay Rate step - no specific tab
        break;
      case 1:
        setActiveTab('costs');
        break;
      case 2:
        setActiveTab('work');
        break;
      case 3:
        setActiveTab('billable');
        break;
    }
  };

  const handlePayRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPayRate(isNaN(value) ? 0 : value);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleCostConfigChange = (key: keyof CostConfig, value: number) => {
    setCostConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleWorkConfigChange = (key: keyof WorkConfig, value: number) => {
    setWorkConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBillableOptionChange = (key: keyof BillableOptions) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillableOptions(prev => ({
      ...prev,
      [key]: e.target.checked
    }));
  };

  const result = calculateChargeRate(
    payRate, 
    workConfig, 
    costConfig, 
    billableOptions, 
    costConfig.defaultMargin
  );

  // Format currency
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  
  // Format hours
  const formatHours = (value: number) => `${value.toFixed(1)}`;
  
  // Format percentage
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const onCostItems = [
    { key: 'superannuation', label: 'Superannuation', icon: Users },
    { key: 'workersComp', label: 'Workers\' Comp', icon: Briefcase },
    { key: 'payrollTax', label: 'Payroll Tax', icon: DollarSign },
    { key: 'leaveLoading', label: 'Leave Loading', icon: Calendar },
    { key: 'studyCost', label: 'Study Cost', icon: Calculator },
    { key: 'ppeCost', label: 'PPE Cost', icon: Briefcase },
    { key: 'adminCost', label: 'Admin Cost', icon: List },
  ];

  // Calculate percentages for visualization
  const totalCost = result.totalCost;
  const baseWagePercent = (result.baseWage / totalCost) * 100;
  const oncostsPercent = (Object.values(result.oncosts).reduce((a, b) => a + b, 0) / totalCost) * 100;
  
  // Handle Fair Work update notification clicks
  const handleUpdateAwardRates = () => {
    // Navigate to the settings page, awards section
    // For now, just log this action
    console.log('User requested to update award rates');
  };
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="text-blue-600" />
            R8 Calculator
          </h1>
          <div>
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-gray-500 hover:text-gray-700 mr-2"
              aria-label="Show calculator information"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Fair Work Update Notification */}
        <FairWorkUpdateNotification 
          onUpdateClick={handleUpdateAwardRates}
        />
        
        {showTooltip && (
          <div className="relative mb-4">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-blue-800 text-sm">
              <button
                onClick={() => setShowTooltip(false)}
                className="absolute right-2 top-2 text-blue-400 hover:text-blue-600"
                aria-label="Close calculator information"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="font-medium mb-1">R8 Apprentice Charge Calculator</p>
              <p>
                This calculator computes accurate charge rates based on pay rate, working models, and
                standard industry on-costs. Follow the steps to customize your calculation.
              </p>
            </div>
          </div>
        )}
        
        <ProgressSteps 
          steps={steps} 
          currentStep={currentStep} 
          onStepClick={handleStepClick} 
        />
      </header>

      {currentStep === 0 && (
        <div className="transition-all transform mb-8">
          <Card 
            title="Set Pay Rate" 
            titleIcon={DollarSign}
            className="border-blue-200"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-grow">
                <InputField
                  label="Hourly Pay Rate"
                  type="number"
                  value={payRate}
                  onChange={handlePayRateChange}
                  min="0"
                  step="0.01"
                  suffix="$/hr"
                  tooltip="The base hourly rate for the apprentice before any on-costs or margins."
                  className="text-lg"
                />
              </div>
              <div>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setActiveTab('costs');
                  }}
                  className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Next: Cost Settings</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {currentStep > 0 && (
        <div className="mb-8">
          <Card>
            <div className="border-b border-gray-200 mb-4">
              <div className="flex overflow-x-auto">
                <Tab
                  id="costs"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  icon={DollarSign}
                  label="Cost & Margin Settings"
                />
                <Tab
                  id="work"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  icon={Clock}
                  label="Work Parameters"
                />
                <Tab
                  id="billable"
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  icon={BarChart}
                  label="Billable Time Options"
                />
              </div>
            </div>

            {activeTab === 'costs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Statutory On-costs
                  </h3>
                  <InputField
                    label="Superannuation Rate"
                    type="number"
                    value={costConfig.superRate * 100}
                    onChange={(e) => handleCostConfigChange('superRate', Number(e.target.value) / 100)}
                    min="0"
                    max="100"
                    step="0.1"
                    suffix="%"
                    tooltip="The mandatory superannuation contribution percentage, currently 11.5% in Australia."
                  />
                  <InputField
                    label="Workers' Compensation"
                    type="number"
                    value={costConfig.wcRate * 100}
                    onChange={(e) => handleCostConfigChange('wcRate', Number(e.target.value) / 100)}
                    min="0"
                    max="100"
                    step="0.1"
                    suffix="%"
                    tooltip="Insurance rate for workplace injuries and illnesses. Varies by industry and state."
                  />
                  <InputField
                    label="Payroll Tax"
                    type="number"
                    value={costConfig.payrollTaxRate * 100}
                    onChange={(e) => handleCostConfigChange('payrollTaxRate', Number(e.target.value) / 100)}
                    min="0"
                    max="100"
                    step="0.1"
                    suffix="%"
                    tooltip="State-based tax on overall employee wages. Only applies if your total payroll exceeds the threshold for your state."
                  />
                  <InputField
                    label="Leave Loading"
                    type="number"
                    value={costConfig.leaveLoading * 100}
                    onChange={(e) => handleCostConfigChange('leaveLoading', Number(e.target.value) / 100)}
                    min="0"
                    max="100"
                    step="0.1"
                    suffix="%"
                    tooltip="Additional percentage paid on annual leave, typically 17.5% in Australia."
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    Additional Costs & Margin
                  </h3>
                  <InputField
                    label="Study/Training Cost"
                    type="number"
                    value={costConfig.studyCost}
                    onChange={(e) => handleCostConfigChange('studyCost', Number(e.target.value))}
                    min="0"
                    step="50"
                    suffix="$/yr"
                    tooltip="Annual cost for education, training materials, and TAFE fees."
                  />
                  <InputField
                    label="PPE Cost"
                    type="number"
                    value={costConfig.ppeCost}
                    onChange={(e) => handleCostConfigChange('ppeCost', Number(e.target.value))}
                    min="0"
                    step="50"
                    suffix="$/yr"
                    tooltip="Annual cost for personal protective equipment, including safety gear, uniforms, and tools."
                  />
                  <InputField
                    label="Admin Overhead"
                    type="number"
                    value={costConfig.adminRate * 100}
                    onChange={(e) => handleCostConfigChange('adminRate', Number(e.target.value) / 100)}
                    min="0"
                    max="100"
                    step="0.1"
                    suffix="%"
                    tooltip="Percentage for administrative costs including payroll processing, HR support, and management overhead."
                  />
                  <InputField
                    label="Profit Margin"
                    type="number"
                    value={costConfig.defaultMargin * 100}
                    onChange={(e) => handleCostConfigChange('defaultMargin', Number(e.target.value) / 100)}
                    min="0"
                    max="100"
                    step="0.1"
                    suffix="%"
                    tooltip="The profit margin percentage added to the cost per hour to determine the final charge rate."
                  />
                  <InputField
                    label="Adverse Weather Days"
                    type="number"
                    value={costConfig.adverseWeatherDays}
                    onChange={(e) => handleCostConfigChange('adverseWeatherDays', Number(e.target.value))}
                    min="0"
                    step="1"
                    suffix="days/yr"
                    tooltip="Estimated number of days lost to adverse weather conditions annually. Important for outdoor trades like construction."
                  />
                </div>
                <div className="col-span-1 md:col-span-2 mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setCurrentStep(2);
                      setActiveTab('work');
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <span>Next: Work Parameters</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'work' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Hours Per Day"
                    type="number"
                    value={workConfig.hoursPerDay}
                    onChange={(e) => handleWorkConfigChange('hoursPerDay', Number(e.target.value))}
                    min="0"
                    step="0.1"
                    suffix="hrs"
                    tooltip="Standard work hours per day. Most awards specify 7.6 hours (7 hours and 36 minutes) as the standard workday."
                  />
                  <InputField
                    label="Days Per Week"
                    type="number"
                    value={workConfig.daysPerWeek}
                    onChange={(e) => handleWorkConfigChange('daysPerWeek', Number(e.target.value))}
                    min="0"
                    max="7"
                    step="0.5"
                    suffix="days"
                    tooltip="Number of work days per week. Typically 5 days for full-time apprentices."
                  />
                  <InputField
                    label="Weeks Per Year"
                    type="number"
                    value={workConfig.weeksPerYear}
                    onChange={(e) => handleWorkConfigChange('weeksPerYear', Number(e.target.value))}
                    min="0"
                    max="52"
                    step="1"
                    suffix="weeks"
                    tooltip="Number of working weeks per year. The standard value is 52 weeks (full year)."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField
                    label="Annual Leave"
                    type="number"
                    value={workConfig.annualLeaveDays}
                    onChange={(e) => handleWorkConfigChange('annualLeaveDays', Number(e.target.value))}
                    min="0"
                    step="1"
                    suffix="days"
                    tooltip="Annual vacation days per year. The standard entitlement in Australia is 20 days (4 weeks) per year."
                  />
                  <InputField
                    label="Public Holidays"
                    type="number"
                    value={workConfig.publicHolidays}
                    onChange={(e) => handleWorkConfigChange('publicHolidays', Number(e.target.value))}
                    min="0"
                    step="1"
                    suffix="days"
                    tooltip="Number of public holidays per year. Australia typically has 10-12 public holidays annually, depending on the state."
                  />
                  <InputField
                    label="Sick Leave"
                    type="number"
                    value={workConfig.sickLeaveDays}
                    onChange={(e) => handleWorkConfigChange('sickLeaveDays', Number(e.target.value))}
                    min="0"
                    step="1"
                    suffix="days"
                    tooltip="Allocated sick/personal leave days per year. The standard entitlement in Australia is 10 days per year."
                  />
                  <InputField
                    label="Training"
                    type="number"
                    value={workConfig.trainingWeeks}
                    onChange={(e) => handleWorkConfigChange('trainingWeeks', Number(e.target.value))}
                    min="0"
                    step="0.5"
                    suffix="weeks"
                    tooltip="Time allocated for training and education per year. Typically apprentices attend TAFE or training for 4-8 weeks per year depending on the trade and level."
                  />
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setCurrentStep(3);
                      setActiveTab('billable');
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <span>Next: Billable Options</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billable' && (
              <div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <h3 className="text-blue-800 font-medium mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Billable Time Configuration
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Select which non-working periods should be included in billable hours. Including a period means its cost will be spread across all billable hours, resulting in a lower hourly rate. Excluding a period means its cost will be recovered through a higher hourly rate during active work periods.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <ToggleSwitch
                    id="includeAnnualLeave"
                    checked={billableOptions.includeAnnualLeave}
                    onChange={handleBillableOptionChange('includeAnnualLeave')}
                    label="Include Annual Leave in Billable Hours"
                    description="If enabled, annual leave costs will be spread across all working hours. If disabled, these costs will be recovered through a higher rate during active work periods."
                  />
                  
                  <ToggleSwitch
                    id="includePublicHolidays"
                    checked={billableOptions.includePublicHolidays}
                    onChange={handleBillableOptionChange('includePublicHolidays')}
                    label="Include Public Holidays in Billable Hours"
                    description="If enabled, public holiday costs will be spread across all working hours. If disabled, these costs will be recovered through a higher rate during active work periods."
                  />
                  
                  <ToggleSwitch
                    id="includeSickLeave"
                    checked={billableOptions.includeSickLeave}
                    onChange={handleBillableOptionChange('includeSickLeave')}
                    label="Include Sick Leave in Billable Hours"
                    description="If enabled, sick leave costs will be spread across all working hours. If disabled, these costs will be recovered through a higher rate during active work periods."
                  />
                  
                  <ToggleSwitch
                    id="includeTrainingTime"
                    checked={billableOptions.includeTrainingTime}
                    onChange={handleBillableOptionChange('includeTrainingTime')}
                    label="Include Training Time in Billable Hours"
                    description="If enabled, training time costs will be spread across all working hours. If disabled, these costs will be recovered through a higher rate during active work periods."
                  />
                  
                  <ToggleSwitch
                    id="includeAdverseWeather"
                    checked={billableOptions.includeAdverseWeather}
                    onChange={handleBillableOptionChange('includeAdverseWeather')}
                    label="Include Adverse Weather Days in Billable Hours"
                    description="If enabled, adverse weather day costs will be spread across all working hours. If disabled, these costs will be recovered through a higher rate during active work periods."
                  />
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">Impact on Charge Rate</h4>
                  <p className="text-sm text-amber-700">
                    Including more periods in billable hours will lower your hourly charge rate but requires charging during these periods. 
                    Excluding periods results in a higher hourly rate during active work time but no charges during excluded periods.
                    Choose the approach that best matches your billing practices and client agreements.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Results Section */}
      <div className="mb-8">
        <Card 
          titleIcon={BarChart}
          title="Calculation Results"
          className="border-green-200"
        >
          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              label="Pay Rate"
              value={result.payRate}
              format={formatCurrency}
              icon={DollarSign}
              tooltip="Base hourly pay rate before on-costs"
            />
            <StatCard
              label="Billable Hours"
              value={result.billableHours}
              format={formatHours}
              icon={Clock}
              tooltip="Annual hours available for billing after deducting non-billable time based on your configuration"
            />
            <StatCard
              label="Charge Rate"
              value={result.chargeRate}
              format={formatCurrency}
              icon={Calculator}
              highlight={true}
              tooltip="Final hourly rate to charge clients including all costs, overheads, and profit margin"
            />
          </div>

          {/* Cost Breakdown */}
          <div className="mb-4">
            <button
              onClick={toggleDetails}
              className="w-full flex items-center justify-between py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              aria-expanded={showDetails}
              aria-controls="cost-breakdown-details"
            >
              <span className="font-medium text-gray-700 flex items-center gap-2">
                <List className="w-4 h-4" /> 
                Detailed Cost Breakdown
              </span>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {showDetails && (
              <div id="cost-breakdown-details" className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Base Information */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Base Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Total Annual Hours</span>
                        <span className="font-medium">{formatHours(result.totalHours)} hours</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Billable Hours</span>
                        <span className="font-medium">{formatHours(result.billableHours)} hours</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Base Annual Wage</span>
                        <span className="font-medium">{formatCurrency(result.baseWage)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Cost Per Hour</span>
                        <span className="font-medium">{formatCurrency(result.costPerHour)}/hour</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Profit Margin</span>
                        <span className="font-medium">{formatPercent(costConfig.defaultMargin)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* On-costs */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">On-costs</h4>
                    <div className="space-y-2">
                      {onCostItems.map(item => (
                        <div key={item.key} className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-gray-600 flex items-center gap-2">
                            <item.icon className="w-4 h-4 text-gray-400" />
                            {item.label}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(result.oncosts[item.key as keyof OnCosts])}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 border-b border-gray-200 font-medium">
                        <span className="text-gray-700">Total Costs</span>
                        <span>{formatCurrency(result.totalCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Distribution Visualization */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Cost Distribution</h4>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-blue-500 rounded-l-full"
                      style={{ width: `${baseWagePercent}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500 rounded-r-full"
                      style={{ width: `${oncostsPercent}%`, marginLeft: `${baseWagePercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                      <span>Base Wage ({baseWagePercent.toFixed(1)}%)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                      <span>On-costs ({oncostsPercent.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Charge Rate Summary */}
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-800 font-medium">Final Charge Rate</p>
                <p className="text-3xl font-bold text-blue-700">{formatCurrency(result.chargeRate)}/hour</p>
              </div>
              <div className="hidden md:block">
                <div className="text-sm text-blue-700">
                  <p>Based on {formatHours(result.billableHours)} billable hours</p>
                  <p>With {formatPercent(costConfig.defaultMargin)} profit margin</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <footer className="text-center text-gray-500 text-sm">
        <p>© 2025 R8 Calculator - All calculations are estimates based on standard industry parameters</p>
      </footer>
    </div>
  );
};

export default R8Calculator;