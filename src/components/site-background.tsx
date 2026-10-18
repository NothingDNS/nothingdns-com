"use client";

import { useEffect, useRef } from "react";
import {
  AMBIENT_FIELD,
  AmbientField,
  BACKGROUND_CONTROL_SELECTOR,
} from "@/lib/ambient-field";
import { isSceneTap } from "@/lib/dns-scene";
import { createSceneLoop, sceneCanAnimate } from "@/lib/scene-loop";
import { useAmbientMotion } from "./ambient-motion";

const initial = new AmbientField(1600, 1000);
const shapes = [
  "M-22 0a22 22 0 1 0 44 0a22 22 0 1 0-44 0M-12 0a12 12 0 0 1 12-12M0 18v9M18 0h9",
  "M0-25 25 0 0 25-25 0ZM0-11 11 0 0 11-11 0ZM25 0h23m-96 0h23",
  "M-23-15h32l14 15-14 15h-32l14-15ZM-23-5h15m-15 10h15M30 0h15m-90 0h12",
  "M-23-8v-15h15M8-23h15v15M23 8v15H8M-8 23h-15V8M-7 0H7M0-7V7",
  "M-26-12H4l10 12L4 12h-30M-18-20h30l18 20-18 20h-30M-26 0h20",
  "M-28 0a28 12 0 1 0 56 0a28 12 0 1 0-56 0M0-28a12 28 0 1 0 0 56a12 28 0 1 0 0-56M-3 0h6",
];

