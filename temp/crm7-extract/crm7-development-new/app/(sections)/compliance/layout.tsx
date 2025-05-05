import React from 'react';

export default function ComplianceLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
