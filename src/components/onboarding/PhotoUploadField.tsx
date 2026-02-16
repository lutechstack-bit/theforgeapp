import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: string;
  required?: boolean;
  description?: string;
}

export const PhotoUploadField: React.FC<PhotoUploadFieldProps> = ({
  label,
  value,
  onChange,
  folder,
  required = false,
  description,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {value ? (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-forge-gold/30 ring-2 ring-forge-gold/10">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'w-32 h-32 rounded-xl border-2 border-dashed bg-card/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 transition-all',
            'border-border hover:border-forge-gold/50',
            uploading && 'opacity-60'
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-forge-gold animate-spin" />
          ) : (
            <>
              <Image className="h-6 w-6 text-forge-gold/60" />
              <span className="text-xs text-muted-foreground">Upload</span>
            </>
          )}
        </button>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};
