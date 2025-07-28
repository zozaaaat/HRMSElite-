import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // بالميجابايت
  maxFiles?: number;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export function FileUpload({
  onUpload,
  accept = "*",
  multiple = true,
  maxSize = 10,
  maxFiles = 5
}: FileUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    // التحقق من الحجم
    if (file.size > maxSize * 1024 * 1024) {
      return `حجم الملف يتجاوز ${maxSize} ميجابايت`;
    }
    
    // التحقق من النوع إذا كان محدد
    if (accept !== "*") {
      const acceptedTypes = accept.split(",").map(t => t.trim());
      const fileType = file.type || "";
      const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith(".")) {
          return fileExt === type.toLowerCase();
        }
        return fileType.match(new RegExp(type.replace("*", ".*")));
      });
      
      if (!isAccepted) {
        return "نوع الملف غير مدعوم";
      }
    }
    
    return null;
  };

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    
    // التحقق من عدد الملفات
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "تجاوز عدد الملفات المسموح",
        description: `الحد الأقصى ${maxFiles} ملفات`,
        variant: "destructive"
      });
      return;
    }
    
    const newFiles: UploadedFile[] = [];
    const validFiles: File[] = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newFiles.push({
          file,
          progress: 0,
          status: "error",
          error
        });
      } else {
        newFiles.push({
          file,
          progress: 0,
          status: "uploading"
        });
        validFiles.push(file);
      }
    });
    
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    
    // محاكاة رفع الملفات
    validFiles.forEach((file, index) => {
      const fileIndex = uploadedFiles.length + index;
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += 10;
        
        setUploadedFiles(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex].progress = progress;
            
            if (progress >= 100) {
              updated[fileIndex].status = "success";
              clearInterval(interval);
            }
          }
          return updated;
        });
      }, 200);
    });
    
    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    processFiles(e.dataTransfer.files);
  }, [uploadedFiles.length]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    } else if (file.type.includes("pdf") || file.type.includes("document")) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              اسحب الملفات هنا أو انقر للاختيار
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              الحد الأقصى {maxSize} ميجابايت لكل ملف
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                اختر الملفات
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الملفات المرفوعة */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(item.file)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>
                    
                    {item.status === "uploading" && (
                      <Progress value={item.progress} className="h-1" />
                    )}
                    
                    {item.status === "error" && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {item.error}
                      </p>
                    )}
                    
                    {item.status === "success" && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        تم الرفع بنجاح
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}