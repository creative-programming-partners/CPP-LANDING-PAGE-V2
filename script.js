/* CPP, Vitrina: idioma, cotizador, pestañas, videos y movimiento.
   GSAP mueve transform, opacity, clip-path y un blur breve de entrada. Los videos se pausan fuera de vista. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var WA = 'https://wa.me/51929363454';
  var lang = root.lang === 'en' ? 'en' : 'es';

  var ATTRS = ['aria-label', 'alt', 'placeholder', 'content'];
  var TITLE = { es: document.title, en: 'CPP | Websites and systems at a fixed price (Vitrina prototype)' };
  var NAMES = {
    es: { landing: 'Landing page', automation: 'Automatización de procesos', catalog: 'Tienda por WhatsApp', corporate: 'Web corporativa', store: 'Tienda online con pagos', bookings: 'Sistema de reservas online', app: 'Aplicación web a medida' },
    en: { landing: 'Landing page', automation: 'Process automation', catalog: 'WhatsApp store', corporate: 'Corporate website', store: 'Online store with payments', bookings: 'Online booking system', app: 'Custom web application' }
  };
  var TOGGLE = { es: ['Pausar movimiento', 'Reanudar movimiento'], en: ['Pause motion', 'Resume motion'] };

  function split(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'word';
      s.textContent = w + (i < words.length - 1 ? ' ' : '');
      el.appendChild(s);
    });
  }

  /* ───────── Idioma ───────── */
  var toggle = document.getElementById('motionToggle');
  toggle.removeAttribute('data-en');
  var paused = reduce;

  function applyLang(next) {
    lang = next;
    root.lang = next;
    try { localStorage.setItem('cpp-lang', next); } catch (e) {}
    document.title = TITLE[next];
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.es === undefined) el.dataset.es = el.textContent.trim();
      el.textContent = next === 'en' ? el.dataset.en : el.dataset.es;
    });
    document.querySelectorAll('[data-split]').forEach(split);
    ATTRS.forEach(function (a) {
      document.querySelectorAll('[data-en-' + a + ']').forEach(function (el) {
        var store = 'data-es-' + a;
        if (!el.hasAttribute(store)) el.setAttribute(store, el.getAttribute(a) || '');
        el.setAttribute(a, next === 'en' ? el.getAttribute('data-en-' + a) : el.getAttribute(store));
      });
    });
    var generic = next === 'en' ? "Hi CPP, I'd like a quote for a project." : 'Hola CPP, quiero cotizar un proyecto.';
    document.querySelectorAll('[data-wa-generic]').forEach(function (a) { a.href = WA + '?text=' + encodeURIComponent(generic); });
    toggle.textContent = TOGGLE[next][paused ? 1 : 0];
    updateQuote(false);
    if (typeof updateAsk === "function") updateAsk();
    if (dlg && dlg.open) renderMember();
    if (exDlg && exDlg.open) renderExample();
  }

  /* ───────── Pedido rápido del hero: el enlace se arma mientras escribes ───────── */
  var need = document.getElementById('need');
  var askGo = document.getElementById('askGo');
  function updateAsk() {
    var v = need.value.trim();
    var msg = v
      ? (lang === 'en' ? "Hi CPP, I'd like a quote for: " : 'Hola CPP, quiero cotizar: ') + v
      : (lang === 'en' ? "Hi CPP, I'd like a quote for a project." : 'Hola CPP, quiero cotizar un proyecto.');
    askGo.href = WA + '?text=' + encodeURIComponent(msg);
  }
  need.addEventListener('input', updateAsk);
  document.getElementById('ask').addEventListener('submit', function (e) { e.preventDefault(); askGo.click(); });

  /* ───────── Cotizador ───────── */
  var form = document.getElementById('quote');
  var outTotal = document.getElementById('t-total');
  var outHalf1 = document.getElementById('t-half1');
  var outHalf2 = document.getElementById('t-half2');
  var appNote = document.getElementById('appnote');
  var send = document.getElementById('send');
  var biz = document.getElementById('biz');
  var lastTotal = null;

  function money(n) { return 'S/ ' + n.toLocaleString('en-US'); }
  function flash(el) {
    if (reduce || !el.animate) return;
    el.animate([{ opacity: 0.3, transform: 'translateY(6px)', filter: 'blur(2px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
      { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
  }
  function updateQuote(animate) {
    var picked = Array.prototype.slice.call(form.querySelectorAll('input[name="svc"]:checked'));
    var total = 0, hasApp = false, items = [];
    picked.forEach(function (i) {
      var price = Number(i.dataset.price), from = i.dataset.from === '1';
      total += price;
      if (from) hasApp = true;
      items.push(NAMES[lang][i.value] + ' (' + (from ? (lang === 'en' ? 'from ' : 'desde ') : '') + money(price) + ')');
    });
    var prefix = hasApp ? (lang === 'en' ? 'from ' : 'desde ') : '';
    outTotal.textContent = prefix + money(total);
    outHalf1.textContent = prefix + money(total / 2);
    outHalf2.textContent = prefix + money(total / 2);
    appNote.hidden = !hasApp;
    var name = (biz.value || '').trim();
    var msg;
    if (!items.length) msg = lang === 'en' ? "Hi CPP, I'd like information about your services." : 'Hola CPP, quiero información sobre sus servicios.';
    else msg = (lang === 'en' ? "Hi CPP, I'd like a quote for: " : 'Hola CPP, quiero cotizar: ') + items.join(', ') + '. Total: ' + prefix + money(total) + '.';
    if (name) msg += lang === 'en' ? ' I am from ' + name + '.' : ' Soy de ' + name + '.';
    send.href = WA + '?text=' + encodeURIComponent(msg);
    if (animate && lastTotal !== null && lastTotal !== total) flash(outTotal);
    lastTotal = total;
  }
  form.addEventListener('change', function () { updateQuote(true); });
  biz.addEventListener('input', function () { updateQuote(false); });
  document.getElementById('lang').addEventListener('click', function () { applyLang(lang === 'es' ? 'en' : 'es'); });

  /* ───────── Pestañas del caso ───────── */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) { panel.setAttribute('data-on', ''); panel.removeAttribute('aria-hidden'); panel.removeAttribute('inert'); }
      else { panel.removeAttribute('data-on'); panel.setAttribute('aria-hidden', 'true'); panel.setAttribute('inert', ''); }
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var to = null;
      if (e.key === 'ArrowRight') to = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') to = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') to = tabs[0];
      else if (e.key === 'End') to = tabs[tabs.length - 1];
      if (to) { e.preventDefault(); selectTab(to, true); }
    });
  });

  /* ───────── Ficha de cada socio (datos de team-data.js, los mismos del sitio oficial) ───────── */
  var TEAM = (window.CPP_I18N && window.CPP_I18N.team) || [];
  var TABS = (window.CPP_I18N && window.CPP_I18N.teamTabs) || { es: { profile: 'Perfil', atCpp: 'En CPP', stack: 'Stack' }, en: { profile: 'Profile', atCpp: 'At CPP', stack: 'Stack' } };
  var dlg = document.getElementById('profile');
  var pPhoto = document.getElementById('pPhoto');
  var pSwap = document.getElementById('pSwap');
  var pTabs = document.getElementById('pTabs');
  var pPanel = document.getElementById('pPanel');
  var photoBase = pPhoto.getAttribute('src').replace(/[^/]+$/, '');
  var pIdx = 0, pTab = 'profile', opener = null, swapTimer = 0;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tabsFor(d) {
    var list = [];
    if (d.profile && d.profile.length) list.push('profile');
    if (d.atCpp && (d.atCpp.summary || (d.atCpp.tasks || []).length)) list.push('atCpp');
    if (d.stack && d.stack.length) list.push('stack');
    return list;
  }
  function panelHTML(d, tab) {
    if (tab === 'profile') {
      return '<dl class="p-rows">' + d.profile.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>';
    }
    if (tab === 'atCpp') {
      var a = d.atCpp;
      return (a.summary ? '<p class="p-summary">' + esc(a.summary) + '</p>' : '') +
        ((a.tasks || []).length ? '<ul class="p-tasks">' + a.tasks.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        ((a.focus || []).length ? '<ul class="chips">' + a.focus.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '');
    }
    return d.stack.map(function (g) {
      return '<div class="p-group"><p class="p-group-name">' + esc(g.group) + '</p><ul class="chips">' + g.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
    }).join('');
  }
  function renderPanel(d) {
    var keys = tabsFor(d);
    if (keys.indexOf(pTab) < 0) pTab = keys[0];
    pTabs.innerHTML = '';
    keys.forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'profile-tab';
      b.setAttribute('role', 'tab');
      b.id = 'ptab-' + k;
      b.dataset.tab = k;
      b.setAttribute('aria-controls', 'pPanel');
      b.setAttribute('aria-selected', String(k === pTab));
      b.tabIndex = k === pTab ? 0 : -1;
      b.textContent = TABS[lang][k];
      pTabs.appendChild(b);
    });
    pPanel.setAttribute('aria-labelledby', 'ptab-' + pTab);
    pPanel.innerHTML = panelHTML(d, pTab);
  }
  function renderMember() {
    var m = TEAM[pIdx];
    if (!m) return;
    var d = m[lang];
    var mod = String(m.module).padStart(2, '0');
    document.getElementById('pKicker').textContent = (lang === 'en' ? 'Founding partner, module ' : 'Socio fundador, módulo ') + mod;
    pPhoto.src = photoBase + m.photo + '-960.webp';
    pPhoto.alt = (lang === 'en' ? 'Portrait of ' : 'Retrato de ') + m.name;
    document.getElementById('pNum').textContent = mod;
    document.getElementById('pName').textContent = m.name;
    document.getElementById('pRole').textContent = d.specialty;
    document.getElementById('pBio').textContent = d.bio;
    document.getElementById('pQuote').textContent = d.quote;
    document.getElementById('pLinkedin').href = m.linkedin;
    document.getElementById('pCount').textContent = (pIdx + 1) + ' / ' + TEAM.length;
    renderPanel(d);
  }
  function goTo(i) {
    pIdx = (i + TEAM.length) % TEAM.length;
    pTab = 'profile';
    if (reduce) { renderMember(); return; }
    clearTimeout(swapTimer);
    pSwap.classList.add('is-swapping');
    pPhoto.classList.add('is-swapping');
    swapTimer = setTimeout(function () {
      renderMember();
      pSwap.classList.remove('is-swapping');
      if (pPhoto.complete) pPhoto.classList.remove('is-swapping');
      else pPhoto.onload = function () { pPhoto.classList.remove('is-swapping'); pPhoto.onload = null; };
    }, 170);
  }
  function openProfile(id, btn) {
    var i = TEAM.findIndex(function (m) { return m.id === id; });
    if (i < 0 || !dlg.showModal) return;
    opener = btn;
    pIdx = i;
    pTab = 'profile';
    pSwap.classList.remove('is-swapping');
    pPhoto.classList.remove('is-swapping');
    renderMember();
    dlg.showModal();
  }
  document.querySelectorAll('[data-member]').forEach(function (btn) {
    btn.addEventListener('click', function () { openProfile(btn.dataset.member, btn); });
  });
  document.getElementById('pClose').addEventListener('click', function () { dlg.close(); });
  document.getElementById('pPrev').addEventListener('click', function () { goTo(pIdx - 1); });
  document.getElementById('pNext').addEventListener('click', function () { goTo(pIdx + 1); });
  document.getElementById('pWork').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  pTabs.addEventListener('click', function (e) {
    var b = e.target.closest('.profile-tab');
    if (!b) return;
    pTab = b.dataset.tab;
    renderPanel(TEAM[pIdx][lang]);
    document.getElementById('ptab-' + pTab).focus();
  });
  pTabs.addEventListener('keydown', function (e) {
    var keys = tabsFor(TEAM[pIdx][lang]);
    var i = keys.indexOf(pTab), to = -1;
    if (e.key === 'ArrowRight') to = (i + 1) % keys.length;
    else if (e.key === 'ArrowLeft') to = (i - 1 + keys.length) % keys.length;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = keys.length - 1;
    if (to < 0) return;
    e.preventDefault();
    e.stopPropagation();
    pTab = keys[to];
    renderPanel(TEAM[pIdx][lang]);
    document.getElementById('ptab-' + pTab).focus();
  });
  dlg.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(pIdx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(pIdx - 1); }
  });

  /* ───────── Ejemplo de cada servicio ───────── */
  var EX_ORDER = ['landing', 'automation', 'catalog', 'corporate', 'store', 'bookings', 'app'];
  var EX_KIND = {
    real: { es: 'Ejemplo publicado', en: 'Published example' },
    project: { es: 'Proyecto real', en: 'Real project' },
    proto: { es: 'Prototipo', en: 'Prototype' },
    demo: { es: 'Demostración', en: 'Demo' }
  };
  var EXAMPLES = {
    landing: {
      kind: 'real', price: 600, media: { web: 'media/examples/pachanka-web.webp', phone: 'media/examples/pachanka-movil.webp' },
      link: 'https://pachankarestaurant.com/', linkText: 'pachankarestaurant.com',
      es: { what: 'Una sola página que presenta tu negocio y lleva a la acción: reservar, pedir o escribirte por WhatsApp.', example: 'Pachanka Restaurant: carta, eventos, reseñas, ubicación y reservas por WhatsApp, en español, inglés y francés.', includes: ['Una página de hasta 6 secciones', 'Botón de WhatsApp o formulario', 'Se ve bien en celular y computadora'] },
      en: { what: 'A single page that presents your business and drives action: book, order or message you on WhatsApp.', example: 'Pachanka Restaurant: menu, events, reviews, location and WhatsApp bookings, in Spanish, English and French.', includes: ['One page with up to 6 sections', 'WhatsApp button or contact form', 'Looks great on phones and computers'] }
    },
    automation: {
      kind: 'demo', price: 800, media: { demo: 'flow' },
      es: { what: 'Conectamos las herramientas que ya usas para que la información pase sola de una a otra, sin copiar y pegar.', example: 'Así funciona un flujo: alguien llena tu formulario, sus datos se anotan en una hoja de Google y te llega un aviso por correo al instante.', includes: ['Precio por cada flujo automatizado', 'Ej.: formulario, hoja de Google y aviso por correo', 'Menos errores y más tiempo libre'] },
      en: { what: 'We connect the tools you already use so information moves from one to the next on its own, with no copy and paste.', example: 'How a workflow runs: someone fills in your form, their details land in a Google Sheet and you get an email alert right away.', includes: ['Priced per automated workflow', 'E.g. form, Google Sheet and email alert', 'Fewer errors, more free time'] }
    },
    catalog: {
      kind: 'real', price: 900, media: { phone: 'media/examples/carta-movil.webp' },
      link: 'https://carta.pachankarestaurant.com/', linkText: 'carta.pachankarestaurant.com',
      es: { what: 'Tu catálogo en una web propia: el cliente busca, ve foto y precio, arma su pedido y te llega listo por WhatsApp.', example: 'La carta digital de Pachanka usa el mismo formato: categorías, buscador y cada plato con foto y precio.', includes: ['Hasta 50 productos con foto y precio', 'Buscador y categorías', 'Pedido por WhatsApp y código QR'] },
      en: { what: 'Your catalog on its own website: customers search, see photo and price, build their order and it reaches you ready on WhatsApp.', example: 'Pachanka’s digital menu uses the same format: categories, search and every dish with photo and price.', includes: ['Up to 50 products with photo and price', 'Search and categories', 'WhatsApp ordering and QR code'] }
    },
    corporate: {
      kind: 'proto', price: 1300, media: { web: 'media/examples/odontoplus-web.webp', phone: 'media/examples/odontoplus-movil.webp' },
      link: 'https://creative-programming-partners.github.io/odontoplus-vmt-landing/', linkText: { es: 'Ver el prototipo', en: 'See the prototype' },
      es: { what: 'Una presencia profesional para explicar quién eres, qué ofreces y cómo contactarte, lista para aparecer en Google.', example: 'Prototipo que diseñamos para una clínica dental en Villa María del Triunfo: tratamientos, casos, primera cita, opiniones y ubicación.', includes: ['Hasta 5 páginas', 'Lista para aparecer en Google', 'Formulario de contacto'] },
      en: { what: 'A professional presence that explains who you are, what you offer and how to reach you, ready to show up on Google.', example: 'A prototype we designed for a dental clinic in Villa María del Triunfo: treatments, cases, first visit, reviews and location.', includes: ['Up to 5 pages', 'Ready to show up on Google', 'Contact form'] }
    },
    store: {
      kind: 'demo', price: 2600, media: { demo: 'store' },
      es: { what: 'Una tienda con carrito y pago en línea: el cliente elige, paga con tarjeta o Yape y tú recibes el pedido confirmado.', example: 'Aún no tenemos una tienda con pagos publicada. Esta demostración muestra los tres pasos que tendría la tuya.', includes: ['Hasta 50 productos y carrito', 'Pago con tarjeta o Yape', 'Compra en pocos pasos'] },
      en: { what: 'A store with a cart and online payment: customers choose, pay by card or Yape and you get the confirmed order.', example: 'We don’t have a published store with payments yet. This demo shows the three steps yours would have.', includes: ['Up to 50 products and a cart', 'Card or Yape payments', 'Checkout in a few steps'] }
    },
    bookings: {
      kind: 'project', price: 3000, media: { web: 'media/work/bahia-web-1280.webp', phone: 'media/work/bahia-reserva-movil.webp' },
      link: 'https://bahia-cuba-app.bahiadecuba.workers.dev/es/reservar', linkText: { es: 'Probar la reserva', en: 'Try the booking' },
      es: { what: 'Tus clientes reservan solos, a cualquier hora, y tú administras la disponibilidad desde un panel.', example: 'Hotel Bahía de Cuba: el huésped elige habitación y fechas y reserva directo en cinco pasos, sin comisiones de intermediarios.', includes: ['Calendario de disponibilidad', 'Panel de gestión', 'Confirmaciones automáticas por correo'] },
      en: { what: 'Your customers book on their own, at any hour, and you manage availability from a dashboard.', example: 'Hotel Bahía de Cuba: guests pick a room and dates and book directly in five steps, with no middleman fees.', includes: ['Live availability calendar', 'Management dashboard', 'Automatic email confirmations'] }
    },
    app: {
      kind: 'project', price: 4000, from: true, media: { web: 'assets/work/bahia-de-cuba-panel-1200.webp' },
      es: { what: 'Una herramienta hecha alrededor de cómo trabaja tu empresa, con un acceso para cada usuario.', example: 'El panel de administración del Hotel Bahía de Cuba: reservas, calendario, habitaciones, huéspedes y pagos en un solo lugar. Es privado, solo entra el hotel.', includes: ['Hecha a la medida de tu proceso', 'Un acceso para cada usuario', 'Alcance definido en la propuesta'] },
      en: { what: 'A tool built around how your company works, with its own login for each user.', example: 'The Hotel Bahía de Cuba admin panel: bookings, calendar, rooms, guests and payments in one place. It is private; only the hotel signs in.', includes: ['Built around your process', 'Its own login for each user', 'Scope agreed in the proposal'] }
    }
  };
  var exDlg = document.getElementById('example');
  var exMedia = document.getElementById('exMedia');
  var exSwap = document.getElementById('exSwap');
  var exIdx = 0, exOpener = null, exTimer = 0;

  function exInput(key) { return form.querySelector('input[name="svc"][value="' + key + '"]'); }
  function demoHTML(kind) {
    if (kind === 'flow') {
      var L = lang === 'en' ? ['Your form', 'Google Sheet', 'Email alert', 'New request', 'saved in row 24', 'alert sent to you'] : ['Tu formulario', 'Hoja de Google', 'Aviso por correo', 'Nueva solicitud', 'anotada en la fila 24', 'aviso enviado a tu correo'];
      return '<div class="flow"><div class="flow-row">' +
        '<div class="flow-node"><span class="flow-icon"><svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>' + L[0] + '</div><span class="flow-wire"></span>' +
        '<div class="flow-node"><span class="flow-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/></svg></span>' + L[1] + '</div><span class="flow-wire"></span>' +
        '<div class="flow-node"><span class="flow-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span>' + L[2] + '</div>' +
        '</div><div class="flow-log"><span><b>' + L[3] + '</b>, ' + L[4] + '</span><span>' + L[5] + '</span></div></div>';
    }
    var S = lang === 'en' ? ['Store', 'Add to cart', 'Your cart', 'Subtotal', 'Pay', 'Payment', 'Card', 'Yape', 'Payment confirmed'] : ['Tienda', 'Agregar al carrito', 'Tu carrito', 'Subtotal', 'Pagar', 'Pago', 'Tarjeta', 'Yape', 'Pago confirmado'];
    var item = function (c, n, p) { return '<div class="shop-item"><span class="shop-thumb" style="background:' + c + '"></span><b>' + n + '</b><span>S/ ' + p + '</span></div>'; };
    return '<div class="shop"><div class="shop-screen"><div class="shop-strip">' +
      '<div class="shop-step"><p class="shop-title">' + S[0] + '</p><div class="shop-grid">' + item('#9fb7e8', 'Polo', 45) + item('#e8c39f', 'Gorra', 35) + item('#a8d8c3', 'Taza', 25) + item('#d8a8c8', 'Bolso', 60) + '</div><span class="shop-btn">' + S[1] + '</span></div>' +
      '<div class="shop-step"><p class="shop-title">' + S[2] + '</p><div class="shop-line"><span>Polo × 1</span><span>S/ 45</span></div><div class="shop-line"><span>Taza × 2</span><span>S/ 50</span></div><div class="shop-line"><b>' + S[3] + '</b><b>S/ 95</b></div><span class="shop-btn">' + S[4] + '</span></div>' +
      '<div class="shop-step"><p class="shop-title">' + S[5] + '</p><div class="shop-pay"><span>' + S[6] + '</span><span class="on">' + S[7] + '</span></div><p class="shop-ok">' + S[8] + '</p></div>' +
      '</div><span class="shop-dots"><i></i><i></i><i></i></span></div></div>';
  }
  function renderExample() {
    var key = EX_ORDER[exIdx], ex = EXAMPLES[key], d = ex[lang];
    var badge = document.getElementById('exBadge');
    badge.textContent = EX_KIND[ex.kind][lang];
    badge.dataset.kind = (ex.kind === 'real' || ex.kind === 'project') ? 'real' : 'other';
    document.getElementById('exName').textContent = NAMES[lang][key];
    document.getElementById('exPrice').textContent = (ex.from ? (lang === 'en' ? 'From ' : 'Desde ') : '') + money(ex.price);
    document.getElementById('exWhat').textContent = d.what;
    document.getElementById('exCase').textContent = d.example;
    var inc = document.getElementById('exIncludes');
    inc.innerHTML = d.includes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    var link = document.getElementById('exLink');
    if (ex.link) {
      link.hidden = false;
      link.href = ex.link;
      link.textContent = typeof ex.linkText === 'object' ? ex.linkText[lang] : ex.linkText;
    } else {
      link.hidden = true;
    }
    var m = ex.media;
    if (m.demo) exMedia.innerHTML = demoHTML(m.demo);
    else {
      var alt = (lang === 'en' ? 'Screenshot: ' : 'Captura: ') + d.example.split(':')[0];
      exMedia.innerHTML = '<div class="ex-stage' + (m.web ? '' : ' only-phone') + '">' +
        (m.web ? '<div class="ex-web"><img src="' + m.web + '" alt="' + esc(alt) + '" decoding="async" /></div>' : '') +
        (m.phone ? '<div class="ex-phone"><img src="' + m.phone + '" alt="' + (m.web ? '' : esc(alt)) + '" decoding="async" /></div>' : '') + '</div>';
    }
    syncExToggle();
    document.getElementById('exCount').textContent = (exIdx + 1) + ' / ' + EX_ORDER.length;
  }
  function syncExToggle() {
    var on = exInput(EX_ORDER[exIdx]).checked;
    document.getElementById('exToggle').textContent = on
      ? (lang === 'en' ? 'Remove from my quote' : 'Quitar de mi cotización')
      : (lang === 'en' ? 'Add to my quote' : 'Agregar a mi cotización');
  }
  function exGo(i) {
    exIdx = (i + EX_ORDER.length) % EX_ORDER.length;
    if (reduce) { renderExample(); return; }
    clearTimeout(exTimer);
    exSwap.classList.add('is-swapping');
    exMedia.classList.add('is-swapping');
    exTimer = setTimeout(function () { renderExample(); exSwap.classList.remove('is-swapping'); exMedia.classList.remove('is-swapping'); }, 170);
  }
  document.querySelectorAll('.svc-ex').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!exDlg.showModal) return;
      exOpener = btn;
      exIdx = EX_ORDER.indexOf(btn.dataset.example);
      exSwap.classList.remove('is-swapping');
      exMedia.classList.remove('is-swapping');
      renderExample();
      exDlg.showModal();
    });
  });
  document.getElementById('exToggle').addEventListener('click', function () {
    var input = exInput(EX_ORDER[exIdx]);
    input.checked = !input.checked;
    form.dispatchEvent(new Event('change', { bubbles: true }));
    syncExToggle();
  });
  document.getElementById('exClose').addEventListener('click', function () { exDlg.close(); });
  document.getElementById('exPrev').addEventListener('click', function () { exGo(exIdx - 1); });
  document.getElementById('exNext').addEventListener('click', function () { exGo(exIdx + 1); });
  exDlg.addEventListener('click', function (e) { if (e.target === exDlg) exDlg.close(); });
  exDlg.addEventListener('close', function () { if (exOpener) exOpener.focus(); });
  exDlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); exGo(exIdx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); exGo(exIdx - 1); }
  });

  /* ───────── Videos: cada uno corre solo si está a la vista y el movimiento no está en pausa ───────── */
  var videos = ['bgVid', 'vid', 'ctaVid'].map(function (id) { return { el: document.getElementById(id), visible: false }; });
  var videoGate = false;
  function openGate() { if (videoGate) return; videoGate = true; syncVideos(); }
  window.addEventListener('load', function () { setTimeout(openGate, 250); }, { once: true });
  setTimeout(openGate, 3000);
  function syncVideos() {
    videos.forEach(function (v) {
      if (!paused && v.visible && videoGate) {
        if (v.el.preload === 'none') v.el.preload = 'auto';
        var p = v.el.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.el.pause();
      }
    });
  }
  function syncMotion() {
    document.body.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = TOGGLE[lang][paused ? 1 : 0];
    syncVideos();
  }
  toggle.addEventListener('click', function () { paused = !paused; syncMotion(); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        videos.forEach(function (v) { if (v.el === en.target) v.visible = en.isIntersecting; });
      });
      syncVideos();
    }, { threshold: 0.05 });
    videos.forEach(function (v) { io.observe(v.el); });
  } else {
    videos.forEach(function (v) { v.visible = true; });
  }

  if ('IntersectionObserver' in window) {
    var loops = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('is-off', !en.isIntersecting); });
    });
    document.querySelectorAll('.reel, .ticker, .window').forEach(function (el) { loops.observe(el); });
  }

  /* ───────── Movimiento con GSAP ───────── */
  function motion() {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });

    /* 1. Entrada: la ventana se abre, el video se aleja, el titular se enfoca palabra por palabra. */
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('#window', { scale: 0.94, autoAlpha: 0, duration: 1.2, ease: 'expo.out' })
      .from('#bgVid', { scale: 1.3, duration: 2.2, ease: 'expo.out' }, 0)
      .from('.side', { xPercent: function (i) { return i ? 40 : -40; }, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0.1)
      .from('#h1 .word', { autoAlpha: 0, yPercent: 60, duration: 1, stagger: 0.07 }, 0.35)
      .from('#inicio [data-intro]', { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.12 }, 0.8)
      .from('.top .pill, .top .lang', { autoAlpha: 0, y: -16, duration: 0.8, stagger: 0.08 }, 0.6);

    /* 2. Al bajar: el texto sube y se apaga, el video se acerca y la ventana se aleja. */
    var heroST = { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: 0.6 };
    gsap.to('#heroCopy', { y: -140, autoAlpha: 0, ease: 'none', scrollTrigger: heroST });
    gsap.to('#bgVid', { scale: 1.28, ease: 'none', scrollTrigger: heroST });
    gsap.to('#window', { scale: 0.9, ease: 'none', scrollTrigger: heroST });

    /* 3. El puntero mueve el video y el texto en sentidos opuestos (profundidad). */
    if (finePointer) {
      var vx = gsap.quickTo('#bgVid', 'x', { duration: 1.2, ease: 'power3' });
      var vy = gsap.quickTo('#bgVid', 'y', { duration: 1.2, ease: 'power3' });
      var cx = gsap.quickTo('#heroCopy', 'x', { duration: 1, ease: 'power3' });
      var hero = document.getElementById('inicio');
      var pend = 0, px = 0, py = 0;
      hero.addEventListener('pointermove', function (e) {
        px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5;
        if (pend) return;
        pend = requestAnimationFrame(function () { pend = 0; vx(px * -36); vy(py * -24); cx(px * 14); });
      }, { passive: true });
    }

    var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 600); };
    idle(below, { timeout: 1500 });
    function below() {
    /* 4. Encabezados: palabras que suben al entrar. Subtítulos que suben. */
    gsap.utils.toArray('section:not(#inicio) [data-split]').forEach(function (el) {
      gsap.from(el.querySelectorAll('.word'), { autoAlpha: 0, yPercent: 60, duration: 0.9, stagger: 0.05, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    gsap.utils.toArray('[data-rise]').forEach(function (el) {
      gsap.from(el, { autoAlpha: 0, y: 24, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    /* 5. Vitrina: el celular se endereza y sube mientras el carrusel corre detrás. */
    gsap.fromTo('#phone', { rotationX: 38, y: 140, scale: 0.82 }, { rotationX: 0, y: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '#stage', start: 'top bottom', end: 'center 60%', scrub: 0.8 } });
    gsap.fromTo('.reel', { x: 120, autoAlpha: 0.2 }, { x: -60, autoAlpha: 1, ease: 'none',
      scrollTrigger: { trigger: '#stage', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });

    /* 6. Caso: la imagen se descubre de abajo hacia arriba; el texto entra en cascada. */
    gsap.fromTo('.case .frame', { clipPath: 'inset(100% 0% 0% 0% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: '.case', start: 'top 75%', once: true } });
    gsap.from('.case .frame img', { scale: 1.25, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.case', start: 'top 75%', once: true } });
    gsap.from('.case-text > *, .case .tabs', { autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.case', start: 'top 70%', once: true } });
    gsap.from('.mini', { autoAlpha: 0, y: 60, rotationX: 12, transformPerspective: 900, duration: 1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.minis', start: 'top 85%', once: true } });

    /* 7. Precios: las filas entran desde la izquierda, el resumen sube. */
    gsap.from('.svc', { autoAlpha: 0, y: 24, duration: 0.6, stagger: 0.05, ease: 'power3.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '.svc-list', start: 'top 80%', once: true } });
    gsap.from('.summary', { autoAlpha: 0, y: 50, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.summary', start: 'top 85%', once: true } });

    /* 8. Proceso: la línea se llena con el scroll y cada paso se enciende. */
    gsap.fromTo('#trackFill', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps-wrap', start: 'top 80%', end: 'bottom 60%', scrub: 0.5 } });
    gsap.from('.steps li', { autoAlpha: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 80%', once: true } });
    gsap.from('.node', { scale: 0.3, duration: 0.6, stagger: 0.15, ease: 'back.out(3)', scrollTrigger: { trigger: '.steps', start: 'top 80%', once: true } });

    /* 9. Equipo: los retratos se descubren y luego flotan a distinta velocidad. */
    gsap.utils.toArray('.person').forEach(function (p, i) {
      var img = p.querySelector('img');
      gsap.fromTo(img, { clipPath: 'inset(0% 0% 100% 0% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 22px)', duration: 1.2, delay: i * 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: '.people', start: 'top 80%', once: true } });
      gsap.to(p, { y: -30 - i * 25, ease: 'none', scrollTrigger: { trigger: '.people', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    });
    gsap.from('.person .name, .person .role', { autoAlpha: 0, y: 14, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.people', start: 'top 70%', once: true } });

    /* 10. Preguntas y cierre. */
    gsap.from('.qa details', { autoAlpha: 0, y: 20, duration: 0.7, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.qa', start: 'top 85%', once: true } });
    gsap.from('#ctaVid', { scale: 1.3, ease: 'none', scrollTrigger: { trigger: '#contacto', start: 'top bottom', end: 'bottom bottom', scrub: 0.8 } });
    gsap.from('#contacto .lead, #contacto .btn, .contact-facts > div', { autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '#contacto', start: 'top 70%', once: true } });

    /* 11. Celular y tarjetas de vidrio siguen al puntero. */
    if (finePointer) {
      var rx = gsap.quickTo('#phone', 'rotationY', { duration: 0.8, ease: 'power3' });
      var stage = document.getElementById('stage');
      stage.addEventListener('pointermove', function (e) { rx((e.clientX / window.innerWidth - 0.5) * 18); }, { passive: true });
      stage.addEventListener('pointerleave', function () { rx(0); });
      document.querySelectorAll('.glass').forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
          card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        }, { passive: true });
      });
    }

    ScrollTrigger.refresh();
    }

    var t = 0;
    function refresh() { clearTimeout(t); t = setTimeout(function () { ScrollTrigger.refresh(); }, 150); }
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }

  applyLang(lang);
  syncMotion();
  motion();
})();
