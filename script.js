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
const finePointer = matchMedia('(pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const GLYPHS = '01<>/{}[]=+*#$_;:';
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} }
};

const onVisible = (el, cb, opts = { threshold: 0.2 }) => {
  const io = new IntersectionObserver((entries) => entries.forEach((e) => cb(e.isIntersecting, e)), opts);
  io.observe(el);
  return io;
};

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

function applyLang(next, { animate = false } = {}) {
  lang = next;
  root.lang = lang;
  store.set('cpp-lang', lang);

  $$('[data-i18n]').forEach((el) => {
    const text = staticText(el.dataset.i18n);
    if (el.matches('[data-scramble-in], [data-scramble], [data-hero-line]')) {
      cancelAnimationFrame(el._scr);
      el.dataset.text = text;
      if (el.matches('[data-scramble-in]')) el.setAttribute('aria-label', text);
      if (animate && el.dataset.scrambled !== undefined) { scramble(el, text, 700); return; }
    }
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
  $('[data-status-lang]') && ($('[data-status-lang]').textContent = t('lang.name'));
  $$('[data-lang-opt]').forEach((o) => o.classList.toggle('is-on', o.dataset.langOpt === lang));
  syncThemeLabel();
  langListeners.forEach((fn) => fn(lang));
}

/* ════════════════════════════════════════════════════════════
   Tema
   ════════════════════════════════════════════════════════════ */
const themeListeners = [];
const onTheme = (fn) => themeListeners.push(fn);
function syncThemeLabel() {
  const dark = root.dataset.theme === 'dark';
  const btn = $('[data-theme-toggle]');
  if (btn) { btn.setAttribute('aria-label', t(dark ? 'theme.toLight' : 'theme.toDark')); btn.setAttribute('aria-pressed', String(dark)); }
  $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#050f17' : '#f7f8f8');
}
function setTheme(theme, origin) {
  const apply = () => {
    root.dataset.theme = theme;
    store.set('cpp-theme', theme);
    syncThemeLabel();
    themeListeners.forEach((fn) => fn(theme));
  };
  if (!document.startViewTransition || reduced) { apply(); return; }
  // Revelado circular desde el botón
  const x = origin?.x ?? innerWidth - 60, y = origin?.y ?? 30;
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  document.startViewTransition(apply);
}
const themeBtn = $('[data-theme-toggle]');
themeBtn?.addEventListener('click', (e) => {
  const r = themeBtn.getBoundingClientRect();
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', { x: e.clientX || r.left + r.width / 2, y: e.clientY || r.top + r.height / 2 });
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!store.get('cpp-theme')) setTheme(e.matches ? 'dark' : 'light');
});
$('[data-lang-toggle]')?.addEventListener('click', () => applyLang(lang === 'es' ? 'en' : 'es', { animate: true }));

/* ── Texto que se decodifica ── */
function scramble(el, text = el.dataset.text || el.textContent, duration = 900) {
  el.dataset.text = text;
  el.dataset.scrambled = '';
  if (reduced) { el.textContent = text; return; }
  const start = performance.now();
  const len = text.length;
  cancelAnimationFrame(el._scr);
  const tick = (now) => {
    const p = clamp((now - start) / duration, 0, 1);
    const fixed = Math.floor(easeOut(p) * len);
    let out = text.slice(0, fixed);
    for (let i = fixed; i < len; i++) out += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
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
  document.body.classList.add('is-ready');
  $('.status')?.classList.add('is-on');
  heroIntro();
};

function runBoot() {
  let seen = false;
  try { seen = sessionStorage.getItem('cpp-boot') === '1'; } catch {}
  if (reduced || seen || !boot) { boot?.remove(); startPage(); return; }
  try { sessionStorage.setItem('cpp-boot', '1'); } catch {}

  document.body.classList.add('is-booting');
  const log = $('[data-boot-log]');
  const [loading, design, dev, auto, assembling, ready] = t('boot');
  const lines = [
    '<span class="hl">$</span> cpp boot --version 2.0.0',
    `  ${loading.padEnd(28, '.')} <span class="ok">[ok]</span>`,
    `  ├─ ${design}`,
    `  ├─ ${dev}`,
    `  └─ ${auto}`,
    `  ${assembling.padEnd(28, '.')} <span class="ok">[ok]</span>`,
    `<span class="ok">✓</span> ${ready}`
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
    if (i < lines.length) { log.innerHTML += lines[i++] + '\n'; setTimeout(step, 110 + Math.random() * 90); }
    else setTimeout(finish, 380);
  };
  step();
  addEventListener('keydown', finish, { once: true });
  boot.addEventListener('pointerdown', finish, { once: true });
}

/* ── Hero ── */
function heroIntro() {
  $$('[data-hero-item]').forEach((el, i) => el.style.setProperty('--d', `${0.15 + i * 0.12}s`));
  const lines = $$('[data-hero-line]');
  lines.forEach((line, i) => {
    line.setAttribute('aria-hidden', 'true');
    setTimeout(() => scramble(line, line.dataset.text || line.textContent, 1100), i * 180);
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

/* ════════════════════════════════════════════════════════════
   Símbolo CPP en ASCII 3D (raymarching)
   ════════════════════════════════════════════════════════════ */
(function asciiSymbol() {
  const canvas = $('[data-ascii]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const fpsEl = $('[data-fps]');
  const RAMP = ' .,:-=+*#%@';
  let COLORS = [], BITS = '';

  const rgba = (hex, a) => {
    const n = parseInt(hex.trim().replace('#', ''), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  const readColors = () => {
    const css = getComputedStyle(root);
    const light = root.dataset.theme !== 'dark';
    const shades = light ? [0.5, 0.82, 1] : [0.42, 0.8, 1];
    COLORS = ['--accent', '--text', '--steel'].map((v) => shades.map((a) => rgba(css.getPropertyValue(v), a)));
    BITS = rgba(css.getPropertyValue('--accent'), light ? 0.2 : 0.22);
  };

  // Tres módulos: tapa, cara frontal y cara lateral. Los cortes dejan la "C" abierta.
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

  const offs = modules.map(() => [0, 0, 0]);
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
    const time = (now - start) / 1000;
    modules.forEach((m, i) => {
      const p = reduced ? 1 : easeOut(clamp((time - 0.6 - i * 0.28) / 1.3, 0, 1));
      hover = lerp(hover, hoverTarget, 0.004);
      const spread = 1 + hover * 0.18;
      for (let k = 0; k < 3; k++) offs[i][k] = m.from[k] * (1 - p) * spread + m.c[k] * hover * 0.12;
    });

    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
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
          const d = scene(ro[0] + dx * dist, ro[1] + dy * dist, ro[2] + dz * dist);
          if (d < 0.004) { hit = hitId; break; }
          dist += d;
          if (dist > 11) break;
        }
        const X = i * cw + cw / 2, Y = j * chh + chh / 2;
        if (hit < 0) {
          const f = Math.sin(i * 0.35 + time * 0.9) + Math.cos(j * 0.5 - time * 0.6) + Math.sin((i + j) * 0.12 + time * 0.4);
          if (f > 2.35) {
            if (BITS !== lastStyle) { ctx.fillStyle = BITS; lastStyle = BITS; }
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
        const dither = (((i * 3 + j * 5) % 4) - 1.5) * 0.045 + Math.sin(i * 0.5 + j * 0.3 + time * 2) * 0.03;
        const lum = clamp((0.24 + diff * 0.72 + rim) * depth + dither, 0, 1);
        const ch = RAMP[Math.min(RAMP.length - 1, 1 + ((lum * (RAMP.length - 2)) | 0))];
        const style = COLORS[hit][lum < 0.38 ? 0 : lum < 0.85 ? 1 : 2];
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

  readColors();
  resize();
  const still = () => render(start + 5000);
  onTheme(() => { readColors(); if (reduced) still(); });
  addEventListener('resize', () => { resize(); if (reduced) still(); });
  if (reduced) {
    yaw = 0.75; still();
    fpsEl.textContent = t('fps.static');
    onLang(() => { fpsEl.textContent = t('fps.static'); });
    return;
  }
  onVisible(canvas, (vis) => {
    if (vis && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
    else if (!vis) { running = false; cancelAnimationFrame(raf); }
  }, { threshold: 0 });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else if (!running) { running = true; raf = requestAnimationFrame(loop); }
  });
})();

/* ── Manifiesto palabra por palabra ── */
const manifesto = $('[data-words]');
let manifestoWords = [];
function splitWords(el, text) {
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(' ').map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
  manifestoWords = $$('.w', el);
  if (reduced) manifestoWords.forEach((w) => w.classList.add('is-on'));
  else requestScroll?.();
}

/* ════════════════════════════════════════════════════════════
   Servicios como editor
   ════════════════════════════════════════════════════════════ */
const SERVICES = I18N.services;
const COLORS_BY_SERVICE = ['var(--accent)', 'var(--text)', 'var(--live)', 'var(--danger)', 'var(--accent-hi)', 'var(--steel)', 'var(--text-2)'];

const codeFor = (s) => {
  const L = pick(s);
  return [
    [['c', `// ${L.title}`]],
    [['k', 'import'], ['', ' { cpp } '], ['k', 'from'], ['s', ` "${t('code.import')}"`], ['p', ';']],
    [],
    [['k', 'export const '], ['', s.key], ['p', ' = '], ['', 'cpp.'], ['f', s.kind], ['p', '({']],
    [['', `  ${t('code.goal')}`], ['p', ': '], ['s', `"${L.desc.split(' ').slice(0, 5).join(' ')}…"`], ['p', ',']],
    [['', `  ${t('code.includes')}`], ['p', ': [']],
    ...L.list.map((item) => [['s', `    "${item}"`], ['p', ',']]),
    [['p', '  ],']],
    [['', `  ${t('code.from')}`], ['p', ': '], ['n', s.price.toLocaleString('en-US').replace(',', '_')], ['p', ',']],
    [['', `  ${t('code.support')}`], ['p', ': '], ['k', 'true'], ['p', ',']],
    [['p', '});']]
  ];
};

(function servicesIDE() {
  const files = $('[data-files]');
  if (!files) return;
  const code = $('[data-code]');
  const panel = $('[data-panel]');
  const priceEl = $('[data-s-price]');
  let typingRaf = 0, priceRaf = 0, current = -1, started = false;

  files.innerHTML = SERVICES.map((s, i) => `<button class="file" type="button" role="tab" id="tab-${s.key}" aria-controls="service-panel" aria-selected="false" tabindex="-1" style="--c:${COLORS_BY_SERVICE[i]}"><span class="dot" aria-hidden="true"></span>${s.file}</button>`).join('');
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

  const select = (i, { focus = false, force = false } = {}) => {
    if (i === current && !force) return;
    current = i;
    const s = SERVICES[i], L = pick(s);
    tabs.forEach((tab, k) => { tab.setAttribute('aria-selected', String(k === i)); tab.tabIndex = k === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tabs[i].id);
    if (focus) tabs[i].focus();
    $('[data-tab-name]').textContent = s.file;
    $('[data-s-title]').textContent = L.title;
    $('[data-s-desc]').textContent = L.desc;
    $('[data-s-list]').innerHTML = L.list.map((x) => `<li>${x}</li>`).join('');
    $('[data-s-cta]').dataset.servicePick = s.key;
    panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap');

    const lines = codeFor(s);
    const total = lines.reduce((a, segs) => a + segs.reduce((b, [, txt]) => b + txt.length, 0), 0);
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

  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i)));
  files.addEventListener('keydown', (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in keys) { e.preventDefault(); select((current + keys[e.key] + SERVICES.length) % SERVICES.length, { focus: true }); }
    if (e.key === 'Home') { e.preventDefault(); select(0, { focus: true }); }
    if (e.key === 'End') { e.preventDefault(); select(SERVICES.length - 1, { focus: true }); }
  });

  const io = onVisible($('[data-ide]'), (vis) => { if (vis) { started = true; select(0); io.disconnect(); } }, { threshold: 0.3 });
  onLang(() => { if (started) select(current, { force: true }); });
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
  gitPath.setAttribute('d', `M20 ${y1} L20 ${y2} C20 ${y2 + 30} 36 ${y2 + 24} 36 ${Math.min(mid, y2 + 54)} L36 ${Math.max(mid, y3 - 54)} C36 ${y3 - 24} 20 ${y3 - 30} 20 ${y3} L20 ${y4}`);
  gitLen = gitPath.getTotalLength();
  gitPath.style.strokeDasharray = gitLen;
};

/* ════════════════════════════════════════════════════════════
   Mockups vivos
   ════════════════════════════════════════════════════════════ */
(function mocks() {
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

  const bars = $$('.md-chart i');
  const shuffleBars = () => bars.forEach((b, i) => { b.style.setProperty('--h', `${25 + Math.random() * 70}%`); b.style.setProperty('--d', `${i * 0.06}s`); });
  shuffleBars();

  const every = (el, ms, fn) => {
    let id = 0;
    onVisible(el, (vis) => { clearInterval(id); if (vis && !reduced) { fn(); id = setInterval(fn, ms); } }, { threshold: 0.3 });
  };

  const dash = $('.mock-dash');
  if (dash) {
    const st = $$('.st', dash);
    let order = [0, 1, 2];
    const paint = () => st.forEach((s, i) => { s.textContent = t('work.states')[order[i]]; s.classList.toggle('is-busy', order[i] === 1); });
    paint();
    onLang(paint);
    every(dash, 3200, () => { shuffleBars(); order = [order[2], order[0], order[1]]; paint(); });
  }

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
      const time = `${9 + ((Math.random() * 11) | 0)}:${Math.random() < 0.5 ? '00' : '30'}`;
      toast.innerHTML = `<span class="ok">✓</span> ${t('work.toast')(cell.textContent, time)}`;
      toast.classList.add('is-show');
      setTimeout(() => { toast.classList.remove('is-show'); cell.className = 'is-busy'; }, 1700);
    });
  }
})();

/* ════════════════════════════════════════════════════════════
   Equipo: tarjetas que se despliegan
   ════════════════════════════════════════════════════════════ */
(function team() {
  const grid = $('[data-team-grid]');
  const dialog = $('[data-profile]');
  if (!grid || !dialog) return;
  const TEAM = I18N.team;
  const card = $('[data-profile-card]', dialog);
  const photo = $('[data-p-photo]', dialog);
  const tabsEl = $('[data-p-tabs]', dialog);
  const panel = $('[data-p-panel]', dialog);
  const MODULE_COLORS = ['var(--accent)', 'var(--text)', 'var(--steel)'];
  let index = 0, tab = 'profile', sourceEl = null;

  const renderGrid = () => {
    grid.innerHTML = TEAM.map((m, i) => {
      const L = pick(m);
      return `<li class="member" data-tilt style="--mc:${MODULE_COLORS[i]}">
        <button type="button" class="member-card" data-member="${i}" aria-haspopup="dialog" aria-label="${t('team.open')(m.name)}">
          <span class="portrait"><img src="assets/team/${m.photo}-480.webp" srcset="assets/team/${m.photo}-480.webp 480w, assets/team/${m.photo}-960.webp 960w" sizes="(max-width: 700px) 90vw, 30vw" width="480" height="640" alt="" loading="lazy" decoding="async" /></span>
          <span class="member-module" aria-hidden="true">${t('team.module')} 0${m.module}</span>
          <span class="member-info">
            <strong>${m.name}</strong>
            <span>${L.specialty}</span>
          </span>
          <span class="member-open" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>
        </button>
      </li>`;
    }).join('');
    $$('[data-member]', grid).forEach((b) => b.addEventListener('click', () => open(Number(b.dataset.member), b)));
    bindTilt(grid);
  };

  const tabList = (L) => {
    const names = I18N.teamTabs[lang];
    const hasCpp = L.atCpp && (L.atCpp.summary || L.atCpp.tasks?.length || L.atCpp.focus?.length);
    return [['profile', names.profile, L.profile?.length], ['atCpp', names.atCpp, hasCpp], ['stack', names.stack, L.stack?.length]].filter((x) => x[2]);
  };

  const chips = (items, offset = 0) => `<ul class="chips">${items.map((x, i) => `<li style="--i:${i + offset}">${x}</li>`).join('')}</ul>`;

  const renderPanel = (animate) => {
    const L = pick(TEAM[index]);
    let html = '';
    if (tab === 'profile') {
      html = `<dl class="facts">${L.profile.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
    } else if (tab === 'atCpp') {
      const c = L.atCpp;
      html = `<div class="at-cpp">
        ${c.summary ? `<p class="at-summary">${c.summary}</p>` : ''}
        ${c.tasks?.length ? `<ul class="tasks">${c.tasks.map((x, i) => `<li style="--i:${i}">${x}</li>`).join('')}</ul>` : ''}
        ${c.focus?.length ? chips(c.focus, c.tasks?.length || 0) : ''}
      </div>`;
    } else {
      let n = 0;
      html = `<div class="stack">${L.stack.map((g) => {
        const block = `<div class="stack-group"><p class="stack-label">${g.group}</p>${chips(g.items, n)}</div>`;
        n += g.items.length;
        return block;
      }).join('')}</div>`;
    }
    panel.innerHTML = html;
    panel.setAttribute('aria-labelledby', `ptab-${tab}`);
    if (animate) { panel.classList.remove('is-swap'); void panel.offsetWidth; panel.classList.add('is-swap'); }
  };

  const renderTabs = () => {
    const list = tabList(pick(TEAM[index]));
    if (!list.some(([id]) => id === tab)) tab = list[0]?.[0] || 'profile';
    tabsEl.innerHTML = list.map(([id, label]) => `<button type="button" role="tab" id="ptab-${id}" aria-controls="profile-panel" aria-selected="${id === tab}" tabindex="${id === tab ? 0 : -1}" data-ptab="${id}">${label}</button>`).join('');
  };

  const render = (dir = 0) => {
    const m = TEAM[index], L = pick(m);
    card.style.setProperty('--mc', MODULE_COLORS[index]);
    photo.src = `assets/team/${m.photo}-480.webp`;
    photo.srcset = `assets/team/${m.photo}-480.webp 480w, assets/team/${m.photo}-960.webp 960w`;
    photo.sizes = '(max-width: 760px) 100vw, 380px';
    photo.alt = m.name;
    $('[data-p-module]', dialog).textContent = `0${m.module}`;
    $('[data-p-kicker]', dialog).textContent = `${t('team.partner')} · ${t('team.module')} 0${m.module}`;
    $('[data-p-name]', dialog).textContent = m.name;
    $('[data-p-role]', dialog).textContent = L.specialty;
    $('[data-p-quote]', dialog).textContent = L.quote || '';
    $('[data-p-quote]', dialog).hidden = !L.quote;
    $('[data-p-bio]', dialog).textContent = L.bio || '';
    $('[data-p-bio]', dialog).hidden = !L.bio;
    const li = $('[data-p-linkedin]', dialog);
    li.href = m.linkedin;
    li.hidden = !m.linkedin;
    $('[data-p-count]', dialog).textContent = `${index + 1} / ${TEAM.length}`;
    renderTabs();
    renderPanel(false);
    if (dir && !reduced) {
      card.classList.remove('slide-next', 'slide-prev'); void card.offsetWidth;
      card.classList.add(dir > 0 ? 'slide-next' : 'slide-prev');
    }
  };

  const flip = (from, reverse) => {
    if (reduced || !from || !card.animate) return Promise.resolve();
    const a = from.getBoundingClientRect(), b = card.getBoundingClientRect();
    const frames = [
      { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`, opacity: 0.4, borderRadius: '14px' },
      { transform: 'none', opacity: 1, borderRadius: '20px' }
    ];
    card.style.transformOrigin = '0 0';
    return card.animate(reverse ? frames.reverse() : frames, { duration: reverse ? 380 : 560, easing: 'cubic-bezier(.16,.86,.26,1)' }).finished.catch(() => {});
  };

  const open = (i, from) => {
    index = i; tab = 'profile'; sourceEl = from;
    render();
    dialog.showModal();
    document.body.classList.add('has-dialog');
    /* Dispara la entrada en cascada del cuerpo, detrás del FLIP de la tarjeta. */
    if (!reduced) {
      card.classList.remove('is-entering');
      void card.offsetWidth;
      card.classList.add('is-entering');
    }
    flip(from?.querySelector('.portrait') || from, false);
  };

  let closing = false;
  const close = async () => {
    if (closing || !dialog.open) return;
    closing = true;
    dialog.classList.add('is-closing');
    const target = grid.querySelector(`[data-member="${index}"]`);
    await flip(target?.querySelector('.portrait'), true);
    dialog.close();
    dialog.classList.remove('is-closing');
    card.classList.remove('is-entering');
    document.body.classList.remove('has-dialog');
    closing = false;
    target?.focus({ preventScroll: true });
  };

  const go = (dir) => { index = (index + dir + TEAM.length) % TEAM.length; tab = 'profile'; render(dir); };

  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
    if (e.target.closest('[data-profile-close]')) {
      const href = e.target.closest('a')?.getAttribute('href');
      if (href?.startsWith('#')) { e.preventDefault(); close().then(() => $(href)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })); }
      else close();
    }
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
    } else if (!inTabs && e.key === 'ArrowRight') go(1);
    else if (!inTabs && e.key === 'ArrowLeft') go(-1);
  });

  // Deslizar entre socios en pantallas táctiles
  let sx = null;
  card.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') sx = e.clientX; });
  card.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 60) go(e.clientX < sx ? 1 : -1); sx = null; });

  renderGrid();
  onLang(() => { renderGrid(); if (dialog.open) render(); });
})();

