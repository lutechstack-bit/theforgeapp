
Root cause is very likely a code-path/version mismatch, not the latest KYSectionConfig logic itself:

1) In the current code, KYC/KYW proficiency is already `proficiency-grid` and the old long writer options are no longer present in section config.
2) Your screenshot still matches the old proficiency-option UI, which suggests you are still hitting an older form route/build (or cached PWA bundle), so you keep seeing old screens.

Implementation plan

1. Unify all KY entry points to section-based flow
- Replace every remaining `/kyf-form`, `/kyc-form`, `/kyw-form` navigation with section routes (`/ky-section/:sectionKey`) derived from cohort.
- Use one shared helper to compute first section per cohort, so all buttons/cards route consistently.

2. Add backward-compatible redirects for legacy routes
- In router, add redirects:
  - `/kyf-form` → `/ky-section/filmmaker_profile`
  - `/kyc-form` → `/ky-section/creator_profile`
  - `/kyw-form` → `/ky-section/writer_profile`
- This prevents old deep links/bookmarks from landing on outdated flows.

3. Finish migration cleanup for components still pointing to legacy routes
- Update these components to use the shared helper:
  - `src/components/onboarding/KYFormReminderBanner.tsx`
  - `src/components/onboarding/KYFormReminderCard.tsx`
  - `src/components/home/StatusWidget.tsx`
  - `src/components/home/ProgressHeroSection.tsx`
  - `src/components/profile/KYFormQuickAccess.tsx`
  - `src/pages/MyKYForm.tsx` (edit buttons/redirects)

4. Harden update propagation (stale bundle guard)
- Add a lightweight app-version check on startup:
  - if build version changed, unregister service worker + clear runtime caches + one-time reload.
- This prevents old cached JS from continuing to render obsolete form UI after updates.

5. Keep no-scroll parity with filmmaking form
- Ensure KYC/KYW step content density remains compact (same proficiency matrix behavior, compact spacing on short-height viewports).
- Verify bottom nav overlap and card fit at your viewport (888x593) and common mobile sizes.

Technical details (files to touch)

- Routing:
  - `src/App.tsx` (legacy route redirects)
- Shared KY route utility (new):
  - `src/lib/kyFormRoutes.ts` (cohort → first section route)
- Navigation callers:
  - `src/components/onboarding/KYFormReminderBanner.tsx`
  - `src/components/onboarding/KYFormReminderCard.tsx`
  - `src/components/home/StatusWidget.tsx`
  - `src/components/home/ProgressHeroSection.tsx`
  - `src/components/profile/KYFormQuickAccess.tsx`
  - `src/pages/MyKYForm.tsx`
- Cache/update hardening:
  - `src/main.tsx` (startup version/cache refresh guard)

Validation checklist

1. From each KY CTA entry point above, confirm navigation opens `/ky-section/...` (never legacy form routes).
2. For all cohorts (Filmmaker/Creator/Writer), proficiency step renders as matrix-style grid.
3. At 888x593 and mobile sizes, fields/buttons are reachable and no section is blocked by fixed bottom nav.
4. Legacy URLs `/kyf-form`, `/kyc-form`, `/kyw-form` correctly redirect to new section routes.
5. After hard reload/reopen, updated UI remains consistent (no reversion to old proficiency options).
