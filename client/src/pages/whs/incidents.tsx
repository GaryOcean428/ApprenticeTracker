import IncidentsList from '@/components/whs/incidents-list';

export default function WHSIncidentsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Incidents & Hazards</h1>
      <IncidentsList />
    </div>
  );
}