import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DocumentItemProps {
  document: Document;
}

export default function DocumentItem({ document }: DocumentItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sections/${document.sectionId}/documents`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      toast({
        title: "Document Deleted",
        description: "The document has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleView = () => {
    if (document.fileName) {
      window.open(`/api/files/${document.fileName}`, '_blank');
    } else {
      toast({
        title: "No File Available",
        description: "This document hasn't been uploaded yet.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(document.id);
    }
  };

  const getStatusIcon = () => {
    switch (document.status) {
      case "uploaded":
        return <CheckCircle className="w-6 h-6 text-ssdi-success" />;
      case "pending":
        return <Clock className="w-6 h-6 text-ssdi-warning" />;
      case "missing":
        return <AlertTriangle className="w-6 h-6 text-ssdi-danger" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case "uploaded":
        return "bg-green-50 border-green-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "missing":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${kb.toFixed(0)} KB`;
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, { label: string; color: string }> = {
      personal: { label: "Personal Records", color: "bg-blue-100 text-blue-800" },
      medical: { label: "Medical Records", color: "bg-green-100 text-green-800" },
      legal: { label: "Legal/Attorney", color: "bg-purple-100 text-purple-800" },
      employment: { label: "Employment Records", color: "bg-orange-100 text-orange-800" },
      government: { label: "Government Records", color: "bg-gray-100 text-gray-800" }
    };
    return categoryMap[category] || { label: category, color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className={`flex items-center p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="mr-4">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-ssdi-lg font-semibold text-ssdi-neutral">
            {document.name}
          </h4>
          {document.category && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryLabel(document.category).color}`}>
              {getCategoryLabel(document.category).label}
            </span>
          )}
        </div>
        <p className="text-ssdi-base text-gray-600 mb-1">
          {document.description}
        </p>
        
        {document.uploadedAt && (
          <p className="text-sm text-gray-500">
            Uploaded: {formatDate(document.uploadedAt)}
            {document.fileSize && ` • ${formatFileSize(document.fileSize)}`}
          </p>
        )}
        
        {document.contactInfo && (
          <p className="text-sm text-gray-500 mt-1">
            Contact: {document.contactInfo}
          </p>
        )}
        
        {document.notes && (
          <p className="text-sm text-gray-600 mt-1 italic">
            {document.notes}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {document.status === "uploaded" && document.fileName && (
          <Button
            onClick={handleView}
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
  );
}
