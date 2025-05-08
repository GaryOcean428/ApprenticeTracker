import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Clipboard, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Info
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface GtoComplianceStandard {
  id: number;
  standardNumber: string;
  standardName: string;
  standardDescription: string;
  category: string;
  requiredEvidence: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface StandardDetailProps {
  prefix: string;
}

const StandardDetail: React.FC<StandardDetailProps> = ({ prefix }) => {
  const { data: standards, isLoading, error } = useQuery<GtoComplianceStandard[]>({
    queryKey: ['/api/compliance/standards/prefix', prefix],
    queryFn: async () => {
      const response = await fetch(`/api/compliance/standards/prefix/${prefix}`);
      if (!response.ok) {
        throw new Error('Failed to fetch standards');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Standards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>There was an error loading the compliance standards. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!standards || standards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Standards Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No compliance standards found for this category.</p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'governance':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'recruitment':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'monitoring':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Standard {prefix} Requirements</h1>
        <p className="text-muted-foreground">
          These standards must be met by Group Training Organizations to maintain compliance.
        </p>
      </div>

      <Separator />

      {standards.map((standard: GtoComplianceStandard) => (
        <Card key={standard.id} className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" className="mb-2">Standard {standard.standardNumber}</Badge>
                <CardTitle className="text-xl">{standard.standardName}</CardTitle>
              </div>
              <Badge className={getCategoryBadgeColor(standard.category)}>
                {standard.category}
              </Badge>
            </div>
            <CardDescription className="text-base mt-2">
              {standard.standardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h3 className="text-sm font-medium flex items-center mb-2">
                <Clipboard className="mr-2 h-4 w-4" />
                Required Evidence
              </h3>
              <ul className="ml-6 list-disc space-y-1">
                {standard.requiredEvidence.map((evidence: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>

            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="compliance-tips">
                <AccordionTrigger className="text-sm font-medium flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  Compliance Tips
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="ml-6 list-disc space-y-2 text-sm">
                    <li>Maintain comprehensive documentation for all required evidence items.</li>
                    <li>Schedule regular internal audits to assess compliance with this standard.</li>
                    <li>Ensure all staff are trained on the requirements of this standard.</li>
                    <li>Implement a consistent review process to update documentation as needed.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}

      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Compliance Assessment Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Compliance with these standards is assessed through a formal audit process conducted by regulators.
            Ensure you have all the required evidence prepared and organized before your scheduled audit.
          </p>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">Maintain comprehensive documentation</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">Conduct regular internal audits</span>
            </div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">Implement continuous improvement processes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StandardDetail;