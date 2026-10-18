export const DNS_SCENE = {
  fps: 45,
  mobileFps: 30,
  maxDpr: 2,
  maxPixels: 5_000_000,
  mobileWidth: 700,
  idleAfter: 5,
  pointerRadius: 190,
  pulseRadius: 235,
  pulseLifetime: 2.6,
  maxPulses: 6,
  maxSparks: 72,
  maxTrails: 16,
  sparkLifetime: 1.45,
  trailLifetime: 0.65,
  nodeDrift: 10,
  packetSpeed: 0.025,
  driftSpeed: 0.16,
  orbitSpeed: 0.09,
  nodes: { mobile: 35, desktop: 76, wide: 112 },
  spring: 32,
  damping: 9,
  palettes: {
    dark: {
      ink: "168,185,208",
      accent: "0,232,120",
      paper: "12,13,16",
      line: 0.2,
      point: 0.65,
    },
    light: {
      ink: "64,83,111",
      accent: "0,125,70",
      paper: "246,246,248",
      line: 0.24,
      point: 0.62,
    },
  },
} as const;

export type ScenePalette =
  (typeof DNS_SCENE.palettes)[keyof typeof DNS_SCENE.palettes];
export type Area = { x: number; y: number; width: number; height: number };
type Node = {
  u: number;
  v: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  phase: number;
  depth: number;
};
type Pulse = {
  x: number;
  y: number;
  age: number;
  strength: number;
  kind: number;
};
type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  kind: number;
};
type Trail = { x: number; y: number; age: number };
const clamp = (value: number, low = 0, high = 1) =>
  Math.max(low, Math.min(high, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const hash = (value: number) => {
  const n = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export function backingSize(width: number, height: number, deviceDpr: number) {
  const dpr = Math.min(
    Math.max(1, deviceDpr),
    DNS_SCENE.maxDpr,
    Math.sqrt(DNS_SCENE.maxPixels / Math.max(1, width * height)),
  );
  return {
    width: Math.max(1, Math.floor(width * dpr)),
    height: Math.max(1, Math.floor(height * dpr)),
    dpr,
  };
}

export function isSceneTap(
  start: { x: number; y: number; time: number },
  end: { x: number; y: number; time: number },
) {
  return (
    end.time >= start.time &&
    end.time - start.time < 500 &&
    Math.hypot(end.x - start.x, end.y - start.y) < 9
  );
}

export class DnsScene {
  width = 1;
  height = 1;
  unit = 1;
  time = 0;
  motionTime = 0;
  idle = 1;
  activity = 0;
  nodes: Node[] = [];
  pulses: Pulse[] = [];
  sparks: Spark[] = [];
  trails: Trail[] = [];
  pointer = { x: -1000, y: -1000, active: false, energy: 0 };
  private sequence = 0;
  private lastActivity = -10;
  private lastTrail = -1;

  constructor(width: number, height: number) {
    this.resize(width, height);
  }

  resize(width: number, height: number) {
    const scaleX = width / this.width,
      scaleY = height / this.height;
    for (const effect of [...this.pulses, ...this.sparks, ...this.trails]) {
      effect.x *= scaleX;
      effect.y *= scaleY;
    }
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.unit = clamp(width / 1440, 0.68, 2.4);
    const count =
      width < DNS_SCENE.mobileWidth
        ? DNS_SCENE.nodes.mobile
        : width > 2300
          ? DNS_SCENE.nodes.wide
          : DNS_SCENE.nodes.desktop;
    if (this.nodes.length !== count) {
      const columns = width < DNS_SCENE.mobileWidth ? 5 : 12;
      const rows = Math.ceil(count / columns);
      this.nodes = Array.from({ length: count }, (_, i) => ({
        u: ((i % columns) + 0.25 + hash(i + 1) * 0.5) / columns,
        v: (Math.floor(i / columns) + 0.2 + hash(i + 73) * 0.6) / rows,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        phase: hash(i + 29) * Math.PI * 2,
        depth: 0.35 + hash(i + 47) * 0.65,
      }));
    }
    this.pointer.active = false;
    this.step(0);
  }

  move(x: number, y: number) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.active = true;
    this.lastActivity = this.time;
    if (this.time - this.lastTrail > 0.045) {
      this.trails.push({ x, y, age: 0 });
      if (this.trails.length > DNS_SCENE.maxTrails) this.trails.shift();
      this.lastTrail = this.time;
    }
  }

  leave() {
    this.pointer.active = false;
  }

  burst(x: number, y: number) {
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 0 ||
      x > this.width ||
      y < 0 ||
      y > this.height
    )
      return;
    this.lastActivity = this.time;
    const recent = this.pulses.find(
      (p) => p.age < 0.18 && Math.hypot(p.x - x, p.y - y) < 45 * this.unit,
    );
    if (recent) {
      recent.strength = Math.min(1.65, recent.strength + 0.15);
      return;
    }
    const kind = this.sequence++ % 3;
    this.pulses.push({ x, y, age: 0, strength: 1, kind });
    if (this.pulses.length > DNS_SCENE.maxPulses) this.pulses.shift();
    const count = this.width < DNS_SCENE.mobileWidth ? 6 : 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + kind * 0.3;
      const speed = (34 + hash(i + this.sequence) * 45) * this.unit;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        kind,
      });
    }
    this.sparks = this.sparks.slice(-DNS_SCENE.maxSparks);
  }

  clearEffects() {
    this.pulses = [];
    this.sparks = [];
    this.trails = [];
    this.pointer.active = false;
    this.pointer.energy = 0;
    for (const node of this.nodes) {
      node.dx = node.dy = node.vx = node.vy = 0;
    }
  }

  step(elapsed: number) {
    const dt = clamp(elapsed, 0, 0.065);
    this.time += dt;
    const alive = this.time - this.lastActivity < DNS_SCENE.idleAfter;
    this.activity +=
      ((alive ? 1 : 0) - this.activity) * (1 - Math.exp(-dt * 1.5));
    this.idle = 0.35 + this.activity * 0.65;
    this.motionTime += dt * this.idle;
    this.pointer.energy +=
      ((this.pointer.active ? 1 : 0) - this.pointer.energy) *
      (1 - Math.exp(-dt * 5));
    const radius = DNS_SCENE.pointerRadius * this.unit;
    for (const node of this.nodes) {
      const baseX =
        node.u * this.width +
        Math.sin(this.motionTime * DNS_SCENE.driftSpeed + node.phase) *
          DNS_SCENE.nodeDrift *
          this.unit *
          node.depth;
      const baseY =
        node.v * this.height +
        Math.cos(this.motionTime * DNS_SCENE.driftSpeed * 0.75 + node.phase) *
          DNS_SCENE.nodeDrift *
          this.unit *
          node.depth;
      const px = baseX - this.pointer.x,
        py = baseY - this.pointer.y;
      const distance = Math.hypot(px, py);
      const influence = smooth(1 - distance / radius) * this.pointer.energy;
      let tx = (px / Math.max(1, distance)) * influence * 25 * this.unit;
      let ty = (py / Math.max(1, distance)) * influence * 25 * this.unit;
      for (const pulse of this.pulses) {
        const dx = baseX - pulse.x,
          dy = baseY - pulse.y,
          d = Math.hypot(dx, dy);
        const wave =
          DNS_SCENE.pulseRadius * this.unit * (1 - Math.exp(-pulse.age * 1.5));
        const force =
          Math.exp(-Math.pow((d - wave) / (28 * this.unit), 2)) *
          Math.pow(1 - pulse.age / DNS_SCENE.pulseLifetime, 2) *
          pulse.strength;
        tx += (dx / Math.max(1, d)) * force * 19 * this.unit;
        ty += (dy / Math.max(1, d)) * force * 19 * this.unit;
      }
      node.vx =
        (node.vx + (tx - node.dx) * DNS_SCENE.spring * dt) *
        Math.exp(-DNS_SCENE.damping * dt);
      node.vy =
        (node.vy + (ty - node.dy) * DNS_SCENE.spring * dt) *
        Math.exp(-DNS_SCENE.damping * dt);
      node.dx += node.vx * dt;
      node.dy += node.vy * dt;
      node.x = baseX + node.dx;
      node.y = baseY + node.dy;
    }
    for (const pulse of this.pulses) pulse.age += dt;
    for (const trail of this.trails) trail.age += dt;
    for (const spark of this.sparks) {
      spark.age += dt;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= Math.exp(-dt * 2.2);
      spark.vy *= Math.exp(-dt * 2.2);
    }
    this.pulses = this.pulses.filter((p) => p.age < DNS_SCENE.pulseLifetime);
    this.sparks = this.sparks.filter((p) => p.age < DNS_SCENE.sparkLifetime);
    this.trails = this.trails.filter((p) => p.age < DNS_SCENE.trailLifetime);
  }
}

