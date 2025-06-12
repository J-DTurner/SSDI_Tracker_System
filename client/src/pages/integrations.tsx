import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, LogOut, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface IntegrationStatus {
  isConnected: boolean;
  email?: string;
}

export default function IntegrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Check for status from OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const message = params.get('message'); // Get the detailed error message from the URL

    if (status === 'success') {
      toast({
        title: "Connection Successful",
        description: "Your Google account has been connected.",
      });
      // Invalidate query to refetch status and clean the URL
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/google"] });
      setLocation('/integrations'); 
    } else if (status === 'error') {
      toast({
        title: "Connection Failed",
        // Display the specific message from the backend, or a generic one if not provided.
        description: message || "Could not connect your Google account. Please try again.",
        variant: "destructive",
      });
      // Clean the URL
      setLocation('/integrations');
    }
  }, [toast, queryClient, setLocation]);

  const { data: status, isLoading } = useQuery<IntegrationStatus>({
    queryKey: ["/api/integrations/google"],
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/integrations/google"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations/google"] });
      toast({
        title: "Account Disconnected",
        description: "Your Google account has been successfully disconnected.",
      });
    },
    onError: () => {
      toast({
        title: "Disconnect Failed",
        description: "Could not disconnect your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ssdi-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ssdi-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ssdi-light">
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-ssdi-4xl font-bold text-ssdi-primary mb-2">
            Google Account Integration
          </h1>
          <p className="text-ssdi-lg text-ssdi-neutral">
            Connect your Google account to automate calendar events and send emails.
          </p>
        </div>

        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader>
            <CardTitle className="text-ssdi-2xl">Gmail & Calendar Sync</CardTitle>
            <CardDescription className="text-ssdi-base">
              Enable features by securely connecting your Google account. We only request permissions to create calendar events and send emails on your behalf. We will never read your data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status?.isConnected ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-8 h-8 text-ssdi-success" />
                    <div>
                      <p className="text-ssdi-lg font-semibold text-ssdi-neutral">Connected</p>
                      <p className="text-ssdi-base text-gray-600">{status.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8 text-ssdi-warning" />
                    <div>
                      <p className="text-ssdi-lg font-semibold text-ssdi-neutral">Not Connected</p>
                      <p className="text-ssdi-base text-gray-600">Connect to enable calendar and email features.</p>
                    </div>
                  </div>
                  <Button asChild className="bg-ssdi-primary hover:bg-ssdi-primary-dark">
                    <a href="/api/auth/google">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect Google Account
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}