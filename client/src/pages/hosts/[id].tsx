import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link as WouterLink } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Edit,
  FileText,
  Users,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  MapPin,
  User,
  Star,
  GraduationCap,
  Plus,
  Trash2
} from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { HostEmployer, Placement, Qualification } from "@shared/schema";

interface PreferredQualification {
  id: number;
  hostEmployerId: number;
  qualificationId: number;
  priority: string;
  notes: string | null;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  qualification?: Qualification;
}

const HostDetails = () => {
  const [, params] = useLocation();
  const hostId = parseInt(params.id);
  
  const { data: host, isLoading: isLoadingHost, error: hostError } = useQuery({
    queryKey: [`/api/hosts/${hostId}`],
    queryFn: async () => {
      const res = await fetch(`/api/hosts/${hostId}`);
      if (!res.ok) throw new Error('Failed to fetch host details');
      return res.json() as Promise<HostEmployer>;
    }
  });
  
  const { data: placements, isLoading: isLoadingPlacements } = useQuery({
    queryKey: [`/api/hosts/${hostId}/placements`],
    queryFn: async () => {
      const res = await fetch(`/api/hosts/${hostId}/placements`);
      if (!res.ok) throw new Error('Failed to fetch placements');
      return res.json() as Promise<Placement[]>;
    },
    enabled: !!hostId
  });
  
  const { data: preferredQualifications, isLoading: isLoadingQualifications } = useQuery({
    queryKey: [`/api/hosts/${hostId}/preferred-qualifications`],
    queryFn: async () => {
      const res = await fetch(`/api/hosts/${hostId}/preferred-qualifications`);
      if (!res.ok) throw new Error('Failed to fetch preferred qualifications');
      return res.json() as Promise<PreferredQualification[]>;
    },
    enabled: !!hostId
  });
  
  const [isAddQualDialogOpen, setIsAddQualDialogOpen] = useState(false);
  const [selectedQualificationId, setSelectedQualificationId] = useState<number | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('medium');
  const [isRequired, setIsRequired] = useState<boolean>(false);
  const [qualificationNotes, setQualificationNotes] = useState<string>('');
  
  const { toast } = useToast();
  
  const { data: qualifications, isLoading: isLoadingAllQualifications } = useQuery({
    queryKey: [`/api/qualifications`],
    queryFn: async () => {
      const res = await fetch(`/api/qualifications`);
      if (!res.ok) throw new Error('Failed to fetch qualifications');
      return res.json() as Promise<Qualification[]>;
    }
  });
  
  // Function to add a preferred qualification
  const addPreferredQualification = async () => {
    if (!selectedQualificationId) {
      toast({
        title: "Error",
        description: "Please select a qualification",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/hosts/${hostId}/preferred-qualifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qualificationId: selectedQualificationId,
          priority: selectedPriority,
          isRequired,
          notes: qualificationNotes || null
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add preferred qualification');
      }
      
      // Reset form
      setSelectedQualificationId(null);
      setSelectedPriority('medium');
      setIsRequired(false);
      setQualificationNotes('');
      setIsAddQualDialogOpen(false);
      
      // Invalidate and refetch
      window.location.reload();
      
      toast({
        title: "Success",
        description: "Preferred qualification added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add qualification",
        variant: "destructive"
      });
    }
  };
  
  // Function to remove a preferred qualification
  const removePreferredQualification = async (id: number) => {
    if (!confirm('Are you sure you want to remove this qualification preference?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/hosts/${hostId}/preferred-qualifications/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove preferred qualification');
      }
      
      // Invalidate and refetch
      window.location.reload();
      
      toast({
        title: "Success",
        description: "Preferred qualification removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove qualification",
        variant: "destructive"
      });
    }
  };
  
  if (isLoadingHost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" disabled className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Skeleton className="h-8 w-60" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="space-y-4 mt-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <Skeleton className="h-8 w-8 mr-4 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (hostError || !host) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Host Employer Not Found</h2>
        <p className="text-muted-foreground mb-6">The host employer you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <WouterLink href="/hosts">Back to Host Employers</WouterLink>
        </Button>
      </div>
    );
  }
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case "active":
        return "bg-success text-success-foreground";
      case "inactive":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  const getComplianceBadgeClass = (status: string) => {
    switch(status) {
      case "compliant":
        return "bg-success text-success-foreground";
      case "non-compliant":
        return "bg-destructive text-destructive-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  // Active placements count
  const activePlacements = placements?.filter(p => p.status === "active").length || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-4">
            <WouterLink href="/hosts">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </WouterLink>
          </Button>
          <h2 className="text-2xl font-semibold text-foreground">Host Employer Details</h2>
        </div>
        <Button asChild>
          <WouterLink href={`/hosts/${hostId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </WouterLink>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar with profile */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div>
              <h3 className="text-xl font-semibold">
                {host.name}
              </h3>
              <Badge className={`mt-2 ${getStatusBadgeClass(host.status)}`}>
                {host.status}
              </Badge>
              
              <div className="w-full space-y-4 mt-6">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{host.industry}</span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{host.contactPerson}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{host.email}</span>
                </div>
                
                {host.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{host.phone}</span>
                  </div>
                )}
                
                {host.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{host.address}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Safety Rating</div>
                  <div className="text-sm font-medium">{host.safetyRating}/10</div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div 
                    className="h-2 bg-success rounded-full" 
                    style={{ width: `${(host.safetyRating || 0) * 10}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm font-medium">Compliance Status</div>
                <Badge className={getComplianceBadgeClass(host.complianceStatus)}>
                  {host.complianceStatus.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <Button variant="outline" size="sm" asChild>
                  <WouterLink href={`/placements?hostId=${hostId}`}>
                    <Users className="h-4 w-4 mr-2" />
                    Placements
                  </WouterLink>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <WouterLink href={`/compliance?relatedTo=host&relatedId=${hostId}`}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Compliance
                  </WouterLink>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main content area */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                Host employer information and operational details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Active Placements</div>
                    <div>
                      {isLoadingPlacements 
                        ? <Skeleton className="h-5 w-16" /> 
                        : activePlacements}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Star className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Safety Rating</div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < (host.safetyRating || 0) / 2 
                              ? "text-yellow-400" 
                              : "text-gray-300"
                          }`}
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 22 20"
                        >
                          <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                        </svg>
                      ))}
                      <span className="ml-1">{host.safetyRating || 0}/10</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ShieldCheck className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Compliance Status</div>
                    <div>
                      <Badge className={getComplianceBadgeClass(host.complianceStatus)}>
                        {host.complianceStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Building2 className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Industry</div>
                    <div>{host.industry}</div>
                  </div>
                </div>
                
                {host.notes && (
                  <div className="flex items-start md:col-span-2">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Notes</div>
                      <div className="mt-1">{host.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="placements">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="placements">
                <Users className="h-4 w-4 mr-2" />
                Placements
              </TabsTrigger>
              <TabsTrigger value="qualifications">
                <GraduationCap className="h-4 w-4 mr-2" />
                Qualifications
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="compliance">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Compliance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="placements">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Apprentice Placements</CardTitle>
                    <Button size="sm" asChild>
                      <WouterLink href={`/placements/create?hostId=${hostId}`}>
                        <Users className="h-4 w-4 mr-2" />
                        New Placement
                      </WouterLink>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingPlacements ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : placements && placements.length > 0 ? (
                    <div className="divide-y">
                      {placements.map((placement) => (
                        <div key={placement.id} className="py-4 flex justify-between items-center">
                          <div>
                            <div className="font-medium">{placement.position}</div>
                            <div className="text-sm text-muted-foreground">
                              Apprentice ID: {placement.apprenticeId} • {new Date(placement.startDate).toLocaleDateString()} - {placement.endDate ? new Date(placement.endDate).toLocaleDateString() : "Ongoing"}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge className={`mr-4 ${getStatusBadgeClass(placement.status)}`}>
                              {placement.status.replace('_', ' ')}
                            </Badge>
                            <Button size="sm" variant="outline" asChild>
                              <WouterLink href={`/placements/${placement.id}`}>
                                View
                              </WouterLink>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Placements</h3>
                      <p className="text-muted-foreground mb-6">
                        This host employer doesn't have any apprentice placements yet.
                      </p>
                      <Button asChild>
                        <WouterLink href={`/placements/create?hostId=${hostId}`}>
                          Create Placement
                        </WouterLink>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Documents</CardTitle>
                    <Button size="sm" asChild>
                      <WouterLink href={`/documents/create?relatedTo=host&relatedId=${hostId}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        Upload Document
                      </WouterLink>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Documents</h3>
                    <p className="text-muted-foreground mb-6">
                      This host employer doesn't have any documents attached yet.
                    </p>
                    <Button asChild>
                      <WouterLink href={`/documents/create?relatedTo=host&relatedId=${hostId}`}>
                        Upload Document
                      </WouterLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="compliance">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Compliance Records</CardTitle>
                    <Button size="sm" asChild>
                      <WouterLink href={`/compliance/create?relatedTo=host&relatedId=${hostId}`}>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Add Compliance Record
                      </WouterLink>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Compliance Records</h3>
                    <p className="text-muted-foreground mb-6">
                      This host employer doesn't have any compliance records yet.
                    </p>
                    <Button asChild>
                      <WouterLink href={`/compliance/create?relatedTo=host&relatedId=${hostId}`}>
                        Add Compliance Record
                      </WouterLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default HostDetails;
