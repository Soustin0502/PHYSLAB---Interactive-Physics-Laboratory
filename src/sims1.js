/* ---------- Simulation framework + sims 1–4 ---------- */
const SIMS = {};
let activeSim = null;
const SG = {
  txt(g, s, x, y, c = '#cbd5e1', sz = 12, al = 'left', w = 500) { g.fillStyle = c; g.font = `${w} ${sz}px Inter, system-ui, sans-serif`; g.textAlign = al; g.textBaseline = 'alphabetic'; g.fillText(s, x, y); },
  mono(g, s, x, y, c = '#22d3ee', sz = 12, al = 'left') { g.fillStyle = c; g.font = `500 ${sz}px 'JetBrains Mono', Consolas, monospace`; g.textAlign = al; g.fillText(s, x, y); },
  rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); },
  panel(g, x, y, w, h) { SG.rr(g, x, y, w, h, 10); g.fillStyle = 'rgba(15,19,28,.88)'; g.fill(); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; g.stroke(); },
  line(g, x1, y1, x2, y2, c, w = 1.5, dash) { g.strokeStyle = c; g.lineWidth = w; g.setLineDash(dash || []); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]); },
  /* mini plot: pts in data coords; box {x,y,w,h}; ranges */
  plot(g, b, xr, yr, curves, marks = [], labels = {}) {
    SG.panel(g, b.x, b.y, b.w, b.h);
    const L = b.x + 34, R = b.x + b.w - 10, T = b.y + 22, B = b.y + b.h - 22;
    const X = x => L + (x - xr[0]) / (xr[1] - xr[0]) * (R - L), Y = y => B - (y - yr[0]) / (yr[1] - yr[0]) * (B - T);
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const yy = T + (B - T) * i / 4; g.beginPath(); g.moveTo(L, yy); g.lineTo(R, yy); g.stroke(); }
    if (xr[0] < 0 && xr[1] > 0) SG.line(g, X(0), T, X(0), B, 'rgba(255,255,255,.25)', 1);
    if (yr[0] < 0 && yr[1] > 0) SG.line(g, L, Y(0), R, Y(0), 'rgba(255,255,255,.25)', 1);
    SG.line(g, L, B, R, B, 'rgba(255,255,255,.3)', 1); SG.line(g, L, T, L, B, 'rgba(255,255,255,.3)', 1);
    g.save(); g.beginPath(); g.rect(L, T - 4, R - L, B - T + 8); g.clip();
    curves.forEach(c => { g.strokeStyle = c.color; g.lineWidth = c.w || 2; g.setLineDash(c.dash || []); g.beginPath(); c.pts.forEach((p, i) => { const px = X(p[0]), py = Y(p[1]); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke(); g.setLineDash([]); });
    marks.forEach(m => { g.fillStyle = m.color; g.beginPath(); g.arc(X(m.x), Y(m.y), m.r || 5, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); });
    g.restore();
    if (labels.title) SG.txt(g, labels.title, b.x + 10, b.y + 15, '#a4abbe', 11, 'left', 600);
    if (labels.x) SG.txt(g, labels.x, R, B + 15, '#6f7790', 10, 'right');
    if (labels.y) SG.txt(g, labels.y, L + 4, T + 8, '#6f7790', 10, 'left');
    return { X, Y };
  },
  glow(g, x, y, r, rgb, a) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgbStr(rgb, a)); gr.addColorStop(1, rgbStr(rgb, 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
};

function mountSim(host, id) {
  const def = SIMS[id];
  if (activeSim) activeSim.destroy();
  const st = { t: 0, playing: !!def.autoplay };
  def.controls.forEach(c => st[c.k] = c.val);
  (def.selects || []).forEach(s => st[s.k] = s.val);
  if (def.init) def.init(st);
  host.innerHTML = `<div class="sim">
    <div class="sim-col"><div class="sim-stage" id="simStage" tabindex="0" aria-label="${esc(def.title)} simulation canvas. Press space to play or pause.">
      <canvas id="simCanvas"></canvas></div>
      <div class="sim-toolbar">
        <button class="btn sm primary" id="simPlay">${icon('play')}<span>Play</span></button>
        <button class="btn sm" id="simReset">${icon('rotate-ccw')}<span>Reset</span></button>
        ${(def.buttons || []).map((b, i) => `<button class="btn sm" data-sb="${i}">${icon(b.icon || 'sparkles')}<span>${b.label}</span></button>`).join('')}
        <span class="spacer"></span><span class="dim" style="font-size:12px">Click the canvas, then Space = play/pause</span>
      </div>
    </div>
    <div class="sim-panel">
      <div class="card" style="padding:16px"><h3 style="font-size:14px;margin-bottom:12px">${icon('sliders-horizontal')} Controls</h3><div id="simCtrls" style="display:flex;flex-direction:column;gap:14px"></div></div>
      <div class="card" style="padding:16px"><h3 style="font-size:14px;margin-bottom:12px">${icon('activity')} Live values</h3><div class="readouts" id="simRead"></div></div>
      ${def.note ? `<div class="callout cyan" style="margin:0;font-size:13px">${def.note}</div>` : ''}
    </div></div>`;
  const ctrlBox = $('#simCtrls', host);
  const buildCtrls = () => {
    ctrlBox.innerHTML = (def.selects || []).map(s => `<div class="ctrl"><div class="lbl"><span>${s.label}</span></div><div class="seg" role="group" aria-label="${esc(s.label)}">${s.options.map(o => `<button data-sel="${s.k}" data-v="${o[0]}" class="${String(st[s.k]) === String(o[0]) ? 'on' : ''}" aria-pressed="${String(st[s.k]) === String(o[0])}">${o[1]}</button>`).join('')}</div></div>`).join('') +
      def.controls.map(c => `<div class="ctrl"><div class="lbl"><label for="sl-${c.k}">${c.label}</label><b id="sv-${c.k}">${c.fmt ? c.fmt(st[c.k]) : st[c.k]} ${c.unit || ''}</b></div><input type="range" id="sl-${c.k}" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${st[c.k]}"></div>`).join('');
    $$('input[type=range]', ctrlBox).forEach(setRangeFill);
  };
  buildCtrls();
  const syncSliders = () => def.controls.forEach(c => { const el = $('#sl-' + c.k, host); if (el) { el.value = st[c.k]; setRangeFill(el); $('#sv-' + c.k, host).textContent = `${c.fmt ? c.fmt(st[c.k]) : st[c.k]} ${c.unit || ''}`; } });
  ctrlBox.addEventListener('input', e => {
    const k = e.target.dataset.k; if (!k) return;
    st[k] = parseFloat(e.target.value); setRangeFill(e.target);
    const c = def.controls.find(c => c.k === k);
    $('#sv-' + k, host).textContent = `${c.fmt ? c.fmt(st[k]) : st[k]} ${c.unit || ''}`;
    def.onChange && def.onChange(st, k); st.dirty = true; touched();
  });
  ctrlBox.addEventListener('click', e => {
    const b = e.target.closest('[data-sel]'); if (!b) return;
    const s = def.selects.find(s => s.k === b.dataset.sel);
    const v = s.options.find(o => String(o[0]) === b.dataset.v)[0];
    st[s.k] = v; def.onChange && def.onChange(st, s.k); st.dirty = true;
    $$(`[data-sel="${s.k}"]`, ctrlBox).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    touched();
  });
  let touchedOnce = false;
  function touched() { if (!touchedOnce) { touchedOnce = true; Store.s.simUse = (Store.s.simUse || 0) + 1; saveSoon(); } }
  const playBtn = $('#simPlay', host);
  const setPlay = p => { st.playing = p; playBtn.innerHTML = p ? `${icon('pause')}<span>Pause</span>` : `${icon('play')}<span>Play</span>`; refreshIcons(); };
  playBtn.onclick = () => { setPlay(!st.playing); touched(); };
  $('#simReset', host).onclick = () => {
    def.controls.forEach(c => st[c.k] = c.val); (def.selects || []).forEach(s => st[s.k] = s.val);
    st.t = 0; st.vpend = null; if (def.init) def.init(st); st.dirty = true; buildCtrls(); setPlay(!!def.autoplay); refreshIcons();
  };
  $$('[data-sb]', host).forEach(b => b.onclick = () => { def.buttons[+b.dataset.sb].fn(st, syncSliders, setPlay); st.dirty = true; touched(); });
  const stage = $('#simStage', host);
  stage.addEventListener('keydown', e => { if (e.key === ' ') { e.preventDefault(); setPlay(!st.playing); } });
  const cv = $('#simCanvas', host), g = cv.getContext('2d');
  let W = 0, H = 0, raf = 0, last = performance.now(), readTimer = 0, alive = true;
  const resize = () => {
    const r = stage.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(300, r.width); const fsEl = document.fullscreenElement; H = fsEl && fsEl.contains(stage) ? Math.max(360, window.innerHeight - 110) : (window.innerWidth < 560 ? 360 : 460);
    stage.style.height = H + 'px'; cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0); st.dirty = true;
  };
  const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
  ro ? ro.observe(stage) : window.addEventListener('resize', resize);
  resize();
  const readEl = $('#simRead', host);
  const loop = now => {
    if (!alive) return;
    let dt = Math.min(.05, (now - last) / 1000); last = now;
    if (st.playing) { st.t += dt; def.step && def.step(st, dt); }
    g.clearRect(0, 0, W, H);
    try { def.draw(g, W, H, st, dt); } catch (err) { console.error(err); }
    st.dirty = false;
    readTimer -= dt;
    if (readTimer <= 0) { readTimer = .12; readEl.innerHTML = def.readouts(st).map(r => `<div class="readout"><span>${r[0]}</span><b>${r[1]}</b></div>`).join(''); }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  setPlay(!!def.autoplay);
  activeSim = { id, st, def, host, sync: syncSliders, destroy() { alive = false; cancelAnimationFrame(raf); ro && ro.disconnect(); def.onDestroy && def.onDestroy(st); activeSim = null; } };
  if (def.afterMount) { try { def.afterMount(host, st, syncSliders); } catch (err) { console.error(err); } }
  return activeSim;
}

/* ===== 1. Newton's rings ===== */
SIMS.newton = {
  title: "Newton's rings", autoplay: false,
  controls: [
    { k: 'lam', label: 'Wavelength λ', min: 400, max: 700, step: 0.1, val: 589.3, unit: 'nm', fmt: v => v.toFixed(1) },
    { k: 'R', label: 'Radius of curvature R', min: 0.3, max: 2.5, step: 0.01, val: 1.0, unit: 'm', fmt: v => v.toFixed(2) },
    { k: 'mu', label: 'Film refractive index μ', min: 1, max: 1.6, step: 0.01, val: 1.0, unit: '', fmt: v => v.toFixed(2) },
    { k: 'gap', label: 'Lens lift (gap at centre)', min: 0, max: 1200, step: 1, val: 0, unit: 'nm', fmt: v => v.toFixed(0) },
    { k: 'n', label: 'Highlight dark ring n', min: 1, max: 20, step: 1, val: 5, unit: '' }
  ],
  selects: [{ k: 'view', label: 'Observation', options: [['ref', 'Reflected'], ['tra', 'Transmitted']], val: 'ref' }],
  note: 'Press <b>Play</b> to slowly lift the lens: every ring moves inward and vanishes at the centre — one ring per λ/2 of lift. Pixel intensity is computed from I ∝ sin²(2πμt/λ).',
  step(st, dt) { st.gap = (st.gap + dt * 120) % 1200; const el = document.getElementById('sl-gap'); if (el) { el.value = st.gap; setRangeFill(el); document.getElementById('sv-gap').textContent = st.gap.toFixed(0) + ' nm'; } },
  init(st) { st.cache = null; },
  draw(g, W, H, st) {
    const S = Math.min(H - 30, W * .58), cx = 15 + S / 2, cy = H / 2;
    const N = 360, key = [st.lam, st.R, st.mu, st.gap, st.view].join('|');
    if (!st.off) { st.off = document.createElement('canvas'); st.off.width = st.off.height = N; }
    if (st.cache !== key) {
      const og = st.off.getContext('2d'), img = og.createImageData(N, N), d = img.data;
      const half = 3.5e-3, lam = st.lam * 1e-9, col = waveRGB(st.lam);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = (i - N / 2 + .5) / (N / 2) * half, y = (j - N / 2 + .5) / (N / 2) * half, r2 = x * x + y * y;
        const t = r2 / (2 * st.R) + st.gap * 1e-9;
        const s = Math.sin(2 * Math.PI * st.mu * t / lam); let I = s * s;
        if (st.view === 'tra') I = .55 + .45 * (1 - I);
        const vig = Math.max(0, 1 - r2 / (half * half) * .55), k = (i * N + j) * 0 + (j * N + i) * 4;
        d[k] = col[0] * I * vig; d[k + 1] = col[1] * I * vig; d[k + 2] = col[2] * I * vig; d[k + 3] = r2 <= half * half ? 255 : 0;
      }
      og.putImageData(img, 0, 0); st.cache = key;
    }
    g.save(); g.beginPath(); g.arc(cx, cy, S / 2, 0, 7); g.clip(); g.imageSmoothingEnabled = true; g.drawImage(st.off, cx - S / 2, cy - S / 2, S, S); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, S / 2, 0, 7); g.stroke();
    SG.line(g, cx - S / 2, cy, cx + S / 2, cy, 'rgba(255,255,255,.25)', 1); SG.line(g, cx, cy - S / 2, cx, cy + S / 2, 'rgba(255,255,255,.25)', 1);
    const rn2 = st.R * (st.n * st.lam * 1e-9 / st.mu - 2 * st.gap * 1e-9);
    if (rn2 > 0) { const rp = Math.sqrt(rn2) / 3.5e-3 * S / 2; if (rp < S / 2) { g.strokeStyle = '#22d3ee'; g.setLineDash([5, 4]); g.lineWidth = 1.6; g.beginPath(); g.arc(cx, cy, rp, 0, 7); g.stroke(); g.setLineDash([]); SG.line(g, cx - rp, cy + 14, cx + rp, cy + 14, '#22d3ee', 1.5); SG.mono(g, `D${st.n}`, cx, cy + 28, '#22d3ee', 12, 'center'); } }
    SG.txt(g, 'Field of view: 7 mm × 7 mm', 20, 22, '#6f7790', 11);
    // cross-section panel
    const px = S + 40, pw = W - px - 15;
    if (pw > 150) {
      SG.panel(g, px, 20, pw, 170); SG.txt(g, 'Cross-section (exaggerated)', px + 12, 38, '#a4abbe', 11, 'left', 600);
      const mx = px + pw / 2, by = 160, lift = st.gap / 1200 * 18;
      g.fillStyle = 'rgba(103,232,249,.15)'; g.fillRect(px + 14, by, pw - 28, 12); g.strokeStyle = '#67e8f9'; g.strokeRect(px + 14, by, pw - 28, 12);
      g.beginPath(); g.moveTo(px + 24, by - 50 - lift); g.lineTo(px + pw - 24, by - 50 - lift); g.quadraticCurveTo(mx, by + 50 - lift - 50 + 50 - 0, px + 24, by - 50 - lift);
      g.closePath(); g.fillStyle = 'rgba(165,180,252,.15)'; g.fill(); g.strokeStyle = '#a5b4fc'; g.stroke();
      const colr = rgbStr(waveRGB(st.lam), .8);
      for (let i = -2; i <= 2; i++) SG.line(g, mx + i * 18, 52, mx + i * 18, by - 4, colr, 1, [3, 3]);
      SG.txt(g, 'μ = ' + st.mu.toFixed(2) + (st.mu > 1.001 ? ' (liquid film)' : ' (air film)'), px + 12, by + 30 - 2 + 0, '#cbd5e1', 11);
    }
    // ring diameter table
    const ty = 205, th = H - ty - 15;
    if (pw > 150 && th > 120) {
      SG.panel(g, px, ty, pw, th); SG.txt(g, 'Dark ring diameters (theory)', px + 12, ty + 18, '#a4abbe', 11, 'left', 600);
      const rows = Math.min(8, Math.floor((th - 34) / 18));
      for (let i = 0; i < rows; i++) {
        const n = (i + 1) * 2 + (st.n > 16 ? 4 : 0); const r2 = st.R * (n * st.lam * 1e-9 / st.mu - 2 * st.gap * 1e-9);
        SG.mono(g, `n=${String(n).padStart(2)}`, px + 12, ty + 38 + i * 18, '#8b93a8', 11);
        SG.mono(g, r2 > 0 ? `D=${(2 * Math.sqrt(r2) * 1e3).toFixed(3)} mm` : 'collapsed', px + 62, ty + 38 + i * 18, '#22d3ee', 11);
      }
    }
  },
  readouts(st) {
    const lam = st.lam * 1e-9, rn2 = st.R * (st.n * lam / st.mu - 2 * st.gap * 1e-9);
    const D = rn2 > 0 ? 2 * Math.sqrt(rn2) : NaN;
    const nmax = Math.floor(st.mu * (Math.pow(3.5e-3, 2) / st.R + 2 * st.gap * 1e-9) / lam);
    return [['Ring order n', st.n], ['Radius rₙ', isFinite(D) ? (D / 2 * 1e3).toFixed(3) + ' mm' : '—'], ['Diameter Dₙ', isFinite(D) ? (D * 1e3).toFixed(3) + ' mm' : '—'], ['Dₙ²', isFinite(D) ? (D * D * 1e6).toFixed(3) + ' mm²' : '—'], ['Film thickness at ring', (st.n * st.lam / (2 * st.mu)).toFixed(1) + ' nm'], ['Rings in view', Math.max(0, nmax)], ['Centre', (st.view === 'ref') === (Math.sin(2 * Math.PI * st.mu * st.gap / st.lam) ** 2 < .5) ? 'Dark' : 'Bright'], ['Slope 4λR/μ', (4 * lam * st.R / st.mu * 1e6).toFixed(4) + ' mm²']];
  }
};

