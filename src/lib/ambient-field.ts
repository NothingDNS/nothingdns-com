/** Small, deterministic SVG field. All distances are CSS pixels. */
export const AMBIENT_FIELD = {
  maxNodes: 48,
  maxWaves: 4,
  maxParticles: 32,
  maxTrails: 20,
  trailLifetime: 0.85,
  waveLifetime: 2.1,
  particleLifetime: 1.25,
  pointerRadius: 320,
  pointerForce: 112,
  waveRadius: 350,
  maxRelays: 18,
  relayReach: 320,
  relayLifetime: 0.75,
  relayWindow: 1.8,
  maxDisplacement: 124,
  mobileWidth: 700,
} as const;

export const BACKGROUND_CONTROL_SELECTOR =
  "a,button,input,select,textarea,label,summary,dialog,header,[role='button'],[role='link'],[role='dialog'],[role='menu'],[role='slider'],[role='tab'],[contenteditable]:not([contenteditable='false']),[data-no-scene]";

const noise = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const wrap = (n: number, length: number) => ((n % length) + length) % length;

export type FieldNode = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  clock: number;
  depth: number;
  size: number;
  angle: number;
  activation: number;
  orbitPhase: number;
  resonance: number;
  visible: boolean;
};
export type FieldWave = {
  x: number;
  y: number;
  age: number;
  bornAt: number;
  seed: number;
};
export type FieldParticle = FieldWave & { angle: number; speed: number };
export type FieldTrail = { x: number; y: number; age: number; bornAt: number };
export type FieldRelay = {
  from: number;
  to: number;
  originX: number;
  originY: number;
  startAt: number;
  arriveAt: number;
  energy: number;
  hop: number;
  seed: number;
  triggered: boolean;
};

export class AmbientField {
  width = 1;
  height = 1;
  unit = 1;
  scroll = 0;
  targetScroll = 0;
  time = 0;
  nodes: FieldNode[] = [];
  waves: FieldWave[] = [];
  particles: FieldParticle[] = [];
  trails: FieldTrail[] = [];
  relays: FieldRelay[] = [];
  pointer = { x: -9999, y: -9999, energy: 0 };
  private serial = 0;
  private pointerBornAt = -Infinity;
  private flow = { x: -9999, y: -9999 };

  constructor(width: number, height: number) {
    this.resize(width, height);
  }

  resize(width: number, height: number) {
    this.width = Number.isFinite(width) ? Math.max(1, width) : 1;
    this.height = Number.isFinite(height) ? Math.max(1, height) : 1;
    this.unit = Math.min(2, Math.max(0.8, this.width / 1440));
    const count = this.width < 700 ? 12 : this.width >= 2200 ? 48 : 32;
    this.nodes = Array.from({ length: count }, (_, i) => ({
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
      clock: 0,
      depth: [0.3, 0.65, 1][i % 3],
      size: (13 + noise(i + 3) * 20) * this.unit,
      angle: noise(i + 8) * 180,
      activation: 0,
      orbitPhase: 0,
      resonance: 0,
      visible: false,
    }));
    this.clearEffects();
    this.step(0);
  }

  move(x: number, y: number, at = this.time) {
    if (!Number.isFinite(x + y)) return;
    if (
      this.pointer.energy < 0.008 ||
      Math.hypot(x - this.flow.x, y - this.flow.y) >
        AMBIENT_FIELD.pointerRadius * this.unit * 2
    )
      this.flow = { x, y };
    this.pointer = { x, y, energy: 1 };
    const bornAt = Number.isFinite(at) ? Math.max(this.time, at) : this.time;
    this.pointerBornAt = bornAt;
    const last = this.trails.at(-1);
    if (!last || Math.hypot(last.x - x, last.y - y) > 9 * this.unit) {
      const limit =
        this.width < AMBIENT_FIELD.mobileWidth ? 10 : AMBIENT_FIELD.maxTrails;
      if (this.trails.length >= limit) this.trails.shift();
      this.trails.push({ x, y, age: 0, bornAt });
    }
  }

  leave() {
    this.pointer.energy = 0;
    this.pointerBornAt = -Infinity;
  }

  setScroll(y: number, immediate = false) {
    if (!Number.isFinite(y)) return;
    this.targetScroll = Math.max(0, y);
    if (immediate) this.scroll = this.targetScroll;
  }

  burst(x: number, y: number, at = this.time) {
    if (
      !Number.isFinite(x + y) ||
      x < 0 ||
      y < 0 ||
      x > this.width ||
      y > this.height
    )
      return;
    const bornAt = Number.isFinite(at) ? Math.max(this.time, at) : this.time;
    // A rapid repeat reuses the existing wave; it never extends its lifetime.
    if (
      this.waves.some(
        (w) =>
          bornAt - w.bornAt < 0.2 &&
          Math.hypot(w.x - x, w.y - y) < 48 * this.unit,
      )
    )
      return;
    const seed = ++this.serial;
    if (this.waves.length === AMBIENT_FIELD.maxWaves) this.waves.shift();
    this.waves.push({ x, y, age: 0, bornAt, seed });
    this.scheduleCascade(x, y, bornAt, seed);
    for (let i = 0; i < 8; i++) {
      if (this.particles.length === AMBIENT_FIELD.maxParticles)
        this.particles.shift();
      this.particles.push({
        x,
        y,
        age: 0,
        bornAt,
        seed,
        angle: (Math.PI * 2 * i) / 8 + noise(seed) * 0.6,
        speed: (75 + noise(i + seed) * 85) * this.unit,
      });
    }
  }

