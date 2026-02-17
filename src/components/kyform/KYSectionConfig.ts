// Central configuration for KY form sections per cohort type

export interface KeepHandyItem {
  emoji: string;
  text: string;
}

export interface SectionStepField {
  key: string;
  type: 'text' | 'date' | 'select' | 'radio' | 'multi-select' | 'proficiency' | 'proficiency-grid' | 'photo' | 'phone' | 'tags' | 'checkbox' | 'textarea' | 'meal-preference' | 'tshirt-size' | 'mbti' | 'country-state';
  countryKey?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; description?: string }[];
  maxItems?: number;
  columns?: 1 | 2 | 3;
  photoFolder?: string;
  photoDescription?: string;
  helperText?: string;
  // For proficiency-grid type
  skills?: { key: string; label: string }[];
  levels?: string[];
  // For inline field grouping (fields with same inline key render side-by-side)
  inline?: string;
}

export interface SectionStep {
  key: string;
  title: string;
  subtitle?: string;
  fields: SectionStepField[];
}

export interface KYSection {
  key: string;
  title: string;
  subtitle: string;
  icon: string; // emoji
  keepHandy: KeepHandyItem[];
  timeEstimate: string;
  introTitle: string;
  introDescription: string;
  steps: SectionStep[];
  responseTable: 'kyf_responses' | 'kyc_responses' | 'kyw_responses';
}

// Shared options
const MBTI_TYPES = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

const CHRONOTYPE_OPTIONS = [
  { value: 'early_bird', label: '🌅 Early Bird', description: 'I wake up early and am most productive in the morning' },
  { value: 'night_owl', label: '🦉 Night Owl', description: 'I stay up late and am most creative at night' },
  { value: 'in_between', label: '⚖️ Somewhere in between' },
];

const INTENT_OPTIONS_FILM = [
  { value: 'vacation', label: 'Enjoy a vacation combined with filmmaking' },
  { value: 'crew', label: 'Finding your crew' },
  { value: 'learn', label: 'Learn filmmaking in the best environment' },
  { value: 'make_film', label: 'Make your short film' },
  { value: 'networking', label: 'Networking / Making new friends' },
  { value: 'equipment', label: 'Use Cinema-grade Equipment' },
  { value: 'other', label: 'Other' },
];

const INTENT_OPTIONS_CREATOR = [
  { value: 'learn', label: 'Learn content creation professionally' },
  { value: 'networking', label: 'Networking / Making new friends' },
  { value: 'grow_channel', label: 'Grow my channel / platform' },
  { value: 'collab', label: 'Find collaboration partners' },
  { value: 'equipment', label: 'Use professional equipment' },
  { value: 'other', label: 'Other' },
];