export function drawDnsScene(
  ctx: CanvasRenderingContext2D,
  scene: DnsScene,
  palette: ScenePalette,
  protectedArea: Area | null,
  staticFrame = false,
) {
  const { width: w, height: h, unit: u, motionTime: time } = scene;
  const mobile = w < DNS_SCENE.mobileWidth;
  ctx.clearRect(0, 0, w, h);
  const rgba = (rgb: string, alpha: number) => `rgba(${rgb},${clamp(alpha)})`;
  const opacityAt = (x: number, y: number) => {
    const edge = smooth(Math.min(x, w - x, y, h - y) / (55 * u));
    if (!protectedArea) return edge;
    const a = protectedArea;
    const outside = Math.max(
      a.x - x,
      x - a.x - a.width,
      a.y - y,
      y - a.y - a.height,
    );
    return edge * (0.09 + 0.91 * smooth(outside / (65 * u)));
  };
  const coreX = w * (mobile ? 0.6 : 0.78),
    coreY = h * (mobile ? 0.77 : 0.46);
  const coreR = Math.min(w * (mobile ? 0.2 : 0.12), h * 0.23);
  const glow = ctx.createRadialGradient(
    coreX,
    coreY,
    0,
    coreX,
    coreY,
    coreR * 2.6,
  );
  glow.addColorStop(0, rgba(palette.ink, 0.07));
  glow.addColorStop(1, rgba(palette.ink, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Query lanes cross the entire canvas; packets travel toward the resolver.
  for (let lane = 0; lane < 5; lane++) {
    const sy = h * (0.1 + lane * 0.185);
    const ey = h * (0.85 - lane * 0.15);
    const startX = -20,
      endX = w + 20;
    const c1x = w * 0.42,
      c1y = sy - 45 * u,
      c2x = w * 0.62,
      c2y = ey + 80 * u;
    const at = (t: number) => ({
      x:
        (1 - t) ** 3 * startX +
        3 * (1 - t) ** 2 * t * c1x +
        3 * (1 - t) * t * t * c2x +
        t ** 3 * endX,
      y:
        (1 - t) ** 3 * sy +
        3 * (1 - t) ** 2 * t * c1y +
        3 * (1 - t) * t * t * c2y +
        t ** 3 * ey,
    });
    ctx.lineWidth = 0.7 * u;
    for (let segment = 0; segment < 36; segment++) {
      const a = at(segment / 36),
        b = at((segment + 1) / 36);
      ctx.strokeStyle = rgba(palette.ink, 0.14 * opacityAt(a.x, a.y));
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    const progress = (time * DNS_SCENE.packetSpeed + lane * 0.19) % 1;
    const packet = at(progress);
    const next = at(Math.min(1, progress + 0.012));
    ctx.strokeStyle = rgba(
      lane % 3 === 0 ? palette.accent : palette.ink,
      0.85 * opacityAt(packet.x, packet.y),
    );
    ctx.lineWidth = 2 * u;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(packet.x, packet.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
  }

  // A bounded, depth-aware topology rather than an all-to-all particle mesh.
  const reach = (mobile ? 115 : 160) * u;
  for (let i = 0; i < scene.nodes.length; i++) {
    const a = scene.nodes[i];
    let links = 0;
    for (let j = i + 1; j < scene.nodes.length && links < 2; j++) {
      const b = scene.nodes[j],
        distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance > reach) continue;
      links++;
      const alpha =
        (1 - distance / reach) *
        palette.line *
        opacityAt((a.x + b.x) / 2, (a.y + b.y) / 2);
      ctx.strokeStyle = rgba(palette.ink, alpha);
      ctx.lineWidth = 0.7 * u;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    const alpha = opacityAt(a.x, a.y) * palette.point * a.depth;
    ctx.fillStyle = rgba(i % 13 === 0 ? palette.accent : palette.ink, alpha);
    ctx.beginPath();
    ctx.arc(a.x, a.y, (i % 13 === 0 ? 2.1 : 1.2) * u * a.depth, 0, Math.PI * 2);
    ctx.fill();
    if (i % 9 === 0) {
      ctx.strokeStyle = rgba(palette.ink, alpha * 0.4);
      ctx.lineWidth = 0.7 * u;
      ctx.strokeRect(a.x - 4 * u, a.y - 4 * u, 8 * u, 8 * u);
    }
    const distance = Math.hypot(a.x - scene.pointer.x, a.y - scene.pointer.y);
    if (
      distance < DNS_SCENE.pointerRadius * u &&
      scene.pointer.energy > 0.01 &&
      !staticFrame
    ) {
      ctx.strokeStyle = rgba(
        palette.ink,
        smooth(1 - distance / (DNS_SCENE.pointerRadius * u)) *
          0.35 *
          scene.pointer.energy *
          opacityAt(a.x, a.y),
      );
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(scene.pointer.x, scene.pointer.y);
      ctx.stroke();
    }
  }

  // Root, TLD, zone and cache orbit a stable local resolver.
  const labels = ["ROOT", "TLD", "YOUR ZONE", "CACHE"];
  const rotor = Math.sin(time * DNS_SCENE.orbitSpeed) * 0.07;
  ctx.save();
  ctx.translate(coreX, coreY);
  ctx.rotate(-0.18);
  for (let orbit = 0; orbit < 3; orbit++) {
    ctx.strokeStyle = rgba(palette.ink, orbit === 1 ? 0.26 : 0.12);
    ctx.lineWidth = u * 0.8;
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      coreR * (1 + orbit * 0.23),
      coreR * (0.52 + orbit * 0.15),
      rotor + orbit * 0.7,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI * 0.5 - 0.7 + rotor;
    const x = coreX + Math.cos(angle) * coreR * 1.2;
    const y = coreY + Math.sin(angle) * coreR * 0.9;
    ctx.strokeStyle = rgba(palette.ink, 0.2);
    ctx.lineWidth = 0.8 * u;
    ctx.beginPath();
    ctx.moveTo(coreX, coreY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.fillStyle = rgba(palette.paper, 0.9);
    ctx.strokeStyle = rgba(palette.ink, 0.4);
    ctx.beginPath();
    ctx.roundRect(x - 7 * u, y - 7 * u, 14 * u, 14 * u, 3 * u);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = rgba(palette.ink, 0.7);
    ctx.font = `${9 * u}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(labels[i], x, y + 23 * u);
  }
  const coreGlow = ctx.createRadialGradient(
    coreX,
    coreY,
    2,
    coreX,
    coreY,
    33 * u,
  );
  coreGlow.addColorStop(0, rgba(palette.accent, 0.12));
  coreGlow.addColorStop(1, rgba(palette.accent, 0));
  ctx.fillStyle = coreGlow;
  ctx.fillRect(coreX - 33 * u, coreY - 33 * u, 66 * u, 66 * u);
  ctx.fillStyle = rgba(palette.paper, 0.95);
  ctx.strokeStyle = rgba(palette.ink, 0.55);
  ctx.lineWidth = u;
  ctx.beginPath();
  ctx.roundRect(coreX - 23 * u, coreY - 23 * u, 46 * u, 46 * u, 11 * u);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = rgba(palette.ink, 0.9);
  ctx.lineWidth = 1.6 * u;
  ctx.beginPath();
  ctx.moveTo(coreX - 7 * u, coreY - 4 * u);
  ctx.lineTo(coreX - 2 * u, coreY);
  ctx.lineTo(coreX - 7 * u, coreY + 4 * u);
  ctx.moveTo(coreX + 2 * u, coreY + 6 * u);
  ctx.lineTo(coreX + 8 * u, coreY + 6 * u);
  ctx.stroke();
  ctx.fillStyle = rgba(palette.ink, 0.8);
  ctx.font = `${10 * u}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("NOTHINGDNS", coreX, coreY + 43 * u);

  if (staticFrame) return;
  for (const trail of scene.trails) {
    const life = 1 - trail.age / DNS_SCENE.trailLifetime;
    ctx.strokeStyle = rgba(
      palette.ink,
      life * 0.17 * opacityAt(trail.x, trail.y),
    );
    ctx.lineWidth = u * life;
    ctx.beginPath();
    ctx.arc(trail.x, trail.y, (3 + trail.age * 22) * u, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const pulse of scene.pulses) {
    const age = pulse.age / DNS_SCENE.pulseLifetime;
    const radius = DNS_SCENE.pulseRadius * u * (1 - Math.exp(-pulse.age * 1.5));
    const alpha =
      Math.pow(1 - age, 2) * smooth(pulse.age / 0.08) * pulse.strength;
    const rgb = pulse.kind === 2 ? palette.accent : palette.ink;
    ctx.strokeStyle = rgba(rgb, alpha * 0.72);
    ctx.lineWidth = (1.2 - age * 0.7) * u;
    for (let arc = 0; arc < (pulse.kind === 2 ? 3 : 1); arc++) {
      ctx.beginPath();
      ctx.arc(
        pulse.x,
        pulse.y,
        radius,
        (arc * Math.PI * 2) / 3,
        pulse.kind === 2 ? (arc * Math.PI * 2) / 3 + 1.55 : Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.strokeStyle = rgba(rgb, alpha * 0.24);
    ctx.beginPath();
    ctx.arc(
      pulse.x,
      pulse.y,
      radius * (pulse.kind === 1 ? 0.77 : 0.9),
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.fillStyle = rgba(rgb, alpha * 0.9);
    ctx.font = `${10 * u}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(
      ["QUERY →", "← ANSWER", "DNSSEC ✓"][pulse.kind],
      pulse.x + 11 * u,
      pulse.y - 12 * u,
    );
  }
  for (const spark of scene.sparks) {
    const life = 1 - spark.age / DNS_SCENE.sparkLifetime;
    ctx.fillStyle = rgba(
      spark.kind === 2 ? palette.accent : palette.ink,
      life * 0.7 * opacityAt(spark.x, spark.y),
    );
    ctx.fillRect(spark.x, spark.y, 4 * u * life, 1.5 * u * life);
  }
}
