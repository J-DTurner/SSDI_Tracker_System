import { Section } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface ProgressOverviewProps {
  sections: Section[];
}

export default function ProgressOverview({ sections }: ProgressOverviewProps) {
  const statusCounts = sections.reduce(
    (acc, section) => {
      acc[section.status] = (acc[section.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const completed = statusCounts["complete"] || 0;
  const inProgress = statusCounts["in-progress"] || 0;
  const needsAttention = statusCounts["needs-attention"] || 0;
  const total = sections.length;
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="bg-white shadow-lg border border-gray-200 mb-8">
      <CardContent className="p-8">
        <h2 className="text-ssdi-2xl font-bold text-ssdi-neutral mb-6">
          Your Application Progress
        </h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-ssdi-lg font-semibold">Overall Completion</span>
            <span className="text-ssdi-xl font-bold text-ssdi-primary">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-ssdi-primary h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-12 h-12 text-ssdi-success mx-auto mb-2" />
            <p className="text-ssdi-lg font-semibold text-ssdi-success">Completed</p>
            <p className="text-ssdi-2xl font-bold text-ssdi-success">{completed}</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock className="w-12 h-12 text-ssdi-warning mx-auto mb-2" />
            <p className="text-ssdi-lg font-semibold text-ssdi-warning">In Progress</p>
            <p className="text-ssdi-2xl font-bold text-ssdi-warning">{inProgress}</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="w-12 h-12 text-ssdi-danger mx-auto mb-2" />
            <p className="text-ssdi-lg font-semibold text-ssdi-danger">Needs Attention</p>
            <p className="text-ssdi-2xl font-bold text-ssdi-danger">{needsAttention}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
