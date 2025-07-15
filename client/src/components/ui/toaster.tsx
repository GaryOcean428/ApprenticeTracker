import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        className: 'border border-border bg-background text-foreground',
        style: {
          padding: '16px',
        },
      }}
    />
  );
}
