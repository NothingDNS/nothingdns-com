import { ImageResponse } from "next/og";
import { BrandWordmark } from "@/components/brand";
export const dynamic = "force-static";
export const alt = "NothingDNS — Less noise. More network.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Preserve an image extension so static hosts can serve the correct MIME type.
export function generateImageMetadata() {
  return [{ id: "nothingdns.png", alt, size, contentType }];
}

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0c0d10",
        padding: "65px 80px",
        color: "#f4f5f6",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 28,
          color: "#f4f5f6",
          letterSpacing: -1,
        }}
      >
        <BrandWordmark width={320} height={42} ink="#f4f5f6" />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: 85,
          fontSize: 94,
          fontWeight: 600,
          letterSpacing: -6,
          lineHeight: 1.03,
        }}
      >
        <div>Less noise.</div>
        <div style={{ color: "#c0c9d6" }}>More network.</div>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 48,
          fontSize: 22,
          color: "#a5abb6",
        }}
      >
        YOUR NETWORK. YOUR RULES. / OPEN SOURCE DNS
      </div>
    </div>,
    size,
  );
}
