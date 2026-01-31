import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft, Edit, User, UserCircle, Phone, 
  Target, Settings, Heart, Film, Brain, Clock, MapPin, 
  Instagram, Mail, Calendar, Ruler, Shirt, Utensils, Languages
} from 'lucide-react';
import { format } from 'date-fns';
import forgeIcon from '@/assets/forge-icon.png';

const MyKYForm: React.FC = () => {
  const navigate = useNavigate();
  const { profile, edition } = useAuth();
  const { data: profileData, isLoading } = useProfileData();
  
  const cohortType = edition?.cohort_type;
  const kyData = profileData?.kyfResponse || profileData?.kywResponse || profileData?.kycResponse;
  const isFilmmaking = cohortType === 'FORGE';
  const isWriting = cohortType === 'FORGE_WRITING';
  const isCreator = cohortType === 'FORGE_CREATORS';
  
  const getFormRoute = () => {
    switch (cohortType) {
      case 'FORGE_WRITING': return '/kyw-form';
      case 'FORGE_CREATORS': return '/kyc-form';
      default: return '/kyf-form';
    }
  };
  
  const getFormTitle = () => {
    switch (cohortType) {
      case 'FORGE_WRITING': return 'Know Your Writer';
      case 'FORGE_CREATORS': return 'Know Your Creator';
      default: return 'Know Your Filmmaker';
    }
  };

  const getCohortLabel = () => {
    switch (cohortType) {
      case 'FORGE_WRITING': return 'Writer';
      case 'FORGE_CREATORS': return 'Creator';
      default: return 'Filmmaker';
    }
  };

  const getInitials = () => {
    const name = kyData?.certificate_name || profile?.full_name || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  // Redirect if form not completed
  if (!profile?.ky_form_completed) {
    return <Navigate to={getFormRoute()} replace />;
  }

  return (
    <div className="min-h-screen pb-32 md:pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-4 pb-8">
        {/* Glow Orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-48 h-48 bg-accent/15 rounded-full blur-2xl pointer-events-none" />
        
        {/* Back Button */}
        <div className="relative z-10 px-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </div>
        
        {/* Forge Logo & Title */}
        <div className="relative z-10 text-center px-4">
          {/* Forge Logo with Subtle Glow */}
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div 
              className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" 
              style={{ animationDuration: '3s' }} 
            />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
              <img src={forgeIcon} alt="Forge" className="w-10 h-10 object-contain" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-1">
            {getFormTitle()}
          </h1>
          
          {/* Cohort Badge - No Emoji */}
          <Badge className="bg-primary/20 text-primary border-primary/30 text-sm mt-2">
            {getCohortLabel()}
          </Badge>
          
          <p className="text-sm text-muted-foreground mt-2">
            {kyData?.terms_accepted_at 
              ? `Submitted on ${format(new Date(kyData.terms_accepted_at), 'MMMM d, yyyy')}`
              : 'Your responses are saved'}
          </p>
        </div>
        
        {/* User Card */}
        <div className="relative z-10 mx-4 mt-6">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-primary/20 shadow-[0_0_30px_rgba(255,188,59,0.1)]">
            <Avatar className="w-14 h-14 border-2 border-primary/30">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-foreground truncate">
                {kyData?.certificate_name || profile?.full_name}
              </h2>
              {kyData?.instagram_id && (
                <p className="text-sm text-primary flex items-center gap-1">
                  <Instagram className="w-3 h-3" />
                  @{kyData.instagram_id.replace('@', '')}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(getFormRoute())}
              className="shrink-0 border-primary/30 hover:bg-primary/10"
            >
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* Skills Section - Visual Bars (for filmmakers) */}
        {isFilmmaking && (
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Skills & Proficiency</h3>
            </div>
            <div className="space-y-4">
              <ProficiencyBar skill="Screenwriting" level={kyData?.proficiency_screenwriting} />
              <ProficiencyBar skill="Direction" level={kyData?.proficiency_direction} />
              <ProficiencyBar skill="Cinematography" level={kyData?.proficiency_cinematography} />
              <ProficiencyBar skill="Editing" level={kyData?.proficiency_editing} />
              {kyData?.has_editing_laptop !== undefined && (
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">Has Editing Laptop</span>
                  <Badge variant={kyData.has_editing_laptop ? 'default' : 'outline'} className="text-xs">
                    {kyData.has_editing_laptop ? '✓ Yes' : 'No'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills Section - Visual Bars (for writers) */}
        {isWriting && (
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Skills & Proficiency</h3>
            </div>
            <div className="space-y-4">
              <ProficiencyBar skill="Writing" level={kyData?.proficiency_writing} />
              <ProficiencyBar skill="Story & Voice" level={kyData?.proficiency_story_voice} />
              {kyData?.primary_language && (
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">Primary Language</span>
                  <Badge variant="outline" className="text-xs">{kyData.primary_language}</Badge>
                </div>
              )}
              {kyData?.writing_types && kyData.writing_types.length > 0 && (
                <div className="pt-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground block mb-2">Writing Types</span>
                  <div className="flex flex-wrap gap-2">
                    {kyData.writing_types.map((type: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-primary/5">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills Section - Visual Bars (for creators) */}
        {isCreator && (
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Skills & Proficiency</h3>
            </div>
            <div className="space-y-4">
              <ProficiencyBar skill="Content Creation" level={kyData?.proficiency_content_creation} />
              <ProficiencyBar skill="Storytelling" level={kyData?.proficiency_storytelling} />
              <ProficiencyBar skill="Video Production" level={kyData?.proficiency_video_production} />
              {kyData?.primary_platform && (
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">Primary Platform</span>
                  <Badge variant="outline" className="text-xs">{kyData.primary_platform}</Badge>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Accordion Sections */}
        <Accordion 
          type="multiple" 
          defaultValue={['general', 'personal', 'emergency', 'preferences']} 
          className="space-y-3"
        >
          {/* General Details */}
          <AccordionItem value="general" className="glass-card rounded-xl border-border/50 overflow-hidden">
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-white/5 [&[data-state=open]]:bg-white/5">
              <span className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">General Details</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <DataRow icon={<User className="w-4 h-4" />} label="Certificate Name" value={kyData?.certificate_name} />
                <DataRow icon={<Target className="w-4 h-4" />} label="Current Occupation" value={kyData?.current_occupation} />
                <DataRow icon={<Mail className="w-4 h-4" />} label="Email" value={kyData?.email} />
                <DataRow icon={<Phone className="w-4 h-4" />} label="WhatsApp" value={kyData?.whatsapp_number} />
                <DataRow icon={<Instagram className="w-4 h-4" />} label="Instagram" value={kyData?.instagram_id} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Personal Details */}
          <AccordionItem value="personal" className="glass-card rounded-xl border-border/50 overflow-hidden">
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-white/5 [&[data-state=open]]:bg-white/5">
              <span className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Personal Details</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <DataRow icon={<Calendar className="w-4 h-4" />} label="Age" value={kyData?.age} />
                <DataRow icon={<Calendar className="w-4 h-4" />} label="Date of Birth" value={kyData?.date_of_birth} />
                {isFilmmaking && (
                  <>
                    <DataRow icon={<User className="w-4 h-4" />} label="Gender" value={kyData?.gender} />
                    <DataRow icon={<Ruler className="w-4 h-4" />} label="Height" value={kyData?.height_ft} />
                    <DataRow icon={<Shirt className="w-4 h-4" />} label="T-Shirt Size" value={kyData?.tshirt_size} />
                  </>
                )}
                <DataRow icon={<MapPin className="w-4 h-4" />} label="City" value={kyData?.city} />
                <DataRow icon={<MapPin className="w-4 h-4" />} label="State" value={kyData?.state} />
                {isFilmmaking && (
                  <>
                    <DataRow icon={<MapPin className="w-4 h-4" />} label="Address" value={kyData?.address_line_1} />
                    <DataRow icon={<MapPin className="w-4 h-4" />} label="Pincode" value={kyData?.pincode} />
                  </>
                )}
                {isCreator && kyData?.country && (
                  <DataRow icon={<MapPin className="w-4 h-4" />} label="Country" value={kyData?.country} />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Emergency Contact */}
          <AccordionItem value="emergency" className="glass-card rounded-xl border-border/50 overflow-hidden">
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-white/5 [&[data-state=open]]:bg-white/5">
              <span className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-red-500" />
                </div>
                <span className="font-semibold text-foreground">Emergency Contact</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <DataRow icon={<User className="w-4 h-4" />} label="Name" value={kyData?.emergency_contact_name} />
                <DataRow icon={<Phone className="w-4 h-4" />} label="Phone" value={kyData?.emergency_contact_number} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Preferences */}
          <AccordionItem value="preferences" className="glass-card rounded-xl border-border/50 overflow-hidden">
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-white/5 [&[data-state=open]]:bg-white/5">
              <span className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Preferences</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <DataRow icon={<Clock className="w-4 h-4" />} label="Chronotype" value={kyData?.chronotype} />
                {(isFilmmaking || isCreator) && (
                  <DataRow icon={<Utensils className="w-4 h-4" />} label="Meal Preference" value={kyData?.meal_preference} />
                )}
                {isFilmmaking && (
                  <>
                    <DataRow icon={<Utensils className="w-4 h-4" />} label="Food Allergies" value={kyData?.food_allergies} />
                    <DataRow icon={<Heart className="w-4 h-4" />} label="Medication Support" value={kyData?.medication_support} />
                    {kyData?.languages_known && kyData.languages_known.length > 0 && (
                      <div className="pt-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                          <Languages className="w-4 h-4" />
                          Languages Known
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {kyData.languages_known.map((lang: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-primary/5">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Featured Cards: MBTI + Chronotype */}
        {(kyData?.mbti_type || kyData?.chronotype) && (
          <div className="grid grid-cols-2 gap-3">
            {kyData?.mbti_type && (
              <div className="glass-card rounded-xl p-4 text-center border border-border/50 hover:border-primary/30 transition-colors">
                <Brain className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">MBTI Type</p>
                <p className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {kyData.mbti_type}
                </p>
              </div>
            )}
            {kyData?.chronotype && (
              <div className="glass-card rounded-xl p-4 text-center border border-border/50 hover:border-primary/30 transition-colors">
                <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Chronotype</p>
                <p className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {kyData.chronotype}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Top 3 Movies/Books/Creators */}
        {(kyData?.top_3_movies || kyData?.top_3_writers_books || kyData?.top_3_creators) && (
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                Your Top 3 {isFilmmaking ? 'Movies' : isWriting ? 'Writers/Books' : 'Creators'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(kyData?.top_3_movies || kyData?.top_3_writers_books || kyData?.top_3_creators)?.map((item: string, idx: number) => (
                <Badge 
                  key={idx} 
                  className="bg-primary/10 text-primary border-primary/30 px-3 py-1.5 text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  {idx + 1}. {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Forge Intent */}
        {kyData?.forge_intent && (
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Why Forge?</h3>
            </div>
            <p className="text-sm text-muted-foreground">{kyData.forge_intent}</p>
            {kyData.forge_intent_other && (
              <p className="text-sm text-foreground mt-2 italic">"{kyData.forge_intent_other}"</p>
            )}
          </div>
        )}
      </div>
      
      {/* Floating Edit Button */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 z-50">
        <div className="max-w-2xl mx-auto">
          <Button 
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-accent 
                       text-primary-foreground shadow-[0_0_30px_rgba(255,188,59,0.3)] 
                       hover:shadow-[0_0_40px_rgba(255,188,59,0.5)] transition-all duration-300
                       rounded-xl border border-primary/30"
            onClick={() => navigate(getFormRoute())}
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit My Responses
          </Button>
        </div>
      </div>
    </div>
  );
};

// Proficiency Bar Component
const ProficiencyBar: React.FC<{ skill: string; level: string | null }> = ({ skill, level }) => {
  if (!level) return null;
  
  const getPercentage = () => {
    switch (level.toLowerCase()) {
      case 'beginner': return 33;
      case 'intermediate': return 66;
      case 'advanced': return 100;
      default: return 0;
    }
  };
  
  const getColorClass = () => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'from-blue-500 to-blue-400';
      case 'intermediate': return 'from-primary to-accent';
      case 'advanced': return 'from-emerald-500 to-emerald-400';
      default: return 'from-muted to-muted-foreground';
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{skill}</span>
        <Badge variant="outline" className="text-xs capitalize">{level}</Badge>
      </div>
      <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${getColorClass()} transition-all duration-1000 ease-out`}
          style={{ width: `${getPercentage()}%` }}
        />
      </div>
    </div>
  );
};

// Data Row Component
const DataRow: React.FC<{ icon?: React.ReactNode; label: string; value: any }> = ({ icon, label, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {icon && <span className="text-primary/60">{icon}</span>}
        {label}
      </span>
      <span className="text-sm font-medium text-foreground text-right max-w-[55%] break-words">
        {value}
      </span>
    </div>
  );
};

export default MyKYForm;
