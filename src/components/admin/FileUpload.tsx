import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileVideo, Image, FileText, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: 'learn-videos' | 'learn-thumbnails' | 'learn-resources';
  onUploadComplete: (url: string, path: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onDurationDetected?: (durationMinutes: number) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  currentUrl?: string;
  label?: string;
  helperText?: string;
}

interface UploadStats {
  bytesUploaded: number;
  totalBytes: number;
  startTime: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  onUploadComplete,
  onUploadingChange,
  onDurationDetected,
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
  const [detectedDuration, setDetectedDuration] = useState<number | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getFileIcon = () => {
    if (accept.includes('video')) return FileVideo;
    if (accept.includes('image')) return Image;
    return FileText;
  };

  const FileIcon = getFileIcon();

  // Use XMLHttpRequest for real progress tracking with user's session token
  const uploadWithProgress = async (
    file: File,
    uploadFileName: string
  ): Promise<{ data: any; error: any }> => {
    // Get the current user's session token for proper RLS authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { data: null, error: { message: 'You must be logged in to upload files' } };
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      abortControllerRef.current = new AbortController();

      const startTime = Date.now();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          const elapsedTime = (Date.now() - startTime) / 1000; // seconds
          const speed = event.loaded / elapsedTime; // bytes per second
          const remainingBytes = event.total - event.loaded;
          const estimatedTimeRemaining = remainingBytes / speed;

          setProgress(percentComplete);
          setUploadStats({
            bytesUploaded: event.loaded,
            totalBytes: event.total,
            startTime,
            speed,
            estimatedTimeRemaining: isFinite(estimatedTimeRemaining) ? estimatedTimeRemaining : 0,
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ data: { path: uploadFileName }, error: null });
        } else {
          let errorMessage = 'Upload failed';
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.message || response.error || errorMessage;
          } catch {
            errorMessage = xhr.statusText || errorMessage;
          }
          resolve({ data: null, error: { message: errorMessage } });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({ data: null, error: { message: 'Network error during upload' } });
      });

      xhr.addEventListener('abort', () => {
        resolve({ data: null, error: { message: 'Upload cancelled' } });
      });

      // Use the user's session access token (not the anon key) for proper RLS authentication
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      xhr.open('POST', `${supabaseUrl}/storage/v1/object/${bucket}/${uploadFileName}`);
      xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
      xhr.setRequestHeader('x-upsert', 'false');
      
      xhr.send(file);
    });
  };

  // Extract video duration from file
  const extractVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const durationMinutes = Math.ceil(video.duration / 60);
        resolve(durationMinutes);
      };
      
      video.onerror = () => {
        resolve(0);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

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

    // Extract duration for video files
    if (file.type.startsWith('video/') && onDurationDetected) {
      const duration = await extractVideoDuration(file);
      if (duration > 0) {
        setDetectedDuration(duration);
        onDurationDetected(duration);
      }
    }

    setError(null);
    setUploading(true);
    setFileName(file.name);
    onUploadingChange?.(true);
    setProgress(0);
    setUploadStats({
      bytesUploaded: 0,
      totalBytes: file.size,
      startTime: Date.now(),
      speed: 0,
      estimatedTimeRemaining: 0,
    });

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const uploadFileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload with real progress tracking
      const { data, error: uploadError } = await uploadWithProgress(file, uploadFileName);

      if (uploadError) {
        throw uploadError;
      }

      setProgress(100);

      // Get public URL for thumbnails, signed URL for videos/resources
      let url: string;
      if (bucket === 'learn-thumbnails') {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadFileName);
        url = urlData.publicUrl;
      } else {
        // For private buckets, we'll store the path and generate signed URLs on demand
        url = uploadFileName;
      }

      setUploadedUrl(url);
      onUploadComplete(url, uploadFileName);
      toast.success('File uploaded successfully');

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      toast.error('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
      setUploadStats(null);
      onUploadingChange?.(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRemove = () => {
    setUploadedUrl(null);
    setProgress(0);
    setFileName('');
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

      {/* Uploading State with detailed stats */}
      {uploading && uploadStats && (
        <div className="border rounded-xl p-4 bg-secondary/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {fileName || 'Uploading...'}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(uploadStats.bytesUploaded)} / {formatBytes(uploadStats.totalBytes)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCancelUpload}
              className="shrink-0"
              title="Cancel upload"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Progress value={progress} className="h-2 mb-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress}% complete</span>
            <div className="flex items-center gap-3">
              {uploadStats.speed > 0 && (
                <span>{formatBytes(uploadStats.speed)}/s</span>
              )}
              {uploadStats.estimatedTimeRemaining > 0 && progress < 100 && (
                <span>~{formatTime(uploadStats.estimatedTimeRemaining)} remaining</span>
              )}
            </div>
          </div>
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
