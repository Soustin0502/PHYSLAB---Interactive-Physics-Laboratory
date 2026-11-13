/* ---------- Simulations 5–8 ---------- */
/* ===== 5. Photoelectric effect ===== */
const METALS = [['2.14', 'Cs'], ['2.30', 'K'], ['2.36', 'Na'], ['4.33', 'Zn'], ['4.65', 'Cu']];
function photoModel(st) {
  const E = 1240 / st.lam, phi = +st.metal, K = E - phi, V0 = Math.max(0, K);
  const Isat = st.int / 100 * 2.0; // µA (illustrative)
  let frac = 0;
  if (K > 0) frac = st.V >= 0 ? 1 - .12 * Math.exp(-st.V / .4) : Math.max(0, 1 - (-st.V) / K) * .88;
  return { E, phi, K, V0, I: Isat * frac, Isat, nu: PHYS.c / (st.lam * 1e-9), nu0: phi * PHYS.e / PHYS.h };
}
SIMS.photo = {
  title: 'Photoelectric effect', autoplay: true,
  controls: [
    { k: 'lam', label: 'Wavelength λ', min: 200, max: 700, step: 1, val: 405, unit: 'nm' },
    { k: 'int', label: 'Intensity', min: 0, max: 100, step: 1, val: 70, unit: '%' },
    { k: 'V', label: 'Anode potential V', min: -3, max: 3, step: 0.01, val: 0, unit: 'V', fmt: v => v.toFixed(2) }
  ],
  selects: [{ k: 'metal', label: 'Cathode metal (φ in eV)', options: METALS, val: '2.14' }],
  buttons: [{ label: 'Find V₀', icon: 'crosshair', fn: (st, sync) => { const m = photoModel(st); st.V = -Math.min(3, Math.round(m.V0 * 100) / 100); sync(); } }],
  note: 'Negative anode potential retards electrons. Only those with ½mv² &gt; e|V| reach the anode, so the current falls to zero at −V₀. Change intensity: the current changes, V₀ does not.',
  init(st) { st.ph = []; st.el = []; st.acc = 0; st.hits = 0; },
  step(st, dt) {
    const m = photoModel(st);
    st.acc += dt * st.int / 100 * 26;
    while (st.acc > 1) { st.acc--; st.ph.push({ p: 0, y: .15 + Math.random() * .7 }); }
    st.ph.forEach(p => p.p += dt * 1.6);
    st.ph = st.ph.filter(p => { if (p.p >= 1) { if (m.K > 0) { const ke = Math.random() * m.K; st.el.push({ x: 0, y: p.y, v: 140 * Math.sqrt(2 * ke) }); } return false; } return true; });
    const d = st.gapPx || 300;
    st.el.forEach(e => { e.v += 140 * 140 * (st.V / d) * dt; e.x += e.v * dt; });
    st.el = st.el.filter(e => { if (e.x >= d) { st.hits++; return false; } return e.x >= 0; }).slice(-200);
  },
  draw(g, W, H, st) {
    const m = photoModel(st), col = waveRGB(st.lam);
    const cx = Math.max(150, W * .3), ax = Math.min(W - 40, cx + Math.min(330, W * .45)), y0 = 50, y1 = H * .62;
    st.gapPx = ax - cx;
    SG.rr(g, cx - 40, y0 - 20, ax - cx + 80, y1 - y0 + 40, 60); g.fillStyle = 'rgba(103,232,249,.04)'; g.fill(); g.strokeStyle = 'rgba(103,232,249,.35)'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = '#fbbf24'; g.fillRect(cx - 8, y0, 8, y1 - y0); g.fillStyle = '#94a3b8'; g.fillRect(ax, y0 + 10, 6, y1 - y0 - 20);
    SG.txt(g, 'Cathode (φ = ' + m.phi.toFixed(2) + ' eV)', cx - 4, y1 + 36, '#fcd34d', 11.5, 'center', 600); SG.txt(g, 'Anode', ax + 3, y1 + 36, '#cbd5e1', 11.5, 'center', 600);
    // light source
    const lx = 30, ly = 30;
    SG.glow(g, lx + 20, ly + 20, 50, col, st.int / 100 * .8);
    st.ph.forEach(p => {
      const tx = cx - 8, ty = y0 + p.y * (y1 - y0), x = lx + 20 + (tx - lx - 20) * p.p, y = ly + 20 + (ty - ly - 20) * p.p;
      const ang = Math.atan2(ty - ly - 20, tx - lx - 20);
      g.strokeStyle = rgbStr(col, .95); g.lineWidth = 1.6; g.beginPath();
      for (let s = -14; s <= 0; s++) { const px = x + Math.cos(ang) * s - Math.sin(ang) * Math.sin(s * 1.1) * 3, py = y + Math.sin(ang) * s + Math.cos(ang) * Math.sin(s * 1.1) * 3; s === -14 ? g.moveTo(px, py) : g.lineTo(px, py); }
      g.stroke();
    });
    st.el.forEach(e => { const y = y0 + e.y * (y1 - y0); g.fillStyle = '#22d3ee'; g.beginPath(); g.arc(cx + e.x, y, 3.4, 0, 7); g.fill(); });
    SG.txt(g, st.lam < 380 ? 'UV (shown violet)' : 'λ = ' + st.lam + ' nm', lx, ly + 66, '#a4abbe', 11);
    // field label
    SG.txt(g, st.V < 0 ? '← retarding field' : st.V > 0 ? 'accelerating field →' : 'no field', (cx + ax) / 2, y0 - 26, st.V < 0 ? '#f87171' : '#34d399', 12, 'center', 600);
    if (m.K <= 0) SG.txt(g, 'No emission: hν < φ  (ν < ν₀)', (cx + ax) / 2, (y0 + y1) / 2, '#f87171', 14, 'center', 700);
    // circuit
    const wy = y1 + 54; SG.line(g, cx - 4, y1, cx - 4, wy, '#64748b', 1.6); SG.line(g, ax + 3, y1 - 10, ax + 3, wy, '#64748b', 1.6); SG.line(g, cx - 4, wy, ax + 3, wy, '#64748b', 1.6);
    const mx = (cx + ax) / 2; g.fillStyle = '#0f172a'; g.beginPath(); g.arc(mx, wy, 18, 0, 7); g.fill(); g.strokeStyle = '#22d3ee'; g.stroke(); SG.txt(g, 'µA', mx, wy + 4, '#22d3ee', 11, 'center', 700);
    // I-V plot
    const pb = { x: 14, y: H - 170, w: Math.min(280, cx - 60 > 200 ? cx - 30 : 260), h: 156 };
    if (W > 640) {
      const pts = []; for (let v = -3; v <= 3; v += .02) pts.push([v, photoModel({ ...st, V: v }).I]);
      SG.plot(g, { x: W - 290, y: H - 168, w: 276, h: 156 }, [-3, 3], [0, 2.1], [{ pts, color: rgbStr(col, 1) }], [{ x: st.V, y: m.I, color: '#fff' }], { title: 'Photocurrent vs anode potential', x: 'V (V)', y: 'I (µA)' });
    }
  },
  readouts(st) {
    const m = photoModel(st);
    return [['Photon energy hν', m.E.toFixed(3) + ' eV'], ['Work function φ', m.phi.toFixed(2) + ' eV'], ['K_max = hν − φ', m.K > 0 ? m.K.toFixed(3) + ' eV' : 'none'], ['Stopping potential V₀', m.K > 0 ? m.V0.toFixed(3) + ' V' : '—'], ['Frequency ν', sci(m.nu, 3) + ' Hz'], ['Threshold ν₀', sci(m.nu0, 3) + ' Hz'], ['Threshold λ₀', (1240 / m.phi).toFixed(0) + ' nm'], ['Photocurrent', m.I.toFixed(3) + ' µA']];
  }
};

