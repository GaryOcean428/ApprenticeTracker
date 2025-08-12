import { useState } from 'react';
import { Loader2, AlertCircle, Check, ExternalLink } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/main-layout';
import { QualificationSearch } from '@/components/vet/qualification-search';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Qualification {
  code: string;
  title: string;
  level: number;
  status: string;
  releaseDate: string;
  trainingPackage: {
    code: string;
    title: string;
  };
}

interface ImportResponse {
  message: string;
  qualificationId: number;
}

export default function ImportQualifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<Qualification | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const importMutation = useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const response = await apiRequest('POST', `/api/tga/import/${code}`, {
        importUnits: true,
      });
      return (await response.json()) as ImportResponse;
    },
    onSuccess: (data: ImportResponse) => {
      toast({
        title: 'Qualification imported',
        description: `Successfully imported qualification with ID ${data.qualificationId}`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/vet/qualifications'] });

      // Close the sheet
      setIsOpen(false);
      setSelectedQualification(null);

      // Navigate to the qualification detail page
      navigate(`/vet/qualifications/${data.qualificationId}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleImport = (qualification: Qualification) => {
    setSelectedQualification(qualification);
    setIsOpen(true);
  };

  const confirmImport = () => {
    if (selectedQualification) {
      importMutation.mutate({ code: selectedQualification.code });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Import Qualifications</h1>
            <p className="text-muted-foreground">
              Search and import qualifications from Training.gov.au into the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <a href="https://training.gov.au" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Training.gov.au
              </a>
            </Button>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="search">
          <TabsList>
            <TabsTrigger value="search">Search & Import</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search for Qualifications</CardTitle>
                <CardDescription>
                  Search for qualifications by code, title, or training package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <QualificationSearch
                  onImport={handleImport}
                  isImporting={importMutation.isPending}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Import Qualifications</CardTitle>
                <CardDescription>
                  Import multiple qualifications at once by industry or category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Feature coming soon</AlertTitle>
                  <AlertDescription>
                    Bulk import functionality is currently under development. Please use the search
                    feature to import qualifications one at a time.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Import Qualification</SheetTitle>
            <SheetDescription>
              Confirm importing the selected qualification and its units into the system
            </SheetDescription>
          </SheetHeader>

          <div className="py-6">
            {selectedQualification && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-lg">{selectedQualification.code}</p>
                  <p>{selectedQualification.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">AQF Level</p>
                    <p>{selectedQualification.level}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p>{selectedQualification.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Training Package</p>
                    <p>
                      {selectedQualification.trainingPackage.code} -{' '}
                      {selectedQualification.trainingPackage.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Release Date</p>
                    <p>{new Date(selectedQualification.releaseDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    This will import the qualification and all its units of competency from
                    Training.gov.au into your system.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={confirmImport} disabled={importMutation.isPending}>
              {importMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Import
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={importMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
