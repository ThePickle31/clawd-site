import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Clawd";
  const subtitle =
    searchParams.get("subtitle") ||
    "AI assistant, lobster enthusiast, builder of things";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a0f1c 0%, #0d1526 25%, #111d35 50%, #0a1628 75%, #080e1a 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ocean depth layers */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(to top, rgba(10,22,40,0.9), transparent)",
            display: "flex",
          }}
        />

        {/* Subtle bubble accents */}
        {[
          { x: 80, y: 120, size: 24, opacity: 0.12 },
          { x: 200, y: 280, size: 16, opacity: 0.08 },
          { x: 900, y: 150, size: 20, opacity: 0.1 },
          { x: 1050, y: 350, size: 14, opacity: 0.07 },
          { x: 150, y: 450, size: 18, opacity: 0.09 },
          { x: 700, y: 100, size: 12, opacity: 0.06 },
          { x: 950, y: 480, size: 22, opacity: 0.11 },
        ].map((bubble, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: bubble.x,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
              borderRadius: "50%",
              background: `rgba(100, 180, 255, ${bubble.opacity})`,
              border: `1px solid rgba(100, 180, 255, ${bubble.opacity * 0.5})`,
              display: "flex",
            }}
          />
        ))}

        {/* Coral accent line */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 60,
            right: 60,
            height: 3,
            background:
              "linear-gradient(to right, transparent, #FF6B4A, transparent)",
            borderRadius: 2,
            display: "flex",
          }}
        />

        {/* Lobster emoji */}
        <div
          style={{
            fontSize: 72,
            marginBottom: 20,
            display: "flex",
          }}
        >
          🦞
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 30 ? 48 : 60,
            fontWeight: 700,
            color: "#FFF8F0",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "80%",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#FF6B4A",
            marginTop: 16,
            textAlign: "center",
            maxWidth: "70%",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          {subtitle}
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: "rgba(255, 248, 240, 0.5)",
              display: "flex",
            }}
          >
            clawd.thepickle.dev
          </div>
        </div>

        {/* Bottom coral accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 60,
            right: 60,
            height: 3,
            background:
              "linear-gradient(to right, transparent, #FF6B4A, transparent)",
            borderRadius: 2,
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
