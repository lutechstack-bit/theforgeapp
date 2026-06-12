-- Seed the Forge AI Residency roadmap (edition E1) from the Welcome Guide.
-- 5 online pre-sessions (is_virtual, negative day_number) + 9 in-person days.
-- Run in the Lovable SQL editor. Idempotent: clears FAI E1 days first.

DO $$
DECLARE eid uuid := 'f574008e-e6ad-4640-b330-96a649d13abd';  -- FAI "E1"
BEGIN

DELETE FROM public.roadmap_days WHERE edition_id = eid;

-- ── ONLINE PRE-SESSIONS (is_virtual = true) ──────────────────────────────────
INSERT INTO public.roadmap_days (edition_id, cohort_type, day_number, title, theme_name, objective, is_virtual, is_active, schedule) VALUES
 (eid,'FAI',-5,'The AI Mindset','Online Session','Reset how you think about working with AI.',true,true,'[]'::jsonb),
 (eid,'FAI',-4,'Prompting & Context Engineering','Online Session','Write prompts that actually work for real projects.',true,true,'[]'::jsonb),
 (eid,'FAI',-3,'AI & Business Thinking','Online Session','See where AI creates real business leverage.',true,true,'[]'::jsonb),
 (eid,'FAI',-2,'Case Study Breakdown','Online Session','Dissect real AI builds end to end.',true,true,'[]'::jsonb),
 (eid,'FAI',-1,'Pre-Arrival Alignment','Online Session','Get aligned and ready before the residency.',true,true,'[]'::jsonb);

