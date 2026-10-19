import test from "node:test";
import assert from "node:assert/strict";
import { AMBIENT_FIELD, AmbientField } from "../src/lib/ambient-field.ts";

const advance = (scene, seconds, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) scene.step(1 / hz);
};

test("clearing mouse reactions preserves the ambient timeline and drifting geometry", () => {
  const scene = new AmbientField(1440, 900);
  scene.move(400, 300);
  scene.burst(400, 300);
  advance(scene, 0.4);
  const time = scene.time;
  const positions = scene.nodes.map(({ x, y, angle }) => ({ x, y, angle }));
  scene.clearEffects();
  assert.equal(scene.time, time);
  advance(scene, 0.5);
  assert.ok(scene.time > time);
  assert.ok(
    scene.nodes.some(
      (node, i) =>
        node.visible &&
        (node.x !== positions[i].x ||
          node.y !== positions[i].y ||
          node.angle !== positions[i].angle),
    ),
  );
  assert.equal(scene.pointer.energy, 0);
  assert.equal(
    scene.waves.length +
      scene.particles.length +
      scene.trails.length +
      scene.relays.length,
    0,
  );
  assert.ok(scene.nodes.every((node) => node.activation === 0));
});

test("rapid clicks have a fixed budget and expire without extending repeated waves", () => {
  const scene = new AmbientField(1440, 900);
  scene.burst(100, 100);
  advance(scene, 0.1);
  scene.burst(101, 101);
  assert.equal(scene.waves.length, 1);
  assert.ok(scene.waves[0].age > 0);
  for (let i = 0; i < 300; i++) {
    scene.burst(50 + ((i * 137) % 1300), 50 + ((i * 83) % 800));
    scene.step(1 / 60);
    assert.ok(scene.waves.length <= AMBIENT_FIELD.maxWaves);
    assert.ok(scene.particles.length <= AMBIENT_FIELD.maxParticles);
  }
  advance(scene, 3);
  assert.equal(scene.waves.length, 0);
  assert.equal(scene.particles.length, 0);
});

test("pointer influence stays local, bounded, and returns gently to rest", () => {
  const scene = new AmbientField(1440, 900);
  const near = scene.nodes.find((n) => n.visible);
  const far = scene.nodes.find(
    (n) => n.visible && Math.hypot(n.x - near.x, n.y - near.y) > 500,
  );
  for (let i = 0; i < 60; i++) {
    scene.move(near.x + 35, near.y + 10);
    scene.step(1 / 60);
  }
  assert.ok(Math.hypot(near.dx, near.dy) > 0.5);
  assert.ok(Math.hypot(near.dx, near.dy) < 130);
  assert.equal(far.dx, 0);
  assert.equal(far.dy, 0);
  scene.leave();
  advance(scene, 4);
  assert.ok(Math.hypot(near.dx, near.dy) < 0.01);
});

test("a stationary pointer fades without needing another pointer event", () => {
  const scene = new AmbientField(1440, 900);
  const near = scene.nodes.find((n) => n.visible);
  scene.move(near.x + 25, near.y);
  advance(scene, 6);
  assert.ok(scene.pointer.energy < 0.0001);
  assert.ok(Math.hypot(near.dx, near.dy) < 0.01);
});

test("scrolling moves the field at different depths and pauses offscreen objects", () => {
  const scene = new AmbientField(1440, 900);
  const previous = scene.nodes.map((n) => ({ y: n.y, visible: n.visible }));
  scene.setScroll(400, true);
  scene.step(0);
  for (const [index, node] of scene.nodes.entries()) {
    const delta = previous[index].y - node.y;
    if (Math.abs(delta) < 200)
      assert.ok(Math.abs(delta - 400 * node.depth * 0.16) < 0.001);
  }
  const outside = scene.nodes.find((n) => !n.visible);
  assert.ok(outside, "the field includes culled objects outside the viewport");
  const clock = outside.clock,
    angle = outside.angle;
  advance(scene, 1);
  assert.equal(outside.clock, clock);
  assert.equal(outside.angle, angle);
  assert.ok(scene.nodes.some((n) => n.visible && n.clock > 0));
});

