interface DataEnrichmentProps {
  type: string;
  id: string;
  onComplete?: () => void;
}

export function DataEnrichment({ type, id, onComplete }: DataEnrichmentProps): JSX.Element {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Data Enrichment</h3>
      <div className="space-y-2">
        <p>Enriching {type} data for ID: {id}</p>
        {/* Add your enrichment UI here */}
      </div>
    </div>
  );
}
