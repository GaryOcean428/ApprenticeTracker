'use client';

import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Globe,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import Image from 'next/image';

interface Candidate {
  id: string;
  name: string;
  status: string;
  appliedDate: string;
  avatar: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'temporary';
  status: 'open' | 'closed' | 'on-hold' | 'filled';
  description: string;
  requirements: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  benefits: string;
  posted: string;
  deadline: string;
  applicants: Candidate[];
  department: string;
  experienceLevel: string;
  workplaceType: 'remote' | 'hybrid' | 'on-site';
}

interface JobDetailsProps {
  job: Job;
  onEdit?: () => void;
  onClose?: () => void;
}

export function JobDetails({
  job,
  onEdit,
  onClose,
}: JobDetailsProps): JSX.Element {
  const daysLeft = Math.ceil(
    (new Date(job.deadline).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const statusVariant =
    job.status === 'open'
      ? 'success'
      : job.status === 'filled'
      ? 'default'
      : job.status === 'on-hold'
      ? 'warning'
      : 'secondary';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <Badge variant={statusVariant}>{job.status}</Badge>
              </div>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {job.workplaceType}
                  </div>
                </div>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onClose && (
                <Button variant="destructive" size="sm" onClick={onClose}>
                  Close Job
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Salary Range</div>
                  <div className="text-sm text-muted-foreground">
                    {job.salary.currency} {job.salary.min.toLocaleString()} -{' '}
                    {job.salary.max.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Department</div>
                  <div className="text-sm text-muted-foreground">
                    {job.department}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Posted Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(job.posted).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Application Deadline</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(job.deadline).toLocaleDateString()} ({daysLeft} days
                    left)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="applicants">
            Applicants ({job.applicants.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: job.requirements }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: job.benefits }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applicants">
          <Card>
            <CardHeader>
              <CardTitle>Applicants</CardTitle>
              <CardDescription>
                View and manage candidates who have applied for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {job.applicants.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 relative">
                        <Image
                          src={candidate.avatar}
                          alt={candidate.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Applied on{' '}
                          {new Date(candidate.appliedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{candidate.status}</Badge>
                      <Button variant="ghost" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
