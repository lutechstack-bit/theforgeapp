

# Rebuild Perks Page: GrowthX-Style Partner Perks System

## Overview
Replace the entire current Perks page (acceptance card, bag items, partnership hero) with a dynamic, admin-managed partner perks system inspired by GrowthX. Partner cards in a grid, clicking opens a detail page with about info + a claim form. Everything DB-driven.

## Database Changes

### Table 1: `perks`
Stores each partner perk card.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name | text | Partner name (Sony, Digitek, etc.) |
| headline | text | e.g. "20% + Discount on Cinema Line Cameras & Lenses" |
| logo_url | text | Partner logo image |
| banner_url | text | Optional banner/cover image for detail page |
| banner_color | text | Fallback color if no banner |
| about | text | Rich description for detail page |
| offer_details | text | What the offer includes |
| how_to_avail | text | Steps to claim |
| notes | text | Additional notes |
| claim_url | text | Optional external claim link |
| category | text | e.g. "Equipment", "Software" |
| cohort_types | text[] | Which cohorts see this perk |
| is_active | boolean | Toggle visibility |
| is_coming_soon | boolean | Show as "Coming Soon" |
| order_index | integer | Sort order |
| created_at | timestamptz | |

RLS: Admins manage all, authenticated users can view active perks.

### Table 2: `perk_form_fields`
Custom form fields per perk (admin-configurable).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| perk_id | uuid FK → perks | |
| label | text | Field label shown to user |
| field_type | text | "text", "textarea", "email", "phone" |
| placeholder | text | |
| is_required | boolean | |
| order_index | integer | |

RLS: Admins manage, authenticated users view.

### Table 3: `perk_claims`
Stores user form submissions.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| perk_id | uuid FK → perks | |
| user_id | uuid | |
| form_data | jsonb | All field responses |
| created_at | timestamptz | |

RLS: Users insert/view own, admins view all.

## Seed Data
Insert 4 perks:
1. **Sony** — logo: `/images/brands/sony.png`, headline: "20% + Discount on Cinema Line Cameras & Lenses", category: "Equipment"
2. **Sandcastles** — logo: uploaded SandCastles.png (copy to `public/images/brands/sandcastles.png`), headline: "50% off on First 3 months Subscription", category: "Software"
3. **Digitek** — logo: `/images/brands/digitek.png`, headline: "10% off on all Creator Equipment", category: "Equipment"
4. **Canon** — headline: "Coming Soon", is_coming_soon: true, category: "Equipment"

Insert default form fields for Sony, Sandcastles, Digitek:
- Full Name (text, required)
- Edition & Program (text, required)
- Address (textarea, required)
- Products / specific request (text, required — label varies per perk)
- Email (email, required)
- Phone (phone, required)

## Frontend Changes

### 1. New Route: `/perks/:id` → `PerkDetail.tsx`
Detail page with:
- Back button header (like GrowthX reference)
- Banner image/color strip
- Logo overlapping the banner
- Partner name + headline
- About section
- Offer Details section
- How to Avail section
- Claim form (dynamic fields from `perk_form_fields`)
- Submit saves to `perk_claims`

### 2. Rebuild `src/pages/Perks.tsx`
- Header: "Perks" title
- Optional category filter pills (All, Equipment, Software, etc.)
- Grid of perk cards (GrowthX-style: dark cards, logo on left, headline text, product image on right)
- Cards with `is_coming_soon` show a "Coming Soon" badge and are not clickable
- Click navigates to `/perks/:id`

### 3. New Components
- `src/components/perks/PerkCard.tsx` — Grid card
- `src/components/perks/PerkClaimForm.tsx` — Dynamic form
- `src/pages/PerkDetail.tsx` — Detail page

### 4. Remove Old Components
- Delete `PartnershipHero.tsx` (no longer used)
- Delete `AcceptanceShareCard.tsx` (no longer used)
- Remove old hardcoded bag items, acceptance card from Perks.tsx

### 5. Admin Page: `src/pages/admin/AdminPerks.tsx`
Full CRUD for:
- Perks (create/edit/delete partner cards with all fields)
- Form fields per perk (add/remove/reorder fields)
- View claim submissions per perk

Add to `AdminLayout.tsx` nav items and `App.tsx` routes.

### 6. Route Updates in `App.tsx`
- Add `/perks/:id` route inside the app layout
- Add `/admin/perks` route

## Files Summary

| Action | File |
|--------|------|
| Create | DB migration (3 tables + seed data) |
| Copy | `SandCastles.png` → `public/images/brands/sandcastles.png` |
| Rewrite | `src/pages/Perks.tsx` |
| Create | `src/pages/PerkDetail.tsx` |
| Create | `src/components/perks/PerkCard.tsx` |
| Create | `src/components/perks/PerkClaimForm.tsx` |
| Create | `src/pages/admin/AdminPerks.tsx` |
| Edit | `src/App.tsx` (add routes) |
| Edit | `src/components/admin/AdminLayout.tsx` (add nav item) |
| Delete | `src/components/perks/PartnershipHero.tsx` |
| Delete | `src/components/perks/AcceptanceShareCard.tsx` |

