import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

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

const statusColors = {
  completed: 'text-success',
  in_progress: 'text-amber-500',
  not_started: 'text-muted-foreground',
};

export default function ApprenticeProgress(): React.ReactElement {
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/progress/modules'],
    queryFn: async () => {
      // For demo purposes, returning mock data
      return [
        {
          module: 'Core Vocational Skills',
          progress: 85,
          status: 'in_progress' as const,
          lastActivity: '2024-04-25',
        },
        {
          module: 'Health & Safety Fundamentals',
          progress: 100,
          status: 'completed' as const,
          lastActivity: '2024-04-15',
        },
        {
          module: 'Industry Knowledge',
          progress: 100,
          status: 'completed' as const,
          lastActivity: '2024-04-10',
        },
        {
          module: 'Practical Assessment',
          progress: 0,
          status: 'not_started' as const,
        },
      ] as ProgressData[];
    },
  });

  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['/api/progress/assessments'],
    queryFn: async () => {
      // For demo purposes, returning mock data
      return [
        {
          name: 'Health & Safety Exam',
          score: 92,
          date: '2024-04-15',
          feedback: 'Excellent understanding of workplace safety protocols',
        },
        {
          name: 'Industry Knowledge Quiz',
          score: 88,
          date: '2024-04-10',
          feedback: 'Good grasp of industry standards and practices',
        },
        {
          name: 'Vocational Skills Assessment 1',
          score: 76,
          date: '2024-03-20',
          feedback: 'Needs improvement in technical documentation',
        },
      ] as Assessment[];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apprentice Progress</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="modules">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <div className="space-y-6">
              {isLoadingProgress
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))
                : progressData?.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-sm">{item.module}</span>
                        <span className={`text-sm ${statusColors[item.status]}`}>
                          {item.status === 'completed'
                            ? 'Completed'
                            : item.status === 'in_progress'
                              ? 'In Progress'
                              : 'Not Started'}
                        </span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.progress}% complete</span>
                        {item.lastActivity && <span>Last activity: {item.lastActivity}</span>}
                      </div>
                    </div>
                  ))}
            </div>
          </TabsContent>

          <TabsContent value="assessments">
            <div className="space-y-6">
              {isLoadingAssessments
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))
                : assessments?.map((assessment, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{assessment.name}</span>
                        <span
                          className={`font-medium ${
                            assessment.score >= 80
                              ? 'text-success'
                              : assessment.score >= 70
                                ? 'text-amber-500'
                                : 'text-destructive'
                          }`}
                        >
                          {assessment.score}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">Date: {assessment.date}</div>
                      {assessment.feedback && (
                        <div className="text-sm border-t pt-2 mt-2">
                          <span className="font-medium">Feedback:</span> {assessment.feedback}
                        </div>
                      )}
                    </div>
                  ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
