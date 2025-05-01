import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Eye,
  FilePlus,
  MapPin,
  Plus,
  Search,
  Users
} from "lucide-react";

// Types for vacancies
interface Vacancy {
  id: number;
  hostEmployerId: number;
  hostEmployerName: string;
  title: string;
  location: string;
  trade: string;
  description: string;
  requirements: string;
  status: "open" | "filled" | "closed";
  postedDate: string;
  closingDate: string | null;
  applicationCount: number;
  isHighPriority: boolean;
}

const HostVacanciesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch vacancies
  const { data: vacancies, isLoading } = useQuery({
    queryKey: ["/api/vacancies"],
    queryFn: async () => {
      const res = await fetch("/api/vacancies");
      if (!res.ok) {
        // If the endpoint doesn't exist yet, return mock data
        console.warn("API endpoint not available, returning empty array");
        return [];
      }
      return res.json() as Promise<Vacancy[]>;
    }
  });

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No date";
    return format(new Date(dateStr), "dd MMM yyyy");
  };

  // Filter vacancies based on search, status, and active tab
  const filteredVacancies = vacancies
    ? vacancies.filter((vacancy) => {
        // Filter by search query (title, location, or trade)
        const matchesSearch =
          vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vacancy.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vacancy.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vacancy.hostEmployerName.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by status
        const matchesStatus = !statusFilter || vacancy.status === statusFilter;

        // Filter by tab
        const matchesTab =
          activeTab === "all" ||
          (activeTab === "priority" && vacancy.isHighPriority) ||
          (activeTab === "recent" &&
            new Date(vacancy.postedDate) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

        return matchesSearch && matchesStatus && matchesTab;
      })
    : [];

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Open
          </Badge>
        );
      case "filled":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Users className="mr-1 h-3 w-3" /> Filled
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <AlertTriangle className="mr-1 h-3 w-3" /> Closed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vacancy Management</h1>
        <Link href="/hosts/vacancies/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post New Vacancy
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Host Employer Vacancies</CardTitle>
          <CardDescription>
            Manage and view all apprenticeship vacancies posted by host employers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Vacancies</TabsTrigger>
              <TabsTrigger value="priority">High Priority</TabsTrigger>
              <TabsTrigger value="recent">Recent (7 days)</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title, location, or trade..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(null)}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "open" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("open")}
              >
                Open
              </Button>
              <Button
                variant={statusFilter === "filled" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("filled")}
              >
                Filled
              </Button>
              <Button
                variant={statusFilter === "closed" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("closed")}
              >
                Closed
              </Button>
            </div>
          </div>

          {filteredVacancies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Host Employer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVacancies.map((vacancy) => (
                  <TableRow key={vacancy.id}>
                    <TableCell className="font-medium">
                      {vacancy.isHighPriority && (
                        <Badge className="bg-red-100 text-red-800 mr-2">
                          Priority
                        </Badge>
                      )}
                      {vacancy.title}
                    </TableCell>
                    <TableCell>
                      <Link href={`/hosts/${vacancy.hostEmployerId}`}>
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {vacancy.hostEmployerName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {vacancy.location}
                      </div>
                    </TableCell>
                    <TableCell>{vacancy.trade}</TableCell>
                    <TableCell>{formatDate(vacancy.postedDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        {vacancy.applicationCount}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(vacancy.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <FilePlus className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No vacancies found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter || activeTab !== "all"
                  ? "Try changing your search or filter criteria"
                  : "Get started by creating a new vacancy"}
              </p>
              <Link href="/hosts/vacancies/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Post New Vacancy
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostVacanciesPage;
