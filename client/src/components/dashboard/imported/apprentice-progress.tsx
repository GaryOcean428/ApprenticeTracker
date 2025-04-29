'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface ProgressData {
  module: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'not_started';
  lastActivity?: string;
}

interface Assessment {
  name: string;
  score: number;
  date: string;
  feedback?: string;
}

export function ApprenticeProgress(): React.ReactElement {
  const modules: ProgressData[] = [
    {
      module: 'Foundation Skills',
      progress: 100,
      status: 'completed',
      lastActivity: '2024-02-01',
    },
    {
      module: 'Core Competencies',
      progress: 75,
      status: 'in_progress',
      lastActivity: '2024-02-05',
    },
    {
      module: 'Advanced Topics',
      progress: 0,
      status: 'not_started',
    },
  ];

  const assessments: Assessment[] = [
    {
      name: 'Foundation Skills Assessment',
      score: 92,
      date: '2024-02-01',
      feedback: 'Excellent understanding of core concepts',
    },
    {
      name: 'Core Competencies Mid-Module',
      score: 85,
      date: '2024-02-05',
      feedback: 'Good progress, focus on practical applications',
    },
  ];

  const getStatusColor = (status: ProgressData['status']): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'not_started':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Tabs
      defaultValue="progress"
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="progress">Progress</TabsTrigger>
        <TabsTrigger value="assessments">Assessments</TabsTrigger>
      </TabsList>

      <TabsContent value="progress" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Module Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.module} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{module.module}</p>
                      <p className={`text-sm ${getStatusColor(module.status)}`}>
                        {module.status.replace('_', ' ').charAt(0).toUpperCase() + module.status.slice(1)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {module.progress}%
                    </p>
                  </div>
                  <Progress value={module.progress} />
                  {module.lastActivity && (
                    <p className="text-sm text-muted-foreground">
                      Last activity: {formatDate(module.lastActivity)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assessments">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Feedback</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.name}>
                    <TableCell className="font-medium">
                      {assessment.name}
                    </TableCell>
                    <TableCell>
                      <span className={assessment.score >= 85 ? 'text-green-600' : 'text-yellow-600'}>
                        {assessment.score}%
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(assessment.date)}</TableCell>
                    <TableCell>{assessment.feedback}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
