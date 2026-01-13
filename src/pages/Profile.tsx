import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UnlockModal } from '@/components/shared/UnlockModal';
import { KYFormReminderCard } from '@/components/onboarding/KYFormReminderCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Instagram, 
  Twitter, 
  Briefcase, 
  MapPin,
  LogOut,
  Edit2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const Profile: React.FC = () => {
  const { profile, user, signOut, refreshProfile, isFullAccess } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    instagram_handle: profile?.instagram_handle || '',
    twitter_handle: profile?.twitter_handle || '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    await refreshProfile();
    setIsEditing(false);
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved.',
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
    // Always navigate to auth page regardless of success/failure
    navigate('/auth');
  };

  const getPaymentStatusBadge = () => {
    if (profile?.payment_status === 'BALANCE_PAID') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Fully Onboarded</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Balance Pending</span>
      </div>
    );
  };

  return (
    <div className="container py-6">
      {/* KY Form Reminder */}
      <div className="mb-6">
        <KYFormReminderCard />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button variant="premium" size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-24 gradient-primary" />
        
        {/* Avatar & Info */}
        <div className="px-5 pb-5">
          <div className="-mt-12 mb-4">
            <div className="w-24 h-24 rounded-2xl bg-secondary border-4 border-card flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="bg-secondary/50 min-h-[80px] resize-none"
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {profile?.full_name || 'Anonymous Creator'}
              </h2>
              {profile?.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {getPaymentStatusBadge()}
                {profile?.specialty && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-medium">{profile.specialty}</span>
                  </div>
                )}
                {profile?.city && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">{profile.city}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="rounded-xl border border-border/50 bg-card p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Contact Information</h3>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-secondary/50"
                placeholder="+91 12345 67890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram_handle}
                onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                className="bg-secondary/50"
                placeholder="@handle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={formData.twitter_handle}
                onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                className="bg-secondary/50"
                placeholder="@handle"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{profile?.email || user?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.phone}</span>
              </div>
            )}
            {profile?.instagram_handle && (
              <div className="flex items-center gap-3 text-sm">
                <Instagram className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.instagram_handle}</span>
              </div>
            )}
            {profile?.twitter_handle && (
              <div className="flex items-center gap-3 text-sm">
                <Twitter className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{profile.twitter_handle}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unlock CTA for ₹15K users */}
      {!isFullAccess && (
        <div 
          onClick={() => setShowUnlockModal(true)}
          className="p-5 rounded-xl gradient-primary shadow-glow mb-6 cursor-pointer hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-foreground">Complete Your Onboarding</h3>
              <p className="text-sm text-primary-foreground/80">
                Pay your balance to unlock all premium features
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sign Out */}
      <Button
        variant="ghost"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>

      <UnlockModal
        open={showUnlockModal}
        onOpenChange={setShowUnlockModal}
      />
    </div>
  );
};

export default Profile;
