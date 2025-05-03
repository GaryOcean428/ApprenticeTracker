import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface QualificationSearchProps {
  onImport: (qualification: Qualification) => void;
  isImporting?: boolean;
}

export function QualificationSearch({ onImport, isImporting = false }: QualificationSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<Qualification[]>({
    queryKey: ["/api/tga/search"],
    queryFn: async () => {
      if (searchTerm.length < 3) {
        throw new Error("Search term must be at least 3 characters");
      }
      const res = await apiRequest("GET", `/api/tga/search?query=${encodeURIComponent(searchTerm)}`);
      return res.json();
    },
    enabled: false,
  });

  const handleSearch = async () => {
    if (searchTerm.length < 3) {
      toast({
        title: "Search term too short",
        description: "Please enter at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      await refetch();
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (qualification: Qualification) => {
    onImport(qualification);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search qualifications (e.g., BSB20120, Certificate II)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={isLoading || isSearching}
          type="button"
        >
          {(isLoading || isSearching) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to search qualifications"}
          </AlertDescription>
        </Alert>
      )}

      {data && data.length === 0 && !isLoading && !isSearching && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No results</AlertTitle>
          <AlertDescription>
            No qualifications found matching your search term. Try a different
            search.
          </AlertDescription>
        </Alert>
      )}

      {data && data.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {data.length} qualifications matching your search term.
          </p>
          <div className="grid gap-4">
            {data.map((qualification) => (
              <Card key={qualification.code}>
                <CardContent className="pt-6 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{qualification.code}</span>
                      <Badge
                        variant={
                          qualification.status === "Current"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {qualification.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{qualification.title}</h4>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Training Package: {qualification.trainingPackage.code} - {qualification.trainingPackage.title}</p>
                      <p>Release Date: {new Date(qualification.releaseDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImport(qualification)}
                    disabled={isImporting}
                  >
                    {isImporting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Download className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
