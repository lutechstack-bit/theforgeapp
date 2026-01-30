

# Add KY Forms Button to Profile + Completed View Page

## Summary

Add a **"My KY Form"** quick access button on the Profile page (above Perks), and create a new **KY Form Summary page** that shows:
- Completed form data in a read-only view
- Edit button to re-open the form for modifications
- Works for all three cohort types (KYF, KYW, KYC)

---

## Current State

| Item | Status |
|------|--------|
| Profile page | Has PerksQuickAccess component at top |
| KY form data | Already fetched via `useProfileData` hook (`kyfResponse`, `kywResponse`) |
| VerifiedInfoCard | Shows partial KY data on Profile, but limited |
| Edit KY form | Users can navigate to form pages, but no "view completed" experience |

---

## Proposed Solution

### 1. New Quick Access Button: "My KY Form"

Add a new component similar to `PerksQuickAccess` that appears **above** the Perks button on the Profile page:

**Design:**
```
+------------------------------------------+
| [ClipboardCheck]  My KY Form             |
|   View your submitted form details    >  |
+------------------------------------------+
| [Gift]  My Perks & Acceptance            |
|   View your Forge Bag & benefits      >  |
+------------------------------------------+
```

**Behavior:**
- Always visible (regardless of completion status)
- If completed: Shows "View Details" → navigates to `/my-kyform`
- If not completed: Shows "Complete Now" → navigates to appropriate form page (`/kyf-form`, `/kyw-form`, `/kyc-form`)

---

### 2. New Page: My KY Form Summary (`/my-kyform`)

A dedicated page to view completed KY form data with an edit option.

**Layout:**
```
+------------------------------------------+
|  [←] My KY Form                  [Edit]  |
+------------------------------------------+
|                                          |
|  ✓ Form Submitted Successfully           |
|  Submitted on: Jan 15, 2026              |
|                                          |
+------------------------------------------+
|  General Details                         |
|  • Certificate Name: John Doe            |
|  • Occupation: Film Student              |
|  • Instagram: @johndoe                   |
+------------------------------------------+
|  Personal Details                        |
|  • Age: 24                               |
|  • DOB: March 15, 2001                   |
|  • Address: Line 1, Line 2, State PIN   |
+------------------------------------------+
|  ... more sections ...                   |
+------------------------------------------+
|                                          |
|  [Edit My Responses]                     |
|                                          |
+------------------------------------------+
```

**Features:**
- Read-only display of all submitted form fields
- Organized by sections matching the form steps
- Edit button navigates to the form page (which will load existing data)
- Shows completion status badge

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/profile/KYFormQuickAccess.tsx` | New quick access button for Profile page |
| `src/pages/MyKYForm.tsx` | New page to view completed KY form data |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Profile.tsx` | Add KYFormQuickAccess component above PerksQuickAccess |
| `src/App.tsx` | Add route for `/my-kyform` |

---

## Component: KYFormQuickAccess

```tsx
// src/components/profile/KYFormQuickAccess.tsx

interface Props {
  isCompleted: boolean;
  cohortType: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS' | null;
}

export const KYFormQuickAccess: React.FC<Props> = ({ isCompleted, cohortType }) => {
  const navigate = useNavigate();
  
  const getFormRoute = () => {
    switch (cohortType) {
      case 'FORGE_WRITING': return '/kyw-form';
      case 'FORGE_CREATORS': return '/kyc-form';
      default: return '/kyf-form';
    }
  };
  
  const getFormLabel = () => {
    switch (cohortType) {
      case 'FORGE_WRITING': return 'Know Your Writer';
      case 'FORGE_CREATORS': return 'Know Your Creator';
      default: return 'Know Your Filmmaker';
    }
  };
  
  const handleClick = () => {
    if (isCompleted) {
      navigate('/my-kyform');
    } else {
      navigate(getFormRoute());
    }
  };
  
  return (
    <button onClick={handleClick} className="w-full">
      <div className="relative flex items-center gap-3 p-4 rounded-xl 
                      bg-gradient-to-r from-primary/10 via-primary/5 to-transparent 
                      border border-primary/20 hover:border-primary/40 
                      transition-all group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 
                        flex items-center justify-center border border-primary/20">
          {isCompleted ? (
            <ClipboardCheck className="h-5 w-5 text-primary" />
          ) : (
            <ClipboardList className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h3 className="font-semibold text-foreground text-sm">
            {getFormLabel()}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isCompleted ? 'View your submitted details' : 'Complete your form to unlock access'}
          </p>
        </div>
        {!isCompleted && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75" />
            <span className="rounded-full h-2 w-2 bg-primary" />
          </span>
        )}
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all" />
      </div>
    </button>
  );
};
```

