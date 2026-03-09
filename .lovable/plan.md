

# Unify Duration Display Format

## Summary
Add a shared `formatDurationFromMinutes` utility and replace all local/inline duration formatting across 7 files.

## Changes

### 1. `src/lib/utils.ts` — Add shared formatter
```typescript
export const formatDurationFromMinutes = (minutes?: number | null): string | null => {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${m}m`;
};
```

### 2. Components using raw `{duration_minutes} min` — switch to shared function

| File | Line | Current | After |
|------|------|---------|-------|
| `ContentSidebar.tsx` | 103 | `{item.duration_minutes} min` | `{formatDurationFromMinutes(item.duration_minutes)}` |
| `VideoPlayerModal.tsx` | 115 | `{content.duration_minutes} min` | `{formatDurationFromMinutes(content.duration_minutes)}` |
| `StudentFilmCard.tsx` | 76 | `{film.duration_minutes} min` | `{formatDurationFromMinutes(film.duration_minutes)}` |
| `CourseDetail.tsx` | 310 | `{course.duration_minutes}m` | `{formatDurationFromMinutes(course.duration_minutes)}` |

### 3. Components with local `formatDuration` — remove and use shared import

- `LearnCourseCard.tsx` — remove lines 38-44 local function, import shared
- `CourseCard.tsx` — remove lines 31-39 local function, import shared  
- `PremiumVideoCard.tsx` — remove lines 47-52 local function, import shared

No data changes. Pure display formatting unification.

