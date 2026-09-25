/* CPP v2 — sin dependencias */

/* ── Configuración de contacto ──────────────────────────────
   endpoint: URL que recibe un POST JSON (Formspree, Web3Forms, función propia).
   whatsapp: número con código de país, sin "+" ni espacios (ej. "51987654321").
   Si hay endpoint se usa; si no, se abre WhatsApp con la solicitud escrita. */
const CONFIG = {
  endpoint: '',
  whatsapp: ''
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const rand = (a, b) => a + Math.random() * (b - a);
const gauss = () => { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); };
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
};

// Ancho visible sin la barra de desplazamiento: 100vw la incluye y desborda lo que sangra al borde
const syncViewport = () => root.style.setProperty('--vw', `${root.clientWidth}px`);
syncViewport();
addEventListener('resize', syncViewport);

/* ════════════════════════════════════════════════════════════
   Idioma
   ════════════════════════════════════════════════════════════ */
const I18N = window.CPP_I18N;
const esStatic = {};
let lang = root.lang === 'en' ? 'en' : 'es';
const langListeners = [];
const onLang = (fn) => langListeners.push(fn);
const t = (key) => I18N.strings[lang][key] ?? I18N.strings.es[key] ?? key;
const pick = (obj) => obj[lang] || obj.es;

// El español estático vive en el HTML: se guarda una vez antes de traducir
$$('[data-i18n]').forEach((el) => { esStatic[el.dataset.i18n] ??= el.textContent; });
$$('[data-i18n-html]').forEach((el) => { esStatic[el.dataset.i18nHtml] ??= el.innerHTML; });
$$('[data-i18n-attr]').forEach((el) => {
  el.dataset.i18nAttr.split(';').forEach((pair) => {
    const [attr, key] = pair.split(':');
    esStatic[key] ??= el.getAttribute(attr);
  });
});
const staticText = (key) => (lang === 'en' ? I18N.en[key] : esStatic[key]) ?? esStatic[key] ?? '';

function applyLang(next) {
  lang = next;
  root.lang = lang;
  store.set('cpp-lang', lang);

  $$('[data-i18n]').forEach((el) => {
    const text = staticText(el.dataset.i18n);
    if (el.matches('[data-words]')) { splitWords(el, text); return; }
    el.textContent = text;
  });
  $$('[data-i18n-html]').forEach((el) => { el.innerHTML = staticText(el.dataset.i18nHtml); });
  $$('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr, staticText(key));
    });
  });

  document.title = t('meta.title');
  $('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  $$('[data-lang-opt]').forEach((o) => o.classList.toggle('is-on', o.dataset.langOpt === lang));
  langListeners.forEach((fn) => fn(lang));
}
$('[data-lang-toggle]')?.addEventListener('click', () => applyLang(lang === 'es' ? 'en' : 'es'));

/* ════════════════════════════════════════════════════════════
   Constelaciones: figuras hechas de miles de triángulos delineados

   Cada partícula persigue un destino con interpolación amortiguada; las
   escenas solo cambian destinos y colores. El dibujo agrupa los triángulos
   por color y opacidad para trazar decenas de rutas por cuadro, no miles.
   ════════════════════════════════════════════════════════════ */
const HUES = {
  violet: ['#8052ff', '#a68bff', '#6c3cff'],
  blue: ['#4d7cff', '#80b4ff'],
  amber: ['#ffb829', '#ffd27d', '#ff9340'],
  magenta: ['#ff54c6', '#d163ff'],
  teal: ['#15846e', '#2fd3ae', '#74f2d6']
};
const SWATCHES = Object.values(HUES).flat();
const FAMILY = {};
{ let k = 0; for (const [name, list] of Object.entries(HUES)) FAMILY[name] = list.map(() => k++); }
const LEVELS = [0.2, 0.4, 0.66, 0.95];
const STROKES = SWATCHES.map((hex) => {
  const n = parseInt(hex.slice(1), 16);
  return LEVELS.map((a) => `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`);
});
const SPECTRUM = { violet: 0.3, blue: 0.18, amber: 0.2, magenta: 0.14, teal: 0.18 };
const hue = (mix) => {
  let r = Math.random();
  for (const name in mix) {
    r -= mix[name];
    if (r <= 0) { const f = FAMILY[name]; return f[(Math.random() * f.length) | 0]; }
  }
  return FAMILY[Object.keys(mix)[0]][0];
};
const HIDDEN = 65535;

