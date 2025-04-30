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
import { Plus, Users, FileText, CalendarRange, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function ApprenticeRecruitment() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("applicants");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Apprentice Recruitment</h2>
          <p className="text-muted-foreground">
            Manage recruitment, applications, and onboarding for apprentices
          </p>
        </div>
        <Button onClick={() => toast({ title: "Coming Soon", description: "Apprentice recruitment creation feature coming soon" })}>
          <Plus className="mr-2 h-4 w-4" /> New Applicant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active applications in process
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              Received in the last 7 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled for the next 14 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Application to placement ratio
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-0">
          <Tabs defaultValue="applicants" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="applicants" className="text-sm">Applicants</TabsTrigger>
                <TabsTrigger value="interviews" className="text-sm">Interviews</TabsTrigger>
                <TabsTrigger value="selections" className="text-sm">Selections</TabsTrigger>
                <TabsTrigger value="onboarding" className="text-sm">Onboarding</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search applicants..."
                    className="pl-8 h-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
              </div>
            </div>
            
            <TabsContent value="applicants" className="py-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Coming Soon</h3>
                <p className="text-muted-foreground mt-2">
                  The apprentice recruitment module is currently under development.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/apprentices")}>
                  View Apprentice List
                </Button>
              </div>
            </TabsContent>
            
            {["interviews", "selections", "onboarding"].map((tab) => (
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