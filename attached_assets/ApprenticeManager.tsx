import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Copy, BarChart, Settings, User, DollarSign,
  UserPlus, Calendar, ChevronRight, Award, X
} from 'lucide-react';
import { 
  ApprenticeProfile,
  ApprenticeYear 
} from '../types';
import { useApprentices } from '../context/ApprenticeContext';
import { formatCurrency, formatHours } from '../utils/calculationUtils';
import AwardRateSelector from './AwardRateSelector';

const ApprenticeManager: React.FC = () => {
  const { 
    apprentices, 
    activeApprenticeId, 
    setActiveApprenticeId,
    addApprentice,
    updateApprentice,
    deleteApprentice,
    duplicateApprentice,
    calculateResults
  } = useApprentices();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [newApprenticeName, setNewApprenticeName] = useState('');
  const [newApprenticeYear, setNewApprenticeYear] = useState<ApprenticeYear>(1);
  const [newApprenticeRate, setNewApprenticeRate] = useState(20.50);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isAdult, setIsAdult] = useState(false);
  const [hasCompletedYear12, setHasCompletedYear12] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string | undefined>(undefined);
  
  const handleAddApprentice = () => {
    if (newApprenticeName.trim()) {
      addApprentice(newApprenticeName, newApprenticeYear, newApprenticeRate);
      setShowAddModal(false);
      setNewApprenticeName('');
      setNewApprenticeYear(1);
      setNewApprenticeRate(20.50);
      setIsAdult(false);
      setHasCompletedYear12(false);
      setSelectedSector(undefined);
    }
  };
  
  const handleConfirmDelete = (id: string) => {
    deleteApprentice(id);
    setConfirmDelete(null);
  };
  
  const handleCalculateAll = () => {
    calculateResults();
  };
  
  const activeApprentice = apprentices.find(a => a.id === activeApprenticeId);
  
  const handleRateSelected = (rate: number) => {
    if (activeApprenticeId) {
      updateApprentice(activeApprenticeId, { basePayRate: rate });
      setShowRateModal(false);
    }
  };

  const handleViewDetails = (e: React.MouseEvent, apprentice: ApprenticeProfile) => {
    e.stopPropagation();
    setActiveApprenticeId(apprentice.id);
    setShowDetailsModal(true);
  };
  
  const getYearBadgeColor = (year: ApprenticeYear) => {
    switch(year) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-green-100 text-green-800';
      case 3: return 'bg-purple-100 text-purple-800';
      case 4: return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Apprentice Profiles
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={handleCalculateAll}
            className="py-1 px-3 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
            aria-label="Calculate all apprentice rates"
          >
            <BarChart className="w-3 h-3" />
            Calculate All
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="py-1 px-3 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
            aria-label="Add new apprentice profile"
          >
            <Plus className="w-3 h-3" />
            Add New
          </button>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {apprentices.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Apprentices Added</h3>
            <p className="text-gray-500 mb-4">Add your first apprentice to start calculating charge rates</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              aria-label="Add your first apprentice"
            >
              <Plus className="w-4 h-4" />
              Add Apprentice
            </button>
          </div>
        ) : (
          apprentices.map((apprentice) => (
            <div 
              key={apprentice.id} 
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                activeApprenticeId === apprentice.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setActiveApprenticeId(apprentice.id)}
              aria-label={`Apprentice profile: ${apprentice.name}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveApprenticeId(apprentice.id);
                  e.preventDefault();
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 rounded-full w-8 h-8 flex items-center justify-center ${getYearBadgeColor(apprentice.year)}`} aria-label={`Year ${apprentice.year}`}>
                    {apprentice.year}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      {apprentice.name}
                      {apprentice.customSettings && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">Custom</span>
                      )}
                      {apprentice.awardId && (
                        <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Award
                        </span>
                      )}
                    </h4>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(apprentice.basePayRate)}/hr
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatHours(apprentice.workConfig.hoursPerDay)} hrs/day
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {apprentice.result && (
                    <div className="px-3 py-1 rounded-md bg-green-50 border border-green-100 text-green-700 mr-2 font-medium">
                      {formatCurrency(apprentice.result.chargeRate)}/hr
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateApprentice(apprentice.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Duplicate"
                    aria-label={`Duplicate ${apprentice.name}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  
                  {confirmDelete === apprentice.id ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDelete(apprentice.id);
                      }}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Confirm Delete"
                      aria-label={`Confirm delete ${apprentice.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(apprentice.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Delete"
                      aria-label={`Delete ${apprentice.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {activeApprenticeId === apprentice.id && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Updated {new Date(apprentice.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRateModal(true);
                      }}
                      className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded flex items-center gap-1"
                      aria-label="Update pay rate from award"
                    >
                      <Award className="w-3 h-3" />
                      Update Pay Rate
                    </button>
                    <button 
                      onClick={(e) => handleViewDetails(e, apprentice)}
                      className="text-xs text-blue-600 flex items-center gap-1"
                      aria-label="View details"
                    >
                      View Details
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Add Apprentice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="add-apprentice-title">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 m-4">
            <h3 id="add-apprentice-title" className="text-xl font-bold text-gray-800 mb-4">Add New Apprentice</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="apprentice-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Apprentice Name
                </label>
                <input
                  id="apprentice-name"
                  type="text"
                  value={newApprenticeName}
                  onChange={(e) => setNewApprenticeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., John Smith"
                  aria-required="true"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apprentice Type
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    className={`py-2 rounded-md flex items-center justify-center ${
                      !isAdult
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setIsAdult(false)}
                    aria-pressed={!isAdult}
                  >
                    Junior Apprentice
                  </button>
                  <button
                    type="button"
                    className={`py-2 rounded-md flex items-center justify-center ${
                      isAdult
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setIsAdult(true)}
                    aria-pressed={isAdult}
                  >
                    Adult Apprentice
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    className={`py-2 rounded-md flex items-center justify-center ${
                      !hasCompletedYear12
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setHasCompletedYear12(false)}
                    aria-pressed={!hasCompletedYear12}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    className={`py-2 rounded-md flex items-center justify-center ${
                      hasCompletedYear12
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setHasCompletedYear12(true)}
                    aria-pressed={hasCompletedYear12}
                  >
                    Year 12 Completed
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry Sector
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    className={`py-2 rounded-md flex items-center justify-center ${
                      selectedSector === 'residential'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedSector('residential')}
                    aria-pressed={selectedSector === 'residential'}
                  >
                    Residential
                  </button>
                  <button
                    type="button"
                    className={`py-2 rounded-md flex items-center justify-center ${
                      selectedSector === 'commercial'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedSector('commercial')}
                    aria-pressed={selectedSector === 'commercial'}
                  >
                    Commercial
                  </button>
                  <button
                    type="button"
                    className={`py-2 rounded-md flex items-center justify-center ${
                      selectedSector === 'civil'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedSector('civil')}
                    aria-pressed={selectedSector === 'civil'}
                  >
                    Civil
                  </button>
                </div>
              </div>
              
              <div role="radiogroup" aria-labelledby="year-level-label">
                <label id="year-level-label" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={`py-2 rounded-md flex items-center justify-center ${
                        newApprenticeYear === year
                          ? getYearBadgeColor(year as ApprenticeYear)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setNewApprenticeYear(year as ApprenticeYear)}
                      aria-checked={newApprenticeYear === year}
                      role="radio"
                      aria-label={`Year ${year}`}
                    >
                      Year {year}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="base-hourly-rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Base Hourly Rate
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    id="base-hourly-rate"
                    type="number"
                    value={newApprenticeRate}
                    onChange={(e) => setNewApprenticeRate(parseFloat(e.target.value))}
                    step="0.01"
                    min="0"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Base hourly rate in dollars"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddApprentice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={!newApprenticeName.trim()}
                aria-disabled={!newApprenticeName.trim()}
              >
                Add Apprentice
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Award Rate Selection Modal */}
      {showRateModal && activeApprentice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="update-rate-title">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 id="update-rate-title" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Update Pay Rate
              </h3>
              <div className={`px-2 py-1 rounded-full ${getYearBadgeColor(activeApprentice.year)}`}>
                Year {activeApprentice.year}
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Select an award to automatically update the pay rate for <strong>{activeApprentice.name}</strong> based on official Fair Work Commission rates.
              </p>
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                Pay rates are pulled directly from the Fair Work Commission's Modern Awards Pay Database.
              </div>
            </div>
            
            <AwardRateSelector 
              onRateSelected={handleRateSelected}
              apprenticeYear={activeApprentice.year}
              currentRate={activeApprentice.basePayRate}
              isAdult={isAdult}
              hasCompletedYear12={hasCompletedYear12}
              sector={selectedSector}
            />
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Apprentice Details Modal */}
      {showDetailsModal && activeApprentice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="apprentice-details-title">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 id="apprentice-details-title" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Apprentice Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center ${getYearBadgeColor(activeApprentice.year)}`}>
                      {activeApprentice.year}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{activeApprentice.name}</h4>
                      <div className="text-sm text-gray-600">Year {activeApprentice.year} Apprentice</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Base Pay Rate:</span>
                      <span className="font-medium">{formatCurrency(activeApprentice.basePayRate)}/hr</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hours Per Day:</span>
                      <span className="font-medium">{formatHours(activeApprentice.workConfig.hoursPerDay)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days Per Week:</span>
                      <span className="font-medium">{activeApprentice.workConfig.daysPerWeek}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Weeks Per Year:</span>
                      <span className="font-medium">{activeApprentice.workConfig.weeksPerYear}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Training Weeks:</span>
                      <span className="font-medium">{activeApprentice.workConfig.trainingWeeks}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Profit Margin:</span>
                      <span className="font-medium">{(activeApprentice.costConfig.defaultMargin * 100).toFixed(1)}%</span>
                    </div>
                    
                    {activeApprentice.result && (
                      <div className="flex justify-between pt-2 border-t border-blue-200">
                        <span className="text-sm font-medium text-blue-700">Charge Rate:</span>
                        <span className="font-bold text-blue-700">{formatCurrency(activeApprentice.result.chargeRate)}/hr</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <button 
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowRateModal(true);
                      }}
                      className="flex-1 py-2 px-3 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 flex items-center justify-center gap-1"
                    >
                      <Award className="w-4 h-4" />
                      Update Pay Rate
                    </button>
                    <button 
                      onClick={() => {
                        calculateResults(activeApprentice.id);
                      }}
                      className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-1"
                    >
                      <BarChart className="w-4 h-4" />
                      Calculate
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-blue-600" />
                    Cost Settings
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Statutory Costs</h5>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Superannuation:</span>
                          <span>{(activeApprentice.costConfig.superRate * 100).toFixed(1)}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Workers' Comp:</span>
                          <span>{(activeApprentice.costConfig.wcRate * 100).toFixed(1)}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Payroll Tax:</span>
                          <span>{(activeApprentice.costConfig.payrollTaxRate * 100).toFixed(1)}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Leave Loading:</span>
                          <span>{(activeApprentice.costConfig.leaveLoading * 100).toFixed(1)}%</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Costs</h5>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Study Cost:</span>
                          <span>{formatCurrency(activeApprentice.costConfig.studyCost)}/yr</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">PPE Cost:</span>
                          <span>{formatCurrency(activeApprentice.costConfig.ppeCost)}/yr</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Admin Rate:</span>
                          <span>{(activeApprentice.costConfig.adminRate * 100).toFixed(1)}%</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Adverse Weather:</span>
                          <span>{activeApprentice.costConfig.adverseWeatherDays} days/yr</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {activeApprentice.result && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-blue-600" />
                      Calculation Results
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Total Hours</div>
                        <div className="text-lg font-semibold">{formatHours(activeApprentice.result.totalHours)}</div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Billable Hours</div>
                        <div className="text-lg font-semibold">{formatHours(activeApprentice.result.billableHours)}</div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Base Annual Wage</div>
                        <div className="text-lg font-semibold">{formatCurrency(activeApprentice.result.baseWage)}</div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Total On-costs</div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(Object.values(activeApprentice.result.oncosts).reduce((sum, cost) => sum + cost, 0))}
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1">Cost Per Hour</div>
                        <div className="text-lg font-semibold">{formatCurrency(activeApprentice.result.costPerHour)}</div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <div className="text-xs text-blue-600 mb-1">Final Charge Rate</div>
                        <div className="text-lg font-bold text-blue-700">{formatCurrency(activeApprentice.result.chargeRate)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Billable Options</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${activeApprentice.billableOptions.includeAnnualLeave ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-gray-600">Include Annual Leave</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${activeApprentice.billableOptions.includePublicHolidays ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-gray-600">Include Public Holidays</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${activeApprentice.billableOptions.includeSickLeave ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-gray-600">Include Sick Leave</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${activeApprentice.billableOptions.includeTrainingTime ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-gray-600">Include Training Time</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprenticeManager;