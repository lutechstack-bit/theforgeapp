

# Update Masterclass Cards with Official Website Images

## What Changes

Replace the local placeholder masterclass images with the official high-quality images from the LevelUp Learning website, and polish the card design to look seamless and premium.

## Image Mapping

| Instructor | New Image URL (from leveluplearning.in CDN) |
|---|---|
| Lokesh Kanagaraj | `https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/6899f2de01c2b6f380973a82_Frame%20191%20LK.png` |
| Nelson Dilipkumar | `https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/6878bd67851730bc31658da7_NM.png` |
| Karthik Subbaraj | `https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/650c1be5224f49f6432aaae6_1.Karthik_Subburaj%20course%20banner.png` |
| G Venket Ram | `https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/64f2f14d67e5504737c57ea5_2.Venket_Ram.png` |
| Anthony | `https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/64f60ddd91f67b7db8f6716b_3.Anthony_Gonsalvez.png` |
| DRK Kiran | `https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/64b79ef6d61b238747788c6c_kiran%20website%201.webp` |
| Ravi Basrur | `https://cdn.prod.website-files.com/649fbe7d7f61c6fc912e1d33/64b79ef642421ae3cbe004d9_ravi%20website%201.webp` |

## Changes

### 1. `src/pages/Learn.tsx` -- Update image URLs

Replace all 7 local image paths (e.g., `/images/masterclass/lokesh.png`) with the CDN URLs from the official LevelUp website listed above.

### 2. `src/components/learn/MasterclassCard.tsx` -- Polish card design

Refine the card to look seamless and premium:
- Set a fixed aspect ratio for the image area so all cards render uniformly regardless of source image dimensions
- Add a subtle dark overlay gradient at the bottom of the image for visual depth
- Ensure the "Start Learning" button sits flush with the card bottom
- Add a loading state / skeleton for the image while it loads from the external CDN
- Remove visible borders for a cleaner look, using subtle shadow instead

## Files Summary

| File | Action |
|------|--------|
| `src/pages/Learn.tsx` | UPDATE -- Replace local image paths with CDN URLs |
| `src/components/learn/MasterclassCard.tsx` | UPDATE -- Polish card design for seamless look |

