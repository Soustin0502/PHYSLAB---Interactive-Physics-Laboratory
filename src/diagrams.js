/* ---------- Labelled SVG apparatus diagrams (960 × 540 drawing grid) ---------- */
const DC = { wire: '#94a3b8', comp: '#e2e8f0', label: '#e5e7eb', sub: '#94a3b8', dim: '#22d3ee', ang: '#c4b5fd', amber: '#fbbf24', pink: '#f472b6', glass: '#67e8f9', halo: '#0d1119' };
const DG = {
  /* text with a dark halo so it stays legible over lines */
  t(x, y, s, o = {}) { return `<text x="${x}" y="${y}" fill="${o.c || DC.label}" font-size="${o.s || 14}" font-weight="${o.w || 500}" text-anchor="${o.a || 'start'}" ${o.i ? 'font-style="italic"' : ''} stroke="${DC.halo}" stroke-width="${o.h ?? 4}" stroke-linejoin="round" paint-order="stroke">${s}</text>`; },
  sym(x, y, s, o = {}) { return DG.t(x, y, s, { s: 16, w: 700, i: 1, ...o }); },
  l(x1, y1, x2, y2, o = {}) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${o.c || DC.wire}" stroke-width="${o.w || 2}" ${o.d ? `stroke-dasharray="${o.d}"` : ''} ${o.m ? `marker-end="url(#${o.m})"` : ''} ${o.ms ? `marker-start="url(#${o.ms})"` : ''} stroke-linecap="round"/>`; },
  wire(pts, o = {}) { return `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${o.c || DC.wire}" stroke-width="${o.w || 2.2}" stroke-linejoin="round" stroke-linecap="round" ${o.d ? `stroke-dasharray="${o.d}"` : ''}/>`; },
  dot(x, y, c = DC.comp) { return `<circle cx="${x}" cy="${y}" r="4" fill="${c}"/>`; },
  /* callout: small dot on the part, dashed leader, label text (with optional second line) */
  call(px, py, lx, ly, s, o = {}) {
    const a = o.a || (lx < px ? 'end' : 'start'), tx = lx + (a === 'end' ? -6 : a === 'middle' ? 0 : 6);
    return `<polyline points="${px},${py} ${o.kx != null ? `${o.kx},${ly} ` : ''}${lx},${ly}" fill="none" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4 3"/><circle cx="${px}" cy="${py}" r="3" fill="#a78bfa"/>` +
      DG.t(tx, ly + 5, s, { a, s: o.s || 14, w: 600, c: o.c }) + (o.sub ? DG.t(tx, ly + 22, o.sub, { a, s: 12, c: DC.sub, w: 400 }) : '');
  },
  dimH(x1, x2, y, s, o = {}) { return DG.l(x1, y, x2, y, { c: o.c || DC.dim, w: 1.4, m: 'aD', ms: 'aD' }) + DG.l(x1, y - 7, x1, y + 7, { c: o.c || DC.dim, w: 1 }) + DG.l(x2, y - 7, x2, y + 7, { c: o.c || DC.dim, w: 1 }) + DG.sym((x1 + x2) / 2, y + (o.below ? 20 : -8), s, { a: 'middle', c: o.c || DC.dim, s: o.s || 15 }); },
  dimV(x, y1, y2, s, o = {}) { const c = o.c || DC.dim; return DG.l(x, y1, x, y2, { c, w: 1.4, m: 'aD', ms: 'aD' }) + DG.l(x - 7, y1, x + 7, y1, { c, w: 1 }) + DG.l(x - 7, y2, x + 7, y2, { c, w: 1 }) + DG.sym(x + (o.left ? -10 : 10), (y1 + y2) / 2 + 5, s, { a: o.left ? 'end' : 'start', c, s: o.s || 15 }); },
  meter(x, y, s, c = DC.dim) { return `<circle cx="${x}" cy="${y}" r="22" fill="#0f172a" stroke="${c}" stroke-width="2.2"/>` + DG.t(x, y + 5, s, { a: 'middle', c, s: s.length > 1 ? 13 : 16, w: 700, h: 0 }); },
  /* vertical battery: n cells, long plate (+) on top */
  batV(x, yc, n = 2) {
    let s = ''; const g = 10, top = yc - (n * 2 - 1) * g / 2;
    for (let i = 0; i < n * 2; i++) { const y = top + i * g, long = i % 2 === 0; s += `<line x1="${x - (long ? 20 : 11)}" y1="${y}" x2="${x + (long ? 20 : 11)}" y2="${y}" stroke="${DC.comp}" stroke-width="${long ? 2.4 : 5}"/>`; }
    return { svg: s + DG.t(x + 26, top + 4, '+', { c: '#f87171', s: 17, w: 700 }) + DG.t(x + 26, top + (n * 2 - 1) * g + 6, '−', { c: '#60a5fa', s: 17, w: 700 }), top, bot: top + (n * 2 - 1) * g };
  },
  resH(x1, x2, y, c = DC.amber) { const n = 6, w = (x2 - x1) / n; let d = `M${x1} ${y}`; for (let i = 0; i < n; i++) d += ` L${x1 + w * (i + .25)} ${y - 9} L${x1 + w * (i + .75)} ${y + 9}`; return `<path d="${d} L${x2} ${y}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"/>`; },
  resV(x, y1, y2, c = DC.amber) { const n = 6, h = (y2 - y1) / n; let d = `M${x} ${y1}`; for (let i = 0; i < n; i++) d += ` L${x - 9} ${y1 + h * (i + .25)} L${x + 9} ${y1 + h * (i + .75)}`; return `<path d="${d} L${x} ${y2}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"/>`; },
  rheoArrow(x1, y1, x2, y2) { return DG.l(x1, y1, x2, y2, { c: DC.amber, w: 1.6, m: 'aY' }); },
  keyH(x1, x2, y) { return `<circle cx="${x1}" cy="${y}" r="4" fill="none" stroke="${DC.comp}" stroke-width="2"/><circle cx="${x2}" cy="${y}" r="4" fill="none" stroke="${DC.comp}" stroke-width="2"/>` + DG.l(x1 + 3, y - 2, x2 - 4, y - 16, { c: DC.comp, w: 2.2 }); },
  /* vertical diode body centred at yc; down = conventional current flows downward (anode on top) */
  diodeV(x, yc, down = true, c = '#60a5fa', h = 20) {
    const tri = down ? `${x - 17},${yc - h} ${x + 17},${yc - h} ${x},${yc + h * .7}` : `${x - 17},${yc + h} ${x + 17},${yc + h} ${x},${yc - h * .7}`;
    const bar = down ? yc + h * .7 : yc - h * .7;
    return `<polygon points="${tri}" fill="${c}" fill-opacity=".85" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/><line x1="${x - 18}" y1="${bar}" x2="${x + 18}" y2="${bar}" stroke="${c}" stroke-width="3"/>`;
  },
  defs: `<defs>
    <marker id="aD" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9z" fill="#22d3ee"/></marker>
    <marker id="aW" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9z" fill="#cbd5e1"/></marker>
    <marker id="aY" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9z" fill="#fbbf24"/></marker>
    <marker id="aNa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9z" fill="#facc15"/></marker>
    <marker id="aR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9z" fill="#fb7185"/></marker>
    <marker id="aV" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9z" fill="#a78bfa"/></marker>
    <radialGradient id="glowY"><stop offset="0" stop-color="#fef08a"/><stop offset=".45" stop-color="#facc15" stop-opacity=".45"/><stop offset="1" stop-color="#facc15" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowR"><stop offset="0" stop-color="#fecdd3"/><stop offset=".45" stop-color="#fb7185" stop-opacity=".45"/><stop offset="1" stop-color="#fb7185" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowV"><stop offset="0" stop-color="#ede9fe"/><stop offset=".45" stop-color="#a78bfa" stop-opacity=".45"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>
    <linearGradient id="wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8a5523"/><stop offset="1" stop-color="#4a2a10"/></linearGradient>
    <linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#67e8f9" stop-opacity=".22"/><stop offset="1" stop-color="#a5b4fc" stop-opacity=".1"/></linearGradient>
    <linearGradient id="metal" x1="0" x2="1"><stop offset="0" stop-color="#64748b"/><stop offset=".5" stop-color="#cbd5e1"/><stop offset="1" stop-color="#64748b"/></linearGradient>
    <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#475569" stroke-width="2"/></pattern>
  </defs>`,
  panel(x, y, w, h, title) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#0b1220" stroke="#1f2a3d"/>` + (title ? DG.t(x + 14, y + 22, title, { s: 12.5, c: DC.sub, w: 600, h: 0 }) : ''); },
  wrap(body, title) { return `<svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}" font-family="Inter, system-ui, sans-serif">${DG.defs}${body}</svg>`; }
};

const DIAGRAMS = {
  /* ---------------- 1. Newton's rings ---------------- */
  newton() {
    // geometry: horizontal rays y=130,160,190 hit the 45° plate (x = y + 240) and reflect straight down
    const rays = [130, 160, 190];
    let s = '';
    s += `<rect x="36" y="118" width="64" height="84" rx="10" fill="#1e293b" stroke="#475569"/><circle cx="68" cy="160" r="44" fill="url(#glowY)"/><circle cx="68" cy="160" r="10" fill="#fde047"/>`;
    rays.forEach(y => s += DG.l(80, 160, 172, y, { c: '#facc15', w: 1.6 }));
    s += `<ellipse cx="180" cy="160" rx="9" ry="50" fill="url(#glass)" stroke="#67e8f9" stroke-width="1.6"/>`;
    rays.forEach(y => { const xp = y + 240; s += DG.l(189, y, xp, y, { c: '#facc15', w: 1.8, m: xp > 300 ? '' : 'aNa' }) + DG.l(xp, y, xp, 318, { c: '#facc15', w: 1.8, m: 'aNa' }); });
    s += DG.l(270, 130, 300, 130, { c: '#facc15', w: 1.8, m: 'aNa' });
    s += `<line x1="352" y1="112" x2="448" y2="208" stroke="#67e8f9" stroke-width="6" stroke-opacity=".55" stroke-linecap="round"/><line x1="352" y1="112" x2="448" y2="208" stroke="#a5f3fc" stroke-width="1.2"/>`;
    // reflected beams travelling up to the microscope (pass through G)
    [388, 412].forEach(x => s += DG.l(x, 322, x, 92, { c: '#fde68a', w: 1.2, d: '5 4' }));
    s += DG.l(400, 112, 400, 94, { c: '#fde68a', w: 1.2, m: 'aNa' });
    // travelling microscope
    s += `<rect x="370" y="18" width="60" height="14" rx="3" fill="#334155"/><rect x="384" y="32" width="32" height="46" rx="4" fill="#475569"/><rect x="390" y="78" width="20" height="12" rx="2" fill="#64748b"/>
      <rect x="440" y="40" width="120" height="10" rx="3" fill="#334155"/><circle cx="560" cy="45" r="11" fill="#1e293b" stroke="#64748b" stroke-width="2"/>`;
    // plano-convex lens on plate
    s += `<path d="M300 330 L500 330 Q400 410 300 330Z" fill="url(#glass)" stroke="#a5b4fc" stroke-width="2"/>
      <rect x="270" y="370" width="260" height="14" fill="#67e8f9" fill-opacity=".16" stroke="#67e8f9" stroke-width="1.5"/>
      <rect x="250" y="384" width="300" height="16" rx="3" fill="#111827" stroke="#334155"/>`;
    // labels (no overlaps: left column, right column, bottom)
    s += DG.call(68, 202, 68, 250, 'S', { a: 'middle', sub: '' }) + DG.t(68, 290, 'Sodium lamp', { a: 'middle', s: 13, c: DC.sub });
    s += DG.call(180, 210, 180, 250, 'L', { a: 'middle' }) + DG.t(180, 290, 'Convex lens', { a: 'middle', s: 13, c: DC.sub });
    s += DG.call(436, 196, 478, 236, 'G — glass plate at 45°', { kx: 478, sub: 'partially reflecting' });
    s += DG.call(416, 56, 470, 92, 'M — travelling microscope', { kx: 470, sub: 'focused on the air film' });
    s += DG.call(318, 336, 250, 330, 'P — plano-convex lens', { sub: 'large radius R' });
    s += DG.call(276, 377, 238, 384, 'Q — plane glass plate');
    s += DG.call(400, 370, 400, 470, 'O — point of contact', { a: 'middle' });
    s += DG.call(452, 368, 560, 440, 'Thin air film', { kx: 560, sub: 't increases with r' });
    // inset 1: geometry
    const cx = 818, cy = 46, Rr = 170, px = 870, py = cy + Math.sqrt(Rr * Rr - (px - cx) ** 2), oy = cy + Rr;
    const a1 = 52 * Math.PI / 180, ax = Rr * Math.cos(a1), ay = cy + Rr * Math.sin(a1);
    s += DG.panel(690, 18, 258, 262, 'Geometry of the air film (exaggerated)');
    s += `<path d="M${cx - ax} ${ay} A${Rr} ${Rr} 0 0 0 ${cx + ax} ${ay}" fill="none" stroke="#a5b4fc" stroke-width="2.2"/>`;
    s += DG.l(702, oy, 940, oy, { c: '#67e8f9', w: 2.6 });
    s += `<circle cx="${cx}" cy="${cy + 14}" r="3.5" fill="#e2e8f0"/>` + DG.sym(cx - 8, cy + 20, 'C', { a: 'end', s: 14 });
    s += DG.l(cx, cy + 14, px, py, { c: DC.ang, w: 1.6 }) + DG.sym((cx + px) / 2 + 8, (cy + py) / 2, 'R', { c: DC.ang });
    s += DG.l(cx, cy + 14, cx, oy, { c: '#64748b', w: 1.2, d: '4 3' }) + DG.t(cx - 8, (cy + py) / 2 + 20, 'R − t', { a: 'end', s: 13, c: '#cbd5e1', i: 1 });
    s += DG.l(cx, py, px, py, { c: DC.dim, w: 1.6 }) + DG.sym((cx + px) / 2, py - 8, 'r', { a: 'middle', c: DC.dim });
    s += DG.l(px, py, px, oy, { c: DC.pink, w: 2.4 }) + DG.sym(px + 8, (py + oy) / 2 + 6, 't', { c: DC.pink });
    s += DG.t(819, 262, 'r² = R² − (R − t)² ≈ 2Rt', { a: 'middle', s: 13.5, w: 600, h: 0 });
    // inset 2: ring pattern
    s += DG.panel(690, 294, 258, 228, "Newton's rings — reflected light");
    let rings = '';
    for (let n = 1; n <= 16; n++) { const r = Math.sqrt(n - .5) * 24, w = .55 * 24 * (Math.sqrt(n) - Math.sqrt(n - 1)); rings += `<circle cx="819" cy="414" r="${r.toFixed(1)}" fill="none" stroke="#facc15" stroke-opacity="${(.95 - n * .025).toFixed(2)}" stroke-width="${w.toFixed(1)}"/>`; }
    s += `<clipPath id="ringClip"><rect x="698" y="322" width="242" height="190" rx="8"/></clipPath><g clip-path="url(#ringClip)"><rect x="698" y="322" width="242" height="190" fill="#050505"/>${rings}</g>`;
    s += DG.l(700, 414, 938, 414, { c: 'rgba(255,255,255,.35)', w: 1 }) + DG.l(819, 324, 819, 510, { c: 'rgba(255,255,255,.35)', w: 1 });
    const d4 = Math.sqrt(4) * 24;
    s += DG.l(819 - d4, 498, 819 + d4, 498, { c: DC.dim, w: 1.4, m: 'aD', ms: 'aD' }) + DG.t(819, 492, 'D₄', { a: 'middle', c: DC.dim, s: 13, w: 700 });
    s += DG.t(819, 344, 'dark centre', { a: 'middle', s: 12, c: '#fde68a' });
    return { svg: DG.wrap(s, "Newton's rings apparatus"), legend: [['S', 'Sodium vapour lamp (λ = 589.3 nm)'], ['L', 'Convex lens — makes the beam parallel'], ['G', 'Glass plate at 45° — sends light normally onto the film'], ['P', 'Plano-convex lens of large radius R'], ['Q', 'Optically plane glass plate'], ['M', 'Travelling microscope focused on the air film'], ['O', 'Point of contact — dark centre in reflected light'], ['t', 'Air-film thickness at radius r, t = r²/2R']] };
  },

  /* ---------------- 2. Single-slit diffraction ---------------- */
  diffraction() {
    const sx = 330, yc = 270, scr = 740, f1 = 62, f2 = 124;
    let s = '';
    s += `<rect x="36" y="248" width="170" height="44" rx="9" fill="#1e293b" stroke="#475569"/><rect x="206" y="261" width="16" height="18" fill="#334155"/>` + DG.t(121, 276, 'He-Ne LASER', { a: 'middle', s: 13, w: 700, c: '#fca5a5', h: 0 });
    s += `<rect x="48" y="292" width="20" height="18" fill="#334155"/><rect x="174" y="292" width="20" height="18" fill="#334155"/><rect x="30" y="310" width="180" height="8" rx="2" fill="#1f2937"/>`;
    s += `<line x1="222" y1="${yc}" x2="${sx}" y2="${yc}" stroke="#f87171" stroke-width="5" stroke-opacity=".5"/><line x1="222" y1="${yc}" x2="${sx}" y2="${yc}" stroke="#fecaca" stroke-width="1.4"/>`;
    // slit
    s += `<rect x="${sx}" y="80" width="10" height="${yc - 9 - 80}" fill="#475569"/><rect x="${sx}" y="${yc + 9}" width="10" height="${460 - yc - 9}" fill="#475569"/><rect x="${sx - 14}" y="460" width="38" height="10" rx="2" fill="#334155"/>`;
    // rays from slit to screen
    s += DG.l(sx + 10, yc, scr, yc, { c: '#f87171', w: 1.6 });
    [[f1, '6 4', .85], [f2, '2 5', .7]].forEach(([d, da, op]) => { s += `<path d="M${sx + 10} ${yc} L${scr} ${yc - d} M${sx + 10} ${yc} L${scr} ${yc + d}" stroke="#f87171" stroke-width="1.2" stroke-dasharray="${da}" stroke-opacity="${op}" fill="none"/>`; });
    // screen with pattern
    let bands = '';
    for (let y = 80; y <= 460; y += 2) { const u = (y - yc) / f1 * Math.PI, I = u === 0 ? 1 : (Math.sin(u) / u) ** 2; bands += `<rect x="${scr}" y="${y}" width="14" height="2" fill="#f87171" fill-opacity="${Math.min(1, Math.pow(I, .4)).toFixed(2)}"/>`; }
    s += bands + `<rect x="${scr}" y="80" width="14" height="380" fill="none" stroke="#64748b"/><rect x="${scr - 10}" y="460" width="34" height="10" rx="2" fill="#334155"/>`;
    let prof = '';
    for (let y = 80; y <= 460; y += 1.5) { const u = (y - yc) / f1 * Math.PI, I = u === 0 ? 1 : (Math.sin(u) / u) ** 2; prof += `${(scr + 22 + 120 * I).toFixed(1)},${y} `; }
    s += `<line x1="${scr + 22}" y1="80" x2="${scr + 22}" y2="460" stroke="#334155"/><polyline points="${prof}" fill="none" stroke="#fda4af" stroke-width="2"/>`;
    // angle θ and dimensions
    const ang = Math.atan2(f1, scr - sx - 10), r = 92;
    s += `<path d="M${sx + 10 + r} ${yc} A${r} ${r} 0 0 0 ${(sx + 10 + r * Math.cos(ang)).toFixed(1)} ${(yc - r * Math.sin(ang)).toFixed(1)}" fill="none" stroke="${DC.ang}" stroke-width="1.8"/>` + DG.sym(sx + 10 + r + 8, yc - 4, 'θ', { c: DC.ang });
    s += DG.dimV(scr - 14, yc - f1, yc, 'x₁', { left: true });
    s += DG.dimH(sx + 5, scr + 7, 500, 'D  (≈ 1 m)', { below: false });
    s += DG.l(sx - 30, yc - 9, sx - 2, yc - 9, { c: DC.dim, w: 1, d: '2 2' }) + DG.l(sx - 30, yc + 9, sx - 2, yc + 9, { c: DC.dim, w: 1, d: '2 2' }) + DG.dimV(sx - 24, yc - 9, yc + 9, 'a', { left: true, s: 16 });
    // labels
    s += DG.call(121, 248, 121, 200, 'Laser source', { a: 'middle', sub: 'λ = 632.8 nm, plane wavefront' });
    s += DG.call(335, 82, 335, 50, 'Single slit (width a)', { a: 'middle' });
    s += DG.call(747, 82, 747, 50, 'Screen with graph paper', { a: 'middle' });
    s += DG.t(scr + 76, yc - 34, 'central max', { s: 12.5, c: '#fecaca' });
    s += DG.t(scr + 40, yc - f1 + 5, '1st min', { s: 12, c: DC.sub }) + DG.t(scr + 40, yc + f1 + 5, '1st min', { s: 12, c: DC.sub });
    s += DG.t(scr + 40, yc - f2 + 5, '2nd min', { s: 12, c: DC.sub }) + DG.t(scr + 40, yc + f2 + 5, '2nd min', { s: 12, c: DC.sub });
    s += DG.t(scr + 120, 136, 'I = I₀ (sin β / β)²', { a: 'middle', s: 13, c: '#fda4af', w: 600 });
    s += DG.panel(30, 360, 250, 116, 'Working relations') + DG.t(46, 408, 'Minima:  a sin θ = nλ', { s: 15, w: 600, h: 0 }) + DG.t(46, 434, 'sin θ ≈ xₙ / D', { s: 15, w: 600, h: 0 }) + DG.t(46, 460, 'λ = a·xₙ / (n·D)', { s: 15, w: 700, c: '#a5f3fc', h: 0 });
    return { svg: DG.wrap(s, 'Single slit diffraction set-up'), legend: [['L', 'He-Ne laser — monochromatic, coherent plane wavefront'], ['a', 'Width of the single slit'], ['D', 'Distance from slit to screen'], ['θ', 'Diffraction angle of the 1st minimum'], ['x₁', 'Distance of the 1st minimum from the centre'], ['I', 'Intensity profile on the screen, (sin β/β)²']] };
  },

  /* ---------------- 3. LED V-I ---------------- */
  led() {
    const x0 = 140, x1 = 680, y0 = 130, y1 = 410, yc = 270;
    const b = DG.batV(x0, yc, 2);
    let s = '';
    s += DG.wire([[x0, b.top], [x0, y0], [210, y0]]) + DG.keyH(214, 262, y0) + DG.wire([[266, y0], [300, y0]]) + DG.resH(300, 400, y0) + DG.wire([[400, y0], [478, y0]]) + DG.meter(500, y0, 'mA') + DG.wire([[522, y0], [x1, y0], [x1, yc - 22]]);
    s += DG.wire([[x1, yc + 18], [x1, y1], [x0, y1], [x0, b.bot]]) + b.svg;
    s += `<circle cx="${x1}" cy="${yc}" r="48" fill="url(#glowR)"/>` + DG.diodeV(x1, yc, true, '#fb7185');
    s += DG.l(x1 + 22, yc - 6, x1 + 52, yc - 30, { c: '#fb7185', w: 1.8, m: 'aR' }) + DG.l(x1 + 22, yc + 10, x1 + 52, yc - 14, { c: '#fb7185', w: 1.8, m: 'aR' });
    s += DG.wire([[x1, 180], [800, 180], [800, 248]]) + DG.meter(800, yc, 'V', '#a78bfa') + DG.wire([[800, 292], [800, 360], [x1, 360]]) + DG.dot(x1, 180) + DG.dot(x1, 360);
    s += DG.t(486, y0 - 26, '+', { c: '#f87171', s: 13, w: 700, a: 'middle' }) + DG.t(514, y0 - 26, '−', { c: '#60a5fa', s: 13, w: 700, a: 'middle' }) + DG.t(818, 246, '+', { c: '#f87171', s: 13, w: 700 }) + DG.t(818, 302, '−', { c: '#60a5fa', s: 13, w: 700 });
    s += DG.l(580, y0, 620, y0, { c: '#cbd5e1', w: 2, m: 'aW' }) + DG.sym(600, y0 - 10, 'I', { a: 'middle', s: 14 });
    // labels
    s += DG.t(x0 - 34, yc - 4, 'E', { a: 'end', s: 16, w: 700, i: 1 }) + DG.t(x0 - 34, yc + 14, 'DC supply 0–5 V', { a: 'end', s: 12.5, c: DC.sub });
    s += DG.t(238, y0 - 30, 'K', { a: 'middle', s: 15, w: 700, i: 1 }) + DG.t(238, y0 + 30, 'key', { a: 'middle', s: 12, c: DC.sub });
    s += DG.t(350, y0 - 26, 'R ≈ 470 Ω', { a: 'middle', s: 14, w: 600 }) + DG.t(350, y0 + 32, 'current limiter', { a: 'middle', s: 12, c: DC.sub });
    s += DG.t(500, y0 - 44, 'Milliammeter (0–25 mA)', { a: 'middle', s: 13, c: DC.sub });
    s += DG.t(x1 - 32, yc - 4, 'LED', { a: 'end', s: 15, w: 700, c: '#fda4af' }) + DG.t(x1 - 32, yc + 14, 'forward biased', { a: 'end', s: 12, c: DC.sub });
    s += DG.t(832, yc + 5, 'Voltmeter', { s: 13.5, w: 600 }) + DG.t(832, yc + 22, '(0–5 V, across LED)', { s: 12, c: DC.sub });
    // LED package inset
    s += DG.panel(30, 446, 330, 80, 'Identifying the LED terminals');
    s += `<path d="M232 486 a16 16 0 0 1 32 0 v18 h-32z" fill="#fb7185" fill-opacity=".35" stroke="#fda4af"/><line x1="264" y1="486" x2="264" y2="504" stroke="#fda4af" stroke-width="3"/>` + DG.l(240, 504, 240, 522, { c: '#cbd5e1', w: 2.4 }) + DG.l(256, 504, 256, 516, { c: '#cbd5e1', w: 2.4 });
    s += DG.t(222, 492, 'Anode (+): longer leg', { a: 'end', s: 12, c: '#fecaca', h: 0 }) + DG.t(222, 510, 'Cathode (−): flat edge, short leg', { a: 'end', s: 12, c: '#bfdbfe', h: 0 });
    s += DG.panel(560, 446, 370, 80, 'Relations') + DG.t(578, 490, 'eV_k ≈ hc / λ', { s: 15, w: 600, h: 0 }) + DG.t(578, 514, 'h = e·V_k·λ / c', { s: 15, w: 700, c: '#a5f3fc', h: 0 }) + DG.t(760, 490, 'r_d = ΔV / ΔI', { s: 15, w: 600, h: 0 });
    return { svg: DG.wrap(s, 'LED V-I characteristics circuit'), legend: [['E', 'Regulated DC supply (0–5 V)'], ['K', 'Plug key / switch'], ['R', 'Series resistor to limit current'], ['mA', 'Milliammeter in series'], ['V', 'Voltmeter in parallel with the LED'], ['D', 'LED in forward bias (anode towards +)']] };
  },

  /* ---------------- 4. PN junction diode ---------------- */
  diode() {
    const circuit = (ox, rev) => {
      const x0 = ox + 70, x1 = ox + 300, y0 = 130, y1 = 420, yc = 275;
      const b = DG.batV(x0, yc, 2);
      let s = DG.wire([[x0, b.top], [x0, y0], [x0 + 40, y0]]) + DG.resH(x0 + 40, x0 + 120, y0) + DG.wire([[x0 + 120, y0], [x1, y0]]);
      s += DG.wire([[x1, y1], [x0, y1], [x0, b.bot]]) + b.svg;
      if (!rev) {
        // forward: mA on top wire, diode (anode up) on right, voltmeter directly across diode
        s = DG.wire([[x0, b.top], [x0, y0], [x0 + 40, y0]]) + DG.resH(x0 + 40, x0 + 120, y0) + DG.wire([[x0 + 120, y0], [x0 + 158, y0]]) + DG.meter(x0 + 180, y0, 'mA') + DG.wire([[x0 + 202, y0], [x1, y0], [x1, yc - 22]]);
        s += DG.wire([[x1, yc + 16], [x1, y1], [x0, y1], [x0, b.bot]]) + b.svg + DG.diodeV(x1, yc, true, '#60a5fa');
        s += DG.wire([[x1, 190], [x1 + 90, 190], [x1 + 90, yc - 22]]) + DG.meter(x1 + 90, yc, 'V', '#a78bfa') + DG.wire([[x1 + 90, yc + 22], [x1 + 90, 360], [x1, 360]]) + DG.dot(x1, 190) + DG.dot(x1, 360);
        s += DG.t(x1 - 26, yc - 2, 'D', { a: 'end', s: 16, w: 700, i: 1, c: '#93c5fd' }) + DG.t(x1 - 26, yc + 15, 'p (anode) at top', { a: 'end', s: 11.5, c: DC.sub });
        s += DG.t(x0 + 180, y0 - 32, 'mA meter', { a: 'middle', s: 12.5, c: DC.sub }) + DG.t(x1 + 118, yc + 5, '0–1 V', { s: 12, c: DC.sub });
      } else {
        // reverse: µA meter in series with diode; voltmeter across the series pair (so µA reads only diode current)
        s += DG.wire([[x1, y0], [x1, 196]]) + DG.meter(x1, 218, 'µA') + DG.wire([[x1, 240], [x1, yc + 30 - 24]]) + DG.diodeV(x1, yc + 30, false, '#34d399') + DG.wire([[x1, yc + 30 + 20], [x1, y1]]);
        s += DG.wire([[x1, 160], [x1 + 90, 160], [x1 + 90, yc - 22]]) + DG.meter(x1 + 90, yc, 'V', '#a78bfa') + DG.wire([[x1 + 90, yc + 22], [x1 + 90, 380], [x1, 380]]) + DG.dot(x1, 160) + DG.dot(x1, 380);
        s += DG.t(x1 - 26, yc + 32, 'D', { a: 'end', s: 16, w: 700, i: 1, c: '#6ee7b7' }) + DG.t(x1 - 26, yc + 49, 'n (cathode) at top', { a: 'end', s: 11.5, c: DC.sub });
        s += DG.t(x1 - 28, 222, 'µA meter', { a: 'end', s: 12.5, c: DC.sub }) + DG.t(x1 + 118, yc + 5, '0–15 V', { s: 12, c: DC.sub });
      }
      s += DG.t(x0 + 80, y0 - 24, 'R = 1 kΩ', { a: 'middle', s: 13, w: 600 });
      s += DG.t(x0 - 34, yc + 4, 'E', { a: 'end', s: 16, w: 700, i: 1 }) + DG.t(x0 - 34, yc + 21, rev ? '0–15 V' : '0–5 V', { a: 'end', s: 12, c: DC.sub });
      s += DG.l(x0 + 136, y0 - 14, x0 + 150, y0 - 14, { c: '#cbd5e1', w: 1.6, m: 'aW' });
      return s;
    };
    let s = circuit(20, false) + circuit(500, true);
    s += DG.t(40, 50, '(a) Forward bias', { s: 17, w: 700, c: '#93c5fd' }) + DG.t(40, 72, 'p-side to + terminal; current in mA', { s: 12.5, c: DC.sub });
    s += DG.t(520, 50, '(b) Reverse bias', { s: 17, w: 700, c: '#6ee7b7' }) + DG.t(520, 72, 'n-side to + terminal; current in µA', { s: 12.5, c: DC.sub });
    s += `<line x1="480" y1="40" x2="480" y2="500" stroke="#1f2a3d" stroke-width="2"/>`;
    s += DG.t(500, 470, 'Voltmeter across µA meter + diode, so the', { s: 12, c: '#fde68a' }) + DG.t(500, 488, 'µA meter does not include the voltmeter current.', { s: 12, c: '#fde68a' });
    s += DG.t(40, 470, 'Voltmeter directly across the diode; mA meter', { s: 12, c: '#fde68a' }) + DG.t(40, 488, 'current ≫ voltmeter current in forward bias.', { s: 12, c: '#fde68a' });
    return { svg: DG.wrap(s, 'PN junction diode circuits'), legend: [['D', 'Silicon p-n junction diode (1N4007)'], ['R', '1 kΩ current-limiting resistor'], ['mA', 'Milliammeter — forward current'], ['µA', 'Microammeter — reverse saturation current'], ['V', 'Voltmeter (0–1 V forward, 0–15 V reverse)'], ['E', 'Variable DC supply']] };
  },

  /* ---------------- 5. Photoelectric effect ---------------- */
  photo() {
    const bx = 470, by = 200, br = 118;
    let s = '';
    s += `<rect x="30" y="160" width="74" height="84" rx="10" fill="#1e293b" stroke="#475569"/><circle cx="67" cy="202" r="46" fill="url(#glowV)"/><circle cx="67" cy="202" r="11" fill="#ede9fe"/>`;
    s += `<rect x="150" y="150" width="14" height="104" rx="3" fill="#8b5cf6" fill-opacity=".45" stroke="#a78bfa" stroke-width="1.5"/>`;
    s += `<rect x="104" y="188" width="46" height="28" fill="#a78bfa" fill-opacity=".2"/>`;
    [168, 202, 236].forEach(y => { const yE = by + (y - by) * .55; let d2 = `M176 ${y}`; const n = 13, dx = (548 - 176) / (n * 2), dy = (yE - y) / (n * 2); for (let k = 0; k < n; k++) d2 += ` q${dx / 2} ${dy / 2 - 7} ${dx} ${dy} t${dx} ${dy}`; s += `<path d="${d2}" fill="none" stroke="#a78bfa" stroke-width="1.7" marker-end="url(#aV)"/>`; });
    // tube
    s += `<circle cx="${bx}" cy="${by}" r="${br}" fill="url(#glass)" stroke="#67e8f9" stroke-width="2"/><rect x="420" y="${by + br - 6}" width="100" height="22" rx="4" fill="#1e293b" stroke="#475569"/>`;
    const ca = 62 * Math.PI / 180, cr = 90;
    s += `<path d="M${bx + cr * Math.cos(ca)} ${by - cr * Math.sin(ca)} A${cr} ${cr} 0 0 1 ${bx + cr * Math.cos(ca)} ${by + cr * Math.sin(ca)}" fill="none" stroke="#fbbf24" stroke-width="8" stroke-linecap="round"/>`;
    s += `<circle cx="${bx - 6}" cy="${by}" r="6" fill="#e2e8f0"/>`;
    // electrons from cathode to anode
    [[548, 168], [556, 200], [548, 232]].forEach(([x, y]) => s += DG.l(x - 8, y, bx + 6, by + (y - by) * .25, { c: DC.dim, w: 1.6, m: 'aD', d: '3 3' }));
    s += DG.t(500, 162, 'e⁻', { c: DC.dim, s: 14, w: 700 });
    // internal leads to pins
    s += DG.wire([[bx - 6, by + 6], [bx - 6, by + 60], [440, 300], [440, 340]], { w: 1.6 }) + DG.wire([[bx + cr * Math.cos(ca), by + cr * Math.sin(ca)], [500, 300], [500, 340]], { w: 1.6 });
    // external circuit: anode → µA → (−) supply (+) → cathode ; V across supply
    const b = DG.batV(760, 425, 2);
    s += DG.wire([[440, 340], [440, 480], [578, 480]]) + DG.meter(600, 480, 'µA') + DG.wire([[622, 480], [760, 480], [760, b.bot]]);
    s += DG.wire([[500, 340], [500, 375], [760, 375], [760, b.top]]) + b.svg + DG.l(730, 455, 792, 395, { c: DC.amber, w: 1.6, m: 'aY' });
    s += DG.wire([[760, 375], [870, 375], [870, 403]]) + DG.meter(870, 425, 'V', '#a78bfa') + DG.wire([[870, 447], [870, 480], [760, 480]]) + DG.dot(760, 375) + DG.dot(760, 480);
    // labels
    s += DG.call(67, 244, 67, 290, 'Mercury lamp', { a: 'middle', sub: 'line spectrum' });
    s += DG.call(157, 254, 157, 330, 'Filter F', { a: 'middle', sub: 'selects ν' });
    s += DG.t(300, 140, 'photons, energy hν', { a: 'middle', s: 13.5, c: '#c4b5fd', w: 600 });
    s += DG.call(551, 120, 640, 90, 'C — photocathode', { sub: 'alkali coating, low φ' });
    s += DG.call(bx - 6, by - 6, 400, 60, 'A — anode (collector wire)', { a: 'middle', kx: 400 });
    s += DG.call(392, 290, 330, 330, 'Evacuated glass bulb', { a: 'end' });
    s += DG.t(425, 352, 'A', { s: 13, w: 700, a: 'end' }) + DG.t(510, 352, 'C', { s: 13, w: 700 });
    s += DG.t(706, 432, 'variable', { a: 'end', s: 12, c: DC.sub }) + DG.t(706, 448, 'DC supply', { a: 'end', s: 12, c: DC.sub });
    s += DG.t(610, 368, 'cathode → (+)', { a: 'middle', s: 12, c: '#fca5a5' }) + DG.t(600, 524, 'anode → (−) : retarding field', { a: 'middle', s: 12, c: '#93c5fd' });
    s += DG.t(900, 430, 'V₀', { s: 15, w: 700, i: 1, c: '#c4b5fd' });
    s += DG.panel(30, 400, 260, 120, 'Einstein’s equation') + DG.t(46, 446, 'hν = φ + ½mv²ₘₐₓ', { s: 15, w: 600, h: 0 }) + DG.t(46, 472, 'eV₀ = hν − φ', { s: 15, w: 600, h: 0 }) + DG.t(46, 500, 'slope of V₀–ν = h/e', { s: 15, w: 700, c: '#a5f3fc', h: 0 });
    return { svg: DG.wrap(s, 'Photoelectric effect apparatus'), legend: [['S', 'Mercury lamp — line spectrum source'], ['F', 'Colour filter selects the frequency ν'], ['C', 'Photocathode (half-cylinder, low work function)'], ['A', 'Anode wire (collector) at the axis'], ['µA', 'Microammeter — photocurrent'], ['V', 'Voltmeter — retarding potential; V₀ when I = 0']] };
  },

  /* ---------------- 6. Bar pendulum ---------------- */
  pendulum() {
    const px = 230, G = 280, sc = 4.2, l = 25, K = 100 / Math.sqrt(12), L = l + K * K / l, py = G - l * sc, oy = py + L * sc;
    let s = '';
    s += `<rect x="40" y="40" width="26" height="470" fill="url(#hatch)" stroke="#475569"/><rect x="66" y="${py + 8}" width="${px - 50}" height="12" fill="url(#metal)" stroke="#475569"/>`;
    const bar = `<rect x="${px - 17}" y="${G - 50 * sc}" width="34" height="${100 * sc}" rx="7" fill="#1f2937" stroke="#cbd5e1" stroke-width="1.8"/>` + Array.from({ length: 19 }, (_, i) => i - 9).filter(k => k !== 0).map(k => `<circle cx="${px}" cy="${G + k * 5 * sc}" r="4.5" fill="#0b1220" stroke="#64748b" stroke-width="1.2"/>`).join('');
    s += `<g opacity=".22" transform="rotate(-11 ${px} ${py})">${bar}</g>` + bar;
    s += `<polygon points="${px - 10},${py + 9} ${px + 10},${py + 9} ${px},${py - 4}" fill="#fbbf24"/>`;
    s += `<circle cx="${px}" cy="${G}" r="7" fill="#34d399"/><circle cx="${px}" cy="${oy}" r="7" fill="none" stroke="#f472b6" stroke-width="2.6"/>`;
    s += DG.dimV(178, py, G, 'l', { left: true }) + DG.dimV(130, py, oy, 'L', { left: true, c: DC.pink });
    s += DG.t(130, oy + 26, 'L = l + K²/l', { a: 'middle', s: 12.5, c: '#f9a8d4' });
    s += DG.l(px, py, px, py + 330, { c: '#475569', w: 1, d: '3 4' }) + `<path d="M${px} ${py + 300} A300 300 0 0 0 ${(px + 300 * Math.sin(11 * Math.PI / 180)).toFixed(1)} ${(py + 300 * Math.cos(11 * Math.PI / 180)).toFixed(1)}" fill="none" stroke="${DC.ang}" stroke-width="1.8"/>` + DG.sym(px + 30, py + 322, 'θ', { a: 'middle', c: DC.ang });
    s += DG.call(px + 10, py, 300, py - 40, 'S — knife-edge (pivot)', { sub: 'on rigid wall bracket' });
    s += DG.call(px + 7, G, 300, G, 'G — centre of gravity');
    s += DG.call(px + 7, oy, 300, oy, 'O — centre of oscillation', { c: '#f9a8d4' });
    s += DG.call(px + 17, G + 3 * 5 * sc, 300, G + 3 * 5 * sc + 14, 'Holes every 5 cm');
    s += `<g transform="translate(70,500)"><circle r="28" fill="#0f172a" stroke="#64748b" stroke-width="2"/><rect x="-6" y="-40" width="12" height="9" rx="2" fill="#64748b"/>${DG.l(0, 0, 0, -18, { c: '#e2e8f0', w: 2 })}${DG.l(0, 0, 13, 7, { c: DC.dim, w: 2 })}</g>` + DG.t(108, 506, 'stopwatch', { s: 12, c: DC.sub });
    // W-curve inset with graphical construction
    const X0 = 520, X1 = 930, Y0 = 70, Y1 = 490, xm = l2 => X0 + 30 + (l2 + 50) / 100 * (X1 - X0 - 50), ym = T => Y1 - 40 - (T - 1.3) / (2.6 - 1.3) * (Y1 - Y0 - 80);
    const Tf = lc => { const a = Math.abs(lc) / 100, k = K / 100; return 2 * Math.PI * Math.sqrt((k * k + a * a) / (9.81 * a)); };
    s += DG.panel(X0, 22, X1 - X0 + 10, 498, 'Graph: T vs distance from G (W-curve)');
    s += DG.l(xm(-50), ym(1.3), xm(50), ym(1.3), { c: '#64748b', w: 1.4 }) + DG.l(xm(0), ym(1.3), xm(0), ym(2.6), { c: '#64748b', w: 1.4, d: '4 3' });
    [-1, 1].forEach(sg => { let pts = ''; for (let a = 4.6; a <= 50; a += .5) { const T = Tf(a); if (T <= 2.6) pts += `${xm(sg * a).toFixed(1)},${ym(T).toFixed(1)} `; } s += `<polyline points="${pts}" fill="none" stroke="#34d399" stroke-width="2.4"/>`; });
    const Ts = 1.6, Lt = 9.81 * Ts * Ts / (4 * Math.PI ** 2) * 100, disc = Math.sqrt(Lt * Lt - 4 * K * K), lo = (Lt - disc) / 2, hi = (Lt + disc) / 2;
    s += DG.l(xm(-50), ym(Ts), xm(50), ym(Ts), { c: DC.amber, w: 1.4, d: '6 4' }) + DG.t(xm(50) - 2, ym(Ts) - 8, `T = ${Ts} s`, { a: 'end', s: 12, c: '#fde68a' });
    [[-hi, 'A'], [-lo, 'B'], [lo, 'C'], [hi, 'D']].forEach(([v, n]) => { s += `<circle cx="${xm(v)}" cy="${ym(Ts)}" r="5" fill="#fbbf24"/>` + DG.sym(xm(v), ym(Ts) + 24, n, { a: 'middle', c: '#fde68a', s: 14 }); });
    s += DG.l(xm(-hi), ym(Ts) + 40, xm(lo), ym(Ts) + 40, { c: DC.dim, w: 1.3, m: 'aD', ms: 'aD' }) + DG.t((xm(-hi) + xm(lo)) / 2, ym(Ts) + 34, 'AC = L', { a: 'middle', s: 12.5, c: DC.dim, w: 600 });
    s += DG.l(xm(-lo), ym(Ts) + 62, xm(hi), ym(Ts) + 62, { c: DC.pink, w: 1.3, m: 'aD', ms: 'aD' }) + DG.t((xm(-lo) + xm(hi)) / 2, ym(Ts) + 56, 'BD = L', { a: 'middle', s: 12.5, c: '#f9a8d4', w: 600 });
    s += DG.t(xm(0) + 6, ym(2.6) + 12, 'T (s)', { s: 12, c: DC.sub }) + DG.t(xm(50), ym(1.3) + 20, 'l (cm) →', { a: 'end', s: 12, c: DC.sub }) + DG.t(xm(-50), ym(1.3) + 20, '← side B', { s: 12, c: DC.sub }) + DG.t(xm(0), ym(1.3) + 20, 'G', { a: 'middle', s: 12, c: '#6ee7b7', w: 700 });
    s += DG.t(X0 + 20, Y1 + 18, 'L = (AC + BD)/2,   g = 4π²L/T²,   K = ½√(AD·BC)', { s: 13, w: 600, h: 0 });
    return { svg: DG.wrap(s, 'Bar pendulum and W-curve construction'), legend: [['S', 'Knife-edge pivot (axis of suspension)'], ['G', 'Centre of gravity of the bar'], ['l', 'Distance of pivot from G'], ['O', 'Centre of oscillation, at L = l + K²/l from S'], ['θ', 'Small angular amplitude (< 5°)'], ['A–D', 'Points of equal period used to find L on the graph']] };
  },

  /* ---------------- 7. Solar cell ---------------- */
  solar() {
    let s = '';
    s += `<path d="M120 40 L200 40 L188 70 L132 70Z" fill="#334155" stroke="#475569"/><circle cx="160" cy="76" r="44" fill="url(#glowY)"/><circle cx="160" cy="74" r="12" fill="#fde047"/>`;
    [-60, -30, 0, 30, 60].forEach(dx => s += DG.l(160 + dx * .25, 100, 160 + dx * 1.1, 186, { c: '#facc15', w: 1.6, m: 'aNa', d: '7 4' }));
    let cells = '';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) cells += `<rect x="${86 + i * 38}" y="${200 + j * 34}" width="35" height="31" fill="#1e3a8a" stroke="#60a5fa" stroke-width=".8"/>`;
    s += `<rect x="80" y="194" width="162" height="114" rx="4" fill="#0f172a" stroke="#93c5fd" stroke-width="2"/>${cells}`;
    s += `<rect x="96" y="356" width="56" height="34" rx="6" fill="#1e293b" stroke="#64748b"/><rect x="104" y="363" width="40" height="14" rx="2" fill="#0f172a"/>` + DG.t(124, 374, '850', { a: 'middle', s: 10, c: '#a5f3fc', h: 0 });
    // circuit
    const N1 = [360, 210], N2 = [360, 300];
    s += DG.wire([[242, 210], N1, [360, 110], [498, 110]]) + DG.meter(520, 110, 'mA') + DG.wire([[542, 110], [800, 110], [800, 170]]);
    s += DG.resV(800, 170, 280) + DG.l(770, 266, 834, 182, { c: DC.amber, w: 1.6, m: 'aY' }) + DG.wire([[800, 280], [800, 410], [604, 410]]) + DG.keyH(560, 600, 410) + DG.wire([[556, 410], [360, 410], N2, [242, 300]]);
    s += DG.wire([N1, [360, 233]]) + DG.meter(360, 255, 'V', '#a78bfa') + DG.wire([[360, 277], N2]) + DG.dot(...N1) + DG.dot(...N2);
    s += DG.t(250, 204, '+', { c: '#f87171', s: 16, w: 700 }) + DG.t(250, 296, '−', { c: '#60a5fa', s: 16, w: 700 });
    s += DG.l(640, 110, 680, 110, { c: '#cbd5e1', w: 2, m: 'aW' }) + DG.sym(660, 100, 'I', { a: 'middle', s: 14 });
    // inset sketch: I-V and P-V
    const ix = 420, iy = 160, iw = 330, ih = 210;
    s += DG.panel(ix, iy, iw, ih, 'Expected I–V and P–V curves');
    const X = v => ix + 40 + v / .62 * (iw - 70), Y = i => iy + ih - 30 - i * (ih - 70);
    const Ic = v => 1 - Math.exp((v - .6) / .035);
    let iv = '', pv = '', pm = 0, vm = 0;
    for (let v = 0; v <= .6; v += .005) { const i = Math.max(0, Ic(v)); iv += `${X(v).toFixed(1)},${Y(i).toFixed(1)} `; const p = v * i / .48; pv += `${X(v).toFixed(1)},${Y(p).toFixed(1)} `; if (v * i > pm) { pm = v * i; vm = v; } }
    s += DG.l(X(0), Y(0), X(.62), Y(0), { c: '#64748b', w: 1.2 }) + DG.l(X(0), Y(0), X(0), Y(1.08), { c: '#64748b', w: 1.2 });
    s += `<rect x="${X(0)}" y="${Y(Ic(vm))}" width="${X(vm) - X(0)}" height="${Y(0) - Y(Ic(vm))}" fill="#22d3ee" fill-opacity=".08" stroke="#22d3ee" stroke-dasharray="4 3"/>`;
    s += `<polyline points="${iv}" fill="none" stroke="#fbbf24" stroke-width="2.4"/><polyline points="${pv}" fill="none" stroke="#a78bfa" stroke-width="2" stroke-dasharray="6 4"/>`;
    s += `<circle cx="${X(vm)}" cy="${Y(Ic(vm))}" r="5" fill="#22d3ee"/>` + DG.t(X(vm) - 10, Y(Ic(vm)) + 22, 'MPP (Vₘ, Iₘ)', { a: 'end', s: 11.5, c: DC.dim, w: 600 });
    s += DG.t(X(0) - 6, Y(1) + 4, 'I_sc', { a: 'end', s: 12, c: '#fde68a', w: 600 }) + DG.t(X(.6), Y(0) + 16, 'V_oc', { a: 'middle', s: 12, c: '#fde68a', w: 600 }) + DG.t(X(.3), Y(.32), 'P = VI', { s: 12, c: '#c4b5fd' });
    // labels
    s += DG.t(212, 60, 'Lamp / sunlight', { s: 14, w: 600 }) + DG.t(212, 77, 'irradiance E (W m⁻²)', { s: 12, c: DC.sub });
    s += DG.t(161, 334, 'Solar cell (area A)', { a: 'middle', s: 14, w: 600 });
    s += DG.t(162, 378, 'Lux meter / pyranometer', { s: 12, c: DC.sub });
    s += DG.t(520, 76, 'Milliammeter', { a: 'middle', s: 12.5, c: DC.sub });
    s += DG.t(388, 260, 'Voltmeter', { s: 12, c: DC.sub });
    s += DG.t(848, 220, 'R_L', { s: 15, w: 700, i: 1, c: '#fde68a' }) + DG.t(848, 238, 'variable load', { s: 12, c: DC.sub }) + DG.t(848, 254, '(rheostat)', { s: 12, c: DC.sub });
    s += DG.t(580, 444, 'K — key', { a: 'middle', s: 12.5, c: DC.sub });
    s += DG.panel(30, 430, 400, 94, 'Results') + DG.t(46, 474, 'FF = VₘIₘ / (V_oc · I_sc)', { s: 15, w: 600, h: 0 }) + DG.t(46, 502, 'η = Pₘₐₓ / (E · A) × 100 %', { s: 15, w: 700, c: '#a5f3fc', h: 0 });
    return { svg: DG.wrap(s, 'Solar cell characteristics circuit'), legend: [['E', 'Light source — irradiance measured at the cell'], ['SC', 'Solar cell of active area A (+ on front contact)'], ['mA', 'Milliammeter in series with the load'], ['V', 'Voltmeter across the cell terminals'], ['R_L', 'Variable load resistance, varied from 0 to ∞'], ['K', 'Key to open the circuit (I = 0 → V_oc)']] };
  },

  /* ---------------- 8. Sonometer ---------------- */
  sonometer() {
    const bxA = 230, bxB = 560, wy = 238, top = 256;
    let s = '';
    s += `<rect x="60" y="${top}" width="680" height="96" rx="6" fill="url(#wood)" stroke="#92400e"/>`;
    [200, 400, 600].forEach(x => s += `<circle cx="${x}" cy="${top + 52}" r="14" fill="#1c0f05" stroke="#5b3412"/>`);
    s += `<rect x="70" y="${top - 26}" width="18" height="26" fill="#64748b"/>`;
    [bxA, bxB].forEach(x => s += `<polygon points="${x - 12},${top} ${x + 12},${top} ${x},${wy}" fill="#e2e8f0" stroke="#94a3b8"/>`);
    s += DG.l(80, wy, 760, wy, { c: '#e5e7eb', w: 1.8 });
    let up = `M${bxA} ${wy}`, dn = `M${bxA} ${wy}`;
    for (let x = bxA; x <= bxB; x += 3) { const y = 22 * Math.sin(Math.PI * (x - bxA) / (bxB - bxA)); up += ` L${x} ${wy - y}`; dn += ` L${x} ${wy + y}`; }
    s += `<path d="${up}" fill="none" stroke="#a78bfa" stroke-width="1.6" stroke-dasharray="5 4"/><path d="${dn}" fill="none" stroke="#a78bfa" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    const mid = (bxA + bxB) / 2;
    s += `<path d="M${mid - 8} ${wy} L${mid} ${wy - 14} L${mid + 8} ${wy}" fill="none" stroke="#f472b6" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += DG.sym(bxA, top + 22, 'N', { a: 'middle', c: '#a5f3fc', s: 12 }) + DG.sym(bxB, top + 22, 'N', { a: 'middle', c: '#a5f3fc', s: 12 });
    // pulley and hanger
    s += `<rect x="740" y="${top - 6}" width="34" height="56" fill="#334155"/><circle cx="772" cy="${wy + 12}" r="13" fill="#1e293b" stroke="#94a3b8" stroke-width="2.2"/>`;
    s += DG.l(785, wy + 12, 785, 400, { c: '#e5e7eb', w: 1.8 }) + `<path d="M772 400 L798 400 L798 408 L772 408Z" fill="#64748b"/>`;
    [0, 1, 2, 3].forEach(i => s += `<rect x="766" y="${410 + i * 15}" width="38" height="13" rx="2" fill="${i % 2 ? '#a16207' : '#ca8a04'}" stroke="#854d0e"/>`);
    // tuning fork resting on box
    const fx = 650;
    s += `<path d="M${fx - 12} 120 L${fx - 12} 190 Q${fx} 204 ${fx + 12} 190 L${fx + 12} 120" fill="none" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>` + DG.l(fx, 198, fx, top - 2, { c: '#cbd5e1', w: 6 });
    s += `<path d="M${fx - 26} 132 q-7 10 0 20 M${fx + 26} 132 q7 10 0 20 M${fx - 36} 126 q-11 16 0 32 M${fx + 36} 126 q11 16 0 32" fill="none" stroke="#a78bfa" stroke-width="1.6"/>`;
    // dimension and labels
    s += DG.dimH(bxA, bxB, 196, 'l  (resonating length)');
    s += DG.call(bxA - 10, top - 4, 150, 170, 'Bridge A', { a: 'end', kx: 150, sub: 'knife-edge (node)' });
    s += DG.call(bxB + 8, top - 6, 520, 120, 'Bridge B (movable)', { a: 'end', kx: 520 });
    s += DG.call(mid, wy - 14, 330, 120, 'Paper rider', { a: 'end', kx: 330, sub: 'flies off at resonance' });
    s += DG.t(fx + 50, 140, 'Tuning fork (f)', { s: 14, w: 600 }) + DG.t(fx + 50, 158, 'stem pressed on box', { s: 12, c: DC.sub });
    s += DG.t(820, 250, 'Pulley', { s: 13.5, w: 600 }) + DG.t(820, 448, 'M (kg)', { s: 14, w: 700, c: '#fde68a' }) + DG.t(820, 466, 'T = Mg', { s: 13, c: '#fde68a' });
    s += DG.t(80, top + 120, 'Hollow wooden sonometer box (resonator)', { s: 13, c: '#fcd34d' });
    s += DG.t(80, wy - 14, 'peg', { s: 12, c: DC.sub });
    s += DG.panel(60, 400, 640, 120, 'Relations') + DG.t(80, 446, 'f = (1 / 2l) · √(T / m)', { s: 16, w: 700, c: '#a5f3fc', h: 0 }) + DG.t(80, 474, 'T = Mg,   m = πr²ρ   (linear density)', { s: 14, w: 500, h: 0 }) + DG.t(80, 500, 'Fundamental mode: l = λ/2 (node at each bridge, antinode at centre)', { s: 13, c: DC.sub, h: 0 });
    return { svg: DG.wrap(s, 'Sonometer'), legend: [['A, B', 'Knife-edge bridges — nodes of the stationary wave'], ['l', 'Vibrating (resonating) length between bridges'], ['R', 'Paper rider at the antinode — flies off at resonance'], ['P', 'Frictionless pulley'], ['M', 'Hanger with slotted masses, tension T = Mg'], ['F', 'Tuning fork pressed on the box']] };
  }
};
