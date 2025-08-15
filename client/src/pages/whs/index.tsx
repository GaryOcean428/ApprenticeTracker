import React from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import WHSDashboard from '@/components/whs/whs-dashboard';

export default function WHSPage() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [_, navigate] = useLocation();

  const handleTabChange = (value: string) => {
    if (value === 'overview') {
      setActiveTab(value);
    } else {
      navigate(`/whs/${value}`);
    }
  };

  const handleCreateNew = () => {
    // Show create new menu or navigate to incident creation
    navigate('/whs/incidents');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Work Health & Safety</h1>
        <div className="flex gap-2">
          <Button onClick={handleCreateNew}>Create New</Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="incidents">Incidents & Hazards</TabsTrigger>
          <TabsTrigger value="risk-assessments">Risk Assessments</TabsTrigger>
          <TabsTrigger value="inspections">Site Inspections</TabsTrigger>
          <TabsTrigger value="policies">Safety Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WHSDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
