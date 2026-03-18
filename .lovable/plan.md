

# Redesign Portfolio PDF & Enhance Share Portfolio Tile

## Problem
1. The "Download PDF" currently just calls `window.print()` which screenshots the dark profile page — producing an ugly, unreadable PDF.
2. The Share Portfolio tile exists but doesn't show the portfolio link or copy/preview actions when public.

## Changes

### 1. `src/components/profile/BentoShareTile.tsx` — Enhanced Share Tile
- When `isPublic` is true and `portfolioUrl` exists, show the URL with **Copy Link** and **Preview** buttons (similar to what `SharePortfolio.tsx` already has).
- Keep the toggle switch and Download PDF button.
- Add copy-to-clipboard with toast feedback and open-in-new-tab for preview.

### 2. `src/pages/Profile.tsx` — Replace `window.print()` with proper PDF generation
- Replace `handleDownloadPDF` to use `html2pdf.js` library targeting a hidden, light-themed `PrintableProfile` div.
- This generates a clean white-background PDF instead of a browser print screenshot.

### 3. `src/components/profile/PrintableProfile.tsx` — Redesign as clean portfolio document
- Remove `hidden print:block` — render it off-screen (`absolute -left-[9999px]`) so `html2pdf.js` can capture it.
- Redesign layout as a proper portfolio document:
  - **Header**: Forge logo + full name + specialty + city, with amber accent line
  - **About**: Bio section with clean typography
  - **Skills**: Proficiency bars/pills in a grid (not raw text)
  - **Personality**: MBTI type + chronotype if available
  - **Influences**: Top 3 movies/writers/creators
  - **Works**: Card grid with titles, types, descriptions
  - **Contact**: Instagram, email, city
  - **Footer**: "Portfolio powered by LevelUp Forge" with date
- Use white background, black text, amber (#D38F0C) accents — clean print-friendly design.
- Size to A4 proportions for proper PDF pagination.

### 4. Install `html2pdf.js`
- Already has type declarations in `src/types/html2pdf.d.ts`, so just need the package.
- Use dynamic import in `handleDownloadPDF` to keep bundle lean.

| File | Change |
|------|--------|
| `BentoShareTile.tsx` | Add portfolio URL display, Copy Link, Preview buttons when public |
| `PrintableProfile.tsx` | Full redesign as clean A4 portfolio document |
| `Profile.tsx` | Replace `window.print()` with `html2pdf.js` generation targeting the printable div |
| `package.json` | Add `html2pdf.js` dependency |