/* ════════════════════════════════════════════════════════════
   Inclinación, luz, botones magnéticos y cursor
   ════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════
   Motor de amortiguación para lo que sigue al puntero

   El puntero entrega decenas de eventos por segundo. Escribir cada uno
   directamente en una variable CSS que además tiene `transition` hace que cada
   movimiento reinicie la transición anterior: la tarjeta nunca llega a destino
   y se siente pastosa. Aquí el evento solo anota a dónde hay que llegar, y un
   único bucle persigue ese destino con interpolación amortiguada, a la misma
   velocidad en cualquier monitor. Se apaga solo cuando todo llegó.
   ════════════════════════════════════════════════════════════ */
const FRAME = 1000 / 144;
const followers = new Set();
let followFrame = 0, followLast = 0;

function followTick(now) {
  followFrame = 0;
  const k = followLast ? Math.min(64, now - followLast) / FRAME : 1;
  followLast = now;
  let again = false;

  followers.forEach((el) => {
    const f = el._follow;
    let moving = false;
    const ease = 1 - Math.pow(f.damp, k);
    for (const key in f.tgt) {
      const gap = f.tgt[key] - f.cur[key];
      if (Math.abs(gap) < f.eps) f.cur[key] = f.tgt[key];
      else { f.cur[key] += gap * ease; moving = true; }
    }
    f.write(el, f.cur);
    if (moving) again = true;
    else followers.delete(el);
  });

  if (again) followFrame = requestAnimationFrame(followTick);
  else followLast = 0;
}
const requestFollow = () => { if (!followFrame) followFrame = requestAnimationFrame(followTick); };
const pushFollow = (el) => { followers.add(el); requestFollow(); };

