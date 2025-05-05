import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DownloadCloud, FileInput, FilePlus, FileUp, Upload, ArrowDownToLine, FileText, FileIcon, AlertTriangle, Database, CheckCircle2, Trash2 } from 'lucide-react';

const importSchema = z.object({
  fileType: z.enum(['csv', 'json', 'xlsx']),
  entityType: z.string(),
  updateExisting: z.boolean().default(false),
  skipErrors: z.boolean().default(false),
});

const exportSchema = z.object({
  fileType: z.enum(['csv', 'json', 'xlsx']),
  entityType: z.string(),
  includeRelated: z.boolean().default(false),
  filter: z.string().optional(),
});

type ImportFormValues = z.infer<typeof importSchema>;
type ExportFormValues = z.infer<typeof exportSchema>;

const entityOptions = [
  { value: 'apprentices', label: 'Apprentices' },
  { value: 'host_employers', label: 'Host Employers' },
  { value: 'training_contracts', label: 'Training Contracts' },
  { value: 'placements', label: 'Placements' },
  { value: 'documents', label: 'Documents' },
  { value: 'compliance_records', label: 'Compliance Records' },
  { value: 'timesheets', label: 'Timesheets' },
  { value: 'users', label: 'Users' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'qualifications', label: 'Qualifications' },
  { value: 'units_of_competency', label: 'Units of Competency' },
];

interface ImportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  entityType: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  errors: string[];
  createdAt: string;
  completedAt?: string;
}

interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  entityType: string;
  fileType: string;
  fileName: string;
  totalRows: number;
  filter?: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

const ImportExportSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Forms
  const importForm = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      fileType: 'csv',
      entityType: 'apprentices',
      updateExisting: true,
      skipErrors: false,
    },
  });

  const exportForm = useForm<ExportFormValues>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      fileType: 'csv',
      entityType: 'apprentices',
      includeRelated: false,
      filter: '',
    },
  });

  // Query for import jobs
  const { data: importJobs, isLoading: isLoadingImportJobs } = useQuery<ImportJob[]>({
    queryKey: ['/api/import-jobs'],
  });

  // Query for export jobs
  const { data: exportJobs, isLoading: isLoadingExportJobs } = useQuery<ExportJob[]>({
    queryKey: ['/api/export-jobs'],
  });

  // Create import job mutation
  const createImportJobMutation = useMutation({
    mutationFn: async (data: FormData) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/import-jobs', true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      const promise = new Promise<any>((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Import failed: ' + xhr.statusText));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Import failed'));
        };
      });
      
      xhr.send(data);
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/import-jobs'] });
      importForm.reset();
      setSelectedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: 'Success',
        description: 'Import job created successfully',
      });
    },
    onError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: 'Error',
        description: `Failed to create import job: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create export job mutation
  const createExportJobMutation = useMutation({
    mutationFn: async (data: ExportFormValues) => {
      const response = await apiRequest('POST', '/api/export-jobs', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/export-jobs'] });
      toast({
        title: 'Success',
        description: 'Export job created successfully. It will be available for download once completed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create export job: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Download export file mutation
  const downloadExportMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest('GET', `/api/export-jobs/${jobId}/download`, null, { responseType: 'blob' });
      return response;
    },
    onSuccess: (response, jobId) => {
      const job = exportJobs?.find(j => j.id === jobId);
      if (job) {
        // Create a blob from the response
        const blob = new Blob([response], { type: getContentType(job.fileType) });
        const url = window.URL.createObjectURL(blob);
        
        // Create a link and click it to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = job.fileName || `export-${job.entityType}.${job.fileType}`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Success',
          description: 'Export file downloaded successfully',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to download export file: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete import job mutation
  const deleteImportJobMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/import-jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/import-jobs'] });
      toast({
        title: 'Success',
        description: 'Import job deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete import job: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete export job mutation
  const deleteExportJobMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/export-jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/export-jobs'] });
      toast({
        title: 'Success',
        description: 'Export job deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete export job: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Detect file type from extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') {
        importForm.setValue('fileType', 'csv');
      } else if (extension === 'json') {
        importForm.setValue('fileType', 'json');
      } else if (extension === 'xlsx') {
        importForm.setValue('fileType', 'xlsx');
      }
    }
  };

  // Handle form submissions
  const onImportSubmit = (data: ImportFormValues) => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to import',
        variant: 'destructive',
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileType', data.fileType);
    formData.append('entityType', data.entityType);
    formData.append('updateExisting', data.updateExisting.toString());
    formData.append('skipErrors', data.skipErrors.toString());
    
    createImportJobMutation.mutate(formData);
  };

  const onExportSubmit = (data: ExportFormValues) => {
    createExportJobMutation.mutate(data);
  };

  // Handle download
  const handleDownload = (jobId: string) => {
    downloadExportMutation.mutate(jobId);
  };

  // Handle delete job
  const handleDeleteImportJob = (id: string) => {
    if (confirm('Are you sure you want to delete this import job?')) {
      deleteImportJobMutation.mutate(id);
    }
  };

  const handleDeleteExportJob = (id: string) => {
    if (confirm('Are you sure you want to delete this export job?')) {
      deleteExportJobMutation.mutate(id);
    }
  };

  // Get content type based on file type
  const getContentType = (fileType: string) => {
    switch (fileType) {
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Data Import & Export</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="import">
            <FileUp className="h-4 w-4 mr-2" /> Import Data
          </TabsTrigger>
          <TabsTrigger value="export">
            <ArrowDownToLine className="h-4 w-4 mr-2" /> Export Data
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Import data from CSV, JSON, or Excel files. This will create new records or update existing ones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...importForm}>
                <form onSubmit={importForm.handleSubmit(onImportSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={importForm.control}
                      name="entityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select data type to import" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {entityOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of data you want to import
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={importForm.control}
                      name="fileType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File Format</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select file format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The format of the file you're uploading
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="font-medium mb-2">Upload File</div>
                      <div className="mb-4">
                        <Input 
                          id="file-upload" 
                          type="file" 
                          onChange={handleFileChange} 
                          accept=".csv,.json,.xlsx,.xls"
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Selected file: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="font-medium">Import Options</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={importForm.control}
                        name="updateExisting"
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="update-existing"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="update-existing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Update existing records if found
                            </Label>
                          </div>
                        )}
                      />
                      <FormField
                        control={importForm.control}
                        name="skipErrors"
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="skip-errors"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="skip-errors" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Continue import when errors are encountered
                            </Label>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <Label className="text-sm">Upload Progress</Label>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                    </div>
                  )}

                  <Button type="submit" disabled={!selectedFile || isUploading}>
                    {isUploading ? 'Uploading...' : 'Start Import'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mb-4">Recent Import Jobs</h2>
          
          {isLoadingImportJobs ? (
            <div className="text-center py-8">Loading import jobs...</div>
          ) : importJobs && importJobs.length > 0 ? (
            <div className="space-y-4">
              {importJobs.map(job => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileIcon className="h-5 w-5" />
                          <span>{job.fileName}</span>
                        </CardTitle>
                        <CardDescription>
                          {entityOptions.find(e => e.value === job.entityType)?.label || job.entityType} ({job.totalRows} rows)
                        </CardDescription>
                      </div>
                      <Badge
                        className={job.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                 job.status === 'failed' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                 job.status === 'processing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                      >
                        {job.status === 'completed' ? 'Completed' :
                         job.status === 'failed' ? 'Failed' :
                         job.status === 'processing' ? 'Processing' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                      {job.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completed:</span>
                          <span>{formatDate(job.completedAt)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span>{job.processedRows} of {job.totalRows} rows</span>
                      </div>
                      {job.errorRows > 0 && (
                        <div className="flex justify-between text-red-500">
                          <span>Errors:</span>
                          <span>{job.errorRows} rows</span>
                        </div>
                      )}
                    </div>
                    
                    {job.errors && job.errors.length > 0 && (
                      <div className="mt-4">
                        <Alert variant="destructive" className="text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Import Errors</AlertTitle>
                          <AlertDescription>
                            <ul className="list-disc pl-4 mt-2 space-y-1">
                              {job.errors.slice(0, 3).map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                              {job.errors.length > 3 && (
                                <li>...and {job.errors.length - 3} more errors</li>
                              )}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteImportJob(job.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete Job
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <FileInput className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Import Jobs</h3>
                <p className="text-muted-foreground">
                  You haven't run any import jobs yet. Create a new import to get started.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export data to CSV, JSON, or Excel files. You can filter the data and include related records.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...exportForm}>
                <form onSubmit={exportForm.handleSubmit(onExportSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={exportForm.control}
                      name="entityType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select data type to export" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {entityOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The type of data you want to export
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={exportForm.control}
                      name="fileType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>File Format</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select file format" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The format of the exported file
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="font-medium">Export Options</div>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={exportForm.control}
                        name="includeRelated"
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="include-related"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <Label htmlFor="include-related" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Include related records
                            </Label>
                          </div>
                        )}
                      />
                      <FormField
                        control={exportForm.control}
                        name="filter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Filter (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., status=active or created_after=2024-01-01" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormDescription>
                              Filter the data using key=value pairs separated by comma
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit">
                    Start Export
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mb-4">Recent Export Jobs</h2>
          
          {isLoadingExportJobs ? (
            <div className="text-center py-8">Loading export jobs...</div>
          ) : exportJobs && exportJobs.length > 0 ? (
            <div className="space-y-4">
              {exportJobs.map(job => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          <span>{job.fileName || `${job.entityType}.${job.fileType}`}</span>
                        </CardTitle>
                        <CardDescription>
                          {entityOptions.find(e => e.value === job.entityType)?.label || job.entityType} - {job.totalRows} records
                        </CardDescription>
                      </div>
                      <Badge
                        className={job.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                 job.status === 'failed' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                 job.status === 'processing' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                      >
                        {job.status === 'completed' ? 'Completed' :
                         job.status === 'failed' ? 'Failed' :
                         job.status === 'processing' ? 'Processing' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                      {job.completedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Completed:</span>
                          <span>{formatDate(job.completedAt)}</span>
                        </div>
                      )}
                      {job.filter && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Filter:</span>
                          <span className="truncate max-w-[200px]">{job.filter}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteExportJob(job.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    {job.status === 'completed' && (
                      <Button variant="outline" size="sm" onClick={() => handleDownload(job.id)}>
                        <DownloadCloud className="h-4 w-4 mr-1" /> Download
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <DownloadCloud className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Export Jobs</h3>
                <p className="text-muted-foreground">
                  You haven't run any export jobs yet. Create a new export to get started.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportExportSettings;
