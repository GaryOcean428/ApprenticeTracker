import type { Metadata } from 'next';
import EnrichmentClient from './enrichment-client';
import React from 'react';

export const metadata: Metadata = {
  title: 'Data Enrichment',
  description: 'Enrich your data with external sources',
};

export default function EnrichmentPage(): React.ReactElement {
  return <EnrichmentClient />;
}
