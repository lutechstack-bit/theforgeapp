import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileVideo, Image, FileText, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: 'learn-videos' | 'learn-thumbnails' | 'learn-resources';
  onUploadComplete: (url: string, path: string) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  currentUrl?: string;
  label?: string;
  helperText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  onUploadComplete,
  accept = '*/*',
  maxSizeMB = 100,
  className,
  currentUrl,
  label = 'Upload File',
  helperText,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = () => {
    if (accept.includes('video')) return FileVideo;
    if (accept.includes('image')) return Image;
    return FileText;
  };

  const FileIcon = getFileIcon();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Start upload with progress tracking
      const startTime = Date.now();
      
      // Simulate progress for better UX (Supabase doesn't provide real progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      setProgress(100);

      // Get public URL for thumbnails, signed URL for videos/resources
      let url: string;
      if (bucket === 'learn-thumbnails') {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        url = urlData.publicUrl;
      } else {
        // For private buckets, we'll store the path and generate signed URLs on demand
        url = fileName;
      }

      setUploadedUrl(url);
      onUploadComplete(url, fileName);
      toast.success('File uploaded successfully');

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      toast.error('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setUploadedUrl(null);
    setProgress(0);
    onUploadComplete('', '');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Upload Area */}
      {!uploadedUrl && !uploading && (
        <div
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
            "hover:border-primary/50 hover:bg-primary/5",
            error ? "border-destructive/50 bg-destructive/5" : "border-border"
          )}
        >
          <FileIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">
            Click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            Max size: {maxSizeMB}MB
          </p>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="border rounded-xl p-4 bg-secondary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Uploading...</p>
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Uploaded State */}
      {uploadedUrl && !uploading && (
        <div className="border rounded-xl p-4 bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">File uploaded</p>
              <p className="text-xs text-muted-foreground truncate">
                {uploadedUrl.length > 50 ? `...${uploadedUrl.slice(-40)}` : uploadedUrl}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview for images */}
          {accept.includes('image') && uploadedUrl.startsWith('http') && (
            <div className="mt-3">
              <img
                src={uploadedUrl}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};