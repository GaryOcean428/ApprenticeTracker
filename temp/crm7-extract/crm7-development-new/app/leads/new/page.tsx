import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function NewLeadPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Link href="/leads">
            <Button variant="outline" size="sm">
              Back to Leads
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Add New Lead</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Lead</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
          <CardDescription>
            Enter the contact information and details for the new lead.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" placeholder="Enter first name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" placeholder="Enter last name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="Enter email address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="Enter phone number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Enter company name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" placeholder="Enter job title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select defaultValue="new">
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
              <Label htmlFor="source">Source *</Label>
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
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              rows={4}
              placeholder="Enter any additional information or notes about the lead"
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
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-full">High Priority</Button>
              <Button variant="outline" size="sm" className="rounded-full">+ Add Tag</Button>
            </div>
          </div>
          
          <div className="pt-4">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Lead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