test("mobile reduces density; 4K remains bounded; resize clears stale effects", () => {
  const scene = new AmbientField(390, 844);
  assert.equal(scene.nodes.length, 12);
  scene.burst(100, 100);
  scene.resize(1440, 900);
  assert.equal(scene.nodes.length, 32);
  assert.equal(scene.waves.length + scene.particles.length, 0);
  scene.resize(3840, 2160);
  assert.equal(scene.nodes.length, AMBIENT_FIELD.maxNodes);
  assert.ok(scene.nodes.every((n) => Number.isFinite(n.x + n.y + n.size)));
  scene.resize(0, NaN);
  assert.ok(scene.width > 0 && scene.height > 0);
});

test("invalid or out-of-viewport input never creates effects", () => {
  const scene = new AmbientField(390, 844);
  for (const point of [
    [-1, 10],
    [391, 10],
    [10, 845],
    [NaN, 10],
    [10, Infinity],
  ])
    scene.burst(...point);
  assert.equal(scene.waves.length + scene.particles.length, 0);
  scene.move(NaN, 0);
  assert.equal(scene.pointer.energy, 0);
  scene.setScroll(Infinity);
  assert.equal(scene.targetScroll, 0);
});

test("seeded geometry is deterministic and motion follows elapsed time", () => {
  const a = new AmbientField(1440, 900),
    b = new AmbientField(1440, 900);
  assert.deepEqual(a.nodes, b.nodes);
  advance(a, 2, 60);
  advance(b, 2, 120);
  a.nodes.forEach((node, i) => {
    assert.ok(Math.hypot(node.x - b.nodes[i].x, node.y - b.nodes[i].y) < 0.1);
    assert.ok(Math.abs(node.angle - b.nodes[i].angle) < 0.01);
  });
  a.burst(100, 100);
  a.move(100, 120);
  a.clearEffects();
  assert.equal(a.waves.length + a.particles.length + a.pointer.energy, 0);
});

test("scroll preserves the last viewport pointer position and its influence", () => {
  const scene = new AmbientField(1440, 900);
  scene.move(420, 330);
  scene.setScroll(1200);
  assert.deepEqual(scene.pointer, { x: 420, y: 330, energy: 1 });
  scene.burst(420, 330);
  assert.equal(scene.waves[0].x, scene.pointer.x);
  assert.equal(scene.waves[0].y, scene.pointer.y);
});

test("near objects react visibly while distant objects remain undisturbed", () => {
  const scene = new AmbientField(1440, 900);
  const near = scene.nodes.find((n) => n.visible && n.depth === 1);
  const far = scene.nodes.find(
    (n) => n.visible && Math.hypot(n.x - near.x, n.y - near.y) > 600,
  );
  for (let i = 0; i < 60; i++) {
    scene.move(near.x + 40, near.y);
    scene.step(1 / 60);
  }
  assert.ok(
    Math.hypot(near.dx, near.dy) > 25,
    "nearby geometry should visibly bend around the cursor",
  );
  assert.ok(Math.hypot(near.dx, near.dy) < 130);
  assert.equal(far.dx, 0);
  assert.equal(far.dy, 0);
});

test("light trails stay bounded and all reactions expire after a slow frame", () => {
  const scene = new AmbientField(1440, 900);
  for (let i = 0; i < 500; i++) scene.move((i * 3) % 1400, (i * 11) % 850);
  assert.equal(scene.trails.length, AMBIENT_FIELD.maxTrails);
  scene.burst(400, 300);
  scene.step(4);
  assert.equal(
    scene.waves.length + scene.particles.length + scene.trails.length,
    0,
  );
  assert.ok(scene.pointer.energy < 0.001);
  assert.ok(scene.nodes.every((n) => Number.isFinite(n.dx + n.dy)));
});

test("a click sends a strong, local wave through nearby geometry then settles", () => {
  const scene = new AmbientField(1440, 900);
  const node = scene.nodes.find((n) => n.visible && n.depth === 1 && n.x > 100);
  scene.burst(node.x - 80, node.y);
  advance(scene, 0.7);
  assert.ok(Math.hypot(node.dx, node.dy) > 8);
  assert.ok(node.activation > 0.01);
  advance(scene, 6);
  assert.ok(Math.hypot(node.dx, node.dy) < 0.01);
  assert.ok(node.activation < 0.001);
});

