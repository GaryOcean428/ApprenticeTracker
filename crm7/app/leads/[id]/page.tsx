import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Phone, Mail, Building, Tag, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function LeadDetailPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Link href="/leads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Lead Details</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
              <CardDescription>
                View and edit lead contact information and status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                  </Label>
                  <Input id="email" type="email" defaultValue="john.smith@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone</span>
                    </div>
                  </Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4" />
                      <span>Company</span>
                    </div>
                  </Label>
                  <Input id="company" defaultValue="Acme Inc" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" defaultValue="Marketing Director" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="qualified">
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select defaultValue="website">
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </div>
                </Label>
                <Textarea 
                  id="message" 
                  rows={4}
                  defaultValue="I'm interested in learning more about your apprenticeship services for our company. We're looking to start a program in the next quarter."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceInterest">Service Interest</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-full">Apprenticeships</Button>
                  <Button variant="outline" size="sm" className="rounded-full">Traineeships</Button>
                  <Button variant="outline" size="sm" className="rounded-full">Recruitment</Button>
                  <Button variant="outline" size="sm" className="rounded-full">+ Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Track important dates and metadata.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Created</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Apr 5, 2025</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Apr 7, 2025</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Contacted</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Apr 6, 2025</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                  </div>
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="rounded-full">High Priority</Button>
                  <Button variant="outline" size="sm" className="rounded-full">Enterprise</Button>
                  <Button variant="outline" size="sm" className="rounded-full">+ Add Tag</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>
                Manage follow-up tasks for this lead.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
                
                <div className="rounded-md border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Follow up on initial inquiry</div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Call John to discuss their apprenticeship needs and schedule a demo.
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: Apr 8, 2025</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Complete</Button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Send proposal document</div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Prepare and send the apprenticeship program proposal based on our call.
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: Apr 12, 2025</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Complete</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Keep track of important information about this lead.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Textarea placeholder="Add a new note..." rows={3} />
                  <Button className="self-end">Add Note</Button>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Initial Contact Notes</div>
                      <div className="text-sm text-muted-foreground">Apr 6, 2025</div>
                    </div>
                    <div className="text-sm">
                      John mentioned they're looking to hire 5-10 apprentices in the next quarter. 
                      They're particularly interested in IT and digital marketing roles. 
                      Budget is approximately $50k per apprentice.
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Company Research</div>
                      <div className="text-sm text-muted-foreground">Apr 5, 2025</div>
                    </div>
                    <div className="text-sm">
                      Acme Inc. is a mid-sized technology company with approximately 250 employees.
                      They've been growing rapidly and have opened two new offices in the past year.
                      No existing apprenticeship program, but they have expressed interest in developing talent internally.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                Track all interactions with this lead.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-muted pl-4 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary"></div>
                    <div className="space-y-1">
                      <div className="font-medium">Status Changed</div>
                      <div className="text-sm text-muted-foreground">
                        Lead status changed from <span className="font-medium">New</span> to <span className="font-medium">Qualified</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Apr 6, 2025 at 2:45 PM</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary"></div>
                    <div className="space-y-1">
                      <div className="font-medium">Phone Call</div>
                      <div className="text-sm text-muted-foreground">
                        Initial discovery call with John Smith. Discussed apprenticeship needs and timeline.
                      </div>
                      <div className="text-xs text-muted-foreground">Apr 6, 2025 at 1:30 PM</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary"></div>
                    <div className="space-y-1">
                      <div className="font-medium">Email Sent</div>
                      <div className="text-sm text-muted-foreground">
                        Sent introduction email with company brochure and service overview.
                      </div>
                      <div className="text-xs text-muted-foreground">Apr 5, 2025 at 4:15 PM</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary"></div>
                    <div className="space-y-1">
                      <div className="font-medium">Lead Created</div>
                      <div className="text-sm text-muted-foreground">
                        Lead created from website contact form submission.
                      </div>
                      <div className="text-xs text-muted-foreground">Apr 5, 2025 at 10:23 AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
