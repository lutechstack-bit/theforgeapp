
# Complete KY Form Overhaul: Intro Card, Mandatory Access, Enhanced Steps, Terms Accordion, and Placeholder Texts

## Overview

This plan implements all requested changes to the KY Forms:

1. **Intro Card (Step 0)** - Welcome card with form purpose, time estimate (5-10 mins), and requirement notice
2. **Mandatory Enforcement** - Route guard to block app access until KY Form is completed
3. **Age Auto-Calculation** - Remove age input, calculate from DOB and display as read-only
4. **Casting Call Enhancements (KYFForm)** - Add descriptive subtitle and cap height input at 10
5. **Understanding You Enhancements** - Add info callout explaining the 16 personalities test
6. **Inline Terms Accordion** - Replace modal with expandable accordion showing full terms text
7. **Placeholder Texts** - Add helpful placeholder text to all text input fields

---

## Part 1: Intro Card (Step 0) - All Three Forms

Add a new "Introduction" step as the first card in all KY Forms.

**Card Content:**
- **Title**: "Know Your Filmmaker/Writer/Creator" (cohort-specific)
- **Description**: "This provides basic information about yourself that we at Forge can use to ensure the best experience during Forge."
- **Time estimate**: "Please ensure that you have about 5-10 mins to fill this form"
- **Requirement notice**: "You will need to complete this form to access the Forge app"
- **Button**: "Get Started"

---

## Part 2: Mandatory Enforcement (Route Guard)

Add a `KYFormCheck` wrapper component in `App.tsx` that redirects users to `/kyf` if `ky_form_completed` is false.

```tsx
const KYFormCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // If profile setup is done but KY form is NOT complete, redirect to form
  if (profile?.profile_setup_completed && !profile?.ky_form_completed) {
    return <Navigate to="/kyf" replace />;
  }
  
  return <>{children}</>;
};
```

This wraps all main AppLayout routes.

---

## Part 3: Age Auto-Calculation

Remove the separate "Your Age" input field. Instead:
- Keep only Date of Birth field (required)
- Calculate age from DOB and display as read-only

---

## Part 4: Casting Call Enhancements (KYFForm Only)

**Descriptive subtitle:**
> "At Forge we will be dividing the cohort into groups to cast all of you as actors in other's short films. We will need a bit of information to make a casting sheet. Experience how it is on the other side of the camera now."

**Height input cap:**
- Add `max="10"` attribute
- JavaScript validation to prevent values > 10
- Helper text: "Maximum: 10 ft"

---

## Part 5: Understanding You Info Callout (All Forms)

Add an informational callout explaining the personality test:

> **What is the personality test?**
> This 16 personalities test combines Myers-Briggs Type Indicator (MBTI) concepts with Big Five personality traits to classify individuals into 16 distinct types.

---

## Part 6: Inline Terms Accordion (All Forms)

Replace the current modal-based Terms and Conditions with an inline expandable accordion:
- Use Radix `Collapsible` component
- "terms and conditions" link that expands/collapses content
- Chevron icon that rotates 180 degrees when expanded
- Full terms text appears inline when expanded
- Checkbox for agreement stays the same

---

## Part 7: Placeholder Texts for All Input Fields (NEW)

Based on the design reference, add placeholder texts to ALL text input and textarea fields across all forms for better user guidance.

### KYFForm Placeholder Texts

| Step | Field | Placeholder |
|------|-------|-------------|
| General Details | Full name | "e.g. Arjun Sharma" |
| General Details | Current occupation | "e.g. Student, Working Professional" (already exists) |
| General Details | Instagram ID | "@yourhandle" (already exists) |
| Personal Details | Address Line 1 | "e.g. 123, Main Street" |
| Personal Details | Address Line 2 | "e.g. Apt 4B, Near Park" |
| Personal Details | State | "e.g. Karnataka" |
| Personal Details | Pincode | "e.g. 560001" |
| Preferences | T-shirt size | "S / M / L / XL / XXL" (already exists) |
| Preferences | Emergency contact name | "e.g. Parent or Guardian name" |
| Preferences | Emergency contact number | "e.g. +91 9876543210" |
| Personality | Top 3 movies | "Separate with commas" (already exists) |
| Personality | Food allergies | "Please let us know" (already exists) |
| Personality | Medication support | "Please let us know" |
| Casting Call | Height | "e.g. 5'8" (already exists) |
| Understanding You | Intent other | "Please describe your intent" |

### KYWForm Placeholder Texts

| Step | Field | Placeholder |
|------|-------|-------------|
| General Details | Full name | "e.g. Arjun Sharma" |
| General Details | Current occupation | "e.g. Student, Working Professional" |
| Personal Details | Age | "e.g. 25" |
| Personal Details | Primary language | "e.g. English, Hindi" |
| Writing Practice | Emergency contact name | "e.g. Parent or Guardian name" |
| Writing Practice | Emergency contact number | "e.g. +91 9876543210" |
| Personality | Top 3 writers/books | "Separate with commas" (already exists) |
| Intent | Intent other | "Please describe your intent" |

### KYCForm Placeholder Texts

| Step | Field | Placeholder |
|------|-------|-------------|
| General Details | Full name | "e.g. Arjun Sharma" |
| General Details | Instagram ID | "e.g. @yourhandle" |
| Personal Details | State | "e.g. Karnataka" |
| Personal Details | Country | "e.g. India" |
| Creator Setup | Emergency contact name | "e.g. Parent or Guardian name" |
| Creator Setup | Emergency contact number | "e.g. +91 9876543210" |
| Personality | Top 3 creators | "Separate with commas" (already exists) |
| Intent | Intent other | "Please describe your intent" |

---

## Files to Change

### 1. `src/App.tsx`

**Changes:**
- Add new `KYFormCheck` wrapper component
- Wrap the AppLayout routes with `KYFormCheck` after `ProfileSetupCheck`

**Updated route structure:**
```tsx
<Route element={
  <ProtectedRoute>
    <ProfileSetupCheck>
      <KYFormCheck>
        <AppLayout />
      </KYFormCheck>
    </ProfileSetupCheck>
  </ProtectedRoute>
}>
```

### 2. `src/pages/KYFForm.tsx`

**Changes:**
- Add "Introduction" to `STEP_TITLES` array (10 steps total)
- Add `Clock, ChevronDown` icon imports
- Add `Collapsible, CollapsibleTrigger, CollapsibleContent` imports
- Add `ScrollArea` import
- Add `calculateAge()` helper function
- Add `termsExpanded` state for accordion
- Add intro card content in `renderStepContent(0)`
- Update Personal Details (step 2): DOB + calculated age (read-only), remove separate age input
- Update Casting Call (step 6): Add subtitle, cap height at 10
- Update Understanding You (step 8): Add info callout
- Update Terms and Conditions (step 9): Replace modal with inline accordion
- Add placeholder texts to all input fields
- Update `canProceed()` for new step indices
- Update `handleBack()` for step 0 behavior

### 3. `src/pages/KYWForm.tsx`

**Changes:**
- Add "Introduction" to `STEP_TITLES` array (9 steps total)
- Add `Clock, ChevronDown` icon imports
- Add Collapsible and ScrollArea imports
- Add `calculateAge()` helper and `termsExpanded` state
- Add intro card with Writer-specific title
- Update Personal Details: DOB + calculated age (read-only)
- Update Understanding You: Add info callout
- Update Terms and Conditions: Replace modal with inline accordion
- Add placeholder texts to all input fields
- Shift all step indices by +1
- Update `canProceed()` and navigation logic

### 4. `src/pages/KYCForm.tsx`

**Changes:**
- Add "Introduction" to `STEP_TITLES` array (9 steps total)
- Add `Clock, ChevronDown` icon imports
- Add Collapsible and ScrollArea imports
- Add `calculateAge()` helper and `termsExpanded` state
- Add intro card with Creator-specific title
- Update Personal Details: DOB + calculated age (read-only)
- Update Understanding You: Add info callout
- Update Terms and Conditions: Replace modal with inline accordion
- Add placeholder texts to all input fields
- Shift all step indices by +1
- Update `canProceed()` and navigation logic

---

## Step Index Mapping After Changes

### KYFForm (9 steps becomes 10 steps)

| New Step | Title | Q# |
|----------|-------|------|
| 0 | Introduction | — |
| 1 | General Details | Q.01 |
| 2 | Personal Details | Q.02 |
| 3 | Preferences & Emergency | Q.03 |
| 4 | Proficiency | Q.04 |
| 5 | Personality & Preferences | Q.05 |
| 6 | Casting Call | Q.06 |
| 7 | Your Pictures | Q.07 |
| 8 | Understanding You | Q.08 |
| 9 | Terms & Conditions | Q.09 |

### KYWForm & KYCForm (8 steps becomes 9 steps)

| New Step | Title | Q# |
|----------|-------|------|
| 0 | Introduction | — |
| 1 | General Details | Q.01 |
| 2 | Personal Details | Q.02 |
| 3 | [Cohort-specific step] | Q.03 |
| 4 | Proficiency | Q.04 |
| 5 | Personality & Preferences | Q.05 |
| 6 | Understanding You | Q.06 |
| 7 | Intent | Q.07 |
| 8 | Terms & Conditions | Q.08 |

---

## Technical Implementation Details

### New Intro Step Content (Step 0)

```tsx
case 0:
  return (
    <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} stepTitle="Know Your Filmmaker">
      <div className="space-y-6">
        <p className="text-muted-foreground">
          This provides basic information about yourself that we at Forge 
          can use to ensure the best experience during Forge.
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Please ensure that you have about 5-10 mins to fill this form</span>
        </div>
        
        <div className="p-4 rounded-xl bg-forge-orange/10 border border-forge-orange/30">
          <p className="text-sm text-forge-orange font-medium">
            You will need to complete this form to access the Forge app
          </p>
        </div>
      </div>
    </KYFormCard>
  );
```

