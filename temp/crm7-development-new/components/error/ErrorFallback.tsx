import { AlertCircle } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';

import { Button } from '@/components/ui/button';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps): JSX.Element {
  return (
    <div
      role='alert'
      className='flex flex-col items-center justify-center gap-4 rounded-lg bg-destructive/10 p-4 text-destructive'
    >
      <div className='flex items-center gap-2'>
        <AlertCircle className='h-5 w-5' />
        <h2 className='text-lg font-semibold'>Something went wrong</h2>
      </div>

      <p className='max-w-[400px] text-center text-sm text-muted-foreground'>
        {error instanceof Error ? error.message : 'An unknown error occurred'}
      </p>

      <Button
        variant='outline'
        onClick={resetErrorBoundary}
        className='mt-2'
      >
        Try again
      </Button>
    </div>
  );
}
