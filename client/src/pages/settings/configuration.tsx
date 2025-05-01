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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Globe, BellRing, Lock, Mail, HelpCircle, Save } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface SystemConfig {
  id: number;
  key: string;
  value: string;
  category: string;
  description: string | null;
  updatedAt: Date;
}

const generalConfigSchema = z.object({
  siteName: z.string().min(2, { message: 'Site name is required' }),
  siteDescription: z.string().optional(),
  supportEmail: z.string().email({ message: 'Must be a valid email address' }),
  supportPhone: z.string().optional(),
  timezone: z.string(),
  dateFormat: z.string(),
  maintenanceMode: z.boolean().default(false),
  usageAnalytics: z.boolean().default(true),
});

const notificationConfigSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  inAppNotifications: z.boolean().default(true),
  notifyOnLogin: z.boolean().default(true),
  notifyOnNewApprentice: z.boolean().default(true),
  notifyOnComplianceIssue: z.boolean().default(true),
  notifyOnTrainingUpdate: z.boolean().default(true),
  notifyOnDataExport: z.boolean().default(true),
  dailyDigestTime: z.string(),
  weeklyDigestDay: z.string(),
});

const ausComplianceConfigSchema = z.object({
  fairWorkIntegration: z.boolean().default(false),
  fairWorkApiKey: z.string().optional(),
  enableAQFTracking: z.boolean().default(true),
  enableNSWRequirements: z.boolean().default(false),
  enableQLDRequirements: z.boolean().default(false),
  enableVICRequirements: z.boolean().default(false),
  enableSARequirements: z.boolean().default(false),
  enableWARequirements: z.boolean().default(false),
  enableNTRequirements: z.boolean().default(false),
  enableTASRequirements: z.boolean().default(false),
  enableACTRequirements: z.boolean().default(false),
});

type GeneralConfigFormValues = z.infer<typeof generalConfigSchema>;
type NotificationConfigFormValues = z.infer<typeof notificationConfigSchema>;
type AusComplianceConfigFormValues = z.infer<typeof ausComplianceConfigSchema>;

