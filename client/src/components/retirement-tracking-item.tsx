import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RetirementTracking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Mail, AlertTriangle, Clock, Eye, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RetirementTrackingItemProps {
  tracking: RetirementTracking;
}

export default function RetirementTrackingItem({ tracking }: RetirementTrackingItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/retirement-tracking/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retirement-tracking"] });
      toast({
        title: "Entry Deleted",
        description: "The tracking entry has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the tracking entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this tracking entry?")) {
      deleteMutation.mutate(tracking.id);
    }
  };

  const handleViewAttachment = () => {
    if (tracking.attachmentFileName) {
      window.open(`/api/files/${tracking.attachmentFileName}`, '_blank');
    } else {
      toast({
        title: "No Attachment",
        description: "This entry doesn't have an attachment.",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = () => {
    switch (tracking.type) {
      case "email":
        return <Mail className="w-6 h-6" />;
      case "letter":
        return <FileText className="w-6 h-6" />;
      case "phone_call":
        return <Phone className="w-6 h-6" />;
      case "online_message":
        return <Mail className="w-6 h-6" />;
      case "deadline":
        return <AlertTriangle className="w-6 h-6" />;
      case "appointment":
        return <Calendar className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getTypeLabel = () => {
    switch (tracking.type) {
      case "email":
        return "Email";
      case "letter":
        return "Letter";
      case "phone_call":
        return "Phone Call";
      case "online_message":
        return "Online Message";
      case "deadline":
        return "Deadline";
      case "appointment":
        return "Appointment";
      default:
        return tracking.type;
    }
  };

  const getPriorityColor = () => {
    switch (tracking.priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSourceLabel = () => {
    switch (tracking.source) {
      case "social_security":
        return "Social Security Office";
      case "ssa_gov":
        return "SSA.gov";
      case "phone":
        return "Phone";
      case "mail":
        return "Mail";
      case "email":
        return "Email";
      default:
        return tracking.source;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${kb.toFixed(0)} KB`;
  };

  const isOverdue = tracking.actionDeadline && new Date(tracking.actionDeadline) < new Date();

  return (
    <div className={`p-6 rounded-lg border-2 ${
      tracking.isActionRequired 
        ? isOverdue 
          ? "bg-red-50 border-red-300" 
          : "bg-yellow-50 border-yellow-300"
        : "bg-white border-gray-200"
    } shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${
            tracking.priority === 'high' ? 'bg-red-100 text-red-600' :
            tracking.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
            'bg-green-100 text-green-600'
          }`}>
            {getTypeIcon()}
          </div>
          
          <div>
            <h3 className="text-ssdi-xl font-bold text-ssdi-neutral mb-1">
              {tracking.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {getTypeLabel()}
              </Badge>
              <Badge className={`text-xs ${getPriorityColor()}`}>
                {tracking.priority.toUpperCase()} PRIORITY
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getSourceLabel()}
              </Badge>
              {tracking.isActionRequired && (
                <Badge className="text-xs bg-orange-100 text-orange-800">
                  ACTION REQUIRED
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              <Clock className="w-4 h-4 inline mr-1" />
              Received: {formatDate(tracking.receivedAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {tracking.attachmentFileName && (
            <Button
              onClick={handleViewAttachment}
              variant="outline"
              size="sm"
              className="text-ssdi-base font-medium"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          )}
          
          <Button
            onClick={handleDelete}
            variant="outline"
            size="sm"
            className="text-ssdi-danger border-ssdi-danger hover:bg-red-50"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-ssdi-base text-gray-700 leading-relaxed">
          {tracking.description}
        </p>
      </div>

      {tracking.isActionRequired && tracking.actionDeadline && (
        <div className={`p-4 rounded-lg mb-4 ${
          isOverdue ? 'bg-red-100 border border-red-300' : 'bg-yellow-100 border border-yellow-300'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className={`w-5 h-5 mr-2 ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`} />
            <div>
              <p className={`font-semibold ${isOverdue ? 'text-red-800' : 'text-yellow-800'}`}>
                {isOverdue ? 'OVERDUE: ' : 'Action Required by: '}
                {formatDate(tracking.actionDeadline)}
              </p>
              {isOverdue && (
                <p className="text-sm text-red-700">
                  This deadline has passed. Please take action immediately.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {tracking.attachmentFileName && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg border">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Attachment: {tracking.attachmentFileName}
            </span>
            {tracking.attachmentFileSize && (
              <span className="text-xs text-gray-500">
                ({formatFileSize(tracking.attachmentFileSize)})
              </span>
            )}
          </div>
        </div>
      )}

      {tracking.notes && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 italic">
            <strong>Notes:</strong> {tracking.notes}
          </p>
        </div>
      )}
    </div>
  );
}