/* ===== 6. Bar pendulum ===== */
const GVALS = [['9.81', 'Earth'], ['1.62', 'Moon'], ['3.71', 'Mars'], ['24.79', 'Jupiter']];
const BAR_K = 1 / Math.sqrt(12);
SIMS.pendulum = {
  title: 'Bar pendulum', autoplay: true,
  controls: [
    { k: 'l', label: 'Pivot distance from G (l)', min: 3, max: 48, step: 1, val: 20, unit: 'cm' },
    { k: 'amp', label: 'Release amplitude θ₀', min: 2, max: 40, step: 1, val: 5, unit: '°' }
  ],
  selects: [{ k: 'g', label: 'Gravity', options: GVALS, val: '9.81' }],
  note: 'The equation of motion θ̈ = −(g l/(K² + l²)) sin θ is integrated numerically (RK4), so large amplitudes show the real lengthening of the period. Uniform 1 m bar: K = 28.87 cm.',
  init(st) { st.th = st.amp * Math.PI / 180; st.om = 0; st.n = 0; st.lastCross = null; st.Tm = null; st.tt = 0; st.key = st.l + '|' + st.amp + '|' + st.g; },
  onChange(st) { SIMS.pendulum.init(st); },
  step(st, dt) {
    const l = st.l / 100, gg = +st.g, w2 = gg * l / (BAR_K * BAR_K + l * l), f = th => -w2 * Math.sin(th);
    const sub = 8, h = dt / sub;
    for (let i = 0; i < sub; i++) {
      const prev = st.th;
      const k1t = st.om, k1o = f(st.th), k2t = st.om + h / 2 * k1o, k2o = f(st.th + h / 2 * k1t), k3t = st.om + h / 2 * k2o, k3o = f(st.th + h / 2 * k2t), k4t = st.om + h * k3o, k4o = f(st.th + h * k3t);
      st.th += h / 6 * (k1t + 2 * k2t + 2 * k3t + k4t); st.om += h / 6 * (k1o + 2 * k2o + 2 * k3o + k4o); st.tt += h;
      if (prev < 0 && st.th >= 0) { const tc = st.tt - h * st.th / (st.th - prev); if (st.lastCross != null) { st.Tm = tc - st.lastCross; st.n++; } st.lastCross = tc; }
    }
  },
  draw(g, W, H, st) {
    const l = st.l / 100, scale = (H - 70) / 1.0, px = Math.min(W * .3, 220), py = 36 + (0.5 - l) * scale;
    g.fillStyle = '#334155'; g.fillRect(px - 60, py - 26, 120, 10);
    SG.line(g, px, py - 16, px, py - 4, '#475569', 6);
    g.save(); g.translate(px, py); g.rotate(-st.th);
    const top = -(0.5 - l) * scale, bot = (0.5 + l) * scale;
    g.fillStyle = 'rgba(148,163,184,.22)'; SG.rr(g, -13, top, 26, bot - top, 6); g.fill(); g.strokeStyle = '#cbd5e1'; g.lineWidth = 1.4; g.stroke();
    for (let c = 2; c <= 98; c += 5) { const yy = top + c / 100 * scale; if (Math.abs(c - 50) > 2) { g.fillStyle = '#0b1220'; g.beginPath(); g.arc(0, yy, 3.5, 0, 7); g.fill(); } }
    g.fillStyle = '#34d399'; g.beginPath(); g.arc(0, l * scale, 6, 0, 7); g.fill();
    const L = l + BAR_K * BAR_K / l; if (L * scale < bot + 40) { g.strokeStyle = '#f472b6'; g.lineWidth = 2.4; g.beginPath(); g.arc(0, L * scale, 6, 0, 7); g.stroke(); }
    g.restore();
    g.fillStyle = '#fbbf24'; g.beginPath(); g.moveTo(px - 9, py + 4); g.lineTo(px + 9, py + 4); g.lineTo(px, py - 6); g.fill();
    SG.line(g, px, py, px, H - 10, 'rgba(255,255,255,.1)', 1, [4, 4]);
    // legend
    const lgx = 16, lgy = H - 50;
    g.fillStyle = '#34d399'; g.beginPath(); g.arc(lgx + 5, lgy, 5, 0, 7); g.fill(); SG.txt(g, 'G (centre of gravity)', lgx + 16, lgy + 4, '#a4abbe', 11);
    g.strokeStyle = '#f472b6'; g.lineWidth = 2; g.beginPath(); g.arc(lgx + 5, lgy + 20, 5, 0, 7); g.stroke(); SG.txt(g, 'O (centre of oscillation)', lgx + 16, lgy + 24, '#a4abbe', 11);
    // W-curve plot
    const pb = { x: Math.max(px + 90, W * .45), y: 20, w: W - Math.max(px + 90, W * .45) - 14, h: H - 40 };
    if (pb.w > 180) {
      const gg = +st.g, T = x => { const a = Math.abs(x); return 2 * Math.PI * Math.sqrt((BAR_K * BAR_K + a * a) / (gg * a)); };
      const Tmin = T(BAR_K), ymax = Math.max(T(0.03), Tmin * 1.8);
      const left = [], right = []; for (let x = .03; x <= .5; x += .005) { right.push([x * 100, T(x)]); left.push([-x * 100, T(x)]); }
      const tl = T(l);
      const marks = [{ x: st.l, y: tl, color: '#fbbf24' }, { x: -st.l, y: tl, color: 'rgba(251,191,36,.5)', r: 4 }];
      const l2 = BAR_K * BAR_K / l; if (l2 * 100 <= 50) marks.push({ x: l2 * 100, y: tl, color: '#f472b6', r: 4 });
      const { X, Y } = SG.plot(g, pb, [-50, 50], [Tmin * .85, Math.min(ymax, Tmin * 2.2)], [{ pts: left, color: '#34d399' }, { pts: right, color: '#34d399' }, { pts: [[-50, tl], [50, tl]], color: 'rgba(251,191,36,.45)', w: 1, dash: [5, 4] }], marks, { title: 'T vs distance from G — the W-curve', x: 'l (cm)', y: 'T (s)' });
      SG.mono(g, `l₂ = K²/l = ${(l2 * 100).toFixed(1)} cm  (same T)`, pb.x + 12, pb.y + pb.h - 30, '#f9a8d4', 11);
    }
  },
  readouts(st) {
    const l = st.l / 100, gg = +st.g, L = l + BAR_K * BAR_K / l, T0 = 2 * Math.PI * Math.sqrt(L / gg), th0 = st.amp * Math.PI / 180;
    return [['T (small-angle theory)', T0.toFixed(4) + ' s'], ['T (finite amplitude)', (T0 * (1 + th0 * th0 / 16)).toFixed(4) + ' s'], ['T measured (sim)', st.Tm ? st.Tm.toFixed(4) + ' s' : 'measuring…'], ['Oscillations counted', st.n], ['Equivalent length L', (L * 100).toFixed(2) + ' cm'], ['g = 4π²L/T²', st.Tm ? (4 * Math.PI ** 2 * L / st.Tm ** 2).toFixed(3) + ' m/s²' : '—'], ['Angle θ', (st.th * 180 / Math.PI).toFixed(2) + '°'], ['Elapsed', st.tt.toFixed(1) + ' s']];
  }
};

