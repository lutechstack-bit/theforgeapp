

# Capitalize "Forge" and Sharpen Section Title Font

## Summary
Fix the subtitle text "Fundamental learning for forge and beyond" to properly capitalize "Forge" and use a bolder font weight from the OpenSauceOne family for sharper, more premium typography on both mobile and web.

---

## Current State

**Text Issue:**
- Currently: "Fundamental learning for forge and beyond"
- Should be: "Fundamental learning for Forge and beyond"

**Font Weight:**
- The `ContentCarousel` title uses `font-semibold` (weight 600)
- The Learn page subtitle uses default text (no explicit weight)
- Available OpenSauceOne weights: Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800), Black (900)

---

## Changes Required

### 1. Fix Capitalization - `src/pages/Home.tsx` (line 203)

```tsx
// Current
<ContentCarousel title="Fundamental learning for forge and beyond" ...>

// Fixed
<ContentCarousel title="Fundamental learning for Forge and beyond" ...>
```

### 2. Fix Capitalization - `src/pages/Learn.tsx` (line 226)

```tsx
// Current
'Filmmaking fundamentals: For forge and Beyond',

// Fixed  
'Filmmaking fundamentals: For Forge and Beyond',
```

### 3. Sharpen Section Title Font - `src/components/shared/ContentCarousel.tsx` (line 53)

Change from `font-semibold` to `font-bold` for a sharper look:

```tsx
// Current
<h3 className="text-lg font-semibold text-foreground">{title}</h3>

// Updated - bolder weight for sharper text
<h3 className="text-lg font-bold text-foreground">{title}</h3>
```

### 4. Sharpen Learn Page Section Titles - `src/pages/Learn.tsx` (line 124)

The section titles in Learn already use `font-bold`, but subtitles could benefit from `font-medium` for better hierarchy:

```tsx
// Current
<p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>

// Updated - medium weight for sharper subtitle
<p className="text-sm font-medium text-muted-foreground mt-0.5">{subtitle}</p>
```

---

## Font Weight Reference (OpenSauceOne Family)

| Weight Class | CSS Value | Use Case |
|--------------|-----------|----------|
| `font-light` | 300 | Subtle labels |
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Subtitles, secondary headers |
| `font-semibold` | 600 | Current section titles |
| `font-bold` | 700 | Primary section titles (recommended) |
| `font-extrabold` | 800 | Hero headlines |
| `font-black` | 900 | Maximum impact |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Capitalize "Forge" in ContentCarousel title |
| `src/pages/Learn.tsx` | Capitalize "Forge" in subtitle + add `font-medium` to subtitles |
| `src/components/shared/ContentCarousel.tsx` | Change title from `font-semibold` to `font-bold` |

---

## Visual Result

**Before:**
```text
Fundamental learning for forge and beyond
(font-semibold, lowercase "forge")
```

**After:**
```text
Fundamental learning for Forge and beyond
(font-bold, capitalized "Forge" - sharper and more premium)
```

This applies consistently to both mobile and web views since font weights are responsive by default.

