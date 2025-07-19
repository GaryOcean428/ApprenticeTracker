import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  PlusCircle,
  ChevronRight,
  FileText,
  MoreHorizontal,
  Copy,
  Trash2,
  Check,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';

interface Template {
  id: number;
  templateName: string;
  description: string;
  templateVersion: string;
  formStructure: any;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesListPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch templates
  const {
    data: templates,
    isLoading,
    refetch,
  } = useQuery<Template[]>({
    queryKey: ['/api/progress-reviews/templates'],
  });

  // Filter templates based on search query
  const filteredTemplates = templates?.filter(
    template =>
      template.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.templateVersion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Duplicate a template
  const duplicateTemplate = async (template: Template) => {
    try {
      const duplicateData = {
        ...template,
        templateName: `${template.templateName} (Copy)`,
        templateVersion: `${template.templateVersion}-copy`,
      };
      delete duplicateData.id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      const response = await fetch('/api/progress-reviews/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate template');
      }

      await refetch();
      toast({
        title: 'Template Duplicated',
        description: 'The template has been duplicated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate the template.',
        variant: 'destructive',
      });
    }
  };

  // Toggle template active status
  const toggleTemplateStatus = async (template: Template) => {
    try {
      const response = await fetch(`/api/progress-reviews/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...template,
          isActive: !template.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update template status');
      }

      await refetch();
      toast({
        title: template.isActive ? 'Template Deactivated' : 'Template Activated',
        description: `The template has been ${template.isActive ? 'deactivated' : 'activated'} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update template status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Review Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage templates for apprentice progress reviews
          </p>
        </div>
        <Link href="/progress-reviews/templates/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Template
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : filteredTemplates && filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className={!template.isActive ? 'opacity-70' : ''}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg flex items-center">
                        {template.templateName}
                        <Badge className="ml-2" variant={template.isActive ? 'default' : 'outline'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Version: {template.templateVersion}
                      </div>
                      <p className="text-sm mb-2">{template.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Last updated: {formatDate(template.updatedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/progress-reviews/templates/${template.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/progress-reviews/reviews/create?templateId=${template.id}`}>
                      <Button size="sm" disabled={!template.isActive}>
                        Use Template
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => toggleTemplateStatus(template)}>
                          {template.isActive ? (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              <span>Activate</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateTemplate(template)}>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                        <Link href={`/progress-reviews/templates/${template.id}/edit`}>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Edit Template</span>
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {searchQuery
                ? 'No templates match your search criteria.'
                : 'There are no templates available yet.'}
            </p>
            <Link href="/progress-reviews/templates/create">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Template
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
