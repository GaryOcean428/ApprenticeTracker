import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Pencil, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Apprentice } from "@shared/schema";

interface ApprenticeStatusProps {
  status: string;
}

const ApprenticeStatus = ({ status }: ApprenticeStatusProps) => {
  let statusClass = "";
  
  switch(status) {
    case "active":
      statusClass = "text-success bg-green-100";
      break;
    case "assessment":
      statusClass = "text-warning bg-yellow-100";
      break;
    case "on_hold":
      statusClass = "text-destructive bg-red-100";
      break;
    default:
      statusClass = "text-muted-foreground bg-muted";
  }
  
  const displayStatus = status.replace('_', ' ');
  
  return (
    <span className={`px-2 py-1 font-semibold leading-tight ${statusClass} rounded-full capitalize`}>
      {displayStatus}
    </span>
  );
};

const ApprenticeTable = () => {
  const { data: apprentices, isLoading, error } = useQuery({
    queryKey: ['/api/apprentices'],
    queryFn: async () => {
      const res = await fetch('/api/apprentices');
      if (!res.ok) throw new Error('Failed to fetch apprentices');
      return res.json() as Promise<Apprentice[]>;
    }
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Recent Apprentices</CardTitle>
          <Skeleton className="h-10 w-20" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold tracking-wide text-left text-muted-foreground uppercase border-b border-border bg-muted/30">
                  <th className="px-4 py-3">Apprentice</th>
                  <th className="px-4 py-3">Trade</th>
                  <th className="px-4 py-3">Host</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full mr-3" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-2 w-full mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </td>
                    <td className="px-4 py-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-24" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Apprentices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load apprentices</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Apprentices</CardTitle>
        <Button asChild>
          <Link href="/apprentices">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-left text-muted-foreground uppercase border-b border-border bg-muted/30">
                <th className="px-4 py-3">Apprentice</th>
                <th className="px-4 py-3">Trade</th>
                <th className="px-4 py-3">Host</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apprentices?.slice(0, 4).map((apprentice) => (
                <tr key={apprentice.id} className="text-foreground hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 mr-3 rounded-full overflow-hidden bg-muted">
                        <Avatar>
                          <AvatarImage 
                            src={apprentice.profileImage || ""} 
                            alt={`${apprentice.firstName} ${apprentice.lastName}`} 
                          />
                          <AvatarFallback>
                            {apprentice.firstName.charAt(0) + apprentice.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-semibold">{apprentice.firstName} {apprentice.lastName}</p>
                        <p className="text-xs text-muted-foreground">{apprentice.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{apprentice.trade}</td>
                  <td className="px-4 py-3 text-sm">
                    {/* This would need to be fetched from placements */}
                    <span className="text-muted-foreground">Not assigned</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="w-full h-2 bg-muted rounded-full">
                      <Progress value={apprentice.progress || 0} className="h-2" />
                    </div>
                    <span className="text-xs text-muted-foreground">{apprentice.progress || 0}% Complete</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <ApprenticeStatus status={apprentice.status} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/apprentices/${apprentice.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <Link href={`/apprentices/${apprentice.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View contracts</DropdownMenuItem>
                          <DropdownMenuItem>View placements</DropdownMenuItem>
                          <DropdownMenuItem>View timesheets</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      {(!apprentices || apprentices.length === 0) && (
        <CardFooter>
          <p className="text-center w-full text-muted-foreground py-4">
            No apprentices found. <Link href="/apprentices/create" className="text-primary hover:underline">Add your first apprentice</Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ApprenticeTable;