function bindTilt(scope = document) {
  if (!finePointer || reduced) return;
  $$('[data-tilt]', scope).forEach((el) => {
    if (el._tilt) return;
    el._tilt = true;
    el._follow = {
      damp: 0.87, eps: 0.02,
      cur: { rx: 0, ry: 0, gx: 50, gy: 50 },
      tgt: { rx: 0, ry: 0, gx: 50, gy: 50 },
      write: (node, c) => {
        node.style.setProperty('--rx', `${c.rx.toFixed(2)}deg`);
        node.style.setProperty('--ry', `${c.ry.toFixed(2)}deg`);
        node.style.setProperty('--gx', `${c.gx.toFixed(1)}%`);
        node.style.setProperty('--gy', `${c.gy.toFixed(1)}%`);
      }
    };
    el.addEventListener('pointerenter', (e) => {
      /* La luz nace bajo el cursor: si no, se la ve venir desde el centro. */
      const r = el.getBoundingClientRect();
      const f = el._follow;
      f.cur.gx = f.tgt.gx = ((e.clientX - r.left) / r.width) * 100;
      f.cur.gy = f.tgt.gy = ((e.clientY - r.top) / r.height) * 100;
    }, { passive: true });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const f = el._follow;
      f.tgt.ry = (x - 0.5) * 6;
      f.tgt.rx = (0.5 - y) * 5;
      f.tgt.gx = x * 100;
      f.tgt.gy = y * 100;
      pushFollow(el);
    }, { passive: true });
    el.addEventListener('pointerleave', () => {
      /* Volver al reposo va más lento que seguir al cursor: se ve asentarse. */
      const f = el._follow;
      f.damp = 0.93;
      f.tgt.rx = 0; f.tgt.ry = 0;
      pushFollow(el);
      setTimeout(() => { f.damp = 0.87; }, 700);
    }, { passive: true });
  });
}

