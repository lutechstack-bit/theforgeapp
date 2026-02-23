

# Replace Online Sessions with LevelUp Course Cards

## What Changes

In the Learn tab's "More from LevelUp" zone, the current "Online Sessions" carousel (which pulls from database `community_sessions`) will be replaced with 4 hardcoded premium course cards using the uploaded images.

## Card Design (matching uploaded reference)

Each card will be a tall portrait card (aspect ratio ~4:5) featuring:
- Full-bleed background image covering the entire card
- Dark gradient overlay from bottom for text readability
- Category tag pills at the top (e.g. "Screenwriting", "Storytelling")
- A wave/water icon at top-left (decorative branding element)
- Large bold title text in the lower portion, with one word highlighted in a warm accent color
- A thin horizontal divider line near the bottom
- Instructor row at the bottom: small circular avatar, name, subtitle, and LevelUp logo on the right
- Rounded corners (2xl), no visible border

## The 4 Cards (hardcoded data)

| # | Image | Tags | Title (accent word) | Instructor | Subtitle |
|---|---|---|---|---|---|
| 1 | 01.jpg | Screenwriting, Storytelling | The Future Of *Cinematic Storytelling* | Sarvesh Ponnusamy | International Award-Winning Filmmaker |
| 2 | 02.jpg | Writing, Publishing | From Idea To *Global Publisher* | Bishhal Paull | Author Of The Liar Among Us |
| 3 | 03.jpg | Visual, Lens | Master the Language of *Cinematography* | Bishhal Paull | Independent Cinematographer and Visual Storyteller |
| 4 | 04.jpg | (none) | Decoded *Edition 1* x LOKAH | (community icon) | A community discussion |

## Files Changed

| File | Change |
|---|---|
| `public/images/levelup/01.jpg` through `04.jpg` | Copy the 4 uploaded images to public folder |
| `src/pages/Learn.tsx` | Remove the `communitySessions` filter and the "Online Sessions" `CourseCarouselSection` block (lines 188-197). Replace with a new hardcoded `LevelUpCoursesSection` using a horizontal `ScrollableCardRow` of the 4 new premium cards. |
| `src/components/learn/LevelUpCourseCard.tsx` | **New component** -- a tall portrait card (~4:5 aspect) with full-bleed image, gradient overlay, category pills, styled title with accent word, instructor row with avatar, and LevelUp logo. Purely presentational, each card can optionally link to an external URL. |

## Technical Details

- Images go in `public/images/levelup/` since they are static assets referenced by URL path, not imported as ES modules
- The card component is self-contained with no database dependency -- all data is hardcoded in `Learn.tsx`
- The cards render inside the existing `ScrollableCardRow` for consistent horizontal scroll behavior with glassmorphism arrows
- Card width: `w-[260px] sm:w-[280px]` to fit ~1.5 cards on mobile, encouraging scroll discovery
- The `communitySessions` variable and its query filter are removed since no longer used
