

# Add Custom Golden Slider Controls to Vimeo Embed Videos

## Problem
The first screenshot shows a video (upload type) with the custom golden progress bar, play/pause, skip, volume, speed, and fullscreen controls. The second screenshot shows a Vimeo embed with only Vimeo's default controls (basic white progress bar). The user wants the same golden slider experience on all videos.

## Why it differs today
In `SecureVideoPlayer.tsx`, Vimeo embeds (line 476-571) render a plain `<iframe>` with Vimeo's own controls. Upload-type videos (line 573-757) render a `<video>` element with fully custom golden controls. The iframe is sandboxed, so we can't style Vimeo's internal player.

## Solution: Use Vimeo Player SDK
Install `@vimeo/player` to communicate with the Vimeo iframe programmatically (play, pause, seek, get currentTime, duration, etc.), then overlay our own custom controls on top — identical to the upload-type controls.

### Changes to `SecureVideoPlayer.tsx`

1. **Install `@vimeo/player`** — provides API to control the Vimeo iframe (play/pause, seek, get time/duration, volume, playback rate).

2. **Refactor the Vimeo embed section** (lines 476-571):
   - Initialize a `Vimeo.Player` instance from the iframe ref.
   - Set up event listeners (`timeupdate`, `play`, `pause`, `loaded`, `ended`) to sync state (`currentTime`, `duration`, `isPlaying`, `isLoading`).
   - Hide Vimeo's native controls by adding `&controls=0` to the embed URL (line 495).
   - Render the same custom controls overlay used for upload videos: golden `Slider` progress bar, play/pause, skip ±10s, volume, time display, speed selector, fullscreen button.
   - Wire control buttons to Vimeo Player API methods (`player.play()`, `player.pause()`, `player.setCurrentTime()`, etc.).

3. **Extract shared controls** into a helper component or function to avoid duplicating the controls JSX between upload and embed modes. Both will render the same golden slider and button layout.

4. **Progress saving** — the existing `learn_watch_progress` save logic (lines 208-252) already uses `currentTimeRef` and `durationRef`. The Vimeo `timeupdate` listener will update these same refs, so progress tracking works automatically for embeds too.

### No other file changes needed
`CourseDetail.tsx`, `VideoPlayerModal.tsx`, and `Learn.tsx` already pass `videoSourceType` through — the change is entirely within `SecureVideoPlayer.tsx`.

