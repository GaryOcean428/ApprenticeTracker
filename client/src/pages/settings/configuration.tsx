import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { Settings, Mail, CalendarClock, Globe, Shield, Wrench } from 'lucide-react';

// System configuration schema
const systemConfigSchema = z.object({
  siteName: z.string().min(2, 'Site name is required'),
  siteUrl: z.string().url('Must be a valid URL'),
  companyName: z.string().min(2, 'Company name is required'),
  companyAbn: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email('Must be a valid email').optional(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  defaultTimezone: z.string(),
  maintenanceMode: z.boolean().default(false),
  debug: z.boolean().default(false),
});

// Email settings schema
const emailSettingsSchema = z.object({
  emailDriver: z.string(),
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.string().min(1, 'SMTP port is required'),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpEncryption: z.string(),
  mailFromAddress: z.string().email('Must be a valid email'),
  mailFromName: z.string().min(1, 'From name is required'),
  notificationEmails: z.boolean().default(true),
});

// Notification settings schema
const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  inAppNotifications: z.boolean().default(true),
  dailyDigest: z.boolean().default(false),
  weeklyDigest: z.boolean().default(false),
  autoRemindDeadlines: z.boolean().default(true),
  reminderDays: z.number().min(1).max(14).default(3),
});

// Security settings schema
const securitySettingsSchema = z.object({
  mfaEnabled: z.boolean().default(false),
  mfaForAdmins: z.boolean().default(false),
  passwordExpiry: z.number().min(0).max(365).default(90), // days, 0 = never
  passwordMinLength: z.number().min(6).max(32).default(8),
  passwordComplexity: z.string().default('medium'),
  sessionTimeout: z.number().min(5).max(1440).default(60), // minutes
  allowedIpRanges: z.string().optional(),
  securityLogRetention: z.number().min(30).max(730).default(90), // days
});

type SystemConfigValues = z.infer<typeof systemConfigSchema>;
type EmailSettingsValues = z.infer<typeof emailSettingsSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;
type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;

