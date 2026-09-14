import { ImageResponse } from "next/og";

export const alt = "DeHash - Modern URL Shortener & Dynamic QR Code Generator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#090d16",
          color: "white",
          fontFamily: "sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Glow circles */}
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "rgba(168, 85, 247, 0.25)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 24px",
            borderRadius: "9999px",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.4)",
            color: "#60a5fa",
            fontSize: "22px",
            fontWeight: "600",
            marginBottom: "32px",
          }}
        >
          ✦ DeHash URL Shortener & QR Studio
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontSize: "62px",
            fontWeight: "800",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            marginBottom: "24px",
            color: "#ffffff",
          }}
        >
          <span>Shorten Links. Generate QR Codes.</span>
          <span style={{ color: "#3b82f6" }}>Track In-Depth Analytics.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "920px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          Fast, reliable, and secure link management platform with real-time visitor tracking and expiration controls.
        </div>

        {/* Features footer */}
        <div
          style={{
            display: "flex",
            gap: "36px",
            color: "#cbd5e1",
            fontSize: "20px",
            fontWeight: "500",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>✓ Free 50 links/mo</div>
          <div style={{ display: "flex", alignItems: "center" }}>✓ Custom QR Codes</div>
          <div style={{ display: "flex", alignItems: "center" }}>✓ Real-time Geo Analytics</div>
          <div style={{ display: "flex", alignItems: "center" }}>✓ 99.9% Uptime SLA</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
