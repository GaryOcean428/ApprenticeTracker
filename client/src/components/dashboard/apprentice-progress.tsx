import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function ApprenticeProgress(): React.ReactElement {
  // In a real app, we would fetch this data from an API
  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ["/api/apprentices/progress/modules"],
    queryFn: async () => {
      // For demo purposes, returning mock data
      return [
        {
          module: "Foundation Skills",
          progress: 100,
          status: "completed" as const,
          lastActivity: "2024-02-01",
        },
        {
          module: "Core Competencies",
          progress: 75,
          status: "in_progress" as const,
          lastActivity: "2024-02-05",
        },
        {
          module: "Advanced Topics",
          progress: 0,
          status: "not_started" as const,
        },
      ];
    },
  });

  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ["/api/apprentices/progress/assessments"],
    queryFn: async () => {
      // For demo purposes, returning mock data
      return [
        {
          name: "Foundation Skills Assessment",
          score: 92,
          date: "2024-02-01",
          feedback: "Excellent understanding of core concepts",
        },
        {
          name: "Core Competencies Mid-Module",
          score: 85,
          date: "2024-02-05",
          feedback: "Good progress, focus on practical applications",
        },
      ];
    },
  });

  const getStatusColor = (status: ProgressData["status"]): string => {
    switch (status) {
      case "completed":
        return "text-success";
      case "in_progress":
        return "text-info";
      case "not_started":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <Tabs defaultValue="progress" className="space-y-4">
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
            {isLoadingModules ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {modules?.map((module) => (
                  <div key={module.module} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{module.module}</p>
                        <p className={`text-sm ${getStatusColor(module.status)}`}>
                          {module.status
                            .replace("_", " ")
                            .charAt(0)
                            .toUpperCase() + module.status.slice(1)}
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
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assessments">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAssessments ? (
              <div className="w-full">
                <Skeleton className="h-60 w-full" />
              </div>
            ) : (
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
                  {assessments?.map((assessment) => (
                    <TableRow key={assessment.name}>
                      <TableCell className="font-medium">
                        {assessment.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            assessment.score >= 85
                              ? "text-success"
                              : "text-warning"
                          }
                        >
                          {assessment.score}%
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(assessment.date)}</TableCell>
                      <TableCell>{assessment.feedback}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
