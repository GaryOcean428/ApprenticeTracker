import SafetyPoliciesList from '@/components/whs/safety-policies-list';

export default function WHSPoliciesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Safety Policies & Procedures</h1>
      <SafetyPoliciesList />
    </div>
  );
}
