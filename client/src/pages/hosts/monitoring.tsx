import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Search,
  User,
  Users,
  XCircle
} from "lucide-react";

// Types for apprentice placements
interface Placement {
  id: number;
  apprenticeId: number;
  hostEmployerId: number;
  startDate: string;
  endDate: string | null;
  status: string;
  position: string;
  department: string;
  supervisor: string;
  workHours: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  apprentice?: Apprentice;
}

interface Apprentice {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  qualification: string;
  startDate: string;
  expectedEndDate: string | null;
  completionDate: string | null;
}

interface MonitoringEntry {
  id: number;
  placementId: number;
  visitDate: string;
  fieldOfficerId: number;
  fieldOfficerName: string;
  type: string; // 'field_visit', 'phone_call', 'email', 'other'
  concerns: boolean;
  concernDetails: string | null;
  feedback: string | null;
  apprenticeFeedback: string | null;
  supervisorFeedback: string | null;
  trainingProgress: string;
  safetyRating: number;
  actions: string | null;
  followupRequired: boolean;
  followupDate: string | null;
  followupCompleted: boolean;
  createdAt: string;
  placement?: Placement;
}

const HostMonitoringPage = () => {
  const params = useParams<{ id?: string }>();
  const hostId = params.id ? parseInt(params.id) : undefined;
  const [activeTab, setActiveTab] = useState("placements");
  const [filter, setFilter] = useState({
    search: "",
    visitType: "",
    concernsOnly: false,
    followupRequired: false,
  });

  // Fetch host employer details
  const { data: host, isLoading: hostLoading } = useQuery({
    queryKey: ["/api/hosts", hostId],
    queryFn: async () => {
      if (!hostId) return null;
      const res = await fetch(`/api/hosts/${hostId}`);
      if (!res.ok) throw new Error("Failed to fetch host employer");
      return res.json();
    },
    enabled: !!hostId,
  });

  // Fetch placements for this host
  const { data: placements, isLoading: placementsLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "placements"],
    queryFn: async () => {
      if (!hostId) return [];
      const res = await fetch(`/api/hosts/${hostId}/placements`);
      if (!res.ok) throw new Error("Failed to fetch placements");
      return res.json() as Promise<Placement[]>;
    },
    enabled: !!hostId,
  });

  // Fetch monitoring entries
  const { data: monitoringEntries, isLoading: monitoringLoading } = useQuery({
    queryKey: ["/api/hosts", hostId, "monitoring"],
    queryFn: async () => {
      if (!hostId) return [];
      const res = await fetch(`/api/hosts/${hostId}/monitoring`);
      if (!res.ok) throw new Error("Failed to fetch monitoring entries");
      return res.json() as Promise<MonitoringEntry[]>;
    },
    enabled: !!hostId,
  });

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return format(new Date(dateStr), "dd MMM yyyy");
  };

  // Filter monitoring entries based on user filters
  const filteredEntries = monitoringEntries
    ? monitoringEntries.filter((entry) => {
        const matchesSearch =
          filter.search === "" ||
          entry.fieldOfficerName.toLowerCase().includes(filter.search.toLowerCase()) ||
          (entry.placement?.apprentice &&
            `${entry.placement.apprentice.firstName} ${entry.placement.apprentice.lastName}`
              .toLowerCase()
              .includes(filter.search.toLowerCase()));

        const matchesVisitType =
          filter.visitType === "" || entry.type === filter.visitType;

        const matchesConcerns = filter.concernsOnly ? entry.concerns : true;

        const matchesFollowup = filter.followupRequired
          ? entry.followupRequired && !entry.followupCompleted
          : true;

        return matchesSearch && matchesVisitType && matchesConcerns && matchesFollowup;
      })
    : [];

  // Format placement status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <ClipboardCheck className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "terminated":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Terminated
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  // Loading state
  if (hostLoading || placementsLoading || monitoringLoading) {
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
          {host ? `${host.name} - Monitoring` : "Host Employer Monitoring"}
        </h1>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Visit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Host Employer Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="placements" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="placements">Current Placements</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring History</TabsTrigger>
            </TabsList>
          <TabsContent value="placements" className="mt-0">
            {placements && placements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprentice</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {placements.map((placement) => (
                    <TableRow key={placement.id}>
                      <TableCell>
                        {placement.apprentice ? (
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {placement.apprentice.firstName} {placement.apprentice.lastName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>{placement.position}</TableCell>
                      <TableCell>{placement.supervisor}</TableCell>
                      <TableCell>{formatDate(placement.startDate)}</TableCell>
                      <TableCell>{formatDate(placement.endDate)}</TableCell>
                      <TableCell>{getStatusBadge(placement.status)}</TableCell>
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
                  No active placements found for this host employer.
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="mt-0">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search field officer or apprentice..."
                  className="pl-8 w-full"
                  value={filter.search}
                  onChange={(e) => setFilter({...filter, search: e.target.value})}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filter.visitType}
                  onValueChange={(value) => setFilter({...filter, visitType: value})}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Visit Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="field_visit">Field Visit</SelectItem>
                    <SelectItem value="phone_call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={filter.concernsOnly ? "default" : "outline"}
                  onClick={() => setFilter({...filter, concernsOnly: !filter.concernsOnly})}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Concerns Only
                </Button>
                <Button
                  variant={filter.followupRequired ? "default" : "outline"}
                  onClick={() => setFilter({...filter, followupRequired: !filter.followupRequired})}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Needs Follow-up
                </Button>
              </div>
            </div>

            {filteredEntries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Field Officer</TableHead>
                    <TableHead>Apprentice</TableHead>
                    <TableHead>Concerns</TableHead>
                    <TableHead>Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.visitDate)}</TableCell>
                      <TableCell>{entry.type.replace('_', ' ')}</TableCell>
                      <TableCell>{entry.fieldOfficerName}</TableCell>
                      <TableCell>
                        {entry.placement?.apprentice ? (
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            {entry.placement.apprentice.firstName} {entry.placement.apprentice.lastName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.concerns ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertCircle className="mr-1 h-3 w-3" /> Yes
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" /> No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.followupRequired ? (
                          entry.followupCompleted ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" /> Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Calendar className="mr-1 h-3 w-3" /> {formatDate(entry.followupDate)}
                            </Badge>
                          )
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
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
                  No monitoring entries match your filters.
                </div>
              </div>
            )}
          </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostMonitoringPage;