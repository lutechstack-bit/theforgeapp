import React, { useState, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingTextarea } from '@/components/ui/floating-textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Loader2, User } from 'lucide-react';
import { ImageCropperModal } from './ImageCropperModal';
import { readFileAsDataURL } from '@/lib/cropImage';

interface ProfileEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  onSaved: () => void;
  scrollToSection?: string | null;
}

export const ProfileEditSheet: React.FC<ProfileEditSheetProps> = ({
  open,
  onOpenChange,
  profile,
  onSaved,
  scrollToSection,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoSectionRef = useRef<HTMLDivElement>(null);
  const instagramSectionRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');

  React.useEffect(() => {
    if (open && scrollToSection) {
      const timer = setTimeout(() => {
        const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
          photo: photoSectionRef,
          instagram: instagramSectionRef,
        };
        const targetRef = refMap[scrollToSection];
        if (targetRef?.current) {
          targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetRef.current.classList.add('highlight-pulse');
          setTimeout(() => targetRef.current?.classList.remove('highlight-pulse'), 2000);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, scrollToSection]);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    tagline: profile?.tagline || '',
    city: profile?.city || '',
    specialty: profile?.specialty || '',
    instagram_handle: profile?.instagram_handle || '',
    twitter_handle: profile?.twitter_handle || '',
    phone: profile?.phone || '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        tagline: profile.tagline || '',
        city: profile.city || '',
        specialty: profile.specialty || '',
        instagram_handle: profile.instagram_handle || '',
        twitter_handle: profile.twitter_handle || '',
        phone: profile.phone || '',
      });
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Please select an image under 10MB.', variant: 'destructive' });
      return;
    }

    try {
      const dataUrl = await readFileAsDataURL(file);
      setImageToCrop(dataUrl);
      setCropperOpen(true);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({ title: 'Error', description: 'Failed to read image file.', variant: 'destructive' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!user?.id) return;

    setUploadingAvatar(true);

    try {
      const file = new File([croppedBlob], 'avatar.webp', { type: 'image/webp' });
      const filePath = `${user.id}/avatar.webp`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      toast({ title: 'Photo Updated', description: 'Your profile photo has been updated.' });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({ title: 'Upload Failed', description: 'Failed to upload photo. Please try again.', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
    onSaved();
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Avatar Upload Section */}
            <div ref={photoSectionRef} className="flex flex-col items-center gap-4 transition-all duration-500 rounded-lg p-2 -m-2">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary/30">
                  <AvatarImage src={avatarUrl} alt={formData.full_name} />
                  <AvatarFallback className="bg-secondary text-muted-foreground">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="text-xs"
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Camera className="h-3 w-3 mr-1" />
                    Change Photo
                  </>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Basic Info
              </h3>
              
              <FloatingInput
                id="full_name"
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />

              <FloatingInput
                id="tagline"
                label="Tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />

              <FloatingInput
                id="specialty"
                label="Role / Specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />

              <FloatingInput
                id="city"
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />

              <FloatingTextarea
                id="bio"
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Contact Info
              </h3>
              
              <FloatingInput
                id="phone"
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div ref={instagramSectionRef} className="transition-all duration-500 rounded-lg p-2 -m-2">
                <FloatingInput
                  id="instagram"
                  label="Instagram Handle"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                />
              </div>

              <FloatingInput
                id="twitter"
                label="Twitter Handle"
                value={formData.twitter_handle}
                onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ImageCropperModal
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        cropShape="round"
      />
    </>
  );
};
