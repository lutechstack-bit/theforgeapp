
# Comprehensive UX Fixes -- 28 Issues

This is a large batch of fixes across navigation, accessibility, consistency, performance, and design system. No layout, spacing changes to component structure -- only targeted surgical edits.

---

## Group A: Navigation Fixes (1.2, 1.3, 1.7)

### 1.2 -- Add Community to mobile BottomNav
**File:** `src/components/layout/BottomNav.tsx`
- Add `MessageCircle` (or `Users`) icon to nav items as 5th tab
- Reorder: Home, Roadmap, Learn, Community, Profile (drop Events to the Profile sheet)
- Events is lower priority than Community for daily engagement

### 1.3 -- Rename "About Forge" to "Updates"
**Files:** `src/components/layout/SideNav.tsx`, `src/components/layout/MobileMenuSheet.tsx`
- Change `bottomItems` label from `'About Forge'` to `'Updates'`
- Change MobileMenuSheet `menuItems` entry from `'About Forge'` to `'Updates'`

### 1.7 -- Fix Roadmap sub-route active state
**File:** `src/components/layout/BottomNav.tsx`, `src/components/layout/SideNav.tsx`
- Change `location.pathname === to` to `location.pathname === to || (to === '/roadmap' && location.pathname.startsWith('/roadmap/'))`
- Same pattern in SideNav's `isActive` check

---

## Group B: Page-Level Fixes (1.4, 1.6)

### 1.4 -- Restructure Welcome page
**File:** `src/pages/Welcome.tsx`
- Replace celebration-only content with an orientation welcome screen
- Show: "Welcome to Forge" heading, 3 quick-start cards (Explore Roadmap, Set Up Profile, Join Community), and a "Get Started" CTA to Home
- Keep using `KYFormCompletion` only when KY form is actually completed (add a conditional check)

### 1.6 -- Fix NotFound page
**File:** `src/pages/NotFound.tsx`
- Change `bg-muted` to `bg-background`
- Replace `<a href="/">` with `<Link to="/">` inside a `<Button>`
- Match dark theme styling

---

## Group C: Shared EmptyState Component (2.4)

### Create `src/components/shared/EmptyState.tsx`
- Props: `icon`, `title`, `description`, optional `action` (button label + onClick)
- Consistent styling: `rounded-2xl p-8 text-center bg-card/50 border border-border/30`
- Icon: `h-12 w-12 text-primary/50 mx-auto mb-4`

### Update pages to use shared EmptyState:
- `src/pages/Learn.tsx` (empty courses state)
- `src/pages/Events.tsx` (no events found)
- `src/pages/Community.tsx` (no messages placeholder if applicable)
- `src/pages/Home.tsx` (content coming soon)
- `src/pages/Updates.tsx` (no notifications)

---

## Group D: Accessibility Fixes (3.2, 3.5, 3.7, 3.6)

### 3.2 -- Avatar alt text
**Files:** `src/components/layout/SideNav.tsx`, `src/components/layout/BottomNav.tsx`
- Change `alt=""` on profile avatar images to `alt={profile?.full_name || 'Profile photo'}`

### 3.5 -- Password toggle aria-labels
**File:** `src/pages/Auth.tsx`
- Add `aria-label={showPassword ? 'Hide password' : 'Show password'}` to both password toggle buttons
- Add `aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}` to confirm toggle

### 3.7 -- Focus ring visibility
**File:** `src/components/ui/button.tsx`
- Change `focus-visible:ring-2 focus-visible:ring-ring` to `focus-visible:ring-2 focus-visible:ring-primary/70`
- This makes the focus ring more visible on dark backgrounds

### 3.6 -- BottomNav profile button aria-label
**File:** `src/components/layout/BottomNav.tsx`
- Add `aria-label="Open profile menu"` to the profile sheet trigger button

---

## Group E: Responsive Fixes (4.1, 4.3, 4.4)

### 4.1 -- Bottom padding for BottomNav clipping
**File:** `src/components/layout/AppLayout.tsx`
- Change `pb-20` to `pb-24` on the main element to prevent content clipping

### 4.3 -- Sidebar default collapsed on tablet
**File:** `src/contexts/SidebarContext.tsx`
- Initialize `collapsed` based on screen width: default to `true` if viewport is below `lg` (1024px)
- Use `window.innerWidth < 1024` as initial state

### 4.4 -- Perks grid on small screens
**File:** `src/pages/Perks.tsx`
- Change bag items grid from `grid-cols-2 sm:grid-cols-3` to `grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3`

---

## Group F: Performance and Feedback (5.1, 5.2, 5.3, 5.4, 5.5, 5.6)

### 5.1 -- Community loading skeleton
**File:** `src/pages/Community.tsx`
- Replace the bare `Loader2` spinner with a skeleton layout: header placeholder, group tabs placeholder, and chat area placeholder

