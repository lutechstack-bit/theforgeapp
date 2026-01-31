
# Fix: Add KYC Response Support for Creators Cohort

## Understanding the Cohort-Based Architecture

The entire Forge app experience is **cohort-based**. Each user belongs to one of three cohorts determined by their edition's `cohort_type`:

| Cohort Type | Name | KY Form | Database Table | Content |
|-------------|------|---------|----------------|---------|
| `FORGE` | Filmmakers | Know Your Filmmaker | `kyf_responses` | Filmmaking mentors, equipment, roadmap content |
| `FORGE_WRITING` | Writers | Know Your Writer | `kyw_responses` | Writing mentors, no equipment section |
| `FORGE_CREATORS` | Creators | Know Your Creator | `kyc_responses` | Creator mentors, creator-specific equipment |

## Problem Identified

Currently, the `useProfileData` hook and `MyKYForm.tsx` page are **broken for Creators**:

**In `src/hooks/useProfileData.ts` (Line 44):**
```tsx
// ❌ BUG: Creators are fetching from kyf_responses instead of kyc_responses
if (cohortType === 'FORGE' || cohortType === 'FORGE_CREATORS') {
  const { data } = await supabase.from('kyf_responses')...
```

**In `src/pages/MyKYForm.tsx` (Line 22):**
```tsx
// ❌ BUG: Missing kycResponse in the data chain
const kyData = profileData?.kyfResponse || profileData?.kywResponse;
```

**Result:** Creators see an empty "My KY Form" summary page because their data is in `kyc_responses`, but the hook fetches from the wrong table.

---

## Solution

### 1. Update `src/hooks/useProfileData.ts`

**Add `kycResponse` to the interface:**
```tsx
export interface ProfileData {
  profile: any;
  kyfResponse: any | null;
  kywResponse: any | null;
  kycResponse: any | null;  // ← ADD THIS
  cohortType: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS' | null;
  messageCount: number;
  worksCount: number;
}
```

**Fix the fetch logic to separate FORGE and FORGE_CREATORS:**
```tsx
// Fetch KYF response if FORGE (Filmmakers) only
let kyfResponse = null;
if (cohortType === 'FORGE') {  // ← Remove FORGE_CREATORS
  const { data } = await supabase
    .from('kyf_responses')
    .select('*')
    .eq('user_id', targetUserId)
    .maybeSingle();
  kyfResponse = data;
}

// ADD: Fetch KYC response if FORGE_CREATORS
let kycResponse = null;
if (cohortType === 'FORGE_CREATORS') {
  const { data } = await supabase
    .from('kyc_responses')
    .select('*')
    .eq('user_id', targetUserId)
    .maybeSingle();
  kycResponse = data;
}

// ... existing KYW fetch stays the same ...

return {
  profile: profileData,
  kyfResponse,
  kywResponse,
  kycResponse,  // ← ADD THIS
  cohortType,
  messageCount: messageCount || 0,
  worksCount: worksCount || 0,
};
```

---

### 2. Update `src/pages/MyKYForm.tsx`

**Add kycResponse to the data chain (Line 22):**
```tsx
const kyData = profileData?.kyfResponse || profileData?.kywResponse || profileData?.kycResponse;
```

**Add Creator-specific cohort check (Line 23):**
```tsx
const isFilmmaking = cohortType === 'FORGE';  // Only Filmmakers
const isWriting = cohortType === 'FORGE_WRITING';
const isCreator = cohortType === 'FORGE_CREATORS';  // ADD THIS
```

**Add Creator-specific skills section:**
```tsx
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
```

**Update Featured Cards for Creators:**
```tsx
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
        <Badge key={idx} className="bg-primary/10 text-primary border-primary/30 px-3 py-1.5 text-sm font-medium">
          {idx + 1}. {item}
        </Badge>
      ))}
    </div>
  </div>
)}
```

---

### 3. Also Update Hero Section: Replace Checkmark with Forge Logo

**Add import:**
```tsx
import forgeIcon from '@/assets/forge-icon.png';
```

**Remove `CheckCircle2` from imports**

**Replace the animated success icon (Lines 93-99) with:**
```tsx
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
```

**Simplify cohort badge to remove emojis (Lines 42-48):**
```tsx
const getCohortLabel = () => {
  switch (cohortType) {
    case 'FORGE_WRITING': return 'Writer';
    case 'FORGE_CREATORS': return 'Creator';
    default: return 'Filmmaker';
  }
};
```

---

## Corrected Data Flow

After the fix:

| Cohort | Form Route | Database Table | Response Key | Skills Shown |
|--------|------------|----------------|--------------|--------------|
| FORGE | `/kyf-form` | `kyf_responses` | `kyfResponse` | Screenwriting, Direction, Cinematography, Editing |
| FORGE_WRITING | `/kyw-form` | `kyw_responses` | `kywResponse` | Writing, Story & Voice |
| FORGE_CREATORS | `/kyc-form` | `kyc_responses` | `kycResponse` | Content Creation, Storytelling, Video Production |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useProfileData.ts` | Add `kycResponse` interface field, separate FORGE/FORGE_CREATORS fetch logic |
| `src/pages/MyKYForm.tsx` | Add `kycResponse` to data chain, add creator skills section, replace checkmark with Forge logo, remove emojis |

---

## Summary of Changes

1. **Fix data fetching** - Each cohort now correctly fetches from their respective table
2. **Add Creator skills section** - Displays Content Creation, Storytelling, Video Production proficiencies
3. **Support Top 3 Creators** - Featured cards now show creators' favorite creators
4. **Replace checkmark with Forge logo** - Brand-consistent hero animation
5. **Remove emojis** - Clean, professional text-only badges
