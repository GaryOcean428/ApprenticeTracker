import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import TimesheetsList from "./pages/timesheets/index";
import ReportsList from "./pages/reports/index";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      
      {/* Apprentice Routes */}
      <Route path="/apprentices" component={ApprenticesList} />
      <Route path="/apprentices/create" component={CreateApprentice} />
      <Route path="/apprentices/:id" component={ApprenticeDetails} />
      
      {/* Host Routes */}
      <Route path="/hosts" component={HostsList} />
      <Route path="/hosts/create" component={CreateHost} />
      <Route path="/hosts/:id" component={HostDetails} />
      
      {/* Other Routes */}
      <Route path="/contracts" component={ContractsList} />
      <Route path="/placements" component={PlacementsList} />
      <Route path="/documents" component={DocumentsList} />
      <Route path="/compliance" component={ComplianceList} />
      <Route path="/timesheets" component={TimesheetsList} />
      <Route path="/reports" component={ReportsList} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainLayout>
          <Router />
        </MainLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
