'use client';

import React from 'react';
import { useState } from 'react';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { DataEnrichment } from '@/components/admin/data-enrichment';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';

export default function QualificationsPage(): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Qualifications</h1>
          <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/qualifications">Qualifications</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="rounded-lg border p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Bulk Actions</h2>
            <DataEnrichment
              type="qualification"
              id={selectedIds[0] ?? ''}
              onComplete={(): void => setSelectedIds([])}
            />
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={[]}
        filterColumn="title"
        enableRowSelection
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  );
}
