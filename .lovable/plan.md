
Implementation plan:
1. Update `src/pages/Learn.tsx` in the “More from LevelUp” divider block.
2. Increase logo size from `h-14` to a much larger responsive size: `h-20 md:h-24`.
3. Keep the logo visually dominant over text by retaining text at `text-base` and increasing spacing to `gap-4`.
4. Preserve visibility classes (`invert`, `opacity-80`, `object-contain`) and add `shrink-0` to prevent the logo from compressing.
5. Verify the divider still fits cleanly on `/learn` at mobile and desktop widths (no clipping/overflow, centered alignment).

Planned code update target:
- From:
`className="h-14 invert opacity-80 object-contain"`
- To:
`className="h-20 md:h-24 invert opacity-80 object-contain shrink-0"`