test("fresh input during a slow frame is aged from its own event time", () => {
  const scene = new AmbientField(1440, 900);
  scene.burst(400, 300, 2.95);
  scene.move(400, 300, 2.95);
  scene.step(3);
  assert.equal(scene.waves.length, 1);
  assert.ok(Math.abs(scene.waves[0].age - 0.05) < 0.001);
  assert.ok(scene.pointer.energy > 0.9);
  assert.equal(scene.trails.length, 1);
  advance(scene, 3);
  assert.equal(
    scene.waves.length + scene.particles.length + scene.trails.length,
    0,
  );
});

test("nearby objects circulate fluidly around the pointer rather than only pushing away", () => {
  const scene = new AmbientField(1440, 900);
  const node = scene.nodes.find(
    (n, i) => n.visible && n.depth === 1 && i % 7 !== 0,
  );
  const center = { x: node.x - 85, y: node.y };
  for (let i = 0; i < 180; i++) {
    scene.move(center.x, center.y);
    scene.step(1 / 60);
  }
  const sweptAngle = Math.atan2(
    node.y + node.dy - center.y,
    node.x + node.dx - center.x,
  );
  assert.ok(sweptAngle > 0.35, `expected an orbital sweep, got ${sweptAngle}`);
  scene.leave();
  advance(scene, 5);
  assert.ok(Math.hypot(node.dx, node.dy) < 0.01);
});

test("clicks schedule delayed, attenuated reactions between nearby objects", () => {
  const scene = new AmbientField(1440, 900);
  const source = scene.nodes.find((n) => n.visible && n.x > 100);
  scene.burst(source.x, source.y);
  assert.ok(
    Array.isArray(scene.relays) && scene.relays.some((r) => r.hop > 0),
    "a click should create a bounded neighbor cascade",
  );
  const child = scene.relays.find((r) => r.hop === 1);
  const parent = scene.relays.find((r) => r.to === child.from);
  assert.equal(child.startAt, parent.arriveAt);
  assert.ok(child.arriveAt > child.startAt);
  assert.ok(child.energy < parent.energy);
  advance(scene, 0.06);
  assert.ok(scene.nodes[parent.to].resonance > 0);
  assert.equal(scene.nodes[child.to].resonance, 0);
  advance(scene, child.arriveAt - scene.time + 0.05);
  assert.ok(scene.nodes[child.to].resonance > 0.05);
  advance(scene, 4);
  assert.equal(scene.relays.length, 0);
  assert.ok(scene.nodes.every((n) => n.resonance < 0.001));
});

test("repeated clicks cannot amplify or grow a cascade without bounds", () => {
  for (const width of [390, 1440, 3840]) {
    const scene = new AmbientField(width, 900);
    const limit = width < 700 ? 8 : AMBIENT_FIELD.maxRelays;
    for (let i = 0; i < 180; i++) {
      scene.burst(40 + ((i * 137) % (width - 80)), 40 + ((i * 83) % 800));
      scene.step(1 / 60);
      assert.ok(scene.relays.length <= limit);
      assert.ok(scene.relays.every((r) => r.energy <= 0.82 && r.hop <= 2));
      assert.equal(
        new Set(scene.relays.map((r) => `${r.seed}:${r.to}`)).size,
        scene.relays.length,
      );
      assert.ok(
        scene.nodes.every(
          (n) =>
            Math.hypot(n.dx, n.dy) <=
            AMBIENT_FIELD.maxDisplacement * scene.unit + 0.001,
        ),
      );
    }
    advance(scene, 3);
    assert.equal(scene.relays.length, 0);
    scene.burst(width / 2, 450);
    scene.clearEffects();
    assert.equal(scene.relays.length, 0);
    assert.ok(
      scene.nodes.every((n) => n.resonance === 0 && n.orbitPhase === 0),
    );
  }
});
