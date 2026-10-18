/** Small, deterministic SVG field. All distances are CSS pixels. */
export const AMBIENT_FIELD = {
  maxNodes: 48,
  maxWaves: 4,
  maxParticles: 32,
  waveLifetime: 2.4,
  particleLifetime: 1.25,
  pointerRadius: 180,
  waveRadius: 210,
  mobileWidth: 700,
} as const;

export const BACKGROUND_CONTROL_SELECTOR =
  "a,button,input,select,textarea,label,summary,dialog,header,[role='button'],[role='link'],[role='dialog'],[role='menu'],[role='slider'],[role='tab'],[contenteditable]:not([contenteditable='false']),[data-no-scene],[data-dns-hero]";

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
  visible: boolean;
};
export type FieldWave = { x: number; y: number; age: number; seed: number };
export type FieldParticle = FieldWave & { angle: number; speed: number };

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
  pointer = { x: -9999, y: -9999, energy: 0 };
  private serial = 0;

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
      visible: false,
    }));
    this.clearEffects();
    this.step(0);
  }

  move(x: number, y: number) {
    if (!Number.isFinite(x + y)) return;
    this.pointer = { x, y, energy: 1 };
  }

  leave() {
    this.pointer.energy = 0;
  }

  setScroll(y: number, immediate = false) {
    if (!Number.isFinite(y)) return;
    this.targetScroll = Math.max(0, y);
    if (immediate) this.scroll = this.targetScroll;
    this.leave();
  }

  burst(x: number, y: number) {
    if (
      !Number.isFinite(x + y) ||
      x < 0 ||
      y < 0 ||
      x > this.width ||
      y > this.height
    )
      return;
    // A rapid repeat reuses the existing wave; it never extends its lifetime.
    if (
      this.waves.some(
        (w) => w.age < 0.2 && Math.hypot(w.x - x, w.y - y) < 48 * this.unit,
      )
    )
      return;
    const seed = ++this.serial;
    if (this.waves.length === AMBIENT_FIELD.maxWaves) this.waves.shift();
    this.waves.push({ x, y, age: 0, seed });
    for (let i = 0; i < 8; i++) {
      if (this.particles.length === AMBIENT_FIELD.maxParticles)
        this.particles.shift();
      this.particles.push({
        x,
        y,
        age: 0,
        seed,
        angle: (Math.PI * 2 * i) / 8 + noise(seed) * 0.6,
        speed: (35 + noise(i + seed) * 55) * this.unit,
      });
    }
  }

  clearEffects() {
    this.waves = [];
    this.particles = [];
    this.leave();
    for (const node of this.nodes) node.dx = node.dy = node.vx = node.vy = 0;
  }

  step(elapsed: number) {
    const dt = Math.min(0.065, Math.max(0, elapsed));
    this.time += dt;
    this.scroll += (this.targetScroll - this.scroll) * (1 - Math.exp(-8 * dt));
    this.pointer.energy *= Math.exp(-2 * dt);
    this.waves = this.waves.filter(
      (w) => (w.age += dt) < AMBIENT_FIELD.waveLifetime,
    );
    this.particles = this.particles.filter(
      (p) => (p.age += dt) < AMBIENT_FIELD.particleLifetime,
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
      const px = x - this.pointer.x,
        py = y - this.pointer.y;
      const distance = Math.hypot(px, py);
      if (distance < radius && distance > 0.01) {
        const falloff = (1 - distance / radius) ** 2;
        const force =
          falloff *
          this.pointer.energy *
          24 *
          this.unit *
          node.depth *
          (i % 3 ? 1 : -0.65);
        tx += (px / distance) * force;
        ty += (py / distance) * force;
      }
      for (const wave of this.waves) {
        const wx = x - wave.x,
          wy = y - wave.y;
        const d = Math.hypot(wx, wy);
        const reach = AMBIENT_FIELD.waveRadius * this.unit;
        if (d < reach && d > 0.01) {
          const ring = reach * (1 - Math.exp(-wave.age * 1.6));
          const force =
            Math.max(0, 1 - Math.abs(d - ring) / (65 * this.unit)) *
            (1 - wave.age / AMBIENT_FIELD.waveLifetime) *
            (1 - d / reach) *
            20 *
            node.depth;
          tx += (wx / d) * force;
          ty += (wy / d) * force;
        }
      }
      node.vx += ((tx - node.dx) * 32 - node.vx * 10) * dt;
      node.vy += ((ty - node.dy) * 32 - node.vy * 10) * dt;
      node.dx += node.vx * dt;
      node.dy += node.vy * dt;
    }
  }
}
