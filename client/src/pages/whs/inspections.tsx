import InspectionsList from '@/components/whs/inspections-list';

export default function WHSInspectionsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Site Safety Inspections</h1>
      <InspectionsList />
    </div>
  );
}
