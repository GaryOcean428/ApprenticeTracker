import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PortalPage() {
  const [, setLocation] = useLocation();

  // This simulates routing to the different portal views
  const handlePortalAccess = (portal: string) => {
    switch(portal) {
      case 'apprentice':
        setLocation('/apprentices');
        break;
      case 'host':
        setLocation('/hosts');
        break;
      case 'admin':
        setLocation('/admin');
        break;
      case 'field-officer':
        setLocation('/field-officers');
        break;
      default:
        setLocation('/admin');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Braden Group Portal Access
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
                <CardTitle>CRM7 Admin Portal</CardTitle>
                <CardDescription>
                  Access the main administrative system for managing all aspects of apprenticeships, host employers, and compliance.
                </CardDescription>
              </CardHeader>
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
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePortalAccess('admin')}>
                  Access Admin Portal
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="apprentice">
            <Card>
              <CardHeader>
                <CardTitle>Apprentice Portal</CardTitle>
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
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePortalAccess('apprentice')}>
                  Access Apprentice Portal
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="host">
            <Card>
              <CardHeader>
                <CardTitle>Host Employer Portal</CardTitle>
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
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePortalAccess('host')}>
                  Access Host Portal
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="field">
            <Card>
              <CardHeader>
                <CardTitle>Field Officer Portal</CardTitle>
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
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handlePortalAccess('field-officer')}>
                  Access Field Officer Portal
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
