import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  onUpload: (file: File, data: { name: string; description: string; notes?: string; category: string }) => void;
  onCancel: () => void;
  isUploading: boolean;
  sectionName: string;
}

export default function FileUpload({ onUpload, onCancel, isUploading, sectionName }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get category options based on section
  const getCategoryOptions = () => {
    if (sectionName === "Medical Evidence") {
      return [
        { value: "medical", label: "For Medical Providers", description: "Records from doctors, hospitals, clinics" },
        { value: "personal", label: "Personal Medical Records", description: "Your own medical documentation" },
        { value: "legal", label: "For Legal Representative", description: "Medical records for your lawyer" }
      ];
    } else if (sectionName === "Appeals Process Documents") {
      return [
        { value: "legal", label: "For Legal Representative", description: "Documents for your lawyer or advocate" },
        { value: "government", label: "For Social Security", description: "Official appeals documents" },
        { value: "personal", label: "Personal Records", description: "Your own appeal documentation" }
      ];
    } else if (sectionName === "Work History Documentation") {
      return [
        { value: "employment", label: "From Employers", description: "Records from current/former employers" },
        { value: "personal", label: "Personal Work Records", description: "Your own employment documentation" },
        { value: "legal", label: "For Legal Representative", description: "Work records for your lawyer" }
      ];
    } else {
      return [
        { value: "government", label: "Government Records", description: "Official documents from agencies" },
        { value: "personal", label: "Personal Documents", description: "Your own records and documentation" },
        { value: "legal", label: "For Legal Representative", description: "Documents for your lawyer" },
        { value: "medical", label: "Medical Records", description: "Health-related documentation" },
        { value: "employment", label: "Employment Records", description: "Work-related documentation" }
      ];
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!documentName) {
      // Set default name based on file name
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      setDocumentName(nameWithoutExtension);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !documentName || !description || !category) {
      return;
    }

    onUpload(selectedFile, {
      name: documentName,
      description: description,
      notes: notes || undefined,
      category: category,
    });
  };

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }
    return `${kb.toFixed(0)} KB`;
  };

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-ssdi-lg font-semibold text-ssdi-neutral">
            Upload Document for {sectionName}
          </h4>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div
            className={`upload-zone border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              dragOver ? 'border-ssdi-primary bg-blue-50 drag-over' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="w-12 h-12 text-ssdi-primary mx-auto" />
                <p className="text-ssdi-lg font-semibold text-ssdi-neutral">
                  {selectedFile.name}
                </p>
                <p className="text-ssdi-base text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-ssdi-lg font-semibold text-ssdi-neutral">
                  Drop your file here or click to browse
                </p>
                <p className="text-ssdi-base text-gray-600">
                  Supports PDF, JPG, PNG files up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Document Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentName" className="text-ssdi-base font-semibold">
                Document Name *
              </Label>
              <Input
                id="documentName"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Birth Certificate, Medical Records"
                required
                className="text-ssdi-base mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-ssdi-base font-semibold">
                Description *
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this document contains and why it's important"
                required
                className="text-ssdi-base mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-ssdi-base font-semibold">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information about this document"
                className="text-ssdi-base mt-1"
                rows={2}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!selectedFile || !documentName || !description || isUploading}
              className="bg-ssdi-primary hover:bg-ssdi-primary-dark text-white px-6 py-2 text-ssdi-base font-semibold"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="px-6 py-2 text-ssdi-base font-semibold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
