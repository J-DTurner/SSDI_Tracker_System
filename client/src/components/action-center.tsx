import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertTriangle } from "lucide-react";
import ActionItem from "./action-item";
import { apiRequest } from "@/lib/queryClient";

interface ActionCenterProps {
    onUploadClick: (sectionId: number) => void;
}

interface ActionItemsResponse {
    needsAttention: any[];
    completed: any[];
}

export default function ActionCenter({ onUploadClick }: ActionCenterProps) {
  const { data, isLoading } = useQuery<ActionItemsResponse>({
    queryKey: ["/api/user/action-items"],
    queryFn: () => apiRequest("GET", "/api/user/action-items"),
  });

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200 mb-8">
        <CardHeader>
          <CardTitle className="text-ssdi-2xl font-bold text-ssdi-neutral">Action Center</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const needsAttentionCount = data?.needsAttention?.length || 0;
  const completedCount = data?.completed?.length || 0;

  return (
    <Card className="bg-white shadow-lg border border-gray-200 mb-8">
      <CardHeader>
        <CardTitle className="text-ssdi-2xl font-bold text-ssdi-neutral">Action Center</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="needs-attention">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="needs-attention">
              Needs Attention ({needsAttentionCount})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="needs-attention" className="mt-6">
            {needsAttentionCount > 0 ? (
              <div className="space-y-4">
                {data?.needsAttention.map((item) => (
                  <ActionItem key={`${item.type}-${item.id}`} item={item} onUploadClick={onUploadClick} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-20 h-20 text-ssdi-success mx-auto mb-4" />
                <h3 className="text-ssdi-2xl font-bold text-ssdi-neutral">Great job!</h3>
                <p className="text-ssdi-lg text-gray-600 mt-2">You have no pending action items.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedCount > 0 ? (
                <div className="space-y-4">
                    {data?.completed.map((item) => (
                        <ActionItem key={`${item.type}-${item.id}`} item={item} onUploadClick={() => {}} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <AlertTriangle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-ssdi-xl font-semibold text-ssdi-neutral">No recent activity.</h3>
                    <p className="text-ssdi-lg text-gray-600 mt-2">Items you complete will show up here.</p>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}