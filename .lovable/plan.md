

# Make Sticky Notes Visually Distinct with Unique Border Colors

## Problem Identified

Looking at the screenshot and code, all sticky notes appear identical because:
1. The border color opacity is set to only 25% (`${colors.border}40` → hex for ~25% alpha)
2. The glow effect is also very subtle (15% opacity)
3. All cards have the same black/dark background

While different accent colors exist for each stage in the `stageAccentColors` object, they're barely visible.

## Solution

Increase the border visibility significantly and add more visual differentiation:
1. **Increase border opacity** from 25% to 60-70% 
2. **Add a subtle gradient border effect** using the stage accent color
3. **Make the pin color match the stage** (not always gold)
4. **Add a colored top accent line** to each card for immediate visual recognition

## Color Scheme Per Stage

Using the brand palette with more visible borders:

| Stage | Border Color | Visual Accent |
|-------|-------------|---------------|
| Pre-Registration | `#FFBC3B` (Primary Yellow) | Bright yellow border |
| Pre-Travel | `#10B981` (Emerald) | Green for "go/travel" |
| Final Prep | `#DD6F16` (Secondary Orange) | Orange urgency |
| Online Forge | `#3B82F6` (Blue) | Digital/online feel |
| Physical Forge | `#D38F0C` (Deep Gold) | Premium gold |
| Post Forge | `#8B5CF6` (Purple) | Completion/achievement |

## Visual Design

```text
┌────────────────────────────────────────┐
│ ═══════════════════════════════════════ │ ← Colored top accent line (3px)
│  [Pin]                                  │ ← Pin matches stage color
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │  📋 Final Prep              3/5   │ │
│ │  ─────────────────────────────────│ │
│ │  [✓] Task 1                       │ │
│ │  [ ] Task 2                       │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│        ↑ 60% opacity colored border     │
└────────────────────────────────────────┘
```

## File to Modify

**`src/components/journey/StickyNoteCard.tsx`**

### Changes

1. **Update border opacity** in the `style` prop:
   - Change: `borderColor: \`${colors.border}40\`` (25%)
   - To: `borderColor: \`${colors.border}99\`` (60%) or even `\`${colors.border}\`` (100%)

2. **Add colored top accent bar**:
   ```typescript
   {/* Colored top accent line */}
   <div 
     className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
     style={{ backgroundColor: colors.border }}
   />
   ```

3. **Make pin color match the stage accent**:
   ```typescript
   style={{
     background: `linear-gradient(to bottom, ${colors.border}, ${colors.accent})`,
   }}
   ```

4. **Increase glow intensity** for the current stage:
   - Change glow from 15% to 25% opacity
   - Add stronger glow for `variant === 'current'`

5. **Update color palette** for better differentiation:
   - Keep gold/orange for prep stages
   - Use emerald green for `pre_travel`
   - Use blue for `online_forge`
   - Use purple for `post_forge`

## Summary

| Change | Description |
|--------|-------------|
| Border opacity | Increase from 25% to 60% for visible colored borders |
| Top accent line | Add 3px colored bar at top of each card |
| Pin color | Match pin gradient to stage color (not always gold) |
| Glow intensity | Increase from 15% to 25% for more presence |
| Color variety | Use emerald, blue, purple for non-prep stages |

This will make each stage immediately recognizable by its unique border color while maintaining the dark theme aesthetic.

