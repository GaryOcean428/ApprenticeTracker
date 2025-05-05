import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Check, Cloud, Database, Edit, ExternalLink, FileText, Globe, HardDrive, Plus, Server, Settings, Trash2, Webhook } from 'lucide-react';

// API Integration schema
const apiIntegrationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.string(),
  baseUrl: z.string().url('Must be a valid URL'),
  apiKey: z.string().min(1, 'API key is required'),
  apiKeyHeader: z.string().min(1, 'API key header name is required'),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

// Webhook schema
const webhookSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
  isActive: z.boolean().default(true),
});

// Document storage schema
const documentStorageSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  type: z.string(),
  config: z.record(z.string()).optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

// Interface definitions
interface Integration {
  id: number;
  name: string;
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiIntegration extends Integration {
  baseUrl: string;
  apiKey: string;
  apiKeyHeader: string;
}

// Type guard for API integration
function isApiIntegration(integration: Integration): integration is ApiIntegration {
  return 'baseUrl' in integration && 'apiKey' in integration;
}

interface WebhookIntegration extends Integration {
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
}

// Type guard for webhook integration
function isWebhookIntegration(integration: Integration): integration is WebhookIntegration {
  return 'url' in integration && 'events' in integration;
}

interface StorageIntegration extends Integration {
  isDefault: boolean;
}

// Type guard for storage integration
function isStorageIntegration(integration: Integration): integration is StorageIntegration {
  return integration.type === 's3' || integration.type === 'local';
}

type ApiIntegrationFormValues = z.infer<typeof apiIntegrationSchema>;
type WebhookFormValues = z.infer<typeof webhookSchema>;
type DocumentStorageFormValues = z.infer<typeof documentStorageSchema>;

const IntegrationCard = ({ 
  integration, 
  onEdit, 
  onDelete, 
  onToggleActive
}: { 
  integration: Integration; 
  onEdit: (integration: Integration) => void; 
  onDelete: (id: number) => void; 
  onToggleActive: (id: number, isActive: boolean) => void; 
}) => {
  const getIconByType = (type: string) => {
    switch (type) {
      case 'tga':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'fairwork':
        return <Globe className="h-6 w-6 text-green-500" />;
      case 'sms':
        return <FileText className="h-6 w-6 text-orange-500" />;
      case 'rto':
        return <FileText className="h-6 w-6 text-purple-500" />;
      case 'webhook':
        return <Webhook className="h-6 w-6 text-red-500" />;
      case 's3':
        return <Cloud className="h-6 w-6 text-blue-400" />;
      case 'local':
        return <HardDrive className="h-6 w-6 text-gray-500" />;
      default:
        return <Server className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {getIconByType(integration.type)}
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription className="text-sm">
                {integration.type === 'webhook' ? 'Webhook' : 
                 integration.type === 's3' || integration.type === 'local' ? 'Storage Service' : 
                 'API Integration'}
              </CardDescription>
            </div>
          </div>
          <div>
            {integration.isActive ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {isWebhookIntegration(integration) && (
          <div className="text-sm mb-2 flex items-center gap-1">
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{integration.url}</span>
          </div>
        )}
        {isApiIntegration(integration) && (
          <div className="text-sm mb-2 flex items-center gap-1">
            <Globe className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{integration.baseUrl}</span>
          </div>
        )}
        {isWebhookIntegration(integration) && integration.events.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {integration.events.map((event) => (
              <Badge key={event} variant="outline" className="text-xs">
                {event}
              </Badge>
            ))}
          </div>
        )}
        {isStorageIntegration(integration) && integration.isDefault && (
          <Badge className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Default Storage</Badge>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleActive(integration.id, !integration.isActive)}
        >
          {integration.isActive ? (
            <><AlertTriangle className="h-4 w-4 mr-1" /> Disable</>
          ) : (
            <><Check className="h-4 w-4 mr-1" /> Enable</>
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(integration)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => onDelete(integration.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

const IntegrationsSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('api');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [showDocumentConfig, setShowDocumentConfig] = useState(false);

  // Forms
  const apiForm = useForm<ApiIntegrationFormValues>({
    resolver: zodResolver(apiIntegrationSchema),
    defaultValues: {
      name: '',
      type: 'custom',
      baseUrl: '',
      apiKey: '',
      apiKeyHeader: 'X-API-Key',
      isActive: true,
      description: '',
    },
  });

  const webhookForm = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: '',
      url: '',
      events: [],
      secret: '',
      headers: {},
      isActive: true,
    },
  });

  const documentServiceForm = useForm<DocumentStorageFormValues>({
    resolver: zodResolver(documentStorageSchema),
    defaultValues: {
      name: '',
      type: 'local',
      config: {},
      isActive: true,
      isDefault: false,
    },
  });

  // Query for integrations
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery<Integration[]>({
    queryKey: ['/api/integrations'],
  });

  // Create API integration mutation
  const createApiIntegrationMutation = useMutation({
    mutationFn: async (data: ApiIntegrationFormValues) => {
      const response = await apiRequest('POST', '/api/integrations/api', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      apiForm.reset();
      setShowApiConfig(false);
      toast({
        title: 'Success',
        description: 'API integration created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create API integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update API integration mutation
  const updateApiIntegrationMutation = useMutation({
    mutationFn: async (data: { id: number; integrationData: ApiIntegrationFormValues }) => {
      const response = await apiRequest('PATCH', `/api/integrations/${data.id}`, data.integrationData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      apiForm.reset();
      setSelectedIntegration(null);
      setShowApiConfig(false);
      toast({
        title: 'Success',
        description: 'API integration updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update API integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: async (data: WebhookFormValues) => {
      const response = await apiRequest('POST', '/api/integrations/webhook', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      webhookForm.reset();
      setShowWebhookConfig(false);
      toast({
        title: 'Success',
        description: 'Webhook created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create webhook: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update webhook mutation
  const updateWebhookMutation = useMutation({
    mutationFn: async (data: { id: number; webhookData: WebhookFormValues }) => {
      const response = await apiRequest('PATCH', `/api/integrations/${data.id}`, data.webhookData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      webhookForm.reset();
      setSelectedIntegration(null);
      setShowWebhookConfig(false);
      toast({
        title: 'Success',
        description: 'Webhook updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update webhook: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Create document storage mutation
  const createDocumentStorageMutation = useMutation({
    mutationFn: async (data: DocumentStorageFormValues) => {
      const response = await apiRequest('POST', '/api/integrations/storage', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      documentServiceForm.reset();
      setShowDocumentConfig(false);
      toast({
        title: 'Success',
        description: 'Document storage service created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create document storage service: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update document storage mutation
  const updateDocumentStorageMutation = useMutation({
    mutationFn: async (data: { id: number; storageData: DocumentStorageFormValues }) => {
      const response = await apiRequest('PATCH', `/api/integrations/${data.id}`, data.storageData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      documentServiceForm.reset();
      setSelectedIntegration(null);
      setShowDocumentConfig(false);
      toast({
        title: 'Success',
        description: 'Document storage service updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update document storage service: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete integration mutation
  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      toast({
        title: 'Success',
        description: 'Integration deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete integration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Toggle integration active status mutation
  const toggleIntegrationMutation = useMutation({
    mutationFn: async (data: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/integrations/${data.id}/toggle`, { isActive: data.isActive });
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
        description: `Failed to update integration status: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submissions
  const onApiSubmit = (data: ApiIntegrationFormValues) => {
    if (selectedIntegration) {
      updateApiIntegrationMutation.mutate({ id: selectedIntegration.id, integrationData: data });
    } else {
      createApiIntegrationMutation.mutate(data);
    }
  };

  const onWebhookSubmit = (data: WebhookFormValues) => {
    if (selectedIntegration) {
      updateWebhookMutation.mutate({ id: selectedIntegration.id, webhookData: data });
    } else {
      createWebhookMutation.mutate(data);
    }
  };

  const onDocumentStorageSubmit = (data: DocumentStorageFormValues) => {
    if (selectedIntegration) {
      updateDocumentStorageMutation.mutate({ id: selectedIntegration.id, storageData: data });
    } else {
      createDocumentStorageMutation.mutate(data);
    }
  };

  // Handle edit integration
  const handleEditIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);

    if (isWebhookIntegration(integration)) {
      webhookForm.reset({
        name: integration.name,
        url: integration.url,
        events: integration.events || [],
        secret: integration.secret || '',
        headers: integration.headers || {},
        isActive: integration.isActive,
      });
      setShowWebhookConfig(true);
    } else if (isStorageIntegration(integration)) {
      documentServiceForm.reset({
        name: integration.name,
        type: integration.type,
        config: integration.config || {},
        isActive: integration.isActive,
        isDefault: integration.isDefault || false,
      });
      setShowDocumentConfig(true);
    } else if (isApiIntegration(integration)) {
      apiForm.reset({
        name: integration.name,
        type: integration.type,
        baseUrl: integration.baseUrl,
        apiKey: integration.apiKey,
        apiKeyHeader: integration.apiKeyHeader,
        isActive: integration.isActive,
        description: integration.config?.description || '',
      });
      setShowApiConfig(true);
    }
  };

  // Handle delete integration
  const handleDeleteIntegration = (id: number) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      deleteIntegrationMutation.mutate(id);
    }
  };

  // Handle toggle integration active status
  const handleToggleIntegration = (id: number, isActive: boolean) => {
    toggleIntegrationMutation.mutate({ id, isActive });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">External Integrations</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="api">
            <Settings className="h-4 w-4 mr-2" /> API Services
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Webhook className="h-4 w-4 mr-2" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Database className="h-4 w-4 mr-2" /> Storage
          </TabsTrigger>
        </TabsList>

        {/* API Integrations Tab */}
        <TabsContent value="api">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">API Integrations</h2>
              <Button onClick={() => {
                apiForm.reset();
                setSelectedIntegration(null);
                setShowApiConfig(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Add API Integration
              </Button>
            </div>
            
            {isLoadingIntegrations ? (
              <div className="text-center py-8">Loading API integrations...</div>
            ) : integrations && integrations.filter(i => isApiIntegration(i)).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {integrations
                  .filter(i => isApiIntegration(i))
                  .map(integration => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration as ApiIntegration}
                      onEdit={handleEditIntegration}
                      onDelete={handleDeleteIntegration}
                      onToggleActive={handleToggleIntegration}
                    />
                  ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <Server className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No API Integrations</h3>
                  <p className="text-muted-foreground">
                    You haven't added any API integrations yet.
                  </p>
                  <Button onClick={() => {
                    apiForm.reset();
                    setSelectedIntegration(null);
                    setShowApiConfig(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Add API Integration
                  </Button>
                </div>
              </Card>
            )}

            {showApiConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedIntegration ? 'Edit API Integration' : 'Add New API Integration'}</CardTitle>
                  <CardDescription>
                    Configure connections to external API services such as Training.gov.au, Fair Work, and other third-party systems.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...apiForm}>
                    <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-4">
                      <FormField
                        control={apiForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Training.gov.au API" {...field} />
                            </FormControl>
                            <FormDescription>
                              A descriptive name for this integration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={apiForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Integration Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!!selectedIntegration}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an integration type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="tga">Training.gov.au API</SelectItem>
                                <SelectItem value="fairwork">Fair Work Ombudsman API</SelectItem>
                                <SelectItem value="sms">SMS Gateway</SelectItem>
                                <SelectItem value="rto">RTO Portal</SelectItem>
                                <SelectItem value="custom">Custom API</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The type of integration you're configuring
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={apiForm.control}
                          name="baseUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://api.example.com" {...field} />
                              </FormControl>
                              <FormDescription>
                                The base URL for API requests
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={apiForm.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your API key" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={apiForm.control}
                        name="apiKeyHeader"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key Header Name</FormLabel>
                            <FormControl>
                              <Input placeholder="X-API-Key" {...field} />
                            </FormControl>
                            <FormDescription>
                              The header name used for sending the API key (e.g., X-API-Key, Authorization)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={apiForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Briefly describe what this integration is used for" 
                                className="min-h-[100px]" 
                                {...field} 
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={apiForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active</FormLabel>
                              <FormDescription>
                                Enable or disable this integration
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

                      <CardFooter className="px-0 pt-4">
                        <Button variant="outline" type="button" onClick={() => setShowApiConfig(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="ml-2">
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

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Webhooks</h2>
              <Button onClick={() => {
                webhookForm.reset();
                setSelectedIntegration(null);
                setShowWebhookConfig(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Add Webhook
              </Button>
            </div>
            
            {isLoadingIntegrations ? (
              <div className="text-center py-8">Loading webhooks...</div>
            ) : integrations && integrations.filter(i => isWebhookIntegration(i)).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {integrations
                  .filter(i => isWebhookIntegration(i))
                  .map(integration => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration as WebhookIntegration}
                      onEdit={handleEditIntegration}
                      onDelete={handleDeleteIntegration}
                      onToggleActive={handleToggleIntegration}
                    />
                  ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <Webhook className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Webhooks</h3>
                  <p className="text-muted-foreground">
                    You haven't configured any webhooks yet.
                  </p>
                  <Button onClick={() => {
                    webhookForm.reset();
                    setSelectedIntegration(null);
                    setShowWebhookConfig(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Webhook
                  </Button>
                </div>
              </Card>
            )}

            {showWebhookConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedIntegration ? 'Edit Webhook' : 'Add New Webhook'}</CardTitle>
                  <CardDescription>
                    Configure webhooks to notify external systems when events occur in your application.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...webhookForm}>
                    <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-4">
                      <FormField
                        control={webhookForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., New Apprentice Notification" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={webhookForm.control}
                        name="url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Webhook URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/webhook" {...field} />
                            </FormControl>
                            <FormDescription>
                              The URL that will receive webhook notifications
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
                              <Input type="password" placeholder="Secret key for signature verification" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Optional secret used to sign webhook payloads
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <Label>Events to Trigger Webhook</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {[
                            'apprentice.created',
                            'apprentice.updated',
                            'host.created',
                            'host.updated',
                            'placement.created',
                            'placement.completed',
                            'contract.signed',
                            'document.uploaded',
                            'user.created',
                            'timesheet.submitted',
                            'timesheet.approved',
                            'payment.processed',
                          ].map(event => (
                            <div key={event} className="flex items-center space-x-2">
                              <Checkbox
                                id={`event-${event}`}
                                checked={webhookForm.watch('events')?.includes(event)}
                                onCheckedChange={(checked) => {
                                  const currentEvents = webhookForm.watch('events') || [];
                                  if (checked) {
                                    webhookForm.setValue('events', [...currentEvents, event]);
                                  } else {
                                    webhookForm.setValue('events', currentEvents.filter(e => e !== event));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`event-${event}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {event}
                              </label>
                            </div>
                          ))}
                        </div>
                        {webhookForm.formState.errors.events && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {webhookForm.formState.errors.events.message}
                          </p>
                        )}
                      </div>

                      <FormField
                        control={webhookForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active</FormLabel>
                              <FormDescription>
                                Enable or disable this webhook
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

                      <CardFooter className="px-0 pt-4">
                        <Button variant="outline" type="button" onClick={() => setShowWebhookConfig(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="ml-2">
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
                setSelectedIntegration(null);
                setShowDocumentConfig(true);
              }}>
                <Plus className="h-4 w-4 mr-2" /> Add Storage Service
              </Button>
            </div>
            
            {isLoadingIntegrations ? (
              <div className="text-center py-8">Loading storage services...</div>
            ) : integrations && integrations.filter(i => isStorageIntegration(i)).length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {integrations
                  .filter(i => isStorageIntegration(i))
                  .map(integration => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration as StorageIntegration}
                      onEdit={handleEditIntegration}
                      onDelete={handleDeleteIntegration}
                      onToggleActive={handleToggleIntegration}
                    />
                  ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <Database className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Storage Services</h3>
                  <p className="text-muted-foreground">
                    You haven't configured any document storage services yet.
                  </p>
                  <Button onClick={() => {
                    documentServiceForm.reset();
                    setSelectedIntegration(null);
                    setShowDocumentConfig(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" /> Add Storage Service
                  </Button>
                </div>
              </Card>
            )}

            {showDocumentConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedIntegration ? 'Edit Storage Service' : 'Add New Storage Service'}</CardTitle>
                  <CardDescription>
                    Configure storage services for document uploads and file storage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...documentServiceForm}>
                    <form onSubmit={documentServiceForm.handleSubmit(onDocumentStorageSubmit)} className="space-y-4">
                      <FormField
                        control={documentServiceForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Document Storage" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={documentServiceForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Storage Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Reset config when changing type
                                documentServiceForm.setValue('config', {});
                              }}
                              disabled={!!selectedIntegration}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select storage type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="local">Local Storage</SelectItem>
                                <SelectItem value="s3">Amazon S3</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The type of storage service to use
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {documentServiceForm.watch('type') === 's3' && (
                        <div className="space-y-4 border rounded-md p-4">
                          <h3 className="text-sm font-medium">Amazon S3 Configuration</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="s3-bucket">S3 Bucket</Label>
                              <Input
                                id="s3-bucket"
                                placeholder="my-app-bucket"
                                value={documentServiceForm.watch('config.bucket') || ''}
                                onChange={(e) => {
                                  const config = documentServiceForm.watch('config') || {};
                                  documentServiceForm.setValue('config', {
                                    ...config,
                                    bucket: e.target.value,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor="s3-region">AWS Region</Label>
                              <Input
                                id="s3-region"
                                placeholder="ap-southeast-2"
                                value={documentServiceForm.watch('config.region') || ''}
                                onChange={(e) => {
                                  const config = documentServiceForm.watch('config') || {};
                                  documentServiceForm.setValue('config', {
                                    ...config,
                                    region: e.target.value,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor="s3-access-key">Access Key ID</Label>
                              <Input
                                id="s3-access-key"
                                placeholder="AKIAIOSFODNN7EXAMPLE"
                                value={documentServiceForm.watch('config.accessKeyId') || ''}
                                onChange={(e) => {
                                  const config = documentServiceForm.watch('config') || {};
                                  documentServiceForm.setValue('config', {
                                    ...config,
                                    accessKeyId: e.target.value,
                                  });
                                }}
                              />
                            </div>
                            <div>
                              <Label htmlFor="s3-secret-key">Secret Access Key</Label>
                              <Input
                                id="s3-secret-key"
                                type="password"
                                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                                value={documentServiceForm.watch('config.secretAccessKey') || ''}
                                onChange={(e) => {
                                  const config = documentServiceForm.watch('config') || {};
                                  documentServiceForm.setValue('config', {
                                    ...config,
                                    secretAccessKey: e.target.value,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {documentServiceForm.watch('type') === 'local' && (
                        <div className="space-y-4 border rounded-md p-4">
                          <h3 className="text-sm font-medium">Local Storage Configuration</h3>
                          <div>
                            <Label htmlFor="storage-path">Storage Path</Label>
                            <Input
                              id="storage-path"
                              placeholder="./uploads"
                              value={documentServiceForm.watch('config.path') || './uploads'}
                              onChange={(e) => {
                                const config = documentServiceForm.watch('config') || {};
                                documentServiceForm.setValue('config', {
                                  ...config,
                                  path: e.target.value,
                                });
                              }}
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              Directory path for storing uploaded files
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-4">
                        <FormField
                          control={documentServiceForm.control}
                          name="isDefault"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Default Storage</FormLabel>
                                <FormDescription>
                                  Make this the default storage service for the application
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

                        <FormField
                          control={documentServiceForm.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active</FormLabel>
                                <FormDescription>
                                  Enable or disable this storage service
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
                      </div>

                      <CardFooter className="px-0 pt-4">
                        <Button variant="outline" type="button" onClick={() => setShowDocumentConfig(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="ml-2">
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

export default IntegrationsSettings;
