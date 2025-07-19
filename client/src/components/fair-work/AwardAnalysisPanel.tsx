import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, BrainCircuit, Loader2 } from 'lucide-react';
import axios from 'axios';

interface AwardAnalysisPanelProps {
  awardUpdate: any;
  onAnalysisComplete: () => void;
}

export function AwardAnalysisPanel({ awardUpdate, onAnalysisComplete }: AwardAnalysisPanelProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Extract AI analysis from award update if available
  let aiAnalysis = null;
  let notificationMessage = null;
  let impactLevel = null;

  if (awardUpdate.aiAnalysis) {
    try {
      aiAnalysis = JSON.parse(awardUpdate.aiAnalysis);
      notificationMessage = awardUpdate.notificationMessage;
      impactLevel = awardUpdate.impactLevel;
    } catch (error) {
      console.error('Error parsing AI analysis:', error);
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const response = await axios.post(`/api/fairwork/award-updates/${awardUpdate.id}/analyze`);

      if (response.data.success) {
        toast({
          title: 'Analysis Complete',
          description: 'The award has been analyzed successfully.',
        });

        // Callback to refresh data
        onAnalysisComplete();
      } else {
        toast({
          title: 'Analysis Failed',
          description: response.data.message || 'Failed to analyze award update.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error analyzing award:', error);
      toast({
        title: 'Analysis Failed',
        description: error.response?.data?.message || 'An error occurred during analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactBadge = (level: string | null) => {
    if (!level) return null;

    switch (level.toLowerCase()) {
      case 'low':
        return <Badge className="bg-blue-500">Low Impact</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium Impact</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High Impact</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5" />
          AI Analysis
          {impactLevel && <div className="ml-auto">{getImpactBadge(impactLevel)}</div>}
        </CardTitle>
        <CardDescription>
          {aiAnalysis
            ? 'AI-powered analysis of this award update'
            : 'Analyze this award update using AI to assess its impact'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!aiAnalysis && !isAnalyzing && (
          <div className="flex flex-col items-center py-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-center text-muted-foreground">
              No analysis has been performed yet. Click the button below to analyze this award
              update.
            </p>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center py-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-3" />
            <p className="text-center">Analyzing award update... This may take a moment.</p>
          </div>
        )}

        {aiAnalysis && !isAnalyzing && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">Summary</h4>
              <p className="text-sm">{aiAnalysis.summary}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-1">Key Changes</h4>
              <ul className="list-disc list-inside text-sm">
                {aiAnalysis.keyChanges.map((change: string, index: number) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>

            {notificationMessage && (
              <div>
                <h4 className="font-medium text-sm mb-1">Notification Message</h4>
                <div className="bg-muted p-3 rounded-md text-sm">{notificationMessage}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!aiAnalysis && !isAnalyzing && (
          <Button onClick={handleAnalyze} className="w-full">
            <BrainCircuit className="mr-2 h-4 w-4" />
            Analyze with AI
          </Button>
        )}

        {aiAnalysis && !isAnalyzing && (
          <Button onClick={handleAnalyze} variant="outline" className="w-full">
            <BrainCircuit className="mr-2 h-4 w-4" />
            Re-analyze
          </Button>
        )}

        {isAnalyzing && (
          <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
