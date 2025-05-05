'use client';

import { AlertTriangle, CheckCircle2, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function ComplianceLogsPage(): React.JSX.Element {
  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Compliance Logs</h1>
        <Button
          variant='outline'
          className='flex items-center gap-2'
        >
          <Download className='h-4 w-4' />
          Export Logs
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Compliance Alerts</h2>
          </div>
          <div className='p-4'>
            <div className='space-y-4'>
              <div className='rounded-md bg-red-50 p-4'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5 text-red-500' />
                  <h3 className='font-medium text-red-700'>Missing Safety Certification</h3>
                </div>
                <p className='mt-1 text-sm text-red-600'>
                  Employee: John Smith
                  <br />
                  Position: Site Supervisor
                  <br />
                  Required: Working at Heights Certificate
                </p>
                <p className='mt-2 text-sm text-red-500'>
                  Certificate expired on December 31, 2023
                </p>
                <p className='mt-1 text-xs text-red-400'>Detected on: January 10, 2024 09:15 AM</p>
              </div>

              <div className='rounded-md bg-yellow-50 p-4'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5 text-yellow-500' />
                  <h3 className='font-medium text-yellow-700'>Upcoming Certification Expiry</h3>
                </div>
                <p className='mt-1 text-sm text-yellow-600'>
                  Employee: Sarah Johnson
                  <br />
                  Position: Forklift Operator
                  <br />
                  Certificate: Forklift License
                </p>
                <p className='mt-2 text-sm text-yellow-500'>
                  Expires in 30 days (February 12, 2024)
                </p>
                <p className='mt-1 text-xs text-yellow-400'>
                  Notification sent on: January 11, 2024 08:30 AM
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Compliance Checks</h2>
          </div>
          <div className='p-4'>
            <div className='space-y-4'>
              <div className='rounded-md bg-green-50 p-4'>
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-green-500' />
                  <h3 className='font-medium text-green-700'>Payroll Compliance Check</h3>
                </div>
                <p className='mt-1 text-sm text-green-600'>
                  Employee: Michael Brown
                  <br />
                  Timesheet: #TS-2024-003
                  <br />
                  Pay Rate: Manufacturing Level C14
                </p>
                <p className='mt-2 text-sm text-green-500'>
                  Public holiday rates correctly applied for New Year&apos;s Day
                </p>
                <p className='mt-1 text-xs text-green-400'>Checked on: January 11, 2024 10:45 AM</p>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Document Storage & Versioning</h2>
          </div>
          <div className='p-4'>
            <p>Manage and store compliance-related documents with version control.</p>
          </div>
        </div>

        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Automated Monitoring</h2>
          </div>
          <div className='p-4'>
            <p>Continuously monitor compliance requirements and statuses.</p>
          </div>
        </div>

        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Alert System</h2>
          </div>
          <div className='p-4'>
            <p>Generate alerts for compliance issues, such as missing or expiring certifications.</p>
          </div>
        </div>

        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Audit Trail</h2>
          </div>
          <div className='p-4'>
            <p>Maintain a detailed log of compliance-related activities and changes.</p>
          </div>
        </div>

        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Regulatory Reporting</h2>
          </div>
          <div className='p-4'>
            <p>Generate reports to meet regulatory requirements.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
