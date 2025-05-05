import React from 'react';
import type { ReactNode } from 'react';

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps): Promise<React.ReactElement> {
  return <div className="min-h-screen bg-background">{children}</div>;
}
