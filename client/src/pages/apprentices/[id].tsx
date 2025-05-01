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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Edit,
  FileText,
  Building2,
  Calendar,
  AlarmClock,
  FileWarning,
  Mail,
  Phone,
  Cake,
  Briefcase,
  ClipboardList
} from "lucide-react";
import { Apprentice, TrainingContract, Placement } from "@shared/schema";
import { ApprenticeStatusChange } from "@/components/apprentices/ApprenticeStatusChange";

const ApprenticeDetails = () => {
  const [, params] = useLocation();
  const apprenticeId = parseInt(params.id);
  
  if (isNaN(apprenticeId)) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FileWarning className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Invalid Apprentice ID</h2>
        <p className="text-muted-foreground mb-6">The apprentice ID provided is not valid.</p>
        <Button asChild>
          <WouterLink href="/apprentices">Back to Apprentices</WouterLink>
        </Button>
      </div>
    );
  }
  
  const { data: apprentice, isLoading: isLoadingApprentice, error: apprenticeError } = useQuery({
    queryKey: [`/api/apprentices/${apprenticeId}`],
    queryFn: async () => {
      const res = await fetch(`/api/apprentices/${apprenticeId}`);
      if (!res.ok) throw new Error('Failed to fetch apprentice details');
      return res.json() as Promise<Apprentice>;
    }
  });
  
  const { data: contracts, isLoading: isLoadingContracts } = useQuery({
    queryKey: [`/api/apprentices/${apprenticeId}/contracts`],
    queryFn: async () => {
      const res = await fetch(`/api/apprentices/${apprenticeId}/contracts`);
      if (!res.ok) throw new Error('Failed to fetch contracts');
      return res.json() as Promise<TrainingContract[]>;
    },
    enabled: !!apprenticeId
  });
  
  const { data: placements, isLoading: isLoadingPlacements } = useQuery({
    queryKey: [`/api/apprentices/${apprenticeId}/placements`],
    queryFn: async () => {
      const res = await fetch(`/api/apprentices/${apprenticeId}/placements`);
      if (!res.ok) throw new Error('Failed to fetch placements');
      return res.json() as Promise<Placement[]>;
    },
    enabled: !!apprenticeId
  });
  
  // Format dates for display
  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  if (isLoadingApprentice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" disabled className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Skeleton className="h-8 w-60" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="w-full space-y-4 mt-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="md:col-span-3 space-y-6">
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
  
  if (apprenticeError || !apprentice) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <FileWarning className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Apprentice Not Found</h2>
        <p className="text-muted-foreground mb-6">The apprentice you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <WouterLink href="/apprentices">Back to Apprentices</WouterLink>
        </Button>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "active":
        return "bg-success text-success-foreground";
      case "suspended":
      case "on_hold":
        return "bg-destructive text-destructive-foreground";
      case "completed":
        return "bg-info text-info-foreground";
      case "applicant":
        return "bg-slate-500 text-slate-50";
      case "recruitment":
        return "bg-orange-500 text-orange-50";
      case "pre-commencement":
        return "bg-purple-500 text-purple-50";
      case "withdrawn":
        return "bg-gray-500 text-gray-50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-4">
            <WouterLink href="/apprentices">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </WouterLink>
          </Button>
          <h2 className="text-2xl font-semibold text-foreground">Apprentice Details</h2>
        </div>
        <div className="flex space-x-3">
          <ApprenticeStatusChange 
            apprenticeId={apprenticeId} 
            currentStatus={apprentice.status} 
            apprenticeName={`${apprentice.firstName} ${apprentice.lastName}`}
          />
          <Button asChild>
            <WouterLink href={`/apprentices/${apprenticeId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </WouterLink>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with profile */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-32 w-32">
                <AvatarImage 
                  src={apprentice.profileImage || ""} 
                  alt={`${apprentice.firstName} ${apprentice.lastName}`} 
                />
                <AvatarFallback className="text-2xl">
                  {apprentice.firstName.charAt(0) + apprentice.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-xl font-semibold">
                {apprentice.firstName} {apprentice.lastName}
              </h3>
              <Badge className={`mt-2 ${getStatusColor(apprentice.status)}`}>
                {apprentice.status.replace('_', ' ')}
              </Badge>
              
              <div className="w-full mt-6">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Progress
                </div>
                <Progress value={apprentice.progress || 0} className="h-2 mb-1" />
                <div className="text-xs text-muted-foreground">
                  {apprentice.progress || 0}% Complete
                </div>
              </div>
              
              <div className="w-full space-y-4 mt-6">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{apprentice.email}</span>
                </div>
                
                {apprentice.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{apprentice.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{apprentice.trade}</span>
                </div>
                
                {apprentice.dateOfBirth && (
                  <div className="flex items-center">
                    <Cake className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{formatDate(apprentice.dateOfBirth)}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                <Button variant="outline" size="sm" asChild>
                  <WouterLink href={`/contracts?apprenticeId=${apprenticeId}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Contracts
                  </WouterLink>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <WouterLink href={`/placements?apprenticeId=${apprenticeId}`}>
                    <Building2 className="h-4 w-4 mr-2" />
                    Placements
                  </WouterLink>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main content area */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                Apprentice information and training details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                    <div>{formatDate(apprentice.startDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">End Date</div>
                    <div>{formatDate(apprentice.endDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Active Contracts</div>
                    <div>
                      {isLoadingContracts 
                        ? <Skeleton className="h-5 w-16" /> 
                        : contracts?.filter(c => c.status === "active").length || 0}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Building2 className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Current Placement</div>
                    <div>
                      {isLoadingPlacements 
                        ? <Skeleton className="h-5 w-24" /> 
                        : placements?.find(p => p.status === "active")?.position || "None"}
                    </div>
                  </div>
                </div>
                
                {apprentice.notes && (
                  <div className="flex items-start md:col-span-2">
                    <ClipboardList className="h-5 w-5 mr-3 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Notes</div>
                      <div className="mt-1">{apprentice.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="contracts">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="contracts">
                <FileText className="h-4 w-4 mr-2" />
                Contracts
              </TabsTrigger>
              <TabsTrigger value="placements">
                <Building2 className="h-4 w-4 mr-2" />
                Placements
              </TabsTrigger>
              <TabsTrigger value="timesheets">
                <AlarmClock className="h-4 w-4 mr-2" />
                Timesheets
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="contracts">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Training Contracts</CardTitle>
                    <Button size="sm" asChild>
                      <WouterLink href={`/contracts/create?apprenticeId=${apprenticeId}`}>
                        <FileText className="h-4 w-4 mr-2" />
                        New Contract
                      </WouterLink>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingContracts ? (
                    <div className="space-y-4">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : contracts && contracts.length > 0 ? (
                    <div className="divide-y">
                      {contracts.map((contract) => (
                        <div key={contract.id} className="py-4 flex justify-between items-center">
                          <div>
                            <div className="font-medium">{contract.contractNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge className={`mr-4 ${getStatusColor(contract.status)}`}>
                              {contract.status.replace('_', ' ')}
                            </Badge>
                            <Button size="sm" variant="outline" asChild>
                              <WouterLink href={`/contracts/${contract.id}`}>
                                View
                              </WouterLink>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Contracts</h3>
                      <p className="text-muted-foreground mb-6">
                        This apprentice doesn't have any training contracts yet.
                      </p>
                      <Button asChild>
                        <WouterLink href={`/contracts/create?apprenticeId=${apprenticeId}`}>
                          Create Contract
                        </WouterLink>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="placements">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Placements</CardTitle>
                    <Button size="sm" asChild>
                      <WouterLink href={`/placements/create?apprenticeId=${apprenticeId}`}>
                        <Building2 className="h-4 w-4 mr-2" />
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
                              Host ID: {placement.hostEmployerId} • {formatDate(placement.startDate)} - {formatDate(placement.endDate)}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge className={`mr-4 ${getStatusColor(placement.status)}`}>
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
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Placements</h3>
                      <p className="text-muted-foreground mb-6">
                        This apprentice doesn't have any placements yet.
                      </p>
                      <Button asChild>
                        <WouterLink href={`/placements/create?apprenticeId=${apprenticeId}`}>
                          Create Placement
                        </WouterLink>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="timesheets">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Timesheets</CardTitle>
                    <Button size="sm" asChild>
                      <WouterLink href={`/timesheets/create?apprenticeId=${apprenticeId}`}>
                        <AlarmClock className="h-4 w-4 mr-2" />
                        New Timesheet
                      </WouterLink>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <AlarmClock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Timesheets</h3>
                    <p className="text-muted-foreground mb-6">
                      This apprentice doesn't have any timesheets yet.
                    </p>
                    <Button asChild>
                      <WouterLink href={`/timesheets/create?apprenticeId=${apprenticeId}`}>
                        Create Timesheet
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

export default ApprenticeDetails;
