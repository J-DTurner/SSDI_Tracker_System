import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RetirementTracking } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Phone, Mail, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import RetirementTrackingForm from "@/components/retirement-tracking-form";
import RetirementTrackingItem from "@/components/retirement-tracking-item";

export default function RetirementTrackingPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trackings, isLoading } = useQuery<RetirementTracking[]>({
    queryKey: ["/api/retirement-tracking"],
  });

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/retirement-tracking', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Creation failed: ${error}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-tracking"] });
      setShowAddForm(false);
      toast({
        title: "Entry Added",
        description: "Your retirement tracking entry has been successfully added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Add Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddEntry = (formData: FormData) => {
    createMutation.mutate(formData);
  };

  const getOverviewStats = () => {
    if (!trackings) return { total: 0, actionRequired: 0, highPriority: 0 };
    
    return {
      total: trackings.length,
      actionRequired: trackings.filter(t => t.isActionRequired).length,
      highPriority: trackings.filter(t => t.priority === 'high').length,
    };
  };

  const stats = getOverviewStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ssdi-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ssdi-primary mx-auto mb-4"></div>
          <p className="text-ssdi-xl font-semibold">Loading retirement tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ssdi-light">
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-ssdi-4xl font-bold text-ssdi-primary mb-2">
            Early Retirement Tracking
          </h1>
          <p className="text-ssdi-lg text-ssdi-neutral">
            Track all communications and important dates from the Social Security Administration
          </p>
        </div>

        {/* Overview Stats */}
        <Card className="bg-white shadow-lg border border-gray-200 mb-8">
          <CardContent className="p-8">
            <h2 className="text-ssdi-2xl font-bold text-ssdi-neutral mb-6">
              Communication Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Calendar className="w-12 h-12 text-ssdi-primary mx-auto mb-2" />
                <p className="text-ssdi-lg font-semibold text-ssdi-primary">Total Entries</p>
                <p className="text-ssdi-2xl font-bold text-ssdi-primary">{stats.total}</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-12 h-12 text-ssdi-warning mx-auto mb-2" />
                <p className="text-ssdi-lg font-semibold text-ssdi-warning">Action Required</p>
                <p className="text-ssdi-2xl font-bold text-ssdi-warning">{stats.actionRequired}</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <Clock className="w-12 h-12 text-ssdi-danger mx-auto mb-2" />
                <p className="text-ssdi-lg font-semibold text-ssdi-danger">High Priority</p>
                <p className="text-ssdi-2xl font-bold text-ssdi-danger">{stats.highPriority}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Entry Button */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-ssdi-primary hover:bg-ssdi-primary-dark text-white px-6 py-3 text-ssdi-lg font-semibold"
          >
            <Plus className="w-6 h-6 mr-2" />
            {showAddForm ? "Cancel" : "Add New Entry"}
          </Button>
        </div>

        {/* Add Entry Form */}
        {showAddForm && (
          <div className="mb-8">
            <RetirementTrackingForm
              onSubmit={handleAddEntry}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={createMutation.isPending}
            />
          </div>
        )}

        {/* Tracking Entries */}
        <div className="space-y-6">
          {trackings?.map((tracking) => (
            <RetirementTrackingItem key={tracking.id} tracking={tracking} />
          ))}
        </div>

        {trackings?.length === 0 && (
          <Card className="bg-white shadow-lg border border-gray-200">
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-ssdi-xl font-semibold text-ssdi-neutral mb-2">
                No Tracking Entries Yet
              </h3>
              <p className="text-ssdi-base text-gray-600 mb-6">
                Start tracking your early retirement communications by adding your first entry.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-ssdi-primary hover:bg-ssdi-primary-dark text-white px-6 py-3 text-ssdi-lg font-semibold"
              >
                <Plus className="w-6 h-6 mr-2" />
                Add First Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}