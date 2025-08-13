import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Building2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Award {
  id: number;
  name: string;
  code: string;
  industry?: string;
  sector?: string;
  description?: string;
  effectiveDate?: string;
  fairWorkReference?: string;
  fairWorkTitle?: string;
  isActive: boolean;
}

interface AwardClassification {
  id: number;
  awardId: number;
  name: string;
  level: string;
  aqfLevel?: number;
  description?: string;
  fairWorkLevelCode?: string;
  fairWorkLevelDesc?: string;
  isActive: boolean;
}

interface AwardSelectorProps {
  onAwardSelected: (award: Award, classification?: AwardClassification) => void;
  preselectedAwardId?: number;
  preselectedClassificationId?: number;
  includeClassificationSelection?: boolean;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AwardSelector({
  onAwardSelected,
  preselectedAwardId,
  preselectedClassificationId,
  includeClassificationSelection = true,
  buttonLabel = 'Select Award',
  buttonVariant = 'default',
  buttonSize = 'default',
}: AwardSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('');
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [selectedClassification, setSelectedClassification] = useState<AwardClassification | null>(
    null
  );

  const { toast } = useToast();

  // Fetch all awards
  const { data: awardsResponse, isLoading: isLoadingAwards } = useQuery({
    queryKey: ['/api/fairwork/awards'],
  });

  const awards = React.useMemo(
    () => awardsResponse?.data?.awards || [],
    [awardsResponse?.data?.awards]
  );

  // Fetch classifications for selected award
  const { data: classificationsResponse, isLoading: isLoadingClassifications } = useQuery({
    queryKey: ['/api/fairwork/awards', selectedAward?.code, 'classifications'],
    enabled: !!selectedAward?.code,
  });

  const classifications = React.useMemo(
    () => classificationsResponse?.data?.classifications || [],
    [classificationsResponse?.data?.classifications]
  );

  // Extract unique industries and sectors for filtering
  const industries = React.useMemo(() => {
    if (!awards) return [];
    const uniqueIndustries = new Set<string>();
    awards.forEach((award: Award) => {
      if (award.industry) uniqueIndustries.add(award.industry);
    });
    return Array.from(uniqueIndustries).sort();
  }, [awards]);

  const sectors = React.useMemo(() => {
    if (!awards) return [];
    const uniqueSectors = new Set<string>();
    awards.forEach((award: Award) => {
      if (award.sector) uniqueSectors.add(award.sector);
    });
    return Array.from(uniqueSectors).sort();
  }, [awards]);

  // Filter awards based on search and filters
  const filteredAwards = React.useMemo(() => {
    if (!awards) return [];
    return awards.filter((award: Award) => {
      const matchesSearch =
        searchTerm === '' ||
        award.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        award.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry = industryFilter === '' || award.industry === industryFilter;
      const matchesSector = sectorFilter === '' || award.sector === sectorFilter;

      return matchesSearch && matchesIndustry && matchesSector;
    });
  }, [awards, searchTerm, industryFilter, sectorFilter]);

  // Initialize with preselected values if provided
  useEffect(() => {
    if (preselectedAwardId && awards) {
      const award = awards.find((a: Award) => a.id === preselectedAwardId);
      if (award) {
        setSelectedAward(award);
      }
    }
  }, [preselectedAwardId, awards]);

  useEffect(() => {
    if (preselectedClassificationId && classifications) {
      const classification = classifications.find(
        (c: AwardClassification) => c.id === preselectedClassificationId
      );
      if (classification) {
        setSelectedClassification(classification);
      }
    }
  }, [preselectedClassificationId, classifications]);

  const handleAwardSelect = (award: Award) => {
    setSelectedAward(award);
    if (!includeClassificationSelection) {
      onAwardSelected(award);
      setOpen(false);
    }
  };

  const handleClassificationSelect = (classification: AwardClassification) => {
    setSelectedClassification(classification);
  };

  const handleConfirm = () => {
    if (!selectedAward) {
      toast({
        title: 'Error',
        description: 'Please select an award',
        variant: 'destructive',
      });
      return;
    }

    if (includeClassificationSelection && !selectedClassification) {
      toast({
        title: 'Error',
        description: 'Please select a classification',
        variant: 'destructive',
      });
      return;
    }

    onAwardSelected(selectedAward, selectedClassification || undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Select Modern Award</DialogTitle>
          <DialogDescription>
            Choose from Fair Work Commission's modern awards and classifications.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by award name or code..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <Building2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_industries">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry || 'unknown'}>
                    {industry || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_sectors">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector || 'unknown'}>
                    {sector || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main selection area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-auto p-1">
          {/* Award list */}
          <div>
            <h3 className="text-sm font-medium mb-3">Modern Awards ({filteredAwards.length})</h3>
            {isLoadingAwards ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAwards.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No awards found matching your criteria.
                  </p>
                ) : (
                  filteredAwards.map((award: Award) => (
                    <Card
                      key={award.id}
                      className={`cursor-pointer hover:border-primary ${selectedAward?.id === award.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => handleAwardSelect(award)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm font-medium">{award.name}</CardTitle>
                          <Badge variant="outline">{award.code}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                        {award.description || 'No description available.'}
                      </CardContent>
                      <CardFooter className="p-2 px-4 flex justify-between items-center text-xs">
                        <div className="flex space-x-2">
                          {award.industry && (
                            <Badge variant="secondary" className="text-xs">
                              {award.industry}
                            </Badge>
                          )}
                          {award.sector && (
                            <Badge variant="secondary" className="text-xs">
                              {award.sector}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Effective: {new Date(award.effectiveDate || '').toLocaleDateString()}
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Classification list - only show if award selected and includeClassificationSelection is true */}
          {includeClassificationSelection && (
            <div>
              <h3 className="text-sm font-medium mb-3">
                Classifications {selectedAward ? `(${selectedAward.name})` : ''}
              </h3>
              {!selectedAward ? (
                <div className="flex h-full items-center justify-center border rounded-md p-6">
                  <p className="text-sm text-muted-foreground">
                    Select an award to view classifications
                  </p>
                </div>
              ) : isLoadingClassifications ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {classifications && classifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No classifications found for this award.
                    </p>
                  ) : (
                    classifications &&
                    classifications.map((classification: AwardClassification) => (
                      <Card
                        key={classification.id}
                        className={`cursor-pointer hover:border-primary ${selectedClassification?.id === classification.id ? 'border-primary bg-primary/5' : ''}`}
                        onClick={() => handleClassificationSelect(classification)}
                      >
                        <CardHeader className="p-3 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {classification.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">{classification.level}</Badge>
                            {classification.aqfLevel && (
                              <Badge className="ml-2">AQF Level {classification.aqfLevel}</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAward || (includeClassificationSelection && !selectedClassification)}
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