class Swarm {
  constructor(canvas, scene) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scene = scene;
    const n = this.n = scene.count;
    const f = () => new Float32Array(n);
    this.x = f(); this.y = f(); this.z = f();
    this.tx = f(); this.ty = f(); this.tz = f();
    this.ox = f(); this.oy = f();
    this.sx = f(); this.sy = f(); this.sr = f();
    this.size = f(); this.rot = f(); this.spin = f(); this.phase = f();
    this.rate = f(); this.delay = f(); this.alpha = f(); this.glow = f();
    this.col = new Uint8Array(n);
    this.bucket = new Uint16Array(n);
    this.order = new Uint16Array(n);
    const B = SWATCHES.length * LEVELS.length;
    this.counts = new Uint16Array(B);
    this.starts = new Uint16Array(B);
    this.fill = new Uint16Array(B);
    this.t = 0;
    this.cam = { yaw: scene.yaw ?? 0, pitch: scene.pitch ?? 0, yawOff: 0, pitchOff: 0, vel: scene.auto ?? 0 };
    this.pointer = { x: 0, y: 0, on: false };
    this.dragging = false;
    for (let i = 0; i < n; i++) {
      this.size[i] = rand(2.2, 4.2);
      this.rot[i] = rand(0, Math.PI * 2);
      this.spin[i] = rand(-0.7, 0.7);
      this.phase[i] = rand(0, Math.PI * 2);
      this.rate[i] = rand(0.03, 0.06);
      this.alpha[i] = rand(0.6, 1);
    }
    scene.init(this);
    this.bindPointer();
    this.resize();
    new ResizeObserver(() => { this.resize(); if (!this.running) this.draw(); }).observe(canvas);
    this.loop = this.loop.bind(this);
  }

  bindPointer() {
    const c = this.canvas, p = this.pointer, cam = this.cam;
    let lastX = 0, lastY = 0;
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      p.x = e.clientX - r.left;
      p.y = e.clientY - r.top;
      p.on = e.pointerType === 'mouse' || this.dragging;
      if (!this.dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      cam.yaw += dx * 0.01;
      cam.vel = clamp(dx * 0.6, -6, 6);
      cam.pitch = clamp(cam.pitch + dy * 0.005, -1.2, 0.35);
      lastX = e.clientX; lastY = e.clientY;
    }, { passive: true });
    c.addEventListener('pointerleave', () => { p.on = false; });
    if (!this.scene.drag) return;
    c.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      lastX = e.clientX; lastY = e.clientY;
      c.setPointerCapture(e.pointerId);
      c.classList.add('is-dragging');
    });
    const end = () => { this.dragging = false; p.on = false; c.classList.remove('is-dragging'); };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
  }

  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.W = Math.max(1, r.width);
    this.H = Math.max(1, r.height);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    const zoom = typeof this.scene.zoom === 'function' ? this.scene.zoom(this.W, this.H) : this.scene.zoom;
    this.scale = Math.min(this.W, this.H) * zoom;
    this.sizeK = clamp(this.scale / 250, 0.72, 1.3);
  }

  // Estado final sin animación (movimiento reducido)
  settle() {
    this.t = 60;
    for (let i = 0; i < this.n; i++) {
      this.x[i] = this.tx[i]; this.y[i] = this.ty[i]; this.z[i] = this.tz[i]; this.delay[i] = 0;
    }
    this.draw();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  loop(now) {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 1 / 60;
    this.last = now;
    this.step(dt);
    this.draw();
  }

  step(dt) {
    const { n, scene, cam, pointer: p } = this;
    this.t += dt;
    const t = this.t, k60 = dt * 60;
    scene.tick?.(this, t, dt);

    if (!this.dragging && scene.orbit) {
      // Tras soltar, conserva el impulso y vuelve con suavidad a su órbita
      const o = scene.orbit(t);
      cam.vel *= Math.pow(0.95, k60);
      cam.yaw += cam.vel * dt;
      let gap = o.yaw - cam.yaw;
      gap -= Math.round(gap / (Math.PI * 2)) * Math.PI * 2;
      const ko = 1 - Math.pow(0.985, k60);
      cam.yaw += gap * ko;
      cam.pitch += (o.pitch - cam.pitch) * ko;
    }
    const tilt = scene.tilt || 0;
    const follow = p.on && !this.dragging;
    const ty = follow ? (p.x / this.W - 0.5) * tilt : 0;
    const tp = follow ? (p.y / this.H - 0.5) * tilt * 0.6 : 0;
    const ke = 1 - Math.pow(0.95, k60);
    cam.yawOff += (ty - cam.yawOff) * ke;
    cam.pitchOff += (tp - cam.pitchOff) * ke;

    for (let i = 0; i < n; i++) {
      this.rot[i] += this.spin[i] * dt;
      if (t < this.delay[i]) continue;
      const e = 1 - Math.pow(1 - this.rate[i], k60);
      this.x[i] += (this.tx[i] - this.x[i]) * e;
      this.y[i] += (this.ty[i] - this.y[i]) * e;
      this.z[i] += (this.tz[i] - this.z[i]) * e;
    }
  }

  draw() {
    const { ctx, n, cam, W, H, t, scene, pointer: p } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const yaw = cam.yaw + cam.yawOff, pitch = cam.pitch + cam.pitchOff;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const D = 6, S = this.scale, K = this.sizeK;
    const ox0 = W * (scene.cx ?? 0.5), oy0 = H * (scene.cy ?? 0.5);
    const wob = reduced ? 0 : (scene.wobble ?? 0.012);
    const R = 110, R2 = R * R;
    const counts = this.counts, L = LEVELS.length;
    counts.fill(0);

    for (let i = 0; i < n; i++) {
      const ph = this.phase[i];
      let x = this.x[i], y = this.y[i], z = this.z[i];
      if (wob) {
        x += Math.sin(t * 0.8 + ph) * wob;
        y += Math.cos(t * 0.65 + ph * 1.3) * wob;
        z += Math.sin(t * 0.7 + ph * 0.7) * wob;
      }
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
      const s = D / (D + z2);
      let X = ox0 + x1 * s * S, Y = oy0 - y2 * s * S;

      // El puntero aparta las partículas como una lente
      let gx = 0, gy = 0;
      if (p.on) {
        const dx = X - p.x, dy = Y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1, f = 1 - d / R, push = f * f * 36;
          gx = (dx / d) * push; gy = (dy / d) * push;
        }
      }
      this.ox[i] += (gx - this.ox[i]) * 0.14;
      this.oy[i] += (gy - this.oy[i]) * 0.14;
      X += this.ox[i]; Y += this.oy[i];

      const appear = clamp((t - this.delay[i]) / 0.7, 0, 1);
      const depth = clamp(0.66 - z2 * 0.24, 0.3, 1);
      const tw = wob ? 0.78 + 0.22 * Math.sin(t * 1.6 + ph * 3) : 1;
      const a = (this.alpha[i] + this.glow[i]) * depth * tw * appear;
      if (a < 0.1 || X < -12 || X > W + 12 || Y < -12 || Y > H + 12) { this.bucket[i] = HIDDEN; continue; }
      const lvl = a < 0.3 ? 0 : a < 0.52 ? 1 : a < 0.8 ? 2 : 3;
      const b = this.col[i] * L + lvl;
      this.bucket[i] = b;
      counts[b]++;
      this.sx[i] = X; this.sy[i] = Y; this.sr[i] = this.size[i] * s * K;
    }

    // Orden por cubeta (conteo) para trazar una sola ruta por color y opacidad
    let acc = 0;
    for (let b = 0; b < counts.length; b++) { this.starts[b] = acc; acc += counts[b]; }
    this.fill.set(this.starts);
    for (let i = 0; i < n; i++) {
      const b = this.bucket[i];
      if (b !== HIDDEN) this.order[this.fill[b]++] = i;
    }

    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    for (let b = 0; b < counts.length; b++) {
      const c = counts[b];
      if (!c) continue;
      ctx.strokeStyle = STROKES[(b / L) | 0][b % L];
      ctx.beginPath();
      for (let j = this.starts[b], end = j + c; j < end; j++) {
        const i = this.order[j], X = this.sx[i], Y = this.sy[i], r = this.sr[i];
        const ca = Math.cos(this.rot[i]) * r, sa = Math.sin(this.rot[i]) * r;
        ctx.moveTo(X + ca, Y + sa);
        ctx.lineTo(X - 0.5 * ca - 0.866 * sa, Y - 0.5 * sa + 0.866 * ca);
        ctx.lineTo(X - 0.5 * ca + 0.866 * sa, Y - 0.5 * sa - 0.866 * ca);
        ctx.closePath();
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
}

/* ── Escena del hero: el símbolo CPP en 3D ──
   Tres placas (tapa, frente y lateral) con cortes que dejan la "C" abierta.
   Mismas medidas que el símbolo original. */
const boxDist = (p, c, h) => {
  const qx = Math.abs(p[0] - c[0]) - h[0], qy = Math.abs(p[1] - c[1]) - h[1], qz = Math.abs(p[2] - c[2]) - h[2];
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0);
};
const PLATE = 0.2;
const HERO_MODULES = [
  { c: [0, 1 - PLATE / 2, 0], h: [1, PLATE / 2, 1], cut: { c: [-0.55, 1 - PLATE / 2, -0.55], h: [0.47, 0.3, 0.47] },
    from: [0, 3.2, 0], mix: { violet: 0.62, blue: 0.24, magenta: 0.14 } },
  { c: [0, -PLATE / 2, -1 + PLATE / 2], h: [1, 1 - PLATE / 2, PLATE / 2], cut: { c: [0.5, 0.25, -1 + PLATE / 2], h: [0.52, 0.3, 0.3] },
    from: [-3.2, 0, -1.5], mix: { amber: 0.6, magenta: 0.26, violet: 0.14 } },
  { c: [1 - PLATE / 2, -PLATE / 2, PLATE / 2], h: [PLATE / 2, 1 - PLATE / 2, 1 - PLATE / 2], cut: null,
    from: [3.2, -1.2, 0], mix: { teal: 0.62, blue: 0.26, violet: 0.12 } }
];

function heroScene(count) {
  const narrow = () => innerWidth <= 900;
  return {
    count, yaw: 0.7, pitch: -0.5, tilt: 0.28, drag: true, wobble: 0.014,
    // Se balancea alrededor de la vista isométrica del logo, para que la "C" se lea
    orbit: (t) => ({ yaw: 0.75 + Math.sin(t * 0.2) * 0.55, pitch: -0.5 + Math.sin(t * 0.15) * 0.14 }),
    zoom: () => (narrow() ? 0.23 : 0.18),
    get cx() { return narrow() ? 0.5 : 0.58; },
    cy: 0.5,
    init(s) {
      const shapeN = Math.round(s.n * 0.8);
      let i = 0;
      while (i < shapeN) {
        const r = Math.random(), m = r < 0.34 ? 0 : r < 0.7 ? 1 : 2;
        const M = HERO_MODULES[m];
        const p = [M.c[0] + rand(-1, 1) * M.h[0], M.c[1] + rand(-1, 1) * M.h[1], M.c[2] + rand(-1, 1) * M.h[2]];
        let rim = false;
        if (M.cut) {
          const dc = boxDist(p, M.cut.c, M.cut.h);
          if (dc < 0) continue;
          if (dc < 0.08) rim = true;
        }
        const thin = M.h.indexOf(Math.min(...M.h));
        for (let a = 0; a < 3; a++) if (a !== thin && Math.abs(p[a] - M.c[a]) > M.h[a] - 0.08) rim = true;
        // Los bordes se dibujan completos; el interior, más ralo y tenue, para que la forma se lea
        if (!rim && Math.random() > 0.2) continue;
        s.tx[i] = p[0]; s.ty[i] = p[1]; s.tz[i] = p[2];
        s.col[i] = hue(Math.random() < 0.84 ? M.mix : SPECTRUM);
        s.size[i] = rim ? rand(2.4, 4.2) : rand(1.6, 3.2);
        s.alpha[i] = rim ? rand(0.8, 1) : rand(0.34, 0.62);
        s.x[i] = p[0] + M.from[0] * 1.2 + gauss() * 0.5;
        s.y[i] = p[1] + M.from[1] * 1.2 + gauss() * 0.5;
        s.z[i] = p[2] + M.from[2] * 1.2 + gauss() * 0.5;
        s.delay[i] = 0.25 + m * 0.24 + Math.random() * 0.6;
        s.rate[i] = rand(0.028, 0.055);
        i++;
      }
      // Halo: partículas sueltas que orbitan alrededor de la figura
      for (; i < s.n; i++) {
        const u = rand(-1, 1), th = rand(0, Math.PI * 2), rr = Math.min(1.65 + Math.abs(gauss()) * 0.6, 3), q = Math.sqrt(1 - u * u);
        s.tx[i] = q * Math.cos(th) * rr;
        s.ty[i] = u * rr * 0.85;
        s.tz[i] = q * Math.sin(th) * rr;
        s.col[i] = hue(SPECTRUM);
        s.size[i] = rand(1.6, 3.2);
        s.alpha[i] = rand(0.28, 0.62);
        s.x[i] = s.tx[i] * 2.2; s.y[i] = s.ty[i] * 2.2; s.z[i] = s.tz[i] * 2.2;
        s.delay[i] = rand(0, 1.4);
        s.rate[i] = rand(0.012, 0.03);
      }
    }
  };
}

/* ── Escenas de proyectos: pictogramas vivos ── */
const scatter = (s, i, spread = 1.6) => {
  s.x[i] = rand(-spread, spread); s.y[i] = rand(-spread * 0.8, spread * 0.8); s.z[i] = rand(-1, 1);
  s.delay[i] = Math.random() * 0.7;
};
const sway = (s, t) => {
  s.cam.yaw = Math.sin(t * 0.3) * 0.24;
  s.cam.pitch = Math.sin(t * 0.23) * 0.08;
};

// Panel operativo: barras que se reordenan y una línea de tendencia
function dashboardScene(count) {
  const BARS = 7, per = Math.floor((count * 0.7) / BARS), lineN = Math.floor(count * 0.16), barsN = BARS * per;
  const u = new Float32Array(count), v = new Float32Array(count);
  const barX = (b) => -0.78 + b * 0.26, BW = 0.15, Y0 = -0.66;
  let heights = [], next = 0;
  const newHeights = () => { heights = Array.from({ length: BARS }, () => rand(0.3, 1.18)); };
  const place = (s) => {
    for (let i = 0; i < barsN; i++) {
      const b = (i / per) | 0;
      s.tx[i] = barX(b) + (u[i] - 0.5) * BW;
      s.ty[i] = Y0 + v[i] * heights[b];
    }
    const tops = heights.map((h, b) => [barX(b), Y0 + h + 0.18]);
    for (let k = 0; k < lineN; k++) {
      const i = barsN + k, f = u[i] * (BARS - 1), seg = Math.min(BARS - 2, f | 0), tt = f - seg;
      s.tx[i] = lerp(tops[seg][0], tops[seg + 1][0], tt);
      s.ty[i] = lerp(tops[seg][1], tops[seg + 1][1], tt) + (v[i] - 0.5) * 0.035;
    }
  };
  return {
    count, zoom: 0.45, tilt: 0.5, wobble: 0.01, cy: 0.52,
    init(s) {
      newHeights();
      for (let i = 0; i < s.n; i++) {
        s.tz[i] = rand(-0.07, 0.07);
        if (i < barsN) {
          if (Math.random() < 0.6) {
            const side = Math.random();
            if (side < 0.5) { u[i] = Math.random() < 0.5 ? 0 : 1; v[i] = Math.random(); }
            else if (side < 0.8) { u[i] = Math.random(); v[i] = 1; }
            else { u[i] = Math.random(); v[i] = 0; }
          } else {
            u[i] = Math.random(); v[i] = Math.random(); s.alpha[i] = rand(0.3, 0.55);
          }
          s.col[i] = hue({ violet: 0.55, blue: 0.3, magenta: 0.15 });
        } else if (i < barsN + lineN) {
          u[i] = Math.random(); v[i] = Math.random();
          s.col[i] = hue({ amber: 1 });
          s.size[i] = rand(1.8, 3.2);
          s.alpha[i] = rand(0.75, 1);
        } else {
          s.tx[i] = rand(-0.95, 0.95); s.ty[i] = Y0 - 0.1 + gauss() * 0.01;
          s.col[i] = hue({ teal: 1 });
          s.size[i] = rand(1.6, 2.8);
        }
        scatter(s, i);
      }
      place(s);
      next = 3.4;
    },
    tick(s, t) {
      sway(s, t);
      if (t > next) { next = t + 3.2; newHeights(); place(s); }
    }
  };
}

// Tienda: los productos caen en la bolsa y vuelven a reponerse
function storeScene(count) {
  const bodyN = Math.floor(count * 0.5), handleN = Math.floor(count * 0.12), itemN = Math.floor((count - bodyN - handleN) / 3);
  const TOP = 0.02, BOT = -0.86;
  const items = [
    { kind: 'circle', cx: -0.64, cy: 0.62, r: 0.17, mix: { amber: 1 } },
    { kind: 'square', cx: 0, cy: 0.76, r: 0.15, mix: { magenta: 0.7, violet: 0.3 } },
    { kind: 'tri', cx: 0.64, cy: 0.6, r: 0.2, mix: { teal: 1 } }
  ];
  const home = new Float32Array(count * 2);
  let next = 0, back = Infinity, active = -1, turn = 0;
  const itemStart = bodyN + handleN;
  const pointOn = (it) => {
    const outline = Math.random() < 0.7;
    if (it.kind === 'circle') {
      const a = rand(0, Math.PI * 2), rr = outline ? it.r : Math.sqrt(Math.random()) * it.r;
      return [it.cx + Math.cos(a) * rr, it.cy + Math.sin(a) * rr];
    }
    if (it.kind === 'square') {
      if (!outline) return [it.cx + rand(-it.r, it.r), it.cy + rand(-it.r, it.r)];
      const e = Math.random() * 4, f = rand(-it.r, it.r), side = e | 0;
      return side === 0 ? [it.cx + f, it.cy + it.r] : side === 1 ? [it.cx + f, it.cy - it.r] : side === 2 ? [it.cx - it.r, it.cy + f] : [it.cx + it.r, it.cy + f];
    }
    const V = [0, 1, 2].map((k) => [it.cx + Math.cos(Math.PI / 2 + k * 2.094) * it.r, it.cy + Math.sin(Math.PI / 2 + k * 2.094) * it.r]);
    if (outline) {
      const k = (Math.random() * 3) | 0, tt = Math.random(), A = V[k], Bv = V[(k + 1) % 3];
      return [lerp(A[0], Bv[0], tt), lerp(A[1], Bv[1], tt)];
    }
    let a = Math.random(), b = Math.random();
    if (a + b > 1) { a = 1 - a; b = 1 - b; }
    return [V[0][0] + (V[1][0] - V[0][0]) * a + (V[2][0] - V[0][0]) * b, V[0][1] + (V[1][1] - V[0][1]) * a + (V[2][1] - V[0][1]) * b];
  };
  const range = (j) => [itemStart + j * itemN, itemStart + (j + 1) * itemN];
  return {
    count, zoom: 0.45, tilt: 0.5, wobble: 0.01, cy: 0.52,
    init(s) {
      for (let i = 0; i < s.n; i++) {
        s.tz[i] = rand(-0.07, 0.07);
        if (i < bodyN) {
          if (Math.random() < 0.66) {
            const side = Math.random();
            if (side < 0.2) { s.tx[i] = rand(-0.5, 0.5); s.ty[i] = TOP; }
            else if (side < 0.45) { s.tx[i] = rand(-0.6, 0.6); s.ty[i] = BOT; }
            else {
              const tt = Math.random(), w = lerp(0.6, 0.5, tt);
              s.tx[i] = side < 0.72 ? -w : w; s.ty[i] = lerp(BOT, TOP, tt);
            }
          } else {
            const tt = Math.random(), w = lerp(0.6, 0.5, tt);
            s.tx[i] = rand(-w, w); s.ty[i] = lerp(BOT, TOP, tt);
            s.alpha[i] = rand(0.25, 0.5);
          }
          s.col[i] = hue({ violet: 0.6, blue: 0.3, magenta: 0.1 });
        } else if (i < itemStart) {
          const a = rand(0, Math.PI);
          s.tx[i] = Math.cos(a) * 0.27 + gauss() * 0.006;
          s.ty[i] = TOP + Math.sin(a) * 0.3 + gauss() * 0.006;
          s.col[i] = hue({ violet: 0.7, blue: 0.3 });
        } else {
          const j = Math.min(2, ((i - itemStart) / itemN) | 0), it = items[j];
          const [px, py] = pointOn(it);
          s.tx[i] = home[i * 2] = px; s.ty[i] = home[i * 2 + 1] = py;
          s.col[i] = hue(it.mix);
          s.alpha[i] = rand(0.7, 1);
        }
        scatter(s, i);
      }
      next = 2.4;
    },
    tick(s, t) {
      sway(s, t);
      if (t > next) {
        next = t + 2.8;
        active = turn++ % 3;
        const [a, b] = range(active);
        for (let i = a; i < b; i++) { s.tx[i] = rand(-0.34, 0.34); s.ty[i] = rand(-0.66, -0.2); s.rate[i] = rand(0.05, 0.08); }
        back = t + 1.4;
      }
      if (t > back && active >= 0) {
        // Reposición: el producto reaparece arriba y cae a su lugar
        const [a, b] = range(active);
        for (let i = a; i < b; i++) {
          s.x[i] = home[i * 2] + gauss() * 0.05; s.y[i] = home[i * 2 + 1] + 0.7 + Math.random() * 0.3;
          s.tx[i] = home[i * 2]; s.ty[i] = home[i * 2 + 1];
          s.delay[i] = t + Math.random() * 0.25;
          s.rate[i] = rand(0.04, 0.07);
        }
        back = Infinity;
      }
    }
  };
}

// Reservas: un calendario donde se confirman turnos
function bookingsScene(count) {
  const COLS = 7, ROWS = 4, CELLS = COLS * ROWS, headN = Math.floor(count * 0.1), K = Math.floor((count - headN) / CELLS);
  const SIZE = 0.2, GAP = 0.062, WID = COLS * SIZE + (COLS - 1) * GAP, X0 = -WID / 2, TOP = 0.4;
  const u = new Float32Array(count), v = new Float32Array(count), base = new Uint8Array(count);
  const state = new Array(CELLS).fill('free');
  let next = 0, settle = Infinity, fresh = -1;
  const center = (c) => [X0 + (c % COLS) * (SIZE + GAP) + SIZE / 2, TOP - ((c / COLS) | 0) * (SIZE + GAP) - SIZE / 2];
  const place = (s, c) => {
    const [cx, cy] = center(c), filled = state[c] !== 'free';
    for (let k = 0; k < K; k++) {
      const i = headN + c * K + k;
      if (filled) {
        s.tx[i] = cx + (u[i] - 0.5) * SIZE * 0.95; s.ty[i] = cy + (v[i] - 0.5) * SIZE * 0.95;
      } else {
        const e = u[i] * 4, side = e | 0, f = (e - side - 0.5) * SIZE * 0.78, h = SIZE * 0.39;
        s.tx[i] = cx + (side === 0 ? f : side === 1 ? f : side === 2 ? -h : h);
        s.ty[i] = cy + (side === 0 ? h : side === 1 ? -h : f);
      }
      const isNew = state[c] === 'new';
      s.col[i] = isNew ? hue({ amber: 1 }) : base[i];
      s.glow[i] = isNew ? 0.35 : 0;
      s.alpha[i] = isNew ? 0.95 : filled ? 0.72 : 0.42;
    }
  };
  const seed = (s) => {
    for (let c = 0; c < CELLS; c++) { state[c] = Math.random() < 0.3 ? 'busy' : 'free'; place(s, c); }
  };
  return {
    count, zoom: 0.49, tilt: 0.5, wobble: 0.008, cy: 0.5,
    init(s) {
      for (let i = 0; i < s.n; i++) {
        s.tz[i] = rand(-0.06, 0.06);
        if (i < headN) {
          s.tx[i] = rand(X0, X0 + WID); s.ty[i] = TOP + 0.16 + gauss() * 0.008;
          s.col[i] = hue({ teal: 0.7, blue: 0.3 });
          s.size[i] = rand(1.8, 3);
        } else {
          u[i] = Math.random(); v[i] = Math.random();
          base[i] = hue({ violet: 0.5, blue: 0.3, teal: 0.2 });
          s.size[i] = rand(1.6, 3);
        }
        scatter(s, i);
      }
      seed(s);
      next = 2;
    },
    tick(s, t) {
      sway(s, t);
      if (t > next) {
        next = t + 2.4;
        let free = state.map((st, c) => (st === 'free' ? c : -1)).filter((c) => c >= 0);
        if (free.length < 6) { seed(s); free = state.map((st, c) => (st === 'free' ? c : -1)).filter((c) => c >= 0); }
        fresh = free[(Math.random() * free.length) | 0];
        state[fresh] = 'new';
        place(s, fresh);
        settle = t + 1.7;
      }
      if (t > settle) {
        state[fresh] = 'busy';
        place(s, fresh);
        settle = Infinity;
      }
    }
  };
}

(function swarms() {
  const small = innerWidth < 760;
  const SCENES = {
    hero: () => heroScene(small ? 1500 : 2600),
    dashboard: () => dashboardScene(small ? 700 : 1000),
    store: () => storeScene(small ? 700 : 1000),
    bookings: () => bookingsScene(small ? 700 : 950)
  };
  const visible = new Set();
  $$('[data-swarm]').forEach((canvas) => {
    let swarm = null;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        swarm ??= new Swarm(canvas, SCENES[canvas.dataset.swarm]());
        visible.add(swarm);
        if (reduced) swarm.settle();
        else if (!document.hidden) swarm.start();
      } else if (swarm) {
        visible.delete(swarm);
        swarm.stop();
      }
    }, { rootMargin: '120px 0px' }).observe(canvas);
  });
  document.addEventListener('visibilitychange', () => {
    if (reduced) return;
    visible.forEach((s) => (document.hidden ? s.stop() : s.start()));
  });
})();

