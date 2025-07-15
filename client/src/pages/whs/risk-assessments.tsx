import RiskAssessmentsList from '@/components/whs/risk-assessments-list';

export default function WHSRiskAssessmentsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Risk Assessments</h1>
      <RiskAssessmentsList />
    </div>
  );
}
