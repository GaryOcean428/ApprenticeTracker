import React, { useState, useEffect } from 'react';
import { Award, Calendar, X, ExternalLink, AlertCircle, Check } from 'lucide-react';
import { hasFinancialYearChanged } from '../services/awardTemplateService';
import { isNearAnnualUpdate, getCurrentFinancialYear } from '../services/fairworkApi';

interface FairWorkUpdateNotificationProps {
  onUpdateClick?: () => void;
  onDismiss?: () => void;
}

const FairWorkUpdateNotification: React.FC<FairWorkUpdateNotificationProps> = ({
  onUpdateClick,
  onDismiss
}) => {
  const [show, setShow] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<'pending' | 'updated' | 'none'>('none');
  
  // Check if we should show the notification
  useEffect(() => {
    const checkUpdateStatus = () => {
      // If we're near the annual update period (May-July)
      if (isNearAnnualUpdate()) {
        // Check if we're in July which means new rates are in effect
        const now = new Date();
        const isJuly = now.getMonth() === 6; // July is month 6 (0-indexed)
        
        if (isJuly) {
          // Check if we've recently changed financial years
          if (hasFinancialYearChanged()) {
            setUpdateStatus('pending');
            setShow(true);
          } else {
            // Already in new FY and likely updated
            setUpdateStatus('updated');
            setShow(true);
          }
        } else {
          // May-June: rates will change soon
          setUpdateStatus('pending');
          setShow(true);
        }
      }
    };
    
    checkUpdateStatus();
    
    // Check for notifications preference in localStorage
    const hideNotification = localStorage.getItem('hideAwardUpdateNotification');
    if (hideNotification === 'true') {
      setShow(false);
    }
  }, []);
  
  const handleDismiss = () => {
    setShow(false);
    // Remember the dismissal
    localStorage.setItem('hideAwardUpdateNotification', 'true');
    if (onDismiss) onDismiss();
  };
  
  // Don't render if we shouldn't show
  if (!show) return null;
  
  const currentFY = getCurrentFinancialYear();
  
  return (
    <div className={`rounded-lg border p-4 mb-6 ${
      updateStatus === 'pending' 
        ? 'bg-amber-50 border-amber-200 text-amber-800' 
        : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {updateStatus === 'pending' ? (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          ) : (
            <Check className="w-5 h-5 text-green-600" />
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-medium flex items-center gap-2">
                <Award className="w-4 h-4" />
                {updateStatus === 'pending' 
                  ? `FY${currentFY}/${(currentFY+1).toString().slice(2)} Award Rates Update` 
                  : `FY${currentFY}/${(currentFY+1).toString().slice(2)} Award Rates Available`}
              </h3>
              <p className="mt-1 text-sm">
                {updateStatus === 'pending' 
                  ? `Fair Work Australia updates apprentice wages on July 1st. Check for new rates to ensure accurate calculations.` 
                  : `The latest Fair Work award rates for FY${currentFY}/${(currentFY+1).toString().slice(2)} are now available.`}
              </p>
            </div>
            
            <button 
              onClick={handleDismiss}
              className={`p-1 rounded-full ${updateStatus === 'pending' ? 'text-amber-600 hover:bg-amber-100' : 'text-green-600 hover:bg-green-100'}`}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {updateStatus === 'pending' && (
              <button
                onClick={onUpdateClick}
                className="flex items-center gap-1 py-1.5 px-3 rounded-md bg-amber-200 text-amber-900 text-sm font-medium hover:bg-amber-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Update Award Rates
              </button>
            )}
            
            <a 
              href="https://www.fairwork.gov.au/pay/minimum-wages" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`flex items-center gap-1 py-1.5 px-3 rounded-md text-sm font-medium ${
                updateStatus === 'pending' 
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Fair Work Site
            </a>
            
            <div className={`flex items-center gap-1 py-1.5 px-3 rounded-md text-sm ${
              updateStatus === 'pending' 
                ? 'bg-amber-100 text-amber-800'
                : 'bg-green-100 text-green-800'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              Effective July 1, {currentFY + 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for RefreshCw icon
function RefreshCw(props: React.SVGAttributes<SVGElement>) {
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
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export default FairWorkUpdateNotification;