const SystemConfiguration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  
  // General configuration form
  const generalForm = useForm<GeneralConfigFormValues>({
    resolver: zodResolver(generalConfigSchema),
    defaultValues: {
      siteName: 'Australian Apprentice Management',
      siteDescription: 'Comprehensive apprentice and traineeship management platform',
      supportEmail: 'support@example.com',
      supportPhone: '+61 2 1234 5678',
      timezone: 'Australia/Sydney',
      dateFormat: 'DD/MM/YYYY',
      maintenanceMode: false,
      usageAnalytics: true,
    },
  });

  // Notification configuration form
  const notificationForm = useForm<NotificationConfigFormValues>({
    resolver: zodResolver(notificationConfigSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      notifyOnLogin: true,
      notifyOnNewApprentice: true,
      notifyOnComplianceIssue: true,
      notifyOnTrainingUpdate: true,
      notifyOnDataExport: true,
      dailyDigestTime: '08:00',
      weeklyDigestDay: 'Monday',
    },
  });

  // Australian compliance configuration form
  const ausComplianceForm = useForm<AusComplianceConfigFormValues>({
    resolver: zodResolver(ausComplianceConfigSchema),
    defaultValues: {
      fairWorkIntegration: false,
      fairWorkApiKey: '',
      enableAQFTracking: true,
      enableNSWRequirements: false,
      enableQLDRequirements: false,
      enableVICRequirements: false,
      enableSARequirements: false,
      enableWARequirements: false,
      enableNTRequirements: false,
      enableTASRequirements: false,
      enableACTRequirements: false,
    },
  });

  // Save general configuration mutation
  const saveGeneralConfigMutation = useMutation({
    mutationFn: async (data: GeneralConfigFormValues) => {
      const response = await apiRequest('POST', '/api/config/general', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'General configuration saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save configuration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Save notification configuration mutation
  const saveNotificationConfigMutation = useMutation({
    mutationFn: async (data: NotificationConfigFormValues) => {
      const response = await apiRequest('POST', '/api/config/notifications', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Notification configuration saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save configuration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Save Australian compliance configuration mutation
  const saveAusComplianceConfigMutation = useMutation({
    mutationFn: async (data: AusComplianceConfigFormValues) => {
      const response = await apiRequest('POST', '/api/config/aus-compliance', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Australian compliance configuration saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to save configuration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSaveGeneralConfig = (data: GeneralConfigFormValues) => {
    saveGeneralConfigMutation.mutate(data);
  };

  const handleSaveNotificationConfig = (data: NotificationConfigFormValues) => {
    saveNotificationConfigMutation.mutate(data);
  };

  const handleSaveAusComplianceConfig = (data: AusComplianceConfigFormValues) => {
    saveAusComplianceConfigMutation.mutate(data);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">System Configuration</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="aus-compliance">
            <Globe className="h-4 w-4 mr-2" /> Australian Compliance
          </TabsTrigger>
        </TabsList>
        
        {/* General Configuration Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>
                Configure basic system settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(handleSaveGeneralConfig)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Site Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The name displayed throughout the application
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="supportEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormDescription>
                              Email for user support inquiries
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Textarea rows={3} {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Brief description of the system
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="supportPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Phone</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              Phone number for user support
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Regional Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={generalForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                                <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                                <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                                <SelectItem value="Australia/Adelaide">Australia/Adelaide</SelectItem>
                                <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                                <SelectItem value="Australia/Hobart">Australia/Hobart</SelectItem>
                                <SelectItem value="Australia/Darwin">Australia/Darwin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Default timezone for dates and times
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={generalForm.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                                <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Format used to display dates across the system
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">System Options</h3>
                    <div className="space-y-4">
                      <FormField
                        control={generalForm.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Maintenance Mode</FormLabel>
                              <FormDescription>
                                When enabled, only administrators can access the system
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
                        control={generalForm.control}
                        name="usageAnalytics"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Usage Analytics</FormLabel>
                              <FormDescription>
                                Collect anonymous usage data to improve the platform
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
                  </div>
                  
                  <Button type="submit" className="mt-4">
                    <Save className="h-4 w-4 mr-2" /> Save General Configuration
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when the system sends notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(handleSaveNotificationConfig)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Send notifications via email
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
                        control={notificationForm.control}
                        name="smsNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">SMS Notifications</FormLabel>
                              <FormDescription>
                                Send notifications via SMS (additional charges may apply)
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
                        control={notificationForm.control}
                        name="inAppNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">In-App Notifications</FormLabel>
                              <FormDescription>
                                Show notifications within the application
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
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Events</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={notificationForm.control}
                        name="notifyOnLogin"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Login Activity
                              </FormLabel>
                              <FormDescription>
                                Notify admins on unusual login activity
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="notifyOnNewApprentice"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                New Apprentice
                              </FormLabel>
                              <FormDescription>
                                Notify when new apprentice is added to the system
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="notifyOnComplianceIssue"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Compliance Issues
                              </FormLabel>
                              <FormDescription>
                                Alert on compliance warning or violations
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="notifyOnTrainingUpdate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Training Updates
                              </FormLabel>
                              <FormDescription>
                                Notify when apprentice training status changes
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="notifyOnDataExport"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Data Export
                              </FormLabel>
                              <FormDescription>
                                Alert when user exports system data
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Digest Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={notificationForm.control}
                        name="dailyDigestTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Digest Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormDescription>
                              Time to send daily activity summary
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="weeklyDigestDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weekly Digest Day</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Monday">Monday</SelectItem>
                                <SelectItem value="Tuesday">Tuesday</SelectItem>
                                <SelectItem value="Wednesday">Wednesday</SelectItem>
                                <SelectItem value="Thursday">Thursday</SelectItem>
                                <SelectItem value="Friday">Friday</SelectItem>
                                <SelectItem value="Saturday">Saturday</SelectItem>
                                <SelectItem value="Sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Day to send weekly summary report
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="mt-4">
                    <Save className="h-4 w-4 mr-2" /> Save Notification Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Australian Compliance Tab */}
        <TabsContent value="aus-compliance">
          <Card>
            <CardHeader>
              <CardTitle>Australian Compliance Settings</CardTitle>
              <CardDescription>
                Configure settings specific to Australian apprenticeship regulations and requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...ausComplianceForm}>
                <form onSubmit={ausComplianceForm.handleSubmit(handleSaveAusComplianceConfig)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Fair Work Integration</h3>
                    <div className="space-y-4">
                      <FormField
                        control={ausComplianceForm.control}
                        name="fairWorkIntegration"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Fair Work Integration</FormLabel>
                              <FormDescription>
                                Connect to Fair Work Australia's APIs for award information and compliance checking
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
                      
                      {ausComplianceForm.watch('fairWorkIntegration') && (
                        <FormField
                          control={ausComplianceForm.control}
                          name="fairWorkApiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fair Work API Key</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormDescription>
                                API key for accessing Fair Work Australia services
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Qualification Framework</h3>
                    <FormField
                      control={ausComplianceForm.control}
                      name="enableAQFTracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable AQF Tracking</FormLabel>
                            <FormDescription>
                              Track Australian Qualifications Framework levels for apprentices
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
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">State and Territory Requirements</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={ausComplianceForm.control}
                        name="enableNSWRequirements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                New South Wales Requirements
                              </FormLabel>
                              <FormDescription>
                                Enable NSW-specific compliance checks
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ausComplianceForm.control}
                        name="enableQLDRequirements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Queensland Requirements
                              </FormLabel>
                              <FormDescription>
                                Enable QLD-specific compliance checks
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ausComplianceForm.control}
                        name="enableVICRequirements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Victoria Requirements
                              </FormLabel>
                              <FormDescription>
                                Enable VIC-specific compliance checks
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ausComplianceForm.control}
                        name="enableSARequirements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                South Australia Requirements
                              </FormLabel>
                              <FormDescription>
                                Enable SA-specific compliance checks
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ausComplianceForm.control}
                        name="enableWARequirements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Western Australia Requirements
                              </FormLabel>
                              <FormDescription>
                                Enable WA-specific compliance checks
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ausComplianceForm.control}
                        name="enableNTRequirements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Northern Territory Requirements
                              </FormLabel>
                              <FormDescription>
                                Enable NT-specific compliance checks
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ausComplianceForm.control}
                        name="enableTASRequirements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Tasmania Requirements
                              </FormLabel>
                              <FormDescription>
                                Enable TAS-specific compliance checks
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={ausComplianceForm.control}
                        name="enableACTRequirements"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Australian Capital Territory Requirements
                              </FormLabel>
                              <FormDescription>
                                Enable ACT-specific compliance checks
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="mt-4">
                    <Save className="h-4 w-4 mr-2" /> Save Compliance Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfiguration;