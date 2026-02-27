import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: userError } = await userClient.auth.getUser();
    if (userError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: adminRole } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('Starting test data setup...');

    // 1. Create editions for each cohort
    const editions = [
      { name: 'Forge Filmmaking - Goa Feb 2025', city: 'Goa', cohort_type: 'FORGE', forge_start_date: '2025-02-15', forge_end_date: '2025-02-21' },
      { name: 'Forge Writing - Goa Jan 2025', city: 'Goa', cohort_type: 'FORGE_WRITING', forge_start_date: '2025-01-20', forge_end_date: '2025-01-25' },
      { name: 'Forge Creators - Goa Oct 2024', city: 'Goa', cohort_type: 'FORGE_CREATORS', forge_start_date: '2024-10-04', forge_end_date: '2024-10-10' },
    ];

    const createdEditions: Record<string, string> = {};

    for (const edition of editions) {
      // Check if edition exists
      const { data: existing } = await adminClient
        .from('editions')
        .select('id')
        .eq('name', edition.name)
        .maybeSingle();

      if (existing) {
        createdEditions[edition.cohort_type] = existing.id;
        console.log(`Edition exists: ${edition.name}`);
      } else {
        const { data, error } = await adminClient
          .from('editions')
          .insert(edition)
          .select('id')
          .single();

        if (error) {
          console.error(`Error creating edition ${edition.name}:`, error);
        } else {
          createdEditions[edition.cohort_type] = data.id;
          console.log(`Created edition: ${edition.name}`);
        }
      }
    }

    // 2. Create test users
    const testUsers = [
      { email: 'test@film.in', password: 'test123', full_name: 'Film Test User', cohort_type: 'FORGE' },
      { email: 'test@writers.in', password: 'test123', full_name: 'Writer Test User', cohort_type: 'FORGE_WRITING' },
      { email: 'test@creators.in', password: 'test123', full_name: 'Creator Test User', cohort_type: 'FORGE_CREATORS' },
    ];

    for (const user of testUsers) {
      // Check if user exists
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === user.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        console.log(`User exists: ${user.email}`);
      } else {
        const { data, error } = await adminClient.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { full_name: user.full_name }
        });

        if (error) {
          console.error(`Error creating user ${user.email}:`, error);
          continue;
        }
        userId = data.user.id;
        console.log(`Created user: ${user.email}`);
      }

      // Update profile with edition
      const editionId = createdEditions[user.cohort_type];
      if (editionId) {
        const { error: profileError } = await adminClient
          .from('profiles')
          .update({
            full_name: user.full_name,
            edition_id: editionId,
            kyf_completed: true, // So they can access main app
            payment_status: 'BALANCE_PAID',
            unlock_level: 'FULL'
          })
          .eq('id', userId);

        if (profileError) {
          console.error(`Error updating profile for ${user.email}:`, profileError);
        } else {
          console.log(`Updated profile for ${user.email} with edition ${user.cohort_type}`);
        }
      }
    }

    // 3. Create roadmap days for each edition
    // Forge Writing Roadmap (6 days)
    const writingEditionId = createdEditions['FORGE_WRITING'];
    if (writingEditionId) {
      // Delete existing roadmap days for this edition
      await adminClient.from('roadmap_days').delete().eq('edition_id', writingEditionId);

      const writingDays = [
        { edition_id: writingEditionId, day_number: 0, title: 'Pre-Forge Preparation', description: 'Complete your profile, review materials, and prepare for the writing journey', is_active: true, checklist: ['Complete KYF form', 'Join community chat', 'Review welcome guide', 'Pack your notebooks'] },
        { edition_id: writingEditionId, day_number: 1, title: 'Orientation & Psychology of Storytelling', description: 'Meet your cohort and explore the psychology behind powerful storytelling', date: '2025-01-20', call_time: '16:30', location: 'Goa Resort', is_active: true, checklist: ['Arrive by 4:30 PM', 'Attend orientation', 'Workshop: Psychology of Storytelling', 'Community dinner'] },
        { edition_id: writingEditionId, day_number: 2, title: 'Foundational Learning', description: 'Master fundamentals of storytelling, writing with senses, and narrative structures', date: '2025-01-21', call_time: '08:30', location: 'Goa Resort', is_active: true, checklist: ['Fundamentals of Storytelling', 'Independent Focus Writing', 'Writing with your senses', 'Developing Narratives & Structures'] },
        { edition_id: writingEditionId, day_number: 3, title: 'Advanced Writing & Mentorship', description: 'Deep dive into advanced writing techniques with 1:1 mentorship sessions', date: '2025-01-22', call_time: '08:30', location: 'Goa Resort', is_active: true, checklist: ['Advanced Writing workshop', 'Mentorship sessions (slots)', 'Writing Analysis with case studies'] },
        { edition_id: writingEditionId, day_number: 4, title: 'Sacred Forest & Focus Writing', description: 'Immersive sacred forest experience followed by intensive writing sessions', date: '2025-01-23', call_time: '05:30', location: 'Sacred Forest + Resort', is_active: true, checklist: ['Sacred Forest Experience (5:30 AM)', 'Independent Focus Writing', 'Mentorship sessions', 'Peer-to-Peer Feedback'] },
        { edition_id: writingEditionId, day_number: 5, title: 'Feedback & Publishing', description: 'Focus writing with feedback and learn pitching and publishing essentials', date: '2025-01-24', call_time: '08:30', location: 'Goa Resort', is_active: true, checklist: ['Focus Writing & Feedback', 'Writing with your mentor', 'Pitching and Publishing 101'] },
        { edition_id: writingEditionId, day_number: 6, title: 'Pitch & Farewell', description: 'Present your story pitch and celebrate your journey', date: '2025-01-25', call_time: '08:30', location: 'Goa Resort', is_active: true, checklist: ['Pitch your story', 'Farewell & Photo Session', 'Departure'] },
      ];

      const { error } = await adminClient.from('roadmap_days').insert(writingDays);
      if (error) console.error('Error inserting writing days:', error);
      else console.log('Created Writing roadmap days');
    }

    // Forge Creators Roadmap (7 days)
    const creatorsEditionId = createdEditions['FORGE_CREATORS'];
    if (creatorsEditionId) {
      await adminClient.from('roadmap_days').delete().eq('edition_id', creatorsEditionId);

      const creatorsDays = [
        { edition_id: creatorsEditionId, day_number: 0, title: 'Pre-Forge Preparation', description: 'Complete your profile, charge your gear, and get ready to create', is_active: true, checklist: ['Complete KYF form', 'Join community chat', 'Charge camera & power banks', 'Pack creator gear'] },
        { edition_id: creatorsEditionId, day_number: 1, title: 'Orientation & Creator Mindset', description: 'Kickoff with orientation, storytelling psychology, and building the creator mindset', date: '2024-10-04', call_time: '16:00', location: 'Bambolim Beach Resort', is_active: true, checklist: ['Orientation (4-5:30 PM)', 'Psychology Behind Storytelling', 'Building the Creator Mindset', 'Community Night'] },
        { edition_id: creatorsEditionId, day_number: 2, title: 'Hooks, Scripts & Production', description: 'Master the art of hooks, scriptwriting, content strategy, and camera basics', date: '2024-10-05', call_time: '08:00', location: 'Bambolim Beach Resort', is_active: true, checklist: ['Art of the Hook', 'Scriptwriting', 'Content Strategy', 'Pre Production', 'Camera and Lighting', 'Prep for Shoot', 'Mentorship'] },
        { edition_id: creatorsEditionId, day_number: 3, title: 'Edit & Shoot at Beach', description: 'Learn social media editing and shoot at the beautiful beach', date: '2024-10-06', call_time: '08:00', location: 'Beach Location', is_active: true, checklist: ['Editing for Social Media', 'Prep for Shoot', 'Shoot at the Beach', 'Edit with Mentors + Post'] },
        { edition_id: creatorsEditionId, day_number: 4, title: 'Community & City Shoot', description: 'Learn community building, monetization, and shoot in the city', date: '2024-10-07', call_time: '08:00', location: 'City Location', is_active: true, checklist: ['Community Building & Monetisation', 'Prep for Shoot', 'Shoot in the City', 'Edit with Mentors + Post'] },
        { edition_id: creatorsEditionId, day_number: 5, title: 'Brand Videos & Divar Island', description: 'Brand video masterclass and stunning shoot at Divar Island', date: '2024-10-08', call_time: '08:00', location: 'Divar Island', is_active: true, checklist: ['Brand Videos 101', 'Prep for Shoot', 'Shoot at Divar Island', 'Edit with Mentors + Post'] },
        { edition_id: creatorsEditionId, day_number: 6, title: 'Analytics & Brand Shoot', description: 'Master analytics and algorithms, then shoot professional brand content', date: '2024-10-09', call_time: '08:00', location: 'Bambolim Beach Resort', is_active: true, checklist: ['Analytics & Algo 101', 'Prep for Shoot', 'Shoot for Brands', 'Edit with Mentors + Post'] },
        { edition_id: creatorsEditionId, day_number: 7, title: 'Content Roadmap & Farewell', description: 'Plan your content roadmap and celebrate your creator journey', date: '2024-10-10', call_time: '08:00', location: 'Bambolim Beach Resort', is_active: true, checklist: ['Planning Your Content Roadmap', 'Checkout by 12:30 PM'] },
      ];

      const { error } = await adminClient.from('roadmap_days').insert(creatorsDays);
      if (error) console.error('Error inserting creators days:', error);
      else console.log('Created Creators roadmap days');
    }

    // Forge Filmmaking Roadmap (6 days)
    const filmEditionId = createdEditions['FORGE'];
    if (filmEditionId) {
      await adminClient.from('roadmap_days').delete().eq('edition_id', filmEditionId);

      const filmDays = [
        { edition_id: filmEditionId, day_number: 0, title: 'Pre-Forge Preparation', description: 'Complete your profile, watch pre-work videos, and prepare for the filmmaking journey', is_active: true, checklist: ['Complete KYF form', 'Join community chat', 'Watch BFP pre-work videos', 'Pack filmmaking gear'] },
        { edition_id: filmEditionId, day_number: 1, title: 'Orientation & Visual Storytelling', description: 'Meet your cohort and dive into the fundamentals of visual storytelling', date: '2025-02-15', call_time: '14:00', location: 'Goa Resort', is_active: true, checklist: ['Check-in and settle', 'Orientation session', 'Visual Storytelling Fundamentals', 'Community dinner'] },
        { edition_id: filmEditionId, day_number: 2, title: 'Cinematography Masterclass', description: 'Deep dive into camera work, lighting, and composition', date: '2025-02-16', call_time: '08:00', location: 'Goa Resort', is_active: true, checklist: ['Cinematography fundamentals', 'Lighting workshop', 'Composition & framing', 'Hands-on shooting exercise'] },
        { edition_id: filmEditionId, day_number: 3, title: 'Direction & Storytelling', description: 'Learn directing techniques and advanced storytelling methods', date: '2025-02-17', call_time: '08:00', location: 'Goa Resort', is_active: true, checklist: ['Directing masterclass', 'Working with actors', 'Scene blocking', 'Mentorship sessions'] },
        { edition_id: filmEditionId, day_number: 4, title: 'Production Day', description: 'Full production day - shoot your short film project', date: '2025-02-18', call_time: '06:00', location: 'Multiple Locations', is_active: true, checklist: ['Pre-production briefing', 'Location shoots', 'Crew collaboration', 'Daily wrap review'] },
        { edition_id: filmEditionId, day_number: 5, title: 'Post-Production', description: 'Editing, color grading, and sound design', date: '2025-02-19', call_time: '08:00', location: 'Goa Resort', is_active: true, checklist: ['Editing fundamentals', 'Color grading workshop', 'Sound design', 'Final cut preparation'] },
        { edition_id: filmEditionId, day_number: 6, title: 'Premiere & Farewell', description: 'Screen your films and celebrate your journey', date: '2025-02-20', call_time: '10:00', location: 'Goa Resort', is_active: true, checklist: ['Film premiere screening', 'Feedback session', 'Industry panel Q&A', 'Farewell celebration'] },
      ];

      const { error } = await adminClient.from('roadmap_days').insert(filmDays);
      if (error) console.error('Error inserting film days:', error);
      else console.log('Created Filmmaking roadmap days');
    }

    console.log('Test data setup complete!');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test data created successfully',
        editions: createdEditions
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
