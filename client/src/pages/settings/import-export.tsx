import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel, SelectSeparator } from '@/components/ui/select';
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
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DownloadCloud, FileInput, FilePlus, FileUp, Upload, ArrowDownToLine, FileText, FileIcon, AlertTriangle, Database, CheckCircle2, Trash2, Settings, Columns, UploadCloud, Eye, Paperclip, X, Wand2, Check, FileSearch, Edit3, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Enhanced schemas for column customization
interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  required: boolean;
  transform?: string;
}

interface ImportPreview {
  columns: string[];
  sampleRows: any[];
}

const importSchema = z.object({
  fileType: z.enum(['csv', 'json', 'xlsx']),
  entityType: z.string(),
  updateExisting: z.boolean().default(false),
  skipErrors: z.boolean().default(false),
  columnMapping: z.array(z.object({
    sourceColumn: z.string(),
    targetField: z.string(),
    required: z.boolean().default(false),
    transform: z.string().optional()
  })).optional(),
});

const exportSchema = z.object({
  fileType: z.enum(['csv', 'json', 'xlsx']),
  entityType: z.string(),
  includeRelated: z.boolean().default(false),
  filter: z.string().optional(),
  columns: z.array(z.string()).optional(),
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
  { value: 'awards', label: 'Awards (Fair Work)' },
  { value: 'enterprise_agreements', label: 'Enterprise Agreements' },
  { value: 'pay_rates', label: 'Pay Rates' },
  { value: 'classifications', label: 'Award Classifications' },
  { value: 'penalties', label: 'Penalty Rates' },
  { value: 'allowances', label: 'Allowances' },
];

// Group entities by type for better organization
const entityGroups = {
  'People': ['apprentices', 'host_employers', 'users'],
  'Contracts': ['training_contracts', 'placements'],
  'Documentation': ['documents', 'compliance_records', 'tasks', 'timesheets'],
  'Training': ['qualifications', 'units_of_competency'],
  'Fair Work': ['awards', 'enterprise_agreements', 'pay_rates', 'classifications', 'penalties', 'allowances'],
};

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

// Schema for Enterprise Agreement upload
const enterpriseAgreementSchema = z.object({
  name: z.string().min(3, { message: 'Agreement name is required' }),
  organization: z.string().min(3, { message: 'Organization name is required' }),
  start_date: z.string().min(1, { message: 'Start date is required' }),
  end_date: z.string().min(1, { message: 'End date is required' }),
  industry: z.string().optional(),
  status: z.enum(['active', 'expired', 'pending']).default('active'),
});

type EnterpriseAgreementFormValues = z.infer<typeof enterpriseAgreementSchema>;

// Interface for extracted pay rates
interface ExtractedPayRate {
  classification: string;
  rate: number;
  effective_date: string;
  notes?: string;
}

const ImportExportSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<ImportPreview | null>(null);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [entityFields, setEntityFields] = useState<{label: string, value: string}[]>([]);
  
  // Enterprise Agreement related states
  const [showEAUploadDialog, setShowEAUploadDialog] = useState(false);
  const [eaFile, setEAFile] = useState<File | null>(null);
  const [extractedRates, setExtractedRates] = useState<ExtractedPayRate[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showExtractedRates, setShowExtractedRates] = useState(false);
  
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
  
  // EA Form for Enterprise Agreement upload
  const eaForm = useForm<EnterpriseAgreementFormValues>({
    resolver: zodResolver(enterpriseAgreementSchema),
    defaultValues: {
      name: '',
      organization: '',
      start_date: '',
      end_date: '',
      industry: '',
      status: 'active',
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
      const response = await apiRequest('GET', `/api/export-jobs/${jobId}/download`);
      return response;
    },
    onSuccess: (response, jobId) => {
      const job = exportJobs?.find(j => j.id === jobId);
      if (job) {
        // Get the response text and create a blob
        response.text().then(text => {
          const blob = new Blob([text], { type: getContentType(job.fileType) });
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
  
  // Enterprise Agreement extraction mutation
  const extractPayRatesMutation = useMutation({
    mutationFn: async (data: FormData) => {
      setIsExtracting(true);
      setShowExtractedRates(false);
      const response = await apiRequest('POST', '/api/enterprise-agreements/extract-rates', data, { rawFormData: true });
      const result = await response.json();
      return result.rates;
    },
    onSuccess: (rates: ExtractedPayRate[]) => {
      setExtractedRates(rates);
      setShowExtractedRates(true);
      setIsExtracting(false);
      toast({
        title: 'Success',
        description: `Extracted ${rates.length} pay rates from the document`,
      });
    },
    onError: (error: Error) => {
      setIsExtracting(false);
      toast({
        title: 'Error',
        description: `Failed to extract pay rates: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Save Enterprise Agreement with extracted rates
  const saveEnterpriseAgreementMutation = useMutation({
    mutationFn: async (data: { agreement: EnterpriseAgreementFormValues, rates: ExtractedPayRate[] }) => {
      const response = await apiRequest('POST', '/api/enterprise-agreements', data);
      return await response.json();
    },
    onSuccess: () => {
      setShowEAUploadDialog(false);
      setEAFile(null);
      setExtractedRates([]);
      setShowExtractedRates(false);
      eaForm.reset();
      toast({
        title: 'Success',
        description: 'Enterprise Agreement saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save Enterprise Agreement: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle file selection
  // Get entity fields for mapping based on entity type
  useEffect(() => {
    const entityType = importForm.getValues('entityType');
    
    // For the entity schema fields, we use a mapping based on entity type
    const getEntityFields = () => {
      switch (entityType) {
        case 'apprentices':
          return [
            { label: 'First Name', value: 'firstName' },
            { label: 'Last Name', value: 'lastName' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Date of Birth', value: 'dateOfBirth' },
            { label: 'Address', value: 'address' },
            { label: 'City', value: 'city' },
            { label: 'State', value: 'state' },
            { label: 'Postal Code', value: 'postalCode' },
            { label: 'Country', value: 'country' },
          ];
        case 'host_employers':
          return [
            { label: 'Company Name', value: 'companyName' },
            { label: 'Contact Name', value: 'contactName' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'ABN', value: 'abn' },
            { label: 'Address', value: 'address' },
            { label: 'City', value: 'city' },
            { label: 'State', value: 'state' },
            { label: 'Postal Code', value: 'postalCode' },
            { label: 'Country', value: 'country' },
          ];
        case 'qualifications':
          return [
            { label: 'Code', value: 'code' },
            { label: 'Title', value: 'title' },
            { label: 'AQF Level', value: 'aqfLevel' },
            { label: 'Description', value: 'description' },
            { label: 'Status', value: 'status' },
            { label: 'Release Date', value: 'releaseDate' },
          ];
        // Fair Work related entities
        case 'awards':
          return [
            { label: 'Award ID', value: 'award_fixed_id' },
            { label: 'Award Code', value: 'code' },
            { label: 'Award Name', value: 'name' },
            { label: 'Operative From', value: 'award_operative_from' },
            { label: 'Operative To', value: 'award_operative_to' },
            { label: 'Published Year', value: 'published_year' },
            { label: 'Version Number', value: 'version_number' },
          ];
        case 'enterprise_agreements':
          return [
            { label: 'Agreement ID', value: 'agreement_id' },
            { label: 'Agreement Name', value: 'name' },
            { label: 'Organization', value: 'organization' },
            { label: 'Start Date', value: 'start_date' },
            { label: 'End Date', value: 'end_date' },
            { label: 'Document URL', value: 'document_url' },
            { label: 'Status', value: 'status' },
            { label: 'Industry', value: 'industry' },
          ];
        case 'classifications':
          return [
            { label: 'Award ID', value: 'award_fixed_id' },
            { label: 'Classification ID', value: 'classification_fixed_id' },
            { label: 'Classification', value: 'classification' },
            { label: 'Classification Level', value: 'classification_level' },
            { label: 'Base Rate', value: 'base_rate' },
            { label: 'Base Rate Type', value: 'base_rate_type' },
            { label: 'Calculated Rate', value: 'calculated_rate' },
            { label: 'Calculated Rate Type', value: 'calculated_rate_type' },
            { label: 'Clauses', value: 'clauses' },
            { label: 'Operative From', value: 'operative_from' },
            { label: 'Employee Rate Type', value: 'employee_rate_type_code' },
          ];
        case 'pay_rates':
          return [
            { label: 'Award ID', value: 'award_fixed_id' },
            { label: 'Classification ID', value: 'classification_fixed_id' },
            { label: 'Pay Rate ID', value: 'pay_rate_id' },
            { label: 'Rate Amount', value: 'rate_amount' },
            { label: 'Rate Type', value: 'rate_type' },
            { label: 'Effective Date', value: 'effective_date' },
            { label: 'End Date', value: 'end_date' },
            { label: 'Override Amount', value: 'override_amount' },
            { label: 'Override Reason', value: 'override_reason' },
            { label: 'Override Authorized By', value: 'override_authorized_by' },
          ];
        case 'penalties':
          return [
            { label: 'Award ID', value: 'award_fixed_id' },
            { label: 'Penalty ID', value: 'penalty_fixed_id' },
            { label: 'Penalty Rate', value: 'penalty_rate' },
            { label: 'Rate Base', value: 'rate_base' },
            { label: 'Period From', value: 'period_from' },
            { label: 'Period To', value: 'period_to' },
            { label: 'Day of Week', value: 'day_of_week' },
            { label: 'Classification Level', value: 'classification_level' },
            { label: 'Clause Description', value: 'clause_description' },
          ];
        case 'allowances':
          return [
            { label: 'Award ID', value: 'award_fixed_id' },
            { label: 'Allowance ID', value: 'wage_allowance_fixed_id' },
            { label: 'Allowance Name', value: 'allowance' },
            { label: 'Allowance Amount', value: 'allowance_amount' },
            { label: 'Is All Purpose', value: 'is_all_purpose' },
            { label: 'Payment Frequency', value: 'payment_frequency' },
            { label: 'Operative From', value: 'operative_from' },
            { label: 'Operative To', value: 'operative_to' },
            { label: 'Clauses', value: 'clauses' },
          ];
        default:
          return [];
      }
    };
    
    setEntityFields(getEntityFields());
  }, [importForm.watch('entityType')]);

  // Function to read file and generate preview
  const readAndPreviewFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let preview: ImportPreview | null = null;
      
      try {
        // Different parsing based on file type
        if (file.name.endsWith('.csv')) {
          // Simple CSV parsing for preview
          const rows = content.split('\n').filter(row => row.trim().length > 0);
          const headers = rows[0].split(',').map(h => h.trim());
          const sampleData = rows.slice(1, 6).map(row => {
            const values = row.split(',').map(v => v.trim());
            return headers.reduce((obj, header, i) => {
              obj[header] = values[i] || '';
              return obj;
            }, {} as Record<string, string>);
          });
          
          preview = {
            columns: headers,
            sampleRows: sampleData,
          };
          
          // Auto-generate column mapping
          const initialMapping: ColumnMapping[] = headers.map(header => {
            // Try to find matching field
            const matchedField = entityFields.find(field => 
              field.label.toLowerCase() === header.toLowerCase() ||
              field.value.toLowerCase() === header.toLowerCase()
            );
            
            return {
              sourceColumn: header,
              targetField: matchedField?.value || '',
              required: false,
            };
          });
          
          setColumnMapping(initialMapping);
          
        } else if (file.name.endsWith('.json')) {
          // JSON parsing
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            const sampleData = jsonData.slice(0, 5);
            const headers = Object.keys(sampleData[0]);
            
            preview = {
              columns: headers,
              sampleRows: sampleData,
            };
            
            // Auto-generate column mapping
            const initialMapping: ColumnMapping[] = headers.map(header => {
              const matchedField = entityFields.find(field => 
                field.label.toLowerCase() === header.toLowerCase() ||
                field.value.toLowerCase() === header.toLowerCase()
              );
              
              return {
                sourceColumn: header,
                targetField: matchedField?.value || '',
                required: false,
              };
            });
            
            setColumnMapping(initialMapping);
          }
        }
        
        setFilePreview(preview);
        if (preview) {
          setShowMappingDialog(true);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast({
          title: 'Error',
          description: 'Failed to parse file. Please check the file format.',
          variant: 'destructive',
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to read file',
        variant: 'destructive',
      });
    };
    
    // Read the file based on type
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
      // For XLSX, we would normally use a library like xlsx
      // In this demo, we'll just show an error
      toast({
        title: 'Excel Parsing',
        description: 'Excel file parsing would need an additional library in a real application.',
        variant: 'default',
      });
    }
  };
  
  // Handle column mapping updates
  const updateColumnMapping = (index: number, field: keyof ColumnMapping, value: any) => {
    const newMapping = [...columnMapping];
    newMapping[index] = { ...newMapping[index], [field]: value };
    setColumnMapping(newMapping);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Detect file type from extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') {
        importForm.setValue('fileType', 'csv');
        readAndPreviewFile(file);
      } else if (extension === 'json') {
        importForm.setValue('fileType', 'json');
        readAndPreviewFile(file);
      } else if (extension === 'xlsx') {
        importForm.setValue('fileType', 'xlsx');
        // For XLSX, we might use a library like xlsx
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
    
    // Check if column mapping has been applied
    if (data.columnMapping === undefined && columnMapping.length > 0) {
      setShowMappingDialog(true);
      toast({
        title: 'Column Mapping Required',
        description: 'Please map the columns before importing',
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileType', data.fileType);
    formData.append('entityType', data.entityType);
    formData.append('updateExisting', data.updateExisting.toString());
    formData.append('skipErrors', data.skipErrors.toString());
    
    // Add column mapping if available
    if (data.columnMapping) {
      formData.append('columnMapping', JSON.stringify(data.columnMapping));
    }
    
    createImportJobMutation.mutate(formData);
  };

  // Handle column selection for export
  useEffect(() => {
    const entityType = exportForm.getValues('entityType');
    // Get entity fields based on the selected entity type
    // This function could be reused from the import section
    const getEntityFields = () => {
      switch (entityType) {
        case 'apprentices':
          return [
            { label: 'First Name', value: 'firstName' },
            { label: 'Last Name', value: 'lastName' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Date of Birth', value: 'dateOfBirth' },
            { label: 'Address', value: 'address' },
            { label: 'City', value: 'city' },
            { label: 'State', value: 'state' },
            { label: 'Postal Code', value: 'postalCode' },
            { label: 'Country', value: 'country' },
          ];
        case 'host_employers':
          return [
            { label: 'Company Name', value: 'companyName' },
            { label: 'Contact Name', value: 'contactName' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'ABN', value: 'abn' },
            { label: 'Address', value: 'address' },
            { label: 'City', value: 'city' },
            { label: 'State', value: 'state' },
            { label: 'Postal Code', value: 'postalCode' },
            { label: 'Country', value: 'country' },
          ];
        case 'qualifications':
          return [
            { label: 'Code', value: 'code' },
            { label: 'Title', value: 'title' },
            { label: 'AQF Level', value: 'aqfLevel' },
            { label: 'Description', value: 'description' },
            { label: 'Status', value: 'status' },
            { label: 'Release Date', value: 'releaseDate' },
          ];
        default:
          return [];
      }
    };
    
    setEntityFields(getEntityFields());
    // Set default selected columns
    setSelectedColumns(getEntityFields().map(field => field.value));
  }, [exportForm.watch('entityType')]);
  
  const onExportSubmit = (data: ExportFormValues) => {
    // Add selected columns to the export data
    const exportData = {
      ...data,
      columns: selectedColumns,
    };
    createExportJobMutation.mutate(exportData);
  }
  
  // EA file change handler
  const handleEAFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEAFile(file);
      
      // Reset extracted rates when file changes
      setShowExtractedRates(false);
      setExtractedRates([]);
      
      // Show a warning if not a PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Warning',
          description: 'File is not a PDF. Extraction may not work correctly.',
          variant: 'default',
        });
      }
    }
  };
  
  // Extract pay rates from EA file
  const extractPayRates = () => {
    if (!eaFile) return;
    
    const formData = new FormData();
    formData.append('file', eaFile);
    extractPayRatesMutation.mutate(formData);
  };
  
  // Handle EA form submission
  const onEnterpriseAgreementSubmit = (data: EnterpriseAgreementFormValues) => {
    if (!eaFile) {
      toast({
        title: 'Error',
        description: 'Please upload an Enterprise Agreement document',
        variant: 'destructive',
      });
      return;
    }
    
    if (extractedRates.length === 0) {
      toast({
        title: 'Warning',
        description: 'No pay rates were extracted. You can continue but no rates will be associated with this agreement.',
        variant: 'default',
      });
    }
    
    saveEnterpriseAgreementMutation.mutate({
      agreement: data,
      rates: extractedRates
    });
  };;
  
  // Toggle column selection for export
  const toggleColumnSelection = (columnValue: string) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnValue)) {
        return prev.filter(value => value !== columnValue);
      } else {
        return [...prev, columnValue];
      }
    });
  };
  
  // Check if all columns are selected
  const areAllColumnsSelected = () => {
    return entityFields.length > 0 && entityFields.every(field => 
      selectedColumns.includes(field.value)
    );
  };
  
  // Toggle all columns
  const toggleAllColumns = () => {
    if (areAllColumnsSelected()) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(entityFields.map(field => field.value));
    }
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

  // Auto-map columns based on similarity between source column names and target field names
  const autoMapColumns = () => {
    const updatedMapping = [...columnMapping];
    
    columnMapping.forEach((mapping, index) => {
      // Skip columns that are already mapped
      if (mapping.targetField !== '') return;
      
      const sourceColumn = mapping.sourceColumn.toLowerCase();
      
      // Try to find a matching field
      const matchingField = entityFields.find(field => {
        const fieldValue = field.value.toLowerCase();
        const fieldLabel = field.label.toLowerCase();
        
        // Check for exact match or close match
        return (
          sourceColumn === fieldValue || 
          sourceColumn === fieldLabel ||
          sourceColumn.replace(/[_\s-]/g, '') === fieldValue.replace(/[_\s-]/g, '') ||
          sourceColumn.replace(/[_\s-]/g, '') === fieldLabel.replace(/[_\s-]/g, '')
        );
      });
      
      if (matchingField) {
        updatedMapping[index] = {
          ...mapping,
          targetField: matchingField.value,
          // Set required to true for common required fields
          required: ['email', 'firstName', 'lastName', 'code', 'title'].includes(matchingField.value)
        };
      }
    });
    
    setColumnMapping(updatedMapping);
    
    const mappedCount = updatedMapping.filter(m => m.targetField !== '').length;
    toast({
      title: 'Auto-Mapping Applied',
      description: `${mappedCount} columns automatically mapped`,
    });
  };
  
  // Apply column mapping and continue with import
  const applyColumnMapping = () => {
    // Filter out unmapped columns
    const validMapping = columnMapping.filter(mapping => mapping.targetField !== '');
    
    if (validMapping.length === 0) {
      toast({
        title: 'Error',
        description: 'Please map at least one column to continue',
        variant: 'destructive',
      });
      return;
    }
    
    // Add column mapping to form data
    importForm.setValue('columnMapping', validMapping);
    setShowMappingDialog(false);
    
    toast({
      title: 'Column Mapping Applied',
      description: `${validMapping.length} columns mapped successfully`,
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Data Import & Export</h1>

      {/* Column Mapping Dialog */}
      <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Columns className="mr-2 h-5 w-5" />
              Column Mapping
            </DialogTitle>
            <DialogDescription>
              Map columns from your import file to the appropriate fields in the system.
              Required fields must be mapped to proceed.
            </DialogDescription>
          </DialogHeader>
          
          {filePreview && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Table headers preview */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Sample Data Preview</h3>
                <ScrollArea className="h-48 border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {filePreview.columns.map((column) => (
                          <TableHead key={column}>{column}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filePreview.sampleRows.map((row, index) => (
                        <TableRow key={index}>
                          {filePreview.columns.map((column) => (
                            <TableCell key={column}>{row[column]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              
              {/* Column mapping section */}
              <div className="flex-1 overflow-auto">
                <h3 className="text-sm font-medium mb-2">Column Mapping</h3>
                <ScrollArea className="h-64 border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Source Column</TableHead>
                        <TableHead className="w-1/3">Target Field</TableHead>
                        <TableHead className="w-1/6">Required</TableHead>
                        <TableHead className="w-1/6">Transform</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {columnMapping.map((mapping, index) => (
                        <TableRow key={mapping.sourceColumn}>
                          <TableCell>{mapping.sourceColumn}</TableCell>
                          <TableCell>
                            <Select 
                              value={mapping.targetField} 
                              onValueChange={(value) => updateColumnMapping(index, 'targetField', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Skip this column</SelectItem>
                                {entityFields.map((field) => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Switch 
                              checked={mapping.required} 
                              onCheckedChange={(checked) => updateColumnMapping(index, 'required', checked)} 
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={mapping.transform || ''} 
                              onChange={(e) => updateColumnMapping(index, 'transform', e.target.value)} 
                              placeholder="e.g., uppercase" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="secondary" 
                type="button" 
                onClick={autoMapColumns}
                className="mr-2"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Auto-Map Columns
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" type="button" onClick={() => setShowMappingDialog(false)}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={applyColumnMapping} 
                disabled={!columnMapping.some(mapping => mapping.targetField !== '')}
              >
                <Check className="mr-2 h-4 w-4" />
                Apply Mapping
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Enterprise Agreement Upload Dialog */}
      <Dialog open={showEAUploadDialog} onOpenChange={setShowEAUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Upload Enterprise Agreement
            </DialogTitle>
            <DialogDescription>
              Upload an Enterprise Agreement document to extract pay rates. PDF documents work best.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...eaForm}>
            <form onSubmit={eaForm.handleSubmit(onEnterpriseAgreementSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eaForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreement Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Retail Enterprise Agreement 2024" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={eaForm.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. ABC Retail Pty Ltd" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eaForm.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={eaForm.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={eaForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Retail" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={eaForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="p-4 border rounded-md">
                <Label htmlFor="ea-file" className="block mb-2">Upload Enterprise Agreement Document</Label>
                <Input
                  id="ea-file"
                  type="file"
                  onChange={handleEAFileChange}
                  accept=".pdf,.docx,.doc,.txt"
                  className="mb-2"
                />
                {eaFile && (
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-muted-foreground">{eaFile.name} ({Math.round(eaFile.size / 1024)} KB)</p>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="secondary" 
                      onClick={extractPayRates}
                      disabled={isExtracting}
                    >
                      <Wand2 className="h-4 w-4 mr-2" />
                      Extract Pay Rates
                    </Button>
                  </div>
                )}
              </div>
              
              {isExtracting && (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Extracting pay rates...</span>
                </div>
              )}
              
              {showExtractedRates && extractedRates.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">Extracted Pay Rates</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classification</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Effective Date</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extractedRates.map((rate, index) => (
                        <TableRow key={index}>
                          <TableCell>{rate.classification}</TableCell>
                          <TableCell>${rate.rate.toFixed(2)}</TableCell>
                          <TableCell>{rate.effective_date}</TableCell>
                          <TableCell>{rate.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEAUploadDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isExtracting || !eaFile}>
                  Save Agreement
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
                              {Object.entries(entityGroups).map(([groupName, groupValues]) => (
                                <>
                                  <SelectLabel className="text-sm font-bold text-gray-500">{groupName}</SelectLabel>
                                  {entityOptions
                                    .filter(option => groupValues.includes(option.value))
                                    .map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  <SelectSeparator className="my-1" />
                                </>
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

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      type="submit" 
                      disabled={!selectedFile || isUploading || createImportJobMutation.isPending}
                    >
                      {isUploading || createImportJobMutation.isPending ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin">⌛</span>
                          {isUploading ? 'Uploading...' : 'Importing...'}
                        </>
                      ) : (
                        <>
                          <FilePlus className="mr-2 h-4 w-4" />
                          Start Import
                        </>
                      )}
                    </Button>
                    
                    {selectedFile && columnMapping.length > 0 && !importForm.getValues('columnMapping') && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowMappingDialog(true)}
                      >
                        <Columns className="mr-2 h-4 w-4" />
                        Configure Column Mapping
                      </Button>
                    )}
                  </div>
                  
                  {/* Enterprise Agreement upload section */}
                  {importForm.watch('entityType') === 'enterprise_agreements' && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/30">
                      <h3 className="text-md font-medium mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Enterprise Agreement Special Upload
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enterprise Agreements require special handling to extract pay rates from documents.
                        Use this tool to upload and extract data from Enterprise Agreement documents.
                      </p>
                      <Button 
                        type="button" 
                        onClick={() => setShowEAUploadDialog(true)} 
                        variant="secondary"
                      >
                        <FileUp className="mr-2 h-4 w-4" />
                        Upload Enterprise Agreement
                      </Button>
                    </div>
                  )}
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

                  {/* Column selection section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">Select Columns to Export</div>
                      <div className="flex items-center">
                        <Checkbox
                          id="select-all-columns"
                          checked={areAllColumnsSelected()}
                          onCheckedChange={toggleAllColumns}
                        />
                        <Label htmlFor="select-all-columns" className="ml-2 text-sm font-medium">
                          Select All
                        </Label>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {entityFields.map((field) => (
                          <div key={field.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`column-${field.value}`}
                              checked={selectedColumns.includes(field.value)}
                              onCheckedChange={() => toggleColumnSelection(field.value)}
                            />
                            <Label 
                              htmlFor={`column-${field.value}`} 
                              className="text-sm font-medium truncate"
                            >
                              {field.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {selectedColumns.length === 0 && (
                      <div className="text-destructive text-sm">
                        Please select at least one column to export
                      </div>
                    )}
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

                  <Button 
                    type="submit" 
                    className="mt-4" 
                    disabled={createExportJobMutation.isPending || selectedColumns.length === 0}
                  >
                    {createExportJobMutation.isPending ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin">⌛</span>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="mr-2 h-4 w-4" />
                        Export Data
                      </>
                    )}
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
