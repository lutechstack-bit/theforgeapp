
Goal: make the top filter buttons always fit inside the mobile screen with zero horizontal overflow/clipping.

Implementation steps:
1. Update `src/pages/AllCourses.tsx` filter container from horizontal scroll to fixed 3-column layout:
   - Replace `flex gap-2 overflow-x-auto ...` with `grid grid-cols-3 gap-2`.
   - Remove scroll-only padding hacks (`pr-8`) since the row will no longer scroll.
2. Remove active-tab auto-scroll logic (no longer needed):
   - Delete `useRef/useEffect` imports.
   - Delete `activeButtonRef` and `scrollIntoView` effect.
   - Remove per-button `ref` assignment.
3. Make filter chips compact and non-overflowing at 320px:
   - Use tighter chip styles: smaller horizontal padding, `text-xs` (or `text-[12px]`), `min-w-0`.
   - Allow safe wrapping/truncation strategy inside each grid cell (prefer 2-line clamp or shorter labels) so text never spills outside.
4. Keep selected/unselected visual states unchanged (same active colors) while ensuring equal width for all 3 buttons.

Technical details:
- File: `src/pages/AllCourses.tsx`
- Replace:
  - `className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide pr-8"`
  - with a non-scroll row like `className="px-4 pb-3 grid grid-cols-3 gap-2"`.
- Button base class update (example intent):
  - from `px-4 py-2 ... whitespace-nowrap ... flex-shrink-0`
  - to compact equal-cell style like `w-full min-w-0 px-2 py-2 text-xs leading-tight text-center rounded-full`.
- If full labels still feel cramped, shorten display labels in `FILTER_OPTIONS` only for UI:
  - `Pre Forge Sessions` → `Pre Forge`
  - `Community Sessions` → `Community`
  (IDs remain unchanged, so filtering logic is unaffected).