if (finePointer && !reduced) {
  bindTilt();
  $$('[data-magnetic]').forEach((btn) => {
    btn._follow = {
      damp: 0.84, eps: 0.05,
      cur: { mx: 0, my: 0 }, tgt: { mx: 0, my: 0 },
      write: (node, c) => {
        node.style.setProperty('--mx', `${c.mx.toFixed(1)}px`);
        node.style.setProperty('--my', `${c.my.toFixed(1)}px`);
      }
    };
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn._follow.tgt.mx = (e.clientX - r.left - r.width / 2) * 0.22;
      btn._follow.tgt.my = (e.clientY - r.top - r.height / 2) * 0.3;
      pushFollow(btn);
    }, { passive: true });
    btn.addEventListener('pointerleave', () => {
      btn._follow.tgt.mx = 0;
      btn._follow.tgt.my = 0;
      pushFollow(btn);
    }, { passive: true });
  });

  const cursor = $('[data-cursor]');
  let cx = -100, cy = -100, tx = -100, ty = -100;
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    cursor.classList.add('is-on');
    cursor.classList.toggle('is-link', !!e.target.closest('a, button, summary, [role="tab"], label, select'));
    cursor.style.visibility = e.target.closest('input, textarea, canvas, dialog') ? 'hidden' : 'visible';
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  let cursorFrame = 0, cursorLast = 0;
  const follow = (now) => {
    cursorFrame = 0;
    const k = cursorLast ? Math.min(64, now - cursorLast) / FRAME : 1;
    cursorLast = now;
    const ease = 1 - Math.pow(0.80, k);
    cx += (tx - cx) * ease; cy += (ty - cy) * ease;
    cursor.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px)`;
    /* Se detiene al alcanzar al puntero en vez de girar en vacío. */
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3) cursorFrame = requestAnimationFrame(follow);
    else cursorLast = 0;
  };
  const wakeCursor = () => { if (!cursorFrame) cursorFrame = requestAnimationFrame(follow); };
  addEventListener('pointermove', wakeCursor, { passive: true });
}

/* ════════════════════════════════════════════════════════════
   Scroll: cabecera, riel, estado, manifiesto, git, footer
   ════════════════════════════════════════════════════════════ */
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

/* La columna del puntero solo repinta ese texto. Antes cada movimiento del
   ratón disparaba onScroll entero, que mide media página con
   getBoundingClientRect: decenas de lecturas de layout por segundo sin motivo. */
let statusFrame = 0;
const paintStatus = () => {
  statusFrame = 0;
  statusLn.textContent = `Ln ${Math.floor(scrollY / 24) + 1}, Col ${pointerCol}`;
};
const requestStatus = () => { if (!statusFrame) statusFrame = requestAnimationFrame(paintStatus); };
addEventListener('pointermove', (e) => {
  pointerCol = Math.floor(e.clientX / 9) + 1;
  requestStatus();
}, { passive: true });
if (footWord && finePointer && !reduced) {
  foot.addEventListener('pointermove', (e) => footWord.style.setProperty('--fw', (75 + (e.clientX / innerWidth) * 37.5).toFixed(1)));
}

let ticking = false;
function onScroll() {
  ticking = false;
  const y = scrollY, vh = innerHeight;

  topBar.classList.toggle('is-scrolled', y > 20);
  topBar.classList.toggle('is-hidden', y > 500 && y > lastY + 4 && !$('[data-mobile-menu]').classList.contains('is-open'));
  if (y < lastY - 4) topBar.classList.remove('is-hidden');
  lastY = y;

  if (railH) {
    const sigY = clamp(y + vh * 0.55, 0, railH - 90);
    if (reduced) {
      railSignal.style.transform = `translateY(${sigY.toFixed(1)}px)`;
    } else {
      if (!railSignal._follow) {
        railSignal._follow = {
          damp: 0.8, eps: 0.1,
          cur: { y: sigY }, tgt: { y: sigY },
          write: (node, c) => { node.style.transform = `translateY(${c.y.toFixed(1)}px)`; }
        };
      }
      railSignal._follow.tgt.y = sigY;
      pushFollow(railSignal);
    }
    railPads.forEach((p) => p.el.classList.toggle('is-lit', sigY + 90 > p.y));
  }

  const mid = vh * 0.45;
  const active = sections.find((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
  if (active && active.dataset.section !== currentFile) {
    currentFile = active.dataset.section;
    statusFile.textContent = currentFile;
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${active.id}`));
  }
  paintStatus();

  if (manifestoWords.length && !reduced) {
    const r = manifesto.getBoundingClientRect();
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
    const on = Math.round(p * manifestoWords.length);
    manifestoWords.forEach((w, i) => w.classList.toggle('is-on', i < on));
  }

  if (gitLen) {
    const r = gitlog.getBoundingClientRect();
    const drawn = clamp(vh * 0.6 - r.top, 0, r.height);
    const reach = gitNodesY.length ? clamp(drawn / gitNodesY[gitNodesY.length - 1], 0, 1) : 0;
    gitPath.style.strokeDashoffset = reduced ? 0 : gitLen * (1 - reach);
    commits.forEach((c, i) => c.classList.toggle('is-lit', reduced || drawn >= gitNodesY[i] - 4));
  }

  if (footWord) {
    const r = footWord.getBoundingClientRect();
    footWord.style.setProperty('--fill', `${Math.round(clamp((vh - r.top) / (r.height + vh * 0.1), 0, 1) * 100)}%`);
  }
}
function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
addEventListener('scroll', requestScroll, { passive: true });
const layout = () => { buildRail(); buildGit(); onScroll(); };
addEventListener('resize', layout);
addEventListener('load', layout);
document.fonts?.ready.then(layout);
onLang(() => requestAnimationFrame(layout));