### 5.2 -- Home page section skeletons
**File:** `src/pages/Home.tsx`
- Add skeleton placeholders for Countdown, Focus, Journey, and Batchmates sections while loading
- Use `Skeleton` component from `@/components/ui/skeleton`

### 5.3 -- Profile loading skeleton
**File:** `src/pages/Profile.tsx`
- Add a loading check and show skeleton for ProfileHero and sections while `profileData` is loading

### 5.4 -- Bio save feedback
**File:** `src/pages/Profile.tsx`
- Add `toast({ title: 'Bio Updated', description: 'Your bio has been saved.' })` after successful bio save

### 5.5 -- Sign out confirmation
**File:** `src/pages/Profile.tsx`
- Wrap `handleSignOut` with a confirmation dialog using `AlertDialog`
- "Are you sure you want to sign out?"

### 5.6 -- Delete work confirmation
**File:** `src/pages/Profile.tsx`
- Wrap `handleDeleteWork` with a confirmation: "Are you sure you want to delete this work?"
- Use `window.confirm()` for simplicity or an `AlertDialog`

---

## Group G: Design System Consistency (6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 2.3, 2.5)

### 6.1 -- Fix CSS comment mismatch
**File:** `src/index.css`
- Update comment from "EXACT 5 COLORS" to "EXACT 6 TOKENS" (since there are 6 forge tokens)

### 6.2 -- Standardize page titles
**File:** `src/index.css`
- Add utility class: `.page-title { @apply text-2xl sm:text-3xl font-bold text-foreground; }`
- Update page title classes in Home, Learn, Events, Profile, Updates to use `.page-title` or the same Tailwind classes consistently: `text-2xl sm:text-3xl font-bold`

### 6.3 -- Standardize page container padding
**File:** `src/index.css`
- Add utility class: `.page-container { @apply px-4 sm:px-5 md:px-6 py-4 md:py-6; }`
- Update Home, Learn, Events, Profile, Community, Perks, Updates pages to use consistent padding

### 6.4 -- Consistent max-widths
- Reading/profile pages: `max-w-3xl mx-auto` (Home, Profile, Updates, Community)
- Grid pages: `max-w-5xl mx-auto` (Events, Learn)
- Roadmap: fluid (keep as-is, it has sidebar)

### 6.5 -- Standardize icon stroke widths
**Files:** `src/components/layout/SideNav.tsx`, `src/components/layout/BottomNav.tsx`
- Both navs: inactive = `strokeWidth={2}`, active = `strokeWidth={2.5}`

### 6.6 -- Consolidate glass utilities
**File:** `src/index.css`
- Keep 3 glass variants: `glass-surface` (rename from `glass`), `glass-card`, `glass-nav`
- Remove `glass-card-hover`, `glass-premium` (merge into `glass-card` with hover state)
- Add `glass-card:hover` styles directly
- Search for usage of removed classes and replace

### 2.3 -- Standardize border radii
- Cards: `rounded-2xl`
- Interactive sub-items: `rounded-xl`
- Inputs: `rounded-lg` (already standard from button/input components)
- Fix inconsistencies in Perks bag items (remove `md:rounded-2xl`, just use `rounded-xl`)

### 2.5 -- Remove misleading hover on Perks bag items
**File:** `src/pages/Perks.tsx`
- Remove `hover:scale-[1.02]`, `hover:border-primary/40`, `hover:shadow-gold-glow` from bag item cards
- These are display-only items, not interactive

---

## Files Changed Summary

| File | Issues Fixed |
|------|-------------|
| `src/components/layout/BottomNav.tsx` | 1.2, 1.7, 3.2, 3.6, 6.5 |
| `src/components/layout/SideNav.tsx` | 1.3, 1.7, 3.2, 6.5 |
| `src/components/layout/MobileMenuSheet.tsx` | 1.3 |
| `src/components/layout/AppLayout.tsx` | 4.1 |
| `src/contexts/SidebarContext.tsx` | 4.3 |
| `src/pages/NotFound.tsx` | 1.6 |
| `src/pages/Welcome.tsx` | 1.4 |
| `src/pages/Auth.tsx` | 3.5 |
| `src/pages/Profile.tsx` | 5.4, 5.5, 5.6 |
| `src/pages/Home.tsx` | 5.2, 6.2, 6.3 |
| `src/pages/Learn.tsx` | 2.4, 6.2, 6.3 |
| `src/pages/Events.tsx` | 2.4, 6.2, 6.3 |
| `src/pages/Community.tsx` | 5.1, 6.3 |
| `src/pages/Updates.tsx` | 2.4, 6.2, 6.3 |
| `src/pages/Perks.tsx` | 2.5, 4.4, 6.3 |
| `src/components/ui/button.tsx` | 3.7 |
| `src/components/shared/EmptyState.tsx` | 2.4 (new file) |
| `src/index.css` | 6.1, 6.2, 6.3, 6.6 |

Total: 28 issues across 18 files.
