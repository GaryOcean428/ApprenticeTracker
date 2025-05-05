import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { FileText, Save, Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { getDefaultFormStructure } from '@/lib/progress-review-utils';

interface Question {
  id: string;
  type: 'rating' | 'text' | 'textarea' | 'checkbox';
  label: string;
  description?: string;
  required: boolean;
}

interface Section {
  title: string;
  description?: string;
  questions: Question[];
}

interface FormStructure {
  sections: Section[];
}

export default function CreateTemplatePage() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [templateName, setTemplateName] = useState('');
  const [templateVersion, setTemplateVersion] = useState('1.0');
  const [description, setDescription] = useState('');
  const [formStructure, setFormStructure] = useState<FormStructure>(getDefaultFormStructure());
  
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/progress-reviews/templates', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress-reviews/templates'] });
      toast({
        title: 'Template Created',
        description: 'The review template has been created successfully.',
      });
      navigate('/progress-reviews/templates');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create the template',
        variant: 'destructive',
      });
    },
  });

  const addSection = () => {
    setFormStructure({
      ...formStructure,
      sections: [
        ...formStructure.sections,
        {
          title: 'New Section',
          description: 'Description for this section',
          questions: [
            {
              id: `question_${Date.now()}`,
              type: 'textarea',
              label: 'New Question',
              description: 'Description for this question',
              required: false,
            },
          ],
        },
      ],
    });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const updatedSections = [...formStructure.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormStructure({ ...formStructure, sections: updatedSections });
  };

  const removeSection = (index: number) => {
    const updatedSections = formStructure.sections.filter((_, i) => i !== index);
    setFormStructure({ ...formStructure, sections: updatedSections });
  };

  const addQuestion = (sectionIndex: number) => {
    const updatedSections = [...formStructure.sections];
    updatedSections[sectionIndex].questions.push({
      id: `question_${Date.now()}`,
      type: 'textarea',
      label: 'New Question',
      description: 'Description for this question',
      required: false,
    });
    setFormStructure({ ...formStructure, sections: updatedSections });
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, field: string, value: any) => {
    const updatedSections = [...formStructure.sections];
    updatedSections[sectionIndex].questions[questionIndex] = {
      ...updatedSections[sectionIndex].questions[questionIndex],
      [field]: value,
    };
    setFormStructure({ ...formStructure, sections: updatedSections });
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    const updatedSections = [...formStructure.sections];
    updatedSections[sectionIndex].questions = updatedSections[sectionIndex].questions.filter(
      (_, i) => i !== questionIndex
    );
    setFormStructure({ ...formStructure, sections: updatedSections });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateName || !templateVersion || !description || formStructure.sections.length === 0) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields and add at least one section.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all sections have titles and at least one question
    for (const section of formStructure.sections) {
      if (!section.title || section.questions.length === 0) {
        toast({
          title: 'Incomplete Section',
          description: 'All sections must have a title and at least one question.',
          variant: 'destructive',
        });
        return;
      }

      // Validate all questions have labels
      for (const question of section.questions) {
        if (!question.label) {
          toast({
            title: 'Incomplete Question',
            description: 'All questions must have a label.',
            variant: 'destructive',
          });
          return;
        }
      }
    }

    createTemplateMutation.mutate({
      templateName,
      templateVersion,
      description,
      formStructure,
      isActive: true,
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Create Review Template</h1>
          <p className="text-muted-foreground mt-1">Design a new template for progress reviews</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={createTemplateMutation.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          {createTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
              <CardDescription>Basic information about this template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Monthly Apprentice Review"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateVersion">Version</Label>
                <Input
                  id="templateVersion"
                  value={templateVersion}
                  onChange={(e) => setTemplateVersion(e.target.value)}
                  placeholder="e.g., 1.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose and use case of this template"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form structure - Sections and Questions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Structure</CardTitle>
              <CardDescription>Define the sections and questions for this template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Accordion type="multiple" defaultValue={formStructure.sections.map((_, i) => `section-${i}`)}>
                {formStructure.sections.map((section, sectionIndex) => (
                  <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full">
                        <span>{section.title || 'Untitled Section'}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2 flex-1">
                            <Label htmlFor={`section-${sectionIndex}-title`}>Section Title</Label>
                            <Input
                              id={`section-${sectionIndex}-title`}
                              value={section.title}
                              onChange={(e) => updateSection(sectionIndex, 'title', e.target.value)}
                              placeholder="Enter section title"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ml-4 self-end"
                            onClick={() => removeSection(sectionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`section-${sectionIndex}-description`}>Section Description</Label>
                          <Textarea
                            id={`section-${sectionIndex}-description`}
                            value={section.description}
                            onChange={(e) => updateSection(sectionIndex, 'description', e.target.value)}
                            placeholder="Describe this section"
                            rows={2}
                          />
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Questions</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addQuestion(sectionIndex)}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add Question
                            </Button>
                          </div>

                          {section.questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="p-4 border rounded-md space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                  <Label htmlFor={`question-${sectionIndex}-${questionIndex}-label`}>
                                    Question Label
                                  </Label>
                                  <Input
                                    id={`question-${sectionIndex}-${questionIndex}-label`}
                                    value={question.label}
                                    onChange={(e) =>
                                      updateQuestion(sectionIndex, questionIndex, 'label', e.target.value)
                                    }
                                    placeholder="Enter question label"
                                  />
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="ml-4"
                                  onClick={() => removeQuestion(sectionIndex, questionIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`question-${sectionIndex}-${questionIndex}-description`}>
                                  Question Description
                                </Label>
                                <Textarea
                                  id={`question-${sectionIndex}-${questionIndex}-description`}
                                  value={question.description}
                                  onChange={(e) =>
                                    updateQuestion(sectionIndex, questionIndex, 'description', e.target.value)
                                  }
                                  placeholder="Describe this question"
                                  rows={2}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`question-${sectionIndex}-${questionIndex}-type`}>
                                    Question Type
                                  </Label>
                                  <select
                                    id={`question-${sectionIndex}-${questionIndex}-type`}
                                    value={question.type}
                                    onChange={(e) =>
                                      updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)
                                    }
                                    className="w-full border p-2 rounded-md"
                                  >
                                    <option value="rating">Rating (1-5 Stars)</option>
                                    <option value="text">Short Text</option>
                                    <option value="textarea">Long Text</option>
                                    <option value="checkbox">Checkbox (Yes/No)</option>
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`question-${sectionIndex}-${questionIndex}-required`}>
                                    Required
                                  </Label>
                                  <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                      id={`question-${sectionIndex}-${questionIndex}-required`}
                                      checked={question.required}
                                      onCheckedChange={(checked) =>
                                        updateQuestion(sectionIndex, questionIndex, 'required', checked)
                                      }
                                    />
                                    <Label htmlFor={`question-${sectionIndex}-${questionIndex}-required`}>
                                      {question.required ? 'Required' : 'Optional'}
                                    </Label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {section.questions.length === 0 && (
                            <div className="text-center p-6 border border-dashed rounded-md text-muted-foreground">
                              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p>No questions added yet</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => addQuestion(sectionIndex)}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add First Question
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {formStructure.sections.length === 0 && (
                <div className="text-center p-10 border border-dashed rounded-md text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">No sections added yet</p>
                  <p className="text-sm mb-4">A template must have at least one section with questions</p>
                  <Button onClick={addSection}>
                    <Plus className="h-4 w-4 mr-1" /> Add First Section
                  </Button>
                </div>
              )}

              {formStructure.sections.length > 0 && (
                <Button onClick={addSection} className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Section
                </Button>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={createTemplateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {createTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
