

# Populate Roadmap Days with Brochure Content (Edition-Agnostic Templates)

## Overview

Update/insert roadmap day data for the **latest edition of each cohort** with verbatim content from the three brochures. No dates or times will be set -- admins configure those later. The `useRoadmapData` hook's fallback logic means any user in the same cohort type will see this data automatically.

## Target Editions

| Cohort | Edition | ID | Current Rows |
|---|---|---|---|
| Filmmaking | Edition 15 | `ec048e00` | 0 (empty) |
| Writing | Edition 5 | `cf2b9fd2` | 0 (empty) |
| Creators | Edition 3 | `2fd72d93` | 7 bootcamp only |

## Data to Insert

### FORGE FILMMAKERS -- 15 rows (7 online + 8 bootcamp)

**Online Sessions** (`is_virtual = true`):

| day_number | Title |
|---|---|
| -7 | The Forge for Filmmakers: Orientation |
| -6 | Screenwriting for Short Films |
| -5 | Everything Cinematography (Theory) |
| -4 | Premise Approval |
| -3 | Everything Film Editing (Theory) |
| -2 | One-on-One Script Mentorship |
| -1 | One-on-One Script Mentorship (contd.) |

**Bootcamp Days** (`is_virtual = false`):

| day_number | Theme | Title | Key Schedule Items |
|---|---|---|---|
| 1 | Everything Everywhere All At Once | Orientation + Meet and Greet | Arrival, Orientation, Ice-breaker + Visual Story Game, Dinner, Psychology behind Powerful Storytelling |
| 2 | Super Deluxe | Learning + Pre-production | Improv Drill, Film Direction + Directors' Whisper + Conflict Improv, Everything Pre-production, Film Quiz |
| 3 | Aparajito | Learning + Pre-production | Practical Cinematography Workshop, Filmmaking Masterclass + Shot Division, Pre-production worksheets, Mock Shooting + Navarasa Drill |
| 4 | -- | Production and Review | Full day shoot |
| 5 | Gangs of Wasseypur | Production and Review | Full day shoot |
| 6 | Kantara | Post-production | Post Production Workshop Part 1, Post Production of Short Film, Campfire + Open Mic |
| 7 | Before Sunrise | Post-production | Post Production Workshop Part 2, Pitch Gauntlet, Dubbing + Sound Design, Final Cut + Rendering |
| 8 | Mayabazar | Screening and Farewell | Prepping movies, Photo Session + Networking, Screening + Feedback, Departure |

### FORGE WRITING -- 7 rows (0 online + 1 pre-forge + 6 bootcamp)

| day_number | Title | Key Schedule Items |
|---|---|---|
| 0 | Pre-Forge Preparation | -- |
| 1 | Orientation + Meet and Greet | Orientation, Psychology behind Powerful Storytelling, Dinner |
| 2 | Foundational Learning | Fundamentals of Storytelling, Independent Focus Writing, Writing with your senses, Developing Narratives + Structures |
| 3 | Advanced Learning | Advanced Writing, Mentorship Sessions, Writing Analysis with case studies |
| 4 | Drafts and Focus Writing | Sacred Forest Experience, Independent Focus Writing, Mentorship Sessions, Peer-to-Peer Feedback |
| 5 | Feedback and Prep | Focus Writing + Feedback, Focus Writing with your mentor, Pitching and Publishing 101 |
| 6 | Pitching and Farewell | Pitch your story, Farewell + Photo Session, Departure |

### FORGE CREATORS -- 6 new online + update 7 existing bootcamp

**Online Sessions** (new rows, `is_virtual = true`):

| day_number | Title |
|---|---|
| -6 | Orientation |
| -5 | Niche Discovery + Competitor Analysis |
| -4 | Storytelling for Social Media |
| -3 | Videography Theory |
| -2 | Assignment Review and Feedback |
| -1 | Video Editing Theory |

**Bootcamp Days** (update existing 7 rows with brochure-accurate titles and schedules):

| day_number | Theme | Title (updated) | Key Schedule Items |
|---|---|---|---|
| 0 | Preparation | Pre-Forge Preparation | (unchanged) |
| 1 | Foundation | Orientation and Creator Mindset | Orientation, Psychology behind Storytelling, Building the Creator Mindset, Community Night |
| 2 | Skills | Lighting, Scriptwriting and Pre-production | Art of Lighting, Scriptwriting, Write Your Script, Pre Production, Prep for Shoot, Mentorship |
| 3 | Production | Editing for Social Media and Shoot in Nature | Editing for Social Media, Edit with Mentors, Shoot in Nature |
| 4 | Production | Cretya Ubud and Community Building | Cretya Ubud experience, Community Building + Monetisation, Review + Acting in front of Camera |
| 5 | Business | Brands, Analytics and Shoot at Nuanu | Brands + Agencies 101, Analytics + Algo 101, Shoot at Nuanu Creative City |
| 6 | Celebration | Screening and Graduation | Planning Your Content Roadmap, Screening + Graduation, Checkout |

## Implementation

A single SQL migration that:

1. **DELETE** existing Creators Edition 3 bootcamp rows (7 rows) -- will be re-inserted with accurate data
2. **INSERT** 15 rows for Filmmaking Edition 15
3. **INSERT** 7 rows for Writing Edition 5
4. **INSERT** 13 rows for Creators Edition 3 (6 online + 7 bootcamp)

All rows will have:
- `date = NULL`, `session_start_time = NULL` (admin sets later)
- `schedule` column populated with JSONB array of `{"time": "...", "activity": "..."}` entries verbatim from brochures
- `is_active = true`
- Descriptions, theme names, and detailed schedule entries taken exactly from the PDFs

**No code changes needed** -- existing components already render `roadmap_days` dynamically. The online session rows will also make the "Online Sessions / Bootcamp" toggle appear automatically in `HomeJourneySection.tsx`.

