import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  CalendarDays, 
  User, 
  Briefcase, 
  FileText, 
  Award, 
  Clock, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  ArrowRightCircle,
  Edit,
  ChevronLeft
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader } from "@/components/page-header";
import { LabourHireWorker } from "@shared/schema";

export default function WorkerDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeStage, setActiveStage] = useState("active"); // Default active stage
  
  // Fetch worker data
  const { 
    data: worker,
    isLoading,
    error
  } = useQuery<LabourHireWorker>({
    queryKey: [`/api/labour-hire/workers/${id}`],
    enabled: !!id
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load worker details. Please try again.",
      variant: "destructive",
    });
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/labour-hire/workers">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Workers
            </Link>
          </Button>
        </div>
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </DashboardShell>
    );
  }

  if (!worker) {
    return (
      <DashboardShell>
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/labour-hire/workers">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Workers
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Worker Not Found</h2>
          <p className="text-muted-foreground mb-6">The worker you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link href="/labour-hire/workers">View All Workers</Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  // Format date helper
  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  // Generate status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "applicant":
        return <Badge className="bg-blue-500">Applicant</Badge>;
      case "shortlisted":
        return <Badge className="bg-purple-500">Shortlisted</Badge>;
      case "interviewing":
        return <Badge className="bg-indigo-500">Interviewing</Badge>;
      case "offered":
        return <Badge className="bg-pink-500">Offered</Badge>;
      case "onboarding":
        return <Badge className="bg-orange-500">Onboarding</Badge>;
      case "probation":
        return <Badge className="bg-amber-500">Probation</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Function to get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Workflow stages
  const stages = [
    { id: "applicant", name: "Applicant", description: "Initial screening" },
    { id: "shortlisted", name: "Shortlisted", description: "Selected candidate" },
    { id: "interviewing", name: "Interviewing", description: "In assessment" },
    { id: "offered", name: "Offer Made", description: "Job offered" },
    { id: "onboarding", name: "Onboarding", description: "Starting position" },
    { id: "probation", name: "Probation", description: "Under evaluation" },
    { id: "active", name: "Active Worker", description: "Fully employed" },
    { id: "completed", name: "Completed", description: "Contract ended" },
    { id: "worker_pool", name: "Worker Pool", description: "Available for placement" },
  ];

  return (
    <DashboardShell>
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/labour-hire/workers">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Workers
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/external-employees/workers">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Workers Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Worker Profile Sidebar */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={worker.profileImage || ""} alt={`${worker.firstName} ${worker.lastName}`} />
                    <AvatarFallback>{getInitials(worker.firstName, worker.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{worker.firstName} {worker.lastName}</h2>
                    <p className="text-sm text-muted-foreground">{worker.occupation}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {getStatusBadge(worker.status)}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/labour-hire/workers/${worker.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{worker.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{worker.phone || "No phone number"}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Started {worker.startDate ? formatDate(worker.startDate) : "N/A"}</span>
                </div>
                {worker.endDate && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Ended {formatDate(worker.endDate)}</span>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Employment Details</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Employment Type</span>
                  </div>
                  <span className="text-sm font-medium">{worker.employmentType || "Not specified"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Max Hours</span>
                  </div>
                  <span className="text-sm font-medium">{worker.maxHoursPerWeek || "N/A"} hrs/week</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Hourly Rate</span>
                  </div>
                  <span className="text-sm font-medium">${worker.hourlyRate || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Award</span>
                  </div>
                  <span className="text-sm font-medium">{worker.awardClassification || "N/A"}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Experience & Skills</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Experience</span>
                  </div>
                  <span className="text-sm font-medium">{worker.experienceYears || "0"} years</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-start">
                    <Award className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="text-sm">Skills</span>
                      <p className="text-sm text-muted-foreground">{worker.skillsDescription || "No skills listed"}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Compliance</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Work Rights</span>
                  </div>
                  <span className="text-sm font-medium">{worker.workRights ? "Verified" : "Not Verified"}</span>
                </div>
                {worker.visaStatus && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Visa Status</span>
                    </div>
                    <span className="text-sm font-medium">{worker.visaStatus}</span>
                  </div>
                )}
                {worker.visaExpiryDate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Visa Expiry</span>
                    </div>
                    <span className="text-sm font-medium">{formatDate(worker.visaExpiryDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <Button className="w-full" asChild>
              <Link href={`/labour-hire/placements?workerId=${worker.id}`}>
                <Briefcase className="mr-2 h-4 w-4" />
                View Placements
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/labour-hire/timesheets?workerId=${worker.id}`}>
                <Clock className="mr-2 h-4 w-4" />
                View Timesheets
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Main Content Area */}
        <div className="md:col-span-5 space-y-6">
          {/* Workflow Stages */}
          <Card>
            <CardHeader>
              <CardTitle>Worker Progression</CardTitle>
              <CardDescription>
                Track worker progress through various employment stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
                <div className="relative flex justify-between">
                  {stages.slice(0, 7).map((stage, index) => (
                    <div 
                      key={stage.id} 
                      className={`flex flex-col items-center ${activeStage === stage.id ? 'z-10' : ''}`}
                      onClick={() => setActiveStage(stage.id)}
                    >
                      <div 
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center 
                          ${activeStage === stage.id 
                            ? 'bg-primary text-primary-foreground' 
                            : worker.status === stage.id 
                              ? 'bg-green-500 text-white' 
                              : 'bg-background border-2 border-border text-muted-foreground'
                          }
                          cursor-pointer hover:border-primary/50 transition-colors
                        `}
                      >
                        {worker.status === stage.id ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="mt-2 text-xs font-medium text-center max-w-[70px]">{stage.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-muted rounded-md">
                <div className="flex items-center mb-2">
                  <h3 className="text-sm font-medium">{stages.find(s => s.id === activeStage)?.name} Stage</h3>
                  {worker.status === activeStage && (
                    <Badge className="ml-2 bg-green-500">Current</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {stages.find(s => s.id === activeStage)?.description}
                </p>
                
                <div className="flex space-x-2">
                  {worker.status !== activeStage ? (
                    <Button size="sm">
                      Update to this stage
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="cursor-not-allowed opacity-50">
                      Current Stage
                    </Button>
                  )}
                  
                  {stages.findIndex(s => s.id === worker.status) < 
                   stages.findIndex(s => s.id === stages[stages.length - 1].id) && (
                    <Button size="sm" variant="outline">
                      Advance to Next Stage
                      <ArrowRightCircle className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Data Tabs */}
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="placements">Placements</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Worker Details</CardTitle>
                  <CardDescription>
                    Personal and employment information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Personal Information</h3>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Full Name</div>
                            <div className="text-sm">{worker.firstName} {worker.lastName}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Date of Birth</div>
                            <div className="text-sm">{worker.dateOfBirth ? formatDate(worker.dateOfBirth) : "Not provided"}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Email</div>
                            <div className="text-sm">{worker.email}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Phone</div>
                            <div className="text-sm">{worker.phone || "Not provided"}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Work Information</h3>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Occupation</div>
                            <div className="text-sm">{worker.occupation}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Start Date</div>
                            <div className="text-sm">{worker.startDate ? formatDate(worker.startDate) : "Not set"}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Status</div>
                            <div className="text-sm">{getStatusBadge(worker.status)}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-sm text-muted-foreground">Employment Type</div>
                            <div className="text-sm">{worker.employmentType || "Not specified"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Additional Notes</h3>
                      <p className="text-sm text-muted-foreground">
                        {worker.notes || "No additional notes available for this worker."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="placements" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Placements History</CardTitle>
                  <CardDescription>
                    Current and past worker placements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Placements Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      This worker doesn't have any active or past placements in the system yet.
                    </p>
                    <Button asChild>
                      <Link href={`/labour-hire/placements/create?workerId=${worker.id}`}>
                        Create New Placement
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Worker-related documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      There are no documents uploaded for this worker yet.
                    </p>
                    <Button>
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                  <CardDescription>
                    Worker-related notes and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Notes Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                      There are no notes recorded for this worker yet.
                    </p>
                    <Button>
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  );
}