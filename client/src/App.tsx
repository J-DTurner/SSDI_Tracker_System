import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import RetirementTrackingPage from "@/pages/retirement-tracking";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b-2 border-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex space-x-8">
          <Link href="/">
            <a className={`inline-flex items-center px-1 pt-6 pb-4 border-b-2 text-ssdi-lg font-semibold transition-colors ${
              location === "/" 
                ? "border-ssdi-primary text-ssdi-primary" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}>
              SSDI Application
            </a>
          </Link>
          <Link href="/retirement-tracking">
            <a className={`inline-flex items-center px-1 pt-6 pb-4 border-b-2 text-ssdi-lg font-semibold transition-colors ${
              location === "/retirement-tracking" 
                ? "border-ssdi-primary text-ssdi-primary" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}>
              Early Retirement Tracking
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div>
      <Navigation />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/retirement-tracking" component={RetirementTrackingPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
