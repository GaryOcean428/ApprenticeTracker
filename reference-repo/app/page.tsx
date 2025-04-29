import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { redirect } from 'next/navigation';
import React from 'react';

export default function Home(): React.ReactElement {
  return <ErrorBoundary>{redirect('/dashboard')}</ErrorBoundary>;
}
