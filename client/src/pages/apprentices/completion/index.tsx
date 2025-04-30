import React from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileText, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";

export default function ApprenticeCompletion() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // Mock completions data for development
  const completionRecords = [
    {
      id: 1,
      apprenticeName: "James Wilson",
      qualification: "Certificate III in Electrical Installation",
      completionDate: "2023-11-15",
      status: "pending",
      documents: ["completion_certificate.pdf", "supervisor_report.pdf"]
    },
    {
      id: 2,
      apprenticeName: "Sarah Johnson",
      qualification: "Certificate III in Carpentry",
      completionDate: "2023-10-28",
      status: "approved",
      documents: ["completion_certificate.pdf", "final_assessment.pdf"]
    },
    {
      id: 3,
      apprenticeName: "Michael Thompson",
      qualification: "Certificate IV in Plumbing",
      completionDate: "2023-09-05",
      status: "rejected",
      documents: ["completion_form.pdf"]
    },
    {
      id: 4,
      apprenticeName: "Emily Davis",
      qualification: "Certificate III in Business Administration",
      completionDate: "2023-12-01",
      status: "pending",
      documents: ["completion_certificate.pdf", "employer_verification.pdf"]
    }
  ];

  const handleStatusChange = (id: number, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `Completion record #${id} status changed to ${newStatus}`,
    });
  };

  const handleDocumentSubmit = () => {
    toast({
      title: "Documents Submitted",
      description: "Completion documents have been submitted successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Completion Management</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Completions</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Completion Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprentice</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completionRecords
                    .filter(record => record.status === "pending")
                    .map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.apprenticeName}</TableCell>
                      <TableCell>{record.qualification}</TableCell>
                      <TableCell>{new Date(record.completionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {record.documents.map((doc, idx) => (
                            <Button key={idx} variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              {doc.split('_')[0]}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">Review</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Review Completion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Update the status for {record.apprenticeName}'s completion record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <h3 className="font-medium">Status</h3>
                                  <Select onValueChange={(value) => handleStatusChange(record.id, value)}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="approved">Approved</SelectItem>
                                      <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <h3 className="font-medium">Notes</h3>
                                  <Input 
                                    placeholder="Add notes about this decision" 
                                  />
                                </div>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Save Changes</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprentice</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completionRecords
                    .filter(record => record.status === "approved")
                    .map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.apprenticeName}</TableCell>
                      <TableCell>{record.qualification}</TableCell>
                      <TableCell>{new Date(record.completionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {record.documents.map((doc, idx) => (
                            <Button key={idx} variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              {doc.split('_')[0]}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          Approved
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Certificate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprentice</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completionRecords
                    .filter(record => record.status === "rejected")
                    .map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.apprenticeName}</TableCell>
                      <TableCell>{record.qualification}</TableCell>
                      <TableCell>{new Date(record.completionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {record.documents.map((doc, idx) => (
                            <Button key={idx} variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              {doc.split('_')[0]}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          Rejected
                        </span>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">Resubmit</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Resubmit Completion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Upload additional documents to support the completion.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <h3 className="font-medium">Upload Documents</h3>
                                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">
                                    Drag and drop files here, or click to select files
                                  </p>
                                  <Button size="sm" variant="outline" className="mt-2">
                                    Select Files
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h3 className="font-medium">Notes</h3>
                                <Input placeholder="Add notes about the resubmission" />
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDocumentSubmit}>Submit</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Completion Records</CardTitle>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Apprentice</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Completion Date</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completionRecords.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{record.apprenticeName}</TableCell>
                      <TableCell>{record.qualification}</TableCell>
                      <TableCell>{new Date(record.completionDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {record.documents.map((doc, idx) => (
                            <Button key={idx} variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              {doc.split('_')[0]}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.status === "pending" && (
                          <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            Pending
                          </span>
                        )}
                        {record.status === "approved" && (
                          <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            Approved
                          </span>
                        )}
                        {record.status === "rejected" && (
                          <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            Rejected
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/apprentices/${record.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}