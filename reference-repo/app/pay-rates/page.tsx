'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function PayRatesPage(): React.JSX.Element {
  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Pay Rates &amp; Allowances</h1>
        <div className='flex gap-3'>
          <Button
            variant='outline'
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Allowance
          </Button>
          <Button className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Add Pay Rate
          </Button>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Pay Rates</h2>
          </div>
          <div className='p-4'>
            <div className='space-y-4'>
              <div className='rounded-md bg-gray-50 p-4'>
                <h3 className='font-medium'>Clerks Level 1 - Year 1</h3>
                <p className='mt-1 text-sm text-gray-600'>Base Rate: $21.50/hr</p>
                <div className='mt-2'>
                  <h4 className='text-sm font-medium'>Penalty Rates:</h4>
                  <ul className='mt-1 space-y-1 text-sm text-gray-600'>
                    <li>Saturday: 1.25x ($26.88/hr)</li>
                    <li>Sunday: 1.5x ($32.25/hr)</li>
                    <li>Public Holiday: 2.0x ($43.00/hr)</li>
                  </ul>
                </div>
              </div>

              <div className='rounded-md bg-gray-50 p-4'>
                <h3 className='font-medium'>Manufacturing C14 - Entry Level</h3>
                <p className='mt-1 text-sm text-gray-600'>Base Rate: $20.80/hr</p>
                <div className='mt-2'>
                  <h4 className='text-sm font-medium'>Penalty Rates:</h4>
                  <ul className='mt-1 space-y-1 text-sm text-gray-600'>
                    <li>Saturday: 1.5x ($31.20/hr)</li>
                    <li>Sunday: 2.0x ($41.60/hr)</li>
                    <li>Public Holiday: 2.5x ($52.00/hr)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='rounded-lg border bg-white'>
          <div className='border-b p-4'>
            <h2 className='text-lg font-medium'>Allowances</h2>
          </div>
          <div className='p-4'>
            <div className='space-y-4'>
              <div className='rounded-md bg-gray-50 p-4'>
                <h3 className='font-medium'>Tool Allowance</h3>
                <p className='mt-1 text-sm text-gray-600'>$0.58 per hour</p>
                <p className='mt-1 text-sm text-gray-500'>Applies to: Manufacturing Award</p>
              </div>

              <div className='rounded-md bg-gray-50 p-4'>
                <h3 className='font-medium'>First Aid Allowance</h3>
                <p className='mt-1 text-sm text-gray-600'>$15.00 per week</p>
                <p className='mt-1 text-sm text-gray-500'>Applies to: All Awards</p>
              </div>

              <div className='rounded-md bg-gray-50 p-4'>
                <h3 className='font-medium'>Meal Allowance</h3>
                <p className='mt-1 text-sm text-gray-600'>$18.50 per occasion</p>
                <p className='mt-1 text-sm text-gray-500'>
                  Applies when working overtime &gt; 2 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
