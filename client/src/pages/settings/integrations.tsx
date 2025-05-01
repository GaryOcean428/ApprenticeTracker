import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Link, 
  ExternalLink, 
  Webhook, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  CloudCog, 
  Database, 
  MailCheck,
  FileText
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface Integration {
  id: number;
  name: string;
  provider: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastSynced: string | null;
  apiKey: string | null;
  apiUrl: string | null;
  config: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

const fairWorkSchema = z.object({
  apiKey: z.string().min(1, { message: 'API Key is required' }),
  apiUrl: z.string().url({ message: 'Must be a valid URL' }),
  enabled: z.boolean().default(false),
  syncAwards: z.boolean().default(true),
  syncPayRates: z.boolean().default(true),
  syncHolidays: z.boolean().default(true),
});

const emailServiceSchema = z.object({
  provider: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses']),
  apiKey: z.string().min(1, { message: 'API Key is required' }),
  from: z.string().email({ message: 'Must be a valid email address' }),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  enabled: z.boolean().default(false),
});

const smsServiceSchema = z.object({
  provider: z.enum(['twilio', 'messagebird', 'sns']),
  accountSid: z.string().min(1, { message: 'Account SID is required' }).optional(),
  authToken: z.string().min(1, { message: 'Auth Token is required' }).optional(),
  apiKey: z.string().min(1, { message: 'API Key is required' }).optional(),
  from: z.string().min(1, { message: 'From number is required' }),
  enabled: z.boolean().default(false),
});

const webhookSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  url: z.string().url({ message: 'Must be a valid URL' }),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1, { message: 'Select at least one event' }),
  enabled: z.boolean().default(true),
});

const documentServiceSchema = z.object({
  provider: z.enum(['local', 's3', 'gcs', 'azure']),
  apiKey: z.string().optional(),
  secretKey: z.string().optional(),
  bucketName: z.string().optional(),
  region: z.string().optional(),
  baseUrl: z.string().optional(),
  enabled: z.boolean().default(false),
});

type FairWorkFormValues = z.infer<typeof fairWorkSchema>;
type EmailServiceFormValues = z.infer<typeof emailServiceSchema>;
type SmsServiceFormValues = z.infer<typeof smsServiceSchema>;
type WebhookFormValues = z.infer<typeof webhookSchema>;
type DocumentServiceFormValues = z.infer<typeof documentServiceSchema>;

