import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, ShieldAlert, Users, ChevronRight, Building, Briefcase, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function PortalPage() {
  const [, setLocation] = useLocation();
  const [userRole, setUserRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminVerificationStep, setAdminVerificationStep] = useState(false);
  const { toast } = useToast();

  // This handles role-based routing with proper access control
  const handlePortalAccess = async (portal: string) => {
    // For admin portal, extra verification is required
    if (portal === 'admin' && !adminVerificationStep) {
      setAdminVerificationStep(true);
      return;
    }

    // If admin verification is shown and login is attempted
    if (adminVerificationStep) {
      // Validate form fields
      if (username && password && organization && userRole) {
        try {
          // Show loading toast
          toast({
            title: 'Verifying credentials',
            description: 'Please wait while we verify your access...',
          });
          
          // Call API to verify access
          const response = await fetch('/api/verify-access', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username,
              password,
              organization,
              role: userRole,
            }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Successful login
            if (data.user.role === 'developer' || data.user.platformAccess) {
              toast({
                title: 'Platform-Level Access Granted',
                description: `Logging in as Developer with full platform access`,
              });
            } else if (data.user.organization) {
              toast({
                title: 'Organization-Level Access Granted',
                description: `Logging in as ${data.user.role} for ${data.user.organization.name}`,
              });
            } else {
              toast({
                title: 'Access Granted',
                description: `Logging in as ${data.user.role}`,
              });
            }
            
            // Route to the appropriate portal
            setLocation('/admin');
          } else {
            // Failed login
            toast({
              variant: 'destructive',
              title: 'Access Denied',
              description: data.message || 'Invalid credentials or insufficient permissions.',
            });
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'An error occurred during authentication. Please try again.',
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Missing Information',
          description: 'Please enter all required fields.',
        });
      }
      return;
    }
    
    // Handle regular portal access for non-admin roles
    switch(portal) {
      case 'apprentice':
        toast({
          title: 'Redirecting to Apprentice Portal',
          description: 'Access to training records and timesheets.',
        });
        setLocation('/apprentices');
        break;
      case 'host':
        toast({
          title: 'Redirecting to Host Employer Portal',
          description: 'Access to placement management and timesheet approvals.',
        });
        setLocation('/hosts');
        break;
      case 'field-officer':
        toast({
          title: 'Redirecting to Field Officer Portal',
          description: 'Access to site visits and apprentice support.',
        });
        setLocation('/field-officers');
        break;
      default:
        setLocation('/admin');
    }
  };
  
  // Helper to reset the admin verification process
  const resetAdminVerification = () => {
    setAdminVerificationStep(false);
    setUsername('');
    setPassword('');
    setOrganization('');
    setUserRole('');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Portal Access
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Select the appropriate portal to access your dashboard
        </p>

        <Tabs defaultValue="main" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="main">Main Admin</TabsTrigger>
            <TabsTrigger value="apprentice">Apprentice</TabsTrigger>
            <TabsTrigger value="host">Host Employer</TabsTrigger>
            <TabsTrigger value="field">Field Officer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="main">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  CRM7 Admin Portal
                  {adminVerificationStep && <ShieldAlert className="ml-2 h-5 w-5 text-amber-500" />}
                </CardTitle>
                <CardDescription>
                  Access the main administrative system for managing all aspects of apprenticeships, host employers, and compliance.
                </CardDescription>
              </CardHeader>
              
              {adminVerificationStep ? (
                <>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mb-4">
                        <p className="text-sm text-amber-800">
                          <ShieldAlert className="inline mr-2 h-4 w-4" />
                          CRM system access requires organization and platform-level administrator credentials.
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-4">
                        <p className="text-sm text-blue-800 font-medium mb-1">
                          <Users className="inline mr-2 h-4 w-4" />
                          Access Level Information
                        </p>
                        <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                          <li>For <strong>Developer</strong> (platform-level) access: Use username <code className="bg-blue-100 px-1 rounded">dev</code> with organization <code className="bg-blue-100 px-1 rounded">Braden Group</code></li>
                          <li>For <strong>Admin</strong> (organization-level) access: Use username <code className="bg-blue-100 px-1 rounded">admin</code> with your organization</li>
                          <li>For testing purposes, you can use any password</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <select
                          id="organization"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                        >
                          <option value="select-org">Select organization</option>
                          <option value="Braden Group">Braden Group/Braden Pty Ltd</option>
                          <option value="ABC Training">ABC Training</option>
                          <option value="Vocational Skills Institute">Vocational Skills Institute</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Administrator Role</Label>
                        <select
                          id="role"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value)}
                        >
                          <option value="select-role">Select role</option>
                          <option value="developer">Developer (Platform Level)</option>
                          <option value="admin">Organization Administrator</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          placeholder="Enter username" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Enter password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={resetAdminVerification}>
                      Back
                    </Button>
                    <Button onClick={() => handlePortalAccess('admin')}>
                      Verify Access <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      This portal provides access to all system features including:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                      <li>Apprentice management</li>
                      <li>Host employer management</li>
                      <li>Training and compliance tracking</li>
                      <li>System administration</li>
                      <li>Financial management</li>
                    </ul>
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 mt-4">
                      <p className="text-sm text-blue-800">
                        <Shield className="inline mr-2 h-4 w-4" />
                        CRM access is restricted to authorized personnel only.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handlePortalAccess('admin')}>
                      Access Admin Portal
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="apprentice">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Apprentice Portal
                </CardTitle>
                <CardDescription>
                  Access your apprenticeship details, training progress, and scheduled activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  The apprentice portal allows you to:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                  <li>View your training plan</li>
                  <li>Submit timesheets</li>
                  <li>Track qualification progress</li>
                  <li>Access learning resources</li>
                  <li>Contact your field officer</li>
                </ul>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-md border border-gray-200 mt-4">
                  <div>
                    <p className="text-sm font-medium">Personal portal</p>
                    <p className="text-xs text-gray-500">Limited access to your own data</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePortalAccess('apprentice')}>
                  Access Apprentice Portal <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="host">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Host Employer Portal
                </CardTitle>
                <CardDescription>
                  Manage your apprentices, contracts, and workplace arrangements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  The host employer portal allows you to:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                  <li>View current apprentice placements</li>
                  <li>Manage workplace agreements</li>
                  <li>Approve timesheets</li>
                  <li>Request new apprentices</li>
                  <li>Access compliance resources</li>
                </ul>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-md border border-gray-200 mt-4">
                  <div>
                    <p className="text-sm font-medium">Employer portal</p>
                    <p className="text-xs text-gray-500">Limited to your organization's placements</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePortalAccess('host')}>
                  Access Host Portal <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="field">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Field Officer Portal
                </CardTitle>
                <CardDescription>
                  Manage site visits, apprentice check-ins, and compliance activities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  The field officer portal allows you to:
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                  <li>Schedule workplace visits</li>
                  <li>Record site assessments</li>
                  <li>Manage apprentice progress</li>
                  <li>Document compliance activities</li>
                  <li>Generate field reports</li>
                </ul>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-md border border-gray-200 mt-4">
                  <div>
                    <p className="text-sm font-medium">Field staff portal</p>
                    <p className="text-xs text-gray-500">Limited to your assigned apprentices and employers</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePortalAccess('field-officer')}>
                  Access Field Officer Portal <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
