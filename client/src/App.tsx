import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/error-boundary";
import { withIdValidation } from "@/components/route-validator";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/protected-route";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
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
import PermissionsDemo from "./pages/settings/permissions-demo";

// Settings Pages
import UserManagement from "./pages/settings/user-management";
import PermissionsManagement from "./pages/settings/permissions";
import SystemConfiguration from "./pages/settings/configuration";
import IntegrationsSettings from "./pages/settings/integrations";
import ImportExportSettings from "./pages/settings/import-export";

// VET Training Module
import UnitsOfCompetencyList from "./pages/vet/units/index";
import CreateUnitOfCompetency from "./pages/vet/units/create";
import QualificationsList from "./pages/vet/qualifications/index";
import CreateQualification from "./pages/vet/qualifications/create";

// Charge Rates Module
import ChargeRatesIndex from "./pages/charge-rates/index";
import ChargeRatesCreate from "./pages/charge-rates/create";

// Public pages
import HomePage from "./pages/public/home";
import AboutPage from "./pages/public/about";
import ServicesPage from "./pages/public/services";
import FindApprenticeshipPage from "./pages/public/find-apprenticeship";
import HostApprenticePage from "./pages/public/host-apprentice";
import ContactPage from "./pages/public/contact";
import PortalPage from "./pages/portal/index";

// Progress Reviews Pages
import ProgressReviewsPage from "./pages/progress-reviews";
import TemplatesListPage from "./pages/progress-reviews/templates";
import CreateTemplatePage from "./pages/progress-reviews/templates/create";
import ReviewsListPage from "./pages/progress-reviews/reviews";

// Financial Pages
import ExpensesPage from "./pages/financial/expenses";
import BudgetPage from "./pages/financial/budget";
import ReportsPage from "./pages/financial/reports";
import InvoicingPage from "./pages/financial/invoicing";

