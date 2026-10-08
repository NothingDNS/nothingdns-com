"use client";

import { useEffect, useRef } from "react";
import { ArrowDownLeft, LockKeyhole } from "lucide-react";

export function NetworkGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, visible = true, width = 600, height = 600;
    const points = Array.from({ length: 1800 }, (_, i) => {
      const phi = Math.acos(1 - 2 * (i + 0.5) / 1800);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return [Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
    });
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width; height = entry.contentRect.height;
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced.matches) draw(0);
    });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    function draw(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const radius = Math.min(width, height) * 0.345;
      const cx = width / 2, cy = height / 2;
      const rotation = reduced.matches ? 0.35 : time * 0.000055;
      const cos = Math.cos(rotation), sin = Math.sin(rotation);
      const light = document.documentElement.dataset.theme === "light";
      const rgb = light ? "30, 118, 82" : "161, 236, 191";
      const project = (x: number, y: number, z: number) => {
        const rx = x * cos + z * sin, rz = -x * sin + z * cos;
        const ry = y * Math.cos(-0.25) - rz * Math.sin(-0.25);
        const rz2 = y * Math.sin(-0.25) + rz * Math.cos(-0.25);
        const scale = 2.8 / (2.8 - rz2 * 0.25);
        return [cx + rx * radius * scale, cy + ry * radius * scale, rz2];
      };
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.4);
      glow.addColorStop(0, `rgba(${rgb},0.07)`); glow.addColorStop(0.75, `rgba(${rgb},0.025)`); glow.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
      // A rotating wireframe sphere with depth-aware point lighting.
      for (let latitude = -75; latitude <= 75; latitude += 15) {
        const phi = latitude * Math.PI / 180;
        ctx.beginPath();
        for (let j = 0; j <= 120; j++) {
          const theta = j / 120 * Math.PI * 2;
          const [x, y] = project(Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta));
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${rgb},${latitude === 0 ? 0.36 : 0.13})`; ctx.lineWidth = latitude === 0 ? 1 : 0.5; ctx.stroke();
      }
      for (let longitude = 0; longitude < 180; longitude += 15) {
        const theta = longitude * Math.PI / 180;
        ctx.beginPath();
        for (let j = 0; j <= 120; j++) {
          const phi = j / 120 * Math.PI * 2;
          const [x, y] = project(Math.cos(phi) * Math.cos(theta), Math.sin(phi), Math.cos(phi) * Math.sin(theta));
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${rgb},0.1)`; ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (let i = 0; i < points.length; i++) {
        const [x, y, z] = project(points[i][0], points[i][1], points[i][2]);
        const depth = (z + 1) / 2;
        const pattern = Math.sin(points[i][0] * 13 + points[i][1] * 8) * Math.cos(points[i][2] * 11);
        const alpha = (0.12 + depth * 0.65) * (pattern > 0.1 ? 1 : 0.38);
        ctx.beginPath(); ctx.arc(x, y, 0.6 + depth * 0.9, 0, Math.PI * 2); ctx.fillStyle = `rgba(${rgb},${alpha})`; ctx.fill();
        if (i % 157 === 0 && z > 0.1) {
          ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = light ? "#287653" : "#c9f7ac"; ctx.shadowColor = "#b7f799"; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;
        }
      }
      // An orbital path extending past the globe gives the composition its depth.
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.35); ctx.beginPath(); ctx.ellipse(0, 0, radius * 1.34, radius * 0.38, 0, 0, Math.PI * 2); ctx.strokeStyle = `rgba(${rgb},0.35)`; ctx.lineWidth = 0.7; ctx.stroke();
      const orbit = reduced.matches ? 1 : time * 0.00025;
      ctx.beginPath(); ctx.arc(Math.cos(orbit) * radius * 1.34, Math.sin(orbit) * radius * 0.38, 3.5, 0, Math.PI * 2); ctx.fillStyle = light ? "#287653" : "#d0ffb8"; ctx.shadowColor = "#b7f799"; ctx.shadowBlur = 20; ctx.fill(); ctx.restore();
    }
    const animate = (time: number) => {
      if (visible && !document.hidden) draw(time);
      if (!reduced.matches) frame = requestAnimationFrame(animate);
    };
    const motionChange = () => { cancelAnimationFrame(frame); if (reduced.matches) draw(0); else frame = requestAnimationFrame(animate); };
    const themeObserver = new MutationObserver(() => { if (reduced.matches) draw(0); });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    resize.observe(canvas); intersection.observe(canvas); reduced.addEventListener("change", motionChange);
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect(); themeObserver.disconnect(); reduced.removeEventListener("change", motionChange); };
  }, []);
  return <div className="globe-scene" aria-hidden="true"><div className="globe-grid" /><div className="globe-cross cross-one">+</div><div className="globe-cross cross-two">+</div><canvas ref={canvasRef} /><div className="globe-label label-top"><span className="small-dot" />ENCRYPTED BY DESIGN</div><div className="globe-tag"><div className="globe-tag-icon"><LockKeyhole size={15} /></div><div><span className="mono">DNSSEC</span><strong>Trust, verified.</strong></div><span className="globe-tag-check">↗</span></div><div className="globe-coordinate mono">53° 00′ N / YOUR NETWORK</div><div className="globe-caption"><ArrowDownLeft size={16} /><span>Every query. Your rules.</span></div></div>;
}
