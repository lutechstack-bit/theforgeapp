import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile, Img } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";

const { fontFamily: playfair } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const LogoReveal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const glowOpacity = interpolate(frame, [10, 40], [0, 0.6], { extrapolateRight: "clamp" });

  const tagS = spring({ frame: frame - 25, fps, config: { damping: 20, stiffness: 150 } });
  const tagOpacity = interpolate(tagS, [0, 1], [0, 1]);
  const tagY = interpolate(tagS, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Glow behind logo */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)",
          opacity: glowOpacity,
          filter: "blur(40px)",
        }}
      />

      {/* Logo */}
      <Img
        src={staticFile("images/forge-logo.png")}
        style={{
          width: 160,
          height: "auto",
          transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 1])})`,
          opacity: logoOpacity,
          filter: "drop-shadow(0 0 30px rgba(245,158,11,0.3))",
        }}
      />

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: "60%",
          fontFamily: "'Inter', sans-serif",
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: 2,
          transform: `translateY(${tagY}px)`,
          opacity: tagOpacity,
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.85)" }}>Where </span>
        <span style={{ color: "#f59e0b", fontFamily: playfair, fontWeight: 700, fontSize: 32 }}>Dreamers</span>
        <span style={{ color: "rgba(255,255,255,0.85)" }}> Become </span>
        <span style={{ color: "#f59e0b", fontFamily: playfair, fontWeight: 700, fontSize: 32 }}>Doers</span>
      </div>
    </AbsoluteFill>
  );
};
