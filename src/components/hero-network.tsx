"use client";

import { useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import {
  backingSize,
  DNS_SCENE,
  DnsScene,
  drawDnsScene,
  isSceneTap,
  type Area,
} from "@/lib/dns-scene";
import { createSceneLoop, sceneCanAnimate } from "@/lib/scene-loop";
import { useAmbientMotion } from "./ambient-motion";

export function HeroNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controller = useRef<{ pause: (value: boolean) => void } | null>(null);
  const { paused, toggle } = useAmbientMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.closest<HTMLElement>("[data-dns-hero]");
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !hero || !ctx) return;
    const scene = new DnsScene(hero.clientWidth, hero.clientHeight);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false,
      userPaused = false,
      disposed = false;
    let protectedArea: Area | null = null;
    let palette =
      DNS_SCENE.palettes[
        document.documentElement.dataset.theme === "light" ? "light" : "dark"
      ];
    let tap: {
      x: number;
      y: number;
      time: number;
      id: number;
      blocked: boolean;
    } | null = null;
    const paint = () => {
      if (disposed) return;
      drawDnsScene(
        ctx,
        scene,
        palette,
        protectedArea,
        reduced.matches || userPaused,
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
        reduced: reduced.matches,
        paused: userPaused,
      });
      loop.setActive(active);
      if (!active) {
        scene.leave();
        tap = null;
      }
      if (visible && !document.hidden && !active) paint();
    }
    controller.current = {
      pause(value) {
        userPaused = value;
        scene.clearEffects();
        updateActivity();
      },
    };
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
    const interactive = (target: EventTarget | null) =>
      target instanceof Element &&
      Boolean(
        target.closest(
          "a,button,input,select,textarea,summary,h1,p,[role='button'],[role='dialog'],[data-no-scene]",
        ),
      );
    const coordinates = (event: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      return {
        x:
          ((event.clientX - rect.left) * scene.width) / Math.max(1, rect.width),
        y:
          ((event.clientY - rect.top) * scene.height) /
          Math.max(1, rect.height),
      };
    };
    const enabled = () =>
      visible && !document.hidden && !reduced.matches && !userPaused;
    function pointerMove(event: PointerEvent) {
      if (!enabled()) return;
      const point = coordinates(event);
      if (
        tap &&
        tap.id === event.pointerId &&
        Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 9
      )
        tap.blocked = true;
      if (event.pointerType === "mouse") scene.move(point.x, point.y);
    }
    function pointerDown(event: PointerEvent) {
      if (!enabled() || !event.isPrimary || event.button !== 0) return;
      tap = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
        id: event.pointerId,
        blocked: interactive(event.target),
      };
    }
    function pointerUp(event: PointerEvent) {
      const start = tap;
      tap = null;
      if (
        !start ||
        start.id !== event.pointerId ||
        start.blocked ||
        interactive(event.target) ||
        !enabled()
      )
        return;
      if (
        !isSceneTap(start, {
          x: event.clientX,
          y: event.clientY,
          time: event.timeStamp,
        }) ||
        window.getSelection()?.isCollapsed === false
      )
        return;
      const point = coordinates(event);
      scene.burst(point.x, point.y);
    }
    function leave() {
      scene.leave();
      tap = null;
    }
    function motionChange() {
      scene.clearEffects();
      updateActivity();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hero);
    const copy = hero.querySelector(".hero-copy");
    if (copy) resizeObserver.observe(copy);
    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        updateActivity();
      },
      { threshold: 0 },
    );
    intersection.observe(hero);
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
    hero.addEventListener("pointermove", pointerMove, { passive: true });
    hero.addEventListener("pointerdown", pointerDown, { passive: true });
    hero.addEventListener("pointerup", pointerUp, { passive: true });
    hero.addEventListener("pointerleave", leave, { passive: true });
    hero.addEventListener("pointercancel", leave, { passive: true });
    reduced.addEventListener("change", motionChange);
    document.addEventListener("visibilitychange", updateActivity);
    window.addEventListener("resize", resize, { passive: true });
    resize();
    return () => {
      disposed = true;
      controller.current = null;
      loop.dispose();
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      hero.removeEventListener("pointermove", pointerMove);
      hero.removeEventListener("pointerdown", pointerDown);
      hero.removeEventListener("pointerup", pointerUp);
      hero.removeEventListener("pointerleave", leave);
      hero.removeEventListener("pointercancel", leave);
      reduced.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", updateActivity);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    controller.current?.pause(paused);
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
        aria-pressed={paused}
        onClick={toggle}
      >
        {paused ? <Play size={13} /> : <Pause size={13} />}
        <span>{paused ? "Resume motion" : "Pause motion"}</span>
      </button>
    </>
  );
}
