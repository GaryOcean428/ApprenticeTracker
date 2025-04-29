import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Search(): JSX.Element {
  return (
    <div className="relative">
      <SearchIcon className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
      <Input
        type='search'
        placeholder='Search...'
        className='w-[300px] pl-8'
      />
    </div>
  );
}
