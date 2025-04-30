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
  GraduationCap, 
  FileText, 
  BookOpen, 
  Search, 
  Filter, 
  ChevronDown,
  BarChart 
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

export default function ApprenticeTrainingPlans() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Training Plans</h2>
          <p className="text-muted-foreground">
            Manage and monitor training plans for apprentices
          </p>
        </div>
        <Button onClick={() => toast({ title: "Coming Soon", description: "Training plan creation feature coming soon" })}>
          <Plus className="mr-2 h-4 w-4" /> New Training Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Training Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall progress across all plans
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plans Requiring Review</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled for review in 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fully completed training plans
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-0">
          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="active" className="text-sm">Active Plans</TabsTrigger>
                <TabsTrigger value="review" className="text-sm">Requiring Review</TabsTrigger>
                <TabsTrigger value="completed" className="text-sm">Completed</TabsTrigger>
                <TabsTrigger value="templates" className="text-sm">Plan Templates</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search training plans..."
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
                    <DropdownMenuItem>All Plans</DropdownMenuItem>
                    <DropdownMenuItem>Electrical</DropdownMenuItem>
                    <DropdownMenuItem>Plumbing</DropdownMenuItem>
                    <DropdownMenuItem>Carpentry</DropdownMenuItem>
                    <DropdownMenuItem>Business</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <TabsContent value="active" className="py-4">
              <div className="rounded-md border divide-y">
                {/* Example training plan items */}
                {[
                  { id: 1, name: "John Smith", qualification: "Certificate III in Electrotechnology", progress: 45, trade: "Electrical" },
                  { id: 2, name: "Sarah Johnson", qualification: "Certificate III in Plumbing", progress: 68, trade: "Plumbing" },
                  { id: 3, name: "Michael Brown", qualification: "Certificate III in Carpentry", progress: 72, trade: "Carpentry" },
                  { id: 4, name: "Emily Davis", qualification: "Certificate III in Business", progress: 34, trade: "Business" },
                ].map((plan) => (
                  <div key={plan.id} className="p-4 flex items-center">
                    <div className="flex-1">
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.qualification}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Progress value={plan.progress} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground">{plan.progress}%</span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <Badge>{plan.trade}</Badge>
                      <Button size="sm" variant="ghost" className="mt-2" onClick={() => {
                        toast({ title: "Coming Soon", description: "Training plan details coming soon" });
                      }}>View</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center py-8">
                <h3 className="text-lg font-medium">More Plans Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  The training plans module is under development. Additional features will be available soon.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/apprentices")}>
                  View Apprentice List
                </Button>
              </div>
            </TabsContent>
            
            {["review", "completed", "templates"].map((tab) => (
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