function Router() {
  const [location] = useLocation();
  const isPublicRoute = [
    '/',
    '/about',
    '/services',
    '/find-apprenticeship',
    '/host-apprentice',
    '/contact',
    '/auth/login',
    '/auth/register'
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
        {/* Auth Routes */}
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register" component={RegisterPage} />
      </Switch>
    );
  }

  // Admin/Dashboard routes
  return (
    <MainLayout>
      <Switch>
        {/* Protected Dashboard Routes */}
        <ProtectedRoute path="/portal" component={PortalPage} />
        <ProtectedRoute path="/admin" component={Dashboard} />
        
        {/* Apprentice Routes */}
        <ProtectedRoute path="/apprentices" component={ApprenticesList} />
        <ProtectedRoute path="/apprentices/create" component={CreateApprentice} />
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
        <ProtectedRoute path="/hosts" component={HostsList} />
        <ProtectedRoute path="/hosts/create" component={CreateHost} />
        <Route path="/hosts/agreements" component={() => {
          const HostAgreements = lazy(() => import("./pages/hosts/agreements"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <HostAgreements />
            </Suspense>
          );
        }} />
        <Route path="/hosts/agreements/new" component={() => {
          const NewAgreement = lazy(() => import("./pages/hosts/agreements/new"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <NewAgreement />
            </Suspense>
          );
        }} />
        <Route path="/hosts/monitoring" component={() => {
          const HostMonitoring = lazy(() => import("./pages/hosts/monitoring"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <HostMonitoring />
            </Suspense>
          );
        }} />
        <Route path="/hosts/vacancies" component={() => {
          const HostVacancies = lazy(() => import("./pages/hosts/vacancies"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <HostVacancies />
            </Suspense>
          );
        }} />
        <Route path="/hosts/vacancies/new" component={() => {
          const NewVacancy = lazy(() => import("./pages/hosts/vacancies/new"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <NewVacancy />
            </Suspense>
          );
        }} />
        <Route path="/hosts/reports" component={() => {
          const HostReports = lazy(() => import("./pages/hosts/reports"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <HostReports />
            </Suspense>
          );
        }} />
        <Route path="/hosts/:id" component={HostDetails} />
        
        {/* Fair Work Routes */}
        <ProtectedRoute path="/awards" component={AwardsList} />
        <ProtectedRoute path="/awards/create" component={CreateAward} />
        <Route path="/awards/:id" component={() => {
          const AwardDetail = lazy(() => import("./pages/awards/[id]/index"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <AwardDetail />
            </Suspense>
          );
        }} />
        <Route path="/awards/:id/edit" component={() => {
          const AwardEdit = lazy(() => import("./pages/awards/[id]/edit"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <AwardEdit />
            </Suspense>
          );
        }} />
        
        {/* Field Officer Routes */}
        <ProtectedRoute path="/field-officers" component={FieldOfficerActivities} />
        <ProtectedRoute path="/field-officers/site-assessment" component={SiteAssessment} />
        <ProtectedRoute path="/field-officers/case-notes" component={() => {
          const CaseNotes = lazy(() => import("./pages/field-officers/case-notes/index"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <CaseNotes />
            </Suspense>
          );
        }} />
        <ProtectedRoute path="/field-officers/competency" component={() => {
          const CompetencyReview = lazy(() => import("./pages/field-officers/competency/index"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <CompetencyReview />
            </Suspense>
          );
        }} />
        <ProtectedRoute path="/field-officers/incidents" component={() => {
          const Incidents = lazy(() => import("./pages/field-officers/incidents/index"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <Incidents />
            </Suspense>
          );
        }} />
        <ProtectedRoute path="/field-officers/actions" component={() => {
          const Actions = lazy(() => import("./pages/field-officers/actions/index"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <Actions />
            </Suspense>
          );
        }} />
        
        {/* GTO Compliance Routes */}
        <ProtectedRoute path="/gto-compliance" component={GtoComplianceDashboard} />
        <ProtectedRoute path="/gto-compliance/standard-assessment" component={StandardAssessment} />
        <ProtectedRoute path="/gto-compliance/complaints" component={ComplaintsManagement} />
        <ProtectedRoute path="/gto-compliance/access-equity" component={() => {
          const AccessEquity = lazy(() => import("./pages/gto-compliance/access-equity"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <AccessEquity />
            </Suspense>
          );
        }} />
        <ProtectedRoute path="/gto-compliance/records-management" component={() => {
          const RecordsManagement = lazy(() => import("./pages/gto-compliance/records-management"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <RecordsManagement />
            </Suspense>
          );
        }} />
        <ProtectedRoute path="/gto-compliance/risk-management" component={() => {
          const RiskManagement = lazy(() => import("./pages/gto-compliance/risk-management"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <RiskManagement />
            </Suspense>
          );
        }} />
        
        {/* Settings Routes */}
        <ProtectedRoute path="/settings/users" component={UserManagement} />
        <ProtectedRoute path="/settings/permissions" component={PermissionsManagement} />
        <ProtectedRoute path="/settings/permissions-demo" component={PermissionsDemo} />
        <ProtectedRoute path="/settings/configuration" component={SystemConfiguration} />
        <ProtectedRoute path="/settings/integrations" component={IntegrationsSettings} />
        <ProtectedRoute path="/settings/import-export" component={ImportExportSettings} />
        
        {/* Charge Rates Routes */}
        <ProtectedRoute path="/charge-rates" component={ChargeRatesIndex} />
        <ProtectedRoute path="/charge-rates/create" component={ChargeRatesCreate} />
        <Route path="/charge-rates/:id" component={() => {
          const ChargeRateDetail = lazy(() => import("./pages/charge-rates/[id]/index"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <ChargeRateDetail />
            </Suspense>
          );
        }} />
        
        {/* Financial Routes */}
        <ProtectedRoute path="/financial/expenses" component={ExpensesPage} />
        <ProtectedRoute path="/financial/budget" component={BudgetPage} />
        <ProtectedRoute path="/financial/reports" component={ReportsPage} />
        <ProtectedRoute path="/financial/invoicing" component={InvoicingPage} />
        
        {/* VET Training Routes */}
        <ProtectedRoute path="/vet/units" component={UnitsOfCompetencyList} />
        <ProtectedRoute path="/vet/units/create" component={CreateUnitOfCompetency} />
        <Route path="/vet/units/:id" component={() => {
          const UnitDetail = lazy(() => import("./pages/vet/units/[id]/index"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <UnitDetail />
            </Suspense>
          );
        }} />
        <Route path="/vet/units/:id/edit" component={() => {
          const UnitEdit = lazy(() => import("./pages/vet/units/[id]/edit"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <UnitEdit />
            </Suspense>
          );
        }} />
        <ProtectedRoute path="/vet/qualifications" component={QualificationsList} />
        <ProtectedRoute path="/vet/qualifications/create" component={CreateQualification} />
        <ProtectedRoute path="/vet/training-packages" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Training Packages</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/vet/progress" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">VET Progress Tracking</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/vet/assessments" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Assessment Records</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <Route path="/vet/qualifications/import" component={() => {
          const ImportQualifications = lazy(() => import("./pages/vet/qualifications/import"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <ImportQualifications />
            </Suspense>
          );
        }} />
        <Route path="/vet/qualifications/:id" component={() => {
          const QualificationDetail = lazy(() => import("./pages/vet/qualifications/[id]/index"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <QualificationDetail />
            </Suspense>
          );
        }} />
        <Route path="/vet/qualifications/:id/edit" component={() => {
          const QualificationEdit = lazy(() => import("./pages/vet/qualifications/[id]/edit"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <QualificationEdit />
            </Suspense>
          );
        }} />
        <Route path="/vet/qualifications/:id/structure" component={() => {
          const QualificationStructure = lazy(() => import("./pages/vet/qualifications/[id]/structure"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <QualificationStructure />
            </Suspense>
          );
        }} />
        <Route path="/vet/training-packages" component={() => {
          const TrainingPackages = lazy(() => import("./pages/vet/training-packages/index"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <TrainingPackages />
            </Suspense>
          );
        }} />
        <Route path="/vet/training-packages/:id" component={() => {
          const TrainingPackageDetail = lazy(() => import("./pages/vet/training-packages/[id]/index"));
          return (
            <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
              <TrainingPackageDetail />
            </Suspense>
          );
        }} />
        {/* TODO: Create Training Package import page */}
        <Route path="/vet/training-packages/import" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Import Training Packages</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        {/* TODO: Create RTOs page */}
        <Route path="/vet/rtos" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Registered Training Organizations</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <Route path="/vet/assessments" component={() => {
          const Assessments = lazy(() => import("./pages/vet/assessments/index"));
          return (
            <Suspense fallback={<div>Loading...</div>}>
              <Assessments />
            </Suspense>
          );
        }} />
        
        {/* Contracts & Placements Routes */}
        <ProtectedRoute path="/contracts" component={ContractsList} />
        {/* TODO: Create Contract creation page */}
        <ProtectedRoute path="/contracts/create" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Create Training Contract</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        {/* TODO: Create Contract details page */}
        <ProtectedRoute path="/contracts/:id" component={() => {
          const id = window.location.pathname.split('/').pop();
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Training Contract Details</h1>
              <p className="text-muted-foreground mb-4">Contract ID: {id}</p>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/placements" component={PlacementsList} />
        {/* TODO: Create Placement creation page */}
        <ProtectedRoute path="/placements/create" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Create Placement</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        {/* TODO: Create Placement details page */}
        <ProtectedRoute path="/placements/:id" component={() => {
          const id = window.location.pathname.split('/').pop();
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Placement Details</h1>
              <p className="text-muted-foreground mb-4">Placement ID: {id}</p>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        
        {/* Document Routes */}
        <ProtectedRoute path="/documents" component={DocumentsList} />
        {/* TODO: Create Document upload page */}
        <ProtectedRoute path="/documents/upload" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Upload Document</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        {/* TODO: Create Document details page */}
        <ProtectedRoute path="/documents/:id" component={() => {
          const id = window.location.pathname.split('/').pop();
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Document Details</h1>
              <p className="text-muted-foreground mb-4">Document ID: {id}</p>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        
        {/* Compliance Routes */}
        <ProtectedRoute path="/compliance" component={ComplianceList} />
        <ProtectedRoute path="/compliance/create" component={CreateComplianceRecord} />
        <ProtectedRoute path="/compliance/standard-1" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Standard 1 Requirements</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/compliance/standard-2" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Standard 2 Requirements</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/compliance/standard-3" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Standard 3 Requirements</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/compliance/standard-4" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Standard 4 Requirements</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/compliance/audit" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Audit Preparation</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        {/* TODO: Create Compliance details page */}
        <ProtectedRoute path="/compliance/:id" component={() => {
          const id = window.location.pathname.split('/').pop();
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Compliance Record Details</h1>
              <p className="text-muted-foreground mb-4">Compliance Record ID: {id}</p>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        
        {/* Timesheet Routes */}
        <ProtectedRoute path="/timesheets" component={TimesheetsList} />
        {/* TODO: Create Timesheet creation page */}
        <ProtectedRoute path="/timesheets/create" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Create Timesheet</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/timesheets/approvals" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Timesheet Approval Workflow</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/timesheets/payroll" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Payroll Export</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/timesheets/leave" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Leave Management</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        {/* TODO: Create Timesheet details page */}
        <ProtectedRoute path="/timesheets/:id" component={() => {
          const id = window.location.pathname.split('/').pop();
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Timesheet Details</h1>
              <p className="text-muted-foreground mb-4">Timesheet ID: {id}</p>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        
        {/* Report Routes */}
        <ProtectedRoute path="/reports" component={ReportsList} />
        <ProtectedRoute path="/reports/apprentices" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Apprentice Reports</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/reports/compliance" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Compliance Reports</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/reports/export" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Export Options</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/reports/financial" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Financial Reports</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/reports/apprentice" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Apprentice Progress Reports</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/reports/host" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Host Employer Reports</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        <ProtectedRoute path="/reports/custom" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Custom Reports</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />

        {/* Accounts & Finance Routes */}
        <ProtectedRoute path="/invoicing" component={
          () => {
            const InvoicingPage = lazy(() => import("./pages/financial/invoicing"));
            return (
              <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
                <InvoicingPage />
              </Suspense>
            );
          }
        } />
        <ProtectedRoute path="/financial-reports" component={
          () => {
            const FinancialReportsPage = lazy(() => import("./pages/financial/reports"));
            return (
              <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
                <FinancialReportsPage />
              </Suspense>
            );
          }
        } />
        <ProtectedRoute path="/budget" component={
          () => {
            const BudgetPlanningPage = lazy(() => import("./pages/financial/budget"));
            return (
              <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
                <BudgetPlanningPage />
              </Suspense>
            );
          }
        } />
        <ProtectedRoute path="/expenses" component={
          () => {
            const ExpensesPage = lazy(() => import("./pages/financial/expenses"));
            return (
              <Suspense fallback={<div className="p-8 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"/></div>}>
                <ExpensesPage />
              </Suspense>
            );
          }
        } />

        {/* Progress Reviews Module */}
        <ProtectedRoute path="/progress-reviews" component={ProgressReviewsPage} />
        <ProtectedRoute path="/progress-reviews/templates" component={TemplatesListPage} />
        <ProtectedRoute path="/progress-reviews/templates/create" component={CreateTemplatePage} />
        <ProtectedRoute path="/progress-reviews/reviews" component={ReviewsListPage} />
        <ProtectedRoute path="/progress-reviews/reviews/create" component={() => {
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Create Progress Review</h1>
              <p className="text-muted-foreground mb-4">This page is currently under development.</p>
            </div>
          );
        }} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;