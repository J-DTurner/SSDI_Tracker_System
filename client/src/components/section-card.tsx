import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Section, Document } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import DocumentItem from "./document-item";
import FileUpload from "./ui/file-upload";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SectionCardProps {
  section: Section;
  triggerUpload?: boolean;
}

export default function SectionCard({ section, triggerUpload }: SectionCardProps) {
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Effect to open uploader programmatically
  useEffect(() => {
    if (triggerUpload) {
      setShowUpload(true);
    }
  }, [triggerUpload]);

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: [`/api/sections/${section.id}/documents`],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/sections/${section.id}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${error}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sections/${section.id}/documents`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/action-items"] });
      setShowUpload(false);
      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded and the task is now complete.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = () => {
    switch (section.status) {
      case "complete":
        return <CheckCircle className="w-8 h-8 mr-4" />;
      case "in-progress":
        return <Clock className="w-8 h-8 mr-4" />;
      case "needs-attention":
        return <AlertTriangle className="w-8 h-8 mr-4" />;
      default:
        return <Clock className="w-8 h-8 mr-4" />;
    }
  };

  const getStatusColor = () => {
    switch (section.status) {
      case "complete":
        return "bg-ssdi-success";
      case "in-progress":
        return "bg-ssdi-warning";
      case "needs-attention":
        return "bg-ssdi-danger";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (section.status) {
      case "complete":
        return "Complete";
      case "in-progress":
        return "In Progress";
      case "needs-attention":
        return "Needs Attention";
      default:
        return "Pending";
    }
  };

  const getUploadZoneColor = () => {
    switch (section.status) {
      case "complete":
        return "border-green-300 bg-green-50 hover:bg-green-100";
      case "in-progress":
        return "border-yellow-300 bg-yellow-50 hover:bg-yellow-100";
      case "needs-attention":
        return "border-red-300 bg-red-50 hover:bg-red-100";
      default:
        return "border-gray-300 bg-gray-50 hover:bg-gray-100";
    }
  };

  const handleUpload = (file: File, documentData: { name: string; description: string; notes?: string; category: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', documentData.name);
    formData.append('description', documentData.description);
    formData.append('category', documentData.category);
    if (documentData.notes) {
      formData.append('notes', documentData.notes);
    }
    
    uploadMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg border border-gray-200">
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border border-gray-200 overflow-hidden">
      <div className={`${getStatusColor()} text-white p-6 flex items-center justify-between`}>
        <div className="flex items-center">
          {getStatusIcon()}
          <div>
            <h3 className="text-ssdi-xl font-bold">{section.name}</h3>
            <p className="text-ssdi-lg opacity-90">{section.description}</p>
          </div>
        </div>
        <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
          <span className="text-ssdi-lg font-semibold">{getStatusText()}</span>
        </div>
      </div>

      <CardContent className="p-6">
        {section.status === "needs-attention" && section.name === "Appeals Process Documents" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-ssdi-danger mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-ssdi-lg font-semibold text-ssdi-danger mb-2">
                  Action Required: Appeal Deadline
                </h4>
                <p className="text-ssdi-base text-ssdi-neutral mb-2">
                  You have <strong>45 days</strong> remaining to submit your appeal.
                </p>
                <p className="text-ssdi-base text-gray-600">
                  Deadline: <strong>May 15, 2024</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-ssdi-lg mb-6 text-ssdi-neutral leading-relaxed">
          {section.name === "Initial Application Documents" && 
            "These documents prove your identity and work history. They help establish when your disability began and your eligibility for benefits."}
          {section.name === "Medical Evidence" && 
            "These medical records prove the extent of your disability and how it affects your ability to work. The more complete your medical evidence, the stronger your case."}
          {section.name === "Work History Documentation" && 
            "These documents show what type of work you did and help determine if you can do other types of work despite your disability."}
          {section.name === "Appeals Process Documents" && 
            "If your initial application was denied, you can appeal the decision. These documents will support your appeal and provide additional evidence."}
        </p>

        {/* Documents List */}
        <div className="space-y-4 mb-6">
          {documents?.map((document) => (
            <DocumentItem key={document.id} document={document} />
          ))}
        </div>

        {/* Upload Section */}
        {!showUpload ? (
          <div 
            className={`upload-zone border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${getUploadZoneColor()}`}
            onClick={() => setShowUpload(true)}
          >
            <div className="text-4xl text-gray-400 mb-4">📁</div>
            <p className="text-ssdi-lg font-semibold text-ssdi-neutral mb-2">
              Upload {section.name === "Medical Evidence" ? "Medical Records" : 
                     section.name === "Appeals Process Documents" ? "Appeal Documents" : "Documents"}
            </p>
            <p className="text-ssdi-base text-gray-600 mb-4">
              Click here to add new documents
            </p>
            <div className="inline-block bg-ssdi-primary hover:bg-ssdi-primary-dark text-white px-6 py-3 rounded-lg text-ssdi-base font-semibold transition-colors">
              Choose Files
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Accepts PDF, JPG, PNG files up to 10MB each
            </p>
          </div>
        ) : (
          <FileUpload
            onUpload={handleUpload}
            onCancel={() => setShowUpload(false)}
            isUploading={uploadMutation.isPending}
            sectionName={section.name}
          />
        )}
      </CardContent>
    </Card>
  );
}