const INTENT_OPTIONS_WRITER = [
  { value: 'learn', label: 'Learn screenwriting professionally' },
  { value: 'finish_script', label: 'Finish my script' },
  { value: 'networking', label: 'Networking / Making new friends' },
  { value: 'feedback', label: 'Get feedback on my work' },
  { value: 'other', label: 'Other' },
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada'];

const SCREENWRITING_OPTIONS = [
  { value: 'pitched_script', label: 'I have pitched my Script to a Producer/Agent' },
  { value: 'formal_education', label: 'I have completed a formal education on Screenwriting' },
  { value: 'finished_feature', label: 'I have finished the bounded script of a Feature film' },
  { value: 'short_films', label: 'I have written the screenplay for Short films' },
  { value: 'formatting', label: 'I know how to format a Screenplay on professional software' },
  { value: 'learning', label: 'I am still learning/struggling to finish a script' },
  { value: 'just_starting', label: 'I am just getting started' },
];

const DIRECTION_OPTIONS = [
  { value: 'directed_feature', label: 'I have directed a full length Feature film' },
  { value: 'worked_professional', label: 'I have worked in a professional set for a Feature film' },
  { value: 'directed_short', label: 'I have directed a Short film' },
  { value: 'social_media', label: 'I have directed short videos for Social Media' },
  { value: 'assistant_director', label: 'I have worked as an Assistant Director' },
  { value: 'blocking', label: 'I know how to block or stage or frame a shot' },
  { value: 'theoretical', label: 'I only know the theoretical aspects of Film Direction' },
  { value: 'just_starting', label: 'I am just getting started' },
];

const CINEMATOGRAPHY_OPTIONS = [
  { value: 'feature_dop', label: 'I have worked as a Cinematographer for a full-length Feature film' },
  { value: 'short_dop', label: 'I have worked as a Cinematographer for a Short film' },
  { value: 'assistant_dop', label: 'I have worked as an Assistant Cinematographer' },
  { value: 'professional_crew', label: 'I have worked with a professional production crew' },
  { value: 'camera_operator', label: 'I am just good at operating a Camera' },
  { value: 'lighting', label: 'I am just good at lighting a scene' },
  { value: 'theoretical', label: 'I only know the theoretical aspects of Cinematography' },
  { value: 'just_starting', label: 'I am just getting started' },
];

const EDITING_OPTIONS = [
  { value: 'edited_feature', label: 'I have edited a full-length Feature film' },
  { value: 'short_projects', label: 'I have only worked on short films or smaller projects' },
  { value: 'professional_software', label: 'I am proficient with industry-standard software' },
  { value: 'assistant_editor', label: 'I have worked as an Assistant Editor' },
  { value: 'simple_edits', label: 'I have only worked on straightforward edits' },
  { value: 'cuts_transitions', label: 'I can only do simple cuts and transitions' },
  { value: 'mobile_apps', label: 'I can edit only on basic mobile apps' },
  { value: 'theoretical', label: 'I only know the theoretical aspects of Film Editing' },
  { value: 'just_starting', label: 'I am just getting started' },
];

// ===================== KYF (Filmmakers) =====================
const KYF_SECTIONS: KYSection[] = [
  {
    key: 'filmmaker_profile',
    title: 'Filmmaker Profile',
    subtitle: 'Your filmmaking journey',
    icon: '🎬',
    introTitle: "Let's build your filmmaker profile",
    introDescription: 'This helps us understand your experience and pair you with the right crew at Forge.',
    keepHandy: [
      { emoji: '📱', text: 'Your Instagram handle' },
      { emoji: '🎂', text: 'Your date of birth' },
      { emoji: '📍', text: 'Your current address & pincode' },
    ],
    timeEstimate: '~5 minutes',
    responseTable: 'kyf_responses',
    steps: [
      {
        key: 'general_details',
        title: 'General Details',
        subtitle: 'The basics about you',
        fields: [
          { key: 'certificate_name', type: 'text', label: 'Name (as on certificate)', placeholder: 'Your full legal name', required: true },
          { key: 'current_occupation', type: 'text', label: 'Current Occupation', placeholder: 'e.g. Student, Freelancer, Working Professional', required: true },
          { key: 'instagram_id', type: 'text', label: 'Instagram ID', placeholder: '@yourhandle', required: true },
          { key: 'date_of_birth', type: 'date', label: 'Date of Birth', required: true },
          { key: 'address_line_1', type: 'text', label: 'Address Line 1', placeholder: 'Street address', required: true },
          
          { key: 'state', type: 'country-state', label: 'Country & State', countryKey: 'country', required: true, inline: 'location_row' },
          { key: 'pincode', type: 'text', label: 'Pincode', placeholder: '6-digit pincode', required: true, inline: 'location_row' },
        ],
      },
      {
        key: 'proficiency',
        title: 'Proficiency Level',
        subtitle: 'How experienced are you in each area?',
        fields: [
          {
            key: 'proficiency_grid',
            type: 'proficiency-grid',
            label: 'Rate your proficiency',
            skills: [
              { key: 'proficiency_screenwriting', label: 'Screenwriting' },
              { key: 'proficiency_direction', label: 'Direction' },
              { key: 'proficiency_cinematography', label: 'Cinematography' },
              { key: 'proficiency_editing', label: 'Editing' },
            ],
            levels: ['Beginner', 'Amateur', 'Ok', 'Good', 'Pro'],
          },
          { key: 'has_editing_laptop', type: 'radio', label: 'Are you bringing a laptop for editing to Forge?', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], columns: 2 },
        ],
      },
      {
        key: 'understanding',
        title: 'Understanding You',
        subtitle: 'Help us know you better',
        fields: [
          { key: 'top_3_movies', type: 'tags', label: 'Your Top 3 Movies', placeholder: 'Type a movie name and press Enter', maxItems: 3, required: true },
          { key: 'mbti_type', type: 'mbti', label: 'MBTI Personality Type', required: true, helperText: 'Take the test at 16personalities.com if unsure' },
          { key: 'chronotype', type: 'radio', label: 'What\'s your chronotype?', options: CHRONOTYPE_OPTIONS, required: true },
          { key: 'forge_intent', type: 'radio', label: 'What do you hope to gain from Forge?', options: INTENT_OPTIONS_FILM, required: true },
          { key: 'forge_intent_other', type: 'text', label: 'Please specify', placeholder: 'Tell us more...', helperText: 'Only if you selected "Other" above' },
        ],
      },
    ],
  },
  {
    key: 'casting_form',
    title: 'Casting Form',
    subtitle: 'For your Forge casting call',
    icon: '📸',
    introTitle: 'Time for your casting details',
    introDescription: "We need a few details and photos for the casting process during Forge.",
    keepHandy: [
      { emoji: '📷', text: '5 photos of yourself (headshots + full body)' },
      { emoji: '📏', text: 'Your height in feet' },
    ],
    timeEstimate: '~3 minutes',
    responseTable: 'kyf_responses',
    steps: [
      {
        key: 'casting_call',
        title: 'Casting Call',
        subtitle: 'Basic casting information',
        fields: [
          { key: 'languages_known', type: 'multi-select', label: 'Languages Known', options: LANGUAGES.map(l => ({ value: l, label: l })), required: true },
          { key: 'height_ft', type: 'text', label: 'Height (in feet)', placeholder: "e.g. 5'8\"", required: true },
          { key: 'gender', type: 'radio', label: 'Gender', options: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'non_binary', label: 'Non-Binary' },
            { value: 'prefer_not_say', label: 'Prefer not to say' },
          ], columns: 2, required: true },
        ],
      },
      {
        key: 'pictures',
        title: 'Your Pictures',
        subtitle: 'Upload your casting photos',
        fields: [
          { key: 'headshot_front_url', type: 'photo', label: 'Headshot (Front)', photoFolder: 'headshot-front', photoDescription: 'Clear front-facing headshot', required: true },
          { key: 'headshot_left_url', type: 'photo', label: 'Headshot (Left)', photoFolder: 'headshot-left', photoDescription: 'Left profile headshot' },
          { key: 'headshot_right_url', type: 'photo', label: 'Headshot (Right)', photoFolder: 'headshot-right', photoDescription: 'Right profile headshot' },
          { key: 'full_body_url', type: 'photo', label: 'Full Body', photoFolder: 'full-body', photoDescription: 'Full body standing photo', required: true },
          { key: 'photo_favorite_url', type: 'photo', label: 'Your Favorite Photo', photoFolder: 'favorite', photoDescription: 'A photo that represents you', required: true },
        ],
      },
    ],
  },
  {
    key: 'hospitality',
    title: 'Hospitality Details',
    subtitle: 'Help us prepare for your stay',
    icon: '🍽️',
    introTitle: 'Almost there! Final details',
    introDescription: "We want to make sure your stay is comfortable. This helps us plan meals, rooms, and emergencies.",
    keepHandy: [
      { emoji: '📞', text: 'Emergency contact number' },
      { emoji: '👕', text: 'Your T-shirt size' },
      { emoji: '🍽️', text: 'Any dietary restrictions or allergies' },
    ],
    timeEstimate: '~2 minutes',
    responseTable: 'kyf_responses',
    steps: [
      {
        key: 'hospitality_details',
        title: 'Hospitality Details',
        subtitle: 'Meals, merch & emergency info',
        fields: [
          { key: 'meal_preference', type: 'meal-preference', label: 'Meal Preference', required: true },
          { key: 'food_allergies', type: 'text', label: 'Food Allergies', placeholder: 'None', required: true },
          { key: 'medication_support', type: 'text', label: 'Medication / Medical Support', placeholder: 'None', required: true },
          { key: 'tshirt_size', type: 'tshirt-size', label: 'T-Shirt Size', required: true },
          { key: 'emergency_contact_name', type: 'text', label: 'Emergency Contact Name', placeholder: 'Parent / Guardian name', required: true, inline: 'emergency_row' },
          { key: 'emergency_contact_number', type: 'phone', label: 'Emergency Contact Number', required: true, inline: 'emergency_row' },
          { key: 'terms_accepted', type: 'checkbox', label: 'I accept the Terms & Conditions', required: true },
        ],
      },
    ],
  },
];

