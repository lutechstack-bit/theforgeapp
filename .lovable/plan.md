
# Remove "Address Line 2" Field from KY Section Form

## Change
Remove the `address_line_2` field from the Filmmaker Profile section config so it no longer appears in the KY section form UI.

The database column stays intact (no data loss), and the legacy `KYFForm.tsx` keeps its reference. This only removes it from the new section-based form flow.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kyform/KYSectionConfig.ts` | Delete the `address_line_2` field entry (line 157) from the filmmaker_profile general_details step |
