import { useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Pencil, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TrainingPackage {
  id: number;
  code: string;
  title: string;
  description: string;
  releaseNumber: string;
  releaseDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TrainingPackageDetail() {
  const { id } = useParams();
  const trainingPackageId = parseInt(id);
  const [, navigate] = useLocation();

  // Fetch training package data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/vet/training-packages/${trainingPackageId}`],
    enabled: !isNaN(trainingPackageId),
    queryFn: async () => {
      const response = await fetch(`/api/vet/training-packages/${trainingPackageId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch training package');
      }
      return response.json();
    },
  });

  const trainingPackage = data?.trainingPackage;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vet/training-packages">Training Packages</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Loading...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Skeleton className="h-[75px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Error state
  if (error || !trainingPackage) {
    return (
      <div className="space-y-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/vet/training-packages">Training Packages</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Error</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load training package'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/vet/training-packages')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Training Packages
        </Button>
      </div>
    );
  }

  // Render the component
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/vet/training-packages">Training Packages</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{trainingPackage.code || 'Training Package'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{trainingPackage.title}</h1>
            <Badge variant={trainingPackage.isActive ? 'default' : 'secondary'}>
              {trainingPackage.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {trainingPackage.code} - Release {trainingPackage.releaseNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/vet/training-packages')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => navigate(`/vet/training-packages/${trainingPackageId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Training Package Details</CardTitle>
          <CardDescription>Information about the training package</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium">Training Package Code</h3>
              <p>{trainingPackage.code}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Release</h3>
              <p>{trainingPackage.releaseNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Release Date</h3>
              <p>
                {trainingPackage.releaseDate
                  ? new Date(trainingPackage.releaseDate).toLocaleDateString()
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Status</h3>
              <Badge variant={trainingPackage.isActive ? 'default' : 'secondary'}>
                {trainingPackage.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Description</h3>
            <p className="whitespace-pre-wrap">
              {trainingPackage.description || 'No description available'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Qualifications</CardTitle>
          <CardDescription>Qualifications that are part of this training package</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Functionality coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
