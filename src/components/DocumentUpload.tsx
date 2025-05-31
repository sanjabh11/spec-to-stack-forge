
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  domain: string;
  onUploadComplete: (documents: any[]) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  chunks?: number;
  embeddings?: number;
}

export const DocumentUpload = ({ domain, onUploadComplete }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      return 'Only PDF, TXT, DOCX, and MD files are supported';
    }
    
    return null;
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: `${file.name}: ${error}`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36),
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileRecord = newFiles[i];

        // Update status to uploading
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileRecord.id ? { ...f, status: 'uploading', progress: 25 } : f)
        );

        const formData = new FormData();
        formData.append('file', file);
        formData.append('domain', domain);

        const { data, error } = await supabase.functions.invoke('knowledge-base-ingest', {
          body: formData
        });

        if (error) throw error;

        // Update to processing
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileRecord.id ? { ...f, status: 'processing', progress: 50 } : f)
        );

        // Simulate processing progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => {
              if (f.id === fileRecord.id && f.progress < 90) {
                return { ...f, progress: f.progress + 5 };
              }
              return f;
            })
          );
        }, 300);

        // Complete after a delay (simulating processing)
        setTimeout(() => {
          clearInterval(progressInterval);
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileRecord.id ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              chunks: data.chunks,
              embeddings: data.embeddings
            } : f)
          );
        }, 2000);
      }

      toast({
        title: "Upload Complete",
        description: `Successfully processed ${validFiles.length} document(s) for ${domain}`,
      });

      onUploadComplete(newFiles);

    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // Mark files as errored
      newFiles.forEach(fileRecord => {
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileRecord.id ? { ...f, status: 'error', progress: 0 } : f)
        );
      });
      
      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to process documents',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'processing': 
      case 'uploading': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Document Upload - {domain}</span>
        </CardTitle>
        <CardDescription>
          Upload PDFs, text files, or documents to enhance the AI's knowledge base for your domain.
          Maximum file size: 10MB. Supported formats: PDF, TXT, DOCX, MD
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 scale-105' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              {isUploading ? (
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              ) : (
                <Upload className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {dragActive ? 'Drop files here!' : isUploading ? 'Processing documents...' : 'Drop files here or click to upload'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop multiple files or click to browse
              </p>
            </div>

            {!isUploading && (
              <div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.docx,.md"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </span>
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Uploaded Documents ({uploadedFiles.length})</h3>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(file.status)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                          {file.chunks && file.embeddings && (
                            <> • {file.chunks} chunks • {file.embeddings} embeddings</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={file.status === 'completed' ? 'default' : file.status === 'error' ? 'destructive' : 'outline'}
                      >
                        {file.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <div className="space-y-1">
                      <Progress value={file.progress} className="w-full h-2" />
                      <p className="text-xs text-gray-600">{file.progress}% complete</p>
                    </div>
                  )}
                  
                  {file.status === 'error' && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to process this file. Please try uploading again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📝 Tips for better results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload domain-specific documents (policies, guides, manuals)</li>
            <li>• Ensure documents are text-readable (not scanned images)</li>
            <li>• Multiple smaller files work better than one large file</li>
            <li>• Documents will be chunked and embedded for RAG search</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