  /** Plan a small neighbor tree once per click, never an all-pairs frame loop. */
  private scheduleCascade(x: number, y: number, bornAt: number, seed: number) {
    const mobile = this.width < AMBIENT_FIELD.mobileWidth;
    const budget = mobile ? 6 : 12;
    const limit = mobile ? 8 : AMBIENT_FIELD.maxRelays;
    const reach = AMBIENT_FIELD.relayReach * this.unit;
    const visited = new Set<number>();
    const pending: FieldRelay[] = [];
    const candidates = this.nodes
      .map((node, index) => ({
        node,
        index,
        distance: Math.hypot(node.x + node.dx - x, node.y + node.dy - y),
      }))
      .filter(
        (n) =>
          n.node.visible &&
          n.distance < AMBIENT_FIELD.waveRadius * this.unit * 0.82,
      )
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);
    for (const candidate of candidates) {
      visited.add(candidate.index);
      pending.push({
        from: -1,
        to: candidate.index,
        originX: x,
        originY: y,
        startAt: bornAt,
        arriveAt:
          bornAt +
          Math.max(
            0.035,
            -Math.log(
              1 - candidate.distance / (AMBIENT_FIELD.waveRadius * this.unit),
            ) / 1.6,
          ),
        energy: 0.82,
        hop: 0,
        seed,
        triggered: false,
      });
    }
    const planned: FieldRelay[] = [];
    while (pending.length && planned.length < budget) {
      pending.sort((a, b) => a.arriveAt - b.arriveAt);
      const parent = pending.shift()!;
      planned.push(parent);
      if (parent.hop >= 2 || planned.length + pending.length >= budget)
        continue;
      const source = this.nodes[parent.to];
      const neighbors = this.nodes
        .map((node, index) => ({
          node,
          index,
          distance: Math.hypot(node.x - source.x, node.y - source.y),
        }))
        .filter(
          (n) =>
            n.node.visible &&
            !visited.has(n.index) &&
            n.distance > 1 &&
            n.distance < reach,
        )
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);
      for (const next of neighbors) {
        if (planned.length + pending.length >= budget) break;
        const arriveAt =
          parent.arriveAt + 0.08 + next.distance / (520 * this.unit);
        if (arriveAt > bornAt + AMBIENT_FIELD.relayWindow) continue;
        visited.add(next.index);
        pending.push({
          from: parent.to,
          to: next.index,
          originX: x,
          originY: y,
          startAt: parent.arriveAt,
          arriveAt,
          energy: parent.energy * 0.6,
          hop: parent.hop + 1,
          seed,
          triggered: false,
        });
      }
    }
    this.relays.push(...planned);
    if (this.relays.length > limit)
      this.relays.splice(0, this.relays.length - limit);
  }

  clearEffects() {
    this.waves = [];
    this.particles = [];
    this.trails = [];
    this.relays = [];
    this.leave();
    for (const node of this.nodes)
      node.dx =
        node.dy =
        node.vx =
        node.vy =
        node.activation =
        node.orbitPhase =
        node.resonance =
          0;
  }

  step(elapsed: number) {
    const age = Math.max(0, elapsed);
    const dt = Math.min(0.065, age);
    this.time += age;
    this.scroll += (this.targetScroll - this.scroll) * (1 - Math.exp(-8 * dt));
    this.pointer.energy = Math.exp(
      -2 * Math.max(0, this.time - this.pointerBornAt),
    );
    const follow = 1 - Math.exp(-9 * dt);
    this.flow.x += (this.pointer.x - this.flow.x) * follow;
    this.flow.y += (this.pointer.y - this.flow.y) * follow;
    for (const node of this.nodes) node.resonance *= Math.exp(-4.5 * age);
    for (const relay of this.relays) {
      if (relay.triggered || this.time < relay.arriveAt) continue;
      relay.triggered = true;
      const late = this.time - relay.arriveAt;
      const target = this.nodes[relay.to];
      if (!target?.visible || late >= AMBIENT_FIELD.relayLifetime) continue;
      const source =
        relay.from >= 0
          ? this.nodes[relay.from]
          : { x: relay.originX, y: relay.originY };
      const dx = target.x - source.x,
        dy = target.y - source.y;
      const distance = Math.hypot(dx, dy);
      const energy = relay.energy * Math.exp(-4.5 * late);
      const ux = distance > 0.1 ? dx / distance : Math.cos(relay.seed),
        uy = distance > 0.1 ? dy / distance : Math.sin(relay.seed);
      target.resonance = Math.max(target.resonance, energy);
      target.vx += (ux - uy * 0.45) * energy * 48 * this.unit;
      target.vy += (uy + ux * 0.45) * energy * 48 * this.unit;
    }
    this.relays = this.relays.filter(
      (r) => this.time < r.arriveAt + AMBIENT_FIELD.relayLifetime,
    );
    this.waves = this.waves.filter(
      (w) =>
        (w.age = Math.max(0, this.time - w.bornAt)) <
        AMBIENT_FIELD.waveLifetime,
    );
    this.particles = this.particles.filter(
      (p) =>
        (p.age = Math.max(0, this.time - p.bornAt)) <
        AMBIENT_FIELD.particleLifetime,
    );
    this.trails = this.trails.filter(
      (t) =>
        (t.age = Math.max(0, this.time - t.bornAt)) <
        AMBIENT_FIELD.trailLifetime,
    );
    const columns = this.nodes.length / 4;
    const padding = 130 * this.unit;
    const period = this.height + padding * 2;
    const radius = AMBIENT_FIELD.pointerRadius * this.unit;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      const baseX =
        (((i % columns) + 0.25 + noise(i + 1) * 0.5) / columns) * this.width;
      const baseY = ((Math.floor(i / columns) + noise(i + 12)) / 4) * period;
      const x = baseX + Math.sin(node.clock * 0.12 + i) * 14 * this.unit;
      const y =
        wrap(baseY - this.scroll * node.depth * 0.16, period) -
        padding +
        Math.cos(node.clock * 0.1 + i) * 16 * this.unit;
      node.x = x;
      node.y = y;
      node.visible = y > -node.size * 2 && y < this.height + node.size * 2;
      // Offscreen objects have no running clock, spring, or SVG updates.
      if (!node.visible) continue;
      node.clock += dt;
      node.angle += dt * (i % 2 ? 0.7 : -0.5) * node.depth;
      let tx = 0,
        ty = 0;
      let activation = node.resonance;
      const px = x - this.flow.x,
        py = y - this.flow.y;
      const distance = Math.hypot(x - this.pointer.x, y - this.pointer.y);
      const direction = i % 7 === 0 ? -1 : 1;
      if (distance < radius && distance > 0.01) {
        const falloff = (1 - distance / radius) ** 2;
        const flowDistance = Math.max(1, Math.hypot(px, py));
        node.orbitPhase =
          (node.orbitPhase +
            dt *
              (0.85 + node.depth * 0.5) *
              falloff *
              this.pointer.energy *
              direction) %
          (Math.PI * 2);
        const orbitGain = falloff * this.pointer.energy * 0.85;
        const cos = Math.cos(node.orbitPhase),
          sin = Math.sin(node.orbitPhase);
        tx += (px * cos - py * sin - px) * orbitGain;
        ty += (px * sin + py * cos - py) * orbitGain;
        const force =
          falloff *
          this.pointer.energy *
          AMBIENT_FIELD.pointerForce *
          0.4 *
          this.unit *
          node.depth *
          (i % 3 ? 1 : -0.65);
        tx += (px / flowDistance) * force;
        ty += (py / flowDistance) * force;
        activation = Math.max(activation, falloff * this.pointer.energy);
        node.angle += dt * falloff * this.pointer.energy * 18 * direction;
      } else node.orbitPhase *= Math.exp(-2 * dt);
      for (const wave of this.waves) {
        const wx = x - wave.x,
          wy = y - wave.y;
        const d = Math.hypot(wx, wy);
        const reach = AMBIENT_FIELD.waveRadius * this.unit;
        if (d < reach && d > 0.01) {
          const ring = reach * (1 - Math.exp(-wave.age * 1.6));
          const force =
            Math.max(0, 1 - Math.abs(d - ring) / (105 * this.unit)) *
            (1 - wave.age / AMBIENT_FIELD.waveLifetime) *
            (1 - d / reach) *
            125 *
            this.unit *
            node.depth;
          tx += (wx / d) * force;
          ty += (wy / d) * force;
          activation = Math.max(activation, force / (95 * this.unit));
        }
      }
      node.vx += ((tx - node.dx) * 32 - node.vx * 10) * dt;
      node.vy += ((ty - node.dy) * 32 - node.vy * 10) * dt;
      node.dx += node.vx * dt;
      node.dy += node.vy * dt;
      const displacement = Math.hypot(node.dx, node.dy);
      const maxDisplacement = AMBIENT_FIELD.maxDisplacement * this.unit;
      if (displacement > maxDisplacement) {
        node.dx *= maxDisplacement / displacement;
        node.dy *= maxDisplacement / displacement;
        node.vx *= 0.5;
        node.vy *= 0.5;
      }
      node.angle += dt * node.resonance * 24;
      node.activation +=
        (Math.min(1, activation * 1.4) - node.activation) *
        (1 - Math.exp(-10 * dt));
    }
  }
}
