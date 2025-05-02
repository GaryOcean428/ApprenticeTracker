import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Save, Plus, Trash2, MoveUp, MoveDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Unit {
  id: number;
  unitCode: string;
  unitTitle: string;
  hoursOfDelivery: number;
  isDeleted: boolean;
}

interface QualificationUnit {
  id: number;
  qualificationId: number;
  unitId: number;
  isCore: boolean;
  groupName: string | null;
  isMandatoryElective: boolean;
  order: number;
  unit?: Unit;
}

interface Qualification {
  id: number;
  code: string;
  title: string;
  description: string;
  level: string;
  industryArea: string;
  isActive: boolean;
  isSuperseded: boolean;
  nominalHours: number;
  createdAt: string;
  updatedAt: string;
}

export default function QualificationStructure() {
  const params = useParams<{ id: string }>();
  const qualificationId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<number>>(new Set());
  const [unitAssignments, setUnitAssignments] = useState<{[key: number]: {isCore: boolean, groupName: string | null, isMandatory: boolean}}>({});
  const [addUnitDialogOpen, setAddUnitDialogOpen] = useState(false);
  const [unitSearchTerm, setUnitSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("core");
  const [structureChanged, setStructureChanged] = useState(false);
  
  // Fetch qualification details
  const { data: qualificationData, isLoading: isLoadingQualification } = useQuery<{qualification: Qualification, units: {core: QualificationUnit[], elective: QualificationUnit[]}}>({ 
    queryKey: [`/api/vet/qualifications/${qualificationId}`],
  });
  
  // Fetch all units for adding to structure
  const { data: availableUnits, isLoading: isLoadingUnits } = useQuery<Unit[]>({ 
    queryKey: ["/api/vet/units"],
  });
  
  // Filter units by search term
  const filteredUnits = unitSearchTerm.length > 0 
    ? availableUnits?.filter(unit => {
        const searchLower = unitSearchTerm.toLowerCase();
        return unit.unitCode.toLowerCase().includes(searchLower) || 
               unit.unitTitle.toLowerCase().includes(searchLower);
      })
    : availableUnits;
    
  // Create structure based on core and elective tabs
  const coreUnits = qualificationData?.units?.core || [];
  const electiveUnits = qualificationData?.units?.elective || [];
  
  // Group electives by group name
  const groupedElectives: Record<string, QualificationUnit[]> = {};
  
  electiveUnits.forEach(unit => {
    const groupName = unit.groupName || "General Electives";
    if (!groupedElectives[groupName]) {
      groupedElectives[groupName] = [];
    }
    groupedElectives[groupName].push(unit);
  });
  
  // Check if unit is already in structure
  const isUnitInStructure = (unitId: number): boolean => {
    const inCore = coreUnits.some(u => u.unitId === unitId);
    const inElective = electiveUnits.some(u => u.unitId === unitId);
    return inCore || inElective;
  };
  
  // Handle unit selection for adding to structure
  const toggleUnitSelection = (unitId: number) => {
    const newSelectedUnits = new Set(selectedUnitIds);
    if (newSelectedUnits.has(unitId)) {
      newSelectedUnits.delete(unitId);
      const newAssignments = {...unitAssignments};
      delete newAssignments[unitId];
      setUnitAssignments(newAssignments);
    } else {
      newSelectedUnits.add(unitId);
      // Default to the active tab's type (core or elective)
      setUnitAssignments({
        ...unitAssignments,
        [unitId]: {
          isCore: activeTab === "core",
          groupName: null,
          isMandatory: false
        }
      });
    }
    setSelectedUnitIds(newSelectedUnits);
  };
  
  // Update unit assignment properties
  const updateUnitAssignment = (unitId: number, field: string, value: any) => {
    setUnitAssignments({
      ...unitAssignments,
      [unitId]: {
        ...unitAssignments[unitId],
        [field]: value
      }
    });
  };
  
  // Add selected units to structure
  const addUnitsToStructure = useMutation({
    mutationFn: async () => {
      const units = Array.from(selectedUnitIds).map(unitId => ({
        unitId,
        isCore: unitAssignments[unitId].isCore,
        groupName: unitAssignments[unitId].groupName,
        isMandatoryElective: unitAssignments[unitId].isMandatory
      }));
      
      const response = await apiRequest("POST", `/api/vet/qualifications/${qualificationId}/units`, { units });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Units added successfully",
        description: `${selectedUnitIds.size} unit(s) have been added to the qualification structure`,
        variant: "default",
      });
      setSelectedUnitIds(new Set());
      setUnitAssignments({});
      setAddUnitDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/vet/qualifications/${qualificationId}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to add units",
        description: error.message || "There was an error adding units to the qualification structure",
        variant: "destructive",
      });
    }
  });
  
  // Remove a unit from structure
  const removeUnit = useMutation({
    mutationFn: async (unitId: number) => {
      const response = await apiRequest("DELETE", `/api/vet/qualifications/${qualificationId}/units/${unitId}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Unit removed",
        description: "The unit has been removed from the qualification structure",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/vet/qualifications/${qualificationId}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove unit",
        description: error.message || "There was an error removing the unit",
        variant: "destructive",
      });
    }
  });
  
  // Move unit up or down in order
  const moveUnit = useMutation({
    mutationFn: async ({ unitId, direction }: { unitId: number, direction: 'up' | 'down' }) => {
      const response = await apiRequest("PATCH", `/api/vet/qualifications/${qualificationId}/units/${unitId}/order`, { direction });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vet/qualifications/${qualificationId}`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to reorder unit",
        description: error.message || "There was an error updating the unit order",
        variant: "destructive",
      });
    }
  });
  
  if (isLoadingQualification) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const qualification = qualificationData?.qualification;
  
  if (!qualification) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/vet/qualifications")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Qualifications
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold">Qualification Not Found</h2>
              <p className="text-muted-foreground mt-2">The qualification you are looking for does not exist or has been removed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button and title */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(`/vet/qualifications/${qualification.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{qualification.code} Structure</h1>
          <p className="text-muted-foreground">
            Manage units of competency for {qualification.title}
          </p>
        </div>
      </div>
      
      {/* Main content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Qualification Structure</CardTitle>
              <CardDescription>
                Core and elective units required for this qualification
              </CardDescription>
            </div>
            <Dialog open={addUnitDialogOpen} onOpenChange={setAddUnitDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Units
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add Units to {qualification.code}</DialogTitle>
                  <DialogDescription>
                    Search and select units to add to this qualification structure
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 my-4">
                  <Input
                    placeholder="Search by unit code or title..."
                    value={unitSearchTerm}
                    onChange={(e) => setUnitSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                  
                  <ScrollArea className="h-[300px] rounded-md border p-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Group</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUnits?.length ? filteredUnits.map((unit) => {
                          const isSelected = selectedUnitIds.has(unit.id);
                          const isAlreadyInStructure = isUnitInStructure(unit.id);
                          return (
                            <TableRow key={unit.id} className={isAlreadyInStructure ? "opacity-50" : ""}>
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleUnitSelection(unit.id)}
                                  disabled={isAlreadyInStructure}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{unit.unitCode}</TableCell>
                              <TableCell>{unit.unitTitle}</TableCell>
                              <TableCell>
                                {isSelected && (
                                  <Select
                                    value={unitAssignments[unit.id]?.isCore ? "core" : "elective"}
                                    onValueChange={(value) => updateUnitAssignment(unit.id, "isCore", value === "core")}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="core">Core</SelectItem>
                                      <SelectItem value="elective">Elective</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                {isAlreadyInStructure && (
                                  <Badge variant="outline">
                                    Already Added
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {isSelected && !unitAssignments[unit.id]?.isCore && (
                                  <Input
                                    placeholder="Group name (optional)"
                                    value={unitAssignments[unit.id]?.groupName || ""}
                                    onChange={(e) => updateUnitAssignment(unit.id, "groupName", e.target.value)}
                                    className="w-40"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        }) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              {isLoadingUnits ? (
                                <div className="flex justify-center items-center">
                                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                                  Loading units...
                                </div>
                              ) : (
                                "No units found. Try a different search term."
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
                
                <DialogFooter>
                  <div className="flex justify-between w-full items-center">
                    <div className="text-sm text-muted-foreground">
                      {selectedUnitIds.size} unit(s) selected
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => {
                        setSelectedUnitIds(new Set());
                        setUnitAssignments({});
                      }} disabled={selectedUnitIds.size === 0}>
                        Clear Selection
                      </Button>
                      <Button 
                        onClick={() => addUnitsToStructure.mutate()} 
                        disabled={selectedUnitIds.size === 0 || addUnitsToStructure.isPending}
                      >
                        {addUnitsToStructure.isPending ? "Adding..." : "Add Selected Units"}
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="core" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="core">
                Core Units 
                <Badge variant="outline" className="ml-2">{coreUnits.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="elective">
                Elective Units
                <Badge variant="outline" className="ml-2">{electiveUnits.length}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="core" className="space-y-4">
              {coreUnits.length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <h3 className="text-lg font-medium">No Core Units</h3>
                  <p className="text-muted-foreground mt-1">This qualification has no core units. Add some using the button above.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/6">Unit Code</TableHead>
                      <TableHead className="w-3/6">Unit Title</TableHead>
                      <TableHead className="w-1/6">Hours</TableHead>
                      <TableHead className="w-1/6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coreUnits.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.unit?.unitCode}</TableCell>
                        <TableCell>{item.unit?.unitTitle}</TableCell>
                        <TableCell>{item.unit?.hoursOfDelivery || "-"}</TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <div className="flex justify-end space-x-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={index === 0}
                                    onClick={() => moveUnit.mutate({ unitId: item.id, direction: 'up' })}>
                                    <MoveUp className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move Up</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={index === coreUnits.length - 1}
                                    onClick={() => moveUnit.mutate({ unitId: item.id, direction: 'down' })}>
                                    <MoveDown className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Move Down</TooltipContent>
                              </Tooltip>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Core Unit</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {item.unit?.unitCode} from this qualification's core units?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeUnit.mutate(item.id)} className="bg-destructive">
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="elective" className="space-y-8">
              {Object.keys(groupedElectives).length === 0 ? (
                <div className="text-center py-12 border rounded-md">
                  <h3 className="text-lg font-medium">No Elective Units</h3>
                  <p className="text-muted-foreground mt-1">This qualification has no elective units. Add some using the button above.</p>
                </div>
              ) : (
                Object.entries(groupedElectives).map(([groupName, units]) => (
                  <div key={groupName} className="space-y-2">
                    <h3 className="font-medium text-lg">{groupName}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/6">Unit Code</TableHead>
                          <TableHead className="w-3/6">Unit Title</TableHead>
                          <TableHead className="w-1/6">Hours</TableHead>
                          <TableHead className="w-1/6 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {units.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.unit?.unitCode}</TableCell>
                            <TableCell>{item.unit?.unitTitle}</TableCell>
                            <TableCell>{item.unit?.hoursOfDelivery || "-"}</TableCell>
                            <TableCell className="text-right">
                              <TooltipProvider>
                                <div className="flex justify-end space-x-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" disabled={index === 0 || units.length === 1}
                                        onClick={() => moveUnit.mutate({ unitId: item.id, direction: 'up' })}>
                                        <MoveUp className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Move Up</TooltipContent>
                                  </Tooltip>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" disabled={index === units.length - 1 || units.length === 1}
                                        onClick={() => moveUnit.mutate({ unitId: item.id, direction: 'down' })}>
                                        <MoveDown className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Move Down</TooltipContent>
                                  </Tooltip>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remove Elective Unit</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to remove {item.unit?.unitCode} from this qualification's elective units?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => removeUnit.mutate(item.id)} className="bg-destructive">
                                          Remove
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TooltipProvider>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="flex items-center gap-2">
            <a 
              href={`https://training.gov.au/Training/Details/${qualification.code}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary flex items-center"
            >
              View on Training.gov.au <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
          <Button onClick={() => navigate(`/vet/qualifications/${qualification.id}`)} variant="outline">
            Back to Qualification
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}