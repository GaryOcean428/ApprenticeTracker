import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  File,
  User,
  Calendar,
  MapPin,
  Shield,
  CheckCircle,
  Info,
  FileWarning,
  Download,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface IncidentDetailsViewProps {
  incidentId: string;
}

export default function IncidentDetailsView({ incidentId }: IncidentDetailsViewProps) {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/whs/incidents/${incidentId}`],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const { incident, witnesses, documents } = data || {};

  if (!incident) {
    return <div className="text-center py-8">Incident not found or failed to load.</div>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reported':
        return <Badge variant="outline">Reported</Badge>;
      case 'investigating':
        return <Badge variant="secondary">Investigating</Badge>;
      case 'action-required':
        return <Badge variant="warning">Action Required</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'closed':
        return <Badge>Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {incident.type === 'incident' ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <FileWarning className="h-5 w-5 text-yellow-500" />
          )}
          <h2 className="text-xl font-bold">{incident.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(incident.status)}
          {incident.notifiable_incident && <Badge variant="destructive">Notifiable</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date Reported:</span>
              </div>
              <span className="text-sm">
                {new Date(incident.date_reported).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date Occurred:</span>
              </div>
              <span className="text-sm">
                {new Date(incident.date_occurred).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Location:</span>
              </div>
              <span className="text-sm">{incident.location}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Shield className={`h-4 w-4 ${getSeverityColor(incident.severity)}`} />
                <span className="text-sm font-medium">Severity:</span>
              </div>
              <span className={`text-sm font-medium ${getSeverityColor(incident.severity)}`}>
                {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">People Involved</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Reported By:</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{incident.reporter_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{incident.reporter_name || 'Unknown'}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Assigned To:</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>{incident.assigned_to_name?.charAt(0) || '-'}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{incident.assigned_to_name || 'Not assigned'}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Apprentice:</span>
              </div>
              <span className="text-sm">{incident.apprentice_name || 'Not applicable'}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Host Employer:</span>
              </div>
              <span className="text-sm">{incident.host_employer_name || 'Not applicable'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="description">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="investigation">Investigation</TabsTrigger>
          <TabsTrigger value="witnesses">Witnesses</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Description</CardTitle>
              <CardDescription>Detailed account of the incident or hazard</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">
                {incident.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Immediate Actions Taken</CardTitle>
              <CardDescription>
                Actions taken immediately after the incident was identified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">
                {incident.immediate_actions || 'No immediate actions recorded.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Investigation Notes</CardTitle>
              <CardDescription>Findings from the investigation into the incident</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">
                {incident.investigation_notes || 'No investigation notes recorded yet.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolution Details</CardTitle>
              <CardDescription>
                How the incident was resolved or the hazard was addressed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">
                {incident.resolution_details || 'No resolution details recorded yet.'}
              </p>
              {incident.resolution_date && (
                <div className="flex items-center gap-2 mt-4">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Resolved on: {new Date(incident.resolution_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {incident.notifiable_incident && (
            <Card>
              <CardHeader className="bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-red-500" />
                  <CardTitle>Regulatory Authority Notification</CardTitle>
                </div>
                <CardDescription>Details of notification to relevant authorities</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Authority Notified:</span>
                    <span className="text-sm">{incident.authority_notified ? 'Yes' : 'No'}</span>
                  </div>
                  {incident.authority_notified && incident.authority_reference && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Reference Number:</span>
                      <span className="text-sm">{incident.authority_reference}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="witnesses">
          <Card>
            <CardHeader>
              <CardTitle>Witness Statements</CardTitle>
              <CardDescription>
                People who witnessed the incident and their accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {witnesses && witnesses.length > 0 ? (
                <div className="space-y-6">
                  {witnesses.map((witness: any, index: number) => (
                    <div
                      key={index}
                      className="border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{witness.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-medium">{witness.name}</h4>
                          {witness.contact && (
                            <p className="text-xs text-muted-foreground">{witness.contact}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm whitespace-pre-line">
                        {witness.statement || 'No statement provided.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No witnesses recorded for this incident.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
              <CardDescription>
                Documents, images, and files related to the incident
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents && documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc: any) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-blue-500" />
                            {doc.filename || doc.title}
                          </div>
                        </TableCell>
                        <TableCell>{doc.file_type}</TableCell>
                        <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No documents attached to this incident.
                </p>
              )}
            </CardContent>
            <CardFooter className="bg-muted/50 border-t">
              <Button variant="secondary" size="sm" className="ml-auto">
                <File className="h-4 w-4 mr-2" />
                Attach Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline">Print Report</Button>
        <Button>Edit Incident</Button>
      </div>
    </div>
  );
}
