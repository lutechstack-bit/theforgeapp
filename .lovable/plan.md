

# Floating Label Inputs — Full App Including Admin

## Scope

Create two reusable components and replace all `Label + Input` / `Label + Textarea` pairs across **every** form in the app — user-facing AND admin pages.

## New Components

### `src/components/ui/floating-input.tsx`
- Relative container with `Input` using `peer` class and `placeholder=" "` 
- Absolutely positioned `Label` with `pointer-events-none`
- CSS transitions via `peer-focus:` and `peer-[:not(:placeholder-shown)]:` — label moves up, scales down, changes color
- Input gets `pt-5 pb-1.5` padding; supports all standard props (type, id, disabled, className, etc.)
- Accepts `label` prop for the floating text and optional `error` string

### `src/components/ui/floating-textarea.tsx`
- Same pattern for `<Textarea>` with `pt-6 pb-2` padding

## Files to Update

### User-facing forms (9 files)
| File | Fields |
|------|--------|
| `src/pages/Auth.tsx` | Full Name, Email, Password, Confirm Password |
| `src/pages/ForgotPassword.tsx` | Email |
| `src/pages/ResetPassword.tsx` | New Password, Confirm Password |
| `src/pages/ProfileSetup.tsx` | Full Name, Email, City |
| `src/components/profile/ProfileEditSheet.tsx` | Full Name, Tagline, Specialty, City, Bio, Phone, Instagram, Twitter |
| `src/components/profile/AddWorkModal.tsx` | Title, Media URL, Thumbnail URL, Description, Award input |
| `src/components/onboarding/DynamicFormField.tsx` | All text/email/tel/number/date/textarea types |
| `src/components/perks/PerkClaimForm.tsx` | Dynamic claim fields |
| `src/components/profile/AboutSection.tsx` | Bio textarea |

### Admin forms (17 files)
| File | Forms |
|------|-------|
| `AdminAnnouncements.tsx` | Title, Emoji, Message, Deep Link, Priority, Expiry |
| `AdminAutoUpdates.tsx` | All update fields |
| `AdminChangelog.tsx` | Changelog entry fields |
| `AdminCommunityHighlights.tsx` | Highlight fields |
| `AdminDocs.tsx` | Doc fields |
| `AdminEditions.tsx` | Edition fields |
| `AdminEquipment.tsx` | Equipment fields |
| `AdminEvents.tsx` | Event fields |
| `AdminHomepage.tsx` | Homepage config fields |
| `AdminJourneyStages.tsx` | Stage fields |
| `AdminJourneyTasks.tsx` | Task fields |
| `AdminKYForms.tsx` | KY form config fields |
| `AdminLearn.tsx` | Course/video fields |
| `AdminMentors.tsx` | Mentor fields |
| `AdminNightlyRituals.tsx` | Ritual fields |
| `AdminPerks.tsx` | Perk fields |
| `AdminRoadmap.tsx` | Roadmap day fields |
| `AdminRoadmapSidebar.tsx` | Sidebar item fields |
| `AdminTodaysFocus.tsx` | Focus card fields |
| `CreateDocVersionModal.tsx` | Version, Title, Changelog, Release Notes |

### Pattern for each file
1. Replace `import { Input }` with `import { FloatingInput }` (or add it alongside if `Input` is still used for non-label cases like search bars)
2. Replace `import { Textarea }` with `import { FloatingTextarea }` where applicable
3. Remove standalone `<Label>` tags that precede `Input`/`Textarea`
4. Replace `<div className="space-y-2"><Label>Name</Label><Input ... /></div>` with `<FloatingInput label="Name" ... />`
5. Keep `Select`, `Switch`, `Checkbox`, `RadioGroup`, and file upload fields unchanged — floating labels only apply to text inputs and textareas

### Technical Details
- Pure CSS animation: Tailwind `peer` + `:placeholder-shown` pseudo-class
- Transition: `duration-200 ease-out` on transform, font-size, color
- Resting: label centered vertically, `text-muted-foreground`, normal size
- Active (focused or filled): label at top-left, `text-xs`, `text-primary` on focus
- Password fields with eye-toggle buttons: icon remains in `absolute right-3`, compatible with the floating label

