import { requireAuth } from '@/lib/auth/rbac';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RecentActivity } from '@/components/recent-activity';
import { headers } from 'next/headers';

// Define types for our data
interface Opportunity {
  id: string;
  name: string;
  created_at: string;
  status: string;
  value?: number;
}

interface Lead {
  id: string;
  name: string;
  created_at: string;
  status: string;
  email?: string;
}

interface Organization {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
}

export default async function DashboardPage() {
  // Create a request object to pass to requireAuth
  const headersList = headers();
  const request = new Request('https://example.com', {
    headers: headersList as unknown as HeadersInit
  });
  
  // This will redirect to login if user is not authenticated
  const authUser = await requireAuth(request);
  
  // Create a properly typed user object
  const user: User = {
    id: authUser.id,
    email: authUser.email || 'user@example.com'
  };

  // Mock data for dashboard
  const opportunities: Opportunity[] = [
    { id: '1', name: 'ABC Construction Project', status: 'open', created_at: new Date().toISOString() },
    { id: '2', name: 'XYZ Tech Implementation', status: 'negotiating', created_at: new Date().toISOString() },
    { id: '3', name: 'Office Renovation Contract', status: 'qualified', created_at: new Date().toISOString() }
  ];
  
  const leads: Lead[] = [
    { id: '1', name: 'John Smith', email: 'john@example.com', status: 'new', created_at: new Date().toISOString() },
    { id: '2', name: 'Sarah Jones', email: 'sarah@example.com', status: 'contacted', created_at: new Date().toISOString() },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', status: 'qualified', created_at: new Date().toISOString() }
  ];
  
  const organizations: Organization[] = [
    { id: '1', name: 'Acme Corp' },
    { id: '2', name: 'TechStart Inc.' }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader user={user} organizations={organizations} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardMetrics
          opportunities={opportunities?.length || 0}
          leads={leads?.length || 0}
          organizations={organizations?.length || 0}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Opportunities</h2>
          {opportunities && opportunities.length > 0 ? (
            <ul className="divide-y">
              {opportunities.map(opp => (
                <li key={opp.id} className="py-3">
                  <p className="font-medium">{opp.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(opp.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No recent opportunities</p>
          )}
        </div>
        
        <div className="bg-card rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Leads</h2>
          {leads && leads.length > 0 ? (
            <ul className="divide-y">
              {leads.map(lead => (
                <li key={lead.id} className="py-3">
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No recent leads</p>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <RecentActivity />
      </div>
    </div>
  );
}
