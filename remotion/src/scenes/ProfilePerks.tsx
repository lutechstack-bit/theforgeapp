import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { MockCard } from "../components/MockCard";

const { fontFamily: playfair } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const ProfilePerks = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleS = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  const perks = ["Adobe CC", "Skillshare Premium", "WeWork Access", "Audible Pro"];

  return (
    <AbsoluteFill style={{ padding: "80px 120px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", letterSpacing: 4, textTransform: "uppercase", opacity: interpolate(titleS, [0, 1], [0, 1]), marginBottom: 12 }}>
        PROFILE & PERKS
      </div>
      <div style={{ fontFamily: playfair, fontSize: 52, fontWeight: 700, color: "#fff", opacity: interpolate(titleS, [0, 1], [0, 1]), marginBottom: 48 }}>
        Your Creative Identity
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {/* Profile bento */}
        <MockCard title="Portfolio Profile" icon="🎨" delay={8} width={480}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            {[
              { label: "MBTI", value: "ENFP" },
              { label: "Skills", value: "Cinematography, Editing" },
              { label: "City", value: "Mumbai" },
              { label: "Cohort", value: "Forge S3" },
            ].map((item, i) => {
              const s = spring({ frame: frame - 16 - i * 4, fps, config: { damping: 20 } });
              return (
                <div key={i} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, opacity: interpolate(s, [0, 1], [0, 1]) }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{item.value}</div>
                </div>
              );
            })}
          </div>
        </MockCard>

        {/* Perks */}
        <MockCard title="Exclusive Perks" subtitle="Premium tools & subscriptions included" icon="🎁" delay={14} width={420}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {perks.map((perk, i) => {
              const s = spring({ frame: frame - 24 - i * 5, fps, config: { damping: 18 } });
              return (
                <div key={perk} style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "rgba(245,158,11,0.1)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#f59e0b",
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: interpolate(s, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(s, [0, 1], [0.85, 1])})`,
                }}>
                  {perk}
                </div>
              );
            })}
          </div>
        </MockCard>
      </div>
    </AbsoluteFill>
  );
};