### Updated Personality & Preferences Step with Placeholders (KYFForm)

```tsx
case 5: // After index shift
  return (
    <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={5} stepTitle="Personality & Preferences">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Your top 3 movies? *</Label>
          <Textarea 
            value={formData.top_3_movies} 
            onChange={e => updateField('top_3_movies', e.target.value)} 
            placeholder="Separate with commas" 
            className="bg-secondary/50" 
          />
        </div>
        <RadioSelectField label="You are" required options={...} value={formData.chronotype} onChange={...} columns={2} />
        <RadioSelectField label="Your Meal preference" required options={...} value={formData.meal_preference} onChange={...} columns={2} />
        <div className="space-y-2">
          <Label>Are you allergic to any type of food? *</Label>
          <Textarea 
            value={formData.food_allergies} 
            onChange={e => updateField('food_allergies', e.target.value)} 
            placeholder="Please let us know" 
            className="bg-secondary/50" 
          />
        </div>
        <div className="space-y-2">
          <Label>Do you require any medication support? *</Label>
          <Textarea 
            value={formData.medication_support} 
            onChange={e => updateField('medication_support', e.target.value)} 
            placeholder="Please let us know"  // NEW placeholder added
            className="bg-secondary/50" 
          />
        </div>
      </div>
    </KYFormCard>
  );
```

### Updated Terms Step with Inline Accordion

```tsx
case 9: // For KYFForm (step 8 for KYW/KYC)
  return (
    <KYFormCard currentStep={step} totalSteps={STEP_TITLES.length} questionNumber={9} stepTitle="Terms and Conditions">
      <div className="space-y-4">
        <Collapsible open={termsExpanded} onOpenChange={setTermsExpanded}>
          <div className="p-4 rounded-xl border border-border bg-secondary/30">
            <div className="flex items-start gap-3">
              <Checkbox id="terms" checked={formData.terms_accepted} onCheckedChange={(checked) => updateField('terms_accepted', checked === true)} className="mt-0.5" />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <CollapsibleTrigger asChild>
                    <button type="button" className="text-forge-gold underline hover:text-forge-yellow transition-colors inline-flex items-center gap-1">
                      terms and conditions
                      <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", termsExpanded && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                  {' '}of the Forge program.
                </label>
              </div>
            </div>
          </div>
          
          <CollapsibleContent className="mt-3">
            <ScrollArea className="h-[40vh] rounded-xl border border-border bg-secondary/20 p-4">
              {/* Full terms content here */}
            </ScrollArea>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </KYFormCard>
  );
```

---

## Validation Logic Updates

For the intro step (step 0), `canProceed()` always returns `true`.

All subsequent steps shift their index by 1:

```tsx
// KYFForm example
const canProceed = (): boolean => {
  switch (step) {
    case 0: return true; // Intro step - always valid
    case 1: return !!(formData.certificate_name && formData.current_occupation && formData.instagram_id);
    case 2: return !!(formData.date_of_birth && formData.address_line_1 && formData.state && formData.pincode);
    case 3: return !!(formData.gender && formData.tshirt_size && formData.has_editing_laptop && formData.emergency_contact_name && formData.emergency_contact_number);
    case 4: return true; // Proficiency optional
    case 5: return !!(formData.top_3_movies && formData.chronotype && formData.meal_preference && formData.food_allergies && formData.medication_support);
    case 6: return formData.languages_known.length > 0 && !!formData.height_ft;
    case 7: return !!(formData.photo_favorite_url && formData.headshot_front_url && formData.full_body_url);
    case 8: return !!(formData.mbti_type && formData.forge_intent && (formData.forge_intent !== 'other' || formData.forge_intent_other));
    case 9: return formData.terms_accepted;
    default: return false;
  }
};
```

---

## Summary

| Change | Purpose | Files |
|--------|---------|-------|
| Intro Card (Step 0) | Welcome with form context, 5-10 min estimate, requirement notice | KYFForm, KYWForm, KYCForm |
| KYFormCheck route guard | Block app access until form is completed | App.tsx |
| Age auto-calculation | Calculate from DOB, display as read-only | All 3 forms |
| Casting Call subtitle | Explain the casting purpose to users | KYFForm only |
| Height cap at 10 | Prevent unrealistic height values | KYFForm only |
| Understanding You info callout | Explain what the 16 personalities test is | All 3 forms |
| Inline Terms Accordion | Replace modal with expandable accordion with rotating chevron | All 3 forms |
| Placeholder texts | Add helpful placeholder text to ALL input fields for better UX | All 3 forms |
| Step index shift | Accommodate new intro step | All 3 forms |
