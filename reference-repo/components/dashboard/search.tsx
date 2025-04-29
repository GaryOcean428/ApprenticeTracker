'use client';
import * as React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchBar(): React.ReactElement {
  return (
    <div className='flex w-full items-center space-x-2'>
      <Input
        type='search'
        placeholder='Search...'
        className='h-9 md:w-[300px] lg:w-[400px]'
      />
      <button
        type='submit'
        className='inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
      >
        <SearchIcon className='h-4 w-4' />
        <span className='sr-only'>Search</span>
      </button>
    </div>
  );
}
