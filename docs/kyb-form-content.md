# Know Your Builder (KYB) — Form Spec (mirrors KYF/KYC/KYW structure)

Cohort: **Forge AI Residency (FAI)** · response table: **`kyb_responses`**
Same shape as the writer/creator forms: one `builder_profile` section (5 steps) + `hospitality` section (2 steps) + the shared community profile.

Purpose: understand the builders, curate the experience, and **calibrate the curriculum** (advanced vs basic) — today we have no read on their level.

Legend: ✅ kept from existing forms · ➕ new for KYB · ❌ removed (niche).

---

## New option constants

```ts
const AI_LEVEL_OPTIONS = [
  { value: 'new',          label: 'Brand new — just curious about AI' },
  { value: 'beginner',     label: 'Beginner — I use ChatGPT/Claude casually' },
  { value: 'intermediate', label: 'Intermediate — I use AI regularly for work' },
  { value: 'advanced',     label: 'Advanced — I build with AI (prompts, automations, products)' },
];

const AI_TOOLS_OPTIONS = [
  { value: 'chatgpt',   label: 'ChatGPT' },
  { value: 'claude',    label: 'Claude' },
  { value: 'gemini',    label: 'Gemini' },
  { value: 'image_gen', label: 'Midjourney / Higgsfield (image/video)' },
  { value: 'n8n_make',  label: 'n8n / Make (automation)' },
  { value: 'builders',  label: 'Lovable / Cursor / Replit (building)' },
  { value: 'none',      label: 'None yet' },
  { value: 'other',     label: 'Other' },
];

const INTENT_OPTIONS_BUILDER = [
  { value: 'build_product', label: 'Build my own product' },
  { value: 'automate_work', label: 'Automate my work / business' },
  { value: 'level_up_ai',   label: 'Level up my AI skills' },
  { value: 'switch_tech',   label: 'Switch into AI / tech' },
  { value: 'explore',       label: 'Explore & experiment' },
];
```

## KYB_SECTIONS

