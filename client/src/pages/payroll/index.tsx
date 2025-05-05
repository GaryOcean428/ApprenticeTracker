import React from 'react';
import { Link } from 'wouter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';
import { usePermissions } from '@/hooks/use-permissions';
import { DollarSign, Calendar, FileText, Download, PieChart, Clock, Landmark } from 'lucide-react';

const PayrollPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  
  const payrollFeatures = [
    {
      id: 'award-rates',
      title: 'Award Rates',
      description: 'Manage and view Fair Work award rates and classifications',
      icon: <Landmark className="h-8 w-8 text-blue-500" />,
      path: '/payroll/award-rates',
      permission: 'view:award_rates',
    },
    {
      id: 'timesheets',
      title: 'Timesheets',
      description: 'Process and approve apprentice timesheets',
      icon: <Clock className="h-8 w-8 text-indigo-500" />,
      path: '/payroll/timesheets',
      permission: 'view:timesheets',
    },
    {
      id: 'payroll-items',
      title: 'Payroll Items',
      description: 'Manage payroll items including allowances and deductions',
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      path: '/payroll/payroll-items',
      permission: 'view:payroll_items',
    },
    {
      id: 'pay-runs',
      title: 'Pay Runs',
      description: 'Schedule and process payroll runs',
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
      path: '/payroll/pay-runs',
      permission: 'view:pay_runs',
    },
    {
      id: 'export',
      title: 'Export',
      description: 'Export payroll data to external systems',
      icon: <Download className="h-8 w-8 text-amber-500" />,
      path: '/payroll/export',
      permission: 'view:payroll_export',
    },
    {
      id: 'reports',
      title: 'Payroll Reports',
      description: 'Generate and view payroll reports',
      icon: <PieChart className="h-8 w-8 text-red-500" />,
      path: '/payroll/reports',
      permission: 'view:payroll_reports',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage timesheets, pay rates, and payroll processing for apprentices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payrollFeatures.map((feature) => (
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
        ))}
      </div>
    </div>
  );
};

export default PayrollPage;
