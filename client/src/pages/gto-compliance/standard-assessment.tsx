import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Loader2, CheckCircle, AlertCircle, Upload, Paperclip } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function StandardAssessment() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('details');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [assessmentData, setAssessmentData] = useState({
    status: '',
    notes: '',
    evidenceDescription: '',
    actionItems: [],
    dueDate: ''
  });

  // Extract standard ID from URL query parameters
  const params = new URLSearchParams(window.location.search);
  const standardId = parseInt(params.get('id') || '0');
  const organizationId = parseInt(params.get('organization') || '1'); // Default to first org
  
  // Handle form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssessmentData({
      ...assessmentData,
      [name]: value
    });
  };

  // Handle radio selection for status
  const handleStatusChange = (value: string) => {
    setAssessmentData({
      ...assessmentData,
      status: value
    });
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setEvidenceFiles([...evidenceFiles, ...newFiles]);
    }
  };

  // Fetch standard details
  const { data: standard, isLoading: isLoadingStandard } = useQuery({
    queryKey: ['/api/gto-compliance/standards', standardId],
    queryFn: async () => {
      if (!standardId) return null;
      
      try {
        const response = await fetch(`/api/gto-compliance/standards/${standardId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch standard details');
        }
        return await response.json();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch standard details',
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!standardId,
  });

  // Fetch existing assessment if any
  const { data: assessment, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['/api/gto-compliance/assessments', organizationId, standardId],
    queryFn: async () => {
      if (!standardId || !organizationId) return null;
      
      try {
        const response = await fetch(`/api/gto-compliance/assessments/${organizationId}?standardId=${standardId}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null; // No assessment exists yet
          }
          throw new Error('Failed to fetch assessment');
        }
        return await response.json();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch assessment details',
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!standardId && !!organizationId,
    onSuccess: (data) => {
      if (data) {
        setAssessmentData({
          status: data.status,
          notes: data.notes || '',
          evidenceDescription: data.evidenceDescription || '',
          actionItems: data.actionItems || [],
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : ''
        });
      }
    }
  });

  // Create or update assessment mutation
  const saveAssessmentMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        organizationId,
        standardId,
        ...assessmentData,
        assessmentDate: new Date().toISOString(),
        // In a real app, would upload files and store references
      };

      const url = '/api/gto-compliance/assessments';
      const method = assessment ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Assessment saved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/gto-compliance/assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gto-compliance/dashboard'] });
      navigate('/gto-compliance');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save assessment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (isLoadingStandard || isLoadingAssessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="container py-10 mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Standard Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested standard could not be found.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/gto-compliance')}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const statusOptions = [
    { value: 'compliant', label: 'Compliant', icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
    { value: 'at_risk', label: 'At Risk', icon: <AlertCircle className="h-4 w-4 text-yellow-500" /> },
    { value: 'non_compliant', label: 'Non-Compliant', icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
    { value: 'in_progress', label: 'In Progress', icon: <Loader2 className="h-4 w-4 text-blue-500" /> },
  ];

  return (
    <div className="container py-10 mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Standard Assessment</h1>
            <p className="text-muted-foreground mt-1">
              Assess compliance with the National Standards for GTOs
            </p>
          </div>
          <Button onClick={() => navigate('/gto-compliance')}>
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{standard.standardNumber}: {standard.standardName}</CardTitle>
            <CardDescription className="text-base">
              {standard.standardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Standard Details</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="evidence">Evidence</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Required Evidence</h3>
                    {standard.requiredEvidence && standard.requiredEvidence.length > 0 ? (
                      <ul className="list-disc pl-6 space-y-2">
                        {standard.requiredEvidence.map((evidence, index) => (
                          <li key={index}>{evidence}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No specific evidence requirements defined.</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Compliance Criteria</h3>
                    {standard.complianceCriteria && standard.complianceCriteria.length > 0 ? (
                      <ul className="list-disc pl-6 space-y-2">
                        {standard.complianceCriteria.map((criteria, index) => (
                          <li key={index}>{criteria}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No specific compliance criteria defined.</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Related Regulations</h3>
                    {standard.regulations && standard.regulations.length > 0 ? (
                      <ul className="list-disc pl-6 space-y-2">
                        {standard.regulations.map((regulation, index) => (
                          <li key={index}>{regulation}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No related regulations specified.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="assessment">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Assessment Status</h3>
                    <RadioGroup 
                      value={assessmentData.status} 
                      onValueChange={handleStatusChange}
                      className="grid grid-cols-2 gap-4"
                    >
                      {statusOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex items-center">
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Assessment Notes</h3>
                    <Textarea 
                      name="notes"
                      value={assessmentData.notes}
                      onChange={handleInputChange}
                      placeholder="Enter detailed notes about the compliance assessment..."
                      className="min-h-[150px]"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Due Date</h3>
                    <div className="max-w-sm">
                      <Input 
                        type="date"
                        name="dueDate"
                        value={assessmentData.dueDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="evidence">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Evidence Description</h3>
                    <Textarea 
                      name="evidenceDescription"
                      value={assessmentData.evidenceDescription}
                      onChange={handleInputChange}
                      placeholder="Describe the evidence reviewed for this assessment..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Upload Evidence</h3>
                    <div className="border border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                      <p className="mb-2">Drag and drop files here or click to browse</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        PDF, DOC, XLSX, JPEG, PNG files are supported
                      </p>
                      <Input 
                        type="file"
                        multiple
                        className="hidden"
                        id="evidence-upload"
                        onChange={handleFileChange}
                      />
                      <Label htmlFor="evidence-upload">
                        <Button type="button" variant="outline">
                          Select Files
                        </Button>
                      </Label>
                    </div>
                    
                    {evidenceFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Selected Files</h4>
                        <ul className="space-y-2">
                          {evidenceFiles.map((file, index) => (
                            <li key={index} className="flex items-center">
                              <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{file.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/gto-compliance')}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveAssessmentMutation.mutate()}
              disabled={!assessmentData.status || saveAssessmentMutation.isPending}
            >
              {saveAssessmentMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Assessment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}