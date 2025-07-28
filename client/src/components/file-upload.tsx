import { useState, useCallback, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X, Upload, File, FileText, Image, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload?: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // في MB
  maxFiles?: number;
  multiple?: boolean;
}

interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

export function FileUpload({ 
  onUpload, 
  accept = "*", 
  maxSize = 10, 
  maxFiles = 5,
  multiple = true 
}: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const newFiles = fileArray.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);

    // محاكاة رفع الملفات
    newFiles.forEach(file => {
      simulateUpload(file);
    });

    if (onUpload) {
      onUpload(fileArray);
    }
  }, [onUpload]);

  const simulateUpload = (file: UploadFile) => {
    const interval = setInterval(() => {
      setUploadFiles(prev => prev.map(f => {
        if (f.id === file.id) {
          const newProgress = f.progress + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...f, progress: 100, status: 'success' };
          }
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    }
    if (['pdf', 'doc', 'docx'].includes(extension || '')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input 
          id="file-input"
          type="file"
          multiple={multiple}
          accept={accept === "*" ? undefined : accept}
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-lg mb-2">أفلت الملفات هنا...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">اسحب الملفات هنا أو انقر للاختيار</p>
            <p className="text-sm text-muted-foreground">
              الحد الأقصى: {maxSize} MB لكل ملف، {maxFiles} ملفات كحد أقصى
            </p>
          </div>
        )}
      </div>

      {uploadFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">الملفات المرفوعة:</h4>
          {uploadFiles.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                {getFileIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.status === 'uploading' && (
                  <div className="w-24">
                    <Progress value={file.progress} className="h-2" />
                  </div>
                )}
                
                {file.status === 'success' && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    مكتمل
                  </Badge>
                )}
                
                {file.status === 'error' && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    خطأ
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}