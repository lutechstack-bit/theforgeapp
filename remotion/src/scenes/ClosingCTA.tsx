import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Img } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";

const { fontFamily: playfair } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const ClosingCTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainS = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const subtitleS = spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 150 } });
  const logoS = spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 180 } });

  const glowPulse = 0.3 + Math.sin(frame * 0.1) * 0.15;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)",
          opacity: glowPulse,
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          fontFamily: playfair,
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: "center",
          opacity: interpolate(mainS, [0, 1], [0, 1]),
          transform: `scale(${interpolate(mainS, [0, 1], [0.9, 1])})`,
          lineHeight: 1.2,
        }}
      >
        Your Creative Journey
        <br />
        <span style={{ color: "#f59e0b" }}>Starts Here</span>
      </div>

      <div
        style={{
          marginTop: 24,
          fontSize: 18,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: 3,
          textTransform: "uppercase",
          opacity: interpolate(subtitleS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(subtitleS, [0, 1], [15, 0])}px)`,
        }}
      >
        forgebylevelup.com
      </div>

      <div style={{ position: "absolute", bottom: 60, display: "flex", alignItems: "center", gap: 16, opacity: interpolate(logoS, [0, 1], [0, 0.6]) }}>
        <Img src={staticFile("images/levelup-logo-white.png")} style={{ height: 28, width: "auto" }} />
      </div>
    </AbsoluteFill>
  );
};
