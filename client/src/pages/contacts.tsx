import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Contact as ContactType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit, User, Briefcase, Mail, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ContactForm({ contact, onFinished }: { contact?: ContactType, onFinished: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState(contact?.name || "");
  const [role, setRole] = useState(contact?.role || "");
  const [email, setEmail] = useState(contact?.email || "");

  const mutation = useMutation({
    mutationFn: (data: Partial<ContactType>) => {
      return contact?.id 
        ? apiRequest("PATCH", `/api/contacts/${contact.id}`, data)
        : apiRequest("POST", "/api/contacts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({ title: `Contact ${contact?.id ? 'updated' : 'added'} successfully` });
      onFinished();
    },
    onError: () => {
      toast({ title: `Failed to ${contact?.id ? 'update' : 'add'} contact`, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, role, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="role">Role (e.g., Doctor, Lawyer)</Label>
        <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onFinished}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Contact"}
        </Button>
      </div>
    </form>
  );
}

function ContactItem({ contact }: { contact: ContactType }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/contacts/${contact.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({ title: "Contact deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete contact", variant: "destructive" });
    }
  });

  return (
    <div className="p-4 border rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-full">
            <User className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <p className="font-semibold text-ssdi-lg">{contact.name}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {contact.role && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {contact.role}</span>}
            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {contact.email}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Contact</DialogTitle></DialogHeader>
                <ContactForm contact={contact} onFinished={() => setIsFormOpen(false)} />
            </DialogContent>
        </Dialog>
        <Button variant="destructive" size="icon" onClick={() => {if(confirm('Are you sure?')) deleteMutation.mutate()}}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: contacts, isLoading } = useQuery<ContactType[]>({ queryKey: ["/api/contacts"] });

  return (
    <div className="min-h-screen bg-ssdi-light">
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-ssdi-4xl font-bold text-ssdi-primary mb-2">My Contacts</h1>
            <p className="text-ssdi-lg text-ssdi-neutral">
              Manage contacts for sending emails and documents.
            </p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button className="bg-ssdi-primary hover:bg-ssdi-primary-dark">
                    <Plus className="w-4 h-4 mr-2" /> Add Contact
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add New Contact</DialogTitle></DialogHeader>
                <ContactForm onFinished={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-white shadow-lg border border-gray-200">
          <CardContent className="p-6">
            {isLoading ? (
              <p>Loading contacts...</p>
            ) : contacts?.length ? (
              <div className="space-y-4">
                {contacts.map(contact => <ContactItem key={contact.id} contact={contact} />)}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No contacts found. Add your first contact to get started.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}