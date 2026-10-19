"use client";

import { useEffect, useId, useRef } from "react";
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

function Geometry({ index }: { index: number }) {
  return (
    <>
      <path d={shapes[index % shapes.length]} />
      <circle r="2" className="ambient-core" />
    </>
  );
}

/** Calm geometry below the content; local reactions above it. Neither captures input. */
export function SiteBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const effectsRef = useRef<SVGSVGElement>(null);
  const glowId = `field-glow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { paused, pointerEnabled } = useAmbientMotion();
  const pointerController = useRef<((enabled: boolean) => void) | null>(null);

  useEffect(() => {
    const svg = svgRef.current,
      effects = effectsRef.current;
    if (!svg || !effects) return;
    const nodes = Array.from(
      svg.querySelectorAll<SVGGElement>("[data-field-node]"),
    );
    const reactions = Array.from(
      effects.querySelectorAll<SVGGElement>("[data-field-reaction]"),
    );
    const resonanceRings = reactions.map(
      (element) =>
        element.querySelector<SVGCircleElement>("[data-field-resonance]")!,
    );
    const relayElements = Array.from(
      effects.querySelectorAll<SVGGElement>("[data-field-relay]"),
    ).map((element) => ({
      element,
      path: element.querySelector("path")!,
      packet: element.querySelector("circle")!,
    }));
    const waves = Array.from(
      effects.querySelectorAll<SVGGElement>("[data-field-wave]"),
    );
    const particles = Array.from(
      effects.querySelectorAll<SVGPathElement>("[data-field-particle]"),
    );
    const trails = Array.from(
      effects.querySelectorAll<SVGPathElement>("[data-field-trail]"),
    );
    const links = Array.from(
      svg.querySelectorAll<SVGPathElement>("[data-field-link]"),
    );
    const halo = effects.querySelector<SVGGElement>("[data-field-halo]")!;
    const haloOrbit = halo.querySelector<SVGCircleElement>(
      ".field-cursor-orbit",
    )!;
    const scene = new AmbientField(svg.clientWidth, svg.clientHeight);
    let lastFrameWallAt = performance.now();
    let visible = false,
      pointerActive = false,
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
        const node = scene.nodes[i],
          reaction = reactions[i];
        if (!node?.visible) {
          if (!hidden.has(i)) element.style.display = "none";
          hidden.add(i);
          reaction.style.display = "none";
          return;
        }
        if (hidden.delete(i) || element.style.display === "none")
          element.style.display = "";
        const transform = `translate(${(node.x + node.dx).toFixed(2)} ${(node.y + node.dy).toFixed(2)}) rotate(${node.angle.toFixed(2)}) scale(${(node.size / 24).toFixed(3)})`;
        element.setAttribute("transform", transform);
        const active = node.activation > 0.005;
        reaction.style.display = active ? "" : "none";
        if (active) {
          reaction.setAttribute("transform", transform);
          reaction.setAttribute("opacity", (node.activation * 0.48).toFixed(3));
          const ring = resonanceRings[i];
          ring.style.display = node.resonance > 0.005 ? "" : "none";
          if (node.resonance > 0.005) {
            ring.setAttribute("r", (26 + (1 - node.resonance) * 24).toFixed(2));
            ring.setAttribute("opacity", (node.resonance * 0.7).toFixed(3));
          }
        }
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
      const pointerVisible = scene.pointer.energy > 0.008;
      halo.style.display = pointerVisible ? "" : "none";
      if (pointerVisible) {
        halo.setAttribute(
          "transform",
          `translate(${scene.pointer.x} ${scene.pointer.y}) scale(${scene.unit})`,
        );
        halo.setAttribute(
          "opacity",
          Math.sqrt(scene.pointer.energy).toFixed(3),
        );
        haloOrbit.setAttribute(
          "r",
          (43 + Math.sin(scene.time * 2.3) * 5).toFixed(2),
        );
      }
      trails.forEach((element, i) => {
        const a = scene.trails[i],
          b = scene.trails[i + 1];
        const show =
          a && b && Math.hypot(a.x - b.x, a.y - b.y) < 180 * scene.unit;
        element.style.display = show ? "" : "none";
        if (!show) return;
        const life = 1 - a.age / AMBIENT_FIELD.trailLifetime;
        element.setAttribute("d", `M${a.x} ${a.y}L${b.x} ${b.y}`);
        element.setAttribute("opacity", (life * life * 0.45).toFixed(3));
        element.style.strokeWidth = `${(0.8 + life * 1.6) * scene.unit}px`;
      });
      relayElements.forEach(({ element, path, packet }, i) => {
        const relay = scene.relays[i];
        const source = relay && scene.nodes[relay.from],
          target = relay && scene.nodes[relay.to];
        const show =
          relay &&
          relay.from >= 0 &&
          source?.visible &&
          target?.visible &&
          scene.time >= relay.startAt;
        element.style.display = show ? "" : "none";
        if (!show) return;
        const ax = source.x + source.dx,
          ay = source.y + source.dy,
          bx = target.x + target.dx,
          by = target.y + target.dy;
        const dx = bx - ax,
          dy = by - ay,
          distance = Math.max(1, Math.hypot(dx, dy));
        const bend =
          Math.min(38 * scene.unit, distance * 0.18) *
          (relay.seed % 2 ? 1 : -1);
        const cx = (ax + bx) / 2 - (dy / distance) * bend,
          cy = (ay + by) / 2 + (dx / distance) * bend;
        const progress = Math.min(
          1,
          Math.max(
            0,
            (scene.time - relay.startAt) / (relay.arriveAt - relay.startAt),
          ),
        );
        const life = Math.max(
          0,
          1 -
            Math.max(0, scene.time - relay.arriveAt) /
              AMBIENT_FIELD.relayLifetime,
        );
        const enter = Math.min(1, (scene.time - relay.startAt) / 0.12);
        element.setAttribute(
          "opacity",
          (relay.energy * life * enter * 0.55).toFixed(3),
        );
        path.setAttribute(
          "d",
          `M${ax.toFixed(2)} ${ay.toFixed(2)}Q${cx.toFixed(2)} ${cy.toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)}`,
        );
        packet.setAttribute(
          "cx",
          (
            (1 - progress) ** 2 * ax +
            2 * (1 - progress) * progress * cx +
            progress ** 2 * bx
          ).toFixed(2),
        );
        packet.setAttribute(
          "cy",
          (
            (1 - progress) ** 2 * ay +
            2 * (1 - progress) * progress * cy +
            progress ** 2 * by
          ).toFixed(2),
        );
        packet.setAttribute("r", (2.3 * scene.unit).toFixed(2));
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
          ((1 - progress) ** 1.6 * 0.65).toFixed(3),
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
            0.7
          ).toFixed(3),
        );
      });
    }

    const enabled = () =>
      sceneCanAnimate({
        visible,
        hidden: document.hidden,
        reduced: false, // Device default and explicit opt-in are resolved by the provider.
        paused,
      });
    const loop = createSceneLoop(
      {
        request: (callback) => requestAnimationFrame(callback),
        cancel: (id) => cancelAnimationFrame(id),
        render: (_dt, elapsed) => {
          scene.step(elapsed);
          lastFrameWallAt = performance.now();
          paint();
        },
      },
      () => (scene.width < AMBIENT_FIELD.mobileWidth ? 24 : 45),
    );

    function updateActivity() {
      const active = enabled();
      lastFrameWallAt = performance.now();
      scene.setScroll(window.scrollY, true);
      loop.setActive(active);
      if (!active) {
        scene.clearEffects();
        tap = null;
      }
      scene.step(0);
      if (visible && !document.hidden) paint();
    }
    function resize() {
      scene.resize(svg!.clientWidth, svg!.clientHeight);
      scene.setScroll(window.scrollY, true);
      scene.step(0);
      const viewBox = `0 0 ${scene.width} ${scene.height}`;
      svg!.setAttribute("viewBox", viewBox);
      effects!.setAttribute("viewBox", viewBox);
      if (!document.hidden) paint();
    }
    function scroll() {
      tap = null;
      scene.setScroll(window.scrollY, !enabled());
    }
    const inputTime = () =>
      scene.time + Math.max(0, performance.now() - lastFrameWallAt) / 1000;
    // This filter applies only to taps. Hover coordinates never depend on the target.
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
      if (pointerActive && enabled() && event.pointerType === "mouse")
        scene.move(event.clientX, event.clientY, inputTime());
    }
    function pointerDown(event: PointerEvent) {
      if (
        !pointerActive ||
        !enabled() ||
        !event.isPrimary ||
        event.button !== 0
      )
        return;
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
        !pointerActive ||
        !enabled() ||
        window.getSelection()?.isCollapsed === false ||
        !isSceneTap(start, {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
        })
      )
        return;
      scene.burst(event.clientX, event.clientY, inputTime());
    }
    function leave() {
      scene.leave();
      tap = null;
    }
    const passive = { passive: true, capture: true };
    function setPointerEffects(active: boolean) {
      if (pointerActive === active) return;
      pointerActive = active;
      scene.clearEffects();
      tap = null;
      if (active) {
        window.addEventListener("pointermove", pointerMove, passive);
        window.addEventListener("pointerdown", pointerDown, passive);
        window.addEventListener("pointerup", pointerUp, passive);
        window.addEventListener("pointercancel", leave, passive);
        document.documentElement.addEventListener("pointerleave", leave, {
          passive: true,
        });
        window.addEventListener("blur", leave);
      } else {
        window.removeEventListener("pointermove", pointerMove, true);
        window.removeEventListener("pointerdown", pointerDown, true);
        window.removeEventListener("pointerup", pointerUp, true);
        window.removeEventListener("pointercancel", leave, true);
        document.documentElement.removeEventListener("pointerleave", leave);
        window.removeEventListener("blur", leave);
      }
      paint();
    }
    const sizes = new ResizeObserver(resize);
    sizes.observe(svg);
    resize();
    if (paused) {
      // Keep the static artwork responsive, with no input listeners or RAF work.
      return () => {
        disposed = true;
        sizes.disconnect();
        loop.dispose();
      };
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateActivity();
    });
    observer.observe(svg);
    pointerController.current = setPointerEffects;
    window.addEventListener("scroll", scroll, passive);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", updateActivity);
    return () => {
      pointerController.current = null;
      setPointerEffects(false);
      loop.dispose();
      scene.clearEffects();
      scene.step(0);
      tap = null;
      paint();
      disposed = true;
      observer.disconnect();
      sizes.disconnect();
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", updateActivity);
    };
  }, [paused]);

  // Changing the mouse preference never recreates or restarts the ambient scene.
  useEffect(() => {
    pointerController.current?.(pointerEnabled);
  }, [pointerEnabled, paused]);

  return (
    <>
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
                <Geometry index={i} />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="site-interactions" aria-hidden="true" data-no-scene>
        <svg
          ref={effectsRef}
          className="field-effects"
          viewBox="0 0 1600 1000"
          preserveAspectRatio="none"
          focusable="false"
        >
          <defs>
            <radialGradient id={glowId}>
              <stop offset="0" stopColor="currentColor" stopOpacity="0.075" />
              <stop
                offset="0.32"
                stopColor="currentColor"
                stopOpacity="0.035"
              />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g data-field-halo style={{ display: "none" }}>
            <circle
              r="190"
              fill={`url(#${glowId})`}
              className="field-halo-glow"
            />
            <circle r="17" className="field-cursor-ring" />
            <circle
              r="43"
              className="field-cursor-orbit"
              strokeDasharray="4 12"
            />
          </g>
          <g className="field-trails">
            {Array.from({ length: AMBIENT_FIELD.maxTrails }, (_, i) => (
              <path key={i} data-field-trail style={{ display: "none" }} />
            ))}
          </g>
          <g className="field-relays">
            {Array.from({ length: AMBIENT_FIELD.maxRelays }, (_, i) => (
              <g key={i} data-field-relay style={{ display: "none" }}>
                <path />
                <circle r="2.3" />
              </g>
            ))}
          </g>
          {Array.from({ length: AMBIENT_FIELD.maxNodes }, (_, i) => (
            <g
              key={i}
              data-field-reaction
              className={i % 9 === 0 ? "ambient-accent" : undefined}
              style={{ display: "none" }}
            >
              <Geometry index={i} />
              <circle
                data-field-resonance
                className="field-resonance-ring"
                r="26"
                style={{ display: "none" }}
              />
            </g>
          ))}
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
    </>
  );
}
