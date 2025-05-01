import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, FileText, CalendarCheck, HardHat, Info, Clipboard, AlertCircle } from "lucide-react";
import { format } from "date-fns";

// Define types for agreement data
interface HostEmployerAgreement {
  id: number;
  hostEmployerId: number;
  agreementDate: string;
  expiryDate: string;
  inductionProvided: boolean;
  inductionDate: string | null;
  whsCompliance: "compliant" | "review_required" | "non_compliant";
  whsAuditDate: string | null;
  agreementDocument: Record<string, any>;
  supervisionCapacity: boolean;
  trainingCapacity: boolean;
  facilityCapacity: boolean;
  reviewNotes: string | null;
  reviewedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

const HostAgreementPage = () => {
  const params = useParams<{ id?: string }>();
  const hostId = params.id ? parseInt(params.id) : undefined;
  const [activeTab, setActiveTab] = useState("current");

  // Fetch host employer details
  const { data: host, isLoading: hostLoading } = useQuery({
    queryKey: ['/api/hosts', hostId],
    queryFn: async () => {
      if (!hostId) return null;
      const res = await fetch(`/api/hosts/${hostId}`);
      if (!res.ok) throw new Error('Failed to fetch host employer');
      return res.json();
    },
    enabled: !!hostId
  });

  // Fetch host employer agreements
  const { data: agreements, isLoading: agreementsLoading } = useQuery({
    queryKey: ['/api/host-agreements', hostId],
    queryFn: async () => {
      if (!hostId) return [];
      const res = await fetch(`/api/host-agreements/${hostId}`);
      if (!res.ok) throw new Error('Failed to fetch agreements');
      return res.json() as Promise<HostEmployerAgreement[]>;
    },
    enabled: !!hostId
  });

  // Sort agreements by date (most recent first)
  const sortedAgreements = agreements ? [...agreements].sort(
    (a, b) => new Date(b.agreementDate).getTime() - new Date(a.agreementDate).getTime()
  ) : [];

  // Filter agreements based on active tab
  const filteredAgreements = sortedAgreements.filter(agreement => {
    const isExpired = new Date(agreement.expiryDate) < new Date();
    if (activeTab === "current") return !isExpired;
    return isExpired;
  });

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not available';
    return format(new Date(dateStr), 'dd MMM yyyy');
  };

  // Determine compliance status badge
  const getComplianceBadge = (status: string) => {
    switch(status) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Compliant</Badge>;
      case "review_required":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="mr-1 h-3 w-3" /> Review Required</Badge>;
      case "non_compliant":
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="mr-1 h-3 w-3" /> Non-Compliant</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800"><Info className="mr-1 h-3 w-3" /> Unknown</Badge>;
    }
  };

  // Loading state
  if (hostLoading || agreementsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {host ? `${host.name} - Agreements` : 'Host Employer Agreements'}
        </h1>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          New Agreement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary</CardTitle>
          <CardDescription>
            Overview of compliance status and requirements for this host employer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 flex flex-col">
              <div className="text-sm text-muted-foreground mb-2 flex items-center">
                <CalendarCheck className="mr-2 h-4 w-4" />
                Agreement Status
              </div>
              <div className="text-lg font-medium">
                {sortedAgreements.length > 0 ? 
                  (new Date(sortedAgreements[0].expiryDate) > new Date() ? 
                    <span className="text-green-600">Current</span> : 
                    <span className="text-red-600">Expired</span>) : 
                  <span className="text-yellow-600">No Agreement</span>}
              </div>
              {sortedAgreements.length > 0 && (
                <div className="text-sm mt-2">
                  Expires: {formatDate(sortedAgreements[0].expiryDate)}
                </div>
              )}
            </div>
            
            <div className="border rounded-lg p-4 flex flex-col">
              <div className="text-sm text-muted-foreground mb-2 flex items-center">
                <HardHat className="mr-2 h-4 w-4" />
                WHS Compliance
              </div>
              <div className="text-lg font-medium">
                {sortedAgreements.length > 0 ? 
                  getComplianceBadge(sortedAgreements[0].whsCompliance) : 
                  <span className="text-muted-foreground">No data</span>}
              </div>
              {sortedAgreements.length > 0 && sortedAgreements[0].whsAuditDate && (
                <div className="text-sm mt-2">
                  Last audit: {formatDate(sortedAgreements[0].whsAuditDate)}
                </div>
              )}
            </div>
            
            <div className="border rounded-lg p-4 flex flex-col">
              <div className="text-sm text-muted-foreground mb-2 flex items-center">
                <Clipboard className="mr-2 h-4 w-4" />
                Induction Status
              </div>
              <div className="text-lg font-medium">
                {sortedAgreements.length > 0 ? 
                  (sortedAgreements[0].inductionProvided ? 
                    <span className="text-green-600">Completed</span> : 
                    <span className="text-yellow-600">Required</span>) : 
                  <span className="text-muted-foreground">No data</span>}
              </div>
              {sortedAgreements.length > 0 && sortedAgreements[0].inductionDate && (
                <div className="text-sm mt-2">
                  Date: {formatDate(sortedAgreements[0].inductionDate)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="current">Current Agreements</TabsTrigger>
              <TabsTrigger value="expired">Expired Agreements</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {filteredAgreements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agreement Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>WHS Compliance</TableHead>
                  <TableHead>Supervision</TableHead>
                  <TableHead>Training</TableHead>
                  <TableHead>Facilities</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgreements.map(agreement => (
                  <TableRow key={agreement.id}>
                    <TableCell>{formatDate(agreement.agreementDate)}</TableCell>
                    <TableCell>{formatDate(agreement.expiryDate)}</TableCell>
                    <TableCell>{getComplianceBadge(agreement.whsCompliance)}</TableCell>
                    <TableCell>
                      {agreement.supervisionCapacity ? 
                        <CheckCircle className="h-5 w-5 text-green-600" /> : 
                        <AlertCircle className="h-5 w-5 text-red-600" />}
                    </TableCell>
                    <TableCell>
                      {agreement.trainingCapacity ? 
                        <CheckCircle className="h-5 w-5 text-green-600" /> : 
                        <AlertCircle className="h-5 w-5 text-red-600" />}
                    </TableCell>
                    <TableCell>
                      {agreement.facilityCapacity ? 
                        <CheckCircle className="h-5 w-5 text-green-600" /> : 
                        <AlertCircle className="h-5 w-5 text-red-600" />}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <div className="text-muted-foreground">
                No {activeTab === "current" ? "current" : "expired"} agreements found.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostAgreementPage;