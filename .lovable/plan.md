

# Redesign RoadmapHero Header (No Timer)

## Changes — `src/components/roadmap/RoadmapHero.tsx`

### Visual upgrade
- Radial amber gradient background (`from-[#FFBF00]/5 via-transparent`)
- Left amber accent border (4px)
- Grain texture overlay for cinematic feel

### Text fixes per mode

**PRE_FORGE**: Status pill "Forge begins soon" → Title: `"Get Ready for {cohortName}"` → Subtitle: formatted start date

**DURING_FORGE**: Pulsing "FORGE IS LIVE" pill → Title: `"{cohortName} Journey"` → Subtitle: today's date

**POST_FORGE**: "FORGE COMPLETE" pill → Title: `"{cohortName} Legacy"` → Subtitle: "Look back at what you accomplished"

### Removed
- No countdown timer / days calculation
- No `differenceInDays` import
- No `forgeStartDate` prop

### File
`src/components/roadmap/RoadmapHero.tsx` — single file edit

