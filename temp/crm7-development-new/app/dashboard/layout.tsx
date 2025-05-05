'use client';

import { AppLayout } from '@/components/layout/app-layout';
import React from 'react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppLayout>{children}</AppLayout>;
}
