import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { GlowBackground } from "./components/GlowBackground";
import { LogoReveal } from "./scenes/LogoReveal";
import { HomeJourney } from "./scenes/HomeJourney";
import { RoadmapPrep } from "./scenes/RoadmapPrep";
import { CommunityEvents } from "./scenes/CommunityEvents";
import { LearnGrow } from "./scenes/LearnGrow";
import { ProfilePerks } from "./scenes/ProfilePerks";
import { ClosingCTA } from "./scenes/ClosingCTA";

const T = 20; // transition duration in frames

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      <GlowBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}>
          <LogoReveal />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={110}>
          <HomeJourney />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={110}>
          <RoadmapPrep />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={110}>
          <CommunityEvents />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={110}>
          <LearnGrow />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={100}>
          <ProfilePerks />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: T })}
        />

        <TransitionSeries.Sequence durationInFrames={90}>
          <ClosingCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