const SystemConfiguration = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // Forms
  const systemForm = useForm<SystemConfigValues>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: {
      siteName: 'CRM7',
      siteUrl: 'https://app.crm7.com',
      companyName: 'Braden Group',
      companyAbn: '12 345 678 901',
      companyAddress: '123 Main Street, Sydney NSW 2000',
      companyPhone: '02 1234 5678',
      companyEmail: 'info@bradengroup.com.au',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24',
      defaultTimezone: 'Australia/Sydney',
      maintenanceMode: false,
      debug: false,
    },
  });

  const emailForm = useForm<EmailSettingsValues>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      emailDriver: 'smtp',
      smtpHost: 'smtp.example.com',
      smtpPort: '587',
      smtpUsername: 'notifications@example.com',
      smtpPassword: '',
      smtpEncryption: 'tls',
      mailFromAddress: 'no-reply@bradengroup.com.au',
      mailFromName: 'CRM7 Notifications',
      notificationEmails: true,
    },
  });

  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      dailyDigest: false,
      weeklyDigest: false,
      autoRemindDeadlines: true,
      reminderDays: 3,
    },
  });

  const securityForm = useForm<SecuritySettingsValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      mfaEnabled: false,
      mfaForAdmins: false,
      passwordExpiry: 90,
      passwordMinLength: 8,
      passwordComplexity: 'medium',
      sessionTimeout: 60,
      allowedIpRanges: '',
      securityLogRetention: 90,
    },
  });

  // Mutation for system settings
  const updateSystemConfigMutation = useMutation({
    mutationFn: async (data: SystemConfigValues) => {
      const response = await apiRequest('PUT', '/api/settings/system', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'System configuration updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update system configuration: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for email settings
  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (data: EmailSettingsValues) => {
      const response = await apiRequest('PUT', '/api/settings/email', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Email settings updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update email settings: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for notification settings
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (data: NotificationSettingsValues) => {
      const response = await apiRequest('PUT', '/api/settings/notifications', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Notification settings updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update notification settings: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for security settings
  const updateSecuritySettingsMutation = useMutation({
    mutationFn: async (data: SecuritySettingsValues) => {
      const response = await apiRequest('PUT', '/api/settings/security', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Security settings updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update security settings: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle form submissions
  const onSystemSubmit = (data: SystemConfigValues) => {
    updateSystemConfigMutation.mutate(data);
  };

  const onEmailSubmit = (data: EmailSettingsValues) => {
    updateEmailSettingsMutation.mutate(data);
  };

  const onNotificationSubmit = (data: NotificationSettingsValues) => {
    updateNotificationSettingsMutation.mutate(data);
  };

  const onSecuritySubmit = (data: SecuritySettingsValues) => {
    updateSecuritySettingsMutation.mutate(data);
  };

  // Test SMTP connection
  const testSmtpConnection = async () => {
    try {
      toast({
        title: 'Testing SMTP connection',
        description: 'Please wait...',
      });

      const response = await apiRequest('POST', '/api/settings/email/test', emailForm.getValues());
      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'SMTP connection successful',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: result.message || 'Could not connect to SMTP server',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test SMTP connection',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">System Configuration</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" /> Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <CalendarClock className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General System Settings</CardTitle>
              <CardDescription>
                Configure basic system settings including branding and regional preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...systemForm}>
                <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Branding</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>The name of your application</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemForm.control}
                        name="siteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site URL</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>The URL of your application</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Organization Details</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemForm.control}
                        name="companyAbn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ABN</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemForm.control}
                        name="companyAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemForm.control}
                        name="companyPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemForm.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Regional Settings</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Format</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select date format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemForm.control}
                        name="timeFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Format</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="12">12-hour (AM/PM)</SelectItem>
                                <SelectItem value="24">24-hour</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemForm.control}
                        name="defaultTimezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Timezone</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                                <SelectItem value="Australia/Melbourne">
                                  Australia/Melbourne
                                </SelectItem>
                                <SelectItem value="Australia/Brisbane">
                                  Australia/Brisbane
                                </SelectItem>
                                <SelectItem value="Australia/Adelaide">
                                  Australia/Adelaide
                                </SelectItem>
                                <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                                <SelectItem value="Australia/Darwin">Australia/Darwin</SelectItem>
                                <SelectItem value="Australia/Hobart">Australia/Hobart</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">System Mode</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={systemForm.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Maintenance Mode</FormLabel>
                              <FormDescription>
                                Enable maintenance mode to prevent user access during updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={systemForm.control}
                        name="debug"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Debug Mode</FormLabel>
                              <FormDescription>
                                Enable detailed error messages and logging
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="mt-6">
                    Save General Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure your system's email settings for notifications and communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Email Driver</h3>
                    <Separator className="my-4" />
                    <FormField
                      control={emailForm.control}
                      name="emailDriver"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mail Driver</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mail driver" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="smtp">SMTP</SelectItem>
                              <SelectItem value="mailgun">Mailgun</SelectItem>
                              <SelectItem value="ses">Amazon SES</SelectItem>
                              <SelectItem value="sendgrid">SendGrid</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The mail service to use for sending emails
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">SMTP Settings</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={emailForm.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="smtpUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Username</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="smtpEncryption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Encryption</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select encryption type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="tls">TLS</SelectItem>
                                <SelectItem value="ssl">SSL</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-4">
                      <Button type="button" variant="outline" onClick={testSmtpConnection}>
                        Test Connection
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">From Address</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={emailForm.control}
                        name="mailFromAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The email address that will appear in the From field
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailForm.control}
                        name="mailFromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The name that will appear as the sender
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    <Separator className="my-4" />
                    <FormField
                      control={emailForm.control}
                      name="notificationEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                            <FormDescription>
                              Send email notifications for system events and updates
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="mt-6">
                    Save Email Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when users receive notifications from the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>Send notifications via email</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                                Show notifications within the application interface
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Digest Settings</h3>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="dailyDigest"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Daily Digest</FormLabel>
                              <FormDescription>
                                Send a daily summary of all activities and notifications
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="weeklyDigest"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Weekly Digest</FormLabel>
                              <FormDescription>
                                Send a weekly summary of key activities and metrics
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Reminder Settings</h3>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="autoRemindDeadlines"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Automatic Deadline Reminders
                              </FormLabel>
                              <FormDescription>
                                Send reminders before deadlines are due
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="reminderDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reminder Days Before Deadline</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={14}
                                {...field}
                                value={field.value}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              How many days before a deadline to send a reminder (1-14 days)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="mt-6">
                    Save Notification Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies, password requirements, and access controls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Authentication</h3>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <FormField
                        control={securityForm.control}
                        name="mfaEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Enable Multi-Factor Authentication
                              </FormLabel>
                              <FormDescription>
                                Require two-factor authentication for account access
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="mfaForAdmins"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Require MFA for Administrators
                              </FormLabel>
                              <FormDescription>
                                Make MFA mandatory for admin and developer accounts
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Password Policy</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="passwordMinLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Password Length</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={6}
                                max={32}
                                {...field}
                                value={field.value}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Minimum number of characters (6-32)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="passwordExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Expiry (Days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={365}
                                {...field}
                                value={field.value}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of days until password expires (0 = never)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="passwordComplexity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Complexity</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select complexity level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low (letters only)</SelectItem>
                                <SelectItem value="medium">Medium (letters & numbers)</SelectItem>
                                <SelectItem value="high">
                                  High (letters, numbers & special characters)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Required password complexity level</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Session Settings</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (Minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={5}
                                max={1440}
                                {...field}
                                value={field.value}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Time until inactive sessions are terminated (5-1440 minutes)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={securityForm.control}
                        name="allowedIpRanges"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allowed IP Ranges</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              IP ranges allowed to access the system (comma separated, leave blank
                              for all)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Audit & Logging</h3>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="securityLogRetention"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Log Retention (Days)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={30}
                                max={730}
                                {...field}
                                value={field.value}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Number of days to retain security logs (30-730 days)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="mt-6">
                    Save Security Settings
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
