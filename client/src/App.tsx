import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import RetirementTrackingPage from "@/pages/retirement-tracking";
import IntegrationsPage from "@/pages/integrations";
import ContactsPage from "@/pages/contacts";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/retirement-tracking", label: "Early Retirement Tracking" },
    { href: "/contacts", label: "Contacts" },
    { href: "/integrations", label: "Integrations" },
  ];

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
      toast({
        title: "Logged out successfully",
        description: "You have been logged out",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    },
  });

  return (
    <nav className="bg-white shadow-sm border-b-2 border-gray-200">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-center">
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
          <div className="flex items-center space-x-4 py-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user.name || user.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

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