/* ===== 7. Solar cell ===== */
function solarModel(st) {
  const nVt = 1.3 * 8.617e-5 * (st.T + 273.15), Isc = 0.12 * st.G / 1000 * (1 + 5e-4 * (st.T - 25));
  const I0 = 1.9e-9 * Math.exp(0.0689 * (st.T - 25));
  const Icell = V => Isc - I0 * (Math.exp(V / nVt) - 1);
  const Voc = Isc > 0 ? nVt * Math.log(Isc / I0 + 1) : 0;
  let lo = 0, hi = Voc;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; (Icell(m) - m / st.R > 0) ? lo = m : hi = m; }
  const V = lo, I = Math.max(0, Icell(V));
  let Pm = 0, Vm = 0, Im = 0; for (let v = 0; v <= Voc; v += Voc / 400) { const p = v * Icell(v); if (p > Pm) { Pm = p; Vm = v; Im = Icell(v); } }
  const A = 4e-4, Pin = st.G * A;
  return { V, I, P: V * I, Voc, Isc, Pm, Vm, Im, FF: Isc > 0 ? Pm / (Voc * Isc) : 0, eta: Pin > 0 ? Pm / Pin * 100 : 0, etaOp: Pin > 0 ? V * I / Pin * 100 : 0, Icell, Pin };
}
SIMS.solar = {
  title: 'Solar cell', autoplay: true,
  controls: [
    { k: 'G', label: 'Irradiance E', min: 0, max: 1000, step: 10, val: 800, unit: 'W/m²' },
    { k: 'R', label: 'Load resistance R_L', min: 0.5, max: 40, step: 0.1, val: 4, unit: 'Ω', fmt: v => v.toFixed(1) },
    { k: 'T', label: 'Cell temperature', min: 10, max: 75, step: 1, val: 25, unit: '°C' }
  ],
  buttons: [{ label: 'Go to MPP', icon: 'target', fn: (st, sync) => { const m = solarModel(st); if (m.Im > 0) { st.R = Math.round(m.Vm / m.Im * 10) / 10; sync(); } } }],
  note: 'Model cell: area 4 cm², I_sc = 120 mA at 1000 W/m². Photons create electron–hole pairs; the junction field sweeps electrons to the n-layer and holes to the p-layer, driving current through the load.',
  init(st) { st.ph = []; st.pr = []; st.flow = 0; st.acc = 0; },
  step(st, dt) {
    const m = solarModel(st);
    st.acc += dt * st.G / 1000 * 30;
    while (st.acc > 1) { st.acc--; st.ph.push({ x: .05 + Math.random() * .9, y: -.1, d: .25 + Math.random() * .7 }); }
    st.ph.forEach(p => p.y += dt * 1.4);
    st.ph = st.ph.filter(p => { if (p.y >= p.d) { st.pr.push({ x: p.x, ye: p.d, yh: p.d, life: 1 }); return false; } return true; });
    st.pr.forEach(p => { p.ye = Math.max(0, p.ye - dt * .8); p.yh = Math.min(1, p.yh + dt * .5); p.life -= dt * .7; });
    st.pr = st.pr.filter(p => p.life > 0).slice(-120);
    st.flow += dt * m.I / 0.12 * 1.2;
  },
  draw(g, W, H, st) {
    const m = solarModel(st);
    const cx = 30, cw = Math.min(W * .5, W - 320), cy = 110, ch = H * .42, nTh = ch * .18;
    // sun rays
    st.ph.forEach(p => { if (p.y < 0) return; const x = cx + p.x * cw, y = cy - 50 + p.y * (ch + 50); g.strokeStyle = 'rgba(253,224,71,.9)'; g.lineWidth = 1.5; g.beginPath(); for (let s = -12; s <= 0; s++) { const yy = y + s, xx = x + Math.sin(s * 1.2) * 2.5; s === -12 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); });
    SG.txt(g, `Light: ${st.G} W/m²`, cx, 28, '#fde68a', 13, 'left', 600);
    g.fillStyle = 'rgba(96,165,250,.28)'; g.fillRect(cx, cy, cw, nTh); g.fillStyle = 'rgba(244,114,182,.14)'; g.fillRect(cx, cy + nTh, cw, ch - nTh);
    g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(cx, cy + nTh - 6, cw, 12);
    for (let i = 0; i < 6; i++) { g.fillStyle = '#cbd5e1'; g.fillRect(cx + 10 + i * (cw - 20) / 5 - 4, cy - 6, 8, 6); }
    g.fillStyle = '#94a3b8'; g.fillRect(cx, cy + ch, cw, 7);
    SG.txt(g, 'n-layer (thin)', cx + cw + 8, cy + nTh / 2 + 4, '#93c5fd', 11); SG.txt(g, 'p-layer', cx + cw + 8, cy + ch / 2 + 4, '#f9a8d4', 11); SG.txt(g, 'junction', cx + cw + 8, cy + nTh + 4, '#a4abbe', 10);
    st.pr.forEach(p => {
      const x = cx + p.x * cw;
      const ye = cy + Math.min(p.ye, p.ye) * ch * (p.ye > nTh / ch ? 1 : 1);
      g.globalAlpha = Math.max(0, p.life);
      g.fillStyle = '#60a5fa'; g.beginPath(); g.arc(x - 3, cy + p.ye * ch, 3.4, 0, 7); g.fill();
      g.strokeStyle = '#f472b6'; g.lineWidth = 1.5; g.beginPath(); g.arc(x + 3, cy + p.yh * ch, 3.6, 0, 7); g.stroke();
      g.globalAlpha = 1;
    });
    // external circuit
    const rx = cx + cw + 90, top = cy - 30, botY = cy + ch + 30;
    const path = [[cx + cw / 2, cy - 6], [cx + cw / 2, top], [rx, top], [rx, botY], [cx + cw / 2, botY], [cx + cw / 2, cy + ch + 7]];
    g.strokeStyle = '#64748b'; g.lineWidth = 2; g.beginPath(); path.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
    // load lamp
    const ly = (top + botY) / 2, br = Math.min(1, m.P / 0.06);
    g.fillStyle = '#0f172a'; g.fillRect(rx - 12, ly - 34, 24, 68);
    if (br > .01) SG.glow(g, rx, ly, 50, [253, 224, 71], br * .8);
    g.strokeStyle = '#fbbf24'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 8; i++) { const yy = ly - 28 + i * 7; g.lineTo(rx + (i % 2 ? 9 : -9), yy); } g.stroke();
    SG.txt(g, 'R_L = ' + st.R.toFixed(1) + ' Ω', rx + 18, ly + 4, '#fde68a', 12, 'left', 600);
    // electrons moving in wire (conventional current opposite)
    const segs = []; let tot = 0; for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); segs.push(d); tot += d; }
    if (m.I > 1e-5) for (let k = 0; k < 18; k++) {
      let s = ((k / 18 + st.flow) % 1) * tot, i = 0; while (i < segs.length - 1 && s > segs[i]) { s -= segs[i]; i++; }
      const a = path[i], b = path[i + 1], f = s / segs[i];
      g.fillStyle = '#22d3ee'; g.beginPath(); g.arc(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 3, 0, 7); g.fill();
    }
    SG.txt(g, 'e⁻ flow in external circuit', cx + cw / 2 + 8, top - 8, '#22d3ee', 11);
    // plot
    const pb = { x: W - 270, y: H - 196, w: 256, h: 182 };
    if (W > 680 && m.Isc > 0) {
      const iv = [], pv = []; for (let v = 0; v <= m.Voc; v += m.Voc / 100) { iv.push([v, m.Icell(v) * 1e3]); pv.push([v, v * m.Icell(v) * 1e3 * 120 / Math.max(1e-6, m.Pm * 1e3) * .8]); }
      SG.plot(g, pb, [0, .7], [0, 130], [{ pts: iv, color: '#fbbf24' }, { pts: pv, color: '#a78bfa', dash: [5, 4] }], [{ x: m.Vm, y: m.Im * 1e3, color: '#a78bfa', r: 4 }, { x: m.V, y: m.I * 1e3, color: '#fff' }], { title: 'I–V (—) and scaled P–V (- -)', x: 'V (V)', y: 'I (mA)' });
    }
  },
  readouts(st) {
    const m = solarModel(st);
    return [['Voltage V', m.V.toFixed(3) + ' V'], ['Current I', (m.I * 1e3).toFixed(2) + ' mA'], ['Power P', (m.P * 1e3).toFixed(2) + ' mW'], ['V_oc / I_sc', `${m.Voc.toFixed(3)} V / ${(m.Isc * 1e3).toFixed(1)} mA`], ['P_max (at V_m)', `${(m.Pm * 1e3).toFixed(2)} mW @ ${m.Vm.toFixed(3)} V`], ['Fill factor', m.FF.toFixed(3)], ['Efficiency η_max', m.eta.toFixed(2) + ' %'], ['Load / optimum', `${st.R.toFixed(1)} / ${m.Im > 0 ? (m.Vm / m.Im).toFixed(1) : '—'} Ω`]];
  }
};

