import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand";
export const alt = "NothingDNS — Less noise. More network.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", background: "#101211", padding: "65px 80px", color: "#f2f3ed" }}><div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, color: "#c7f4a5", letterSpacing: -1 }}><BrandMark width={34} height={34} />nothingdns.</div><div style={{ display: "flex", flexDirection: "column", marginTop: 85, fontSize: 94, fontWeight: 600, letterSpacing: -6, lineHeight: 1.03 }}><div>Less noise.</div><div style={{ color: "#c7f4a5" }}>More network.</div></div><div style={{ display: "flex", marginTop: 48, fontSize: 22, color: "#a3aaa1" }}>YOUR NETWORK. YOUR RULES. / OPEN SOURCE DNS</div></div>, size);
}
