/* ---------- Immersive layer: ambient field, intro, transitions, motifs, micro-interactions, fullscreen ---------- */
const motionOK = () => !(Store.s.settings.reduceMotion || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches));
const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };

/* ================= Ambient particle field (behind the whole app) ================= */
const AMB = { cv: null, g: null, pts: [], raf: 0, tint: [139, 92, 246], tint2: [34, 211, 238], target: [139, 92, 246], target2: [34, 211, 238], mx: -999, my: -999, w: 0, h: 0 };
function ambientInit() {
  const cv = $('#ambient'); if (!cv) return;
  AMB.cv = cv; AMB.g = cv.getContext('2d');
  const size = () => { const d = Math.min(1.5, devicePixelRatio || 1); AMB.w = innerWidth; AMB.h = innerHeight; cv.width = AMB.w * d; cv.height = AMB.h * d; AMB.g.setTransform(d, 0, 0, d, 0, 0); const n = Math.round(Math.min(70, AMB.w * AMB.h / 22000)); while (AMB.pts.length < n) AMB.pts.push({ x: Math.random() * AMB.w, y: Math.random() * AMB.h, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, r: .6 + Math.random() * 1.6, p: Math.random() * 6.28 }); AMB.pts.length = n; ambientDraw(0); };
  addEventListener('resize', size); size();
  addEventListener('pointermove', e => { AMB.mx = e.clientX; AMB.my = e.clientY; }, { passive: true });
  let last = performance.now();
  const loop = now => {
    AMB.raf = requestAnimationFrame(loop);
    if (document.hidden || !motionOK()) return;
    if (now - last < 33) return; // ~30 fps is plenty for a background
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    ambientDraw(dt);
  };
  AMB.raf = requestAnimationFrame(loop);
}
function ambientTint(hex, hex2) { AMB.target = hexRGB(hex || '#8b5cf6'); AMB.target2 = hexRGB(hex2 || '#22d3ee'); if (!motionOK()) { AMB.tint = AMB.target.slice(); AMB.tint2 = AMB.target2.slice(); ambientDraw(0); } }
function ambientDraw(dt) {
  const { g, w, h } = AMB; if (!g) return;
  for (let i = 0; i < 3; i++) { AMB.tint[i] += (AMB.target[i] - AMB.tint[i]) * Math.min(1, dt * 2); AMB.tint2[i] += (AMB.target2[i] - AMB.tint2[i]) * Math.min(1, dt * 2); }
  const light = document.body.classList.contains('light'), A = light ? .55 : 1, t = performance.now() / 1000;
  g.clearRect(0, 0, w, h);
  // slow aurora blobs
  const blob = (x, y, r, c, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${c.map(Math.round)},${a})`); gr.addColorStop(1, `rgba(${c.map(Math.round)},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
  blob(w * (.78 + .06 * Math.sin(t * .07)), h * (.08 + .05 * Math.cos(t * .05)), Math.max(w, h) * .45, AMB.tint, .10 * A);
  blob(w * (.12 + .05 * Math.cos(t * .06)), h * (.95 + .04 * Math.sin(t * .08)), Math.max(w, h) * .38, AMB.tint2, .07 * A);
  // particles with soft links
  const P = AMB.pts, link = 120;
  for (const p of P) {
    p.x += p.vx * dt * 60; p.y += p.vy * dt * 60; p.p += dt;
    const dx = p.x - AMB.mx, dy = p.y - AMB.my, d2 = dx * dx + dy * dy;
    if (d2 < 140 * 140 && d2 > 1) { const f = (1 - Math.sqrt(d2) / 140) * .6; p.x += dx / Math.sqrt(d2) * f; p.y += dy / Math.sqrt(d2) * f; }
    if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10; if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
  }
  g.lineWidth = .7;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
    const a = P[i], b = P[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
    if (d2 < link * link) { g.strokeStyle = `rgba(${AMB.tint.map(Math.round)},${(1 - Math.sqrt(d2) / link) * .16 * A})`; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
  }
  for (const p of P) { const tw = .45 + .35 * Math.sin(p.p * 1.3); g.fillStyle = `rgba(${(p.r > 1.6 ? AMB.tint2 : AMB.tint).map(Math.round)},${tw * .8 * A})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.29); g.fill(); }
}

/* ================= Intro splash (once per browser session) ================= */
function introRun() {
  const el = $('#intro'); if (!el) return;
  let seen = false; try { seen = sessionStorage.getItem('physlab.intro') === '1'; sessionStorage.setItem('physlab.intro', '1'); } catch (e) { }
  if (seen || !motionOK()) { el.remove(); return; }
  el.hidden = false;
  const done = () => { if (!el.isConnected) return; el.classList.add('out'); setTimeout(() => el.remove(), 650); };
  el.addEventListener('click', done); addEventListener('keydown', done, { once: true });
  setTimeout(done, 1700);
}

/* ================= Experiment motifs (animated scenes in banners and cards) ================= */
const MOTIF = {
  newton(g, w, h, t, c) {
    const wide = w / h > 2.4, cx = w * (wide ? .5 : .72), cy = h * .5, k = Math.min(w, h) * (wide ? .11 : .085), ph = (t * .25) % 1;
    for (let n = 1; n <= 26; n++) { const r = k * Math.sqrt(n - ph); if (r > Math.max(w, h)) break; g.strokeStyle = rgbStr(c, Math.max(0, .55 - n * .018)); g.lineWidth = Math.max(.6, 5 / Math.sqrt(n)); g.beginPath(); g.arc(cx, cy, r, 0, 6.29); g.stroke(); }
    SG.glow(g, cx, cy, k * 1.2, c, .25);
  },
  diffraction(g, w, h, t, c) {
    const cx = w * (w / h > 2.4 ? .52 : .7), sc = w * (w / h > 2.4 ? .025 : .045) * (1 + .12 * Math.sin(t * .8));
    for (let x = 0; x < w; x += 2) { const u = (x - cx) / sc; const I = u === 0 ? 1 : (Math.sin(u) / u) ** 2; g.fillStyle = rgbStr(c, Math.min(.9, Math.pow(I, .45) * .85)); g.fillRect(x, 0, 2, h); }
    g.strokeStyle = rgbStr(c, .35); g.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { const r = ((t * 40 + i * 30) % 180); g.beginPath(); g.arc(w * .28, h * .5, r, -1, 1); g.stroke(); }
  },
  led(g, w, h, t, c) {
    const cx = w * (w / h > 2.4 ? .5 : .72), cy = h * .55;
    SG.glow(g, cx, cy, h * .55, c, .35 + .1 * Math.sin(t * 2));
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283 + t * .2, d = ((t * 60 + i * 37) % (w * .4)); const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .7; g.strokeStyle = rgbStr(c, Math.max(0, .7 - d / (w * .4))); g.lineWidth = 1.6; g.beginPath(); for (let s = 0; s < 18; s++) { const dd = d - s * 1.5, xx = cx + Math.cos(a) * dd - Math.sin(a) * Math.sin(dd * .5) * 3, yy = cy + Math.sin(a) * dd * .7 + Math.cos(a) * Math.sin(dd * .5) * 3; s ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
    g.fillStyle = rgbStr(c, .9); g.beginPath(); g.arc(cx, cy, 6, 0, 6.29); g.fill();
  },
  diode(g, w, h, t, c) {
    const jx = w * .68, dw = w * .06 * (1 + .4 * Math.sin(t * .6));
    g.fillStyle = rgbStr([244, 114, 182], .07); g.fillRect(w * .4, 0, jx - w * .4, h); g.fillStyle = rgbStr([96, 165, 250], .08); g.fillRect(jx, 0, w - jx, h);
    g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(jx - dw / 2, 0, dw, h);
    for (let i = 0; i < 26; i++) { const r = (i * 97.13) % 1, y = (i * 53.7 % h), hole = i % 2 === 0; let x = hole ? w * .42 + ((r * 300 + t * 22) % (jx - dw / 2 - w * .42)) : jx + dw / 2 + ((r * 300 + t * 22) % (w - jx - dw / 2)); if (hole) { g.strokeStyle = 'rgba(244,114,182,.65)'; g.lineWidth = 1.4; g.beginPath(); g.arc(x, y, 3.2, 0, 6.29); g.stroke(); } else { x = w - ((r * 300 + t * 22) % (w - jx - dw / 2)); g.fillStyle = 'rgba(96,165,250,.75)'; g.beginPath(); g.arc(x, y, 3, 0, 6.29); g.fill(); } }
  },
  photo(g, w, h, t, c) {
    const px = w * .8;
    g.fillStyle = 'rgba(251,191,36,.55)'; g.fillRect(px, h * .15, 5, h * .7);
    for (let i = 0; i < 5; i++) { const y = h * (.25 + i * .12), off = (t * 90 + i * 40) % (px - w * .3); g.strokeStyle = rgbStr(c, .6); g.lineWidth = 1.5; g.beginPath(); for (let x = 0; x < 60; x += 2) { const xx = w * .3 + off - x; if (xx < w * .3 || xx > px) continue; const yy = y + Math.sin((xx) * .25) * 3.5; x ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
    for (let i = 0; i < 7; i++) { const d = (t * 50 + i * 23) % (w * .25); g.fillStyle = `rgba(34,211,238,${Math.max(0, .8 - d / (w * .25))})`; g.beginPath(); g.arc(px - 6 - d, h * (.2 + (i * .11) % .6) + Math.sin(i + d * .05) * 6, 2.8, 0, 6.29); g.fill(); }
  },
  pendulum(g, w, h, t, c) {
    const px = w * (w / h > 2.4 ? .5 : .72), py = h * .1, L = h * .82, th = .35 * Math.sin(t * 2.1);
    g.strokeStyle = rgbStr(c, .25); g.lineWidth = 1.2; g.setLineDash([4, 5]); g.beginPath(); g.arc(px, py, L * .78, Math.PI / 2 - .38, Math.PI / 2 + .38); g.stroke(); g.setLineDash([]);
    g.save(); g.translate(px, py); g.rotate(th); g.fillStyle = rgbStr(c, .18); g.strokeStyle = rgbStr(c, .75); g.lineWidth = 1.5; SG.rr(g, -8, -10, 16, L, 5); g.fill(); g.stroke();
    for (let y = 8; y < L - 12; y += 14) { g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.arc(0, y, 2.4, 0, 6.29); g.fill(); }
    g.fillStyle = rgbStr(c, .9); g.beginPath(); g.arc(0, L * .45, 4.5, 0, 6.29); g.fill(); g.restore();
    g.fillStyle = '#fbbf24'; g.beginPath(); g.moveTo(px - 7, py + 4); g.lineTo(px + 7, py + 4); g.lineTo(px, py - 5); g.fill();
  },
  solar(g, w, h, t, c) {
    const sx = w * .9, sy = h * .05;
    SG.glow(g, sx, sy, h * .9, c, .4);
    for (let i = 0; i < 12; i++) { const a = Math.PI * .5 + i / 12 * Math.PI * .5 + Math.sin(t * .5) * .03, r0 = h * .25, r1 = h * (1.2 + .1 * Math.sin(t * 2 + i)); g.strokeStyle = rgbStr(c, .3); g.lineWidth = 1.4; g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); g.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); g.stroke(); }
    const x0 = w * .48, y0 = h * .55, cw = w * .3, ch = h * .38;
    g.fillStyle = 'rgba(30,58,138,.55)'; g.fillRect(x0, y0, cw, ch); g.strokeStyle = 'rgba(147,197,253,.55)'; g.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(x0 + cw * i / 4, y0); g.lineTo(x0 + cw * i / 4, y0 + ch); g.stroke(); } for (let j = 0; j <= 2; j++) { g.beginPath(); g.moveTo(x0, y0 + ch * j / 2); g.lineTo(x0 + cw, y0 + ch * j / 2); g.stroke(); }
    const sh = (t * .4) % 1.6 - .3; const gr = g.createLinearGradient(x0 + cw * sh, y0, x0 + cw * (sh + .25), y0 + ch); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x0, y0, cw, ch);
  },
  sonometer(g, w, h, t, c) {
    const x0 = w * .3, x1 = w * .95, y = h * .55;
    if (w / h < 2.4) { g.fillStyle = 'rgba(138,85,35,.35)'; g.fillRect(x0 - 10, y + 14, x1 - x0 + 20, h * .25); }
    [[1, .9, c], [2, .45, [244, 114, 182]], [3, .25, [34, 211, 238]]].forEach(([p, a, col]) => {
      const amp = h * .22 * a * Math.cos(t * (2 + p));
      g.strokeStyle = rgbStr(col, .75 * a + .1); g.lineWidth = 1.6; g.beginPath();
      for (let x = x0; x <= x1; x += 3) { const yy = y - amp * Math.sin(p * Math.PI * (x - x0) / (x1 - x0)); x === x0 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke();
    });
    [x0, x1].forEach(x => { g.fillStyle = '#e2e8f0'; g.beginPath(); g.moveTo(x - 6, y + 14); g.lineTo(x + 6, y + 14); g.lineTo(x, y); g.fill(); });
  }
};
const MOTIF_LOOPS = new Set();
function stopMotifs() { MOTIF_LOOPS.forEach(f => f()); MOTIF_LOOPS.clear(); }
function mountMotif(cv, id, { animate = true, hoverOnly = false } = {}) {
  const e = expById(id); if (!cv || !e || !MOTIF[id]) return;
  const g = cv.getContext('2d'), c = hexRGB(e.color);
  let raf = 0, running = false, visible = true, t0 = performance.now(), last = 0;
  const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); cv.width = Math.max(1, r.width * d); cv.height = Math.max(1, r.height * d); g.setTransform(d, 0, 0, d, 0, 0); };
  const frame = (now = performance.now()) => { const r = cv.getBoundingClientRect(); g.clearRect(0, 0, r.width, r.height); try { MOTIF[id](g, r.width, r.height, (now - t0) / 1000 + 2, c); } catch (x) { } };
  const loop = now => { if (!running) return; raf = requestAnimationFrame(loop); if (!visible || document.hidden || now - last < 30) return; last = now; frame(now); };
  const start = () => { if (running || !motionOK()) return; running = true; raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  size(); frame();
  const ro = window.ResizeObserver ? new ResizeObserver(() => { size(); frame(); }) : null; ro && ro.observe(cv);
  let io = null;
  if (window.IntersectionObserver) { io = new IntersectionObserver(en => { visible = en[0].isIntersecting; }); io.observe(cv); }
  if (hoverOnly) { const host = cv.closest('.exp-card') || cv.parentElement; host.addEventListener('pointerenter', start); host.addEventListener('pointerleave', stop); }
  else if (animate) start();
  MOTIF_LOOPS.add(() => { stop(); ro && ro.disconnect(); io && io.disconnect(); });
}

/* ================= Micro-interactions ================= */
function bindSpotlight() {
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.card, .exp-card, .hero');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
  // 3D tilt for experiment cards (mouse only)
  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !motionOK()) return;
    const card = e.target.closest && e.target.closest('.exp-card'); if (!card) return;
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateY(-4px)`;
  }, { passive: true });
  document.addEventListener('pointerout', e => { const card = e.target.closest && e.target.closest('.exp-card'); if (card && !card.contains(e.relatedTarget)) card.style.transform = ''; });
  // ripple on buttons
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('.btn, .chip, .option'); if (!b || !motionOK() || b.disabled) return;
    const r = b.getBoundingClientRect(), s = document.createElement('span'), d = Math.max(r.width, r.height) * 2;
    s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.appendChild(s); setTimeout(() => s.remove(), 650);
  });
  // magnetic hero chips parallax
  document.addEventListener('pointermove', e => {
    const hero = $('.hero'); if (!hero || !motionOK()) return;
    const r = hero.getBoundingClientRect(); if (e.clientY > r.bottom + 100) return;
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    $$('.hero-chip', hero).forEach(c => { const k = +c.dataset.depth || 1; c.style.transform = `translate(${(-x * 18 * k).toFixed(1)}px, ${(-y * 14 * k).toFixed(1)}px)`; });
  }, { passive: true });
}
function countUp(root) {
  $$('.stat .v', root).forEach(el => {
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (!tn) return;
    const m = tn.textContent.match(/^(\s*)(\d+(?:\.\d+)?)(.*)$/s); if (!m) return;
    const target = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length; if (!target) return;
    if (!motionOK()) return;
    const t0 = performance.now(), dur = 900;
    const step = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); tn.textContent = m[1] + (target * e).toFixed(dec) + m[3]; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
let revealIO = null;
function revealAll(root) {
  const items = $$('.card, .exp-card, .qa, .calc-step, .plan-task, .formula-card, .result-box, .complete-bar', root).filter(el => !el.closest('.paper') && !el.closest('.sim-panel'));
  if (!motionOK() || !window.IntersectionObserver) return;
  if (revealIO) revealIO.disconnect();
  let shown = 0;
  revealIO = new IntersectionObserver(ents => ents.forEach(en => { if (en.isIntersecting) { const el = en.target; el.style.setProperty('--rd', (Math.min(shown++, 10) * 45) + 'ms'); el.classList.add('rv-in'); revealIO.unobserve(el); setTimeout(() => shown = Math.max(0, shown - 1), 400); } }), { rootMargin: '0px 0px -6% 0px' });
  items.forEach(el => { if (el.classList.contains('rv-in')) return; el.classList.add('rv'); revealIO.observe(el); });
}
function scrollProgress() {
  const bar = $('#scrollBar'); if (!bar) return;
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${h > 20 ? Math.min(1, scrollY / h) : 0})`;
}

/* ================= Fullscreen for simulations and diagrams ================= */
function toggleFullscreen(el) {
  if (!el) return;
  const fs = document.fullscreenElement || document.webkitFullscreenElement;
  if (fs) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else if (el.requestFullscreen) el.requestFullscreen().catch(() => toast('Fullscreen not available here', 'alert-circle'));
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else toast('Fullscreen not supported in this browser', 'alert-circle');
}
document.addEventListener('fullscreenchange', () => {
  $$('[data-fs]').forEach(b => { const on = !!document.fullscreenElement; b.innerHTML = icon(on ? 'minimize-2' : 'maximize-2') + `<span>${on ? 'Exit full screen' : 'Full screen'}</span>`; });
  refreshIcons();
  window.dispatchEvent(new Event('resize'));
});

/* ================= Hook called after every route render ================= */
function immersiveAfterRoute() {
  const { parts } = parseHash(), e = parts[0] === 'exp' || parts[0] === 'record' ? expById(parts[1]) : null;
  ambientTint(e ? e.color : '#8b5cf6', e ? e.color2 : '#22d3ee');
  $$('canvas[data-motif]').forEach(cv => mountMotif(cv, cv.dataset.motif, { hoverOnly: cv.classList.contains('card-motif') }));
  // fullscreen buttons on simulations and diagrams
  const simTb = $('.sim-toolbar');
  if (simTb && !$('[data-fs]', simTb)) { simTb.insertAdjacentHTML('beforeend', `<button class="btn sm" data-fs="sim">${icon('maximize-2')}<span>Full screen</span></button>`); $('[data-fs]', simTb).onclick = () => toggleFullscreen($('.sim')); }
  const dw = $('.diagram-wrap');
  if (dw && !dw.closest('#diagCard') && !$('[data-fs]', dw.parentElement)) { dw.insertAdjacentHTML('beforebegin', `<div class="row" style="justify-content:flex-end;margin:-6px 0 10px"><button class="btn sm" data-fs="diagram">${icon('maximize-2')}<span>Full screen</span></button></div>`); $('[data-fs="diagram"]').onclick = () => toggleFullscreen(dw); }
  countUp($('#view'));
  revealAll($('#view'));
  scrollProgress();
  refreshIcons();
}
function immersiveBoot() {
  ambientInit(); introRun(); bindSpotlight();
  addEventListener('scroll', scrollProgress, { passive: true });
  addEventListener('resize', scrollProgress);
}
/* View-transition wrapper for route changes */
function routeWithTransition() {
  if (document.startViewTransition && motionOK() && !document.fullscreenElement) { try { document.startViewTransition(() => route()); return; } catch (e) { } }
  route();
}
