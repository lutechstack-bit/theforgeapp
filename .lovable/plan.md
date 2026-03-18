

# Fix Blank PDF Download

## Problem
The PDF is blank because the `PrintableProfile` div is positioned at `left: -9999px`. `html2canvas` (used by `html2pdf.js`) cannot properly render elements that are off-screen — it captures a blank area.

## Solution

### `src/pages/Profile.tsx` — Fix `handleDownloadPDF`
Before capturing, temporarily move the printable div on-screen (but visually hidden behind an overlay or with `opacity: 0` and `position: fixed`), generate the PDF, then move it back off-screen.

```typescript
const handleDownloadPDF = async () => {
  const element = document.getElementById('printable-profile');
  if (!element) return;
  
  // Temporarily bring on-screen for html2canvas
  element.style.position = 'fixed';
  element.style.left = '0';
  element.style.top = '0';
  element.style.zIndex = '-1';
  
  const html2pdf = (await import('html2pdf.js')).default;
  await html2pdf()
    .set({ ... })
    .from(element)
    .save();
  
  // Move back off-screen
  element.style.position = 'absolute';
  element.style.left = '-9999px';
  element.style.zIndex = '';
};
```

This is the minimal fix — the element stays behind everything (`z-index: -1`) so the user never sees it, but `html2canvas` can now render it.

### No other files need changes
The `PrintableProfile` layout and design are already correct — the only issue is the off-screen positioning preventing capture.

| File | Change |
|------|--------|
| `Profile.tsx` | Temporarily reposition printable div on-screen during PDF generation |

