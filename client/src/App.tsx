import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/error-boundary";
import { withIdValidation } from "@/components/route-validator";
import NotFound from "@/pages/not-found";
import MainLayout from "./layouts/main-layout";
import Dashboard from "./pages/dashboard";
import ApprenticesList from "./pages/apprentices/index";
import CreateApprentice from "./pages/apprentices/create";
import ApprenticeDetails from "./pages/apprentices/[id]";
import HostsList from "./pages/hosts/index";
import CreateHost from "./pages/hosts/create";
import HostDetails from "./pages/hosts/[id]";
import ContractsList from "./pages/contracts/index";
import PlacementsList from "./pages/placements/index";
import DocumentsList from "./pages/documents/index";
import ComplianceList from "./pages/compliance/index";
import CreateComplianceRecord from "./pages/compliance/create";
import TimesheetsList from "./pages/timesheets/index";
import ReportsList from "./pages/reports/index";
import AwardsList from "./pages/awards/index";
import CreateAward from "./pages/awards/create";

// Dynamically imported components
import FieldOfficerActivities from "./pages/field-officers";
import SiteAssessment from "./pages/field-officers/site-assessment";

// GTO Compliance Module
import GtoComplianceDashboard from "./pages/gto-compliance/index";
import StandardAssessment from "./pages/gto-compliance/standard-assessment";
import ComplaintsManagement from "./pages/gto-compliance/complaints";

// Settings Pages
import UserManagement from "./pages/settings/user-management";

// VET Training Module
import UnitsOfCompetencyList from "./pages/vet/units/index";
import CreateUnitOfCompetency from "./pages/vet/units/create";
import QualificationsList from "./pages/vet/qualifications/index";
import CreateQualification from "./pages/vet/qualifications/create";

// Public pages
import HomePage from "./pages/public/home";
import AboutPage from "./pages/public/about";
import ServicesPage from "./pages/public/services";
import FindApprenticeshipPage from "./pages/public/find-apprenticeship";
import HostApprenticePage from "./pages/public/host-apprentice";
import ContactPage from "./pages/public/contact";
import PortalPage from "./pages/portal/index";