---

## Page: MyKYForm Summary

```tsx
// src/pages/MyKYForm.tsx

const MyKYForm: React.FC = () => {
  const navigate = useNavigate();
  const { profile, edition } = useAuth();
  const { data: profileData, isLoading } = useProfileData();
  
  const cohortType = edition?.cohort_type;
  const kyData = profileData?.kyfResponse || profileData?.kywResponse;
  const isFilmmaking = cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS';
  
  const getFormRoute = () => {
    switch (cohortType) {
      case 'FORGE_WRITING': return '/kyw-form';
      case 'FORGE_CREATORS': return '/kyc-form';
      default: return '/kyf-form';
    }
  };
  
  // Redirect if form not completed
  if (!profile?.ky_form_completed) {
    return <Navigate to={getFormRoute()} replace />;
  }
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">My KY Form</h1>
        </div>
        <Button variant="outline" onClick={() => navigate(getFormRoute())}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
      
      {/* Completion Status */}
      <div className="glass-card rounded-xl p-4 flex items-center gap-3">
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
          <SummaryRow label="Instagram" value={kyData?.instagram_id} />
        </SummarySection>
        
        {/* Personal Details */}
        <SummarySection title="Personal Details">
          <SummaryRow label="Age" value={kyData?.age} />
          <SummaryRow label="Date of Birth" value={kyData?.date_of_birth} />
          <SummaryRow label="Address" value={`${kyData?.address_line_1}, ${kyData?.state} ${kyData?.pincode}`} />
          <SummaryRow label="Gender" value={kyData?.gender} />
          <SummaryRow label="T-Shirt Size" value={kyData?.tshirt_size} />
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
          </SummarySection>
        )}
        
        {/* Preferences */}
        <SummarySection title="Preferences">
          <SummaryRow label="Chronotype" value={kyData?.chronotype} />
          <SummaryRow label="Meal Preference" value={kyData?.meal_preference} />
          <SummaryRow label="Food Allergies" value={kyData?.food_allergies} />
          <SummaryRow label="Languages" value={kyData?.languages_known?.join(', ')} />
        </SummarySection>
        
        {/* Understanding You */}
        <SummarySection title="About You">
          <SummaryRow label="MBTI Type" value={kyData?.mbti_type} />
          <SummaryRow label="Why Forge?" value={kyData?.forge_intent} />
          <SummaryRow label="Top 3 Movies" value={kyData?.top_3_movies?.join(', ')} />
        </SummarySection>
      </div>
      
      {/* Edit Button */}
      <Button 
        className="w-full gradient-primary text-primary-foreground"
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
  <div className="glass-card rounded-xl p-4">
    <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
};
```

---

## Profile.tsx Changes

```tsx
// Before PerksQuickAccess, add:

import { KYFormQuickAccess } from '@/components/profile/KYFormQuickAccess';

// In the return JSX, add above PerksQuickAccess:

{/* KY Form Quick Access */}
<KYFormQuickAccess 
  isCompleted={profile?.ky_form_completed || false}
  cohortType={profileData?.cohortType || null}
/>

{/* Perks Quick Access */}
<PerksQuickAccess />
```

---

## App.tsx Changes

```tsx
// Add import
import MyKYForm from "./pages/MyKYForm";

// Add route inside the AppLayout routes
<Route path="/my-kyform" element={<MyKYForm />} />
```

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/profile/KYFormQuickAccess.tsx` | **Create** | Quick access button for Profile page |
| `src/pages/MyKYForm.tsx` | **Create** | Read-only summary page with edit option |
| `src/pages/Profile.tsx` | **Modify** | Add KYFormQuickAccess above PerksQuickAccess |
| `src/App.tsx` | **Modify** | Add `/my-kyform` route |

---

## User Flow

### If KY Form is Completed:
1. User visits Profile
2. Sees "Know Your Filmmaker" button with checkmark icon
3. Clicks → navigates to `/my-kyform`
4. Views all submitted data in organized sections
5. Clicks "Edit" → navigates to form page with data pre-loaded

### If KY Form is NOT Completed:
1. User visits Profile
2. Sees "Know Your Filmmaker" button with pulsing badge
3. Clicks → navigates directly to form page (`/kyf-form`, etc.)
4. Completes form → sees completion celebration
5. Returns to Profile → now shows completed state

---

## Benefits

1. **Always Accessible** - Users can view their form data anytime from Profile
2. **Edit Capability** - Easy path to update responses if needed
3. **Clean Summary** - Organized, readable view of all submitted information
4. **Cohort-Aware** - Adapts labels and routing based on user's cohort type
5. **Consistent Design** - Matches existing quick access button styling

