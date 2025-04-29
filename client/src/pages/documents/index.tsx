import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Document } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Pencil, 
  Trash2, 
  MoreHorizontal, 
  Plus, 
  Search,
  Filter,
  FileText,
  Download,
  Calendar,
  ExternalLink
} from "lucide-react";

const DocumentsList = () => {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const relatedTo = searchParams.get('relatedTo');
  const relatedId = searchParams.get('relatedId');
  
  const [filter, setFilter] = useState({
    search: "",
    type: "",
    status: "",
    relatedTo: relatedTo || "",
    relatedId: relatedId || ""
  });
  
  // Fetch all documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: [filter.relatedTo && filter.relatedId 
      ? `/api/documents/related/${filter.relatedTo}/${filter.relatedId}` 
      : '/api/documents'],
    queryFn: async () => {
      const url = filter.relatedTo && filter.relatedId 
        ? `/api/documents/related/${filter.relatedTo}/${filter.relatedId}` 
        : '/api/documents';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json() as Promise<Document[]>;
    }
  });
  
  // Filter documents based on search and filters
  const filteredDocuments = documents?.filter(document => {
    const matchesSearch = 
      filter.search === "" || 
      document.title.toLowerCase().includes(filter.search.toLowerCase());
    
    const matchesType = filter.type === "" || document.type === filter.type;
    const matchesStatus = filter.status === "" || document.status === filter.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Get unique document types for the filter dropdown
  const documentTypes = documents 
    ? [...new Set(documents.map(doc => doc.type))]
    : [];
  
  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case "active":
        return "bg-green-100 text-success";
      case "expired":
        return "bg-red-100 text-destructive";
      case "archived":
        return "bg-gray-100 text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  
  const getDocumentTypeIcon = (type: string) => {
    switch(type) {
      case "safety":
        return <Badge variant="outline" className="bg-red-50">Safety</Badge>;
      case "report":
        return <Badge variant="outline" className="bg-blue-50">Report</Badge>;
      case "template":
        return <Badge variant="outline" className="bg-purple-50">Template</Badge>;
      case "guidelines":
        return <Badge variant="outline" className="bg-amber-50">Guidelines</Badge>;
      case "contract":
        return <Badge variant="outline" className="bg-green-50">Contract</Badge>;
      default:
        return <Badge variant="outline">Document</Badge>;
    }
  };
  
  // Format dates for display
  const formatDate = (dateString?: Date | string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-foreground">Document Management</h2>
        <Button asChild>
          <Link href={`/documents/create${filter.relatedTo && filter.relatedId ? `?relatedTo=${filter.relatedTo}&relatedId=${filter.relatedId}` : ''}`}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documents..."
                className="pl-8"
                value={filter.search}
                onChange={(e) => setFilter({...filter, search: e.target.value})}
              />
            </div>
            <div className="flex gap-4 flex-wrap md:flex-nowrap">
              <div className="w-full md:w-48">
                <Select
                  value={filter.type}
                  onValueChange={(value) => setFilter({...filter, type: value})}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select
                  value={filter.status}
                  onValueChange={(value) => setFilter({...filter, status: value})}
                >
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive">Failed to load documents</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No documents found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments?.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="font-medium">{document.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Related to: {document.relatedTo} #{document.relatedId}
                          </div>
                        </TableCell>
                        <TableCell>{getDocumentTypeIcon(document.type)}</TableCell>
                        <TableCell>{formatDate(document.uploadDate)}</TableCell>
                        <TableCell>
                          {document.expiryDate ? (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(document.expiryDate)}
                            </div>
                          ) : (
                            "No expiry"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(document.status)}>
                            {document.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" asChild>
                              <a href={document.url} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </a>
                            </Button>
                            <Button size="icon" variant="ghost" asChild>
                              <Link href={`/documents/${document.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <a href={document.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Document
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={document.url} download>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default DocumentsList;
