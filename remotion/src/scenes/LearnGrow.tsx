import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont } from "@remotion/google-fonts/PlayfairDisplay";
import { MockCard, ProgressBar } from "../components/MockCard";

const { fontFamily: playfair } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });

export const LearnGrow = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleS = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });

  const courses = [
    { title: "Storytelling Fundamentals", instructor: "Varun Agarwal", progress: 85 },
    { title: "Visual Cinematography", instructor: "Ruchi Narain", progress: 45 },
    { title: "Editing Masterclass", instructor: "Nitesh Tiwari", progress: 20 },
  ];

  return (
    <AbsoluteFill style={{ padding: "80px 120px" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", letterSpacing: 4, textTransform: "uppercase", opacity: interpolate(titleS, [0, 1], [0, 1]), marginBottom: 12 }}>
        LEARN & GROW
      </div>
      <div style={{ fontFamily: playfair, fontSize: 52, fontWeight: 700, color: "#fff", opacity: interpolate(titleS, [0, 1], [0, 1]), marginBottom: 48 }}>
        World-Class Learning
      </div>

      <div style={{ display: "flex", gap: 28 }}>
        {courses.map((course, i) => (
          <MockCard key={i} title={course.title} subtitle={`by ${course.instructor}`} icon={["🎬", "📸", "✂️"][i]} delay={8 + i * 8} width={380}>
            <ProgressBar progress={course.progress} delay={18 + i * 8} />
            <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {course.progress}% complete
            </div>
          </MockCard>
        ))}
      </div>
    </AbsoluteFill>
  );
};