/* ===== 2. Single-slit diffraction ===== */
SIMS.diffraction = {
  title: 'Single slit diffraction', autoplay: true,
  controls: [
    { k: 'a', label: 'Slit width a', min: 0.02, max: 0.3, step: 0.005, val: 0.1, unit: 'mm', fmt: v => v.toFixed(3) },
    { k: 'lam', label: 'Wavelength λ', min: 400, max: 700, step: 0.1, val: 632.8, unit: 'nm', fmt: v => v.toFixed(1) },
    { k: 'D', label: 'Slit–screen distance D', min: 0.3, max: 2, step: 0.01, val: 1.0, unit: 'm', fmt: v => v.toFixed(2) }
  ],
  note: 'Top: Huygens wavelets from points across the slit (schematic, not to scale). Bottom: the true Fraunhofer intensity I = I₀(sin β/β)² on a screen ±40 mm wide.',
  draw(g, W, H, st) {
    const col = waveRGB(st.lam), topH = H * .52;
    // wave field
    const gx0 = W * .28, NX = 150, NY = 80, cw = (W - gx0 - 10) / NX, ch = (topH - 20) / NY;
    const lv = 12, ratio = st.a * 1e-3 / (st.lam * 1e-9);
    const aVis = lv * (1.2 + 4.5 * (Math.log(ratio) - Math.log(28)) / (Math.log(750) - Math.log(28)));
    const yc = 10 + (topH - 20) / 2, k = 2 * Math.PI / lv, w = st.t * 9;
    const srcs = []; const Ns = 14; for (let i = 0; i < Ns; i++) srcs.push(yc - aVis / 2 + aVis * (i + .5) / Ns);
    for (let x = 0; x < gx0 - 6; x += 3) { const ph = Math.cos(k * x - w); g.fillStyle = rgbStr(col, Math.max(0, ph) * .5); g.fillRect(x + 6, 10, 3, topH - 20); }
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const px = i * cw + 4, py = 10 + j * ch;
      let s = 0; for (let q = 0; q < Ns; q++) { const dy = py - srcs[q], r = Math.sqrt(px * px + dy * dy) + 1; s += Math.cos(k * r - w) / Math.sqrt(r); }
      const v = s / Ns * 3.2; if (v > 0) { g.fillStyle = rgbStr(col, Math.min(1, v)); g.fillRect(gx0 + i * cw, py, cw + .6, ch + .6); }
    }
    g.fillStyle = '#334155'; g.fillRect(gx0 - 6, 10, 6, yc - aVis / 2 - 10); g.fillRect(gx0 - 6, yc + aVis / 2, 6, topH - 10 - (yc + aVis / 2));
    SG.txt(g, 'a', gx0 - 18, yc + 4, '#22d3ee', 13, 'center', 700);
    SG.txt(g, 'plane wave', 12, 26, '#a4abbe', 11);
    SG.txt(g, 'schematic — not to scale', W - 14, 26, '#6f7790', 11, 'right');
    // screen intensity
    const y0 = topH + 14, sh = 22, pl = 40, pr = W - 20, xr = 40;
    const I = xmm => { const x = xmm * 1e-3, th = Math.atan(x / st.D), b = Math.PI * st.a * 1e-3 * Math.sin(th) / (st.lam * 1e-9); return b === 0 ? 1 : (Math.sin(b) / b) ** 2; };
    for (let px = pl; px < pr; px++) { const xm = (px - pl) / (pr - pl) * 2 * xr - xr; g.fillStyle = rgbStr(col, Math.min(1, Math.pow(I(xm), .42))); g.fillRect(px, y0, 1.2, sh); }
    g.strokeStyle = 'rgba(255,255,255,.15)'; g.strokeRect(pl, y0, pr - pl, sh);
    const py0 = y0 + sh + 12, ph = H - py0 - 26;
    const X = xm => pl + (xm + xr) / (2 * xr) * (pr - pl), Y = v => py0 + ph - v * ph;
    SG.line(g, pl, py0 + ph, pr, py0 + ph, 'rgba(255,255,255,.3)', 1);
    g.strokeStyle = rgbStr(col, 1); g.lineWidth = 2; g.beginPath();
    for (let px = pl; px <= pr; px++) { const xm = (px - pl) / (pr - pl) * 2 * xr - xr; const yy = Y(I(xm)); px === pl ? g.moveTo(px, yy) : g.lineTo(px, yy); } g.stroke();
    g.strokeStyle = 'rgba(167,139,250,.6)'; g.lineWidth = 1.2; g.beginPath();
    for (let px = pl; px <= pr; px++) { const xm = (px - pl) / (pr - pl) * 2 * xr - xr; const yy = Y(Math.min(1, I(xm) * 10)); px === pl ? g.moveTo(px, yy) : g.lineTo(px, yy); } g.stroke();
    for (let n = 1; n <= 6; n++) { const s = n * st.lam * 1e-9 / (st.a * 1e-3); if (s >= 1) break; const xm = st.D * Math.tan(Math.asin(s)) * 1e3; if (xm > xr) break; [xm, -xm].forEach(v => { SG.line(g, X(v), py0, X(v), py0 + ph, 'rgba(34,211,238,.35)', 1, [3, 3]); }); SG.mono(g, `${n}`, X(xm), py0 + ph + 13, '#22d3ee', 10, 'center'); }
    for (let v = -40; v <= 40; v += 10) SG.mono(g, `${v}`, X(v), H - 4, '#6f7790', 10, 'center');
    SG.txt(g, 'x (mm) on screen   — I/I₀   — ×10 (shows secondary maxima)', pl, py0 - 2, '#8b93a8', 10.5);
  },
  readouts(st) {
    const a = st.a * 1e-3, l = st.lam * 1e-9, x1 = st.D * Math.tan(Math.asin(Math.min(1, l / a)));
    return [['1st minimum x₁', (x1 * 1e3).toFixed(2) + ' mm'], ['Central max width', (2 * x1 * 1e3).toFixed(2) + ' mm'], ['Angular half-width', (Math.asin(Math.min(1, l / a)) * 180 / Math.PI).toFixed(3) + '°'], ['2nd minimum x₂', (st.D * Math.tan(Math.asin(Math.min(1, 2 * l / a))) * 1e3).toFixed(2) + ' mm'], ['1st secondary max', '4.72 % I₀'], ['a / λ', (a / l).toFixed(0)], ['Fraunhofer a²/λ', (a * a / l * 100).toFixed(2) + ' cm'], ['λ = a x₁/D', (a * x1 / st.D * 1e9).toFixed(1) + ' nm']];
  }
};

