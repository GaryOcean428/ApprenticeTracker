import { useState } from 'react';
import { useLocation } from 'wouter';
import { Plus, FileText, FilePlus, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function ApprenticeRecords() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('employment');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employment Records</h2>
          <p className="text-muted-foreground">
            Manage employment documentation and records for apprentices
          </p>
        </div>
        <Button
          onClick={() =>
            toast({
              title: 'Coming Soon',
              description: 'Employment record creation feature coming soon',
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" /> New Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Required Documents</CardTitle>
            <FilePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26</div>
            <p className="text-xs text-muted-foreground mt-1">Records requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Complete Records</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">148</div>
            <p className="text-xs text-muted-foreground mt-1">Verified and completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Records expiring in 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-0">
          <Tabs defaultValue="employment" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="employment" className="text-sm">
                  Employment
                </TabsTrigger>
                <TabsTrigger value="identity" className="text-sm">
                  Identity Documents
                </TabsTrigger>
                <TabsTrigger value="qualifications" className="text-sm">
                  Qualifications
                </TabsTrigger>
                <TabsTrigger value="compliance" className="text-sm">
                  Compliance
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search records..."
                    className="pl-8 h-9 w-[200px]"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
              </div>
            </div>

            <TabsContent value="employment" className="py-4">
              <div className="rounded-md border divide-y">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Training Contract Templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Standard training contracts for new apprentices
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Up to date</Badge>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Employment Agreement Templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Standard employment agreements for new apprentices
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800">Review needed</Badge>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h3 className="font-medium">Host Employer Agreements</h3>
                      <p className="text-sm text-muted-foreground">
                        Agreement templates for host employers
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Up to date</Badge>
                </div>
              </div>

              <div className="text-center py-8">
                <h3 className="text-lg font-medium">More Features Coming Soon</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  The employment records management module is under development. Additional features
                  will be available soon.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/apprentices')}>
                  View Apprentice List
                </Button>
              </div>
            </TabsContent>

            {['identity', 'qualifications', 'compliance'].map(tab => (
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
