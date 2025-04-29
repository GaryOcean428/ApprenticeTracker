'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

import { columns } from './columns';

export default function ProgressReviewsPage() {
  const router = useRouter();
  const [data] = useState([]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Breadcrumb>
          <BreadcrumbItem href='/dashboard'>Dashboard</BreadcrumbItem>
          <BreadcrumbItem>Progress Reviews</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => router.push('/progress-reviews/new')}>
          <Plus className='mr-2 h-4 w-4' /> Schedule Review
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn='name'
        enableColumnVisibility={true}
      />
    </div>
  );
}
