

# Generate LLM Context Document for The Forge App

## What
Create a comprehensive markdown document (`forge-app-context.md`) that describes the entire Forge by LevelUp application — its purpose, architecture, features, data model, user flows, and admin capabilities. This document is designed to be fed to LLMs as context so they can understand the app deeply.

## Approach
Generate a single markdown file to `/mnt/documents/forge-app-context.md` using a script. The document will be structured as follows:

### Document Structure
1. **Overview** — What Forge is, who it's for, the brand ("Where Dreamers Become Doers")
2. **Cohort Types** — FORGE (Filmmaking), FORGE_WRITING (Writing), FORGE_CREATORS (Creators)
3. **Forge Modes** — PRE_FORGE, DURING_FORGE, POST_FORGE lifecycle
4. **User Journey** — Auth → Profile Setup → KY Form → Home Dashboard → Full app access
5. **Core Features** (one section each):
   - Home (hero banners, onboarding checklist, today's focus, journey section, batchmates, alumni showcase, payment tracking)
   - Community (creatives directory, gigs board, real-time chat with city/cohort groups, collaboration requests)
   - Roadmap (day-by-day journey, tasks, prep checklist, equipment, rules, gallery, student films)
   - Learn (courses, masterclasses, programs, continue watching, video progress tracking, upcoming sessions)
   - Events (event types, registration, virtual/in-person)
   - Perks (partner perks with claim forms)
   - Profile (bento grid layout, works portfolio, proficiency tiles, MBTI, public portfolio sharing)
   - KY Forms (Know Your — dynamic multi-step forms per cohort type)
   - Journey System (stages, tasks, streaks, progress tracking, sticky notes, announcements)
   - Updates/Changelog
6. **Data Model** — All major tables with key columns and relationships
7. **Admin Panel** — Full list of admin capabilities (users, editions, events, content, payments, etc.)
8. **Navigation** — Bottom nav (mobile), side nav (desktop), app layout
9. **Authentication & Authorization** — Email/password auth, RLS, admin roles via user_roles table
10. **Technical Stack** — React 18, Vite 5, TypeScript, Tailwind, Supabase, TanStack Query
11. **Key Patterns** — Feature flags, cohort-scoped content, edition-based isolation, forge mode gating

## Execution
- Single script writes the document to `/mnt/documents/forge-app-context.md`
- No codebase changes needed
- Output as a downloadable markdown file

