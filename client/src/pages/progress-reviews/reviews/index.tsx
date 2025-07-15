import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { PlusCircle, FileText, Clock, CheckCircle2, AlignLeft, Filter, Search } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { getStatusColor } from '@/lib/progress-review-utils';

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

interface Apprentice {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ReviewsListPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch reviews
  const { data: reviews, isLoading } = useQuery<ProgressReview[]>({
    queryKey: ['/api/progress-reviews/reviews'],
  });

  // Fetch apprentices for display names
  const { data: apprentices } = useQuery<Apprentice[]>({
    queryKey: ['/api/apprentices'],
  });

  // Get apprentice name based on ID
  const getApprenticeName = (apprenticeId: number) => {
    const apprentice = apprentices?.find(a => a.id === apprenticeId);
    return apprentice
      ? `${apprentice.firstName} ${apprentice.lastName}`
      : `Apprentice #${apprenticeId}`;
  };

  // Filter reviews based on search query and status filter
  const filteredReviews = reviews?.filter(review => {
    const matchesSearch =
      searchQuery === '' ||
      apprentices
        ?.find(a => a.id === review.apprenticeId)
        ?.firstName.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      apprentices
        ?.find(a => a.id === review.apprenticeId)
        ?.lastName.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      review.id.toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Progress Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage apprentice progress review sessions</p>
        </div>
        <Link href="/progress-reviews/reviews/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Review
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apprentice or review ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : filteredReviews && filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map(review => {
            const statusColors = getStatusColor(review.status);
            const reviewDate = review.reviewDate || review.scheduledDate;

            return (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start lg:items-center justify-between flex-col lg:flex-row gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`bg-${statusColors.bg} p-2 rounded-lg`}>
                        {review.status === 'scheduled' && (
                          <Clock className={`h-6 w-6 ${statusColors.icon}`} />
                        )}
                        {review.status === 'in_progress' && (
                          <AlignLeft className={`h-6 w-6 ${statusColors.icon}`} />
                        )}
                        {review.status === 'completed' && (
                          <CheckCircle2 className={`h-6 w-6 ${statusColors.icon}`} />
                        )}
                        {review.status === 'cancelled' && (
                          <FileText className={`h-6 w-6 ${statusColors.icon}`} />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-lg flex flex-wrap items-center gap-2">
                          Review #{review.id}
                          <Badge className={`${statusColors.bg} ${statusColors.text}`}>
                            {review.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          Apprentice:{' '}
                          <span className="font-medium">
                            {getApprenticeName(review.apprenticeId)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                          <div>
                            {review.status === 'scheduled' ? 'Scheduled for:' : 'Conducted on:'}{' '}
                            {formatDate(reviewDate)}
                          </div>
                          {review.reviewSummary && (
                            <div className="hidden md:block">
                              Summary: {review.reviewSummary.slice(0, 80)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
                      <Link href={`/progress-reviews/reviews/${review.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                      <Link href={`/progress-reviews/reviews/${review.id}/edit`}>
                        <Button>
                          {review.status === 'scheduled' ? 'Conduct Review' : 'Edit Review'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reviews found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {searchQuery || statusFilter !== 'all'
                ? 'No reviews match your search criteria.'
                : 'There are no progress reviews created yet.'}
            </p>
            <Link href="/progress-reviews/reviews/create">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Review
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