/* ===== 3. LED ===== */
const LED_COLS = [['940', 'IR'], ['630', 'Red'], ['590', 'Yellow'], ['565', 'Green'], ['470', 'Blue']];
function ledModel(st) {
  const lam = +st.col, Eg = 1240 / lam, Vk = Eg - 0.15, nVt = 0.05, Rs = 8, Is = 1e-3 * Math.exp(-Vk / nVt);
  const Vd = I => nVt * Math.log(I / Is + 1) + I * Rs;
  let I = 0;
  if (st.Vs > 0) { let lo = 0, hi = st.Vs / st.R; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (st.Vs - m * st.R - Vd(m) > 0) ? lo = m : hi = m; } I = lo; }
  return { lam, Eg, Vk, I, V: st.Vs > 0 ? Vd(I) : 0, Vd };
}
SIMS.led = {
  title: 'LED', autoplay: true,
  controls: [
    { k: 'Vs', label: 'Supply voltage', min: 0, max: 6, step: 0.01, val: 3.2, unit: 'V', fmt: v => v.toFixed(2) },
    { k: 'R', label: 'Series resistance', min: 100, max: 1000, step: 10, val: 220, unit: 'Ω' }
  ],
  selects: [{ k: 'col', label: 'LED colour (λ)', options: LED_COLS, val: '630' }],
  note: 'Electrons (●) from the n-side and holes (○) from the p-side recombine in the junction; each recombination releases a photon of energy ≈ E<sub>g</sub>. Emission rate ∝ current.',
  init(st) { st.e = []; st.h = []; st.ph = []; st.acc = 0; },
  step(st, dt) {
    const m = ledModel(st); st.m = m;
    st.acc += dt * Math.min(70, m.I / 0.02 * 50);
    while (st.acc > 1) { st.acc--; st.e.push({ x: 1, y: Math.random(), v: .35 + Math.random() * .3 }); st.h.push({ x: 0, y: Math.random(), v: .3 + Math.random() * .3 }); }
    st.e.forEach(p => p.x -= p.v * dt); st.h.forEach(p => p.x += p.v * dt);
    for (const arr of [st.e, st.h]) for (let i = arr.length - 1; i >= 0; i--) { const p = arr[i]; if ((arr === st.e && p.x < .52) || (arr === st.h && p.x > .48)) { arr.splice(i, 1); if (arr === st.e) st.ph.push({ x: .5, y: p.y, a: -Math.PI / 2 + (Math.random() - .5) * 1.6, d: 0, f: 1 }); } }
    st.ph.forEach(p => { p.d += dt * 1.2; }); st.ph = st.ph.filter(p => p.d < 1.4).slice(-160);
  },
  draw(g, W, H, st) {
    const m = st.m || ledModel(st); st.m = ledModel(st);
    const col = waveRGB(m.lam), cx0 = 30, cw = Math.min(W * .58, W - 300), cy0 = H * .38, chh = H * .34;
    const ir = m.lam > 780;
    // chip
    let gr = g.createLinearGradient(cx0, 0, cx0 + cw, 0); gr.addColorStop(0, 'rgba(244,114,182,.18)'); gr.addColorStop(.45, 'rgba(244,114,182,.10)'); gr.addColorStop(.55, 'rgba(96,165,250,.10)'); gr.addColorStop(1, 'rgba(96,165,250,.2)');
    g.fillStyle = gr; SG.rr(g, cx0, cy0, cw, chh, 10); g.fill(); g.strokeStyle = 'rgba(255,255,255,.15)'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(cx0 + cw * .46, cy0, cw * .08, chh);
    SG.txt(g, 'p-type', cx0 + 12, cy0 + chh + 18, '#f9a8d4', 12, 'left', 600); SG.txt(g, 'n-type', cx0 + cw - 12, cy0 + chh + 18, '#93c5fd', 12, 'right', 600); SG.txt(g, 'junction', cx0 + cw / 2, cy0 + chh + 18, '#a4abbe', 11, 'center');
    const P = (x, y) => [cx0 + 8 + x * (cw - 16), cy0 + 8 + y * (chh - 16)];
    (st.h || []).forEach(p => { const [x, y] = P(p.x, p.y); g.strokeStyle = '#f472b6'; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, 4, 0, 7); g.stroke(); });
    (st.e || []).forEach(p => { const [x, y] = P(p.x, p.y); g.fillStyle = '#60a5fa'; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); });
    (st.ph || []).forEach(p => {
      const [x0, y0] = P(p.x, p.y), L = p.d * 200, al = Math.max(0, 1 - p.d / 1.4);
      if (p.d < .12) SG.glow(g, x0, y0, 14, col, .9 * (1 - p.d / .12));
      g.strokeStyle = rgbStr(ir ? [180, 40, 40] : col, al); g.lineWidth = 1.6; g.beginPath();
      for (let s = 0; s <= 26; s++) { const d = L - 26 + s; if (d < 0) continue; const ox = x0 + Math.cos(p.a) * d - Math.sin(p.a) * Math.sin(d * .7) * 3, oy = y0 + Math.sin(p.a) * d + Math.cos(p.a) * Math.sin(d * .7) * 3; s === 0 || d - 1 < 0 ? g.moveTo(ox, oy) : g.lineTo(ox, oy); }
      g.stroke();
    });
    // terminals
    SG.txt(g, '+', cx0 - 14, cy0 + chh / 2 + 5, '#f87171', 16, 'center', 700); SG.txt(g, '−', cx0 + cw + 14, cy0 + chh / 2 + 5, '#60a5fa', 16, 'center', 700);
    // LED bulb
    const bx = cx0 + cw + 120 > W - 130 ? W - 110 : cx0 + cw + 90, by = 70, b = Math.min(1, m.I / 0.02);
    if (!ir && b > 0.002) SG.glow(g, bx, by, 70, col, .25 + .7 * b);
    g.fillStyle = rgbStr(col, ir ? .25 : .25 + .65 * b); g.beginPath(); g.arc(bx, by, 18, Math.PI, 0); g.lineTo(bx + 18, by + 22); g.lineTo(bx - 18, by + 22); g.closePath(); g.fill(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.stroke();
    SG.line(g, bx - 8, by + 22, bx - 8, by + 50, '#94a3b8', 2); SG.line(g, bx + 8, by + 22, bx + 8, by + 44, '#94a3b8', 2);
    SG.txt(g, ir ? 'Infrared — invisible' : 'LED output', bx, by + 66, '#a4abbe', 11, 'center');
    SG.txt(g, `Band gap Eg ≈ ${m.Eg.toFixed(2)} eV  →  λ = ${m.lam} nm`, cx0, 30, '#cbd5e1', 13, 'left', 600);
    SG.txt(g, `Photon energy hν = hc/λ = ${(1240 / m.lam).toFixed(2)} eV`, cx0, 50, '#8b93a8', 12);
    // I-V plot
    const pb = { x: Math.max(cx0 + cw + 20, W - 280), y: H - 190, w: Math.min(260, W - cx0 - cw - 30), h: 170 };
    if (pb.w > 150) {
      const pts = []; for (let I = 0; I <= 0.03; I += 0.0005) pts.push([m.Vd(I), I * 1e3]);
      pts.unshift([0, 0]);
      SG.plot(g, pb, [0, 4], [0, 30], [{ pts, color: rgbStr(ir ? [220, 60, 60] : col, 1) }], [{ x: m.V, y: m.I * 1e3, color: '#fff' }], { title: 'I–V characteristic', x: 'V (V)', y: 'I (mA)' });
    }
  },
  readouts(st) {
    const m = ledModel(st);
    return [['LED voltage', m.V.toFixed(3) + ' V'], ['Current', (m.I * 1e3).toFixed(2) + ' mA'], ['Power', (m.V * m.I * 1e3).toFixed(1) + ' mW'], ['Knee voltage ≈', m.Vk.toFixed(2) + ' V'], ['Wavelength', m.lam + ' nm'], ['Photon energy', (1240 / m.lam).toFixed(2) + ' eV'], ['h = eV_kλ/c', sci(PHYS.e * m.Vk * m.lam * 1e-9 / PHYS.c, 2) + ' J s'], ['Status', m.I > 0.025 ? '⚠ Over-current' : m.I > 1e-4 ? 'Glowing' : 'Below knee']];
  }
};

