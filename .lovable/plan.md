

# Add "Start Learning" Button to Masterclass Cards + Explore Programs Banners

## What Changes

Two additions to the Learn page:
1. A gold "Start Learning" button below each masterclass card image
2. A new "Explore Programs" section with 3 full-width gradient banners, each with a centered "Request Invite" CTA

## Changes

### 1. Update MasterclassCard.tsx -- Add "Start Learning" Button

Add a gold gradient "Start Learning >" button below the image inside each card, matching the reference style:
- Button uses the brand gold gradient (from #FFBC3B to #D38F0C)
- Full width within the card
- Text: "Start Learning" with a chevron-right icon
- Click still opens the external link in a new tab

### 2. Create ProgramBanner Component

**New file: `src/components/learn/ProgramBanner.tsx`**

A full-width banner card with:
- Left side: "LEVELUP PROGRAM" label, bold title, description text
- Right side: gradient background (will eventually support an admin-uploaded image)
- Centered gold "REQUEST INVITE" button
- Each banner has a unique gradient tint (purple-blue, blue, olive-gold)
- On click, the CTA opens an external link in a new tab

### 3. Update Learn.tsx -- Add "Explore Programs" Section

After the "Learn from the Best" section, add a new section titled "Explore Programs" with 3 hardcoded banners:

| Program | Description | Gradient |
|---------|-------------|----------|
| Breakthrough Filmmaking | Comprehensive 12-week program to master filmmaking from script to screen. | Purple-blue |
| Video Editing Academy | Master professional video editing with industry-standard tools and techniques. | Blue |
| Cinematography Masterclass | Learn the art of visual storytelling from award-winning cinematographers. | Olive-gold |

Each banner has a "REQUEST INVITE" button. The CTA links will be placeholder external URLs for now (e.g., linking to the main LevelUp site).

## Files Summary

| File | Action |
|------|--------|
| `src/components/learn/MasterclassCard.tsx` | UPDATE -- Add gold "Start Learning" button below the image |
| `src/components/learn/ProgramBanner.tsx` | CREATE -- New full-width gradient banner with centered CTA |
| `src/pages/Learn.tsx` | UPDATE -- Add "Explore Programs" section with 3 hardcoded banners |

