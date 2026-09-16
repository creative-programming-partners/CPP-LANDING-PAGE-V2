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
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const GLYPHS = '01<>/{}[]=+*#$_;:';

const onVisible = (el, cb, opts = { threshold: 0.2 }) => {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting, e)), opts);
  io.observe(el);
  return io;
};

/* ── Texto que se decodifica ── */
function scramble(el, text = el.dataset.text || el.textContent, duration = 900) {
  el.dataset.text = text;
  if (reduced) { el.textContent = text; return; }
  const start = performance.now();
  const len = text.length;
  cancelAnimationFrame(el._scr);
  const tick = (now) => {
    const p = clamp((now - start) / duration, 0, 1);
    const fixed = Math.floor(easeOut(p) * len);
    let out = text.slice(0, fixed);
    for (let i = fixed; i < len; i++) {
      out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) el._scr = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  el._scr = requestAnimationFrame(tick);
}

/* ── Arranque ── */
const boot = $('[data-boot]');
const startPage = () => {
  document.body.classList.remove('is-booting');
  document.documentElement.classList.add('is-ready');
  document.body.classList.add('is-ready');
  $('.status')?.classList.add('is-on');
  heroIntro();
};

(function runBoot() {
  let seen = false;
  try { seen = sessionStorage.getItem('cpp-boot') === '1'; } catch {}
  if (reduced || seen || !boot) { boot?.remove(); startPage(); return; }
  try { sessionStorage.setItem('cpp-boot', '1'); } catch {}

  document.body.classList.add('is-booting');
  const log = $('[data-boot-log]');
  const lines = [
    '<span class="hl">$</span> cpp boot --version 2.0.0',
    '  cargando módulos ............ <span class="ok">[ok]</span>',
    '  ├─ diseño',
    '  ├─ desarrollo',
    '  └─ automatización',
    '  ensamblando interfaz ........ <span class="ok">[ok]</span>',
    '<span class="ok">✓</span> listo. menos fricción, más negocio.'
  ];
  let i = 0, done = false;
  const finish = () => {
    if (done) return;
    done = true;
    boot.classList.add('is-done');
    startPage();
    setTimeout(() => boot.remove(), 900);
  };
  const step = () => {
    if (done) return;
    if (i < lines.length) {
      log.innerHTML += lines[i++] + '\n';
      setTimeout(step, 110 + Math.random() * 90);
    } else setTimeout(finish, 380);
  };
  step();
  addEventListener('keydown', finish, { once: true });
  boot.addEventListener('pointerdown', finish, { once: true });
})();

/* ── Hero ── */
function heroIntro() {
  $$('[data-hero-item]').forEach((el, i) => el.style.setProperty('--d', `${0.15 + i * 0.12}s`));
  const lines = $$('[data-hero-line]');
  lines.forEach((line, i) => {
    line.setAttribute('aria-hidden', 'true');
    setTimeout(() => scramble(line, line.textContent, 1100), i * 180);
  });
  if (reduced) { lines.forEach((l) => l.style.setProperty('--w', 88)); return; }

  // Ancho tipográfico: se estira al entrar y luego sigue al puntero
  let target = 88, current = 75;
  const t0 = performance.now();
  const hero = $('.hero');
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    target = 76 + ((e.clientX - r.left) / r.width) * 24;
  });
  hero.addEventListener('pointerleave', () => { target = 88; });
  const loop = (now) => {
    const intro = clamp((now - t0) / 1600, 0, 1);
    const introW = intro < 1 ? Math.min(100, 75 + Math.sin(intro * Math.PI) * 25 + intro * 13) : null;
    current = introW ?? lerp(current, target, 0.08);
    lines.forEach((l, i) => l.style.setProperty('--w', (current + (i ? -4 : 0)).toFixed(2)));
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ── Símbolo CPP en ASCII 3D (raymarching) ── */
(function asciiSymbol() {
  const canvas = $('[data-ascii]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const fpsEl = $('[data-fps]');
  const RAMP = ' .,:-=+*#%@';
  const COLORS = [
    ['#8a7234', '#e8c15a', '#fff1c4'], // oro
    ['#7f9489', '#eef2e6', '#ffffff'], // serigrafía
    ['#2f8f78', '#72f2d2', '#dcfff6']  // señal
  ];

  // Tres módulos: tapa, cara frontal y cara lateral. Cada uno con un corte que deja la "C" abierta.
  const T = 0.2;
  const modules = [
    { c: [0, 1 - T / 2, 0], h: [1, T / 2, 1], cut: { c: [-0.55, 1 - T / 2, -0.55], h: [0.47, 0.3, 0.47] }, from: [0, 3.2, 0] },
    { c: [0, -T / 2, -1 + T / 2], h: [1, 1 - T / 2, T / 2], cut: { c: [0.5, 0.25, -1 + T / 2], h: [0.52, 0.3, 0.3] }, from: [-3.2, 0, -1.5] },
    { c: [1 - T / 2, -T / 2, T / 2], h: [T / 2, 1 - T / 2, 1 - T / 2], cut: null, from: [3.2, -1.2, 0] }
  ];

  let W = 0, H = 0, cols = 0, rows = 0, cw = 0, chh = 0, dpr = 1;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    cols = Math.round(clamp(W / 9.2, 34, 64));
    cw = W / cols; chh = cw * 1.75; rows = Math.floor(H / chh);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `600 ${(chh * 0.78).toFixed(1)}px ui-monospace, Consolas, "Cascadia Code", monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  };

  const box = (px, py, pz, c, h) => {
    const qx = Math.abs(px - c[0]) - h[0], qy = Math.abs(py - c[1]) - h[1], qz = Math.abs(pz - c[2]) - h[2];
    const ox = Math.max(qx, 0), oy = Math.max(qy, 0), oz = Math.max(qz, 0);
    return Math.hypot(ox, oy, oz) + Math.min(Math.max(qx, qy, qz), 0);
  };

  let offs = modules.map(() => [0, 0, 0]);
  let hitId = -1;
  const scene = (x, y, z) => {
    let best = 1e9; hitId = -1;
    for (let i = 0; i < 3; i++) {
      const m = modules[i], o = offs[i];
      const px = x - o[0], py = y - o[1], pz = z - o[2];
      let d = box(px, py, pz, m.c, m.h);
      if (m.cut) d = Math.max(d, -box(px, py, pz, m.cut.c, m.cut.h));
      if (d < best) { best = d; hitId = i; }
    }
    return best;
  };

  let yaw = 0.7, pitch = -0.5, vel = 0.35, dragging = false, lastX = 0, lastY = 0;
  let lightX = -0.5, lightY = 0.8, hover = 0, hoverTarget = 0;
  const start = performance.now();

  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointercancel', () => { dragging = false; });
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    lightX = ((e.clientX - r.left) / r.width) * 2 - 1;
    lightY = 1 - ((e.clientY - r.top) / r.height) * 2;
    if (!dragging) return;
    vel = (e.clientX - lastX) * 0.9;
    yaw += (e.clientX - lastX) * 0.012;
    pitch = clamp(pitch + (e.clientY - lastY) * 0.008, -1.2, 0.3);
    lastX = e.clientX; lastY = e.clientY;
  });
  canvas.addEventListener('pointerenter', () => { hoverTarget = 1; });
  canvas.addEventListener('pointerleave', () => { hoverTarget = 0; lightX = -0.5; lightY = 0.8; });

  const render = (now) => {
    const t = (now - start) / 1000;
    // Ensamblaje escalonado
    modules.forEach((m, i) => {
      const p = reduced ? 1 : easeOut(clamp((t - 0.6 - i * 0.28) / 1.3, 0, 1));
      hover = lerp(hover, hoverTarget, 0.004);
      const spread = 1 + hover * 0.18;
      offs[i] = [m.from[0] * (1 - p) * spread + (m.c[0] * hover * 0.12), m.from[1] * (1 - p) * spread + (m.c[1] * hover * 0.12), m.from[2] * (1 - p) * spread + (m.c[2] * hover * 0.12)];
    });

    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    // del mundo al objeto: Rx(-pitch) y luego Ry(-yaw)
    const toObj = (x, y, z) => {
      const y1 = y * cp + z * sp, z1 = -y * sp + z * cp;
      return [x * cy - z1 * sy, y1, x * sy + z1 * cy];
    };
    const [lx0, ly0, lz0] = toObj(lightX * 1.4, lightY * 1.4 + 0.4, -1);
    const ll = Math.hypot(lx0, ly0, lz0);
    const lx = lx0 / ll, ly = ly0 / ll, lz = lz0 / ll;
    const ro = toObj(0, 0, -6.2);

    ctx.clearRect(0, 0, W, H);
    const aspect = (cols * cw) / (rows * chh);
    let lastStyle = '';
    for (let j = 0; j < rows; j++) {
      const v = 1 - ((j + 0.5) / rows) * 2;
      for (let i = 0; i < cols; i++) {
        const u = (((i + 0.5) / cols) * 2 - 1) * aspect;
        let [dx, dy, dz] = toObj(u * 0.35, (v - 0.1) * 0.36, 1);
        const dl = Math.hypot(dx, dy, dz); dx /= dl; dy /= dl; dz /= dl;
        let dist = 0, hit = -1;
        for (let s = 0; s < 46; s++) {
          const x = ro[0] + dx * dist, y = ro[1] + dy * dist, z = ro[2] + dz * dist;
          const d = scene(x, y, z);
          if (d < 0.004) { hit = hitId; break; }
          dist += d;
          if (dist > 11) break;
        }
        const X = i * cw + cw / 2, Y = j * chh + chh / 2;
        if (hit < 0) {
          // campo de fondo: bits que respiran
          const f = Math.sin(i * 0.35 + t * 0.9) + Math.cos(j * 0.5 - t * 0.6) + Math.sin((i + j) * 0.12 + t * 0.4);
          if (f > 2.35) {
            const style = 'rgba(114,242,210,.16)';
            if (style !== lastStyle) { ctx.fillStyle = style; lastStyle = style; }
            ctx.fillText((i * 7 + j * 3) % 2 ? '1' : '0', X, Y);
          }
          continue;
        }
        const px = ro[0] + dx * dist, py = ro[1] + dy * dist, pz = ro[2] + dz * dist;
        const e = 0.01;
        const nx = scene(px + e, py, pz) - scene(px - e, py, pz);
        const ny = scene(px, py + e, pz) - scene(px, py - e, pz);
        const nz = scene(px, py, pz + e) - scene(px, py, pz - e);
        const nl = Math.hypot(nx, ny, nz) || 1;
        const diff = Math.max(0, (nx * lx + ny * ly + nz * lz) / nl);
        const rim = Math.pow(1 - Math.abs((nx * dx + ny * dy + nz * dz) / nl), 3) * 0.35;
        const depth = clamp(1.25 - (dist - 4.6) * 0.3, 0.55, 1.15);
        const dither = (((i * 3 + j * 5) % 4) - 1.5) * 0.045 + Math.sin(i * 0.5 + j * 0.3 + t * 2) * 0.03;
        const lum = clamp((0.24 + diff * 0.72 + rim) * depth + dither, 0, 1);
        const ch = RAMP[Math.min(RAMP.length - 1, 1 + ((lum * (RAMP.length - 2)) | 0))];
        const shade = lum < 0.38 ? 0 : lum < 0.85 ? 1 : 2;
        const style = COLORS[hit][shade];
        if (style !== lastStyle) { ctx.fillStyle = style; lastStyle = style; }
        ctx.fillText(ch, X, Y);
      }
    }
  };

  let running = false, raf = 0, last = 0, frames = 0, fpsT = 0;
  const loop = (now) => {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!dragging) { vel = lerp(vel, 0.35, 0.02); yaw += vel * dt; }
    render(now);
    frames++;
    if (now - fpsT > 500) { fpsEl.textContent = `ascii · ${String(Math.round(frames * 1000 / (now - fpsT))).padStart(2, '0')} fps`; frames = 0; fpsT = now; }
  };

  resize();
  addEventListener('resize', () => { resize(); if (reduced) render(performance.now() + 5000); });
  if (reduced) { yaw = 0.75; render(start + 5000); fpsEl.textContent = 'ascii · estático'; return; }
  onVisible(canvas, (vis) => {
    if (vis && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
    else if (!vis) { running = false; cancelAnimationFrame(raf); }
  }, { threshold: 0 });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { running = false; cancelAnimationFrame(raf); } else if (!running) { running = true; raf = requestAnimationFrame(loop); } });
})();

/* ── Apariciones y titulares ── */
$$('.sec-head, .contact-copy, .services-foot, .work-grid, .team-grid, .term, .foot-cta').forEach((group) => {
  [...group.children].forEach((el, i) => { el.setAttribute('data-reveal', ''); el.style.setProperty('--d', `${i * 0.08}s`); });
});
$$('.ide, .editor-form, .gitlog').forEach((el) => el.setAttribute('data-reveal', ''));
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    revealIO.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal]').forEach((el) => revealIO.observe(el));

$$('[data-scramble-in]').forEach((h) => {
  const text = h.textContent;
  h.setAttribute('aria-label', text);
  const io = onVisible(h, (vis) => { if (vis) { scramble(h, text, 1000); io.disconnect(); } }, { threshold: 0.5 });
});

$$('[data-scramble]').forEach((a) => {
  const text = a.textContent;
  a.addEventListener('pointerenter', () => scramble(a, text, 380));
});

/* ── Manifiesto palabra por palabra ── */
const manifesto = $('[data-words]');
let manifestoWords = [];
if (manifesto) {
  manifesto.setAttribute('aria-label', manifesto.textContent);
  manifesto.innerHTML = manifesto.textContent.split(' ').map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
  manifestoWords = $$('.w', manifesto);
  if (reduced) manifestoWords.forEach((w) => w.classList.add('is-on'));
}

/* ── Diff ── */
const diff = $('[data-diff]');
if (diff) {
  $$('.diff-lines li', diff).forEach((li, i) => li.style.setProperty('--d', `${i * 0.11}s`));
  const io = onVisible(diff, (vis) => { if (vis) { diff.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.25 });
}

/* ── Servicios como editor ── */
const SERVICES = [
  { file: 'landing.html', id: 'landing', kind: 'landing', color: '#e8c15a', title: 'Landing pages orientadas a conversión', desc: 'Una página enfocada en presentar tu oferta y convertir visitas en oportunidades.', list: ['Mensaje y jerarquía claros', 'Diseño responsive', 'Formulario de contacto'], price: 280, form: 'Landing page' },
  { file: 'corporativa.astro', id: 'corporativa', kind: 'sitio', color: '#eef2e6', title: 'Páginas web corporativas', desc: 'Una presencia profesional para explicar quién eres, qué haces y cómo contactarte.', list: ['Estructura de contenidos', 'SEO básico', 'Secciones fáciles de actualizar'], price: 480, form: 'Página web corporativa' },
  { file: 'tienda.tsx', id: 'tienda', kind: 'ecommerce', color: '#72f2d2', title: 'Tiendas e-commerce', desc: 'Una tienda clara y confiable para mostrar productos, recibir pedidos y vender online.', list: ['Catálogo y carrito', 'Flujo de compra optimizado', 'Integraciones de pago'], price: 850, form: 'Tienda e-commerce' },
  { file: 'app-a-medida.ts', id: 'appAMedida', kind: 'aplicacion', color: '#ff8f8f', title: 'Aplicaciones web a medida', desc: 'Herramientas digitales creadas alrededor de la operación real de tu empresa.', list: ['Flujos personalizados', 'Accesos por usuario', 'Arquitectura escalable'], price: 1200, form: 'Aplicación web a medida' },
  { file: 'reservas.ts', id: 'reservas', kind: 'reservas', color: '#b9e27a', title: 'Sistemas de reservas online', desc: 'Recibe reservas todo el día y administra la disponibilidad desde un panel central.', list: ['Calendario disponible', 'Panel de gestión', 'Confirmaciones automáticas'], price: 950, form: 'Sistema de reservas' },
  { file: 'catalogo.json', id: 'catalogo', kind: 'catalogo', color: '#9db8ac', title: 'Catálogos digitales', desc: 'Presenta productos o servicios en un formato visual, ordenado y fácil de compartir.', list: ['Búsqueda y categorías', 'Consulta rápida', 'Actualización sencilla'], price: 380, form: 'Catálogo digital' },
  { file: 'automatizar.py', id: 'automatizacion', kind: 'automatizacion', color: '#f5d77f', title: 'Automatización de procesos', desc: 'Conecta tareas repetitivas para que la información avance sin trabajo manual.', list: ['Menos errores', 'Más tiempo disponible', 'Procesos consistentes'], price: 320, form: 'Automatización de procesos' }
];

const codeFor = (s) => [
  [['c', `// ${s.title}`]],
  [['k', 'import'], ['', ' { cpp } '], ['k', 'from'], ['s', ' "@cpp/estudio"'], ['p', ';']],
  [],
  [['k', 'export const '], ['', s.id], ['p', ' = '], ['', 'cpp.'], ['f', s.kind], ['p', '({']],
  [['', '  objetivo'], ['p', ': '], ['s', `"${s.desc.split(' ').slice(0, 5).join(' ')}…"`], ['p', ',']],
  [['', '  incluye'], ['p', ': [']],
  ...s.list.map((item) => [['s', `    "${item}"`], ['p', ',']]),
  [['p', '  ],']],
  [['', '  desdeUSD'], ['p', ': '], ['n', s.price.toLocaleString('en-US').replace(',', '_')], ['p', ',']],
  [['', '  soporte'], ['p', ': '], ['k', 'true'], ['p', ',']],
  [['p', '});']]
];

(function servicesIDE() {
  const files = $('[data-files]');
  if (!files) return;
  const code = $('[data-code]');
  const panel = $('[data-panel]');
  const priceEl = $('[data-s-price]');
  let typingRaf = 0, priceRaf = 0, current = -1;

  files.innerHTML = SERVICES.map((s, i) => `<button class="file" type="button" role="tab" id="tab-${s.id}" aria-controls="service-panel" aria-selected="false" tabindex="-1" style="--c:${s.color}"><span class="dot" aria-hidden="true"></span>${s.file}</button>`).join('');
  const tabs = $$('.file', files);

  const renderCode = (lines, chars) => {
    let left = chars, html = '';
    for (let n = 0; n < lines.length; n++) {
      let line = '', done = true;
      for (const [cls, txt] of lines[n]) {
        const part = txt.slice(0, Math.max(left, 0));
        left -= txt.length;
        if (part.length < txt.length) done = false;
        if (!part) break;
        const safe = part.replace(/&/g, '&amp;').replace(/</g, '&lt;');
        line += cls ? `<span class="${cls}">${safe}</span>` : safe;
      }
      const last = !done || n === lines.length - 1;
      html += `<span class="ln${last ? ' typing' : ''}" data-n="${n + 1}">${line}</span>`;
      if (!done) break;
    }
    code.innerHTML = html;
  };

  const select = (i, focus = false) => {
    if (i === current) return;
    current = i;
    const s = SERVICES[i];
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tabs[i].id);
    if (focus) tabs[i].focus();
    $('[data-tab-name]').textContent = s.file;
    $('[data-s-title]').textContent = s.title;
    $('[data-s-desc]').textContent = s.desc;
    $('[data-s-list]').innerHTML = s.list.map((x) => `<li>${x}</li>`).join('');
    $('[data-s-cta]').dataset.servicePick = s.form;
    panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap');

    const lines = codeFor(s);
    const total = lines.reduce((a, segs) => a + segs.reduce((b, [, t]) => b + t.length, 0), 0);
    cancelAnimationFrame(typingRaf); cancelAnimationFrame(priceRaf);
    if (reduced) { renderCode(lines, total); priceEl.textContent = s.price.toLocaleString('en-US'); return; }
    const t0 = performance.now();
    const typeTick = (now) => {
      const chars = Math.floor((now - t0) / 1000 * 520);
      renderCode(lines, chars);
      if (chars < total) typingRaf = requestAnimationFrame(typeTick);
    };
    typingRaf = requestAnimationFrame(typeTick);
    const from = Number(priceEl.textContent.replace(/,/g, '')) || 0;
    const priceTick = (now) => {
      const p = easeOut(clamp((now - t0) / 700, 0, 1));
      priceEl.textContent = Math.round(lerp(from, s.price, p)).toLocaleString('en-US');
      if (p < 1) priceRaf = requestAnimationFrame(priceTick);
    };
    priceRaf = requestAnimationFrame(priceTick);
  };

  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
  files.addEventListener('keydown', (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) { e.preventDefault(); select((current + keys[e.key] + SERVICES.length) % SERVICES.length, true); }
    if (e.key === 'Home') { e.preventDefault(); select(0, true); }
    if (e.key === 'End') { e.preventDefault(); select(SERVICES.length - 1, true); }
  });

  // Empieza a escribir cuando el editor entra en pantalla
  const io = onVisible($('[data-ide]'), (vis) => { if (vis) { select(0); io.disconnect(); } }, { threshold: 0.3 });
})();

/* ── Elegir servicio desde cualquier enlace ── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-service-pick]');
  if (!link) return;
  const select = $('#service');
  if (select) { select.value = link.dataset.servicePick; select.dispatchEvent(new Event('input', { bubbles: true })); }
});

/* ── Git log ── */
const gitlog = $('[data-gitlog]');
const gitPath = $('[data-git-path]');
const commits = $$('[data-commit]');
let gitLen = 0, gitNodesY = [];
const buildGit = () => {
  if (!gitlog) return;
  const base = gitlog.getBoundingClientRect().top;
  gitNodesY = commits.map((c) => c.querySelector('.node').getBoundingClientRect().top - base + 9);
  const [y1, y2, y3, y4] = gitNodesY;
  const mid = (y2 + y3) / 2;
  const d = `M20 ${y1} L20 ${y2} C20 ${y2 + 30} 36 ${y2 + 24} 36 ${Math.min(mid, y2 + 54)} L36 ${Math.max(mid, y3 - 54)} C36 ${y3 - 24} 20 ${y3 - 30} 20 ${y3} L20 ${y4}`;
  gitPath.setAttribute('d', d);
  gitLen = gitPath.getTotalLength();
  gitPath.style.strokeDasharray = gitLen;
};

/* ── Mockups vivos ── */
(function mocks() {
  // Contadores
  $$('[data-count]').forEach((el) => {
    const io = onVisible(el, (vis) => {
      if (!vis) return;
      io.disconnect();
      const end = Number(el.dataset.count), suffix = el.dataset.suffix || '', t0 = performance.now();
      const tick = (now) => {
        const p = reduced ? 1 : easeOut(clamp((now - t0) / 1600, 0, 1));
        el.textContent = Math.round(end * p) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  });

  // Barras
  const bars = $$('.md-chart i');
  const shuffleBars = () => bars.forEach((b, i) => { b.style.setProperty('--h', `${25 + Math.random() * 70}%`); b.style.setProperty('--d', `${i * 0.06}s`); });
  shuffleBars();

  const loops = [];
  const every = (el, ms, fn) => {
    let id = 0;
    onVisible(el, (vis) => { clearInterval(id); if (vis && !reduced) { fn(); id = setInterval(fn, ms); } }, { threshold: 0.3 });
    loops.push(() => clearInterval(id));
  };

  const dash = $('.mock-dash');
  if (dash) every(dash, 3200, () => {
    shuffleBars();
    const st = $$('.st', dash);
    const states = [['listo', 'en curso', 'auto'], ['en curso', 'auto', 'listo'], ['auto', 'listo', 'en curso']];
    const pick = states[(Math.random() * states.length) | 0];
    st.forEach((s, i) => { s.textContent = pick[i]; });
  });

  // Tienda
  const shop = $('.mock-shop');
  if (shop) {
    const items = $$('.ms-item', shop), cart = $('[data-cart]', shop), fly = $('[data-fly]', shop);
    let count = 0;
    every(shop, 2400, () => {
      const item = items[(Math.random() * items.length) | 0];
      items.forEach((it) => it.classList.toggle('is-pick', it === item));
      const sr = shop.getBoundingClientRect(), ir = item.getBoundingClientRect(), cr = cart.getBoundingClientRect();
      const x0 = ir.left - sr.left + ir.width / 2, y0 = ir.top - sr.top + ir.height / 2;
      const x1 = cr.left - sr.left + cr.width / 2, y1 = cr.top - sr.top + cr.height / 2;
      fly.animate([
        { opacity: 1, transform: `translate(${x0}px, ${y0}px) scale(1)` },
        { opacity: 1, transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 40}px) scale(1.3)`, offset: 0.5 },
        { opacity: 0, transform: `translate(${x1}px, ${y1}px) scale(.4)` }
      ], { duration: 800, easing: 'cubic-bezier(.65,0,.35,1)' }).onfinish = () => {
        count = count >= 9 ? 1 : count + 1;
        cart.textContent = count;
        cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump');
        setTimeout(() => item.classList.remove('is-pick'), 600);
      };
    });
  }

  // Calendario
  const cal = $('[data-cal]');
  if (cal) {
    cal.innerHTML = Array.from({ length: 28 }, (_, i) => `<span>${i + 1}</span>`).join('');
    const cells = $$('span', cal), toast = $('[data-toast]');
    const seed = () => cells.forEach((c) => { c.className = Math.random() < 0.3 ? 'is-busy' : ''; });
    seed();
    every(cal.parentElement, 2600, () => {
      const free = cells.filter((c) => !c.className);
      if (free.length < 5) seed();
      const cell = free[(Math.random() * free.length) | 0] || cells[0];
      cell.className = 'is-new';
      const hour = 9 + ((Math.random() * 11) | 0);
      toast.innerHTML = `<span class="ok">✓</span> Reserva confirmada · día ${cell.textContent}, ${hour}:${Math.random() < 0.5 ? '00' : '30'}`;
      toast.classList.add('is-show');
      setTimeout(() => { toast.classList.remove('is-show'); cell.className = 'is-busy'; }, 1700);
    });
  }
})();

/* ── Inclinación, luz y botones magnéticos ── */
if (finePointer && !reduced) {
  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--ry', `${(x - 0.5) * 6}deg`);
      el.style.setProperty('--rx', `${(0.5 - y) * 5}deg`);
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  $$('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.22}px`);
      btn.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
    });
    btn.addEventListener('pointerleave', () => { btn.style.setProperty('--mx', '0px'); btn.style.setProperty('--my', '0px'); });
  });

  // Cursor tipo caret
  const cursor = $('[data-cursor]');
  let cx = -100, cy = -100, tx = -100, ty = -100;
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    cursor.classList.add('is-on');
    const target = e.target.closest('a, button, summary, [role="tab"], label, select');
    cursor.classList.toggle('is-link', !!target);
    cursor.style.visibility = e.target.closest('input, textarea, canvas') ? 'hidden' : 'visible';
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  const follow = () => {
    cx = lerp(cx, tx, 0.22); cy = lerp(cy, ty, 0.22);
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
}

/* ── Scroll: cabecera, riel, estado, manifiesto, git, footer ── */
const topBar = $('[data-top]');
const rail = $('[data-rail]');
const railSignal = $('[data-rail-signal]');
const statusFile = $('[data-status-file]');
const statusLn = $('[data-status-ln]');
const navLinks = $$('.nav a');
const sections = $$('[data-section]');
const footWord = $('[data-foot-word]');
const foot = $('.foot');
let railPads = [], railH = 0, lastY = 0, pointerCol = 1, currentFile = '';

const buildRail = () => {
  if (!rail) return;
  const main = $('main');
  railH = main.offsetTop + main.offsetHeight;
  rail.style.height = `${railH}px`;
  railPads.forEach((p) => p.el.remove());
  railPads = sections.filter((s) => s.closest('main')).map((s) => {
    const el = document.createElement('span');
    el.className = 'rail-pad';
    const y = s.getBoundingClientRect().top + scrollY + 60;
    el.style.top = `${y}px`;
    rail.appendChild(el);
    return { el, y };
  });
};

addEventListener('pointermove', (e) => { pointerCol = Math.floor(e.clientX / 9) + 1; }, { passive: true });
if (footWord && finePointer && !reduced) {
  foot.addEventListener('pointermove', (e) => {
    footWord.style.setProperty('--fw', (75 + (e.clientX / innerWidth) * 37.5).toFixed(1));
  });
}

let ticking = false;
const onScroll = () => {
  ticking = false;
  const y = scrollY, vh = innerHeight;

  topBar.classList.toggle('is-scrolled', y > 20);
  topBar.classList.toggle('is-hidden', y > 500 && y > lastY + 4 && !$('[data-mobile-menu]').classList.contains('is-open'));
  if (y < lastY - 4) topBar.classList.remove('is-hidden');
  lastY = y;

  // Riel de señal
  if (railH) {
    const sigY = clamp(y + vh * 0.55, 0, railH - 90);
    railSignal.style.transform = `translateY(${sigY}px)`;
    railPads.forEach((p) => p.el.classList.toggle('is-lit', sigY + 90 > p.y));
  }

  // Archivo actual y navegación activa
  const mid = vh * 0.45;
  const active = sections.find((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
  if (active && active.dataset.section !== currentFile) {
    currentFile = active.dataset.section;
    statusFile.textContent = currentFile;
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${active.id}`));
  }
  statusLn.textContent = `Ln ${Math.floor(y / 24) + 1}, Col ${pointerCol}`;

  // Manifiesto
  if (manifestoWords.length && !reduced) {
    const r = manifesto.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
    const on = Math.round(p * manifestoWords.length);
    manifestoWords.forEach((w, i) => w.classList.toggle('is-on', i < on));
  }

  // Git log
  if (gitLen) {
    const r = gitlog.getBoundingClientRect();
    const drawn = clamp(vh * 0.6 - r.top, 0, r.height);
    const reach = gitNodesY.length ? clamp(drawn / gitNodesY[gitNodesY.length - 1], 0, 1) : 0;
    gitPath.style.strokeDashoffset = reduced ? 0 : gitLen * (1 - reach);
    commits.forEach((c, i) => c.classList.toggle('is-lit', reduced || drawn >= gitNodesY[i] - 4));
  }

  // Footer
  if (footWord) {
    const r = footWord.getBoundingClientRect();
    const p = clamp((vh - r.top) / (r.height + vh * 0.1), 0, 1);
    footWord.style.setProperty('--fill', `${Math.round(p * 100)}%`);
  }
};
const requestScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
addEventListener('scroll', requestScroll, { passive: true });
addEventListener('pointermove', requestScroll, { passive: true });
const layout = () => { buildRail(); buildGit(); onScroll(); };
addEventListener('resize', layout);
addEventListener('load', layout);
document.fonts?.ready.then(layout);
layout();

/* ── Menú móvil ── */
(function mobileMenu() {
  const btn = $('[data-menu-toggle]'), menu = $('[data-mobile-menu]');
  if (!btn) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.hidden = !open;
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) topBar.classList.remove('is-hidden');
  };
  btn.addEventListener('click', () => set(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
})();

/* ── Paleta de comandos ── */
(function palette() {
  const root = $('[data-palette]');
  if (!root) return;
  const input = $('[data-palette-input]', root), list = $('[data-palette-list]', root);
  const go = (hash) => () => { location.hash = ''; $(hash)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
  const pick = (service) => () => { $('#service').value = service; go('#contacto')(); setTimeout(() => $('#name').focus({ preventScroll: true }), 700); };
  const commands = [
    { label: 'Ir al inicio', hint: 'inicio', run: go('#inicio') },
    { label: 'Ver servicios y precios', hint: 'servicios', run: go('#servicios') },
    { label: 'Ver el proceso de trabajo', hint: 'proceso', run: go('#proceso') },
    { label: 'Ver proyectos demostrativos', hint: 'proyectos', run: go('#proyectos') },
    { label: 'Conocer al equipo', hint: 'equipo', run: go('#equipo') },
    { label: 'Leer preguntas frecuentes', hint: 'preguntas', run: go('#preguntas') },
    { label: 'Pedir cotización', hint: 'contacto', run: pick('') },
    ...SERVICES.map((s) => ({ label: `Cotizar: ${s.title}`, hint: s.file, run: pick(s.form) }))
  ];
  let filtered = commands, idx = 0, opener = null;

  const render = () => {
    list.innerHTML = filtered.map((c, i) => `<li role="option" id="cmd-${i}" aria-selected="${i === idx}"><span>${c.label}</span><small>${c.hint}</small></li>`).join('') || '<li aria-disabled="true"><span>Sin resultados</span></li>';
    input.setAttribute('aria-activedescendant', filtered.length ? `cmd-${idx}` : '');
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  };
  const open = () => { opener = document.activeElement; root.hidden = false; input.value = ''; filtered = commands; idx = 0; render(); input.focus(); };
  const close = () => { root.hidden = true; opener?.focus?.(); };
  const run = (i) => { const c = filtered[i]; if (!c) return; close(); c.run(); };

  $$('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
  addEventListener('keydown', (e) => {
    const typing = e.target.closest('input, textarea, select');
    if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing && root.hidden)) {
      e.preventDefault(); root.hidden ? open() : close();
    }
  });
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    filtered = commands.filter((c) => (c.label + ' ' + c.hint).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
    idx = 0; render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); idx = (idx + 1) % Math.max(filtered.length, 1); render(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); idx = (idx - 1 + filtered.length) % Math.max(filtered.length, 1); render(); }
    if (e.key === 'Enter') { e.preventDefault(); run(idx); }
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') e.preventDefault();
  });
  list.addEventListener('click', (e) => { const li = e.target.closest('li[id]'); if (li) run(Number(li.id.split('-')[1])); });
  root.addEventListener('pointerdown', (e) => { if (e.target === root) close(); });
})();

/* ── Preguntas: la respuesta se escribe ── */
$$('[data-faq]').forEach((d) => {
  const p = $('p', d), text = p.textContent;
  d.addEventListener('toggle', () => {
    if (!d.open || reduced) return;
    const t0 = performance.now();
    const tick = (now) => {
      const n = Math.floor((now - t0) / 1000 * 900);
      p.textContent = text.slice(0, n);
      if (n < text.length && d.open) requestAnimationFrame(tick); else p.textContent = text;
    };
    requestAnimationFrame(tick);
  });
});

/* ── Formulario ── */
(function form() {
  const form = $('[data-form]');
  if (!form) return;
  const startedAt = Date.now();
  const status = $('[data-status]', form);
  const state = $('[data-form-state]', form);
  const button = $('button[type="submit"]', form);
  const label = $('span', button);
  const messages = {
    name: 'Escribe tu nombre.',
    email: 'Escribe un correo válido, por ejemplo nombre@empresa.com.',
    phone: 'Escribe un teléfono o WhatsApp.',
    service: 'Elige el servicio que necesitas.',
    message: 'Cuéntanos un poco más: al menos 20 caracteres.',
    privacy: 'Acepta la política de privacidad para enviar la solicitud.'
  };

  const check = (field) => {
    const err = $(`#${field.id}-error`);
    const ok = field.validity.valid;
    if (err) err.textContent = ok ? '' : messages[field.id];
    field.setAttribute('aria-invalid', String(!ok));
    if (!ok && err) field.setAttribute('aria-describedby', err.id); else field.removeAttribute('aria-describedby');
    return ok;
  };

  $$('[required]', form).forEach((f) => {
    f.addEventListener('blur', () => check(f));
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') check(f); });
  });
  form.addEventListener('input', () => { state.textContent = 'sin guardar'; state.classList.add('is-dirty'); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    const fields = $$('[required]', form);
    if (!fields.map(check).every(Boolean)) {
      status.textContent = 'Revisa los campos marcados.';
      status.classList.add('error');
      $('[aria-invalid="true"]', form)?.focus();
      return;
    }
    if ($('#website').value || Date.now() - startedAt < 2500) {
      status.textContent = 'No se pudo validar el envío. Espera unos segundos e inténtalo otra vez.';
      status.classList.add('error');
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    delete data.website;

    if (!CONFIG.endpoint && CONFIG.whatsapp) {
      const text = `Hola CPP, soy ${data.name}${data.company ? ` de ${data.company}` : ''}.\nServicio: ${data.service}\nPresupuesto: ${data.budget}\nCorreo: ${data.email}\nTeléfono: ${data.phone}\n\n${data.message}`;
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      status.textContent = 'Abrimos WhatsApp con tu solicitud lista para enviar.';
      status.classList.add('success');
      return;
    }
    if (!CONFIG.endpoint) {
      console.warn('[CPP] Configura CONFIG.endpoint o CONFIG.whatsapp en script.js para recibir solicitudes.');
      status.innerHTML = 'El envío en línea aún no está activo. Escríbenos por <a class="link" href="#equipo">LinkedIn</a> mientras tanto.';
      status.classList.add('error');
      return;
    }

    button.disabled = true;
    label.textContent = 'Enviando…';
    try {
      const res = await fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      state.textContent = 'enviado'; state.classList.remove('is-dirty');
      status.textContent = 'Solicitud enviada. Te respondemos en menos de 24 horas hábiles.';
      status.classList.add('success');
    } catch {
      status.textContent = 'No se pudo enviar la solicitud. Revisa tu conexión e inténtalo otra vez.';
      status.classList.add('error');
    } finally {
      button.disabled = false;
      label.textContent = 'Enviar solicitud';
    }
  });
})();

$('[data-year]').textContent = new Date().getFullYear();
