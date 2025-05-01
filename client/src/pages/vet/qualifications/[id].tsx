import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  PenLine,
  BookOpen,
  Bookmark,
  GraduationCap,
  User,
  Building,
  Users,
  List,
  Clock,
  Calendar,
  ClipboardList,
  ArrowLeft,
  Check,
  X,
  Layers,
  BookOpen as Book,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function QualificationDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: qualification, isLoading, error } = useQuery({
    queryKey: [`/api/vet/qualifications/${id}`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/vet/qualifications/${id}`);
        if (!res.ok) throw new Error('Failed to fetch qualification details');
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load qualification details.",
          variant: "destructive"
        });
        throw error;
      }
    },
  });

  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: [`/api/vet/qualifications/${id}/units`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/vet/qualifications/${id}/units`);
        if (!res.ok) return [];
        return res.json();
      } catch (error) {
        return [];
      }
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !qualification) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate("/vet/qualifications")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Error</CardTitle>
          </div>
          <CardDescription>Failed to load qualification details</CardDescription>
        </CardHeader>
        <CardContent>
          <p>There was an error retrieving the qualification details. The qualification may not exist or there was a server error.</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/vet/qualifications")}
          >
            Back to Qualifications
          </Button>
        </CardContent>
      </Card>
    );
  }

  const core = units?.filter(unit => unit.isCore) || [];
  const elective = units?.filter(unit => !unit.isCore) || [];

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate("/vet/qualifications")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span>{qualification.qualificationCode}</span> 
            <span className="text-muted-foreground">-</span> 
            <span>{qualification.qualificationTitle}</span>
          </h1>
          <p className="text-muted-foreground">
            AQF Level: {qualification.aqfLevel} | Training Package: {qualification.trainingPackage}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              AQF Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{qualification.aqfLevel}</p>
            <p className="text-sm text-muted-foreground">Level {qualification.aqfLevelNumber}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{qualification.totalUnits || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">
              {qualification.coreUnits || 0} Core | {qualification.electiveUnits || 0} Elective
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Nominal Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{qualification.nominalHours || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">Training Duration</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">
            <BookOpen className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="structure">
            <Layers className="h-4 w-4 mr-2" />
            Qualification Structure
          </TabsTrigger>
          <TabsTrigger value="apprentices">
            <Users className="h-4 w-4 mr-2" />
            Enrolled Apprentices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Qualification Details</CardTitle>
              <CardDescription>
                Information about this qualification from Training.gov.au
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Qualification Code</h3>
                  <p>{qualification.qualificationCode}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Qualification Title</h3>
                  <p>{qualification.qualificationTitle}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Training Package</h3>
                  <p>{qualification.trainingPackage} (Release {qualification.trainingPackageRelease})</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <Badge variant={qualification.isActive ? "default" : "outline"}>
                    {qualification.isActive ? "Current" : "Superseded"}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Apprenticeship Qualification</h3>
                  {qualification.isApprenticeshipQualification ? 
                    <Badge variant="default" className="bg-green-100 text-success">
                      <Check className="mr-1 h-3 w-3" />
                      Yes
                    </Badge> : 
                    <Badge variant="outline">
                      <X className="mr-1 h-3 w-3" />
                      No
                    </Badge>
                  }
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Funded Qualification</h3>
                  {qualification.isFundedQualification ? 
                    <Badge variant="default" className="bg-green-100 text-success">
                      <Check className="mr-1 h-3 w-3" />
                      Yes
                    </Badge> : 
                    <Badge variant="outline">
                      <X className="mr-1 h-3 w-3" />
                      No
                    </Badge>
                  }
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                <p className="text-sm">{qualification.qualificationDescription}</p>
              </div>

              {qualification.fundingDetails && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Funding Details</h3>
                    <p className="text-sm">{qualification.fundingDetails}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Last updated: {formatDate(qualification.updatedAt)}
              </div>
              <Button variant="outline" onClick={() => navigate(`/vet/qualifications/${id}/edit`)}>
                <PenLine className="mr-2 h-4 w-4" />
                Edit Qualification
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Qualification Structure</CardTitle>
              <CardDescription>
                Units of Competency that make up this qualification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="core">
                <TabsList className="mb-4">
                  <TabsTrigger value="core">
                    Core Units ({core.length}/{qualification.coreUnits || 0})
                  </TabsTrigger>
                  <TabsTrigger value="elective">
                    Elective Units ({elective.length}/{qualification.electiveUnits || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="core">
                  {unitsLoading ? (
                    <div className="space-y-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : core.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Unit Code</TableHead>
                          <TableHead>Unit Title</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {core.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.unitCode}</TableCell>
                            <TableCell>{unit.unitTitle}</TableCell>
                            <TableCell>{unit.nominalHours || 'N/A'}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/vet/units/${unit.unitId}`)}
                              >
                                <Book className="h-4 w-4 mr-2" />
                                View Unit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 border rounded-md text-center">
                      <p className="text-muted-foreground">No core units found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate(`/vet/qualifications/${id}/structure`)}
                      >
                        Manage Qualification Structure
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="elective">
                  {unitsLoading ? (
                    <div className="space-y-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : elective.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Unit Code</TableHead>
                          <TableHead>Unit Title</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {elective.map((unit) => (
                          <TableRow key={unit.id}>
                            <TableCell className="font-medium">{unit.unitCode}</TableCell>
                            <TableCell>{unit.unitTitle}</TableCell>
                            <TableCell>{unit.nominalHours || 'N/A'}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/vet/units/${unit.unitId}`)}
                              >
                                <Book className="h-4 w-4 mr-2" />
                                View Unit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 border rounded-md text-center">
                      <p className="text-muted-foreground">No elective units found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => navigate(`/vet/qualifications/${id}/structure`)}
                      >
                        Manage Qualification Structure
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate(`/vet/qualifications/${id}/structure`)}>
                <Layers className="mr-2 h-4 w-4" />
                Manage Qualification Structure
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="apprentices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Apprentices</CardTitle>
              <CardDescription>
                Apprentices currently enrolled in this qualification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md text-center">
                <p className="text-muted-foreground mb-2">No apprentices currently enrolled in this qualification</p>
                <p className="text-sm text-muted-foreground">When apprentices are enrolled in this qualification, they will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}