
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Workflow, Zap, Upload, Database, MessageSquare, FileText } from "lucide-react";

const triggers = [
  { value: "upload", label: "Document Upload", icon: Upload, desc: "Trigger when documents are uploaded" },
  { value: "schedule", label: "Scheduled", icon: Zap, desc: "Run on a regular schedule" },
  { value: "webhook", label: "Webhook", icon: Database, desc: "Trigger via external API call" },
  { value: "question", label: "User Question", icon: MessageSquare, desc: "Trigger when users ask questions" },
];

const actions = [
  { value: "process", label: "Process Documents", icon: FileText, desc: "Extract and index document content" },
  { value: "rag_search", label: "RAG Search", icon: Database, desc: "Search and retrieve relevant information" },
  { value: "notify", label: "Send Notification", icon: MessageSquare, desc: "Send alerts via email or Slack" },
  { value: "audit", label: "Compliance Audit", icon: Zap, desc: "Run compliance checks and generate reports" },
];

export default function WorkflowBuilderForm({ onWorkflowCreated }: { onWorkflowCreated?: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("");
  const [action, setAction] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedTrigger = triggers.find(t => t.value === trigger);
  const selectedAction = actions.find(a => a.value === action);

  async function createWorkflow() {
    if (!name || !trigger || !action) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/workflows/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description,
          trigger, 
          action,
          template_data: {
            trigger: { type: trigger, config: {} },
            action: { type: action, config: {} }
          }
        }),
      });

      if (response.ok) {
        toast.success("Workflow created successfully!");
        setName("");
        setDescription("");
        setTrigger("");
        setAction("");
        onWorkflowCreated?.();
      } else {
        throw new Error("Failed to create workflow");
      }
    } catch (error) {
      toast.error("Failed to create workflow");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Workflow className="h-5 w-5 mr-2" />
          Create New Workflow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Workflow Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Document Processing Pipeline"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what this workflow does..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Trigger *</Label>
            <Select value={trigger} onValueChange={setTrigger}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggers.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center">
                      <t.icon className="h-4 w-4 mr-2" />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTrigger && (
              <div className="p-3 bg-muted rounded-md">
                <Badge variant="secondary" className="mb-2">
                  {selectedTrigger.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {selectedTrigger.desc}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Action *</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                {actions.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    <div className="flex items-center">
                      <a.icon className="h-4 w-4 mr-2" />
                      {a.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAction && (
              <div className="p-3 bg-muted rounded-md">
                <Badge variant="secondary" className="mb-2">
                  {selectedAction.label}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {selectedAction.desc}
                </p>
              </div>
            )}
          </div>
        </div>

        {trigger && action && (
          <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
            <h4 className="font-medium mb-2">Workflow Preview</h4>
            <div className="flex items-center space-x-2 text-sm">
              <Badge variant="outline">{selectedTrigger?.label}</Badge>
              <span>→</span>
              <Badge variant="outline">{selectedAction?.label}</Badge>
            </div>
          </div>
        )}

        <Button 
          onClick={createWorkflow} 
          disabled={!name || !trigger || !action || isLoading}
          className="w-full"
        >
          {isLoading ? "Creating..." : "Create Workflow"}
        </Button>
      </CardContent>
    </Card>
  );
}
