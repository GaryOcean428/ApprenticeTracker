import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle, 
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Activity,
  ArrowUpDown,
  Calendar,
  FileCheck,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";

export default function RiskManagement() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("risks");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Get GTO compliance standards related to Risk Management
  const { data: standards, isLoading: standardsLoading } = useQuery({
    queryKey: ['/api/gto-compliance/standards', 'Risk Management'],
    queryFn: async () => {
      const res = await fetch('/api/gto-compliance/standards?category=Risk%20Management');
      if (!res.ok) throw new Error('Failed to fetch standards');
      return res.json();
    }
  });

  // Fetch assessment data
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/gto-compliance/assessments', 'Risk Management'],
    queryFn: async () => {
      const res = await fetch('/api/gto-compliance/assessments?category=Risk%20Management');
      if (!res.ok) throw new Error('Failed to fetch assessments');
      return res.json();
    }
  });

  // Fetch risk register (mock for now)
  const { data: risks, isLoading: risksLoading } = useQuery({
    queryKey: ['/api/gto-compliance/risks'],
    queryFn: async () => {
      // Mocked risk data - would be replaced with actual API fetch
      return [
        {
          id: 1,
          title: "Inadequate apprentice safety training",
          description: "Risk of workplace injuries due to inadequate safety training for apprentices before placement",
          category: "Health & Safety",
          severity: "high",
          likelihood: "medium",
          impact: "high",
          controls: "Mandatory safety induction for all apprentices, documented training records",
          status: "active",
          owner: "WHS Manager",
          dueDate: "2024-07-15T00:00:00.000Z",
          lastReview: "2024-04-01T00:00:00.000Z"
        },
        {
          id: 2,
          title: "Non-compliance with RTO standards",
          description: "Risk of regulatory action due to non-compliance with training standards",
          category: "Compliance",
          severity: "high",
          likelihood: "low",
          impact: "high",
          controls: "Regular internal audits, staff training on compliance requirements",
          status: "active",
          owner: "Compliance Manager",
          dueDate: "2024-08-20T00:00:00.000Z",
          lastReview: "2024-03-15T00:00:00.000Z"
        },
        {
          id: 3,
          title: "Inadequate host employer screening",
          description: "Risk of unsuitable work environments for apprentices due to inadequate screening of host employers",
          category: "Operations",
          severity: "medium",
          likelihood: "medium",
          impact: "medium",
          controls: "Standardized host employer assessment process, regular site visits",
          status: "active",
          owner: "Field Operations Manager",
          dueDate: "2024-06-30T00:00:00.000Z",
          lastReview: "2024-02-10T00:00:00.000Z"
        },
        {
          id: 4,
          title: "Data breach of apprentice records",
          description: "Risk of unauthorized access to sensitive apprentice data",
          category: "Information Security",
          severity: "high",
          likelihood: "low",
          impact: "high",
          controls: "Encryption of sensitive data, access controls, regular security audits",
          status: "active",
          owner: "IT Manager",
          dueDate: "2024-05-30T00:00:00.000Z",
          lastReview: "2024-01-20T00:00:00.000Z"
        },
        {
          id: 5,
          title: "Insufficient qualified trainers",
          description: "Risk of training quality issues due to shortage of qualified trainers",
          category: "Training Quality",
          severity: "medium",
          likelihood: "medium",
          impact: "high",
          controls: "Trainer recruitment strategy, professional development program",
          status: "active",
          owner: "Training Manager",
          dueDate: "2024-09-15T00:00:00.000Z",
          lastReview: "2024-03-20T00:00:00.000Z"
        },
        {
          id: 6,
          title: "Poor apprentice retention",
          description: "Risk of high apprentice dropout rates affecting completion statistics and funding",
          category: "Operational",
          severity: "medium",
          likelihood: "high",
          impact: "medium",
          controls: "Mentoring program, regular check-ins, early intervention process",
          status: "active",
          owner: "Apprentice Support Manager",
          dueDate: "2024-07-01T00:00:00.000Z",
          lastReview: "2024-02-15T00:00:00.000Z"
        },
        {
          id: 7,
          title: "Financial viability threats",
          description: "Risk to financial sustainability due to funding changes or economic downturn",
          category: "Financial",
          severity: "high",
          likelihood: "medium",
          impact: "high",
          controls: "Diversified funding sources, financial reserves policy, regular financial reviews",
          status: "active",
          owner: "Finance Director",
          dueDate: "2024-06-15T00:00:00.000Z",
          lastReview: "2024-03-01T00:00:00.000Z"
        },
      ];
    }
  });

  // Get status badge styling
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800">Medium</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate risk metrics
  const calculateRiskMetrics = () => {
    if (!risks) return { high: 0, medium: 0, low: 0, total: 0 };
    
    const total = risks.length;
    const high = risks.filter(r => r.severity === 'high').length;
    const medium = risks.filter(r => r.severity === 'medium').length;
    const low = risks.filter(r => r.severity === 'low').length;
    
    return { high, medium, low, total };
  };
  
  const metrics = calculateRiskMetrics();

  // Filter risks based on search and filters
  const filteredRisks = risks?.filter(risk => {
    // Apply search filter
    const matchesSearch = searchQuery === "" || 
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply severity filter
    const matchesSeverity = severityFilter === "all" || risk.severity === severityFilter;
    
    // Apply category filter
    const matchesCategory = categoryFilter === "all" || risk.category === categoryFilter;
    
    return matchesSearch && matchesSeverity && matchesCategory;
  });

  // Get unique risk categories for filter
  const riskCategories = risks ? Array.from(new Set(risks.map(r => r.category))) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Risk Management</h2>
          <p className="text-muted-foreground">
            Manage and monitor risk management compliance for GTO operations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/gto-compliance/standard-assessment")}>
            <FileCheck className="mr-2 h-4 w-4" /> New Assessment
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Risk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Add New Risk</DialogTitle>
                <DialogDescription>
                  Document a new risk in the risk register for monitoring and mitigation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Risk Title</Label>
                  <Input id="title" placeholder="Enter risk title" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the risk in detail" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Health & Safety">Health & Safety</SelectItem>
                        <SelectItem value="Compliance">Compliance</SelectItem>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                        <SelectItem value="Information Security">Information Security</SelectItem>
                        <SelectItem value="Training Quality">Training Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="owner">Risk Owner</Label>
                    <Input id="owner" placeholder="Enter risk owner" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="likelihood">Likelihood</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="impact">Impact</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="controls">Controls & Mitigation</Label>
                  <Textarea id="controls" placeholder="Describe controls and mitigation strategies" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Review Due Date</Label>
                  <Input id="dueDate" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => toast({ title: "Risk Management", description: "This feature is coming soon" })}>Add Risk</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Risk Profile</CardTitle>
            <CardDescription>Current risk severity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-red-500"></div>
                  <span>High Severity</span>
                </div>
                <span className="font-semibold">{metrics.high}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                  <span>Medium Severity</span>
                </div>
                <span className="font-semibold">{metrics.medium}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  <span>Low Severity</span>
                </div>
                <span className="font-semibold">{metrics.low}</span>
              </div>
              
              <div className="pt-2 mt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Risks</span>
                  <span className="font-semibold">{metrics.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Risk management compliance status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                  <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">Risk Framework</p>
                    <Badge className="ml-2 bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Last reviewed: April 1, 2024</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                  <Activity className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">Risk Register</p>
                    <Badge className="ml-2 bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Last reviewed: March 15, 2024</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full mr-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">Risk Controls</p>
                    <Badge className="ml-2 bg-amber-100 text-amber-800">Review Required</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Due by: May 30, 2024</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>High Priority Risks</CardTitle>
            <CardDescription>Risks requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {risksLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                risks?.filter(r => r.severity === 'high').map((risk) => (
                  <div key={risk.id} className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">{risk.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Review due: {new Date(risk.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {risks?.filter(r => r.severity === 'high').length === 0 && (
                <div className="flex flex-col items-center justify-center text-center h-20">
                  <ShieldCheck className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-muted-foreground">No high priority risks</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risks" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="risks">Risk Register</TabsTrigger>
          <TabsTrigger value="standards">Compliance Standards</TabsTrigger>
          <TabsTrigger value="assessments">Assessment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risks" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Register</CardTitle>
              <CardDescription>
                Comprehensive register of identified risks and mitigation strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search risks..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Select
                    value={severityFilter}
                    onValueChange={setSeverityFilter}
                  >
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Severity filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[160px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Category filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {riskCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {risksLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Risk</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Review Due</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRisks?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No risks found matching your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRisks?.map((risk) => (
                          <TableRow key={risk.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{risk.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">{risk.description}</p>
                              </div>
                            </TableCell>
                            <TableCell>{risk.category}</TableCell>
                            <TableCell>{getSeverityBadge(risk.severity)}</TableCell>
                            <TableCell>{risk.owner}</TableCell>
                            <TableCell>{new Date(risk.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <FileText className="h-4 w-4 mr-1" /> View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-xl">
                                  <DialogHeader>
                                    <DialogTitle>{risk.title}</DialogTitle>
                                    <DialogDescription>
                                      Detailed risk information and controls
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div>
                                      <h4 className="text-sm font-medium">Description</h4>
                                      <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium">Category</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{risk.category}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium">Owner</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{risk.owner}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium">Status</h4>
                                        <p className="text-sm text-muted-foreground mt-1 capitalize">{risk.status}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium">Likelihood</h4>
                                        <p className="text-sm text-muted-foreground mt-1 capitalize">{risk.likelihood}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium">Impact</h4>
                                        <p className="text-sm text-muted-foreground mt-1 capitalize">{risk.impact}</p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium">Severity</h4>
                                        <div className="mt-1">{getSeverityBadge(risk.severity)}</div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="text-sm font-medium">Controls & Mitigation</h4>
                                      <p className="text-sm text-muted-foreground mt-1">{risk.controls}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium">Last Review</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {new Date(risk.lastReview).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-medium">Next Review Due</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {new Date(risk.dueDate).toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => toast({ title: "Coming soon", description: "Risk review functionality coming soon" })}>
                                      <Clock className="mr-2 h-4 w-4" /> Record Review
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredRisks?.length || 0} risks found
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Risk
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Risk</DialogTitle>
                    <DialogDescription>
                      Document a new risk in the risk register for monitoring and mitigation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title2">Risk Title</Label>
                      <Input id="title2" placeholder="Enter risk title" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description2">Description</Label>
                      <Textarea id="description2" placeholder="Describe the risk in detail" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category2">Category</Label>
                        <Select>
                          <SelectTrigger id="category2">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {riskCategories.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="owner2">Risk Owner</Label>
                        <Input id="owner2" placeholder="Enter risk owner" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="likelihood2">Likelihood</Label>
                        <Select>
                          <SelectTrigger id="likelihood2">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="impact2">Impact</Label>
                        <Select>
                          <SelectTrigger id="impact2">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="severity2">Severity</Label>
                        <Select>
                          <SelectTrigger id="severity2">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="controls2">Controls & Mitigation</Label>
                      <Textarea id="controls2" placeholder="Describe controls and mitigation strategies" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate2">Review Due Date</Label>
                      <Input id="dueDate2" type="date" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => toast({ title: "Risk Management", description: "This feature is coming soon" })}>Add Risk</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="standards" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management Standards</CardTitle>
              <CardDescription>
                Compliance standards for risk management in GTOs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {standardsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : standards?.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-40">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No risk management standards found</p>
                  <p className="text-muted-foreground">Standards will be displayed here once added to the system</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Standard</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standards?.map((standard) => (
                        <TableRow key={standard.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{standard.standardName}</p>
                              <p className="text-sm text-muted-foreground">{standard.standardNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <p className="line-clamp-2">{standard.standardDescription}</p>
                          </TableCell>
                          <TableCell>
                            {assessments?.find(a => a.standardId === standard.id) ? (
                              <Badge className={
                                assessments.find(a => a.standardId === standard.id).status === 'compliant'
                                  ? "bg-green-100 text-green-800"
                                  : assessments.find(a => a.standardId === standard.id).status === 'at_risk'
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }>
                                {assessments.find(a => a.standardId === standard.id).status.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not assessed</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/gto-compliance/standard-assessment?standardId=${standard.id}`)}
                            >
                              <FileCheck className="h-4 w-4 mr-1" /> Assess
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assessments" className="p-0 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>
                Historical assessments of risk management compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : assessments?.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center h-40">
                  <FileCheck className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No assessments found</p>
                  <p className="text-muted-foreground">Compliance assessments will be displayed here once completed</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Standard</TableHead>
                        <TableHead>Assessment Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assessor</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessments?.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">
                            {standards?.find(s => s.id === assessment.standardId)?.standardName || 'Unknown Standard'}
                          </TableCell>
                          <TableCell>
                            {new Date(assessment.assessmentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              assessment.status === 'compliant'
                                ? "bg-green-100 text-green-800"
                                : assessment.status === 'at_risk'
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }>
                              {assessment.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assessment.assessedBy || 'System'}
                          </TableCell>
                          <TableCell>
                            {assessment.dueDate ? new Date(assessment.dueDate).toLocaleDateString() : 'Not scheduled'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/gto-compliance/assessment/${assessment.id}`)}
                            >
                              <FileText className="h-4 w-4 mr-1" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}