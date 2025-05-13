import { useState } from "react";
import { useLocation, Link } from "wouter";
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
        <div className="flex space-x-2">
          <Button onClick={() => toast({ title: "Coming Soon", description: "Apprentice recruitment creation feature coming soon" })}>
            <Plus className="mr-2 h-4 w-4" /> New Applicant
          </Button>
          <Button variant="outline" asChild>
            <Link href="/apprentices/recruitment/selections">
              View Selections
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/apprentices/recruitment/onboarding">
              Onboarding
            </Link>
          </Button>
        </div>
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
              <div className="rounded-md border divide-y">
                {/* Actual applicant data from CSV */}
                {[
                  { id: 11971, name: "Brock James Abbiss", qualification: "Apprentice Metal Fabricator", contact: "0405 905 691", date: "28/03/2002", employer: "Civmec Construction and Engineering Pty Ltd", status: "New" },
                  { id: 11382, name: "Tamir Abfahr", qualification: "Electrician", contact: "0415 952 046", date: "17/04/2002", employer: "Mayvis Electrical", status: "Shortlisted" },
                  { id: 11512, name: "Laith Abfahr", qualification: "Apprentice Electrician", contact: "0420 478 545", date: "14/09/2000", employer: "Nilsen (WA) Pty Ltd", status: "Interview" },
                  { id: 7929, name: "Zachary James Adami", qualification: "Apprentice Carpenter", contact: "0401 599 799", date: "14/07/2000", employer: "Skill Hire", status: "New" },
                  { id: 11681, name: "Lucius Arthur Henri Adams", qualification: "Apprentice Bricklayer", contact: "0423 218 445", date: "13/12/2004", employer: "Pumping Perfect Bricks", status: "Interview" },
                  { id: 9716, name: "Abdullahi Ali Mohamed", qualification: "Apprentice Electrician", contact: "0423 337 066", date: "02/06/2003", employer: "Curtin University", status: "Shortlisted" }
                ].map((applicant) => (
                  <div key={applicant.id} className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{applicant.name}</h3>
                      <p className="text-sm text-muted-foreground">{applicant.qualification}</p>
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <span className="mr-3">📱 {applicant.contact}</span>
                        <span>🗓️ {applicant.date}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end">
                      <span className="text-sm text-muted-foreground">{applicant.employer}</span>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`text-xs font-medium inline-block px-2 py-1 rounded-full ${
                          applicant.status === 'New' 
                            ? 'bg-blue-100 text-blue-800' 
                            : applicant.status === 'Interview' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>{applicant.status}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => navigate(`/apprentices/${applicant.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            {/* Interviews tab */}
            <TabsContent value="interviews" className="py-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Interviews Section</h3>
                <p className="text-muted-foreground mt-2">
                  Interview scheduling and management is currently under development.
                </p>
                <Button className="mt-4" onClick={() => toast({ title: "Interviews", description: "Interview management feature coming soon" })}>
                  Schedule Interviews
                </Button>
              </div>
            </TabsContent>
            
            {/* Selections tab */}
            <TabsContent value="selections" className="py-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Selections Module</h3>
                <p className="text-muted-foreground mt-2">
                  Manage candidate selections and interview results.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/apprentices/recruitment/selections">
                    Go to Selections
                  </Link>
                </Button>
              </div>
            </TabsContent>
            
            {/* Onboarding tab */}
            <TabsContent value="onboarding" className="py-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium">Onboarding Process</h3>
                <p className="text-muted-foreground mt-2">
                  Manage the onboarding process for selected candidates.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/apprentices/recruitment/onboarding">
                    Go to Onboarding
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}