// ===================== KYC (Creators) =====================
const KYC_SECTIONS: KYSection[] = [
  {
    key: 'creator_profile',
    title: 'Creator Profile',
    subtitle: 'Your content creation journey',
    icon: '🎥',
    introTitle: "Let's build your creator profile",
    introDescription: 'Tell us about your content creation experience and preferences.',
    keepHandy: [
      { emoji: '📱', text: 'Your Instagram handle' },
      { emoji: '🎂', text: 'Your date of birth' },
      { emoji: '🌐', text: 'Your primary content platform' },
    ],
    timeEstimate: '~5 minutes',
    responseTable: 'kyc_responses',
    steps: [
      {
        key: 'general_details',
        title: 'General Details',
        subtitle: 'The basics about you',
        fields: [
          { key: 'certificate_name', type: 'text', label: 'Name (as on certificate)', placeholder: 'Your full legal name', required: true },
          { key: 'current_status', type: 'radio', label: 'Current Status', options: [
            { value: 'student', label: 'Student' },
            { value: 'working', label: 'Working Professional' },
            { value: 'freelancer', label: 'Freelancer' },
            { value: 'full_time_creator', label: 'Full-time Creator' },
          ], required: true },
          { key: 'instagram_id', type: 'text', label: 'Instagram ID', placeholder: '@yourhandle', required: true },
          { key: 'date_of_birth', type: 'date', label: 'Date of Birth', required: true },
          { key: 'state', type: 'country-state', label: 'Country & State', countryKey: 'country', required: true },
          { key: 'primary_platform', type: 'radio', label: 'Primary Platform', options: [
            { value: 'youtube', label: 'YouTube' },
            { value: 'instagram', label: 'Instagram' },
            { value: 'tiktok', label: 'TikTok' },
            { value: 'other', label: 'Other' },
          ], columns: 2, required: true },
        ],
      },
      {
        key: 'proficiency',
        title: 'Proficiency Level',
        subtitle: 'Your content creation skills',
        fields: [
          { key: 'proficiency_content_creation', type: 'proficiency', label: 'Content Creation', options: [
            { value: 'professional', label: 'I create content professionally (brand deals, full-time)' },
            { value: 'growing', label: 'I have a growing audience and post regularly' },
            { value: 'hobby', label: 'I create content as a hobby' },
            { value: 'just_starting', label: 'I am just getting started' },
          ] },
          { key: 'proficiency_storytelling', type: 'proficiency', label: 'Storytelling', options: [
            { value: 'expert', label: 'I craft compelling narratives for my content' },
            { value: 'learning', label: 'I am learning to tell better stories' },
            { value: 'just_starting', label: 'I am just getting started with storytelling' },
          ] },
          { key: 'proficiency_video_production', type: 'proficiency', label: 'Video Production', options: [
            { value: 'professional', label: 'I use professional gear and editing software' },
            { value: 'intermediate', label: 'I am comfortable with basic gear and editing' },
            { value: 'phone_only', label: 'I mostly shoot and edit on my phone' },
            { value: 'just_starting', label: 'I am just getting started' },
          ] },
        ],
      },
      {
        key: 'understanding',
        title: 'Understanding You',
        subtitle: 'Help us know you better',
        fields: [
          { key: 'top_3_creators', type: 'tags', label: 'Your Top 3 Creators', placeholder: 'Type a creator name and press Enter', maxItems: 3, required: true },
          { key: 'mbti_type', type: 'mbti', label: 'MBTI Personality Type', required: true, helperText: 'Take the test at 16personalities.com if unsure' },
          { key: 'chronotype', type: 'radio', label: 'What\'s your chronotype?', options: CHRONOTYPE_OPTIONS, required: true },
          { key: 'forge_intent', type: 'radio', label: 'What do you hope to gain from Forge?', options: INTENT_OPTIONS_CREATOR, required: true },
          { key: 'forge_intent_other', type: 'text', label: 'Please specify', placeholder: 'Tell us more...', helperText: 'Only if you selected "Other" above' },
        ],
      },
    ],
  },
  {
    key: 'hospitality',
    title: 'Hospitality Details',
    subtitle: 'Help us prepare for your stay',
    icon: '🍽️',
    introTitle: 'Almost there! Final details',
    introDescription: "We want to make sure your stay is comfortable. This helps us plan meals, rooms, and emergencies.",
    keepHandy: [
      { emoji: '📞', text: 'Emergency contact number' },
      { emoji: '👕', text: 'Your T-shirt size' },
      { emoji: '🍽️', text: 'Any dietary restrictions or allergies' },
    ],
    timeEstimate: '~2 minutes',
    responseTable: 'kyc_responses',
    steps: [
      {
        key: 'hospitality_details',
        title: 'Hospitality Details',
        subtitle: 'Meals, merch & emergency info',
        fields: [
          { key: 'meal_preference', type: 'meal-preference', label: 'Meal Preference', required: true },
          { key: 'food_allergies', type: 'text', label: 'Food Allergies', placeholder: 'None', required: true },
          { key: 'medication_support', type: 'text', label: 'Medication / Medical Support', placeholder: 'None', required: true },
          { key: 'tshirt_size', type: 'tshirt-size', label: 'T-Shirt Size', required: true },
          { key: 'emergency_contact_name', type: 'text', label: 'Emergency Contact Name', placeholder: 'Parent / Guardian name', required: true, inline: 'emergency_row' },
          { key: 'emergency_contact_number', type: 'phone', label: 'Emergency Contact Number', required: true, inline: 'emergency_row' },
          { key: 'terms_accepted', type: 'checkbox', label: 'I accept the Terms & Conditions', required: true },
        ],
      },
    ],
  },
];

