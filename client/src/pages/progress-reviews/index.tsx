import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ChevronRight, PlusCircle, AlignLeft, FileText, CheckCircle2, Clock, BarChart4 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ReviewStats {
  reviews: {
    scheduled: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  actionItems: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
}

interface ProgressReview {
  id: number;
  apprenticeId: number;
  templateId: number;
  reviewerId: number;
  reviewDate: string;
  scheduledDate: string;
  status: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  reviewData: any;
  overallRating: number;
  reviewSummary: string;
  apprenticeFeedback: string;
  reviewLocation: string;
  nextReviewDate: string;
  nextReviewGoals: any;
  hostEmployerId: number;
  supervisorPresent: boolean;
  supervisorName: string;
  supervisorFeedback: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgressReviewTemplate {
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

export default function ProgressReviewsDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<ReviewStats>({
    queryKey: ['/api/progress-reviews/dashboard/stats'],
  });

  // Fetch upcoming reviews
  const { data: upcomingReviews, isLoading: isLoadingUpcoming } = useQuery<ProgressReview[]>({
    queryKey: ['/api/progress-reviews/dashboard/upcoming'],
  });

  // Fetch templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery<ProgressReviewTemplate[]>({
    queryKey: ['/api/progress-reviews/templates'],
  });

  // Fetch recent reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<ProgressReview[]>({
    queryKey: ['/api/progress-reviews/reviews', { limit: 5 }],
  });

  if (isLoadingStats && isLoadingUpcoming && isLoadingTemplates && isLoadingReviews) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Progress Reviews</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Progress Reviews</h1>
        <div className="flex gap-2">
          <Link href="/progress-reviews/templates/create">
            <Button variant="outline">
              <AlignLeft className="mr-2 h-4 w-4" /> New Template
            </Button>
          </Link>
          <Link href="/progress-reviews/reviews/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Review
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.reviews.scheduled || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Upcoming reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.reviews.inProgress || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Currently being conducted</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.reviews.completed || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Reviews finalized</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.actionItems.pending || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Pending actions</div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Reviews & Active Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Upcoming Reviews</CardTitle>
                <CardDescription>Reviews scheduled for the near future</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingReviews && upcomingReviews.length > 0 ? (
                  upcomingReviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Review #{review.id}</div>
                        <div className="text-sm text-muted-foreground">
                          Scheduled: {formatDate(review.scheduledDate || review.reviewDate)}
                        </div>
                      </div>
                      <Link href={`/progress-reviews/reviews/${review.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No upcoming reviews scheduled
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/progress-reviews/reviews">
                  <Button variant="outline" className="w-full">View All Reviews</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Active Templates</CardTitle>
                <CardDescription>Available review templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates && templates.filter(t => t.isActive).length > 0 ? (
                  templates.filter(t => t.isActive).slice(0, 5).map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{template.templateName}</div>
                        <div className="text-sm text-muted-foreground">
                          v{template.templateVersion}
                        </div>
                      </div>
                      <Link href={`/progress-reviews/templates/${template.id}`}>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No active templates found
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href="/progress-reviews/templates">
                  <Button variant="outline" className="w-full">View All Templates</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest progress reviews conducted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-4">
                          {review.status === 'scheduled' && <Clock className="h-8 w-8 text-blue-500" />}
                          {review.status === 'in_progress' && <AlignLeft className="h-8 w-8 text-amber-500" />}
                          {review.status === 'completed' && <CheckCircle2 className="h-8 w-8 text-green-500" />}
                          {review.status === 'cancelled' && <FileText className="h-8 w-8 text-gray-400" />}
                        </div>
                        <div>
                          <div className="font-medium">Review #{review.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {review.reviewDate && `Conducted: ${formatDate(review.reviewDate)}`}
                          </div>
                          <Badge
                            className={`mt-1 ${review.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                              review.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                              review.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'}`}
                          >
                            {review.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/progress-reviews/reviews/${review.id}`}>
                        <Button>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No reviews found
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/progress-reviews/reviews">
                <Button variant="outline">View All Reviews</Button>
              </Link>
              <Link href="/progress-reviews/reviews/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> New Review
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Templates</CardTitle>
              <CardDescription>Templates used for conducting reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates && templates.length > 0 ? (
                  templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <FileText className={`h-8 w-8 ${template.isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">{template.templateName}</div>
                          <div className="text-sm text-muted-foreground">
                            Version: {template.templateVersion}
                          </div>
                          <Badge className={template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/progress-reviews/templates/${template.id}`}>
                          <Button variant="outline">
                            View Template
                          </Button>
                        </Link>
                        <Link href={`/progress-reviews/reviews/create?templateId=${template.id}`}>
                          <Button>
                            Use Template
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No templates found
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/progress-reviews/templates">
                <Button variant="outline">View All Templates</Button>
              </Link>
              <Link href="/progress-reviews/templates/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> New Template
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
