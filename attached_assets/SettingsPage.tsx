import React, { useState, useEffect } from 'react';
import { 
  Settings, ChevronLeft, User, Bell, Moon, RefreshCw, DollarSign,
  Database, Shield, Save, Check, AlertCircle, Calendar, FileText, Award
} from 'lucide-react';
import LoginModal from './LoginModal';
import { supabase } from '../services/supabaseClient';
import { syncFairWorkData, isNearAnnualUpdate } from '../services/fairworkApi';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<string>('general');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [updateNotifications, setUpdateNotifications] = useState<boolean>(true);
  const [calculationNotifications, setCalculationNotifications] = useState<boolean>(true);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  
  // Check auth status and load user data
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Handle login success
  const handleLoginSuccess = () => {
    // Refresh user data
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Simulate saving (would normally update user settings in the database)
    setTimeout(() => {
      setIsSaving(false);
      // Show success feedback here
    }, 800);
  };
  
  // Handle Fair Work data sync
  const handleSyncFairWorkData = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Syncing award rates from Fair Work Australia...');
    
    try {
      // First check if user is authenticated
      if (!user) {
        setSyncStatus('error');
        setSyncMessage('You must be logged in to sync award data');
        return;
      }
      
      console.log("Starting Fair Work data sync process...");
      const result = await syncFairWorkData();
      console.log("Sync result:", result);
      
      if (result.success) {
        setSyncStatus('success');
        setSyncMessage(`Successfully synced award rates for ${result.yearsSynced.length} financial year(s)`);
      } else {
        setSyncStatus('error');
        setSyncMessage(`Error syncing award rates: ${result.error || 'Unknown error'}`);
        console.error("Sync error details:", result.error);
      }
    } catch (error) {
      console.error("Error during sync:", error);
      setSyncStatus('error');
      setSyncMessage(`Error syncing award rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Check if it's near the annual update period (May-July)
  const isNearUpdate = isNearAnnualUpdate();
  
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Settings
          </h2>
        </div>
        
        {!loading && (
          <div>
            {user ? (
              <button 
                onClick={handleSignOut} 
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="py-1.5 px-3 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <aside className="md:col-span-1 p-4 md:p-6">
          <nav>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveSection('general')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    activeSection === 'general' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-selected={activeSection === 'general'}
                >
                  <Settings className="w-4 h-4" />
                  <span>General</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('account')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    activeSection === 'account' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-selected={activeSection === 'account'}
                >
                  <User className="w-4 h-4" />
                  <span>Account</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('notifications')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    activeSection === 'notifications' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-selected={activeSection === 'notifications'}
                >
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('awards')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    activeSection === 'awards' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-selected={activeSection === 'awards'}
                >
                  <Award className="w-4 h-4" />
                  <span>Award Rates</span>
                  {isNearUpdate && (
                    <span className="ml-auto bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full">
                      Update Soon
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('data')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 ${
                    activeSection === 'data' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-selected={activeSection === 'data'}
                >
                  <Database className="w-4 h-4" />
                  <span>Data Management</span>
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 space-y-3">
              <div className="flex items-center justify-between">
                <span>Version</span>
                <span className="font-medium">2.3.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database</span>
                <span className={user ? "text-green-600" : "text-amber-600"}>
                  {user ? "Connected" : "Local Storage"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Award Rates</span>
                <span className="font-medium">FY {new Date().getFullYear()}/{String(new Date().getFullYear() + 1).substring(2)}</span>
              </div>
            </div>
          </div>
        </aside>
        
        <main className="md:col-span-3 p-4 md:p-6">
          {activeSection === 'general' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700">Dark Mode</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Enable dark mode for a more comfortable viewing experience in low-light conditions.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    Default Calculation Settings
                  </h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Modify default values used for new apprentice profiles.
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Edit Default Values
                  </button>
                </div>
              </div>
            </section>
          )}
          
          {activeSection === 'account' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Settings</h3>
              
              {!user ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-center">
                  <User className="w-10 h-10 mx-auto text-blue-500 mb-3" />
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Sign In Required</h4>
                  <p className="text-gray-600 mb-4">
                    Create an account to save your data to the cloud, sync wage rates,
                    and access your calculations across devices.
                  </p>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Sign In or Create Account
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium">{user.user_metadata?.full_name || 'User'}</h4>
                        <p className="text-gray-500">{user.email}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Profile Information</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input 
                          type="text" 
                          id="fullName" 
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          value={user.user_metadata?.full_name || ''}
                          onChange={() => {}} // Would update state in a real app
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                          type="email" 
                          id="email" 
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                          value={user.email}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Security</h4>
                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
          
          {activeSection === 'notifications' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Email Notifications</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={emailNotifications}
                        onChange={() => setEmailNotifications(!emailNotifications)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Receive email notifications about important updates and information.
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Award Rate Updates</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={updateNotifications}
                        onChange={() => setUpdateNotifications(!updateNotifications)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Get notified when Fair Work Australia updates apprentice pay rates (typically July 1st each year).
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">Calculation Alerts</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={calculationNotifications}
                        onChange={() => setCalculationNotifications(!calculationNotifications)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Receive notifications for significant changes in calculated charge rates.
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          )}
          
          {activeSection === 'awards' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Fair Work Award Rates
              </h3>
              
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-800">Annual Wage Review</h4>
                    <p className="text-sm text-gray-600">
                      Fair Work Australia updates apprentice wage rates every July 1st
                    </p>
                  </div>
                </div>
                
                {isNearUpdate ? (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                      <div>
                        <p className="font-medium">Wage Update Period</p>
                        <p className="mt-1">The annual wage update from Fair Work Australia is approaching or has recently occurred. Rates typically change on July 1st. Sync now to ensure you're using the latest rates.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0 text-green-600" />
                      <div>
                        <p className="font-medium">Current Rates Available</p>
                        <p className="mt-1">You're using the current financial year's award rates. The next scheduled update will be July 1st.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Sync Award Rates</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Sync the latest apprentice wage rates from Fair Work Australia's pay database.
                  This will update rates for all supported awards.
                </p>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleSyncFairWorkData}
                    className="flex items-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={syncStatus === 'syncing' || !user}
                  >
                    {syncStatus === 'syncing' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Sync Now</span>
                      </>
                    )}
                  </button>
                </div>
                
                {syncStatus === 'success' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 text-green-600" />
                    <span>{syncMessage}</span>
                  </div>
                )}
                
                {syncStatus === 'error' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="font-medium">{syncMessage}</p>
                      <p className="mt-2">
                        Please see the <a href="/docs/fairwork-api.md" className="underline" target="_blank" rel="noopener noreferrer">API documentation</a> for troubleshooting steps.
                      </p>
                    </div>
                  </div>
                )}
                
                {!user && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                    <p className="mb-2"><strong>Sign in required:</strong> You need to be signed in to sync award rates.</p>
                    <button 
                      onClick={() => setShowLoginModal(true)}
                      className="text-blue-700 hover:text-blue-900 font-medium"
                    >
                      Sign in or create an account
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Documentation</h4>
                <div className="rounded-md border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <h5 className="font-medium text-gray-700">Fair Work Australia Resources</h5>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2 ml-8 list-disc">
                    <li>
                      <a href="https://www.fairwork.gov.au/employment-conditions/awards" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Modern Awards Information
                      </a>
                    </li>
                    <li>
                      <a href="https://www.fairwork.gov.au/tools-and-resources/fact-sheets/minimum-workplace-entitlements/minimum-wages" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Minimum Wage Fact Sheet
                      </a>
                    </li>
                    <li>
                      <a href="https://www.fairwork.gov.au/employment-conditions/awards/minimum-wages-and-conditions" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Understanding Award Wages
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          )}
          
          {activeSection === 'data' && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h3>
              
              <div className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-600" />
                    Data Storage
                  </h4>
                  
                  {user ? (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Your data is currently stored in the cloud and synchronized across your devices.</p>
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="font-medium">Cloud Sync Enabled</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Your data is currently stored only on this device. Sign in to enable cloud sync.</p>
                      <button 
                        onClick={() => setShowLoginModal(true)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Enable Cloud Sync
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Import/Export</h4>
                  
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <ArrowDownTray className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-medium text-gray-800">Import Data</span>
                        <p className="text-xs text-gray-500">Load apprentice profiles from a file</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <ArrowUpTray className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="font-medium text-gray-800">Export Data</span>
                        <p className="text-xs text-gray-500">Save apprentice profiles to a file</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="p-4 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Permanently delete all your data and reset the application.
                  </p>
                  <button className="py-2 px-4 border border-red-300 text-red-700 rounded-md hover:bg-red-50">
                    Reset All Data
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

// Helper components for icons
function ArrowDownTray(props: React.SVGAttributes<SVGElement>) {
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
      <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5 5-5-5M12 12.8V2.5" />
    </svg>
  );
}

function ArrowUpTray(props: React.SVGAttributes<SVGElement>) {
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
      <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 3v12.2" />
    </svg>
  );
}

function Calculator(props: React.SVGAttributes<SVGElement>) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

function ChevronRight(props: React.SVGAttributes<SVGElement>) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default SettingsPage;