/* ===== 4. PN junction ===== */
function diodeI(V, T) { const Is = 1e-9 * Math.pow(2, (T - 300) / 10), nVt = 1.9 * 8.617e-5 * T; return Is * (Math.exp(V / nVt) - 1) + V / 1e7; }
function fmtA(I) { const a = Math.abs(I); if (a >= 1e-3) return (I * 1e3).toFixed(3) + ' mA'; if (a >= 1e-6) return (I * 1e6).toFixed(3) + ' µA'; return (I * 1e9).toFixed(2) + ' nA'; }
SIMS.diode = {
  title: 'PN junction', autoplay: true,
  controls: [
    { k: 'V', label: 'Applied bias V', min: -10, max: 0.8, step: 0.01, val: 0, unit: 'V', fmt: v => v.toFixed(2) },
    { k: 'T', label: 'Temperature', min: 280, max: 380, step: 1, val: 300, unit: 'K' }
  ],
  note: 'Forward bias narrows the depletion region and lowers the barrier, so majority carriers flood across. Reverse bias widens it; only a tiny minority-carrier (saturation) current flows. Reverse current roughly doubles every 10 K.',
  init(st) {
    st.c = []; for (let i = 0; i < 90; i++) st.c.push({ t: i % 2 ? 'h' : 'e', x: i % 2 ? Math.random() * .45 : .55 + Math.random() * .45, y: Math.random(), vx: 0, vy: 0, cross: 0 });
    st.acc = 0;
  },
  step(st, dt) {
    const Vbi = .75, W = Math.min(.9, .12 * Math.sqrt(Math.max(.02, Vbi - st.V) / Vbi)), I = diodeI(st.V, st.T);
    st.W = W;
    const rate = st.V > 0 ? Math.min(40, Math.max(0, I / 0.01 * 40)) : Math.min(3, Math.abs(I) / 1e-6 * 1.2);
    st.acc += rate * dt;
    st.c.forEach(p => {
      p.x += (Math.random() - .5) * dt * .25; p.y += (Math.random() - .5) * dt * .3; p.y = clamp(p.y, .02, .98);
      if (p.cross) { p.x += (p.t === 'h' ? 1 : -1) * dt * .6; p.cross -= dt; if (p.cross <= 0) { p.cross = 0; p.x = p.t === 'h' ? Math.random() * .2 : .8 + Math.random() * .2; } return; }
      if (p.t === 'h') p.x = clamp(p.x, .01, .5 - W / 2); else p.x = clamp(p.x, .5 + W / 2, .99);
    });
    while (st.acc > 1) { st.acc--; const cand = st.c.filter(p => !p.cross); if (cand.length) { const p = cand[Math.floor(Math.random() * cand.length)]; p.cross = .9; p.x = p.t === 'h' ? .5 - W / 2 : .5 + W / 2; } }
  },
  draw(g, W, H, st) {
    const Vbi = .75, Wd = st.W != null ? st.W : Math.min(.9, .12 * Math.sqrt(Math.max(.02, Vbi - st.V) / Vbi));
    const x0 = 30, w = W - 60, y0 = 60, h = H * .4;
    const X = f => x0 + f * w, Y = f => y0 + f * h;
    g.fillStyle = 'rgba(244,114,182,.10)'; g.fillRect(x0, y0, w / 2, h); g.fillStyle = 'rgba(96,165,250,.10)'; g.fillRect(x0 + w / 2, y0, w / 2, h);
    g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(X(.5 - Wd / 2), y0, Wd * w, h);
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.strokeRect(x0, y0, w, h); SG.line(g, X(.5), y0, X(.5), y0 + h, 'rgba(255,255,255,.3)', 1, [4, 4]);
    // fixed ions
    const cols = Math.max(1, Math.floor(Wd * w / 2 / 14));
    for (let s = 0; s < 2; s++) for (let i = 0; i < cols; i++) for (let j = 0; j < 6; j++) {
      const xx = s === 0 ? X(.5) - 8 - i * 14 : X(.5) + 8 + i * 14, yy = y0 + 14 + j * (h - 28) / 5;
      SG.txt(g, s === 0 ? '−' : '+', xx, yy + 4, s === 0 ? '#f9a8d4' : '#93c5fd', 13, 'center', 700);
    }
    (st.c || []).forEach(p => { const x = X(p.x), y = Y(p.y); if (p.t === 'e') { g.fillStyle = '#60a5fa'; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); } else { g.strokeStyle = '#f472b6'; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, 4, 0, 7); g.stroke(); } });
    // E-field arrow
    const ex1 = X(.5 + Wd / 2) - 6, ex2 = X(.5 - Wd / 2) + 6;
    if (ex1 - ex2 > 24) { SG.line(g, ex1, y0 - 10, ex2, y0 - 10, '#fbbf24', 1.6); g.fillStyle = '#fbbf24'; g.beginPath(); g.moveTo(ex2, y0 - 10); g.lineTo(ex2 + 8, y0 - 14); g.lineTo(ex2 + 8, y0 - 6); g.fill(); SG.txt(g, 'E (built-in field)', (ex1 + ex2) / 2, y0 - 16, '#fbbf24', 11, 'center'); }
    SG.txt(g, 'P-region', x0 + 8, y0 + h + 18, '#f9a8d4', 12, 'left', 600); SG.txt(g, 'N-region', x0 + w - 8, y0 + h + 18, '#93c5fd', 12, 'right', 600);
    SG.txt(g, `Depletion width W ∝ √(V_bi − V)`, X(.5), y0 + h + 18, '#a4abbe', 11, 'center');
    const mode = st.V > 0.001 ? 'FORWARD BIAS' : st.V < -0.001 ? 'REVERSE BIAS' : 'UNBIASED (equilibrium)';
    SG.txt(g, mode, x0, 28, st.V > 0 ? '#34d399' : st.V < 0 ? '#fbbf24' : '#cbd5e1', 13, 'left', 700);
    SG.txt(g, st.V >= 0 ? 'p → +  ,  n → −' : 'p → −  ,  n → +', x0 + w, 28, '#8b93a8', 12, 'right');
    // barrier diagram
    const by0 = y0 + h + 40, bh = H - by0 - 15, bw = W * .48;
    if (bh > 80) {
      SG.panel(g, x0, by0, bw, bh); SG.txt(g, 'Electron potential-energy barrier', x0 + 10, by0 + 16, '#a4abbe', 11, 'left', 600);
      const hgt = Math.min(1, Math.max(.04, (Vbi - st.V) / 6)) * (bh - 44);
      const base = by0 + bh - 14; g.strokeStyle = '#22d3ee'; g.lineWidth = 2; g.beginPath();
      for (let i = 0; i <= 100; i++) { const f = i / 100, xx = x0 + 14 + f * (bw - 28); const z = (f - .5) / Math.max(.03, Wd * .9); const s = 1 / (1 + Math.exp(z * 8)); const yy = base - hgt * s; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
      SG.mono(g, `e(V_bi − V) = ${(Vbi - st.V).toFixed(2)} eV`, x0 + bw - 12, by0 + 32, '#22d3ee', 11, 'right');
      // IV mini plot
      const pb = { x: x0 + bw + 14, y: by0, w: W - x0 - bw - 44, h: bh };
      if (pb.w > 140) {
        const pts = []; for (let v = -10; v <= .8; v += .02) pts.push([v, diodeI(v, st.T) * 1e3]);
        SG.plot(g, pb, [-10, .8], [-2, 20], [{ pts, color: '#60a5fa' }], [{ x: st.V, y: clamp(diodeI(st.V, st.T) * 1e3, -2, 20), color: '#fbbf24' }], { title: 'I–V (mA) — reverse current magnified in readout', x: 'V (V)' });
      }
    }
  },
  readouts(st) {
    const I = diodeI(st.V, st.T), Vt = 8.617e-5 * st.T;
    return [['Bias voltage', st.V.toFixed(2) + ' V'], ['Current', fmtA(I)], ['Barrier height', (0.75 - st.V).toFixed(2) + ' V'], ['W / W₀', Math.sqrt(Math.max(.02, .75 - st.V) / .75).toFixed(2) + '×'], ['Thermal voltage', (Vt * 1e3).toFixed(2) + ' mV'], ['Static R = V/I', st.V !== 0 ? fmt(Math.abs(st.V / I), 3) + ' Ω' : '—'], ['Dynamic r_d', st.V > .3 ? fmt(1.9 * Vt / I, 3) + ' Ω' : '—'], ['Mode', st.V > .55 ? 'Conducting' : st.V >= 0 ? 'Below knee' : 'Blocking']];
  }
};
