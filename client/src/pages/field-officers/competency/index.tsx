import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { PlusCircle, Calendar, User, Check, X, Upload, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

// Define interface for competency review
interface CompetencyReview {
  id: number;
  apprenticeId: number;
  apprenticeName: string;
  hostId: number;
  hostName: string;
  date: string;
  fieldOfficer: string;
  units: {
    id: number;
    code: string;
    title: string;
    competent: boolean;
    hasEvidence: boolean;
    nextReviewDate: string;
  }[];
  overallProgress: number;
}

export default function CompetencyReview() {
  const [, navigate] = useLocation();
  const [selectedApprentice, setSelectedApprentice] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedHost, setSelectedHost] = useState<string>('');
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{
    reviewId: number;
    unitId: number;
    code: string;
    title: string;
  } | null>(null);

  const {
    data: reviews,
    isLoading,
    error,
  } = useQuery<CompetencyReview[]>({
    queryKey: ['/api/field-officers/competency-reviews'],
  });

  const { toast } = useToast();

  if (error) {
    toast({
      variant: 'destructive',
      title: 'Error loading competency reviews',
      description: 'There was a problem loading the competency review data.',
    });
  }

  // Extract unique values for filters
  const uniqueApprentices = [
    ...new Set(
      (reviews || []).map(review => ({ id: review.apprenticeId, name: review.apprenticeName }))
    ),
  ];
  const uniqueHosts = [
    ...new Set((reviews || []).map(review => ({ id: review.hostId, name: review.hostName }))),
  ];
  const uniqueDates = [...new Set((reviews || []).map(review => review.date))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Filter reviews based on selected filters
  const filteredReview = reviews?.find(review => {
    const matchesApprentice = selectedApprentice
      ? review.apprenticeId.toString() === selectedApprentice
      : false;
    const matchesDate = selectedDate ? review.date === selectedDate : true;
    const matchesHost = selectedHost ? review.hostId.toString() === selectedHost : true;

    return matchesApprentice && matchesDate && matchesHost;
  });

  // Handle evidence upload
  const handleUploadEvidence = (reviewId: number, unitId: number, code: string, title: string) => {
    setSelectedUnit({ reviewId, unitId, code, title });
    setUploadDialogOpen(true);
  };

  // Mock function to simulate upload
  const simulateUpload = () => {
    if (!selectedUnit) return;

    const key = `${selectedUnit.reviewId}-${selectedUnit.unitId}`;
    setIsUploading({ ...isUploading, [key]: true });

    // Simulate upload delay
    setTimeout(() => {
      setIsUploading({ ...isUploading, [key]: false });
      setUploadDialogOpen(false);

      toast({
        title: 'Evidence uploaded',
        description: `Evidence for ${selectedUnit.code} has been uploaded successfully.`,
      });

      setSelectedUnit(null);
    }, 1500);
  };

  // Handle competency toggle
  const toggleCompetency = (reviewId: number, unitId: number, currentValue: boolean) => {
    toast({
      variant: currentValue ? 'destructive' : 'default',
      title: currentValue ? 'Competency removed' : 'Marked as competent',
      description: `The unit has been marked as ${currentValue ? 'not yet competent' : 'competent'}.`,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Competency & Training Review</h1>
          <p className="text-muted-foreground">
            Review, assess, and track apprentice competency progress
          </p>
        </div>
        <Button onClick={() => navigate('/field-officers/competency/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Competency Review
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedApprentice} onValueChange={setSelectedApprentice}>
          <SelectTrigger>
            <span className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>
                {selectedApprentice
                  ? uniqueApprentices.find(a => a.id.toString() === selectedApprentice)?.name
                  : 'Select Apprentice'}
              </span>
            </span>
          </SelectTrigger>
          <SelectContent>
            {uniqueApprentices.map(apprentice => (
              <SelectItem key={apprentice.id} value={apprentice.id.toString()}>
                {apprentice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDate} onValueChange={setSelectedDate} disabled={!selectedApprentice}>
          <SelectTrigger>
            <span className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                {selectedDate ? format(new Date(selectedDate), 'dd MMM yyyy') : 'Select Date'}
              </span>
            </span>
          </SelectTrigger>
          <SelectContent>
            {uniqueDates.map(date => (
              <SelectItem key={date} value={date}>
                {format(new Date(date), 'dd MMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedHost} onValueChange={setSelectedHost}>
          <SelectTrigger>
            <span className="flex items-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <span>
                {selectedHost
                  ? uniqueHosts.find(h => h.id.toString() === selectedHost)?.name
                  : 'Select Host (Optional)'}
              </span>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-hosts">All Hosts</SelectItem>
            {uniqueHosts.map(host => (
              <SelectItem key={host.id} value={host.id.toString()}>
                {host.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedApprentice ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <User className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Select an Apprentice</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              Please select an apprentice to view their competency review records
            </p>
          </CardContent>
        </Card>
      ) : !filteredReview ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Select a Review Date</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              Please select a date to view the competency review for this apprentice
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="p-4 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <CardTitle className="text-xl">
                  {filteredReview.apprenticeName} - Competency Review
                </CardTitle>
                <CardDescription>
                  Host Employer: {filteredReview.hostName} | Date:{' '}
                  {format(new Date(filteredReview.date), 'dd MMM yyyy')} | Field Officer:{' '}
                  {filteredReview.fieldOfficer}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm mr-2">Overall Progress:</div>
                <Progress value={filteredReview.overallProgress} className="w-32 h-2" />
                <div className="text-sm font-medium">{filteredReview.overallProgress}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Code</TableHead>
                    <TableHead className="w-[40%]">Unit Title</TableHead>
                    <TableHead className="text-center">Competent</TableHead>
                    <TableHead className="text-center">Evidence</TableHead>
                    <TableHead>Next Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Skeleton className="h-5 w-20" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-60" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-8 w-8 mx-auto rounded-full" />
                            </TableCell>
                            <TableCell className="text-center">
                              <Skeleton className="h-5 w-20 mx-auto" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-5 w-28" />
                            </TableCell>
                          </TableRow>
                        ))
                    : filteredReview.units.map(unit => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-mono">{unit.code}</TableCell>
                          <TableCell>
                            <div className="font-medium">{unit.title}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={unit.competent ? 'default' : 'outline'}
                                    size="icon"
                                    className={
                                      unit.competent ? 'bg-green-500 hover:bg-green-600' : ''
                                    }
                                    onClick={() =>
                                      toggleCompetency(filteredReview.id, unit.id, unit.competent)
                                    }
                                  >
                                    {unit.competent ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {unit.competent
                                    ? 'Mark as not yet competent'
                                    : 'Mark as competent'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-center">
                            {unit.hasEvidence ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View uploaded evidence</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUploadEvidence(
                                    filteredReview.id,
                                    unit.id,
                                    unit.code,
                                    unit.title
                                  )
                                }
                                disabled={isUploading[`${filteredReview.id}-${unit.id}`]}
                              >
                                {isUploading[`${filteredReview.id}-${unit.id}`] ? (
                                  <span className="animate-spin mr-1">...</span>
                                ) : (
                                  <Upload className="h-3 w-3 mr-1" />
                                )}
                                Upload
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(unit.nextReviewDate), 'dd MMM yyyy')}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-4 border-t gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/field-officers/competency/${filteredReview.id}/edit`)}
            >
              Edit Review
            </Button>
            <Button
              onClick={() => navigate(`/field-officers/competency/${filteredReview.id}/report`)}
            >
              Generate Report
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Upload Evidence Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Evidence</DialogTitle>
            <DialogDescription>
              Upload evidence for unit {selectedUnit?.code} - {selectedUnit?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="mb-2 text-sm font-medium">
                Drag and drop files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (max 10MB)
              </p>
              <Button size="sm">Browse Files</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={simulateUpload}
              disabled={isUploading[`${selectedUnit?.reviewId}-${selectedUnit?.unitId}`]}
            >
              {isUploading[`${selectedUnit?.reviewId}-${selectedUnit?.unitId}`] && (
                <span className="animate-spin mr-1">...</span>
              )}
              Upload Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
