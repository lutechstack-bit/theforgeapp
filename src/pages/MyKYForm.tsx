import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const MyKYForm: React.FC = () => {
  const navigate = useNavigate();
  const { profile, edition } = useAuth();
  const { data: profileData, isLoading } = useProfileData();
  
  const cohortType = edition?.cohort_type;
  const kyData = profileData?.kyfResponse || profileData?.kywResponse;
  const isFilmmaking = cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS';
  const isWriting = cohortType === 'FORGE_WRITING';
  
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">{getFormTitle()}</h1>
        </div>
        <Button variant="outline" onClick={() => navigate(getFormRoute())}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
      
      {/* Completion Status */}
      <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-green-500/20 bg-green-500/5">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <p className="font-medium text-foreground">Form Submitted Successfully</p>
          <p className="text-xs text-muted-foreground">
            {kyData?.terms_accepted_at 
              ? `Submitted on ${format(new Date(kyData.terms_accepted_at), 'MMM d, yyyy')}`
              : 'Your responses are saved'}
          </p>
        </div>
      </div>
      
      {/* Form Data Sections */}
      <div className="space-y-4">
        {/* General Details */}
        <SummarySection title="General Details">
          <SummaryRow label="Certificate Name" value={kyData?.certificate_name} />
          <SummaryRow label="Current Occupation" value={kyData?.current_occupation} />
          <SummaryRow label="Email" value={kyData?.email} />
          <SummaryRow label="WhatsApp" value={kyData?.whatsapp_number} />
          <SummaryRow label="Instagram" value={kyData?.instagram_id} />
        </SummarySection>
        
        {/* Personal Details */}
        <SummarySection title="Personal Details">
          <SummaryRow label="Age" value={kyData?.age} />
          <SummaryRow label="Date of Birth" value={kyData?.date_of_birth} />
          {isFilmmaking && (
            <>
              <SummaryRow label="Gender" value={kyData?.gender} />
              <SummaryRow label="Height" value={kyData?.height_ft} />
              <SummaryRow label="T-Shirt Size" value={kyData?.tshirt_size} />
            </>
          )}
          <SummaryRow label="City" value={kyData?.city} />
          <SummaryRow label="State" value={kyData?.state} />
          {isFilmmaking && (
            <>
              <SummaryRow label="Address" value={kyData?.address_line_1} />
              <SummaryRow label="Pincode" value={kyData?.pincode} />
            </>
          )}
        </SummarySection>
        
        {/* Emergency Contact */}
        <SummarySection title="Emergency Contact">
          <SummaryRow label="Name" value={kyData?.emergency_contact_name} />
          <SummaryRow label="Phone" value={kyData?.emergency_contact_number} />
        </SummarySection>
        
        {/* Skills (for filmmakers) */}
        {isFilmmaking && (
          <SummarySection title="Skills & Proficiency">
            <SummaryRow label="Screenwriting" value={kyData?.proficiency_screenwriting} />
            <SummaryRow label="Direction" value={kyData?.proficiency_direction} />
            <SummaryRow label="Cinematography" value={kyData?.proficiency_cinematography} />
            <SummaryRow label="Editing" value={kyData?.proficiency_editing} />
            <SummaryRow label="Has Editing Laptop" value={kyData?.has_editing_laptop ? 'Yes' : 'No'} />
          </SummarySection>
        )}
        
        {/* Skills (for writers) */}
        {isWriting && (
          <SummarySection title="Skills & Proficiency">
            <SummaryRow label="Writing" value={kyData?.proficiency_writing} />
            <SummaryRow label="Story & Voice" value={kyData?.proficiency_story_voice} />
            <SummaryRow label="Primary Language" value={kyData?.primary_language} />
            <SummaryRow label="Writing Types" value={kyData?.writing_types?.join(', ')} />
          </SummarySection>
        )}
        
        {/* Preferences */}
        <SummarySection title="Preferences">
          <SummaryRow label="Chronotype" value={kyData?.chronotype} />
          {isFilmmaking && (
            <>
              <SummaryRow label="Meal Preference" value={kyData?.meal_preference} />
              <SummaryRow label="Food Allergies" value={kyData?.food_allergies} />
              <SummaryRow label="Medication Support" value={kyData?.medication_support} />
              <SummaryRow label="Languages Known" value={kyData?.languages_known?.join(', ')} />
            </>
          )}
        </SummarySection>
        
        {/* About You */}
        <SummarySection title="About You">
          <SummaryRow label="MBTI Type" value={kyData?.mbti_type} />
          <SummaryRow label="Why Forge?" value={kyData?.forge_intent} />
          {kyData?.forge_intent_other && (
            <SummaryRow label="Other Intent" value={kyData?.forge_intent_other} />
          )}
          {isFilmmaking && (
            <SummaryRow label="Top 3 Movies" value={kyData?.top_3_movies?.join(', ')} />
          )}
          {isWriting && (
            <SummaryRow label="Top 3 Writers/Books" value={kyData?.top_3_writers_books?.join(', ')} />
          )}
        </SummarySection>
      </div>
      
      {/* Edit Button */}
      <Button 
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => navigate(getFormRoute())}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit My Responses
      </Button>
    </div>
  );
};

// Helper Components
const SummarySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="glass-card rounded-xl p-4 border border-border/50">
    <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
};

export default MyKYForm;
