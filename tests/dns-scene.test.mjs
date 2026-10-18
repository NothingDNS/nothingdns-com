import test from "node:test";
import assert from "node:assert/strict";
import {
  DNS_SCENE,
  DnsScene,
  backingSize,
  isSceneTap,
} from "../src/lib/dns-scene.ts";
import { createSceneLoop, sceneCanAnimate } from "../src/lib/scene-loop.ts";

const advance = (scene, seconds, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) scene.step(1 / hz);
};

test("rapid interactions remain bounded and every temporary effect expires", () => {
  const scene = new DnsScene(1440, 760);
  for (let i = 0; i < 250; i++) {
    scene.burst(100 + ((i * 137) % 1200), 100 + ((i * 83) % 500));
    scene.move(100 + i, 200);
    scene.step(1 / 60);
    assert.ok(scene.pulses.length <= DNS_SCENE.maxPulses);
    assert.ok(scene.sparks.length <= DNS_SCENE.maxSparks);
    assert.ok(scene.trails.length <= DNS_SCENE.maxTrails);
  }
  scene.leave();
  advance(scene, 6);
  assert.equal(
    scene.pulses.length + scene.sparks.length + scene.trails.length,
    0,
  );
  assert.ok(scene.pointer.energy < 0.001);
  assert.ok(scene.idle < 0.5);
});

test("nearby rapid clicks merge; distinct pulses cycle through coherent query states", () => {
  const scene = new DnsScene(1440, 760);
  scene.burst(300, 200);
  scene.burst(301, 201);
  assert.equal(scene.pulses.length, 1);
  assert.ok(scene.pulses[0].strength > 1);
  scene.burst(600, 200);
  scene.burst(900, 200);
  assert.deepEqual(
    scene.pulses.map((pulse) => pulse.kind),
    [0, 1, 2],
  );
  for (const point of [
    [-1, 10],
    [10, -1],
    [1441, 10],
    [10, 761],
    [NaN, 10],
  ])
    scene.burst(...point);
  assert.equal(scene.pulses.length, 3);
});

test("pointer influence stays local and relaxes after leaving the hero", () => {
  const scene = new DnsScene(1440, 760);
  const near = scene.nodes[0],
    far = scene.nodes.at(-1);
  scene.move(near.x + 20, near.y);
  advance(scene, 1);
  assert.ok(Math.abs(near.dx) > 1);
  assert.equal(far.dx, 0);
  assert.equal(far.dy, 0);
  scene.leave();
  advance(scene, 4);
  assert.ok(Math.abs(near.dx) < 0.1);
  assert.ok(Math.abs(near.dy) < 0.1);
});

test("elapsed-time motion is consistent at different refresh rates", () => {
  const slow = new DnsScene(1440, 760),
    fast = new DnsScene(1440, 760);
  for (const scene of [slow, fast])
    scene.move(scene.nodes[0].x + 20, scene.nodes[0].y);
  advance(slow, 2, 60);
  advance(fast, 2, 120);
  assert.ok(Math.abs(slow.time - fast.time) < 1e-8);
  assert.ok(
    Math.hypot(
      slow.nodes[0].x - fast.nodes[0].x,
      slow.nodes[0].y - fast.nodes[0].y,
    ) < 0.5,
  );
});

test("resizing preserves pulse position and mobile scenes use fewer nodes", () => {
  const scene = new DnsScene(390, 844);
  const mobileCount = scene.nodes.length;
  scene.burst(195, 422);
  scene.resize(1560, 1688);
  assert.equal(scene.pulses[0].x, 780);
  assert.equal(scene.pulses[0].y, 844);
  assert.ok(scene.nodes.length > mobileCount);
  assert.ok(scene.nodes.length <= DNS_SCENE.nodes.wide);
});

test("canvas resolution has a pixel budget even on high-DPR 4K displays", () => {
  for (const [w, h, dpr] of [
    [390, 900, 3],
    [1920, 900, 2],
    [3840, 1700, 4],
  ]) {
    const result = backingSize(w, h, dpr);
    assert.ok(result.width * result.height <= DNS_SCENE.maxPixels);
    assert.ok(result.dpr <= DNS_SCENE.maxDpr);
    assert.ok(result.width > 0 && result.height > 0);
  }
});

test("touch scrolling and long presses cannot become click pulses", () => {
  const start = { x: 100, y: 100, time: 20 };
  assert.equal(isSceneTap(start, { x: 102, y: 102, time: 130 }), true);
  assert.equal(isSceneTap(start, { x: 102, y: 160, time: 130 }), false);
  assert.equal(isSceneTap(start, { x: 100, y: 100, time: 600 }), false);
  assert.equal(isSceneTap(start, { x: 100, y: 100, time: 19 }), false);
});

function harness() {
  const pending = new Map();
  const rendered = [];
  let serial = 0;
  const loop = createSceneLoop(
    {
      request(callback) {
        pending.set(++serial, callback);
        return serial;
      },
      cancel(id) {
        pending.delete(id);
      },
      render(dt) {
        rendered.push(dt);
      },
    },
    45,
  );
  function tick(time) {
    const [id, callback] = pending.entries().next().value;
    pending.delete(id);
    callback(time);
  }
  return { loop, pending, rendered, tick };
}

test("suspension cancels RAF and resuming discards hidden elapsed time", () => {
  const h = harness();
  assert.equal(h.pending.size, 0);
  h.loop.setActive(true);
  h.loop.setActive(true);
  assert.equal(h.pending.size, 1);
  h.tick(0);
  h.tick(30);
  h.loop.setActive(false);
  assert.equal(h.pending.size, 0);
  h.loop.setActive(true);
  h.tick(1_000_000);
  assert.equal(h.rendered.at(-1), 0);
  h.loop.dispose();
  h.loop.setActive(true);
  assert.equal(h.pending.size, 0);
});

test("offscreen, hidden, reduced-motion and user-paused states do not schedule frames", () => {
  const h = harness();
  const active = {
    visible: true,
    hidden: false,
    reduced: false,
    paused: false,
  };
  h.loop.setActive(sceneCanAnimate(active));
  for (const state of [
    { visible: false },
    { hidden: true },
    { reduced: true },
    { paused: true },
  ]) {
    h.loop.setActive(sceneCanAnimate({ ...active, ...state }));
    assert.equal(h.pending.size, 0);
    h.loop.setActive(sceneCanAnimate(active));
    assert.equal(h.pending.size, 1);
  }
  h.loop.dispose();
});

test("the frame limiter skips high-refresh frames and bounds slow frames", () => {
  const h = harness();
  h.loop.setActive(true);
  h.tick(0);
  h.tick(7);
  h.tick(14);
  assert.equal(h.rendered.length, 1);
  h.tick(23);
  assert.equal(h.rendered.length, 2);
  h.tick(10_000);
  assert.ok(h.rendered.at(-1) <= 0.065);
  h.loop.dispose();
});

test("the frame limit follows a resize from desktop to mobile", () => {
  let fps = 45,
    callback,
    serial = 0;
  const rendered = [];
  const loop = createSceneLoop(
    {
      request(next) {
        callback = next;
        return ++serial;
      },
      cancel() {},
      render(dt) {
        rendered.push(dt);
      },
    },
    () => fps,
  );
  loop.setActive(true);
  callback(0);
  callback(23);
  assert.equal(rendered.length, 2);
  fps = 30;
  callback(46);
  assert.equal(rendered.length, 2);
  callback(57);
  assert.equal(rendered.length, 3);
  loop.dispose();
});