/* ── Apariciones y titulares ── */
$$('.sec-head, .contact-copy, .services-foot, .work-grid, .term, .foot-cta').forEach((group) => {
  [...group.children].forEach((el, i) => { el.setAttribute('data-reveal', ''); el.style.setProperty('--d', `${i * 0.08}s`); });
});
$$('.ide, .editor-form, .gitlog, .team-grid').forEach((el) => el.setAttribute('data-reveal', ''));
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    revealIO.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('[data-reveal]').forEach((el) => revealIO.observe(el));

$$('[data-scramble-in]').forEach((h) => {
  const io = onVisible(h, (vis) => {
    if (!vis) return;
    io.disconnect();
    scramble(h, h.dataset.text || h.textContent, 1000);
  }, { threshold: 0.5 });
});
$$('[data-scramble]').forEach((a) => a.addEventListener('pointerenter', () => scramble(a, a.dataset.text || a.textContent, 380)));

/* ── Diff ── */
const diff = $('[data-diff]');
if (diff) {
  $$('.diff-lines li', diff).forEach((li, i) => li.style.setProperty('--d', `${i * 0.11}s`));
  const io = onVisible(diff, (vis) => { if (vis) { diff.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.25 });
}

/* ── Menú móvil ── */
(function mobileMenu() {
  const btn = $('[data-menu-toggle]'), menu = $('[data-mobile-menu]');
  if (!btn) return;
  const set = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', t(open ? 'menu.close' : 'menu.open'));
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
  const rootEl = $('[data-palette]');
  if (!rootEl) return;
  const input = $('[data-palette-input]', rootEl), list = $('[data-palette-list]', rootEl);
  const go = (hash) => () => $(hash)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  const quote = (key) => () => { $('#service').value = key; go('#contacto')(); setTimeout(() => $('#name').focus({ preventScroll: true }), 700); };
  const commands = () => [
    { label: t('palette.home'), hint: '#inicio', run: go('#inicio') },
    { label: t('palette.services'), hint: '#servicios', run: go('#servicios') },
    { label: t('palette.process'), hint: '#proceso', run: go('#proceso') },
    { label: t('palette.work'), hint: '#proyectos', run: go('#proyectos') },
    { label: t('palette.team'), hint: '#equipo', run: go('#equipo') },
    { label: t('palette.faq'), hint: '#preguntas', run: go('#preguntas') },
    { label: t('palette.quote'), hint: '#contacto', run: quote('') },
    { label: t('palette.theme'), hint: 'theme', run: () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark') },
    { label: t('palette.lang'), hint: 'lang', run: () => applyLang(lang === 'es' ? 'en' : 'es', { animate: true }) },
    ...SERVICES.map((s) => ({ label: `${t('palette.quoteFor')}: ${pick(s).title}`, hint: s.file, run: quote(s.key) }))
  ];
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let all = [], filtered = [], idx = 0, opener = null;

  const render = () => {
    list.innerHTML = filtered.map((c, i) => `<li role="option" id="cmd-${i}" aria-selected="${i === idx}"><span>${c.label}</span><small>${c.hint}</small></li>`).join('') || `<li aria-disabled="true"><span>${t('palette.empty')}</span></li>`;
    input.setAttribute('aria-activedescendant', filtered.length ? `cmd-${idx}` : '');
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  };
  const open = () => { opener = document.activeElement; rootEl.hidden = false; input.value = ''; all = filtered = commands(); idx = 0; render(); input.focus(); };
  const close = () => { rootEl.hidden = true; opener?.focus?.(); };
  const run = (i) => { const c = filtered[i]; if (!c) return; close(); c.run(); };

  $$('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
  addEventListener('keydown', (e) => {
    if ($('[data-profile]')?.open) return;
    const typing = e.target.closest('input, textarea, select');
    if ((e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing && rootEl.hidden)) {
      e.preventDefault(); rootEl.hidden ? open() : close();
    }
  });
  input.addEventListener('input', () => { const q = norm(input.value); filtered = all.filter((c) => norm(`${c.label} ${c.hint}`).includes(q)); idx = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); idx = (idx + 1) % Math.max(filtered.length, 1); render(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); idx = (idx - 1 + filtered.length) % Math.max(filtered.length, 1); render(); }
    if (e.key === 'Enter') { e.preventDefault(); run(idx); }
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') e.preventDefault();
  });
  list.addEventListener('click', (e) => { const li = e.target.closest('li[id]'); if (li) run(Number(li.id.split('-')[1])); });
  rootEl.addEventListener('pointerdown', (e) => { if (e.target === rootEl) close(); });
})();

/* ── Preguntas: la respuesta se escribe ── */
$$('[data-faq]').forEach((d) => {
  const p = $('p', d);
  d.addEventListener('toggle', () => {
    if (!d.open || reduced) return;
    const text = staticText(p.dataset.i18n);
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
  form.addEventListener('input', () => { state.textContent = t('form.dirty'); state.dataset.state = 'dirty'; state.classList.add('is-dirty'); });

  onLang(() => {
    $$('[aria-invalid="true"]', form).forEach(check);
    if (statusKey) status.innerHTML = t(statusKey);
    if (state.dataset.state) state.textContent = t(state.dataset.state === 'dirty' ? 'form.dirty' : 'form.sent');
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
      state.textContent = t('form.sent'); state.dataset.state = 'sent'; state.classList.remove('is-dirty');
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
runBoot();
