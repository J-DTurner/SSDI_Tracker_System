import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contact, Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Paperclip, X } from "lucide-react";

interface EmailComposerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialDocument?: Document;
}

export default function EmailComposer({ isOpen, onOpenChange, initialDocument }: EmailComposerProps) {
  const { toast } = useToast();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(initialDocument ? `Document: ${initialDocument.name}` : "");
  const [body, setBody] = useState("Please see the attached document(s) regarding my SSDI application.");
  const [attachmentIds, setAttachmentIds] = useState<number[]>(initialDocument ? [initialDocument.id] : []);

  const { data: contacts } = useQuery<Contact[]>({ queryKey: ["/api/contacts"] });
  const { data: documents } = useQuery<Document[]>({ 
    queryKey: ["/api/sections/all/documents"], // A hypothetical endpoint to get all documents
    queryFn: async () => {
        const sections = await apiRequest<any[]>("GET", "/api/sections");
        const docPromises = sections.map(s => apiRequest<Document[]>("GET", `/api/sections/${s.id}/documents`));
        const docArrays = await Promise.all(docPromises);
        return docArrays.flat().filter(d => d.status === 'uploaded');
    }
   });

  const sendMutation = useMutation({
    mutationFn: (emailData: { to: string, subject: string, body: string, attachmentIds: number[] }) => 
      apiRequest("POST", "/api/email/send", emailData),
    onSuccess: () => {
      toast({ title: "Email Sent Successfully" });
      onOpenChange(false);
      // Reset form
      setTo("");
      setSubject("");
      setBody("Please see the attached document(s) regarding my SSDI application.");
      setAttachmentIds([]);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to Send Email", description: error.message, variant: "destructive" });
    }
  });

  const handleSend = () => {
    if (!to || !subject || !body) {
      toast({ title: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    sendMutation.mutate({ to, subject, body, attachmentIds });
  };
  
  const toggleAttachment = (docId: number) => {
    setAttachmentIds(prev => prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]);
  }

  const getAttachmentName = (id: number) => documents?.find(d => d.id === id)?.name;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>Send documents to your contacts directly from the app.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="to">To</Label>
            <Select onValueChange={setTo} value={to}>
              <SelectTrigger><SelectValue placeholder="Select a contact..." /></SelectTrigger>
              <SelectContent>
                {contacts?.map(c => <SelectItem key={c.id} value={c.email}>{c.name} ({c.email})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={8} />
          </div>
          <div>
            <Label>Attachments</Label>
            <div className="p-2 border rounded-md mt-1 max-h-40 overflow-y-auto">
                {documents?.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-1">
                        <label htmlFor={`doc-${doc.id}`} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" id={`doc-${doc.id}`} checked={attachmentIds.includes(doc.id)} onChange={() => toggleAttachment(doc.id)} />
                            {doc.name}
                        </label>
                    </div>
                ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {attachmentIds.map(id => (
                    <div key={id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-sm">
                        <Paperclip className="w-4 h-4" />
                        {getAttachmentName(id)}
                        <button onClick={() => toggleAttachment(id)}><X className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={sendMutation.isPending}>
            {sendMutation.isPending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}