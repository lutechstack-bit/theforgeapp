# Plan: Add Vimeo Embed Link Support to AdminLearn

## Overview
Add the ability to use Vimeo embed links as an alternative to direct video file uploads in the Admin Learn content management. This will save storage space, bypass RLS upload issues, and support large video files hosted externally.

## Current State Analysis
- **AdminLearn.tsx**: Currently only supports direct video file uploads via `FileUpload` component
- **SecureVideoPlayer.tsx**: Handles video playback, currently designed for Supabase storage URLs
- **Database**: `learn_content.video_url` field (text, nullable) - can already store any URL
- **VideoPlayerModal.tsx**: Uses SecureVideoPlayer to display videos

## Implementation Strategy

### Phase 1: Database Enhancement
Add a new column to track video source type for cleaner logic:
- Add `video_source_type` column to `learn_content` table with values: `'upload'` | `'embed'` | `'vimeo'`
- This helps the player know how to render the video (native player vs iframe embed)

**Migration SQL:**
```sql
ALTER TABLE learn_content 
ADD COLUMN video_source_type TEXT DEFAULT 'upload';

-- Update existing records
UPDATE learn_content 
SET video_source_type = 'upload' 
WHERE video_url IS NOT NULL;
```

### Phase 2: AdminLearn UI Changes
Modify the video upload section to offer two options:

1. **Add video source toggle** - Tabs or radio buttons to switch between:
   - "Upload Video" (existing FileUpload component)
   - "Embed Link" (new URL input field)

2. **Embed Link Input**:
   - Text input for Vimeo embed URL
   - Helper text explaining the expected format
   - Validation for Vimeo URLs (player.vimeo.com or vimeo.com)
   - "Paste Vimeo embed code or URL" placeholder

3. **Form state updates**:
   - Add `videoSourceType` to form state
   - Conditionally show FileUpload or URL input based on selection
   - Update validation logic to accept either uploaded file OR embed URL

### Phase 3: Video Player Enhancement
Modify SecureVideoPlayer to handle embed URLs:

1. **Detect video source type**:
   - Check if URL contains "vimeo.com" or is an iframe embed
   - For Vimeo: Extract video ID and render responsive iframe
   - For uploads: Keep existing signed URL logic

2. **Vimeo iframe rendering**:
   - Parse Vimeo URL to get video ID
   - Render responsive Vimeo embed iframe
   - Support privacy hash for private Vimeo videos
   - Maintain aspect ratio and styling

3. **URL patterns to support**:
   - `https://vimeo.com/123456789` (standard URL)
   - `https://player.vimeo.com/video/123456789` (embed URL)
   - `https://vimeo.com/123456789/abc123def` (private video with hash)

### Phase 4: Update VideoPlayerModal
- Pass video source type to SecureVideoPlayer
- Handle embed display differently (no download protection needed for embeds)

## File Changes Required

### 1. Database Migration (new file)
- Add `video_source_type` column to `learn_content` table

### 2. src/pages/admin/AdminLearn.tsx
- Add `video_source_type` to `LearnContentForm` interface
- Add state for video input mode (upload vs embed)
- Create tabbed/toggled UI for upload vs embed link
- Add Vimeo URL input with validation
- Update form submission to include video source type
- Update handleEdit to restore video source type

### 3. src/components/learn/SecureVideoPlayer.tsx
- Add `videoSourceType` prop
- Add Vimeo URL detection and parsing helper
- Create VimeoEmbed sub-component with responsive iframe
- Conditionally render native video or Vimeo iframe
- Handle Vimeo player API events if needed

### 4. src/components/learn/VideoPlayerModal.tsx
- Pass video source type from content to SecureVideoPlayer

### 5. src/pages/Learn.tsx
- Minor update to pass video_source_type to modal

## UI/UX Design

### Admin Video Upload Section (Updated)
```
+------------------------------------------+
| Video Source                              |
| +--------+  +------------+               |
| | Upload |  | Embed Link |  <- Tabs      |
| +--------+  +------------+               |
+------------------------------------------+

When "Upload" selected (existing):
+------------------------------------------+
| [FileUpload Component]                   |
| Drag & drop or click to upload           |
| Supported: MP4, WebM, MOV. Max 5GB       |
+------------------------------------------+

When "Embed Link" selected (new):
+------------------------------------------+
| Vimeo URL                                |
| +--------------------------------------+ |
| | https://vimeo.com/...                | |
| +--------------------------------------+ |
| Paste your Vimeo video URL or embed URL |
| Supports: vimeo.com/123456 or private   |
| videos with hash                        |
+------------------------------------------+
```

## Validation Rules
1. If "Upload" mode: Require video file upload
2. If "Embed Link" mode: Require valid Vimeo URL
3. Vimeo URL regex: `/^https?:\/\/(www\.)?(vimeo\.com|player\.vimeo\.com)\/(video\/)?(\d+)(\/[a-zA-Z0-9]+)?/`

## Benefits
- Save ~6GB+ storage by hosting large videos on Vimeo
- Bypass RLS upload issues completely for embed content
- Better video streaming performance (Vimeo CDN)
- Support for videos larger than 5GB limit
- Easier workflow: just paste a link

## Critical Files for Implementation
- `src/pages/admin/AdminLearn.tsx` - Main UI changes for admin form
- `src/components/learn/SecureVideoPlayer.tsx` - Video player to support embeds
- `src/components/learn/VideoPlayerModal.tsx` - Pass source type prop
- `src/integrations/supabase/types.ts` - Will auto-update after migration
- Database migration - Add video_source_type column
