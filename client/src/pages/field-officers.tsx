import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { PageLayout } from '@/components/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FilterBar, FilterGroup } from '@/components/filter-bar';
import { DataGrid } from '@/components/ui/data-grid';
import { formatDate } from '@/lib/date-utils';
import { Calendar, Clock, FileEdit, Trash2, Users } from 'lucide-react';

/**
 * Types for Field Officer Activities
 */
export interface FieldVisit {
  id: string;
  date: string;
  time: string;
  officerName: string;
  hostName: string;
  visitType: string;
}

/**
 * Field Officer Activities Main Page
 */
export default function FieldOfficerActivitiesPage() {
  const [activeTab, setActiveTab] = useState('visit-scheduler');
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [_, navigate] = useLocation();
  
  // Load sample data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setVisits([
        {
          id: '1',
          date: '2025-05-02',
          time: '10:00',
          officerName: 'Jane Smith',
          hostName: 'Acme Constructions',
          visitType: 'Induction'
        },
        {
          id: '2',
          date: '2025-05-04',
          time: '14:00',
          officerName: 'Raj Patel',
          hostName: 'SteelWorks Pty Ltd',
          visitType: 'Quarterly Review'
        },
        {
          id: '3',
          date: '2025-05-10',
          time: '09:00',
          officerName: 'Jane Smith',
          hostName: 'Acme Constructions',
          visitType: 'Quarterly Review'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  // Define columns for the visit scheduler grid
  const visitColumns = [
    {
      id: 'date',
      header: 'Date',
      cell: (visit: FieldVisit) => formatDate(new Date(visit.date), 'dd/MM/yyyy')
    },
    {
      id: 'time',
      header: 'Time',
      cell: (visit: FieldVisit) => visit.time
    },
    {
      id: 'officerName',
      header: 'Officer',
      cell: (visit: FieldVisit) => visit.officerName
    },
    {
      id: 'hostName',
      header: 'Host',
      cell: (visit: FieldVisit) => visit.hostName
    },
    {
      id: 'visitType',
      header: 'Type',
      cell: (visit: FieldVisit) => visit.visitType
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (visit: FieldVisit) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/field-officers/site-assessment')}
          >
            <FileEdit className="w-4 h-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="w-4 h-4 text-red-500" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      )
    }
  ];

  // Visit scheduler filter options
  const fieldOfficerOptions = [
    { value: 'all', label: 'All Field Officers' },
    { value: 'jane', label: 'Jane Smith' },
    { value: 'raj', label: 'Raj Patel' }
  ];

  const hostOptions = [
    { value: 'all', label: 'All Host Employers' },
    { value: 'acme', label: 'Acme Constructions' },
    { value: 'steelworks', label: 'SteelWorks Pty Ltd' }
  ];

  const visitTypeOptions = [
    { value: 'all', label: 'All Visit Types' },
    { value: 'induction', label: 'Induction' },
    { value: 'quarterly', label: 'Quarterly Review' },
    { value: 'followup', label: 'Follow-up' }
  ];

  // Render filters for the visit scheduler
  const renderVisitSchedulerFilters = () => (
    <FilterBar>
      <FilterGroup
        title="Field Officer"
        value="all"
        options={fieldOfficerOptions}
        onChange={() => {}}
        icon={<Users className="w-4 h-4" />}
      />
      <FilterGroup
        title="Host Employer"
        value="all"
        options={hostOptions}
        onChange={() => {}}
      />
      <FilterGroup
        title="Visit Type"
        value="all"
        options={visitTypeOptions}
        onChange={() => {}}
      />
    </FilterBar>
  );

  return (
    <PageLayout
      title="Field Officer Activities"
      description="Manage and track field officer visits, site assessments, and follow-ups"
      actions={
        <Button className="gap-2" onClick={() => navigate('/field-officers/site-assessment')}>
          <Calendar className="h-4 w-4" />
          New Visit
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="visit-scheduler">Visit Scheduler</TabsTrigger>
          <TabsTrigger value="site-assessment">Site Assessment</TabsTrigger>
          <TabsTrigger value="case-notes">Case Notes & Logs</TabsTrigger>
          <TabsTrigger value="competency-review">Competency Review</TabsTrigger>
          <TabsTrigger value="incident-tracking">Incident Tracking</TabsTrigger>
          <TabsTrigger value="action-items">Action Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visit-scheduler" className="space-y-4">
          <DataGrid
            title="Scheduled Visits"
            data={visits}
            columns={visitColumns}
            isLoading={loading}
            renderFilters={renderVisitSchedulerFilters}
            onSearch={(search) => console.log('Search:', search)}
            searchValue=""
            emptyMessage="No scheduled visits found."
            actions={
              <Button size="sm" className="gap-2">
                <Clock className="h-4 w-4" />
                Calendar View
              </Button>
            }
          />
        </TabsContent>
        
        <TabsContent value="site-assessment">
          <div className="p-8 text-center text-muted-foreground">
            Site Assessment module will be implemented in the next sprint.
          </div>
        </TabsContent>
        
        <TabsContent value="case-notes">
          <div className="p-8 text-center text-muted-foreground">
            Case Notes & Logs module will be implemented in the next sprint.
          </div>
        </TabsContent>
        
        <TabsContent value="competency-review">
          <div className="p-8 text-center text-muted-foreground">
            Competency & Training Review module will be implemented in the next sprint.
          </div>
        </TabsContent>
        
        <TabsContent value="incident-tracking">
          <div className="p-8 text-center text-muted-foreground">
            Incident Tracking module will be implemented in the next sprint.
          </div>
        </TabsContent>
        
        <TabsContent value="action-items">
          <div className="p-8 text-center text-muted-foreground">
            Action Items & Reminders module will be implemented in the next sprint.
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}