-- ── IN-PERSON DAYS ───────────────────────────────────────────────────────────
INSERT INTO public.roadmap_days (edition_id, cohort_type, day_number, title, theme_name, objective, is_virtual, is_active, schedule) VALUES
 (eid,'FAI',1,'Welcome to the Forge','Arrival & Orientation','Land, settle in, and learn the psychology behind storytelling.',false,true,
  '[{"time":"2:00 PM","activity":"Check In"},
    {"time":"5:30 PM – 7:30 PM","activity":"Orientation"},
    {"time":"7:30 PM – 8:30 PM","activity":"Learn: Psychology Behind Storytelling"},
    {"time":"8:30 PM – 9:30 PM","activity":"Dinner"},
    {"time":"9:30 PM – 10:30 PM","activity":"Learn: Psychology Behind Storytelling"}]'::jsonb),

 (eid,'FAI',2,'Generative AI: Foundations','Build with Generative AI','Master prompting, AI image, video and voice generation.',false,true,
  '[{"time":"9:00 AM – 9:15 AM","activity":"Morning Standup and Focus"},
    {"time":"9:15 AM – 11:15 AM","activity":"Learn Advanced Prompting for Real Work"},
    {"time":"11:15 AM – 12:30 PM","activity":"Build Your First Prompt Chain"},
    {"time":"12:30 PM – 1:30 PM","activity":"Lunch"},
    {"time":"1:30 PM – 3:00 PM","activity":"Learn AI Image Generation with Higgsfield"},
    {"time":"3:00 PM – 4:30 PM","activity":"Build: Create Your Brand Visual Pack"},
    {"time":"4:30 PM – 6:00 PM","activity":"Learn AI Video and Voice Generation"},
    {"time":"6:00 PM – 7:30 PM","activity":"Build: Create Your First AI Video"},
    {"time":"7:30 PM – 8:30 PM","activity":"Dinner"},
    {"time":"8:30 PM – 10:30 PM","activity":"Build Night: Build Session"}]'::jsonb),

 (eid,'FAI',3,'Generative AI: Content & Systems','Content & Launch Systems','Turn AI into a content + launch system.',false,true,
  '[{"time":"9:00 AM – 9:15 AM","activity":"Morning Standup and Focus"},
    {"time":"9:15 AM – 11:00 AM","activity":"Learn Content Strategy & Launch Asset Creation"},
    {"time":"11:00 AM – 12:30 PM","activity":"Build Your Mini Launch Content Pack"},
    {"time":"12:30 PM – 1:30 PM","activity":"Lunch"},
    {"time":"1:30 PM – 3:00 PM","activity":"Learn Cowork as a Content System"},
    {"time":"3:00 PM – 4:30 PM","activity":"Build: Set Up Your Cowork Workspace"},
    {"time":"4:30 PM – 6:00 PM","activity":"Learn Landing Page Copy and Funnel Setup"},
    {"time":"6:00 PM – 7:30 PM","activity":"Build Your Landing Page Draft"},
    {"time":"7:30 PM – 8:30 PM","activity":"Dinner"},
    {"time":"8:30 PM – 10:30 PM","activity":"Build Night: Build Session"}]'::jsonb),

 (eid,'FAI',4,'Automations & Agents: Foundations','Automate with Agents','Build automations and AI agents with n8n + Claude Code.',false,true,
  '[{"time":"9:00 AM – 9:15 AM","activity":"Morning Standup and Focus"},
    {"time":"9:15 AM – 11:15 AM","activity":"Learn Automation Thinking and Building with n8n"},
    {"time":"11:15 AM – 12:30 PM","activity":"Build Your First Automation"},
    {"time":"12:30 PM – 1:30 PM","activity":"Lunch"},
    {"time":"1:30 PM – 3:00 PM","activity":"Learn Claude Code for Scripting and File Automation"},
    {"time":"3:00 PM – 4:30 PM","activity":"Build Your First Claude Code Skill"},
    {"time":"4:30 PM – 6:00 PM","activity":"Learn AI Agents: Build Systems That Think and Act"},
    {"time":"6:30 PM – 7:30 PM","activity":"Dinner"},
    {"time":"7:30 PM – 10:30 PM","activity":"Build Night: Build Session"}]'::jsonb),

 (eid,'FAI',5,'Automations & Agents: Build Day 1','Voice Agents','Build a working voice agent and extend your systems.',false,true,
  '[{"time":"9:00 AM – 9:30 AM","activity":"Morning Standup and Focus"},
    {"time":"9:30 AM – 11:00 AM","activity":"Learn Voice Agents: AI That Speaks and Listens"},
    {"time":"11:30 AM – 1:30 PM","activity":"Build Your Voice Agent"},
    {"time":"1:30 PM – 2:30 PM","activity":"Lunch"},
    {"time":"2:30 PM – 7:00 PM","activity":"Build: Extended Build Session"},
    {"time":"6:30 PM – 7:30 PM","activity":"Dinner"},
    {"time":"7:30 PM – 10:30 PM","activity":"Build Night: Build Session"}]'::jsonb),

 (eid,'FAI',6,'Automations & Agents: Build Day 2','Full Workflow Systems','Design and build a complete business workflow system.',false,true,
  '[{"time":"9:00 AM – 9:30 AM","activity":"Morning Standup and Focus"},
    {"time":"9:30 AM – 10:30 AM","activity":"Learn Workflow Design for Full Business Processes"},
    {"time":"10:30 AM – 1:30 PM","activity":"Build Your Complete Workflow System"},
    {"time":"1:30 PM – 2:30 PM","activity":"Lunch"},
    {"time":"2:30 PM – 7:00 PM","activity":"Build: Extended Build Session"},
    {"time":"7:00 PM Onwards","activity":"Experience"}]'::jsonb),

 (eid,'FAI',7,'Product Building: Foundations & Build Start','Build Your Product','Think like a product builder and ship your first working product.',false,true,
  '[{"time":"9:00 AM – 9:15 AM","activity":"Morning Standup and Focus"},
    {"time":"9:15 AM – 11:00 AM","activity":"Learn Product Thinking for Non-Developers"},
    {"time":"11:00 AM – 12:30 PM","activity":"Learn Technical Concepts Every Builder Needs"},
    {"time":"12:30 PM – 1:30 PM","activity":"Lunch"},
    {"time":"1:30 PM – 4:00 PM","activity":"Learn Building with Lovable: Full Walkthrough"},
    {"time":"4:00 PM – 7:00 PM","activity":"Build Your First Working Product"},
    {"time":"7:00 PM – 8:00 PM","activity":"Dinner"},
    {"time":"8:00 PM – 10:30 PM","activity":"Build Night: Build Session"}]'::jsonb),

 (eid,'FAI',8,'Product Building: Complete & Launch Ready','Launch Ready','Finish your product and prep your demo with faculty.',false,true,
  '[{"time":"9:00 AM – 9:30 AM","activity":"Morning Standup and Focus"},
    {"time":"9:30 AM – 11:00 AM","activity":"Learn Database Design, AI Features, and Product Analytics"},
    {"time":"11:00 AM – 1:30 PM","activity":"Build: Complete Your Product"},
    {"time":"1:30 PM – 2:30 PM","activity":"Lunch"},
    {"time":"2:30 PM – 7:00 PM","activity":"Build: Extended Build Session"},
    {"time":"7:00 PM – 8:00 PM","activity":"Dinner"},
    {"time":"8:00 PM – 10:00 PM","activity":"Build with Faculty: Demo Preparation"}]'::jsonb),

 (eid,'FAI',9,'Demo Day & Graduation','Demo & Graduate','Show what you built, graduate, and head home a builder.',false,true,
  '[{"time":"8:00 AM – 9:00 AM","activity":"Breakfast"},
    {"time":"9:00 AM – 12:30 PM","activity":"Demo Day"},
    {"time":"12:30 PM – 1:30 PM","activity":"Farewell and Graduation"},
    {"time":"1:30 PM","activity":"Checkout"}]'::jsonb);

END $$;
