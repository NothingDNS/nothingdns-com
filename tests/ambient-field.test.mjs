import test from "node:test";
import assert from "node:assert/strict";
import { AMBIENT_FIELD, AmbientField } from "../src/lib/ambient-field.ts";

const advance = (scene, seconds, hz = 60) => {
  for (let i = 0; i < seconds * hz; i++) scene.step(1 / hz);
};

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
  assert.ok(Math.hypot(near.dx, near.dy) < 25);
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
