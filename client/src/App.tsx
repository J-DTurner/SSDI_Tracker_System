import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import RetirementTrackingPage from "@/pages/retirement-tracking";
import IntegrationsPage from "@/pages/integrations";
import ContactsPage from "@/pages/contacts";
import NotFound from "@/pages/not-found";

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/retirement-tracking", label: "Early Retirement Tracking" },
    { href: "/contacts", label: "Contacts" },
    { href: "/integrations", label: "Integrations" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b-2 border-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex space-x-8">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}>
              <a className={`inline-flex items-center px-1 pt-6 pb-4 border-b-2 text-ssdi-lg font-semibold transition-colors ${
                location === item.href 
                  ? "border-ssdi-primary text-ssdi-primary" 
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}>
                {item.label}
              </a>
            </Link>
          ))}
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
        <Route path="/integrations" component={IntegrationsPage} />
        <Route path="/contacts" component={ContactsPage} />
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