

# Codebase Audit: Unused Code, Discrepancies, and Bloat

After a thorough scan of the codebase, here is what I found organized by category.

---

## 1. Dead Pages (never routed, never imported by consumers)

These are full page components that exist in the codebase but are **not reachable** by any route or import. They are legacy KY form pages that have been superseded by the new `KYSectionForm` system:

| File | Lines | Status |
|------|-------|--------|
| `src/pages/KYCForm.tsx` | ~492 | Legacy, only redirect in App.tsx |
| `src/pages/KYF.tsx` | ~287 | Legacy, never imported |
| `src/pages/KYFForm.tsx` | ~738 | Legacy, never imported |
| `src/pages/KYWForm.tsx` | ~464 | Legacy, never imported |
| `src/pages/DynamicKYForm.tsx` | ~297 | Imported in App.tsx but **never used in any Route** |

**Total: ~2,278 lines of dead code** in pages alone.

---

## 2. Dead Shared Components (defined but never imported)

These components in `src/components/shared/` are not imported anywhere:

| Component | Unused? |
|-----------|---------|
| `CarouselCard.tsx` | Yes |
| `CityCard.tsx` | Yes |
| `MentorCard.tsx` | Yes |
| `EventCard.tsx` | Yes |
| `FeatureCard.tsx` | Yes |
| `FlipMentorCard.tsx` | Yes |
| `MentorDetailModal.tsx` | Yes |
| `ContentCarousel.tsx` | Yes |
| `FOMOBanner.tsx` | Yes |
| `CountdownBanner.tsx` | Yes |
| `MentorVideoCard.tsx` | Yes |
| `PremiumCourseCard.tsx` | Yes |
| `PremiumEventCard.tsx` | Yes |
| `PremiumMentorCard.tsx` | Yes |
| `SimpleEventCard.tsx` | Yes |
| `StudentVideoCard.tsx` | Yes |
| `TestimonialVideoCard.tsx` | Yes |
| `UnlockModal.tsx` | Yes |

**~18 unused shared components.** These appear to be earlier iterations that were replaced by newer variants (e.g., `CleanEventCard` replaced `EventCard`).

---

## 3. Dead Standalone Component

| Component | Status |
|-----------|--------|
| `src/components/NavLink.tsx` | Custom NavLink wrapper, never imported anywhere |

---

## 4. Unused UI Components (shadcn scaffolds never consumed)

These UI primitives were installed but never imported by any page or component:

| UI Component | Unused? |
|--------------|---------|
| `ui/resizable.tsx` | Yes (+ `react-resizable-panels` dep) |
| `ui/form.tsx` | Yes (+ `react-hook-form` & `@hookform/resolvers` & `zod` deps only used here) |
| `ui/hover-card.tsx` | Yes |
| `ui/context-menu.tsx` | Yes |
| `ui/menubar.tsx` | Yes |
| `ui/navigation-menu.tsx` | Yes |
| `ui/input-otp.tsx` | Yes (+ `input-otp` dep) |

---

## 5. Duplicated Utility Functions

`calculateAge()` is defined **4 separate times** — once in each legacy KY form page plus once in `KYSectionConfig.ts`. Only the `KYSectionConfig.ts` version is used by the active code.

---

## 6. Potentially Removable Dependencies

If the unused UI components and pages above are removed, these npm dependencies become removable:

| Dependency | Reason |
|------------|--------|
| `react-resizable-panels` | Only used by unused `ui/resizable.tsx` |
| `input-otp` | Only used by unused `ui/input-otp.tsx` |
| `@hookform/resolvers` | Only used by unused `ui/form.tsx` |
| `react-hook-form` | Only used by unused `ui/form.tsx` |

Note: `zod`, `recharts`, `html2pdf.js`, `react-easy-crop`, `@vimeo/player`, `next-themes`, `framer-motion` are all actively used.

---

## 7. Summary of Recommended Cleanup

### Phase 1 — Safe deletions (dead code, no risk)
1. **Delete 5 legacy page files**: `KYCForm.tsx`, `KYF.tsx`, `KYFForm.tsx`, `KYWForm.tsx`, `DynamicKYForm.tsx`
2. **Delete 18 unused shared components** listed above
3. **Delete `NavLink.tsx`**
4. **Delete unused UI components**: `resizable.tsx`, `form.tsx`, `hover-card.tsx`, `context-menu.tsx`, `menubar.tsx`, `navigation-menu.tsx`, `input-otp.tsx`
5. **Remove the unused `DynamicKYForm` import** from `App.tsx`

### Phase 2 — Dependency cleanup
6. Remove `react-resizable-panels`, `input-otp`, `@hookform/resolvers`, `react-hook-form` from `package.json`

### Estimated impact
- **~3,500+ lines of dead code removed**
- **~4 npm dependencies removed**
- Faster builds, smaller bundle, less confusion for future development

