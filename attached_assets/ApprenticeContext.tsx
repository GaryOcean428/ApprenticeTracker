import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  ApprenticeProfile, 
  ApprenticeYear, 
  CostConfig, 
  WorkConfig, 
  BillableOptions 
} from '../types';
import { 
  generateDefaultApprenticeProfiles, 
  calculateChargeRate, 
  initialCostConfig, 
  initialWorkConfig, 
  initialBillableOptions 
} from '../utils/calculationUtils';

interface ApprenticeContextType {
  apprentices: ApprenticeProfile[];
  activeApprenticeId: string | null;
  setActiveApprenticeId: (id: string | null) => void;
  addApprentice: (name: string, year: ApprenticeYear, payRate: number) => void;
  updateApprentice: (id: string, data: Partial<ApprenticeProfile>) => void;
  deleteApprentice: (id: string) => void;
  calculateResults: (id?: string) => void;
  duplicateApprentice: (id: string) => void;
  resetToDefaults: () => void;
  updateCostConfig: (id: string, updates: Partial<CostConfig>) => void;
  updateWorkConfig: (id: string, updates: Partial<WorkConfig>) => void;
  updateBillableOptions: (id: string, updates: Partial<BillableOptions>) => void;
}

const ApprenticeContext = createContext<ApprenticeContextType | undefined>(undefined);

export const ApprenticeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [apprentices, setApprentices] = useState<ApprenticeProfile[]>([]);
  const [activeApprenticeId, setActiveApprenticeId] = useState<string | null>(null);

  // Initialize with default apprentices
  useEffect(() => {
    const storedApprentices = localStorage.getItem('apprentices');
    if (storedApprentices) {
      const parsed = JSON.parse(storedApprentices);
      setApprentices(parsed);
      // Set the first apprentice as active if one exists
      if (parsed.length > 0) {
        setActiveApprenticeId(parsed[0].id);
      }
    } else {
      const defaultProfiles = generateDefaultApprenticeProfiles();
      setApprentices(defaultProfiles);
      if (defaultProfiles.length > 0) {
        setActiveApprenticeId(defaultProfiles[0].id);
      }
    }
  }, []);

  // Save apprentices to localStorage when they change
  useEffect(() => {
    if (apprentices.length > 0) {
      localStorage.setItem('apprentices', JSON.stringify(apprentices));
    }
  }, [apprentices]);

  const addApprentice = (name: string, year: ApprenticeYear, payRate: number) => {
    const newApprentice: ApprenticeProfile = {
      id: uuidv4(),
      name,
      year,
      basePayRate: payRate,
      customSettings: false,
      costConfig: { ...initialCostConfig },
      workConfig: { ...initialWorkConfig },
      billableOptions: { ...initialBillableOptions },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Calculate the result immediately
    const result = calculateChargeRate(
      payRate,
      newApprentice.workConfig,
      newApprentice.costConfig,
      newApprentice.billableOptions
    );
    
    newApprentice.result = result;
    
    setApprentices(prev => [...prev, newApprentice]);
    setActiveApprenticeId(newApprentice.id);
  };

  const updateApprentice = (id: string, data: Partial<ApprenticeProfile>) => {
    setApprentices(prev => 
      prev.map(apprentice => {
        if (apprentice.id === id) {
          // Create updated apprentice with new data
          const updatedApprentice = { 
            ...apprentice, 
            ...data, 
            updatedAt: new Date() 
          };
          
          // If the basePayRate was updated, recalculate the result
          if ('basePayRate' in data) {
            const result = calculateChargeRate(
              updatedApprentice.basePayRate,
              updatedApprentice.workConfig,
              updatedApprentice.costConfig,
              updatedApprentice.billableOptions
            );
            
            updatedApprentice.result = result;
          }
          
          return updatedApprentice;
        }
        return apprentice;
      })
    );
  };

  const deleteApprentice = (id: string) => {
    setApprentices(prev => prev.filter(apprentice => apprentice.id !== id));
    
    // If the deleted apprentice was active, set a new active apprentice
    if (activeApprenticeId === id) {
      const remaining = apprentices.filter(a => a.id !== id);
      if (remaining.length > 0) {
        setActiveApprenticeId(remaining[0].id);
      } else {
        setActiveApprenticeId(null);
      }
    }
  };

  const calculateResults = (id?: string) => {
    setApprentices(prev => 
      prev.map(apprentice => {
        // Skip if id is provided and doesn't match
        if (id && apprentice.id !== id) return apprentice;

        const result = calculateChargeRate(
          apprentice.basePayRate,
          apprentice.workConfig,
          apprentice.costConfig,
          apprentice.billableOptions
        );
        
        return {
          ...apprentice,
          result,
          updatedAt: new Date()
        };
      })
    );
  };

  const duplicateApprentice = (id: string) => {
    const apprenticeToDuplicate = apprentices.find(a => a.id === id);
    if (!apprenticeToDuplicate) return;

    const duplicate: ApprenticeProfile = {
      ...apprenticeToDuplicate,
      id: uuidv4(),
      name: `${apprenticeToDuplicate.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setApprentices(prev => [...prev, duplicate]);
    setActiveApprenticeId(duplicate.id);
  };

  const resetToDefaults = () => {
    const defaultProfiles = generateDefaultApprenticeProfiles();
    setApprentices(defaultProfiles);
    if (defaultProfiles.length > 0) {
      setActiveApprenticeId(defaultProfiles[0].id);
    }
  };

  const updateCostConfig = (id: string, updates: Partial<CostConfig>) => {
    setApprentices(prev => 
      prev.map(apprentice => 
        apprentice.id === id 
          ? { 
              ...apprentice, 
              costConfig: { ...apprentice.costConfig, ...updates },
              customSettings: true,
              updatedAt: new Date() 
            } 
          : apprentice
      )
    );
  };

  const updateWorkConfig = (id: string, updates: Partial<WorkConfig>) => {
    setApprentices(prev => 
      prev.map(apprentice => 
        apprentice.id === id 
          ? { 
              ...apprentice, 
              workConfig: { ...apprentice.workConfig, ...updates },
              customSettings: true,
              updatedAt: new Date() 
            } 
          : apprentice
      )
    );
  };

  const updateBillableOptions = (id: string, updates: Partial<BillableOptions>) => {
    setApprentices(prev => 
      prev.map(apprentice => 
        apprentice.id === id 
          ? { 
              ...apprentice, 
              billableOptions: { ...apprentice.billableOptions, ...updates },
              customSettings: true,
              updatedAt: new Date() 
            } 
          : apprentice
      )
    );
  };

  return (
    <ApprenticeContext.Provider
      value={{
        apprentices,
        activeApprenticeId,
        setActiveApprenticeId,
        addApprentice,
        updateApprentice,
        deleteApprentice,
        calculateResults,
        duplicateApprentice,
        resetToDefaults,
        updateCostConfig,
        updateWorkConfig,
        updateBillableOptions
      }}
    >
      {children}
    </ApprenticeContext.Provider>
  );
};

export const useApprentices = () => {
  const context = useContext(ApprenticeContext);
  if (context === undefined) {
    throw new Error('useApprentices must be used within an ApprenticeProvider');
  }
  return context;
};