import React from 'react';
import { useLocation } from 'wouter';
import ClaimsDashboard from './dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ClaimsPage() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [_, navigate] = useLocation();

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      setActiveTab(value);
    } else {
      navigate(`/claims/${value}`);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Government Claims Management</h1>
          <p className="text-gray-600 mt-2">
            Manage apprentice and trainee government funding claims and eligibility tracking
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="dashboard"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">All Claims</TabsTrigger>
          <TabsTrigger value="new">New Claim</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ClaimsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
