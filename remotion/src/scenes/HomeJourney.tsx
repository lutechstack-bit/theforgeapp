import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { MockCard, ProgressBar } from "../components/MockCard";

const { fontFamily: playfair } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const HomeJourney = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const titleOpacity = interpolate(titleS, [0, 1], [0, 1]);
  const titleX = interpolate(titleS, [0, 1], [-40, 0]);

  return (
    <AbsoluteFill style={{ padding: "80px 120px" }}>
      {/* Section label */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#f59e0b",
          letterSpacing: 4,
          textTransform: "uppercase",
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          marginBottom: 12,
        }}
      >
        HOME DASHBOARD
      </div>
      <div
        style={{
          fontFamily: playfair,
          fontSize: 52,
          fontWeight: 700,
          color: "#ffffff",
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
          marginBottom: 48,
        }}
      >
        Your Journey at a Glance
      </div>

      {/* Cards grid */}
      <div style={{ display: "flex", gap: 28 }}>
        <MockCard title="Welcome, Creator" subtitle="Your personalized dashboard with everything you need" icon="🏠" delay={10} width={420}>
          <ProgressBar progress={72} delay={20} />
        </MockCard>

        <MockCard title="Journey Timeline" subtitle="Track your progress through every stage of Forge" icon="🗺️" delay={18} width={420}>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {["Applied", "Prep", "Forge", "Alumni"].map((stage, i) => {
              const s2 = spring({ frame: frame - 30 - i * 5, fps, config: { damping: 20 } });
              return (
                <div
                  key={stage}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background: i < 2 ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.06)",
                    color: i < 2 ? "#f59e0b" : "rgba(255,255,255,0.4)",
                    opacity: interpolate(s2, [0, 1], [0, 1]),
                    transform: `scale(${interpolate(s2, [0, 1], [0.8, 1])})`,
                  }}
                >
                  {stage}
                </div>
              );
            })}
          </div>
        </MockCard>

        <MockCard title="Today's Focus" subtitle="Stay on track with daily priorities and deadlines" icon="🎯" delay={26} width={380}>
          <div style={{ marginTop: 12 }}>
            {["Complete KY Form", "Upload headshots", "Join community"].map((task, i) => {
              const s3 = spring({ frame: frame - 35 - i * 4, fps, config: { damping: 25 } });
              return (
                <div
                  key={task}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 0",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    opacity: interpolate(s3, [0, 1], [0, 1]),
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: 3, border: "1.5px solid rgba(245,158,11,0.5)" }} />
                  {task}
                </div>
              );
            })}
          </div>
        </MockCard>
      </div>
    </AbsoluteFill>
  );
};
