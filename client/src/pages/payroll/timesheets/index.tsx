import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Loader,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/common';
import { Calendar, CheckCircle, Clock, Download, Filter, Plus, Search, User } from 'lucide-react';

interface Timesheet {
  id: number;
  apprenticeId: number;
  apprenticeName: string; // Full name
  weekStarting: string;
  weekEnding: string;
  status: string;
  totalHours: number;
  submittedDate: string;
  approvedByName: string | null;
  approvalDate: string | null;
}

const TimesheetsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    data: timesheets = [],
    isLoading,
    error,
  } = useQuery<Timesheet[]>({
    queryKey: ['/api/payroll/timesheets'],
  });

  // Filter timesheets based on search term and status filter
  const filteredTimesheets = timesheets.filter(timesheet => {
    const matchesSearch =
      timesheet.apprenticeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      timesheet.weekStarting.includes(searchTerm) ||
      timesheet.status.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || timesheet.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Timesheets</h1>
          <p className="text-muted-foreground mt-2">Manage and process apprentice timesheets</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Timesheet
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="error" className="mb-6">
          <AlertTitle>Error Loading Timesheets</AlertTitle>
          <AlertDescription>
            There was a problem loading the timesheets. Please try again later.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle>Timesheets</CardTitle>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search timesheets..."
                  className="pl-8 w-full h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" text="Loading timesheets..." />
            </div>
          ) : filteredTimesheets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'No timesheets matching your filters'
                : 'No timesheets found. Create a new timesheet to get started.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-3 text-left border-b">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        Apprentice
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left border-b">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        Week Range
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center border-b">
                      <div className="flex items-center justify-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Hours
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center border-b">Status</th>
                    <th className="px-4 py-3 text-center border-b">Submitted</th>
                    <th className="px-4 py-3 text-right border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.map(timesheet => (
                    <tr key={timesheet.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 border-b">{timesheet.apprenticeName}</td>
                      <td className="px-4 py-3 border-b">
                        {new Date(timesheet.weekStarting).toLocaleDateString()} -{' '}
                        {new Date(timesheet.weekEnding).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 border-b text-center">{timesheet.totalHours}</td>
                      <td className="px-4 py-3 border-b text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                          ${timesheet.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${timesheet.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                          ${timesheet.status === 'submitted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${timesheet.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                        `}
                        >
                          {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b text-center">
                        {new Date(timesheet.submittedDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 border-b text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          {timesheet.status === 'submitted' && (
                            <Button variant="default" size="sm">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetsPage;
