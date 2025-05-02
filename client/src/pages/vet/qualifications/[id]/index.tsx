import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  GraduationCap,
  FileText,
  Award,
  BookOpen,
  ListTodo,
  Clock,
  Users,
  PenLine,
  Download,
  Share2,
  AlertCircle,
  Tags,
  Code,
  FileCode,
  Monitor,
  ArrowUpDown,
  ChevronDown,
  User,
  Building,
  Calendar,
  ListChecks,
  Briefcase
} from "lucide-react";

interface Unit {
  id: number;
  unitCode: string;
  unitTitle: string;
  unitDescription: string;
  isCore: boolean;
  nominalHours: number;
  prerequisiteUnitIds: number[] | null;
  createdAt: string;
  updatedAt: string;
}

interface QualificationStructure {
  id: number;
  qualificationId: number;
  unitId: number;
  isCore: boolean;
  unitGroup: string | null;
  createdAt: string;
  updatedAt: string;
  unit: Unit;
}

interface Qualification {
  id: number;
  qualificationCode: string;
  qualificationTitle: string;
  qualificationDescription: string;
  aqfLevel: string;
  aqfLevelNumber: number;
  trainingPackage: string;
  trainingPackageRelease: string;
  totalUnits: number;
  coreUnits: number;
  electiveUnits: number;
  nominalHours: number;
  isActive: boolean;
  isApprenticeshipQualification: boolean;
  isFundedQualification: boolean;
  fundingDetails: string | null;
  createdAt: string;
  updatedAt: string;
  structure?: QualificationStructure[];
}

function getLevelColor(level: string | undefined) {
  if (!level) return "bg-gray-100 text-gray-800";
  
  const levelNumber = parseInt(level.match(/\d+/)?.[0] || "1");
  
  switch(levelNumber) {
    case 1: case 2: return "bg-blue-100 text-blue-800";
    case 3: case 4: return "bg-green-100 text-green-800";
    case 5: case 6: return "bg-yellow-100 text-yellow-800";
    case 7: case 8: return "bg-orange-100 text-orange-800";
    case 9: case 10: return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

const QualificationSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
      <Skeleton className="h-32" />
    </div>
    
    <div>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-24 w-full" />
    </div>
    
    <div>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="space-y-2">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  </div>
);

export default function QualificationDetails() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: qualificationData, isLoading, error } = useQuery<{ qualification: Qualification }>({
    queryKey: [`/api/vet/qualifications/${params.id}`],
  });
  
  const qualification = qualificationData?.qualification;
  
  if (error) {
    toast({
      variant: "destructive",
      title: "Error loading qualification",
      description: "There was a problem loading the qualification data. Please try again later."
    });
  }
  
  const coreUnits = qualification?.structure?.filter(item => item.isCore) || [];
  const electiveUnits = qualification?.structure?.filter(item => !item.isCore) || [];
  
  // Group electives by unit group if available
  const groupedElectives: Record<string, QualificationStructure[]> = {};
  electiveUnits.forEach(item => {
    const group = item.unitGroup || "General Electives";
    if (!groupedElectives[group]) {
      groupedElectives[group] = [];
    }
    groupedElectives[group].push(item);
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/vet/qualifications">Qualifications</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{qualification?.qualificationCode || "Details"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/vet/qualifications")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoading ? <Skeleton className="h-8 w-48" /> : qualification?.qualificationTitle}
            </h1>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`/vet/qualifications/${params.id}/edit`)}>
            <PenLine className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Export Details
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <QualificationSkeleton />
      ) : qualification ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="text-base py-1 px-3">
              {qualification.qualificationCode}
            </Badge>
            <Badge variant="outline" className={`${getLevelColor(qualification.aqfLevel)} border-0 text-base py-1 px-3`}>
              {qualification.aqfLevel}
            </Badge>
            {qualification.isApprenticeshipQualification && (
              <Badge variant="secondary" className="text-base py-1 px-3">
                Apprenticeship Qualification
              </Badge>
            )}
            {qualification.isFundedQualification && (
              <Badge variant="secondary" className="text-base py-1 px-3">
                Government Funded
              </Badge>
            )}
            <Badge variant={qualification.isActive ? "default" : "destructive"}>
              {qualification.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  Training Package
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{qualification.trainingPackage || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Release: {qualification.trainingPackageRelease || 'N/A'}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                  Unit Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xl font-semibold">{qualification.totalUnits || 0}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{qualification.coreUnits || 0}</p>
                    <p className="text-sm text-muted-foreground">Core</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{qualification.electiveUnits || 0}</p>
                    <p className="text-sm text-muted-foreground">Elective</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  Nominal Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">
                  {qualification.nominalHours || 0} hours
                </p>
                <p className="text-sm text-muted-foreground">
                  Approximately {Math.round((qualification.nominalHours || 0) / 38)} weeks
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="units">Units of Competency</TabsTrigger>
              <TabsTrigger value="related">Related Information</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{qualification.qualificationDescription}</p>
                </CardContent>
              </Card>
              
              {qualification.fundingDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle>Funding Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{qualification.fundingDetails}</p>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Qualification Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{new Date(qualification.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span>{new Date(qualification.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">External Resources</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Monitor className="mr-2 h-4 w-4" />
                        View on Training.gov.au
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileCode className="mr-2 h-4 w-4" />
                        Download Mapping Guide
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="units" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Core Units ({coreUnits.length})</CardTitle>
                  <CardDescription>
                    All core units must be completed for this qualification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Unit Code</TableHead>
                          <TableHead>Unit Title</TableHead>
                          <TableHead className="w-[100px] text-right">Hours</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coreUnits.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                              No core units found for this qualification
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {coreUnits.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.unit?.unitCode || 'N/A'}</TableCell>
                            <TableCell>{item.unit?.unitTitle || 'N/A'}</TableCell>
                            <TableCell className="text-right">{item.unit?.nominalHours || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {Object.entries(groupedElectives).map(([group, units]) => (
                <Card key={group}>
                  <CardHeader>
                    <CardTitle>Elective Units: {group} ({units.length})</CardTitle>
                    <CardDescription>
                      {group === "General Electives" ? 
                        `Select from these units to complete the required ${qualification.electiveUnits} elective units` :
                        `Units from the ${group} group`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[180px]">Unit Code</TableHead>
                            <TableHead>Unit Title</TableHead>
                            <TableHead className="w-[100px] text-right">Hours</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {units.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.unit?.unitCode || 'N/A'}</TableCell>
                              <TableCell>{item.unit?.unitTitle || 'N/A'}</TableCell>
                              <TableCell className="text-right">{item.unit?.nominalHours || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="related" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apprenticeships</CardTitle>
                  <CardDescription>
                    Apprentices currently enrolled in this qualification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Apprentice</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No apprentices currently enrolled in this qualification
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Host Employers</CardTitle>
                  <CardDescription>
                    Host employers seeking or employing apprentices with this qualification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Host Employer</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Vacancies</TableHead>
                          <TableHead>Current Placements</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No host employers associated with this qualification
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Qualification Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The qualification you're looking for doesn't exist or you may not have permission to view it.
          </p>
          <Button onClick={() => navigate("/vet/qualifications")}>
            Return to Qualifications
          </Button>
        </div>
      )}
    </div>
  );
}