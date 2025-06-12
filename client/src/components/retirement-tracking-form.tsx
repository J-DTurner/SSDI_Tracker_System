import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, FileText } from "lucide-react";

interface RetirementTrackingFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function RetirementTrackingForm({ onSubmit, onCancel, isSubmitting }: RetirementTrackingFormProps) {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [receivedAt, setReceivedAt] = useState("");
  const [source, setSource] = useState("");
  const [priority, setPriority] = useState("");
  const [isActionRequired, setIsActionRequired] = useState(false);
  const [actionDeadline, setActionDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
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
    
    if (!type || !title || !description || !receivedAt || !source || !priority) {
      return;
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('receivedAt', receivedAt);
    formData.append('source', source);
    formData.append('priority', priority);
    formData.append('isActionRequired', isActionRequired.toString());
    if (actionDeadline) {
      formData.append('actionDeadline', actionDeadline);
    }
    if (notes) {
      formData.append('notes', notes);
    }
    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    onSubmit(formData);
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
            Add New Retirement Tracking Entry
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-ssdi-base font-semibold">
                Communication Type *
              </Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger className="text-ssdi-base mt-1">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="letter">Letter/Mail</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                  <SelectItem value="online_message">Online Message</SelectItem>
                  <SelectItem value="deadline">Important Deadline</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="source" className="text-ssdi-base font-semibold">
                Source *
              </Label>
              <Select value={source} onValueChange={setSource} required>
                <SelectTrigger className="text-ssdi-base mt-1">
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_security">Social Security Office</SelectItem>
                  <SelectItem value="ssa_gov">SSA.gov Website</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="mail">U.S. Mail</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-ssdi-base font-semibold">
              Title/Subject *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the communication"
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
              placeholder="Detailed description of what was communicated"
              required
              className="text-ssdi-base mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="receivedAt" className="text-ssdi-base font-semibold">
                Date/Time Received *
              </Label>
              <Input
                id="receivedAt"
                type="datetime-local"
                value={receivedAt}
                onChange={(e) => setReceivedAt(e.target.value)}
                required
                className="text-ssdi-base mt-1"
              />
            </div>

            <div>
              <Label htmlFor="priority" className="text-ssdi-base font-semibold">
                Priority Level *
              </Label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger className="text-ssdi-base mt-1">
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High - Urgent</SelectItem>
                  <SelectItem value="medium">Medium - Important</SelectItem>
                  <SelectItem value="low">Low - Informational</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="actionRequired"
              checked={isActionRequired}
              onCheckedChange={(checked) => setIsActionRequired(checked as boolean)}
            />
            <Label htmlFor="actionRequired" className="text-ssdi-base font-semibold">
              Action Required from Me
            </Label>
          </div>

          {isActionRequired && (
            <div>
              <Label htmlFor="actionDeadline" className="text-ssdi-base font-semibold">
                Action Deadline
              </Label>
              <Input
                id="actionDeadline"
                type="datetime-local"
                value={actionDeadline}
                onChange={(e) => setActionDeadline(e.target.value)}
                className="text-ssdi-base mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="text-ssdi-base font-semibold">
              Additional Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information or follow-up notes"
              className="text-ssdi-base mt-1"
              rows={2}
            />
          </div>

          {/* File Attachment */}
          <div>
            <Label className="text-ssdi-base font-semibold">
              Attachment (Optional)
            </Label>
            <div
              className={`upload-zone border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mt-1 ${
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
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileInputChange}
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="w-8 h-8 text-ssdi-primary mx-auto" />
                  <p className="text-ssdi-base font-semibold text-ssdi-neutral">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-600">
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
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-ssdi-base font-semibold text-ssdi-neutral">
                    Drop attachment here or click to browse
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports PDF, Word, JPG, PNG files up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!type || !title || !description || !receivedAt || !source || !priority || isSubmitting}
              className="bg-ssdi-primary hover:bg-ssdi-primary-dark text-white px-6 py-2 text-ssdi-base font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                "Add Entry"
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