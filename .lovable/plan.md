

# Change Video Time Format to Smart Display

## Change

Update both `formatTime` functions in `SecureVideoPlayer.tsx` (lines 209-213 and 686-690) to show `MM:SS` for videos under 1 hour and `H:MM:SS` for videos 1 hour or longer.

**File: `src/components/learn/SecureVideoPlayer.tsx`** (lines 209-213 and 686-690)

Replace both instances with:
```typescript
const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

- Short videos (under 60 min): `5:30`, `12:04`
- Long videos (60+ min): `1:05:30`, `2:00:15`

No other files affected.

