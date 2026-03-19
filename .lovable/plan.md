

# Remove Unused Code — Cleanup Plan

Delete ~50 files that have no import chain to any active route or component. Zero functional impact.

## Files to Delete

### Community Components (12 files)
- `src/components/community/AfterForgeCard.tsx`
- `src/components/community/ChatBubble.tsx`
- `src/components/community/CollaboratorDirectory.tsx`
- `src/components/community/CollaboratorStepIndicator.tsx`
- `src/components/community/CommunityProfileForm.tsx`
- `src/components/community/CommunityStatsBar.tsx`
- `src/components/community/CompactHighlights.tsx`
- `src/components/community/GroupSidebar.tsx`
- `src/components/community/MemberAvatarStrip.tsx`
- `src/components/community/MemberGrid.tsx`
- `src/components/community/QuickAccessBar.tsx`
- `src/components/community/WhatsAppChat.tsx`

### Home Components (6 files)
- `src/components/home/EnhancedCountdown.tsx`
- `src/components/home/MasterNotificationCenter.tsx`
- `src/components/home/PaymentDueCard.tsx`
- `src/components/home/PrepHighlightCard.tsx`
- `src/components/home/ProgressHeroSection.tsx`
- `src/components/home/RoadmapBentoBox.tsx`

### Roadmap Components — Full Orphan Chain (13 files)
- `src/components/roadmap/CohortCrossSell.tsx`
- `src/components/roadmap/CohortPreviewModal.tsx`
- `src/components/roadmap/EnhancedRoadmapNode.tsx`
- `src/components/roadmap/EnhancedSmoothPath.tsx`
- `src/components/roadmap/EssentialChecklist.tsx`
- `src/components/roadmap/FloatingHighlightsButton.tsx`
- `src/components/roadmap/JourneyStats.tsx`
- `src/components/roadmap/RoadmapNode.tsx`
- `src/components/roadmap/RoadmapSidebar.tsx`
- `src/components/roadmap/RulesGuidelines.tsx`
- `src/components/roadmap/SmoothPath.tsx`
- `src/components/roadmap/TimelineSpine.tsx`
- `src/components/home/RoadmapHighlightsModal.tsx`

### Sidebar Carousels (only used by RoadmapSidebar — 4 files)
- `src/components/roadmap/MobileHighlightsSheet.tsx`
- `src/components/roadmap/SidebarMomentsCarousel.tsx`
- `src/components/roadmap/SidebarStudentWorkCarousel.tsx`
- `src/components/roadmap/SidebarStayCarousel.tsx`
- `src/components/roadmap/StayLocationDetailModal.tsx`

### Events Components (3 files)
- `src/components/events/CalendarSyncModal.tsx`
- `src/components/events/EventTypeTabs.tsx`
- `src/components/events/PastProgramsCarousel.tsx`

### Learn Components (5 files)
- `src/components/learn/InstructorSpotlight.tsx`
- `src/components/learn/LearnCarousel.tsx`
- `src/components/learn/PremiumVideoCarousel.tsx`
- `src/components/learn/ProgramTabs.tsx`
- `src/components/learn/VideoPlayerModal.tsx`

### Layout (2 files)
- `src/components/layout/TopBar.tsx`
- `src/components/layout/MobileMenuSheet.tsx`

### Profile (2 files)
- `src/components/profile/KYFormQuickAccess.tsx`
- `src/components/profile/PerksQuickAccess.tsx`

### Onboarding (5 files)
- `src/components/onboarding/DynamicFormField.tsx`
- `src/components/onboarding/KYFormNavigation.tsx`
- `src/components/onboarding/KYFormProgress.tsx`
- `src/components/onboarding/KYFormReminderBanner.tsx`
- `src/components/onboarding/KYFormReminderCard.tsx`
- `src/components/onboarding/ProfileReminderBadge.tsx`

### Assets (1 file)
- `src/assets/forge-wordmark.png`

## What Happens
- ~50 files deleted, ~5,000+ lines removed
- No pages, routes, or visible features affected
- Build size reduced