```ts
const KYB_SECTIONS: KYSection[] = [
  {
    key: 'builder_profile',
    title: 'Builder Profile',
    subtitle: 'Your AI building journey',
    icon: '🛠️',
    introTitle: "Let's build your builder profile",
    introDescription: 'Tell us where you are with AI so we can tailor the residency to you.',
    keepHandy: [
      { emoji: '🎂', text: 'Your date of birth' },
      { emoji: '🤖', text: 'The AI tools you’ve tried' },
      { emoji: '🎯', text: 'What you want out of the program' },
    ],
    timeEstimate: '~5 minutes',
    responseTable: 'kyb_responses',
    steps: [
      {
        key: 'general_details',
        title: 'General Details',
        subtitle: 'The basics about you',
        fields: [
          { key: 'certificate_name',  type: 'text', label: 'Name (as on certificate)', placeholder: 'Your full legal name', required: true },          // ✅
          { key: 'current_occupation', type: 'text', label: 'Current Occupation', placeholder: 'e.g. Student, Founder, Working Professional', required: true }, // ✅
          { key: 'instagram_id',      type: 'text', label: 'Instagram ID', placeholder: '@yourhandle', required: false },                                  // ✅
          { key: 'date_of_birth',     type: 'date', label: 'Date of Birth', required: true },                                                              // ✅
        ],
      },
      {
        key: 'location',
        title: 'Location',
        subtitle: 'Where are you based?',
        fields: [
          { key: 'city', type: 'country-state', label: 'Country & State', countryKey: 'country', required: true },   // ✅
        ],
      },
      {
        key: 'ai_readiness',                                                            // ➕ replaces the craft "Proficiency" step
        title: 'AI Readiness',
        subtitle: 'Where you are with AI today',
        fields: [
          { key: 'ai_experience_level', type: 'pill-select',  label: 'Your current level with AI', options: AI_LEVEL_OPTIONS, required: true },           // ➕
          { key: 'ai_tools_used',       type: 'multi-select', label: 'Which AI tools have you used?', options: AI_TOOLS_OPTIONS, required: true },        // ➕
          { key: 'past_ai_builds',      type: 'textarea',     label: 'What have you built or created with AI so far?', placeholder: 'Projects, automations, content… “nothing yet” is fine', required: true }, // ➕
          { key: 'has_laptop',          type: 'radio',        label: 'Are you bringing a laptop to the residency?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], columns: 2, required: true }, // ➕
        ],
      },
      {
        key: 'goals',                                                                  // ➕ replaces "Favorites & Personality" (drops Top-3 niche, keeps MBTI)
        title: 'Your Goals',
        subtitle: 'What you want from Forge AI',
        fields: [
          { key: 'program_outcome',  type: 'textarea', label: 'What outcome do you most want from this program?', placeholder: 'e.g. Launch my first product, automate my business…', required: true }, // ➕
          { key: 'biggest_roadblock', type: 'textarea', label: 'Biggest roadblock you’re facing right now that you’d want help with?', placeholder: 'What’s holding you back today?', required: true },   // ➕
          { key: 'learning_goals',   type: 'textarea', label: 'What do you most want to learn at the residency?', placeholder: 'Skills, tools, topics…', required: true },                              // ➕
          { key: 'mbti_type',        type: 'mbti',     label: 'Your MBTI', required: true, helperText: 'Take the test at 16personalities.com if unsure' },                                              // ✅
        ],
      },
      {
        key: 'your_vibe',
        title: 'Your Vibe',
        subtitle: 'One last thing about you',
        fields: [
          { key: 'chronotype',   type: 'chronotype',  label: 'You are', options: CHRONOTYPE_OPTIONS, required: true },          // ✅
          { key: 'forge_intent', type: 'pill-select', label: 'What brings you here?', options: INTENT_OPTIONS_BUILDER, required: true }, // ✅ (AI-flavored options)
        ],
      },
    ],
  },
  {
    key: 'hospitality',                                                                // ✅ identical to KYW/KYC, just responseTable = kyb_responses
    title: 'Hospitality Details',
    subtitle: 'Help us prepare for your stay',
    icon: '🍽️',
    introTitle: 'Almost there! Final details',
    introDescription: 'We want to make sure your stay is comfortable. This helps us plan meals, rooms, and emergencies.',
    keepHandy: [
      { emoji: '📞', text: 'Emergency contact number' },
      { emoji: '👕', text: 'Your T-shirt size' },
      { emoji: '🍽️', text: 'Any dietary restrictions or allergies' },
    ],
    timeEstimate: '~2 minutes',
    responseTable: 'kyb_responses',
    steps: [
      {
        key: 'food_dietary',
        title: 'Food & Dietary',
        subtitle: 'Meals and dietary needs',
        fields: [
          { key: 'meal_preference',   type: 'meal-preference', label: 'Meal Preference', required: true },
          { key: 'food_allergies',    type: 'text', label: 'Food Allergies', placeholder: 'None', required: true },
          { key: 'medication_support', type: 'text', label: 'Medication / Medical Support', placeholder: 'None', required: true },
        ],
      },
      {
        key: 'merch_emergency',
        title: 'Merch & Emergency',
        subtitle: 'T-shirt, safety, and confirmation',
        fields: [
          { key: 'tshirt_size',             type: 'tshirt-size', label: 'T-Shirt Size', required: true },
          { key: 'emergency_contact_name',  type: 'text', label: 'Emergency Contact Name', placeholder: 'Parent / Guardian name', required: true, inline: 'emergency_row' },
          { key: 'emergency_contact_number', type: 'phone', label: 'Emergency Contact Number', required: true, inline: 'emergency_row' },
          { key: 'terms_accepted',          type: 'checkbox', label: 'I accept the Terms & Conditions', required: true },
        ],
      },
    ],
  },
];
```

## Removed vs the filmmaker form
❌ Proficiency grid (screenwriting/direction/cinematography/editing) · ❌ Top 3 Movies · ❌ "laptop for editing" (replaced with builder laptop Q) · ❌ entire Casting Form (height, gender, headshots).

## Build checklist once approved
1. `kyb_responses` table (mirror `kyw_responses` columns + new: `ai_experience_level`, `ai_tools_used text[]`, `past_ai_builds`, `has_laptop`, `program_outcome`, `biggest_roadblock`, `learning_goals`).
2. Add `AI_LEVEL_OPTIONS` / `AI_TOOLS_OPTIONS` / `INTENT_OPTIONS_BUILDER` + `KYB_SECTIONS` to `KYSectionConfig.ts`; wire `getSectionsForCohort('FAI')`.
3. Add `'FAI'` to `COHORTS_WITH_KY_FORM` and `getKYFormSectionRoute`/name helpers → KY surfaces light up for FAI automatically.
4. AdminKYForms: map `FAI → kyb_responses` (already stubbed) for CSV export.
