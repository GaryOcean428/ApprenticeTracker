import { useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useToast } from '@/hooks/use-toast';

export default function UnitOfCompetencyDetail() {
  const { id } = useParams();
  const unitId = parseInt(id);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch unit details
  const {
    data: unit,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/vet/units/${unitId}`],
    enabled: !isNaN(unitId),
  });

  // If there's a numeric ID, but it's not found in the database or still loading
  useEffect(() => {
    if (!isNaN(unitId) && !isLoading && !unit && !error) {
      toast({
        title: 'Unit not found',
        description: `No unit of competency with ID ${unitId} exists in the system`,
        variant: 'destructive',
      });
      navigate('/vet/units');
    }
  }, [unitId, unit, isLoading, error, navigate, toast]);

  if (isNaN(unitId)) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Invalid Unit ID</h1>
        <p className="text-muted-foreground mb-4">The Unit ID must be a number.</p>
        <Button onClick={() => navigate('/vet/units')}>Return to Units List</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Unit</h1>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={() => navigate('/vet/units')}>Return to Units List</Button>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Unit Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested unit of competency could not be found.
        </p>
        <Button onClick={() => navigate('/vet/units')}>Return to Units List</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/vet/units">Units of Competency</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <span className="font-medium">{unit.unitCode}</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/vet/units')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{unit.unitTitle}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/vet/units/${unitId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Unit
          </Button>
        </div>
      </div>

      {/* Unit Status and Metadata */}
      <div className="flex items-center gap-4">
        <Badge variant={unit.isActive ? 'default' : 'outline'}>
          {unit.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant={unit.isImported ? 'secondary' : 'outline'}>
          {unit.isImported ? 'Imported from TGA' : 'Custom'}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Code: <span className="font-medium">{unit.unitCode}</span>
        </span>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Information</CardTitle>
              <CardDescription>Details about this unit of competency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Unit Code</h3>
                  <p className="text-lg">{unit.unitCode}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <p className="text-lg flex items-center gap-2">
                    {unit.isActive ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" /> Inactive
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Unit Title</h3>
                <p className="text-lg">{unit.unitTitle}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="mt-1">
                  {unit.description ||
                    'This unit describes the skills and knowledge required to perform the tasks outlined in the elements and performance criteria, which form part of this unit.'}
                </p>
              </div>

              {unit.trainingPackage && (
                <div>
                  <h3 className="text-sm font-medium">Training Package</h3>
                  <p className="text-lg">{unit.trainingPackage}</p>
                </div>
              )}

              {unit.releaseDate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Release Date</h3>
                    <p className="text-lg">{new Date(unit.releaseDate).toLocaleDateString()}</p>
                  </div>
                  {unit.expiryDate && (
                    <div>
                      <h3 className="text-sm font-medium">Expiry Date</h3>
                      <p className="text-lg">{new Date(unit.expiryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Details</CardTitle>
              <CardDescription>Resources and information for implementation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Assessment Requirements</h3>
                <p className="mt-1">
                  {unit.assessmentRequirements ||
                    'Assessment of skills must take place under the following conditions...'}
                </p>
              </div>

              {unit.nominalHours && (
                <div>
                  <h3 className="text-sm font-medium">Nominal Hours</h3>
                  <p className="text-lg">{unit.nominalHours} hours</p>
                </div>
              )}

              {/* Skills and Elements would go here */}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Qualification Usage</CardTitle>
              <CardDescription>Qualifications that include this unit of competency</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This information is being populated. Please check back later.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessments Tab */}
        <TabsContent value="assessments">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Records</CardTitle>
              <CardDescription>
                Assessment activities and evidence records for this unit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No assessment records found for this unit.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
