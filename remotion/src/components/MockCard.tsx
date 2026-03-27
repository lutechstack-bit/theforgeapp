import { useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import React from "react";

interface MockCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  delay?: number;
  width?: number;
  color?: string;
  children?: React.ReactNode;
}

export const MockCard: React.FC<MockCardProps> = ({
  title,
  subtitle,
  icon,
  delay = 0,
  width = 380,
  color = "#f59e0b",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 180 } });
  const y = interpolate(s, [0, 1], [60, 0]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width,
        background: "rgba(30,30,30,0.9)",
        borderRadius: 16,
        padding: "24px 28px",
        border: `1px solid rgba(245,158,11,0.15)`,
        transform: `translateY(${y}px)`,
        opacity,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(245,158,11,0.05)`,
      }}
    >
      {icon && (
        <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      )}
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#ffffff",
          marginBottom: subtitle ? 6 : 0,
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
};

export const ProgressBar: React.FC<{ progress: number; delay?: number; color?: string }> = ({
  progress,
  delay = 0,
  color = "#f59e0b",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: 120 } });
  const w = interpolate(s, [0, 1], [0, progress]);

  return (
    <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 3 }} />
    </div>
  );
};
