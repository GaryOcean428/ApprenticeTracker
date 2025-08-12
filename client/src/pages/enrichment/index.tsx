import React from 'react';
import { Link } from 'wouter';
import { BookOpen, CalendarClock, FileEdit, GraduationCap, User, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { usePermissions } from '@/hooks/use-permissions';

const EnrichmentPage: React.FC = () => {
  const { hasPermission } = usePermissions();

  const enrichmentFeatures = [
    {
      id: 'programs',
      title: 'Enrichment Programs',
      description: 'Manage ongoing enrichment programs for apprentices',
      icon: <GraduationCap className="h-8 w-8 text-blue-500" />,
      path: '/enrichment/programs',
      permission: 'view:enrichment_programs',
    },
    {
      id: 'workshops',
      title: 'Workshops & Events',
      description: 'Schedule and manage enrichment workshops and events',
      icon: <CalendarClock className="h-8 w-8 text-indigo-500" />,
      path: '/enrichment/workshops',
      permission: 'view:enrichment_workshops',
    },
    {
      id: 'mentoring',
      title: 'Mentoring',
      description: 'Manage mentor-mentee relationships and sessions',
      icon: <Users className="h-8 w-8 text-green-500" />,
      path: '/enrichment/mentoring',
      permission: 'view:mentoring',
    },
    {
      id: 'resources',
      title: 'Learning Resources',
      description: 'Upload and manage learning materials and resources',
      icon: <BookOpen className="h-8 w-8 text-purple-500" />,
      path: '/enrichment/resources',
      permission: 'view:enrichment_resources',
    },
    {
      id: 'assessments',
      title: 'Assessments',
      description: 'Create and manage enrichment assessments',
      icon: <FileEdit className="h-8 w-8 text-amber-500" />,
      path: '/enrichment/assessments',
      permission: 'view:enrichment_assessments',
    },
    {
      id: 'participants',
      title: 'Participants',
      description: 'View and manage apprentice participation in enrichment activities',
      icon: <User className="h-8 w-8 text-red-500" />,
      path: '/enrichment/participants',
      permission: 'view:enrichment_participants',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Enrichment Programs</h1>
          <p className="text-muted-foreground mt-2">
            Manage enrichment activities, workshops, and mentoring for apprentices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrichmentFeatures.map(
          feature =>
            hasPermission(feature.permission) && (
              <Link key={feature.id} href={feature.path}>
                <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                    {feature.icon}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-md mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
        )}
      </div>
    </div>
  );
};

export default EnrichmentPage;
