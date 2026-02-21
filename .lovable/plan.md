

# Remove Mentors Section from Homepage

## Change
Remove the mentors carousel section from the homepage, including:
- The mentors query (`mentorsQuery`)
- The `displayMentors` filtered memo
- The mentors section rendering block
- The `MentorDetailModal` and its state (`selectedMentor`, `isMentorModalOpen`, `handleMentorClick`)
- Related imports (`CleanMentorCard`, `MentorDetailModal`, `ContentCarousel`, `Mentor` type)
- Remove mentors from error/loading/empty-state logic

## File Modified

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Remove all mentor-related code (query, state, rendering, imports) |

No other files affected. The mentors data and components remain available for use elsewhere (e.g., the Roadmap page).

