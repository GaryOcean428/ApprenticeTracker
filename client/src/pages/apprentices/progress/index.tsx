import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  BarChart2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Search, 
  Filter, 
  ChevronDown,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function ApprenticeProgress() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Progress Tracking</h2>
          <p className="text-muted-foreground">
            Monitor and manage apprentice progress and achievement
          </p>
        </div>
        <Button onClick={() => toast({ title: "Coming Soon", description: "Progress update feature coming soon" })}>
          <Plus className="mr-2 h-4 w-4" /> Update Progress
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall progress across all apprentices
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On-Track Apprentices</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Meeting expected progress milestones
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Apprentices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requiring intervention or support
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Units</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">463</div>
            <p className="text-xs text-muted-foreground mt-1">
              Units of competency achieved
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-0">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="individual" className="text-sm">Individual Progress</TabsTrigger>
                <TabsTrigger value="reports" className="text-sm">Reports</TabsTrigger>
                <TabsTrigger value="milestones" className="text-sm">Milestones</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search apprentices..."
                    className="pl-8 h-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" /> Filter
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>All Trades</DropdownMenuItem>
                    <DropdownMenuItem>Electrical</DropdownMenuItem>
                    <DropdownMenuItem>Plumbing</DropdownMenuItem>
                    <DropdownMenuItem>Carpentry</DropdownMenuItem>
                    <DropdownMenuItem>Business</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <TabsContent value="overview" className="py-4">
              <div className="rounded-md border divide-y">
                {/* Progress items based on real data */}
                {[
                  { id: 1, name: "Electrical Apprentices", qualification: "UEE30811: Electrotechnology Electrician", progress: 58, count: 12, rto: "South Metropolitan TAFE" },
                  { id: 2, name: "Engineering Apprentices", qualification: "MEM30319: Engineering - Fabrication Trade", progress: 65, count: 8, rto: "South Metropolitan TAFE" },
                  { id: 3, name: "Carpentry Apprentices", qualification: "CPC30220: Carpentry", progress: 72, count: 9, rto: "North Metropolitan TAFE" },
                  { id: 4, name: "Bricklaying Apprentices", qualification: "CPC33020: Bricklaying and Blocklaying", progress: 45, count: 5, rto: "South Metropolitan TAFE" },
                  { id: 5, name: "Business Trainees", qualification: "BSB20120: Workplace Skills", progress: 34, count: 3, rto: "Skill Hire WA Pty Ltd" }
                ].map((group) => (
                  <div key={group.id} className="p-4 flex items-center">
                    <div className="flex-1">
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">{group.qualification}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Progress value={group.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">{group.progress}%</span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <Badge variant="outline">{group.count} Apprentices</Badge>
                      <Button size="sm" variant="ghost" className="mt-2" onClick={() => {
                        toast({ title: "Coming Soon", description: "Detailed progress view coming soon" });
                      }}>View Details</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center py-8">
                <h3 className="text-lg font-medium">More Detailed Progress Tracking Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  The progress tracking module is under development. Additional features will be available soon.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/apprentices")}>
                  View Apprentice List
                </Button>
              </div>
            </TabsContent>
            
            {["individual", "reports", "milestones"].map((tab) => (
              <TabsContent key={tab} value={tab} className="py-4">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium">Coming Soon</h3>
                  <p className="text-muted-foreground mt-2">
                    This section is currently under development.
                  </p>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}