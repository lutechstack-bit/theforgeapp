

# Fix Empty Space in KY Form Cards

## Problem
The cards stretch to fill the entire viewport height due to `h-full` being applied throughout the height chain. This creates massive empty space below short-content steps (like "Name + Status" or "Instagram + DOB"). The cards should **fit their content** naturally and only scroll if content genuinely overflows.

## Root Cause
The previous scroll fix overcorrected: changing from `max-h-full` to `h-full` forces every card to expand to the full container height, even when content is small.

## Fix (3 files)

### 1. `src/components/kyform/KYFormCardStack.tsx`
- Line 41: Change outer wrapper from `flex items-center` to `flex items-center justify-center` (keeps vertical centering)
- Line 43: `h-full min-h-0` → `max-h-full` (don't force full height, just cap it)
- Line 75: `h-full min-h-0` → `max-h-full` (current card sizes to content)
- Line 87: `h-full min-h-0` → `max-h-full` (incoming card sizes to content)

### 2. `src/components/kyform/KYFormCard.tsx`
- Line 27: `h-full min-h-0` → `max-h-full` (card wraps content, doesn't stretch)
- Line 46: Keep `flex-1 overflow-y-auto` but add `min-h-0` so scroll only activates when needed

### 3. `src/pages/KYSectionForm.tsx`
- Line 284: Change `flex-1 flex flex-col` → `flex-1 flex items-center` so cards are vertically centered in the available space rather than pushed to the top with empty stretch below

This restores content-hugging behavior: cards are as tall as their fields, centered in the viewport, with scroll as a safety fallback only when content exceeds available height.

