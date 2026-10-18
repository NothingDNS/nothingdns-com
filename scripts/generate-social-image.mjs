import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createElement as h } from "react";

const require = createRequire(import.meta.url);
const { ImageResponse } = require("next/og");
const root = new URL("../", import.meta.url);
const logo = await readFile(new URL("public/brand/logo.svg", root), "utf8");
const svgData = (source) =>
  `data:image/svg+xml;base64,${Buffer.from(source).toString("base64")}`;

const radius = 170;
function project(latitude, longitude) {
  const lat = (latitude * Math.PI) / 180;
  const lon = (longitude * Math.PI) / 180;
  const x = Math.cos(lat) * Math.sin(lon);
  const y = -Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lon);
  const tilt = -0.22;
  return {
    x: 240 + radius * (x * Math.cos(tilt) - y * Math.sin(tilt)),
    y: 240 + radius * (x * Math.sin(tilt) + y * Math.cos(tilt)),
    z,
  };
}
const points = [];
for (let latitude = -80; latitude <= 80; latitude += 10) {
  for (let longitude = -85; longitude <= 85; longitude += 10) {
    const point = project(latitude, longitude);
    points.push(
      `<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="${(0.75 + point.z * 0.8).toFixed(2)}" fill="#c0c9d6" opacity="${(0.15 + point.z * 0.55).toFixed(2)}"/>`,
    );
  }
}
const connections = [
  [20, -40],
  [45, 15],
  [-5, 45],
  [-40, 0],
  [-15, -60],
].map(([lat, lon]) => project(lat, lon));
const globe = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
  <defs>
    <radialGradient id="sphere"><stop stop-color="#1c222b"/><stop offset="1" stop-color="#0c0d10"/></radialGradient>
    <radialGradient id="node"><stop stop-color="#00e878" stop-opacity=".26"/><stop offset="1" stop-color="#00e878" stop-opacity="0"/></radialGradient>
  </defs>
  <circle cx="240" cy="240" r="170" fill="url(#sphere)" stroke="#c0c9d6" stroke-opacity=".14"/>
  <g fill="none" stroke="#c0c9d6" stroke-opacity=".12">
    <ellipse cx="240" cy="240" rx="86" ry="170" transform="rotate(-13 240 240)"/>
    <ellipse cx="240" cy="240" rx="139" ry="170" transform="rotate(-13 240 240)"/>
    <ellipse cx="240" cy="240" rx="170" ry="57" transform="rotate(-13 240 240)"/>
    <ellipse cx="240" cy="240" rx="170" ry="113" transform="rotate(-13 240 240)"/>
  </g>
  ${points.join("")}
  <ellipse cx="240" cy="240" rx="225" ry="71" transform="rotate(-30 240 240)" fill="none" stroke="#b0bac9" stroke-opacity=".33"/>
  <ellipse cx="240" cy="240" rx="210" ry="95" transform="rotate(24 240 240)" fill="none" stroke="#b0bac9" stroke-opacity=".16"/>
  <path d="${connections.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ")}" fill="none" stroke="#a4b4c7" stroke-opacity=".28"/>
  ${connections.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="19" fill="url(#node)"/><circle cx="${point.x}" cy="${point.y}" r="3.5" fill="#00e878"/>`).join("")}
</svg>`;

const text = (value, style) =>
  h("div", { style: { display: "flex", ...style } }, value);
const response = new ImageResponse(
  h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0c0d10",
        color: "#f4f5f6",
        overflow: "hidden",
      },
    },
    h("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background:
          "linear-gradient(90deg, #00e878 0%, #00e878 15%, #26352e 45%, #0c0d10 100%)",
      },
    }),
    h("img", {
      src: svgData(logo),
      alt: "NothingDNS",
      width: 304,
      height: 47,
      style: { position: "absolute", top: 53, left: 58 },
    }),
    text("SELF-HOSTED. OPEN SOURCE. YOURS.", {
      position: "absolute",
      top: 162,
      left: 64,
      color: "#929ba8",
      fontSize: 14,
      letterSpacing: 2,
    }),
    text("Less noise.", {
      position: "absolute",
      top: 207,
      left: 58,
      fontSize: 91,
      fontWeight: 700,
      letterSpacing: -5,
      lineHeight: 1.12,
    }),
    text("More network.", {
      position: "absolute",
      top: 305,
      left: 58,
      color: "#c0c9d6",
      fontSize: 91,
      fontWeight: 700,
      letterSpacing: -5,
      lineHeight: 1.12,
    }),
    text("A quieter internet starts with your DNS.", {
      position: "absolute",
      top: 433,
      left: 64,
      color: "#a0a4ad",
      fontSize: 23,
      letterSpacing: -0.4,
    }),
    h("img", {
      src: svgData(globe),
      alt: "",
      width: 480,
      height: 480,
      style: { position: "absolute", top: 60, right: 5 },
    }),
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 96,
          right: 84,
          display: "flex",
          alignItems: "center",
          gap: 9,
          color: "#a0a4ad",
          fontSize: 12,
          letterSpacing: 1.7,
        },
      },
      h("span", {
        style: {
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#00e878",
        },
      }),
      "ENCRYPTED BY DESIGN",
    ),
    h("div", {
      style: {
        position: "absolute",
        bottom: 81,
        left: 64,
        right: 64,
        height: 1,
        background: "#292d34",
      },
    }),
    h(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 31,
          left: 64,
          display: "flex",
          gap: 24,
          color: "#a0a4ad",
          fontSize: 16,
        },
      },
      text("One Go binary", {}),
      text("Encrypted DNS", {}),
      text("MIT licensed", {}),
    ),
    text("nothingdns.com", {
      position: "absolute",
      bottom: 31,
      right: 64,
      color: "#e7eaf0",
      fontSize: 18,
      letterSpacing: -0.3,
    }),
  ),
  { width: 1200, height: 630 },
);
await writeFile(
  new URL("public/og.png", root),
  Buffer.from(await response.arrayBuffer()),
);
console.log("Generated public/og.png (1200×630).");