/* ===== 8. Sonometer ===== */
const WIRES = [['5.55e-4', 'Steel 0.30 mm'], ['9.86e-4', 'Steel 0.40 mm'], ['6.01e-4', 'Brass 0.30 mm']];
const FORKS = [['256', '256'], ['288', '288'], ['320', '320'], ['384', '384'], ['480', '480'], ['512', '512']];
function sonoModel(st) {
  const m = +st.wire, T = st.M * 9.81, f0 = 1 / (2 * st.l / 100) * Math.sqrt(T / m), ff = +st.fork, Q = 35;
  let best = 0, p = 1;
  for (let k = 1; k <= 3; k++) { const r = ff / (k * f0), a = (1 / Math.sqrt((1 - r * r) ** 2 + (r / Q) ** 2)) / Q / k; if (a > best) { best = a; p = k; } }
  return { m, T, f0, ff, amp: Math.min(1, best), p, lres: 1 / (2 * ff) * Math.sqrt(T / m) * 100, v: Math.sqrt(T / m) };
}
SIMS.sonometer = {
  title: 'Sonometer', autoplay: true,
  controls: [
    { k: 'l', label: 'Distance between bridges l', min: 10, max: 90, step: 0.1, val: 30, unit: 'cm', fmt: v => v.toFixed(1) },
    { k: 'M', label: 'Hanging mass M', min: 0.5, max: 6, step: 0.5, val: 2.0, unit: 'kg', fmt: v => v.toFixed(1) }
  ],
  selects: [{ k: 'fork', label: 'Tuning fork (Hz)', options: FORKS, val: '256' }, { k: 'wire', label: 'Wire (linear density)', options: WIRES, val: '5.55e-4' }],
  buttons: [{ label: 'Strike fork', icon: 'bell-ring', fn: st => { st.drive = 1; st.rider = 'on'; st.ry = 0; } }, { label: 'Auto-tune', icon: 'move-horizontal', fn: st => { st.tuning = true; st.drive = 1; } }],
  note: 'Natural frequency f₀ = (1/2l)√(Mg/m). Slide the bridge (l) until f₀ equals the fork frequency: the string resonates and the paper rider jumps off. "Auto-tune" slides the bridge for you.',
  init(st) { st.drive = 1; st.rider = 'on'; st.ry = 0; st.rvy = 0; st.tuning = false; },
  step(st, dt) {
    const m = sonoModel(st);
    st.drive = Math.max(0, st.drive - dt * 0.12);
    if (st.tuning) {
      const d = m.lres - st.l;
      if (Math.abs(d) < .05 || m.lres > 90 || m.lres < 10) st.tuning = false; else st.l += clamp(d, -18 * dt, 18 * dt);
      const el = document.getElementById('sl-l'); if (el) { el.value = st.l; setRangeFill(el); document.getElementById('sv-l').textContent = st.l.toFixed(1) + ' cm'; }
    }
    const A = m.amp * st.drive;
    if (st.rider === 'on' && A > .55 && m.p === 1) { st.rider = 'fly'; st.rvy = -260; st.rvx = 60; st.rx = 0; }
    if (st.rider === 'fly') { st.rvy += 600 * dt; st.ry += st.rvy * dt; st.rx += st.rvx * dt; if (st.ry > 120) st.rider = 'off'; }
  },
  draw(g, W, H, st) {
    const m = sonoModel(st), A = m.amp * st.drive;
    const bx = 30, bw = W - 140, by = H * .5, xA = bx + 50, scale = (bw - 80) / 90, xB = xA + st.l * scale;
    g.fillStyle = '#5b3412'; SG.rr(g, bx, by, bw, 70, 8); g.fill(); g.strokeStyle = '#92400e'; g.stroke();
    [.25, .5, .75].forEach(f => { g.fillStyle = '#1c0f05'; g.beginPath(); g.arc(bx + bw * f, by + 38, 11, 0, 7); g.fill(); });
    const wy = by - 16;
    [xA, xB].forEach(x => { g.fillStyle = '#e2e8f0'; g.beginPath(); g.moveTo(x - 9, by); g.lineTo(x + 9, by); g.lineTo(x, wy); g.fill(); });
    SG.line(g, bx + 8, wy, xA, wy, '#e5e7eb', 1.5); SG.line(g, xB, wy, bx + bw + 20, wy, '#e5e7eb', 1.5);
    const amp = A * 26, ph = Math.cos(st.t * 2 * Math.PI * 2.2);
    g.strokeStyle = A > .5 ? '#c4b5fd' : '#e5e7eb'; g.lineWidth = 1.8; g.beginPath();
    for (let i = 0; i <= 120; i++) { const f = i / 120, x = xA + f * (xB - xA), y = wy - amp * ph * Math.sin(m.p * Math.PI * f); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    if (A > .05) { g.strokeStyle = 'rgba(167,139,250,.25)'; g.lineWidth = 1; [1, -1].forEach(sg => { g.beginPath(); for (let i = 0; i <= 120; i++) { const f = i / 120, x = xA + f * (xB - xA), y = wy - sg * amp * Math.sin(m.p * Math.PI * f); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }); }
    // rider
    const rmx = (xA + xB) / 2;
    if (st.rider !== 'off') { const ry = st.rider === 'fly' ? wy - 6 + st.ry : wy - 6 - amp * ph, rx = st.rider === 'fly' ? rmx + st.rx : rmx; g.strokeStyle = '#f472b6'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(rx - 7, ry + 6); g.lineTo(rx, ry - 6); g.lineTo(rx + 7, ry + 6); g.stroke(); }
    else SG.txt(g, 'Rider thrown off — RESONANCE!', rmx, wy - 44, '#f472b6', 13, 'center', 700);
    // pulley and weights
    const pxp = bx + bw + 24; g.fillStyle = '#1e293b'; g.beginPath(); g.arc(pxp, wy + 10, 10, 0, 7); g.fill(); g.strokeStyle = '#94a3b8'; g.stroke();
    SG.line(g, pxp + 10, wy + 10, pxp + 10, by + 90, '#e5e7eb', 1.5);
    const nb = Math.round(st.M / .5); for (let i = 0; i < nb; i++) { g.fillStyle = i % 2 ? '#a16207' : '#ca8a04'; g.fillRect(pxp, by + 92 + i * 9 - Math.max(0, nb * 9 - (H - by - 100)) * (i / nb), 22, 8); }
    SG.txt(g, `${st.M.toFixed(1)} kg`, pxp + 11, by + 86, '#fde68a', 11, 'center', 600);
    // fork
    const fx = Math.min(bx + bw - 60, xB + 60), fyb = by - 2, vib = st.drive * 3 * Math.sin(st.t * 60);
    g.strokeStyle = '#cbd5e1'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(fx - 8 - vib, fyb - 110); g.lineTo(fx - 8, fyb - 50); g.quadraticCurveTo(fx, fyb - 40, fx + 8, fyb - 50); g.lineTo(fx + 8 + vib, fyb - 110); g.stroke();
    g.beginPath(); g.moveTo(fx, fyb - 44); g.lineTo(fx, fyb); g.stroke(); g.lineCap = 'butt';
    SG.txt(g, m.ff + ' Hz', fx, fyb - 118, '#c4b5fd', 12, 'center', 600);
    // dimension
    SG.line(g, xA, by + 86, xB, by + 86, '#22d3ee', 1.2); SG.txt(g, `l = ${st.l.toFixed(1)} cm`, (xA + xB) / 2, by + 102, '#22d3ee', 12, 'center', 600);
    // resonance meter
    const mx = 20, my = 20, mw = Math.min(320, W - 40);
    SG.panel(g, mx, my, mw, 64);
    SG.txt(g, 'String response', mx + 12, my + 18, '#a4abbe', 11, 'left', 600);
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(mx + 12, my + 28, mw - 24, 10);
    const gr = g.createLinearGradient(mx + 12, 0, mx + mw - 12, 0); gr.addColorStop(0, '#3b82f6'); gr.addColorStop(1, '#f472b6');
    g.fillStyle = gr; g.fillRect(mx + 12, my + 28, (mw - 24) * A, 10);
    SG.mono(g, `f₀ = ${m.f0.toFixed(1)} Hz   fork = ${m.ff} Hz   ${m.p > 1 && A > .3 ? '(harmonic p=' + m.p + ')' : ''}`, mx + 12, my + 56, '#cbd5e1', 11);
  },
  readouts(st) {
    const m = sonoModel(st);
    return [['Tension T = Mg', m.T.toFixed(2) + ' N'], ['Wave speed v', m.v.toFixed(1) + ' m/s'], ['Natural freq f₀', m.f0.toFixed(2) + ' Hz'], ['Fork frequency', m.ff + ' Hz'], ['Resonant length', m.lres.toFixed(2) + ' cm'], ['f₀ / f_fork', (m.f0 / m.ff).toFixed(3)], ['Amplitude', (m.amp * st.drive * 100).toFixed(0) + ' %'], ['Linear density m', sci(m.m, 2) + ' kg/m']];
  }
};
