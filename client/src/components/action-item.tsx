import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { AlertTriangle, Clock, CheckCircle, FileWarning, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { apiRequest } from "@/lib/queryClient";

// Define the types for props based on backend response
interface ActionItemProps {
  item: {
    type: 'missing_document' | 'required_action' | 'completed_document' | 'completed_action';
    id: number;
    title: string;
    description?: string;
    deadline?: string | null;
    isOverdue?: boolean;
    sectionId?: number;
    sectionName?: string;
    completedAt?: string | null;
  };
  onUploadClick: (sectionId: number, sectionRef: React.RefObject<HTMLDivElement>) => void;
}

export default function ActionItem({ item, onUploadClick }: ActionItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markCompleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/retirement-tracking/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/action-items"] });
      toast({
        title: "Task Completed",
        description: "The action item has been marked as complete.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getIcon = () => {
    if (item.type.startsWith('completed')) {
      return <CheckCircle className="w-6 h-6 text-ssdi-success flex-shrink-0" />;
    }
    if (item.isOverdue) {
      return <AlertTriangle className="w-6 h-6 text-ssdi-danger flex-shrink-0" />;
    }
    if (item.type === 'missing_document') {
        return <FileWarning className="w-6 h-6 text-ssdi-danger flex-shrink-0" />;
    }
    return <Clock className="w-6 h-6 text-ssdi-warning flex-shrink-0" />;
  };

  const getBorderColor = () => {
    if (item.type.startsWith('completed')) return "border-green-200 bg-green-50";
    if (item.isOverdue || item.type === 'missing_document') return "border-red-200 bg-red-50";
    return "border-yellow-200 bg-yellow-50";
  };
  
  return (
    <div className={`flex items-center p-4 rounded-lg border-2 ${getBorderColor()}`}>
      <div className="mr-4">{getIcon()}</div>
      <div className="flex-1">
        <h4 className="text-ssdi-lg font-semibold text-ssdi-neutral">{item.title}</h4>
        {item.type === 'missing_document' && (
          <p className="text-ssdi-base text-gray-600">
            From section: <strong>{item.sectionName}</strong>
          </p>
        )}
        {item.type === 'required_action' && item.deadline && (
           <p className={`text-ssdi-base ${item.isOverdue ? 'text-ssdi-danger' : 'text-ssdi-warning'}`}>
             Due: <strong>{formatDate(item.deadline)}</strong>
           </p>
        )}
        {item.type.startsWith('completed') && (
            <p className="text-ssdi-base text-gray-600">
                Completed: <strong>{formatDate(item.completedAt)}</strong>
            </p>
        )}
      </div>
      <div className="flex gap-2">
        {item.type === 'missing_document' && item.sectionId && (
          <Button onClick={() => onUploadClick(item.sectionId!)}>
            <Check className="w-4 h-4 mr-2" /> Upload Now
          </Button>
        )}
        {item.type === 'required_action' && (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={markCompleteMutation.isPending}>
                    <Check className="w-4 h-4 mr-2" /> Mark as Complete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Have you completed this task? This will move the item to your completed list.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => markCompleteMutation.mutate(item.id)}>
                    Yes, it's complete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Link href={`/retirement-tracking#tracking-${item.id}`}>
              <Button asChild variant="outline">
                <a>
                    <ExternalLink className="w-4 h-4 mr-2" /> View Details
                </a>
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}