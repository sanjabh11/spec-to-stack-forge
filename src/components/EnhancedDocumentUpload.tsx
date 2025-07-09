
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, Tag, Eye } from "lucide-react";
import { toast } from "sonner";

interface DocumentWithTags {
  file: File;
  tags: string[];
  preview?: string;
  uploadProgress?: number;
}

export default function EnhancedDocumentUpload({ 
  onUploadComplete 
}: { 
  onUploadComplete?: (docs: any[]) => void 
}) {
  const [documents, setDocuments] = useState<DocumentWithTags[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newDocs: DocumentWithTags[] = Array.from(files).map(file => ({
      file,
      tags: [],
      uploadProgress: 0
    }));

    // Generate previews for text files
    newDocs.forEach(async (doc, index) => {
      if (doc.file.type.startsWith('text/') || doc.file.name.endsWith('.md')) {
        const text = await doc.file.text();
        doc.preview = text.substring(0, 200) + (text.length > 200 ? '...' : '');
        setDocuments(prev => [...prev.slice(0, index), doc, ...prev.slice(index + 1)]);
      }
    });

    setDocuments(prev => [...prev, ...newDocs]);
  };

  const addTag = (docIndex: number, tag: string) => {
    if (!tag.trim()) return;
    
    setDocuments(prev => prev.map((doc, index) => 
      index === docIndex 
        ? { ...doc, tags: [...doc.tags, tag.trim()] }
        : doc
    ));
  };

  const removeTag = (docIndex: number, tagIndex: number) => {
    setDocuments(prev => prev.map((doc, index) => 
      index === docIndex 
        ? { ...doc, tags: doc.tags.filter((_, i) => i !== tagIndex) }
        : doc
    ));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (documents.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    const uploadedDocs = [];

    try {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const formData = new FormData();
        formData.append('file', doc.file);
        formData.append('tags', JSON.stringify(doc.tags));

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setDocuments(prev => prev.map((d, index) => 
            index === i 
              ? { ...d, uploadProgress: Math.min((d.uploadProgress || 0) + 10, 90) }
              : d
          ));
        }, 100);

        try {
          const response = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formData,
          });

          clearInterval(progressInterval);

          if (response.ok) {
            const result = await response.json();
            uploadedDocs.push(result);
            
            setDocuments(prev => prev.map((d, index) => 
              index === i 
                ? { ...d, uploadProgress: 100 }
                : d
            ));
            
            toast.success(`Uploaded ${doc.file.name}`);
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          clearInterval(progressInterval);
          toast.error(`Failed to upload ${doc.file.name}`);
        }
      }

      onUploadComplete?.(uploadedDocs);
      setDocuments([]);
      
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full" data-tour="upload-btn">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Documents
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-4">
          <div
            className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOC, DOCX, TXT, MD files up to 10MB each
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Selected Documents ({documents.length})</h4>
            
            {documents.map((doc, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{doc.file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Preview */}
                  {doc.preview && (
                    <div className="p-3 bg-muted rounded text-sm">
                      <div className="flex items-center mb-2">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </div>
                      <p className="text-muted-foreground font-mono text-xs">
                        {doc.preview}
                      </p>
                    </div>
                  )}

                  {/* Tags Input */}
                  <div className="space-y-2">
                    <Label className="text-sm">Tags</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Enter tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(index, tagInput);
                            setTagInput("");
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          addTag(index, tagInput);
                          setTagInput("");
                        }}
                      >
                        <Tag className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Tag Display */}
                    {doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="text-xs cursor-pointer"
                            onClick={() => removeTag(index, tagIndex)}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {doc.uploadProgress !== undefined && doc.uploadProgress > 0 && (
                    <div className="space-y-1">
                      <Progress value={doc.uploadProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Uploading... {doc.uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {documents.length > 0 && (
          <Button
            onClick={uploadDocuments}
            disabled={isUploading}
            className="w-full"
            data-tour="train-btn"
          >
            {isUploading ? "Uploading..." : `Upload ${documents.length} Document${documents.length !== 1 ? 's' : ''}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