const IntegrationCard = ({ integration, onTestConnection, onSync, onEdit, onToggle }: {
  integration: Integration;
  onTestConnection: (id: number) => void;
  onSync: (id: number) => void;
  onEdit: (integration: Integration) => void;
  onToggle: (id: number, enabled: boolean) => void;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {integration.name}
            <Badge variant={integration.status === 'active' ? 'success' : 
                           integration.status === 'error' ? 'destructive' : 
                           'outline'}>
              {integration.status === 'active' ? 'Active' : 
               integration.status === 'error' ? 'Error' : 
               'Inactive'}
            </Badge>
          </div>
          <Switch
            checked={integration.status === 'active'}
            onCheckedChange={(checked) => onToggle(integration.id, checked)}
          />
        </CardTitle>
        <CardDescription>
          {integration.provider} ({integration.type})
          {integration.lastSynced && (
            <div className="text-xs mt-1">Last synced: {new Date(integration.lastSynced).toLocaleString()}</div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onTestConnection(integration.id)}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Test Connection
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSync(integration.id)}>
            <RefreshCw className="h-4 w-4 mr-1" /> Sync
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(integration)}>
            <Link className="h-4 w-4 mr-1" /> Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const IntegrationsManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('api');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showFairWorkConfig, setShowFairWorkConfig] = useState(false);
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [showSmsConfig, setShowSmsConfig] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [showDocumentConfig, setShowDocumentConfig] = useState(false);

  // Fair Work Integration form
  const fairWorkForm = useForm<FairWorkFormValues>({
    resolver: zodResolver(fairWorkSchema),
    defaultValues: {
      apiKey: '',
      apiUrl: 'https://api.fairwork.gov.au/v1',
      enabled: false,
      syncAwards: true,
      syncPayRates: true,
      syncHolidays: true,
    },
  });

  // Email Service form
  const emailServiceForm = useForm<EmailServiceFormValues>({
    resolver: zodResolver(emailServiceSchema),
    defaultValues: {
      provider: 'smtp',
      apiKey: '',
      from: 'noreply@example.com',
      smtpHost: '',
      smtpPort: '587',
      smtpUsername: '',
      smtpPassword: '',
      enabled: false,
    },
  });

  // SMS Service form
  const smsServiceForm = useForm<SmsServiceFormValues>({
    resolver: zodResolver(smsServiceSchema),
    defaultValues: {
      provider: 'twilio',
      accountSid: '',
      authToken: '',
      apiKey: '',
      from: '',
      enabled: false,
    },
  });

  // Webhook form
  const webhookForm = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: '',
      url: '',
      secret: '',
      events: [],
      enabled: true,
    },
  });

  // Document Service form
  const documentServiceForm = useForm<DocumentServiceFormValues>({
    resolver: zodResolver(documentServiceSchema),
    defaultValues: {
      provider: 'local',
      apiKey: '',
      secretKey: '',
      bucketName: '',
      region: '',
      baseUrl: '',
      enabled: false,
    },
  });

  // Fetch integrations
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery<Integration[]>({
    queryKey: ['/api/integrations'],
    // Temporarily handle mock data until API is implemented
    queryFn: async () => {
      // This is a fallback for development. In production, the actual API endpoint would be called.
      return [
        {
          id: 1,
          name: 'Fair Work Australia',
          provider: 'Fair Work',
          type: 'api',
          status: 'inactive',
          lastSynced: null,
          apiKey: null,
          apiUrl: 'https://api.fairwork.gov.au/v1',
          config: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Email Service',
          provider: 'SMTP',
          type: 'notification',
          status: 'active',
          lastSynced: new Date().toISOString(),
          apiKey: null,
          apiUrl: null,
          config: {
            smtpHost: 'smtp.example.com',
            smtpPort: 587,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: 'Document Storage',
          provider: 'Local Storage',
          type: 'storage',
          status: 'active',
          lastSynced: null,
          apiKey: null,
          apiUrl: null,
          config: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    },
  });

  // Save Fair Work Integration
  const saveFairWorkMutation = useMutation({
    mutationFn: async (data: FairWorkFormValues) => {
      const response = await apiRequest('POST', '/api/integrations/fairwork', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setShowFairWorkConfig(false);
      toast({
        title: 'Success',
        description: 'Fair Work integration saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Save Email Service
  const saveEmailServiceMutation = useMutation({
    mutationFn: async (data: EmailServiceFormValues) => {
      const response = await apiRequest('POST', '/api/integrations/email', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setShowEmailConfig(false);
      toast({
        title: 'Success',
        description: 'Email service integration saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Save SMS Service
  const saveSmsServiceMutation = useMutation({
    mutationFn: async (data: SmsServiceFormValues) => {
      const response = await apiRequest('POST', '/api/integrations/sms', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setShowSmsConfig(false);
      toast({
        title: 'Success',
        description: 'SMS service integration saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Save Webhook
  const saveWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormValues) => {
      const response = await apiRequest('POST', '/api/integrations/webhooks', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setShowWebhookConfig(false);
      toast({
        title: 'Success',
        description: 'Webhook saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save webhook: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Save Document Service
  const saveDocumentServiceMutation = useMutation({
    mutationFn: async (data: DocumentServiceFormValues) => {
      const response = await apiRequest('POST', '/api/integrations/documents', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setShowDocumentConfig(false);
      toast({
        title: 'Success',
        description: 'Document service integration saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Test Integration Connection
  const testConnectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/integrations/${id}/test`);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Connection Test',
        description: data.success ? 'Connection successful!' : `Connection failed: ${data.message}`,
        variant: data.success ? 'default' : 'destructive',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Connection test failed: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Sync Integration
  const syncIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/integrations/${id}/sync`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({
        title: 'Success',
        description: 'Integration synchronized successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Synchronization failed: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Toggle Integration Status
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: number; enabled: boolean }) => {
      const response = await apiRequest('PATCH', `/api/integrations/${id}`, { status: enabled ? 'active' : 'inactive' });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({
        title: 'Success',
        description: 'Integration status updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update status: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSaveFairWork = (data: FairWorkFormValues) => {
    saveFairWorkMutation.mutate(data);
  };

  const handleSaveEmailService = (data: EmailServiceFormValues) => {
    saveEmailServiceMutation.mutate(data);
  };

  const handleSaveSmsService = (data: SmsServiceFormValues) => {
    saveSmsServiceMutation.mutate(data);
  };

  const handleSaveWebhook = (data: WebhookFormValues) => {
    saveWebhookMutation.mutate(data);
  };

  const handleSaveDocumentService = (data: DocumentServiceFormValues) => {
    saveDocumentServiceMutation.mutate(data);
  };

  const handleTestConnection = (id: number) => {
    testConnectionMutation.mutate(id);
  };

  const handleSync = (id: number) => {
    syncIntegrationMutation.mutate(id);
  };

  const handleToggleIntegration = (id: number, enabled: boolean) => {
    toggleIntegrationMutation.mutate({ id, enabled });
  };

  const handleEditIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    
    // Set the appropriate form values based on integration type
    if (integration.name === 'Fair Work Australia') {
      fairWorkForm.reset({
        apiKey: integration.apiKey || '',
        apiUrl: integration.apiUrl || 'https://api.fairwork.gov.au/v1',
        enabled: integration.status === 'active',
        syncAwards: integration.config?.syncAwards ?? true,
        syncPayRates: integration.config?.syncPayRates ?? true,
        syncHolidays: integration.config?.syncHolidays ?? true,
      });
      setShowFairWorkConfig(true);
    } else if (integration.name === 'Email Service') {
      const config = integration.config || {};
      emailServiceForm.reset({
        provider: config.provider || 'smtp',
        apiKey: integration.apiKey || '',
        from: config.from || 'noreply@example.com',
        smtpHost: config.smtpHost || '',
        smtpPort: config.smtpPort?.toString() || '587',
        smtpUsername: config.smtpUsername || '',
        smtpPassword: config.smtpPassword || '',
        enabled: integration.status === 'active',
      });
      setShowEmailConfig(true);
    } else if (integration.name === 'Document Storage') {
      const config = integration.config || {};
      documentServiceForm.reset({
        provider: config.provider || 'local',
        apiKey: integration.apiKey || '',
        secretKey: config.secretKey || '',
        bucketName: config.bucketName || '',
        region: config.region || '',
        baseUrl: config.baseUrl || '',
        enabled: integration.status === 'active',
      });
      setShowDocumentConfig(true);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Integrations Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="api">
            <CloudCog className="h-4 w-4 mr-2" /> API Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <MailCheck className="h-4 w-4 mr-2" /> Notification Services
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Database className="h-4 w-4 mr-2" /> Storage Services
          </TabsTrigger>
        </TabsList>
        
        {/* API Integrations Tab */}
        <TabsContent value="api">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">API Integrations</h2>
              <Button onClick={() => {
                fairWorkForm.reset();
                setShowFairWorkConfig(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Add Integration
              </Button>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                API keys are sensitive. Never share them publicly and store them securely.
              </AlertDescription>
            </Alert>
            
            {isLoadingIntegrations ? (
              <div className="text-center py-8">Loading integrations...</div>
            ) : integrations && integrations.filter(i => i.type === 'api').length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {integrations
                  .filter(i => i.type === 'api')
                  .map(integration => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onTestConnection={handleTestConnection}
                      onSync={handleSync}
                      onEdit={handleEditIntegration}
                      onToggle={handleToggleIntegration}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg p-6 bg-muted/10">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CloudCog className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No API Integrations</h3>
                <p className="text-muted-foreground mb-4">Connect external APIs to enhance your system capabilities.</p>
                <Button onClick={() => {
                  fairWorkForm.reset();
                  setShowFairWorkConfig(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add API Integration
                </Button>
              </div>
            )}
            
            {showFairWorkConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedIntegration ? 'Edit' : 'Add'} Fair Work Integration</CardTitle>
                  <CardDescription>
                    Connect to Fair Work Australia's API for award information and compliance checking.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...fairWorkForm}>
                    <form onSubmit={fairWorkForm.handleSubmit(handleSaveFairWork)} className="space-y-4">
                      <FormField
                        control={fairWorkForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your Fair Work API key" {...field} />
                            </FormControl>
                            <FormDescription>
                              Obtain from the Fair Work Developer Portal
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fairWorkForm.control}
                        name="apiUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://api.fairwork.gov.au/v1" {...field} />
                            </FormControl>
                            <FormDescription>
                              The base URL for Fair Work API requests
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fairWorkForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Integration</FormLabel>
                              <FormDescription>
                                Turn on/off the Fair Work integration
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Sync Options</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <FormField
                            control={fairWorkForm.control}
                            name="syncAwards"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Sync Awards
                                  </FormLabel>
                                  <FormDescription>
                                    Automatically sync awards data
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={fairWorkForm.control}
                            name="syncPayRates"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Sync Pay Rates
                                  </FormLabel>
                                  <FormDescription>
                                    Automatically sync pay rate data
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={fairWorkForm.control}
                            name="syncHolidays"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Sync Holidays
                                  </FormLabel>
                                  <FormDescription>
                                    Automatically sync public holidays
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <CardFooter className="px-0 pb-0 pt-6 flex gap-2">
                        <Button variant="outline" type="button" onClick={() => setShowFairWorkConfig(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {selectedIntegration ? 'Update' : 'Add'} Integration
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Notification Services Tab */}
        <TabsContent value="notifications">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Notification Services</h2>
              <div className="space-x-2">
                <Button onClick={() => {
                  emailServiceForm.reset();
                  setShowEmailConfig(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Email Service
                </Button>
                <Button onClick={() => {
                  smsServiceForm.reset();
                  setShowSmsConfig(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> SMS Service
                </Button>
              </div>
            </div>
            
            {isLoadingIntegrations ? (
              <div className="text-center py-8">Loading notification services...</div>
            ) : integrations && integrations.filter(i => i.type === 'notification').length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {integrations
                  .filter(i => i.type === 'notification')
                  .map(integration => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onTestConnection={handleTestConnection}
                      onSync={handleSync}
                      onEdit={handleEditIntegration}
                      onToggle={handleToggleIntegration}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg p-6 bg-muted/10">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MailCheck className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Notification Services</h3>
                <p className="text-muted-foreground mb-4">Configure email and SMS providers to send notifications.</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => {
                    emailServiceForm.reset();
                    setShowEmailConfig(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Email Service
                  </Button>
                  <Button onClick={() => {
                    smsServiceForm.reset();
                    setShowSmsConfig(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> SMS Service
                  </Button>
                </div>
              </div>
            )}
            
            {showEmailConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedIntegration ? 'Edit' : 'Add'} Email Service</CardTitle>
                  <CardDescription>
                    Configure the email service provider for sending system notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...emailServiceForm}>
                    <form onSubmit={emailServiceForm.handleSubmit(handleSaveEmailService)} className="space-y-4">
                      <FormField
                        control={emailServiceForm.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Provider</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select email provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="smtp">SMTP Server</SelectItem>
                                <SelectItem value="sendgrid">SendGrid</SelectItem>
                                <SelectItem value="mailgun">Mailgun</SelectItem>
                                <SelectItem value="ses">Amazon SES</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The email provider to use for sending emails
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {emailServiceForm.watch('provider') !== 'smtp' ? (
                        <FormField
                          control={emailServiceForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                API key for the selected email provider
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={emailServiceForm.control}
                            name="smtpHost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Host</FormLabel>
                                <FormControl>
                                  <Input placeholder="smtp.example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailServiceForm.control}
                            name="smtpPort"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Port</FormLabel>
                                <FormControl>
                                  <Input placeholder="587" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailServiceForm.control}
                            name="smtpUsername"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Username</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={emailServiceForm.control}
                            name="smtpPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      <FormField
                        control={emailServiceForm.control}
                        name="from"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <FormControl>
                              <Input placeholder="noreply@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              The email address that will appear in the From field
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailServiceForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Email Service</FormLabel>
                              <FormDescription>
                                Turn on/off this email provider
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <CardFooter className="px-0 pb-0 pt-6 flex gap-2">
                        <Button variant="outline" type="button" onClick={() => setShowEmailConfig(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {selectedIntegration ? 'Update' : 'Add'} Email Service
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            
            {showSmsConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedIntegration ? 'Edit' : 'Add'} SMS Service</CardTitle>
                  <CardDescription>
                    Configure the SMS service provider for sending text notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...smsServiceForm}>
                    <form onSubmit={smsServiceForm.handleSubmit(handleSaveSmsService)} className="space-y-4">
                      <FormField
                        control={smsServiceForm.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMS Provider</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select SMS provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="twilio">Twilio</SelectItem>
                                <SelectItem value="messagebird">MessageBird</SelectItem>
                                <SelectItem value="sns">Amazon SNS</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The SMS provider to use for sending text messages
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {smsServiceForm.watch('provider') === 'twilio' && (
                        <>
                          <FormField
                            control={smsServiceForm.control}
                            name="accountSid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account SID</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  Twilio Account SID
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={smsServiceForm.control}
                            name="authToken"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Auth Token</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Twilio Auth Token
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      
                      {smsServiceForm.watch('provider') !== 'twilio' && (
                        <FormField
                          control={smsServiceForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                API key for the selected SMS provider
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={smsServiceForm.control}
                        name="from"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+61412345678" {...field} />
                            </FormControl>
                            <FormDescription>
                              The phone number that will appear as the sender
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={smsServiceForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable SMS Service</FormLabel>
                              <FormDescription>
                                Turn on/off this SMS provider
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <CardFooter className="px-0 pb-0 pt-6 flex gap-2">
                        <Button variant="outline" type="button" onClick={() => setShowSmsConfig(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {selectedIntegration ? 'Update' : 'Add'} SMS Service
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Webhooks</h2>
              <Button onClick={() => {
                webhookForm.reset();
                setShowWebhookConfig(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Add Webhook
              </Button>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Webhook Security</AlertTitle>
              <AlertDescription>
                Webhooks send data to external endpoints. Ensure these endpoints are secure and use the webhook secret for verification.
              </AlertDescription>
            </Alert>
            
            {/* Webhook form goes here */}
            {showWebhookConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedIntegration ? 'Edit' : 'Add'} Webhook</CardTitle>
                  <CardDescription>
                    Configure an endpoint to receive event notifications from the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...webhookForm}>
                    <form onSubmit={webhookForm.handleSubmit(handleSaveWebhook)} className="space-y-4">
                      <FormField
                        control={webhookForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Application Webhook" {...field} />
                            </FormControl>
                            <FormDescription>
                              A descriptive name for this webhook
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endpoint URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/webhook" {...field} />
                            </FormControl>
                            <FormDescription>
                              The URL that will receive webhook payloads
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={webhookForm.control}
                        name="secret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook Secret</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional: Used to verify webhook payloads" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Used to sign payloads. Keep this value secret.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2">
                        <FormLabel>Events to Subscribe</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="user.created"
                              value="user.created"
                              onChange={(e) => {
                                const events = webhookForm.getValues('events') || [];
                                if (e.target.checked) {
                                  webhookForm.setValue('events', [...events, e.target.value]);
                                } else {
                                  webhookForm.setValue('events', events.filter(event => event !== e.target.value));
                                }
                              }}
                            />
                            <label htmlFor="user.created">User Created</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="apprentice.created"
                              value="apprentice.created"
                              onChange={(e) => {
                                const events = webhookForm.getValues('events') || [];
                                if (e.target.checked) {
                                  webhookForm.setValue('events', [...events, e.target.value]);
                                } else {
                                  webhookForm.setValue('events', events.filter(event => event !== e.target.value));
                                }
                              }}
                            />
                            <label htmlFor="apprentice.created">Apprentice Created</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="contract.signed"
                              value="contract.signed"
                              onChange={(e) => {
                                const events = webhookForm.getValues('events') || [];
                                if (e.target.checked) {
                                  webhookForm.setValue('events', [...events, e.target.value]);
                                } else {
                                  webhookForm.setValue('events', events.filter(event => event !== e.target.value));
                                }
                              }}
                            />
                            <label htmlFor="contract.signed">Contract Signed</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="compliance.alert"
                              value="compliance.alert"
                              onChange={(e) => {
                                const events = webhookForm.getValues('events') || [];
                                if (e.target.checked) {
                                  webhookForm.setValue('events', [...events, e.target.value]);
                                } else {
                                  webhookForm.setValue('events', events.filter(event => event !== e.target.value));
                                }
                              }}
                            />
                            <label htmlFor="compliance.alert">Compliance Alert</label>
                          </div>
                        </div>
                        {webhookForm.formState.errors.events && (
                          <p className="text-sm font-medium text-destructive">{webhookForm.formState.errors.events.message}</p>
                        )}
                      </div>
                      
                      <FormField
                        control={webhookForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Webhook</FormLabel>
                              <FormDescription>
                                Activate this webhook to start receiving events
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <CardFooter className="px-0 pb-0 pt-6 flex gap-2">
                        <Button variant="outline" type="button" onClick={() => setShowWebhookConfig(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {selectedIntegration ? 'Update' : 'Add'} Webhook
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Storage Services Tab */}
        <TabsContent value="storage">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Storage Services</h2>
              <Button onClick={() => {
                documentServiceForm.reset();
                setShowDocumentConfig(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Add Storage Service
              </Button>
            </div>
            
            {isLoadingIntegrations ? (
              <div className="text-center py-8">Loading storage services...</div>
            ) : integrations && integrations.filter(i => i.type === 'storage').length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {integrations
                  .filter(i => i.type === 'storage')
                  .map(integration => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      onTestConnection={handleTestConnection}
                      onSync={handleSync}
                      onEdit={handleEditIntegration}
                      onToggle={handleToggleIntegration}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg p-6 bg-muted/10">
                <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Storage Services</h3>
                <p className="text-muted-foreground mb-4">Configure document storage providers for your system.</p>
                <Button onClick={() => {
                  documentServiceForm.reset();
                  setShowDocumentConfig(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Storage Service
                </Button>
              </div>
            )}
            
            {showDocumentConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedIntegration ? 'Edit' : 'Add'} Document Storage</CardTitle>
                  <CardDescription>
                    Configure where documents and files will be stored in the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...documentServiceForm}>
                    <form onSubmit={documentServiceForm.handleSubmit(handleSaveDocumentService)} className="space-y-4">
                      <FormField
                        control={documentServiceForm.control}
                        name="provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Storage Provider</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select storage provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="local">Local Storage</SelectItem>
                                <SelectItem value="s3">Amazon S3</SelectItem>
                                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                                <SelectItem value="azure">Azure Blob Storage</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Where to store uploaded documents and files
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {documentServiceForm.watch('provider') !== 'local' && (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={documentServiceForm.control}
                              name="apiKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>API Key / Access Key</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={documentServiceForm.control}
                              name="secretKey"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Secret Key</FormLabel>
                                  <FormControl>
                                    <Input type="password" {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={documentServiceForm.control}
                              name="bucketName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bucket Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormDescription>
                                    Storage bucket or container name
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={documentServiceForm.control}
                              name="region"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Region</FormLabel>
                                  <FormControl>
                                    <Input placeholder="ap-southeast-2" {...field} value={field.value || ''} />
                                  </FormControl>
                                  <FormDescription>
                                    Storage service region
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={documentServiceForm.control}
                            name="baseUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/files" {...field} value={field.value || ''} />
                                </FormControl>
                                <FormDescription>
                                  Custom URL for accessing files (if using CDN)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      
                      <FormField
                        control={documentServiceForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Storage Service</FormLabel>
                              <FormDescription>
                                Turn on/off this storage provider
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <CardFooter className="px-0 pb-0 pt-6 flex gap-2">
                        <Button variant="outline" type="button" onClick={() => setShowDocumentConfig(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {selectedIntegration ? 'Update' : 'Add'} Storage Service
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsManagement;