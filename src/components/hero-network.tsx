"use client";

import { useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import {
  backingSize,
  DNS_SCENE,
  DnsScene,
  drawDnsScene,
  type Area,
} from "@/lib/dns-scene";
import { createSceneLoop, sceneCanAnimate } from "@/lib/scene-loop";
import { useAmbientMotion } from "./ambient-motion";

export function HeroNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { paused, ready, toggle } = useAmbientMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>("[data-dns-hero]");
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !hero || !ctx) return;
    const scene = new DnsScene(hero.clientWidth, hero.clientHeight);
    let visible = paused,
      disposed = false;
    let protectedArea: Area | null = null;
    let palette =
      DNS_SCENE.palettes[
        document.documentElement.dataset.theme === "light" ? "light" : "dark"
      ];
    const paint = () => {
      if (disposed) return;
      drawDnsScene(
        ctx,
        scene,
        palette,
        protectedArea,
        true, // Pointer reactions live in the shared, unmasked SVG overlay.
      );
      canvas.style.opacity = "1";
    };
    const loop = createSceneLoop(
      {
        request: (callback) => window.requestAnimationFrame(callback),
        cancel: (id) => window.cancelAnimationFrame(id),
        render: (dt) => {
          scene.step(dt);
          paint();
        },
      },
      () =>
        scene.width < DNS_SCENE.mobileWidth
          ? DNS_SCENE.mobileFps
          : DNS_SCENE.fps,
    );
    function updateActivity() {
      const active = sceneCanAnimate({
        visible,
        hidden: document.hidden,
        reduced: false, // The shared preference includes the reduced-motion default.
        paused,
      });
      loop.setActive(active);
      if (!active) {
        scene.leave();
      }
      if (visible && !document.hidden && !active) paint();
    }
    function resize() {
      if (disposed) return;
      const rect = canvas!.getBoundingClientRect();
      const width = Math.max(1, rect.width),
        height = Math.max(1, rect.height);
      const backing = backingSize(width, height, window.devicePixelRatio);
      if (
        canvas!.width !== backing.width ||
        canvas!.height !== backing.height
      ) {
        canvas!.width = backing.width;
        canvas!.height = backing.height;
      }
      ctx!.setTransform(backing.dpr, 0, 0, backing.dpr, 0, 0);
      scene.resize(width, height);
      const copy = hero!
        .querySelector<HTMLElement>(".hero-copy")
        ?.getBoundingClientRect();
      protectedArea = copy
        ? {
            x: copy.left - rect.left,
            y: copy.top - rect.top,
            width: copy.width,
            height: copy.height,
          }
        : null;
      if (!document.hidden) paint();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hero);
    const copy = hero.querySelector(".hero-copy");
    if (copy) resizeObserver.observe(copy);
    const intersection = paused
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            updateActivity();
          },
          { threshold: 0 },
        );
    intersection?.observe(hero);
    const themeObserver = new MutationObserver(() => {
      palette =
        DNS_SCENE.palettes[
          document.documentElement.dataset.theme === "light" ? "light" : "dark"
        ];
      if (visible && !document.hidden) paint();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    if (!paused) {
      document.addEventListener("visibilitychange", updateActivity);
      window.addEventListener("resize", resize, { passive: true });
    }
    resize();
    return () => {
      disposed = true;
      scene.clearEffects();
      loop.dispose();
      resizeObserver.disconnect();
      intersection?.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
      window.removeEventListener("resize", resize);
    };
  }, [paused]);

  return (
    <>
      <div className="dns-network" aria-hidden="true">
        <canvas ref={canvasRef} />
      </div>
      <button
        className="scene-motion-control"
        type="button"
        aria-label={
          paused ? "Resume network animation" : "Pause network animation"
        }
        aria-pressed={!paused}
        disabled={!ready}
        onClick={toggle}
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
        <span>{paused ? "Resume motion" : "Pause motion"}</span>
      </button>
    </>
  );
}
