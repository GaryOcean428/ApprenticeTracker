import React from 'react';
import { Link } from 'wouter';
import { Calendar, FileText, CheckCircle, PlusCircle, Clock, AlertCircle, FileHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';

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

export default function ProgressReviewsPage() {
  // Fetch reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<ProgressReview[]>({
    queryKey: ['/api/progress-reviews/reviews'],
  });
  
  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ['/api/progress-reviews/templates'],
  });

  // Calculate statistics
  const stats = {
    completedReviews: reviews?.filter(r => r.status === 'completed').length || 0,
    scheduledReviews: reviews?.filter(r => r.status === 'scheduled').length || 0,
    inProgressReviews: reviews?.filter(r => r.status === 'in_progress').length || 0,
    totalReviews: reviews?.length || 0,
    activeTemplates: templates?.filter(t => t.isActive).length || 0,
    totalTemplates: templates?.length || 0,
  };

  // Check if there are upcoming reviews (within 7 days)
  const upcomingReviews = reviews?.filter(review => {
    if (review.status !== 'scheduled') return false;
    const reviewDate = new Date(review.scheduledDate);
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    return reviewDate >= today && reviewDate <= sevenDaysLater;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Progress Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage apprentice progress review sessions</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/progress-reviews/reviews/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Review
            </Button>
          </Link>
          <Link href="/progress-reviews/templates/create">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> New Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedReviews} completed, {stats.scheduledReviews} scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Reviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReviews?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled in the next 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressReviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Reviews currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <FileHeart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTemplates}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Of {stats.totalTemplates} total templates
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reviews</CardTitle>
            <CardDescription>Reviews scheduled in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/>
              </div>
            ) : upcomingReviews && upcomingReviews.length > 0 ? (
              <div className="space-y-4">
                {upcomingReviews.map((review) => (
                  <div key={review.id} className="flex items-start p-4 border rounded-md">
                    <div className="bg-primary/10 p-2 rounded-lg mr-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Review #{review.id}</div>
                      <div className="text-sm text-muted-foreground">
                        Scheduled for {new Date(review.scheduledDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Link href={`/progress-reviews/reviews/${review.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No reviews scheduled in the next 7 days</p>
                <Link href="/progress-reviews/reviews/create">
                  <Button variant="link" className="mt-2">
                    Schedule a review
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Templates Section */}
        <Card>
          <CardHeader>
            <CardTitle>Review Templates</CardTitle>
            <CardDescription>Your active review templates</CardDescription>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/>
              </div>
            ) : templates && templates.filter(t => t.isActive).length > 0 ? (
              <div className="space-y-4">
                {templates
                  .filter(t => t.isActive)
                  .slice(0, 5)
                  .map((template) => (
                    <div key={template.id} className="flex items-start p-4 border rounded-md">
                      <div className="bg-primary/10 p-2 rounded-lg mr-3">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{template.templateName}</div>
                        <div className="text-sm text-muted-foreground">
                          Version: {template.templateVersion}
                        </div>
                      </div>
                      <Link href={`/progress-reviews/reviews/create?templateId=${template.id}`}>
                        <Button variant="outline" size="sm">Use</Button>
                      </Link>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed rounded-md text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No active templates found</p>
                <Link href="/progress-reviews/templates/create">
                  <Button variant="link" className="mt-2">
                    Create a template
                  </Button>
                </Link>
              </div>
            )}
            <div className="mt-4 text-center">
              <Link href="/progress-reviews/templates">
                <Button variant="link">
                  View all templates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Link href="/progress-reviews/reviews">
          <Button className="mr-2">
            View All Reviews
          </Button>
        </Link>
        <Link href="/progress-reviews/templates">
          <Button variant="outline">
            Manage Templates
          </Button>
        </Link>
      </div>
    </div>
  );
}
