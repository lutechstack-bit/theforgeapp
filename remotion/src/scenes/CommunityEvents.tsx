import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { MockCard } from "../components/MockCard";

const { fontFamily: playfair } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const CommunityEvents = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleS = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  const chatMessages = [
    { name: "Arjun", msg: "Just wrapped my first short film! 🎬", time: "2m" },
    { name: "Priya", msg: "Anyone free to collab on a music video?", time: "5m" },
    { name: "Ravi", msg: "The sunset shots were incredible today 🌅", time: "8m" },
  ];

  return (
    <AbsoluteFill style={{ padding: "80px 120px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", letterSpacing: 4, textTransform: "uppercase", opacity: interpolate(titleS, [0, 1], [0, 1]), marginBottom: 12 }}>
        COMMUNITY & EVENTS
      </div>
      <div style={{ fontFamily: playfair, fontSize: 52, fontWeight: 700, color: "#fff", opacity: interpolate(titleS, [0, 1], [0, 1]), marginBottom: 48 }}>
        Connect with Your Tribe
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {/* Chat */}
        <MockCard title="City Chat" subtitle="Real-time conversations with your batchmates" icon="💬" delay={8} width={420}>
          <div style={{ marginTop: 14 }}>
            {chatMessages.map((m, i) => {
              const s = spring({ frame: frame - 20 - i * 8, fps, config: { damping: 18 } });
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none", opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [15, 0])}px)` }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>{m.name}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginLeft: 8 }}>{m.msg}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{m.time}</span>
                </div>
              );
            })}
          </div>
        </MockCard>

        {/* Events */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <MockCard title="Upcoming Events" icon="🎤" delay={16} width={380}>
            <div style={{ marginTop: 10 }}>
              {["Masterclass: Cinematography", "Live Q&A with Mentors", "Portfolio Review Night"].map((evt, i) => {
                const s = spring({ frame: frame - 28 - i * 6, fps, config: { damping: 20 } });
                return (
                  <div key={i} style={{ padding: "6px 0", fontSize: 13, color: "rgba(255,255,255,0.6)", opacity: interpolate(s, [0, 1], [0, 1]), display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
                    {evt}
                  </div>
                );
              })}
            </div>
          </MockCard>
          <MockCard title="Batchmates" subtitle="Find collaborators, build your network" icon="👥" delay={24} width={380} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
