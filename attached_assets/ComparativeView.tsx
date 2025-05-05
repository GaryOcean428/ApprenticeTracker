import React from 'react';
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Briefcase, 
  User, 
  Download, 
  Award
} from 'lucide-react';
import { ApprenticeProfile } from '../types';
import { useApprentices } from '../context/ApprenticeContext';
import { formatCurrency, formatHours, formatPercent } from '../utils/calculationUtils';

const ComparativeView: React.FC = () => {
  const { apprentices } = useApprentices();
  
  // Filter out apprentices without results
  const apprenticesWithResults = apprentices.filter(a => a.result);
  
  if (apprenticesWithResults.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <BarChartIcon className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-1">No Results to Compare</h3>
        <p className="text-gray-500 mb-4">Calculate at least one apprentice charge rate to see comparisons</p>
      </div>
    );
  }
  
  const getMaxValue = (key: 'baseWage' | 'totalCost' | 'chargeRate'): number => {
    return Math.max(...apprenticesWithResults.map(a => a.result?.[key] || 0));
  };
  
  const maxChargeRate = getMaxValue('chargeRate');
  const maxTotalCost = getMaxValue('totalCost');
  const maxBaseWage = getMaxValue('baseWage');
  
  // Get year badge color
  const getYearColor = (year: 1 | 2 | 3 | 4) => {
    switch (year) {
      case 1: return 'bg-blue-600';
      case 2: return 'bg-green-600';
      case 3: return 'bg-purple-600';
      case 4: return 'bg-amber-600';
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <BarChartIcon className="w-4 h-4 text-blue-600" />
          Comparative Analysis
        </h3>
        <button 
          className="py-1 px-3 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1"
          aria-label="Export comparison data"
        >
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>
      
      <div className="p-4">
        {/* Charge Rate Comparison */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Charge Rate Comparison
          </h4>
          
          <div className="space-y-4">
            {apprenticesWithResults.map(apprentice => (
              <div key={apprentice.id}>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getYearColor(apprentice.year)}`}>
                    {apprentice.year}
                  </div>
                  <div className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    {apprentice.name}
                    {apprentice.awardId && (
                      <Award className="w-3 h-3 text-amber-600" title="Using Fair Work award rate" />
                    )}
                  </div>
                  <div className="ml-auto text-sm font-bold">{formatCurrency(apprentice.result?.chargeRate || 0)}/hr</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getYearColor(apprentice.year)}`} 
                    style={{ width: `${((apprentice.result?.chargeRate || 0) / maxChargeRate) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={(apprentice.result?.chargeRate || 0)}
                    aria-valuemin={0}
                    aria-valuemax={maxChargeRate}
                    aria-label={`${apprentice.name} charge rate: ${formatCurrency(apprentice.result?.chargeRate || 0)} per hour`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cost Breakdown Comparison */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Cost Breakdown
          </h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label="Apprentice cost breakdown comparison">
              <thead>
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apprentice</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Pay</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total On-costs</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Hour</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {apprenticesWithResults.map(apprentice => {
                  const totalOnCosts = apprentice.result ? 
                    Object.values(apprentice.result.oncosts).reduce((sum, cost) => sum + cost, 0) : 0;
                  
                  return (
                    <tr key={apprentice.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${getYearColor(apprentice.year)}`}>
                            {apprentice.year}
                          </div>
                          <span className="font-medium text-gray-700">{apprentice.name}</span>
                          {apprentice.awardId && (
                            <Award className="w-3 h-3 text-amber-600" title="Using Fair Work award rate" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{formatCurrency(apprentice.result?.payRate || 0)}/hr</td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{formatCurrency(totalOnCosts)}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{formatCurrency(apprentice.result?.costPerHour || 0)}/hr</td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{formatPercent(apprentice.costConfig.defaultMargin)}</td>
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{formatCurrency(apprentice.result?.chargeRate || 0)}/hr</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Hours and Utilization */}
        <div>
          <h4 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Hours and Utilization
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apprenticesWithResults.map(apprentice => {
              const billablePercent = apprentice.result ? 
                (apprentice.result.billableHours / apprentice.result.totalHours) * 100 : 0;
              
              return (
                <div key={apprentice.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${getYearColor(apprentice.year)}`}>
                      {apprentice.year}
                    </div>
                    <h5 className="font-medium text-gray-800">{apprentice.name}</h5>
                    {apprentice.awardId && (
                      <Award className="w-4 h-4 text-amber-600" title="Using Fair Work award rate" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Hours</div>
                      <div className="text-lg font-semibold text-gray-700">{formatHours(apprentice.result?.totalHours || 0)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Billable Hours</div>
                      <div className="text-lg font-semibold text-gray-700">{formatHours(apprentice.result?.billableHours || 0)}</div>
                    </div>
                  </div>
                  
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>Utilization Rate</span>
                    <span>{billablePercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getYearColor(apprentice.year)}`} 
                      style={{ width: `${billablePercent}%` }}
                      role="progressbar"
                      aria-valuenow={billablePercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${apprentice.name} utilization rate: ${billablePercent.toFixed(1)}%`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparativeView;