import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search, GraduationCap, BookOpen, Filter, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Qualification {
  id: number;
  qualificationCode: string;
  qualificationTitle: string;
  qualificationDescription: string;
  aqfLevel: string;
  aqfLevelNumber: number;
  trainingPackage: string;
  trainingPackageRelease: string;
  totalUnits: number;
  coreUnits: number;
  electiveUnits: number;
  nominalHours: number;
  isActive: boolean;
  isApprenticeshipQualification: boolean;
  isFundedQualification: boolean;
  fundingDetails: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function QualificationsList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<{level: string, industryArea: string}>({
    level: "",
    industryArea: ""
  });
  
  const { data: qualifications, isLoading, error } = useQuery<Qualification[]>({
    queryKey: ["/api/vet/qualifications"],
  });

  const { toast } = useToast();

  if (error) {
    toast({
      variant: "destructive",
      title: "Error loading qualifications",
      description: "There was a problem loading the qualification data. Please try again later."
    });
  }

  const filteredQualifications = qualifications?.filter((qualification) => {
    const matchesSearch = searchTerm ? (
      (qualification.qualificationCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (qualification.qualificationTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) : true;
    
    const matchesLevel = filter.level ? qualification.aqfLevel === filter.level : true;
    const matchesIndustry = filter.industryArea ? qualification.trainingPackage === filter.industryArea : true;
    
    return matchesSearch && matchesLevel && matchesIndustry;
  });

  const uniqueLevels = [...new Set(qualifications?.map(q => q.level) || [])];
  const uniqueIndustries = [...new Set(qualifications?.map(q => q.industryArea) || [])];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Qualifications</h1>
          <p className="text-muted-foreground">
            Manage AQF Qualifications for apprenticeships and traineeships
          </p>
        </div>
        <Button onClick={() => navigate("/vet/qualifications/create")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Qualification
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search qualifications..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filter.level}
            onValueChange={(value) => setFilter({...filter, level: value})}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center">
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>{filter.level || "AQF Level"}</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-levels">All Levels</SelectItem>
              {uniqueLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.industryArea}
            onValueChange={(value) => setFilter({...filter, industryArea: value})}
          >
            <SelectTrigger className="w-[180px]">
              <span className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>{filter.industryArea || "Industry Area"}</span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-industries">All Industries</SelectItem>
              {uniqueIndustries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(filter.level || filter.industryArea) && (
            <Button 
              variant="outline" 
              onClick={() => setFilter({level: "", industryArea: ""})}
              className="flex gap-1 items-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-md">Qualifications</CardTitle>
          <CardDescription>
            Total: {filteredQualifications?.length || 0} qualification{filteredQualifications?.length !== 1 && 's'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-60" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-20" /></TableCell>
                    </TableRow>
                  ))
                )}
                
                {!isLoading && filteredQualifications?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No qualifications found. <Link href="/vet/qualifications/create" className="text-primary underline">Add one</Link>
                    </TableCell>
                  </TableRow>
                )}
                
                {!isLoading && filteredQualifications?.map((qualification) => (
                  <TableRow key={qualification.id}>
                    <TableCell className="font-medium">{qualification.qualificationCode}</TableCell>
                    <TableCell>{qualification.qualificationTitle}</TableCell>
                    <TableCell>{qualification.aqfLevel}</TableCell>
                    <TableCell>{qualification.trainingPackage}</TableCell>
                    <TableCell>
                      <Badge variant={qualification.isActive ? "default" : "outline"}>
                        {qualification.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/vet/qualifications/${qualification.id}`)}
                              >
                                <GraduationCap className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <span className="sr-only">Open menu</span>
                              <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/vet/qualifications/${qualification.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/vet/qualifications/${qualification.id}/edit`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/vet/qualifications/${qualification.id}/structure`)}>
                              Manage Structure
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className={qualification.isActive ? "text-destructive" : "text-primary"}>
                              {qualification.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredQualifications?.length || 0} of {qualifications?.length || 0} qualifications
          </div>
        </CardFooter>
      </Card>
    </>
  );
}