function Router() {
  const [location] = useLocation();
  const isPublicRoute = [
    '/',
    '/about',
    '/services',
    '/find-apprenticeship',
    '/host-apprentice',
    '/contact',
    '/portal'
  ].includes(location);

  // If on a public route, we don't need to wrap it in MainLayout
  if (isPublicRoute) {
    return (
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={HomePage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/find-apprenticeship" component={FindApprenticeshipPage} />
        <Route path="/host-apprentice" component={HostApprenticePage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/portal" component={PortalPage} />
      </Switch>
    );
  }

  // Admin/Dashboard routes
  return (
    <Switch>
      <Route path="/admin" component={Dashboard} />
      
      {/* Apprentice Routes */}
      <Route path="/apprentices" component={ApprenticesList} />
      <Route path="/apprentices/create" component={CreateApprentice} />
      <Route path="/apprentices/recruitment" component={() => {
        const ApprenticeRecruitment = lazy(() => import("./pages/apprentices/recruitment/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ApprenticeRecruitment />
          </Suspense>
        );
      }} />
      <Route path="/apprentices/records" component={() => {
        const ApprenticeRecords = lazy(() => import("./pages/apprentices/records/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ApprenticeRecords />
          </Suspense>
        );
      }} />
      <Route path="/apprentices/training" component={() => {
        const ApprenticeTraining = lazy(() => import("./pages/apprentices/training/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ApprenticeTraining />
          </Suspense>
        );
      }} />
      <Route path="/apprentices/progress" component={() => {
        const ApprenticeProgress = lazy(() => import("./pages/apprentices/progress/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ApprenticeProgress />
          </Suspense>
        );
      }} />
      <Route path="/apprentices/completion" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Apprentice Completion</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/apprentices/:id" component={ApprenticeDetails} />
      
      {/* Host Routes */}
      <Route path="/hosts" component={HostsList} />
      <Route path="/hosts/create" component={CreateHost} />
      <Route path="/hosts/agreements" component={lazy(() => import("./pages/hosts/agreements"))} />
      <Route path="/hosts/monitoring" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Workplace Monitoring</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/hosts/vacancies" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Vacancy Management</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/hosts/reports" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Host Employer Reports</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/hosts/:id" component={HostDetails} />
      
      {/* Fair Work Routes */}
      <Route path="/awards" component={AwardsList} />
      <Route path="/awards/create" component={CreateAward} />
      
      {/* Field Officer Routes */}
      <Route path="/field-officers" component={FieldOfficerActivities} />
      <Route path="/field-officers/site-assessment" component={SiteAssessment} />
      <Route path="/field-officers/case-notes" component={() => {
        const CaseNotes = lazy(() => import("./pages/field-officers/case-notes/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <CaseNotes />
          </Suspense>
        );
      }} />
      <Route path="/field-officers/competency" component={() => {
        const CompetencyReview = lazy(() => import("./pages/field-officers/competency/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <CompetencyReview />
          </Suspense>
        );
      }} />
      <Route path="/field-officers/incidents" component={() => {
        const Incidents = lazy(() => import("./pages/field-officers/incidents/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Incidents />
          </Suspense>
        );
      }} />
      <Route path="/field-officers/actions" component={() => {
        const Actions = lazy(() => import("./pages/field-officers/actions/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <Actions />
          </Suspense>
        );
      }} />
      
      {/* GTO Compliance Routes */}
      <Route path="/gto-compliance" component={GtoComplianceDashboard} />
      <Route path="/gto-compliance/standard-assessment" component={StandardAssessment} />
      <Route path="/gto-compliance/complaints" component={ComplaintsManagement} />
      <Route path="/gto-compliance/access-equity" component={() => {
        const AccessEquity = lazy(() => import("./pages/gto-compliance/access-equity"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <AccessEquity />
          </Suspense>
        );
      }} />
      <Route path="/gto-compliance/records-management" component={() => {
        const RecordsManagement = lazy(() => import("./pages/gto-compliance/records-management"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <RecordsManagement />
          </Suspense>
        );
      }} />
      <Route path="/gto-compliance/risk-management" component={() => {
        const RiskManagement = lazy(() => import("./pages/gto-compliance/risk-management"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <RiskManagement />
          </Suspense>
        );
      }} />
      
      {/* Settings Routes */}
      <Route path="/settings/users" component={UserManagement} />
      <Route path="/settings/permissions" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Permissions Management</h1>
            <p className="text-muted-foreground mb-4">This page allows you to manage system permissions and configure access rights for different user roles.</p>
          </div>
        );
      }} />
      <Route path="/settings/configuration" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">System Configuration</h1>
            <p className="text-muted-foreground mb-4">Configure system-wide settings and preferences for your organization.</p>
          </div>
        );
      }} />
      <Route path="/settings/integrations" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">External Integrations</h1>
            <p className="text-muted-foreground mb-4">Manage connections to external systems and third-party services.</p>
          </div>
        );
      }} />
      <Route path="/settings/import-export" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Data Import & Export</h1>
            <p className="text-muted-foreground mb-4">Tools for importing and exporting data to and from the system.</p>
          </div>
        );
      }} />
      
      {/* VET Training Routes */}
      <Route path="/vet/units" component={UnitsOfCompetencyList} />
      <Route path="/vet/units/create" component={CreateUnitOfCompetency} />
      <Route path="/vet/qualifications" component={QualificationsList} />
      <Route path="/vet/qualifications/create" component={CreateQualification} />
      <Route path="/vet/training-packages" component={() => {
        const TrainingPackages = lazy(() => import("./pages/vet/training-packages/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <TrainingPackages />
          </Suspense>
        );
      }} />
      <Route path="/vet/assessments" component={() => {
        const AssessmentRecords = lazy(() => import("./pages/vet/assessments/index"));
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <AssessmentRecords />
          </Suspense>
        );
      }} />
      
      {/* Other Routes */}
      <Route path="/contracts" component={ContractsList} />
      <Route path="/placements" component={PlacementsList} />
      <Route path="/documents" component={DocumentsList} />
      <Route path="/compliance" component={ComplianceList} />
      <Route path="/compliance/create" component={CreateComplianceRecord} />
      <Route path="/compliance/standard-1" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Standard 1 Requirements</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/compliance/standard-2" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Standard 2 Requirements</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/compliance/standard-3" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Standard 3 Requirements</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/compliance/standard-4" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Standard 4 Requirements</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/compliance/audit" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Audit Preparation</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      
      {/* Training Routes */}
      <Route path="/training/plans" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Training Plans</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/training/qualifications" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Qualification Progress</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/training/rtos" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">RTO Management</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/training/off-job" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Off-Job Training</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/training/competencies" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Competency Records</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      
      {/* Timesheet Routes */}
      <Route path="/timesheets" component={TimesheetsList} />
      <Route path="/timesheets/approvals" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Timesheet Approvals</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/timesheets/payroll" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Payroll Export</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/timesheets/leave" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Leave Management</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      
      {/* Report Routes */}
      <Route path="/reports" component={ReportsList} />
      <Route path="/reports/compliance" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Compliance Reports</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/reports/financial" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Financial Reports</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/reports/apprentice" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Apprentice Progress Reports</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/reports/host" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Host Employer Reports</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/reports/custom" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Custom Reports</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      <Route path="/reports/export" component={() => {
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Export Options</h1>
            <p className="text-muted-foreground mb-4">This page is currently under development.</p>
          </div>
        );
      }} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isPublicRoute = [
    '/',
    '/about',
    '/services',
    '/find-apprenticeship',
    '/host-apprentice',
    '/contact',
    '/portal'
  ].includes(location);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          {isPublicRoute ? (
            <Router />
          ) : (
            <MainLayout>
              <Router />
            </MainLayout>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