/** One viewport-sized SVG survives route changes; React never renders a frame. */
export function SiteBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const controller = useRef<((paused: boolean) => void) | null>(null);
  const { paused } = useAmbientMotion();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const nodes = Array.from(
      svg.querySelectorAll<SVGGElement>("[data-field-node]"),
    );
    const waves = Array.from(
      svg.querySelectorAll<SVGGElement>("[data-field-wave]"),
    );
    const particles = Array.from(
      svg.querySelectorAll<SVGPathElement>("[data-field-particle]"),
    );
    const links = Array.from(
      svg.querySelectorAll<SVGPathElement>("[data-field-link]"),
    );
    const scene = new AmbientField(svg.clientWidth, svg.clientHeight);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false,
      userPaused = false,
      disposed = false;
    let tap: {
      x: number;
      y: number;
      time: number;
      id: number;
      blocked: boolean;
    } | null = null;
    const hidden = new Set<number>();

    function paint() {
      if (disposed) return;
      nodes.forEach((element, i) => {
        const node = scene.nodes[i];
        if (!node?.visible) {
          if (!hidden.has(i)) element.style.display = "none";
          hidden.add(i);
          return;
        }
        if (hidden.delete(i) || element.style.display === "none")
          element.style.display = "";
        element.setAttribute(
          "transform",
          `translate(${(node.x + node.dx).toFixed(2)} ${(node.y + node.dy).toFixed(2)}) rotate(${node.angle.toFixed(2)}) scale(${(node.size / 24).toFixed(3)})`,
        );
      });
      links.forEach((element, i) => {
        const a = scene.nodes[i * 2],
          b = scene.nodes[i * 2 + 1];
        const show =
          a?.visible &&
          b?.visible &&
          Math.hypot(a.x - b.x, a.y - b.y) < scene.width * 0.3;
        element.style.display = show ? "" : "none";
        if (!show) return;
        const ax = a.x + a.dx,
          ay = a.y + a.dy,
          bx = b.x + b.dx,
          by = b.y + b.dy;
        const middle = (ax + bx) / 2;
        element.setAttribute(
          "d",
          `M${ax.toFixed(1)} ${ay.toFixed(1)}H${middle.toFixed(1)}L${(middle + 18 * scene.unit).toFixed(1)} ${by.toFixed(1)}H${bx.toFixed(1)}`,
        );
      });
      waves.forEach((element, i) => {
        const wave = scene.waves[i];
        element.style.display = wave ? "" : "none";
        if (!wave) return;
        const progress = wave.age / AMBIENT_FIELD.waveLifetime;
        const radius = Math.max(
          0.01,
          (1 - Math.exp(-wave.age * 1.6)) *
            AMBIENT_FIELD.waveRadius *
            scene.unit,
        );
        element.setAttribute(
          "transform",
          `translate(${wave.x} ${wave.y}) scale(${radius.toFixed(2)})`,
        );
        element.setAttribute(
          "opacity",
          ((1 - progress) ** 2 * 0.55).toFixed(3),
        );
      });
      particles.forEach((element, i) => {
        const particle = scene.particles[i];
        element.style.display = particle ? "" : "none";
        if (!particle) return;
        const distance = particle.speed * (1 - Math.exp(-particle.age * 2.2));
        const x = particle.x + Math.cos(particle.angle) * distance;
        const y = particle.y + Math.sin(particle.angle) * distance;
        element.setAttribute(
          "transform",
          `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${((particle.angle * 180) / Math.PI).toFixed(1)}) scale(${scene.unit})`,
        );
        element.setAttribute(
          "opacity",
          (
            (1 - particle.age / AMBIENT_FIELD.particleLifetime) ** 2 *
            0.65
          ).toFixed(3),
        );
      });
    }

    const enabled = () =>
      sceneCanAnimate({
        visible,
        hidden: document.hidden,
        reduced: reduced.matches,
        paused: userPaused,
      });
    const loop = createSceneLoop(
      {
        request: (callback) => requestAnimationFrame(callback),
        cancel: (id) => cancelAnimationFrame(id),
        render: (dt) => {
          scene.step(dt);
          paint();
        },
      },
      () => (scene.width < AMBIENT_FIELD.mobileWidth ? 24 : 30),
    );

    function updateActivity() {
      const active = enabled();
      loop.setActive(active);
      if (!active) {
        scene.clearEffects();
        tap = null;
      }
      if (visible && !document.hidden) paint();
    }
    controller.current = (value) => {
      userPaused = value;
      updateActivity();
    };

    function resize() {
      scene.resize(svg!.clientWidth, svg!.clientHeight);
      scene.setScroll(window.scrollY, true);
      scene.step(0);
      svg!.setAttribute("viewBox", `0 0 ${scene.width} ${scene.height}`);
      if (!document.hidden) paint();
    }
    function scroll() {
      tap = null;
      scene.leave();
      if (enabled()) scene.setScroll(window.scrollY);
    }
    const blocked = (target: EventTarget | null) =>
      !(target instanceof Element) ||
      Boolean(target.closest(BACKGROUND_CONTROL_SELECTOR));
    function pointerMove(event: PointerEvent) {
      if (
        tap &&
        tap.id === event.pointerId &&
        Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 9
      )
        tap.blocked = true;
      if (!enabled() || event.pointerType !== "mouse") return;
      if (blocked(event.target)) scene.leave();
      else scene.move(event.clientX, event.clientY);
    }
    function pointerDown(event: PointerEvent) {
      if (!enabled() || !event.isPrimary || event.button !== 0) return;
      tap = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
        id: event.pointerId,
        blocked: blocked(event.target),
      };
    }
    function pointerUp(event: PointerEvent) {
      const start = tap;
      tap = null;
      if (
        !start ||
        start.id !== event.pointerId ||
        start.blocked ||
        blocked(event.target) ||
        !enabled() ||
        window.getSelection()?.isCollapsed === false ||
        !isSceneTap(start, {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
        })
      )
        return;
      scene.burst(event.clientX, event.clientY);
    }
    function leave() {
      scene.leave();
      tap = null;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateActivity();
    });
    observer.observe(svg);
    const sizes = new ResizeObserver(resize);
    sizes.observe(svg);
    const passive = { passive: true };
    window.addEventListener("pointermove", pointerMove, passive);
    window.addEventListener("pointerdown", pointerDown, passive);
    window.addEventListener("pointerup", pointerUp, passive);
    window.addEventListener("pointercancel", leave, passive);
    document.documentElement.addEventListener("pointerleave", leave, passive);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", scroll, passive);
    window.addEventListener("resize", resize, passive);
    document.addEventListener("visibilitychange", updateActivity);
    reduced.addEventListener("change", updateActivity);
    resize();
    return () => {
      disposed = true;
      controller.current = null;
      loop.dispose();
      observer.disconnect();
      sizes.disconnect();
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerdown", pointerDown);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", updateActivity);
      reduced.removeEventListener("change", updateActivity);
    };
  }, []);

  useEffect(() => {
    controller.current?.(paused);
  }, [paused]);

  return (
    <div className="site-background" aria-hidden="true" data-no-scene>
      <svg
        ref={svgRef}
        viewBox="0 0 1600 1000"
        preserveAspectRatio="none"
        focusable="false"
        className="ambient-field"
      >
        <svg
          viewBox="0 0 1600 1000"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          className="ambient-contours"
        >
          <path d="M-200 120C180 50 70 580 430 540S800 110 1100 180 1500 740 1800 590" />
          <path d="M-200 138C180 68 70 598 430 558S800 128 1100 198 1500 758 1800 608" />
          <path d="M-100 880C280 1010 260 360 620 420S1130 1040 1680 830" />
        </svg>
        <g className="ambient-links">
          {Array.from({ length: AMBIENT_FIELD.maxNodes / 2 }, (_, i) => (
            <path key={i} data-field-link />
          ))}
        </g>
        {Array.from({ length: AMBIENT_FIELD.maxNodes }, (_, i) => {
          const node = initial.nodes[i];
          return (
            <g
              key={i}
              data-field-node
              className={`ambient-object${i % 9 === 0 ? " ambient-accent" : ""}`}
              transform={
                node
                  ? `translate(${node.x} ${node.y}) rotate(${node.angle}) scale(${node.size / 24})`
                  : undefined
              }
              style={{
                display: node?.visible ? undefined : "none",
                opacity: 0.32 + (node?.depth ?? 0.5) * 0.22,
              }}
            >
              <path d={shapes[i % shapes.length]} />
              <circle r="2" className="ambient-core" />
            </g>
          );
        })}
        <g className="ambient-waves">
          {Array.from({ length: AMBIENT_FIELD.maxWaves }, (_, i) => (
            <g key={i} data-field-wave style={{ display: "none" }}>
              <circle r="1" />
              <circle r="0.72" strokeDasharray="2 8" />
            </g>
          ))}
        </g>
        <g className="ambient-particles">
          {Array.from({ length: AMBIENT_FIELD.maxParticles }, (_, i) => (
            <path
              key={i}
              data-field-particle
              d="M-3 0H3M0-2V2"
              style={{ display: "none" }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
