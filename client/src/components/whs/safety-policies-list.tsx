import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Plus, 
  Download,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function SafetyPoliciesList() {
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/whs/policies', { search }],
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Safety Policies & Procedures</CardTitle>
              <CardDescription>WHS policies, procedures, and guidelines</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search policies..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Example policies - would be replaced with actual data */}
              <PolicyCard 
                title="Workplace Safety Policy"
                description="General workplace safety guidelines and responsibilities"
                lastUpdated="2025-03-15"
                docType="PDF"
                status="active"
              />
              <PolicyCard 
                title="Incident Reporting Procedure"
                description="Step-by-step guidelines for reporting workplace incidents and accidents"
                lastUpdated="2025-04-02"
                docType="PDF"
                status="active"
              />
              <PolicyCard 
                title="Emergency Response Plan"
                description="Procedures for responding to workplace emergencies"
                lastUpdated="2025-01-25"
                docType="PDF"
                status="active"
              />
              <PolicyCard 
                title="PPE Requirements"
                description="Personal protective equipment standards and usage guidelines"
                lastUpdated="2025-02-18"
                docType="PDF"
                status="active"
              />
              <PolicyCard 
                title="Manual Handling Guidelines"
                description="Safe techniques for lifting and manual handling tasks"
                lastUpdated="2024-12-10"
                docType="PDF"
                status="review-needed"
              />
              <PolicyCard 
                title="First Aid Procedures"
                description="First aid protocols and first responder guidelines"
                lastUpdated="2025-03-05"
                docType="PDF"
                status="active"
              />
              <PolicyCard 
                title="WHS Training Requirements"
                description="Training requirements and schedules for all staff"
                lastUpdated="2024-11-20"
                docType="PDF"
                status="review-needed"
              />
              <PolicyCard 
                title="Risk Assessment Template"
                description="Standard template for conducting workplace risk assessments"
                lastUpdated="2025-04-10"
                docType="DOCX"
                status="active"
              />
              <PolicyCard 
                title="Site Safety Inspection Checklist"
                description="Checklist for conducting regular safety inspections"
                lastUpdated="2025-03-28"
                docType="PDF"
                status="active"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External WHS Resources</CardTitle>
          <CardDescription>Links to government and industry WHS resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <ExternalResourceCard 
              title="SafeWork Australia"
              description="National WHS policies, legislation and guidance"
              link="https://www.safeworkaustralia.gov.au/"
            />
            <ExternalResourceCard 
              title="State WHS Regulator"
              description="State-specific WHS regulations and compliance information"
              link="#"
            />
            <ExternalResourceCard 
              title="Group Training Australia"
              description="GTO-specific safety resources and guidelines"
              link="https://www.grouptraining.com.au/"
            />
            <ExternalResourceCard 
              title="Australian Apprenticeships"
              description="WHS information for apprentices and trainees"
              link="https://www.australianapprenticeships.gov.au/"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

interface PolicyCardProps {
  title: string;
  description: string;
  lastUpdated: string;
  docType: string;
  status: 'active' | 'review-needed' | 'draft';
}

function PolicyCard({ title, description, lastUpdated, docType, status }: PolicyCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'review-needed':
        return <Badge variant="warning">Review Needed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="line-clamp-2 min-h-[40px]">
              {description}
            </CardDescription>
          </div>
          <div>
            {getStatusBadge(status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <FileText className="h-4 w-4" />
          <span>{docType} Document</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Updated: {new Date(lastUpdated).toLocaleDateString()}</span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 border-t">
        <div className="flex justify-between w-full">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="p-6 min-h-[500px] flex items-center justify-center bg-muted">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>Document viewer would be integrated here</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

interface ExternalResourceCardProps {
  title: string;
  description: string;
  link: string;
}

function ExternalResourceCard({ title, description, link }: ExternalResourceCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4 items-start">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <Button variant="outline" size="sm" asChild>
              <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                Visit Resource
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}