// ===================== KYW (Writers) =====================
const KYW_SECTIONS: KYSection[] = [
  {
    key: 'writer_profile',
    title: 'Writer Profile',
    subtitle: 'Your writing journey',
    icon: '✍️',
    introTitle: "Let's build your writer profile",
    introDescription: 'Tell us about your writing practice and creative interests.',
    keepHandy: [
      { emoji: '🎂', text: 'Your date of birth' },
      { emoji: '📚', text: 'Your top 3 favorite writers or books' },
    ],
    timeEstimate: '~5 minutes',
    responseTable: 'kyw_responses',
    steps: [
      {
        key: 'general_details',
        title: 'General Details',
        subtitle: 'The basics about you',
        fields: [
          { key: 'certificate_name', type: 'text', label: 'Name (as on certificate)', placeholder: 'Your full legal name', required: true },
          { key: 'current_occupation', type: 'text', label: 'Current Occupation', placeholder: 'e.g. Student, Freelancer, Working Professional', required: true },
          { key: 'date_of_birth', type: 'date', label: 'Date of Birth', required: true },
          { key: 'city', type: 'country-state', label: 'Country & State', countryKey: 'country', required: false },
          { key: 'writing_types', type: 'multi-select', label: 'Types of Writing', options: [
            { value: 'screenwriting', label: 'Screenwriting' },
            { value: 'fiction', label: 'Fiction' },
            { value: 'poetry', label: 'Poetry' },
            { value: 'journalism', label: 'Journalism' },
            { value: 'copywriting', label: 'Copywriting' },
            { value: 'blogging', label: 'Blogging' },
          ], required: true },
        ],
      },
      {
        key: 'proficiency',
        title: 'Proficiency Level',
        subtitle: 'Your writing skills',
        fields: [
          { key: 'proficiency_writing', type: 'proficiency', label: 'Writing', options: [
            { value: 'published', label: 'I have published work (books, scripts, articles)' },
            { value: 'completed_works', label: 'I have completed multiple pieces of writing' },
            { value: 'learning', label: 'I write regularly but am still learning' },
            { value: 'just_starting', label: 'I am just getting started' },
          ] },
          { key: 'proficiency_story_voice', type: 'proficiency', label: 'Story & Voice', options: [
            { value: 'distinctive', label: 'I have a distinctive writing voice' },
            { value: 'developing', label: 'I am developing my voice' },
            { value: 'exploring', label: 'I am still exploring different styles' },
            { value: 'just_starting', label: 'I am just getting started' },
          ] },
        ],
      },
      {
        key: 'understanding',
        title: 'Understanding You',
        subtitle: 'Help us know you better',
        fields: [
          { key: 'top_3_writers_books', type: 'tags', label: 'Your Top 3 Writers or Books', placeholder: 'Type a name and press Enter', maxItems: 3, required: true },
          { key: 'mbti_type', type: 'mbti', label: 'MBTI Personality Type', required: true, helperText: 'Take the test at 16personalities.com if unsure' },
          { key: 'chronotype', type: 'radio', label: 'What\'s your chronotype?', options: CHRONOTYPE_OPTIONS, required: true },
          { key: 'forge_intent', type: 'radio', label: 'What do you hope to gain from Forge?', options: INTENT_OPTIONS_WRITER, required: true },
          { key: 'forge_intent_other', type: 'text', label: 'Please specify', placeholder: 'Tell us more...', helperText: 'Only if you selected "Other" above' },
        ],
      },
    ],
  },
  {
    key: 'hospitality',
    title: 'Hospitality Details',
    subtitle: 'Help us prepare for your stay',
    icon: '🍽️',
    introTitle: 'Almost there! Final details',
    introDescription: "We want to make sure your stay is comfortable. This helps us plan meals, rooms, and emergencies.",
    keepHandy: [
      { emoji: '📞', text: 'Emergency contact number' },
      { emoji: '👕', text: 'Your T-shirt size' },
      { emoji: '🍽️', text: 'Any dietary restrictions or allergies' },
    ],
    timeEstimate: '~2 minutes',
    responseTable: 'kyw_responses',
    steps: [
      {
        key: 'hospitality_details',
        title: 'Hospitality Details',
        subtitle: 'Meals, merch & emergency info',
        fields: [
          { key: 'meal_preference', type: 'meal-preference', label: 'Meal Preference', required: true },
          { key: 'food_allergies', type: 'text', label: 'Food Allergies', placeholder: 'None', required: true },
          { key: 'medication_support', type: 'text', label: 'Medication / Medical Support', placeholder: 'None', required: true },
          { key: 'tshirt_size', type: 'tshirt-size', label: 'T-Shirt Size', required: true },
          { key: 'emergency_contact_name', type: 'text', label: 'Emergency Contact Name', placeholder: 'Parent / Guardian name', required: true, inline: 'emergency_row' },
          { key: 'emergency_contact_number', type: 'phone', label: 'Emergency Contact Number', required: true, inline: 'emergency_row' },
          { key: 'terms_accepted', type: 'checkbox', label: 'I accept the Terms & Conditions', required: true },
        ],
      },
    ],
  },
];

// Map cohort_type to sections
export function getSectionsForCohort(cohortType: string): KYSection[] {
  switch (cohortType) {
    case 'FORGE':
      return KYF_SECTIONS;
    case 'FORGE_CREATORS':
      return KYC_SECTIONS;
    case 'FORGE_WRITING':
      return KYW_SECTIONS;
    default:
      return KYF_SECTIONS;
  }
}

// Get total step count for a section (intro + form steps)
export function getSectionTotalSteps(section: KYSection): number {
  return 1 + section.steps.length; // 1 for intro
}

// Calculate age from DOB
export function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}
