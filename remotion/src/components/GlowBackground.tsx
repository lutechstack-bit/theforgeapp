import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const GlowBackground = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.008) * 40;
  const drift2 = Math.cos(frame * 0.006) * 30;
  const opacity = interpolate(frame, [0, 30], [0, 0.15], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      {/* Ambient amber glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)",
          top: 200 + drift,
          right: 100 + drift2,
          opacity,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
          bottom: 100 - drift2,
          left: 200 + drift,
          opacity,
          filter: "blur(60px)",
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
