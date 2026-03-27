import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { MockCard } from "../components/MockCard";

const { fontFamily: playfair } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const RoadmapPrep = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ padding: "80px 120px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", letterSpacing: 4, textTransform: "uppercase", opacity: interpolate(titleS, [0, 1], [0, 1]), marginBottom: 12 }}>
        ROADMAP & PREPARATION
      </div>
      <div style={{ fontFamily: playfair, fontSize: 52, fontWeight: 700, color: "#fff", opacity: interpolate(titleS, [0, 1], [0, 1]), marginBottom: 48 }}>
        Everything You Need to Know
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {/* Day-by-day timeline */}
        <div style={{ flex: 1 }}>
          <MockCard title="14-Day Roadmap" subtitle="Day-by-day schedule with sessions, mentors & activities" icon="📅" delay={8} width={400}>
            <div style={{ marginTop: 14 }}>
              {[
                { day: "Day 1", label: "Orientation & Icebreakers" },
                { day: "Day 2", label: "First Workshop Session" },
                { day: "Day 3", label: "Mentor Meet & Greet" },
                { day: "Day 4", label: "Creative Brief Day" },
              ].map((item, i) => {
                const s = spring({ frame: frame - 18 - i * 5, fps, config: { damping: 20 } });
                return (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "8px 0", opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateX(${interpolate(s, [0, 1], [20, 0])}px)` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", minWidth: 48 }}>{item.day}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{item.label}</div>
                  </div>
                );
              })}
            </div>
          </MockCard>
        </div>

        {/* Equipment + Prep */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <MockCard title="Equipment Guide" subtitle="Cameras, lenses, audio gear — all provided" icon="🎥" delay={14} width={380} />
          <MockCard title="Prep Checklist" subtitle="Packing list, documents, travel info" icon="✅" delay={22} width={380}>
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Passport", "Laptop", "Hard Drive", "Wardrobe", "Meds"].map((item, i) => {
                const s = spring({ frame: frame - 30 - i * 3, fps, config: { damping: 20 } });
                return (
                  <div key={item} style={{ padding: "4px 12px", borderRadius: 12, fontSize: 11, background: "rgba(245,158,11,0.15)", color: "#f59e0b", opacity: interpolate(s, [0, 1], [0, 1]) }}>
                    {item}
                  </div>
                );
              })}
            </div>
          </MockCard>
        </div>
      </div>
    </AbsoluteFill>
  );
};
