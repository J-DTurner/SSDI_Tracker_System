import { useQuery } from "@tanstack/react-query";
import { User, Section, Document } from "@shared/schema";
import ProgressOverview from "@/components/progress-overview";
import SectionCard from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery<Section[]>({
    queryKey: ["/api/sections"],
  });

  if (userLoading || sectionsLoading) {
    return (
      <div className="min-h-screen bg-ssdi-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ssdi-primary mx-auto mb-4"></div>
          <p className="text-ssdi-xl font-semibold">Loading your application...</p>
        </div>
      </div>
    );
  }

  const handlePrintSummary = () => {
    toast({
      title: "Print Summary",
      description: "Generating your application summary for printing...",
    });
    // In a real implementation, this would generate a PDF
    window.print();
  };

  const handleGetHelp = () => {
    toast({
      title: "Help & Support",
      description: "Opening help center...",
    });
    // In a real implementation, this would open a help center or contact form
  };

  return (
    <div className="min-h-screen bg-ssdi-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-gray-200 mb-8">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-ssdi-4xl font-bold text-ssdi-primary mb-2">
                SSDI Application Tracker
              </h1>
              <p className="text-ssdi-lg text-ssdi-neutral">
                Track your Social Security Disability Insurance application progress
              </p>
            </div>
            {user && (
              <div className="text-left md:text-right">
                <p className="text-ssdi-lg font-semibold text-ssdi-neutral">{user.name}</p>
                <p className="text-ssdi-base text-gray-600">
                  Application #{user.applicationId}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-12">
        {/* Progress Overview */}
        {sections && <ProgressOverview sections={sections} />}

        {/* Task Sections */}
        <div className="space-y-8 mb-12">
          {sections?.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardContent className="p-8">
            <h3 className="text-ssdi-2xl font-bold text-ssdi-neutral mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button
                onClick={handlePrintSummary}
                className="flex items-center p-6 bg-ssdi-primary hover:bg-ssdi-primary-dark text-white text-ssdi-lg font-semibold h-auto"
              >
                <FileText className="w-8 h-8 mr-4" />
                <div className="text-left">
                  <div>Print Application Summary</div>
                  <div className="text-sm opacity-90 font-normal">
                    Get a complete overview of your progress
                  </div>
                </div>
              </Button>
              <Button
                onClick={handleGetHelp}
                variant="secondary"
                className="flex items-center p-6 bg-gray-600 hover:bg-gray-700 text-white text-ssdi-lg font-semibold h-auto"
              >
                <HelpCircle className="w-8 h-8 mr-4" />
                <div className="text-left">
                  <div>Get Help</div>
                  <div className="text-sm opacity-90 font-normal">
                    Contact support for assistance
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