/* ── Partículas de ambiente: pocas, lentas y tenues ── */
(function ambient() {
  const canvas = $('[data-ambient]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, parts = [], raf = 0, last = 0, time = 0;

  const make = () => {
    const n = Math.round(clamp((W * H) / 24000, 26, 80));
    parts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, d: rand(0.25, 1), r: rand(1.8, 4),
      a: rand(0, Math.PI * 2), spin: rand(-0.4, 0.4), vx: rand(-5, 5), vy: rand(-10, -3),
      c: hue(SPECTRUM), al: rand(0.22, 0.6), ph: rand(0, Math.PI * 2)
    }));
  };
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    make();
  };
  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    const scroll = reduced ? 0 : scrollY;
    for (const p of parts) {
      const x = (((p.x + p.vx * time) % W) + W) % W;
      const y = (((p.y + p.vy * time * p.d - scroll * p.d * 0.3) % (H + 20)) + H + 20) % (H + 20) - 10;
      const a = p.al * p.d * (reduced ? 1 : 0.65 + 0.35 * Math.sin(time * 0.9 + p.ph));
      const lvl = a < 0.3 ? 0 : a < 0.52 ? 1 : 2;
      const rot = p.a + p.spin * time, r = p.r * (0.6 + p.d * 0.5);
      const ca = Math.cos(rot) * r, sa = Math.sin(rot) * r;
      ctx.strokeStyle = STROKES[p.c][lvl];
      ctx.beginPath();
      ctx.moveTo(x + ca, y + sa);
      ctx.lineTo(x - 0.5 * ca - 0.866 * sa, y - 0.5 * sa + 0.866 * ca);
      ctx.lineTo(x - 0.5 * ca + 0.866 * sa, y - 0.5 * sa - 0.866 * ca);
      ctx.closePath();
      ctx.stroke();
    }
  };
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps: el fondo no necesita más
    time += Math.min((now - (last || now)) / 1000, 0.1);
    last = now;
    draw();
  };
  resize();
  addEventListener('resize', () => { resize(); if (reduced) draw(); });
  if (reduced) { draw(); return; }
  raf = requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) { last = 0; raf = requestAnimationFrame(loop); }
  });
})();

