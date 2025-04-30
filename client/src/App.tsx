import { Switch, Route, useLocation } from "wouter";
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

// Public pages
import HomePage from "./pages/public/home";
import AboutPage from "./pages/public/about";
import ServicesPage from "./pages/public/services";
import FindApprenticeshipPage from "./pages/public/find-apprenticeship";
import HostApprenticePage from "./pages/public/host-apprentice";
import ContactPage from "./pages/public/contact";

function Router() {
  const [location] = useLocation();
  const isPublicRoute = [
    '/',
    '/about',
    '/services',
    '/find-apprenticeship',
    '/host-apprentice',
    '/contact'
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
      <Route path="/apprentices/:id" component={withIdValidation(ApprenticeDetails, "/apprentices", "Invalid Apprentice ID")} />
      
      {/* Host Routes */}
      <Route path="/hosts" component={HostsList} />
      <Route path="/hosts/create" component={CreateHost} />
      <Route path="/hosts/:id" component={withIdValidation(HostDetails, "/hosts", "Invalid Host ID")} />
      
      {/* Fair Work Routes */}
      <Route path="/awards" component={AwardsList} />
      <Route path="/awards/create" component={CreateAward} />
      
      {/* Other Routes */}
      <Route path="/contracts" component={ContractsList} />
      <Route path="/placements" component={PlacementsList} />
      <Route path="/documents" component={DocumentsList} />
      <Route path="/compliance" component={ComplianceList} />
      <Route path="/compliance/create" component={CreateComplianceRecord} />
      <Route path="/timesheets" component={TimesheetsList} />
      <Route path="/reports" component={ReportsList} />
      
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
    '/contact'
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
