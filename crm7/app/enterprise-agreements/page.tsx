'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function EnterpriseAgreementsPage(): React.JSX.Element {
  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Enterprise Agreements</h1>
        <Button className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          Add Agreement
        </Button>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-lg border bg-white p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-medium'>ABC Manufacturing EBA 2024</h3>
            <p className='mt-1 text-sm text-gray-600'>Agreement Code: EBA2024-001</p>
          </div>

          <div className='space-y-3'>
            <div>
              <h4 className='text-sm font-medium'>Status</h4>
              <p className='text-sm text-green-600'>Active</p>
            </div>

            <div>
              <h4 className='text-sm font-medium'>Effective Date</h4>
              <p className='text-sm text-gray-600'>January 1, 2024</p>
            </div>

            <div>
              <h4 className='text-sm font-medium'>Expiry Date</h4>
              <p className='text-sm text-gray-600'>December 31, 2026</p>
            </div>

            <div>
              <h4 className='text-sm font-medium'>Description</h4>
              <p className='text-sm text-gray-600'>
                Enterprise agreement covering manufacturing operations at ABC Manufacturing sites.
              </p>
            </div>
          </div>
        </div>

        <div className='rounded-lg border bg-white p-6'>
          <div className='mb-4'>
            <h3 className='text-lg font-medium'>XYZ Logistics EBA 2023</h3>
            <p className='mt-1 text-sm text-gray-600'>Agreement Code: EBA2023-002</p>
          </div>

          <div className='space-y-3'>
            <div>
              <h4 className='text-sm font-medium'>Status</h4>
              <p className='text-sm text-green-600'>Active</p>
            </div>

            <div>
              <h4 className='text-sm font-medium'>Effective Date</h4>
              <p className='text-sm text-gray-600'>July 1, 2023</p>
            </div>

            <div>
              <h4 className='text-sm font-medium'>Expiry Date</h4>
              <p className='text-sm text-gray-600'>June 30, 2026</p>
            </div>

            <div>
              <h4 className='text-sm font-medium'>Description</h4>
              <p className='text-sm text-gray-600'>
                Enterprise agreement covering logistics and warehouse operations at XYZ Logistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