/* ── Hero ── */
function heroIntro() {
  $$('.hero-copy [data-hero-item]').forEach((el, i) => el.style.setProperty('--d', `${0.1 + i * 0.1}s`));
  $('.hero-caption')?.style.setProperty('--d', '1.4s');
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

/* ── Manifiesto palabra por palabra ── */
const manifesto = $('[data-words]');
let manifestoWords = [];
function splitWords(el, text) {
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(' ').map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
  manifestoWords = $$('.w', el);
  if (reduced) manifestoWords.forEach((w) => w.classList.add('is-on'));
  else requestScroll();
}

/* ════════════════════════════════════════════════════════════
   Servicios
   ════════════════════════════════════════════════════════════ */
const SERVICES = I18N.services;
const TRI = '<svg class="tri" viewBox="0 0 12 12" aria-hidden="true"><path d="M6 1.6 10.6 9.9H1.4Z"/></svg>';

(function services() {
  const list = $('[data-files]');
  if (!list) return;
  const panel = $('[data-panel]');
  const priceEl = $('[data-s-price]');
  let current = 0, priceRaf = 0, counted = false;

  const renderTabs = () => {
    list.innerHTML = SERVICES.map((s, i) => `<button class="svc-tab" type="button" role="tab" id="tab-${s.key}" aria-controls="service-panel" aria-selected="${i === current}" tabindex="${i === current ? 0 : -1}"><span class="svc-dot" aria-hidden="true"></span><span>${staticText(`svc.${s.key}`)}</span><span class="svc-from">S/ ${s.price.toLocaleString('en-US')}${s.plus ? '+' : ''}</span></button>`).join('');
  };

  const countPrice = (to) => {
    cancelAnimationFrame(priceRaf);
    if (reduced || !counted) { priceEl.textContent = to.toLocaleString('en-US'); return; }
    const from = Number(priceEl.textContent.replace(/,/g, '')) || 0, t0 = performance.now();
    const tick = (now) => {
      const p = easeOut(clamp((now - t0) / 800, 0, 1));
      priceEl.textContent = Math.round(lerp(from, to, p)).toLocaleString('en-US');
      if (p < 1) priceRaf = requestAnimationFrame(tick);
    };
    priceRaf = requestAnimationFrame(tick);
  };

  const select = (i, { focus = false, animate = true } = {}) => {
    current = i;
    const s = SERVICES[i], L = pick(s);
    $$('[role="tab"]', list).forEach((tab, k) => {
      tab.setAttribute('aria-selected', String(k === i));
      tab.tabIndex = k === i ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `tab-${s.key}`);
    if (focus) $(`#tab-${s.key}`).focus();
    $('[data-s-title]').textContent = L.title;
    $('[data-s-desc]').textContent = L.desc;
    $('[data-s-list]').innerHTML = L.list.map((x) => `<li>${TRI}<span>${x}</span></li>`).join('');
    $('[data-s-plus]').hidden = !s.plus;
    $('[data-s-cta]').dataset.servicePick = s.key;
    if (animate && !reduced) { panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap'); }
    countPrice(s.price);
  };

  list.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (tab) select($$('[role="tab"]', list).indexOf(tab));
  });
  list.addEventListener('keydown', (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) { e.preventDefault(); select((current + keys[e.key] + SERVICES.length) % SERVICES.length, { focus: true }); }
    if (e.key === 'Home') { e.preventDefault(); select(0, { focus: true }); }
    if (e.key === 'End') { e.preventDefault(); select(SERVICES.length - 1, { focus: true }); }
  });

  renderTabs();
  select(0, { animate: false });
  priceEl.textContent = '0';
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    counted = true;
    countPrice(SERVICES[current].price);
  }, { threshold: 0.4 });
  io.observe(panel);
  onLang(() => { renderTabs(); select(current, { animate: false }); });
})();

