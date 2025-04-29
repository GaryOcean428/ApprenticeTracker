'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AwardsPage(): React.JSX.Element {
  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Awards & Classifications</h1>
        <Button className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          Add Award
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border bg-white p-6'>
          <h3 className='mb-4 text-lg font-medium'>Clerks — Private Sector Award</h3>
          <p className='mb-2 text-sm text-gray-600'>Fair Work Reference: MA000002</p>
          <div className='mt-4'>
            <h4 className='mb-2 font-medium'>Classifications</h4>
            <ul className='space-y-2 text-sm'>
              <li>Level 1 - Year 1</li>
              <li>Level 1 - Year 2</li>
              <li>Level 2 - Year 1</li>
              <li>Level 2 - Year 2</li>
            </ul>
          </div>
        </div>

        <div className='rounded-lg border bg-white p-6'>
          <h3 className='mb-4 text-lg font-medium'>Manufacturing Award</h3>
          <p className='mb-2 text-sm text-gray-600'>Fair Work Reference: MA000010</p>
          <div className='mt-4'>
            <h4 className='mb-2 font-medium'>Classifications</h4>
            <ul className='space-y-2 text-sm'>
              <li>C14 - Entry Level</li>
              <li>C13 - Production/Machine Operator</li>
              <li>C12 - Advanced Operator</li>
              <li>C11 - Intermediate Trade</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
