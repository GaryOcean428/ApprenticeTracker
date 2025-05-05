import React, { useState } from 'react';
import { Calculator, ChevronRight, Menu, X, ChevronDown, CheckCircle2, BarChart, Users, Grid, Settings } from 'lucide-react';
import R8Calculator from './components/R8Calculator';
import { ApprenticeProvider } from './context/ApprenticeContext';
import ApprenticeManager from './components/ApprenticeManager';
import ComparativeView from './components/ComparativeView';
import SettingsPage from './components/SettingsPage';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'calculator' | 'manage' | 'compare' | 'settings'>('calculator');
  
  const renderMainContent = () => {
    switch (activeView) {
      case 'calculator':
        return <R8Calculator />;
      case 'manage':
        return <ApprenticeManager />;
      case 'compare':
        return <ComparativeView />;
      case 'settings':
        return <SettingsPage onBack={() => setActiveView('calculator')} />;
      default:
        return <R8Calculator />;
    }
  };

  return (
    <ApprenticeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Mobile Navigation Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <Calculator className="text-blue-600 w-6 h-6" />
            <h1 className="text-xl font-bold text-gray-800">R8 Calculator</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Sidebar/Mobile Menu Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}

        <div className="flex h-[calc(100vh-64px)] lg:h-screen">
          {/* Sliding Sidebar */}
          <div 
            className={`fixed lg:relative top-0 left-0 z-40 h-full bg-white shadow-lg transition-all duration-300 ease-in-out transform 
              ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-0 lg:w-72'}`}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="hidden lg:flex items-center gap-3 mb-8">
                <Calculator className="text-blue-600 w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">R8 Calculator</h1>
                  <p className="text-sm text-gray-500">Multi-Apprentice Rate Calculator</p>
                </div>
              </div>

              <nav className="flex-grow mt-6 overflow-y-auto">
                <div className="space-y-1">
                  {/* Main Navigation */}
                  <button 
                    onClick={() => setActiveView('calculator')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeView === 'calculator' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    aria-label="Go to Charge Rate Calculator"
                  >
                    <Calculator className="w-5 h-5 mr-3" />
                    Charge Rate Calculator
                  </button>
                  
                  <button 
                    onClick={() => setActiveView('manage')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeView === 'manage' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    aria-label="Go to Manage Apprentices"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    Manage Apprentices
                  </button>
                  
                  <button 
                    onClick={() => setActiveView('compare')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      activeView === 'compare' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    aria-label="Go to Compare Results"
                  >
                    <BarChart className="w-5 h-5 mr-3" />
                    Compare Results
                  </button>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Templates
                    </h3>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 rounded-lg text-left text-sm transition-colors hover:bg-gray-100 text-gray-700"
                      aria-label="Construction Industry template"
                    >
                      <Grid className="w-4 h-4 mr-3 text-gray-500" />
                      Construction Industry
                    </button>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 rounded-lg text-left text-sm transition-colors hover:bg-gray-100 text-gray-700"
                      aria-label="Electrical Trade template"
                    >
                      <Grid className="w-4 h-4 mr-3 text-gray-500" />
                      Electrical Trade
                    </button>
                    
                    <button 
                      className="flex items-center w-full px-4 py-2 rounded-lg text-left text-sm transition-colors hover:bg-gray-100 text-gray-700"
                      aria-label="Plumbing template"
                    >
                      <Grid className="w-4 h-4 mr-3 text-gray-500" />
                      Plumbing
                    </button>
                  </div>
                </div>
              </nav>

              <div className="mt-auto">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Need Help?</p>
                  <p className="text-xs text-gray-500 mt-1">Contact our support team for assistance with your calculations.</p>
                  <button 
                    className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
                    aria-label="Contact support"
                  >
                    support@r8calculator.com
                  </button>
                </div>
                
                <button 
                  onClick={() => setActiveView('settings')}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  aria-label="Go to Settings"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto px-4 py-8">
              <header className="mb-8 lg:mb-12 text-center">
                {activeView !== 'settings' && (
                  <div>
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <div>
                        <h1 className="text-4xl font-bold text-gray-800">R8 Calculator</h1>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-1">
                          <span>Professional</span>
                          <ChevronRight className="w-3 h-3" />
                          <span>Multi-Apprentice</span>
                          <ChevronRight className="w-3 h-3" />
                          <span>Fully Customizable</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Calculate and compare precise charge rates for multiple apprentices simultaneously. 
                      Factor in pay rates, industry on-costs, and working patterns to determine 
                      accurate billing rates across different apprenticeship years.
                    </p>
                  </div>
                )}
              </header>
              
              {renderMainContent()}
              
              <footer className="mt-12 text-center">
                <div className="max-w-2xl mx-auto border-t border-gray-200 pt-8">
                  <p className="text-gray-500 text-sm">
                    © 2025 R8 Calculator - Professional charge rate calculations based on Australian industry standards
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    All calculations are estimates. Please consult with your financial advisor for specific advice.
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </ApprenticeProvider>
  );
}

export default App;