/* ── Elegir servicio desde cualquier enlace ── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-service-pick]');
  if (!link) return;
  const select = $('#service');
  if (select) { select.value = link.dataset.servicePick; select.dispatchEvent(new Event('input', { bubbles: true })); }
});

/* ════════════════════════════════════════════════════════════
   Equipo: carrusel y perfil a pantalla completa
   ════════════════════════════════════════════════════════════ */
const LINKEDIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>';

(function team() {
  const grid = $('[data-team-grid]');
  const rail = $('[data-team-rail]');
  const dots = $('[data-team-dots]');
  const dialog = $('[data-profile]');
  if (!grid || !dialog) return;
  const TEAM = I18N.team;
  const card = $('[data-profile-card]', dialog);
  const media = $('[data-p-media]', dialog);
  const photo = $('[data-p-photo]', dialog);
  const tabsEl = $('[data-p-tabs]', dialog);
  const panel = $('[data-p-panel]', dialog);
  const pDots = $('[data-p-dots]', dialog);
  let index = 0, tab = 'profile', railIndex = 0;

  const dotButtons = (active) => TEAM.map((m, i) => `<button type="button" data-dot="${i}" aria-label="${t('team.goto')(m.name)}" aria-current="${i === active}"></button>`).join('');

  const renderGrid = () => {
    grid.innerHTML = TEAM.map((m, i) => {
      const L = pick(m);
      return `<li class="member">
        <button type="button" class="member-card" data-member="${i}" aria-haspopup="dialog" aria-label="${t('team.open')(m.name)}">
          <span class="portrait"><img src="assets/team/${m.photo}-480.webp" srcset="assets/team/${m.photo}-480.webp 480w, assets/team/${m.photo}-960.webp 960w" sizes="(max-width: 700px) 80vw, 34vw" width="480" height="640" alt="" loading="lazy" decoding="async" /></span>
          <span class="member-role">${L.specialty}</span>
          <span class="member-name">${m.name}</span>
        </button>
        ${m.linkedin ? `<a class="member-social" href="${m.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${t('team.linkedinOf')(m.name)}">${LINKEDIN}</a>` : ''}
      </li>`;
    }).join('');
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', t('team.dots'));
    dots.innerHTML = dotButtons(railIndex);
    syncRail();
  };

  // Carrusel: los puntos siguen al desplazamiento y solo aparecen si hay algo que desplazar
  const items = () => $$('.member', grid);
  const syncRail = () => {
    const overflow = rail.scrollWidth > rail.clientWidth + 4;
    dots.hidden = !overflow;
    if (!overflow) return;
    const list = items(), left = rail.getBoundingClientRect().left;
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    railIndex = atEnd ? list.length - 1 : list.reduce((best, li, i) => (Math.abs(li.getBoundingClientRect().left - left) < Math.abs(list[best].getBoundingClientRect().left - left) ? i : best), 0);
    $$('[data-dot]', dots).forEach((d, i) => d.setAttribute('aria-current', String(i === railIndex)));
  };
  let railFrame = 0;
  rail.addEventListener('scroll', () => { if (!railFrame) railFrame = requestAnimationFrame(() => { railFrame = 0; syncRail(); }); }, { passive: true });
  addEventListener('resize', syncRail);
  dots.addEventListener('click', (e) => {
    const d = e.target.closest('[data-dot]');
    if (!d) return;
    const li = items()[Number(d.dataset.dot)];
    rail.scrollTo({ left: rail.scrollLeft + li.getBoundingClientRect().left - rail.getBoundingClientRect().left, behavior: reduced ? 'auto' : 'smooth' });
  });

  const tabList = (L) => {
    const names = I18N.teamTabs[lang];
    const hasCpp = L.atCpp && (L.atCpp.summary || L.atCpp.tasks?.length || L.atCpp.focus?.length);
    return [['profile', names.profile, L.profile?.length], ['atCpp', names.atCpp, hasCpp], ['stack', names.stack, L.stack?.length]].filter((x) => x[2]);
  };
  const chips = (list) => `<ul class="chips">${list.map((x) => `<li>${x}</li>`).join('')}</ul>`;

  const renderPanel = (animate) => {
    const L = pick(TEAM[index]);
    let html = '';
    if (tab === 'profile') {
      html = `<dl class="facts">${L.profile.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
    } else if (tab === 'atCpp') {
      const c = L.atCpp;
      html = `<div class="at-cpp">
        ${c.summary ? `<p class="at-summary">${c.summary}</p>` : ''}
        ${c.tasks?.length ? `<ul class="tasks">${c.tasks.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}
        ${c.focus?.length ? chips(c.focus) : ''}
      </div>`;
    } else {
      html = `<div class="stack">${L.stack.map((g) => `<div class="stack-group"><p class="stack-label">${g.group}</p>${chips(g.items)}</div>`).join('')}</div>`;
    }
    panel.innerHTML = html;
    panel.setAttribute('aria-labelledby', `ptab-${tab}`);
    if (animate && !reduced) { panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap'); }
  };

  const renderTabs = () => {
    const list = tabList(pick(TEAM[index]));
    if (!list.some(([id]) => id === tab)) tab = list[0]?.[0] || 'profile';
    tabsEl.innerHTML = list.map(([id, label]) => `<button type="button" role="tab" id="ptab-${id}" aria-controls="profile-panel" aria-selected="${id === tab}" tabindex="${id === tab ? 0 : -1}" data-ptab="${id}">${label}</button>`).join('');
  };

  const render = (dir = 0) => {
    const m = TEAM[index], L = pick(m);
    photo.src = `assets/team/${m.photo}-480.webp`;
    photo.srcset = `assets/team/${m.photo}-480.webp 480w, assets/team/${m.photo}-960.webp 960w`;
    photo.sizes = '(max-width: 900px) 100vw, 40vw';
    photo.alt = m.name;
    $('[data-p-kicker]', dialog).textContent = `${t('team.partner')} · ${t('team.module')} 0${m.module}`;
    $('[data-p-name]', dialog).textContent = m.name;
    $('[data-p-role]', dialog).textContent = L.specialty;
    $('[data-p-quote]', dialog).textContent = L.quote || '';
    $('[data-p-quote]', dialog).hidden = !L.quote;
    $('[data-p-bio]', dialog).textContent = L.bio || '';
    $('[data-p-bio]', dialog).hidden = !L.bio;
    const li = $('[data-p-linkedin]', dialog);
    li.href = m.linkedin || '#';
    li.hidden = !m.linkedin;
    pDots.setAttribute('role', 'group');
    pDots.setAttribute('aria-label', t('team.dots'));
    pDots.innerHTML = dotButtons(index);
    renderTabs();
    renderPanel(false);
    if (dir && !reduced) {
      card.classList.remove('slide-next', 'slide-prev', 'is-entering'); void card.offsetWidth;
      card.classList.add(dir > 0 ? 'slide-next' : 'slide-prev');
    }
  };

  // El retrato viaja desde el carrusel hasta su lugar en el perfil
  const flip = (from) => {
    if (reduced || !from || !media.animate) return;
    const a = from.getBoundingClientRect(), b = media.getBoundingClientRect();
    if (!b.width || !b.height) return;
    media.style.transformOrigin = '0 0';
    media.animate([
      { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})` },
      { transform: 'none' }
    ], { duration: 800, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  };

  const open = (i, from) => {
    index = i; tab = 'profile';
    render();
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('has-dialog');
    if (!reduced) {
      card.classList.remove('is-entering', 'slide-next', 'slide-prev');
      void card.offsetWidth;
      card.classList.add('is-entering');
    }
    flip(from?.querySelector('.portrait'));
  };

  let closing = false;
  const close = () => new Promise((resolve) => {
    if (closing || !dialog.open) { resolve(); return; }
    closing = true;
    const done = () => {
      dialog.close();
      dialog.classList.remove('is-closing');
      document.body.classList.remove('has-dialog');
      closing = false;
      grid.querySelector(`[data-member="${index}"]`)?.focus({ preventScroll: true });
      resolve();
    };
    if (reduced) { done(); return; }
    dialog.classList.add('is-closing');
    setTimeout(done, 340);
  });

  const go = (dir) => { index = (index + dir + TEAM.length) % TEAM.length; tab = 'profile'; render(dir); };

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-member]');
    if (b) open(Number(b.dataset.member), b);
  });
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-profile-close]');
    if (closer) {
      const href = closer.getAttribute('href');
      if (href?.startsWith('#')) { e.preventDefault(); close().then(() => $(href)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })); }
      else close();
      return;
    }
    const d = e.target.closest('[data-dot]');
    if (d && Number(d.dataset.dot) !== index) { const to = Number(d.dataset.dot), dir = to > index ? 1 : -1; index = to; tab = 'profile'; render(dir); }
  });
  $('[data-p-prev]', dialog).addEventListener('click', () => go(-1));
  $('[data-p-next]', dialog).addEventListener('click', () => go(1));
  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ptab]');
    if (!b || b.dataset.ptab === tab) return;
    tab = b.dataset.ptab;
    renderTabs(); renderPanel(true);
    $(`[data-ptab="${tab}"]`, tabsEl).focus();
  });
  dialog.addEventListener('keydown', (e) => {
    const inTabs = e.target.closest('[data-p-tabs]');
    if (inTabs && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      const ids = $$('[data-ptab]', tabsEl).map((b) => b.dataset.ptab);
      tab = ids[(ids.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length];
      renderTabs(); renderPanel(true);
      $(`[data-ptab="${tab}"]`, tabsEl).focus();
    } else if (!inTabs && !e.target.closest('input, textarea, select') && e.key === 'ArrowRight') go(1);
    else if (!inTabs && !e.target.closest('input, textarea, select') && e.key === 'ArrowLeft') go(-1);
  });

  // Deslizar entre socios en pantallas táctiles
  let sx = null;
  card.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
  card.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 60) go(e.clientX < sx ? 1 : -1); sx = null; });

  renderGrid();
  onLang(() => { renderGrid(); if (dialog.open) render(); });
})();

/* ════════════════════════════════════════════════════════════
   Scroll: cabecera, navegación activa, manifiesto y proceso
   ════════════════════════════════════════════════════════════ */
const topBar = $('[data-top]');
const mobileMenu = $('[data-mobile-menu]');
const navLinks = $$('.nav a');
const navTargets = navLinks.map((a) => $(a.getAttribute('href')));
const steps = $$('[data-step]');
let lastY = 0, ticking = false;

function onScroll() {
  ticking = false;
  const y = scrollY, vh = innerHeight;

  topBar.classList.toggle('is-scrolled', y > 20);
  if (y > 480 && y > lastY + 4 && mobileMenu.hidden) topBar.classList.add('is-hidden');
  else if (y < lastY - 4 || y <= 480) topBar.classList.remove('is-hidden');
  lastY = y;

  const mid = vh * 0.45;
  navLinks.forEach((a, i) => {
    const r = navTargets[i]?.getBoundingClientRect();
    a.classList.toggle('is-active', !!r && r.top <= mid && r.bottom > mid);
  });

  if (manifestoWords.length && !reduced) {
    const r = manifesto.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
    const on = Math.round(p * manifestoWords.length);
    manifestoWords.forEach((w, i) => w.classList.toggle('is-on', i < on));
  }

  steps.forEach((s) => s.classList.toggle('is-lit', reduced || s.getBoundingClientRect().top < vh * 0.7));
}
function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
addEventListener('scroll', requestScroll, { passive: true });
addEventListener('resize', requestScroll);

/* ── Apariciones ── */
$$('[data-reveal]').forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
  const i = siblings.indexOf(el);
  if (i > 0 && siblings.length < 5) el.style.setProperty('--d', `${i * 0.12}s`);
});
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    revealIO.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal], [data-strike]').forEach((el) => revealIO.observe(el));

/* ── Menú móvil ── */
(function mobileMenuToggle() {
  const btn = $('[data-menu-toggle]');
  if (!btn) return;
  const word = $('.menu-word', btn);
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', t(open ? 'menu.close' : 'menu.open'));
    word.textContent = open ? staticText('team.closeWord') : staticText('menu.word');
    mobileMenu.hidden = !open;
    mobileMenu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) topBar.classList.remove('is-hidden');
  };
  btn.addEventListener('click', () => set(mobileMenu.hidden));
  mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mobileMenu.hidden) { set(false); btn.focus(); } });
  onLang(() => set(!mobileMenu.hidden));
})();

/* ── Formulario ── */
(function form() {
  const form = $('[data-form]');
  if (!form) return;
  const startedAt = Date.now();
  const status = $('[data-status]', form);
  const button = $('button[type="submit"]', form);
  const label = $('span', button);
  let statusKey = null;

  const check = (field) => {
    const err = $(`#${field.id}-error`);
    const ok = field.validity.valid;
    if (err) err.textContent = ok ? '' : t(`form.err.${field.id}`);
    field.setAttribute('aria-invalid', String(!ok));
    if (!ok && err) field.setAttribute('aria-describedby', err.id); else field.removeAttribute('aria-describedby');
    return ok;
  };
  const setStatus = (key, kind) => {
    statusKey = key;
    status.className = `form-status ${kind || ''}`;
    status.innerHTML = key ? t(key) : '';
  };

  $$('[required]', form).forEach((f) => {
    f.addEventListener('blur', () => check(f));
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') check(f); });
  });

  onLang(() => {
    $$('[aria-invalid="true"]', form).forEach(check);
    if (statusKey) status.innerHTML = t(statusKey);
    if (!button.disabled) label.textContent = t('form.submit');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!$$('[required]', form).map(check).every(Boolean)) {
      setStatus('form.review', 'error');
      $('[aria-invalid="true"]', form)?.focus();
      return;
    }
    if ($('#website').value || Date.now() - startedAt < 2500) { setStatus('form.bot', 'error'); return; }

    const data = Object.fromEntries(new FormData(form));
    delete data.website;
    data.lang = lang;

    if (!CONFIG.endpoint && CONFIG.whatsapp) {
      const svc = $('#service').selectedOptions[0]?.textContent, budget = $('#budget').selectedOptions[0]?.textContent;
      const text = `${t('form.waIntro')(data.name, data.company)}\n${t('form.waService')}: ${svc}\n${t('form.waBudget')}: ${budget}\n${t('form.waEmail')}: ${data.email}\n${t('form.waPhone')}: ${data.phone}\n\n${data.message}`;
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      setStatus('form.whatsapp', 'success');
      return;
    }
    if (!CONFIG.endpoint) {
      console.warn('[CPP] Configura CONFIG.endpoint o CONFIG.whatsapp en script.js para recibir solicitudes.');
      setStatus('form.inactive', 'error');
      return;
    }

    button.disabled = true;
    label.textContent = t('form.sending');
    try {
      const res = await fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      setStatus('form.ok', 'success');
    } catch {
      setStatus('form.fail', 'error');
    } finally {
      button.disabled = false;
      label.textContent = t('form.submit');
    }
  });
})();

/* ── Inicio ── */
$('[data-year]').textContent = new Date().getFullYear();
applyLang(lang);
heroIntro();
onScroll();
