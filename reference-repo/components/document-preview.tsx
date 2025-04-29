import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Document } from '@/types/documents';

interface DocumentPreviewProps {
  document: Document;
  onLoad?: () => void;
}

export function DocumentPreview({ document, onLoad }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <Card className="overflow-hidden">
      {isLoading && <Skeleton className="w-full h-[400px]" />}
      <iframe
        src={document.url}
        className="w-full h-[400px] border-0"
        onLoad={handleLoad}
        title={document.name}
      />
    </Card>
  );
}
