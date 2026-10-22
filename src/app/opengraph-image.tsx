import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#081120",
          color: "#fff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: 12, color: "#2AA198" }}>SHARK</div>
        <div style={{ fontSize: 84, fontWeight: 900, marginTop: 16 }}>Your whole life at sea,</div>
        <div style={{ fontSize: 84, fontWeight: 900, color: "#2AA198" }}>in one app.</div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#8B98A5" }}>Don&apos;t be the prey. Be the shark.</div>
      </div>
    ),
    { ...size }
  );
}
