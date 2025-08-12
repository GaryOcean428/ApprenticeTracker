import { Link } from 'wouter';
import { Shield, Building, FileText, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QuickAccess = () => {
  const quickActions = [
    {
      icon: <Users className="text-primary text-xl mb-1" />,
      label: 'Add Apprentice',
      href: '/apprentices/create',
      color: 'text-primary',
    },
    {
      icon: <Building className="text-secondary text-xl mb-1" />,
      label: 'Add Host',
      href: '/hosts/create',
      color: 'text-secondary',
    },
    {
      icon: <FileText className="text-accent text-xl mb-1" />,
      label: 'New Contract',
      href: '/contracts/create',
      color: 'text-accent',
    },
    {
      icon: <Clock className="text-warning text-xl mb-1" />,
      label: 'Log Timesheet',
      href: '/timesheets/create',
      color: 'text-warning',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="text-accent mr-2 h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-2">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="flex flex-col items-center p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                {action.icon}
                <span className="text-xs text-muted-foreground text-center">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/dashboard/actions"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all actions
        </Link>
      </CardContent>
    </Card>
  );
};

import { Users } from 'lucide-react';

export default QuickAccess;
