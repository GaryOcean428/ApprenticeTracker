import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileUp, 
  FileDown, 
  FileSpreadsheet, 
  FilePlus, 
  FileArchive, 
  Database, 
  AlertTriangle, 
  Download,
  Calendar,
  Info,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ImportJob {
  id: number;
  type: string;
  status: 'completed' | 'in_progress' | 'failed' | 'queued';
  fileName: string;
  recordsProcessed: number;
  recordsTotal: number;
  errors: string[] | null;
  createdAt: Date;
  completedAt: Date | null;
  createdBy: {
    id: number;
    name: string;
  };
}

interface ExportJob {
  id: number;
  type: string;
  status: 'completed' | 'in_progress' | 'failed' | 'queued';
  fileName: string;
  format: 'csv' | 'excel' | 'json';
  recordsTotal: number;
  createdAt: Date;
  completedAt: Date | null;
  downloadUrl: string | null;
  createdBy: {
    id: number;
    name: string;
  };
}

interface DataTemplate {
  id: number;
  name: string;
  description: string;
  fileType: 'csv' | 'excel' | 'json';
  downloadUrl: string;
  category: string;
  updatedAt: Date;
}

const ImportJobRow = ({ job }: { job: ImportJob }) => {
  return (
    <TableRow>
      <TableCell>{job.fileName}</TableCell>
      <TableCell>
        <Badge variant={job.status === 'completed' ? 'success' : 
                        job.status === 'failed' ? 'destructive' : 
                        job.status === 'in_progress' ? 'default' : 
                        'outline'}>
          {job.status === 'completed' ? 'Completed' : 
           job.status === 'failed' ? 'Failed' : 
           job.status === 'in_progress' ? 'In Progress' : 
           'Queued'}
        </Badge>
      </TableCell>
      <TableCell>
        {job.recordsProcessed} / {job.recordsTotal}
        {job.status === 'in_progress' && (
          <Progress value={(job.recordsProcessed / job.recordsTotal) * 100} className="h-2 mt-1" />
        )}
      </TableCell>
      <TableCell>{job.createdBy.name}</TableCell>
      <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
      <TableCell>
        {job.status === 'failed' && (
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-1" /> View Errors
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

const ExportJobRow = ({ job }: { job: ExportJob }) => {
  return (
    <TableRow>
      <TableCell>{job.fileName}</TableCell>
      <TableCell>
        <Badge variant={job.status === 'completed' ? 'success' : 
                        job.status === 'failed' ? 'destructive' : 
                        job.status === 'in_progress' ? 'default' : 
                        'outline'}>
          {job.status === 'completed' ? 'Completed' : 
           job.status === 'failed' ? 'Failed' : 
           job.status === 'in_progress' ? 'In Progress' : 
           'Queued'}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {job.format === 'csv' ? 'CSV' : 
           job.format === 'excel' ? 'Excel' : 
           'JSON'}
        </Badge>
      </TableCell>
      <TableCell>{job.recordsTotal}</TableCell>
      <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
      <TableCell>
        {job.status === 'completed' && job.downloadUrl && (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

const DataTemplateRow = ({ template }: { template: DataTemplate }) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{template.name}</TableCell>
      <TableCell>{template.description}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {template.fileType === 'csv' ? 'CSV' : 
           template.fileType === 'excel' ? 'Excel' : 
           'JSON'}
        </Badge>
      </TableCell>
      <TableCell>{template.category}</TableCell>
      <TableCell>{new Date(template.updatedAt).toLocaleString()}</TableCell>
      <TableCell>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" /> Download
        </Button>
      </TableCell>
    </TableRow>
  );
};

const ImportExportManager = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('import');
  const [selectedImportType, setSelectedImportType] = useState('apprentices');
  const [selectedExportType, setSelectedExportType] = useState('apprentices');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState({
    skipHeader: true,
    updateExisting: true,
    validateOnly: false,
  });
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeArchived: false,
    dateRange: 'all',
  });

  // Fetch import jobs
  const { data: importJobs, isLoading: isLoadingImportJobs } = useQuery<ImportJob[]>({
    queryKey: ['/api/import-jobs'],
    // Temporarily handle mock data until API is implemented
    queryFn: async () => {
      // This is a fallback for development. In production, the actual API endpoint would be called.
      return [
        {
          id: 1,
          type: 'apprentices',
          status: 'completed',
          fileName: 'apprentices-import-20250401.csv',
          recordsProcessed: 124,
          recordsTotal: 124,
          errors: null,
          createdAt: new Date(Date.now() - 86400000),
          completedAt: new Date(Date.now() - 86395000),
          createdBy: {
            id: 1,
            name: 'Admin User',
          },
        },
        {
          id: 2,
          type: 'host_employers',
          status: 'in_progress',
          fileName: 'employers-import-20250430.csv',
          recordsProcessed: 47,
          recordsTotal: 150,
          errors: null,
          createdAt: new Date(),
          completedAt: null,
          createdBy: {
            id: 1,
            name: 'Admin User',
          },
        },
        {
          id: 3,
          type: 'training_contracts',
          status: 'failed',
          fileName: 'contracts-import-20250429.csv',
          recordsProcessed: 5,
          recordsTotal: 78,
          errors: ['Row 6: Invalid apprentice ID', 'Row 10: Missing required field: contractNumber'],
          createdAt: new Date(Date.now() - 172800000),
          completedAt: new Date(Date.now() - 172790000),
          createdBy: {
            id: 2,
            name: 'Gary Ocean',
          },
        },
      ];
    },
  });

  // Fetch export jobs
  const { data: exportJobs, isLoading: isLoadingExportJobs } = useQuery<ExportJob[]>({
    queryKey: ['/api/export-jobs'],
    // Temporarily handle mock data until API is implemented
    queryFn: async () => {
      // This is a fallback for development. In production, the actual API endpoint would be called.
      return [
        {
          id: 1,
          type: 'apprentices',
          status: 'completed',
          fileName: 'apprentices-export-20250430.csv',
          format: 'csv',
          recordsTotal: 156,
          createdAt: new Date(Date.now() - 86400000),
          completedAt: new Date(Date.now() - 86395000),
          downloadUrl: '/api/exports/apprentices-export-20250430.csv',
          createdBy: {
            id: 1,
            name: 'Admin User',
          },
        },
        {
          id: 2,
          type: 'host_employers',
          status: 'completed',
          fileName: 'employers-export-20250430.xlsx',
          format: 'excel',
          recordsTotal: 78,
          createdAt: new Date(Date.now() - 172800000),
          completedAt: new Date(Date.now() - 172790000),
          downloadUrl: '/api/exports/employers-export-20250430.xlsx',
          createdBy: {
            id: 2,
            name: 'Gary Ocean',
          },
        },
        {
          id: 3,
          type: 'apprentices_with_hosts',
          status: 'completed',
          fileName: 'apprentices-with-hosts-20250430.xlsx',
          format: 'excel',
          recordsTotal: 124,
          createdAt: new Date(Date.now() - 259200000),
          completedAt: new Date(Date.now() - 259190000),
          downloadUrl: '/api/exports/apprentices-with-hosts-20250430.xlsx',
          createdBy: {
            id: 1,
            name: 'Admin User',
          },
        },
        {
          id: 4,
          type: 'full_system_export',
          status: 'completed',
          fileName: 'crm-full-export-20250425.zip',
          format: 'json',
          recordsTotal: 1265,
          createdAt: new Date(Date.now() - 518400000),
          completedAt: new Date(Date.now() - 518300000),
          downloadUrl: '/api/exports/crm-full-export-20250425.zip',
          createdBy: {
            id: 1,
            name: 'Admin User',
          },
        },
      ];
    },
  });

  // Fetch data templates
  const { data: dataTemplates, isLoading: isLoadingTemplates } = useQuery<DataTemplate[]>({
    queryKey: ['/api/data-templates'],
    // Temporarily handle mock data until API is implemented
    queryFn: async () => {
      // This is a fallback for development. In production, the actual API endpoint would be called.
      return [
        {
          id: 1,
          name: 'Apprentice Import Template',
          description: 'Template for importing apprentice records',
          fileType: 'csv',
          downloadUrl: '/api/templates/apprentice-import.csv',
          category: 'Apprentices',
          updatedAt: new Date(Date.now() - 2592000000),
        },
        {
          id: 2,
          name: 'Host Employer Import Template',
          description: 'Template for importing host employer records',
          fileType: 'excel',
          downloadUrl: '/api/templates/host-employer-import.xlsx',
          category: 'Host Employers',
          updatedAt: new Date(Date.now() - 1296000000),
        },
        {
          id: 3,
          name: 'Training Contract Import Template',
          description: 'Template for importing training contracts',
          fileType: 'csv',
          downloadUrl: '/api/templates/training-contract-import.csv',
          category: 'Contracts',
          updatedAt: new Date(Date.now() - 864000000),
        },
        {
          id: 4,
          name: 'Timesheet Import Template',
          description: 'Template for importing timesheet records',
          fileType: 'csv',
          downloadUrl: '/api/templates/timesheet-import.csv',
          category: 'Timesheets',
          updatedAt: new Date(Date.now() - 432000000),
        },
      ];
    },
  });

  // Start import job mutation
  const startImportMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest('POST', '/api/import', formData, {
        isFormData: true,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Import Started',
        description: 'Your import job has been queued successfully.',
      });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Import Failed',
        description: `Failed to start import job: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Start export job mutation
  const startExportMutation = useMutation({
    mutationFn: async (data: typeof exportOptions & { type: string }) => {
      const response = await apiRequest('POST', '/api/export', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Export Started',
        description: 'Your export job has been queued successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Export Failed',
        description: `Failed to start export job: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleImportSubmit = () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a file to import.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', selectedImportType);
    formData.append('options', JSON.stringify(importOptions));
    
    startImportMutation.mutate(formData);
  };

  const handleExportSubmit = () => {
    const data = {
      ...exportOptions,
      type: selectedExportType,
    };
    startExportMutation.mutate(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Data Import & Export</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="import">
            <FileUp className="h-4 w-4 mr-2" /> Import Data
          </TabsTrigger>
          <TabsTrigger value="export">
            <FileDown className="h-4 w-4 mr-2" /> Export Data
          </TabsTrigger>
          <TabsTrigger value="customviews">
            <Search className="h-4 w-4 mr-2" /> Custom Views
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Data Templates
          </TabsTrigger>
        </TabsList>
        
        {/* Import Tab */}
        <TabsContent value="import">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                  <CardDescription>
                    Upload and process data files to import records into the system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="importType">Data Type</Label>
                    <Select
                      value={selectedImportType}
                      onValueChange={setSelectedImportType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bulk_import">Bulk Data Import</SelectItem>
                        <SelectItem value="apprentices">Apprentices</SelectItem>
                        <SelectItem value="host_employers">Host Employers</SelectItem>
                        <SelectItem value="training_contracts">Training Contracts</SelectItem>
                        <SelectItem value="placements">Placements</SelectItem>
                        <SelectItem value="timesheets">Timesheets</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="apprentices_with_hosts">Apprentices with Host Details</SelectItem>
                        <SelectItem value="related_data">Related Data Import</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select the type of data you want to import
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="importFile">File</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                      {selectedFile ? (
                        <div className="text-center">
                          <FileSpreadsheet className="h-8 w-8 mb-2 mx-auto text-primary" />
                          <p className="font-medium break-all">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                            className="mt-2"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <>
                          <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium mb-1">Drag & drop your file or</p>
                          <Input
                            id="importFile"
                            type="file"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setSelectedFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                            accept=".csv,.xlsx,.xls,.json"
                          />
                          <Label htmlFor="importFile" className="cursor-pointer text-primary text-sm">
                            Browse files
                          </Label>
                          <p className="text-xs text-muted-foreground mt-2 text-center">
                            Accepts CSV, Excel, and JSON files up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Import Options</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="skipHeader" className="text-sm font-normal cursor-pointer">
                          Skip Header Row
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          First row contains column headers
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        id="skipHeader"
                        checked={importOptions.skipHeader}
                        onChange={(e) => setImportOptions({ ...importOptions, skipHeader: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="updateExisting" className="text-sm font-normal cursor-pointer">
                          Update Existing Records
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Update records if they already exist
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        id="updateExisting"
                        checked={importOptions.updateExisting}
                        onChange={(e) => setImportOptions({ ...importOptions, updateExisting: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="validateOnly" className="text-sm font-normal cursor-pointer">
                          Validate Only
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Check for errors without importing
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        id="validateOnly"
                        checked={importOptions.validateOnly}
                        onChange={(e) => setImportOptions({ ...importOptions, validateOnly: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>
                    
                    {(selectedImportType === 'bulk_import' || selectedImportType === 'related_data' || selectedImportType === 'apprentices_with_hosts') && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="createRelationships" className="text-sm font-normal cursor-pointer">
                            Create Relationships
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Establish relationships between records
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="createRelationships"
                          checked={true}
                          className="h-4 w-4"
                        />
                      </div>
                    )}
                    
                    {selectedImportType === 'bulk_import' && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allowPartial" className="text-sm font-normal cursor-pointer">
                            Allow Partial Import
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Continue if some records have errors
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          id="allowPartial"
                          checked={true}
                          className="h-4 w-4"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleImportSubmit}
                    disabled={!selectedFile || startImportMutation.isPending}
                    className="w-full"
                  >
                    {startImportMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <FileUp className="h-4 w-4 mr-2" /> Start Import
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Import Jobs</CardTitle>
                  <CardDescription>
                    View the status and results of recent import operations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>List of recent import jobs</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingImportJobs ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading import jobs...
                          </TableCell>
                        </TableRow>
                      ) : importJobs && importJobs.length > 0 ? (
                        importJobs.map((job) => (
                          <ImportJobRow key={job.id} job={job} />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No import jobs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Always validate your data before importing. Download a data template from the Templates tab to ensure your file has the correct format.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </TabsContent>
        
        {/* Export Tab */}
        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>
                    Export system data to various file formats.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exportType">Data Type</Label>
                    <Select
                      value={selectedExportType}
                      onValueChange={setSelectedExportType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_system_export">Full System Export</SelectItem>
                        <SelectItem value="apprentices">Apprentices</SelectItem>
                        <SelectItem value="host_employers">Host Employers</SelectItem>
                        <SelectItem value="training_contracts">Training Contracts</SelectItem>
                        <SelectItem value="placements">Placements</SelectItem>
                        <SelectItem value="timesheets">Timesheets</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="reports">Reports</SelectItem>
                        <SelectItem value="apprentices_with_hosts">Apprentices with Host Employers</SelectItem>
                        <SelectItem value="apprentices_with_training">Apprentices with Training Details</SelectItem>
                        <SelectItem value="hosts_with_apprentices">Host Employers with Apprentices</SelectItem>
                        <SelectItem value="custom_view">Custom Data View</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Select the type of data you want to export
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Export Options</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="exportFormat">File Format</Label>
                      <Select
                        value={exportOptions.format}
                        onValueChange={(value) => setExportOptions({ ...exportOptions, format: value })}
                      >
                        <SelectTrigger id="exportFormat">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          {selectedExportType === 'full_system_export' && (
                            <SelectItem value="zip">ZIP Archive (All Data)</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedExportType === 'custom_view' && (
                      <div className="space-y-2">
                        <Label htmlFor="customView">Custom View</Label>
                        <Select defaultValue="apprentice_contact_details">
                          <SelectTrigger id="customView">
                            <SelectValue placeholder="Select saved view" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apprentice_contact_details">Apprentice Contact Details</SelectItem>
                            <SelectItem value="host_with_contacts">Host Employers with Contact Info</SelectItem>
                            <SelectItem value="compliance_status">Compliance Status Report</SelectItem>
                            <SelectItem value="training_progress">Training Progress Overview</SelectItem>
                            <SelectItem value="financial_summary">Financial Summary</SelectItem>
                            <SelectItem value="create_new">+ Create New View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateRange">Date Range</Label>
                      <Select
                        value={exportOptions.dateRange}
                        onValueChange={(value) => setExportOptions({ ...exportOptions, dateRange: value })}
                      >
                        <SelectTrigger id="dateRange">
                          <SelectValue placeholder="Select date range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="this_week">This Week</SelectItem>
                          <SelectItem value="this_month">This Month</SelectItem>
                          <SelectItem value="last_month">Last Month</SelectItem>
                          <SelectItem value="this_year">This Year</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <Label htmlFor="includeArchived" className="text-sm font-normal cursor-pointer">
                          Include Archived
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Include archived or inactive records
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        id="includeArchived"
                        checked={exportOptions.includeArchived}
                        onChange={(e) => setExportOptions({ ...exportOptions, includeArchived: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleExportSubmit}
                    disabled={startExportMutation.isPending}
                    className="w-full"
                  >
                    {startExportMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4 mr-2" /> Start Export
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Export Jobs</CardTitle>
                  <CardDescription>
                    View and download your recent data exports.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>List of recent export jobs</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingExportJobs ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading export jobs...
                          </TableCell>
                        </TableRow>
                      ) : exportJobs && exportJobs.length > 0 ? (
                        exportJobs.map((job) => (
                          <ExportJobRow key={job.id} job={job} />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No export jobs found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center">
                      <Calendar className="h-4 w-4 mr-2" /> Scheduled Exports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Set up recurring exports that run automatically.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Schedules
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center">
                      <Database className="h-4 w-4 mr-2" /> System Backup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create a complete backup of all system data.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileArchive className="h-4 w-4 mr-2" /> Backup Data
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md flex items-center">
                      <Search className="h-4 w-4 mr-2" /> Customizable Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Create and save custom data views with specific fields and relationships.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Designer
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Custom Views Tab */}
        <TabsContent value="customviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Customizable Data Views</span>
                <Button>
                  <FilePlus className="h-4 w-4 mr-2" /> Create New View
                </Button>
              </CardTitle>
              <CardDescription>
                Create and manage custom data views for import and export operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-md border p-6">
                  <h3 className="text-lg font-semibold mb-2">View Designer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create custom data views by selecting data entities, fields, and relationships.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="baseEntity" className="mb-2 block">Base Entity</Label>
                      <Select defaultValue="apprentices">
                        <SelectTrigger id="baseEntity">
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apprentices">Apprentices</SelectItem>
                          <SelectItem value="host_employers">Host Employers</SelectItem>
                          <SelectItem value="training_contracts">Training Contracts</SelectItem>
                          <SelectItem value="users">Users</SelectItem>
                          <SelectItem value="timesheets">Timesheets</SelectItem>
                          <SelectItem value="placements">Placements</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="viewName" className="mb-2 block">View Name</Label>
                      <Input id="viewName" placeholder="Enter a name for this view" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-4">
                    <div>
                      <Label className="mb-2 block">Fields to Include</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_id" checked />
                          <label htmlFor="field_id">ID</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_firstName" checked />
                          <label htmlFor="field_firstName">First Name</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_lastName" checked />
                          <label htmlFor="field_lastName">Last Name</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_email" checked />
                          <label htmlFor="field_email">Email</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_phone" checked />
                          <label htmlFor="field_phone">Phone</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_status" checked />
                          <label htmlFor="field_status">Status</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_trade" checked />
                          <label htmlFor="field_trade">Trade</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_progress" />
                          <label htmlFor="field_progress">Progress</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="field_createdAt" />
                          <label htmlFor="field_createdAt">Created Date</label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Include Related Data</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="rel_hostEmployer" checked />
                          <label htmlFor="rel_hostEmployer">Host Employer</label>
                        </div>
                        <div className="pl-6 space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="rel_host_name" checked />
                            <label htmlFor="rel_host_name">Name</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="rel_host_contact" checked />
                            <label htmlFor="rel_host_contact">Contact Person</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="rel_host_phone" />
                            <label htmlFor="rel_host_phone">Phone</label>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="rel_trainingContract" checked />
                          <label htmlFor="rel_trainingContract">Training Contract</label>
                        </div>
                        <div className="pl-6 space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="rel_contract_number" checked />
                            <label htmlFor="rel_contract_number">Contract Number</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="rel_contract_start" checked />
                            <label htmlFor="rel_contract_start">Start Date</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="rel_contract_end" checked />
                            <label htmlFor="rel_contract_end">End Date</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save View</Button>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Saved Custom Views</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>View Name</TableHead>
                        <TableHead>Base Entity</TableHead>
                        <TableHead>Related Entities</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Apprentice Contact Details</TableCell>
                        <TableCell>Apprentices</TableCell>
                        <TableCell>None</TableCell>
                        <TableCell>Admin User</TableCell>
                        <TableCell>30 Apr 2025</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Apprentices with Host Details</TableCell>
                        <TableCell>Apprentices</TableCell>
                        <TableCell>Host Employers</TableCell>
                        <TableCell>Admin User</TableCell>
                        <TableCell>29 Apr 2025</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Training Progress Overview</TableCell>
                        <TableCell>Apprentices</TableCell>
                        <TableCell>Training Contracts, Placements</TableCell>
                        <TableCell>Gary Ocean</TableCell>
                        <TableCell>28 Apr 2025</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Host Employer Directory</TableCell>
                        <TableCell>Host Employers</TableCell>
                        <TableCell>None</TableCell>
                        <TableCell>Admin User</TableCell>
                        <TableCell>27 Apr 2025</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Data Templates</span>
                <Button>
                  <FilePlus className="h-4 w-4 mr-2" /> Create Template
                </Button>
              </CardTitle>
              <CardDescription>
                Download templates for data imports to ensure your data is formatted correctly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <Input
                  placeholder="Search templates..."
                  className="w-64"
                />
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="apprentices">Apprentices</SelectItem>
                    <SelectItem value="employers">Host Employers</SelectItem>
                    <SelectItem value="contracts">Contracts</SelectItem>
                    <SelectItem value="timesheets">Timesheets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Table>
                <TableCaption>Available data import/export templates</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingTemplates ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Loading templates...
                      </TableCell>
                    </TableRow>
                  ) : dataTemplates && dataTemplates.length > 0 ? (
                    dataTemplates.map((template) => (
                      <DataTemplateRow key={template.id} template={template} />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No templates found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Guidelines</CardTitle>
                <CardDescription>
                  Best practices for using data templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Download the Correct Template</h4>
                      <p className="text-sm text-muted-foreground">Always use the template designed for the specific data type you're importing.</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Don't Change Column Headers</h4>
                      <p className="text-sm text-muted-foreground">Keep the column headers exactly as they appear in the template.</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <h4 className="font-medium">Avoid Special Characters</h4>
                      <p className="text-sm text-muted-foreground">Special characters can cause import errors. Keep data clean and simple.</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Check Required Fields</h4>
                      <p className="text-sm text-muted-foreground">Make sure all required fields (marked with *) have values for each row.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Common Import Errors</CardTitle>
                <CardDescription>
                  Solutions for frequent data import issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="font-medium">Invalid Date Format</h4>
                      <p className="text-sm text-muted-foreground">Use DD/MM/YYYY format for dates (e.g., 01/05/2025)</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="font-medium">Duplicate Record IDs</h4>
                      <p className="text-sm text-muted-foreground">IDs must be unique. Leave blank for new records or provide existing IDs for updates.</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="font-medium">Invalid Reference IDs</h4>
                      <p className="text-sm text-muted-foreground">Foreign key references (e.g., apprenticeId) must exist in the system.</p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <h4 className="font-medium">File Encoding Issues</h4>
                      <p className="text-sm text-muted-foreground">Save CSV files with UTF-8 encoding to avoid character problems.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportExportManager;