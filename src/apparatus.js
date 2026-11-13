/* ---------- Apparatus connection (pictorial wiring) diagrams for the electrical experiments ----------
   Drawn on a 960 × 560 "lab bench". Cables are grouped as <g class="wire" data-w="id"> and equipment as
   <g class="part" data-p="id"> so wiring steps can highlight them. Loop cables (class "loop") carry the
   animated current-flow dots, drawn in the direction of conventional current.
   Colours on the bench follow CSS variables so the same drawing prints on white paper:
   --ap-text, --ap-sub, --ap-halo, --ap-bench, --ap-dot. */
const AP_WIRE = {
  red: { c: '#dc2626', r: '#fca5a5', f: '#fff7ed' },
  black: { c: '#111827', r: '#9ca3af', f: '#e5e7eb' },
  yellow: { c: '#eab308', r: '#fef08a', f: '#422006' },
  grey: { c: '#64748b', r: '#cbd5e1', f: '#ffffff' }
};
const AP_PRINT_VARS = '--ap-text:#0f172a;--ap-sub:#475569;--ap-halo:#ffffff;--ap-bench:#ffffff;--ap-dot:#e2e8f0;--ap-panel:#f8fafc;--ap-line:#cbd5e1;--ap-red:#b91c1c;--ap-vio:#6d28d9;--ap-blue:#1d4ed8;--ap-green:#047857';
/* accent text colours that swap to darker shades on paper */
const AC = { red: 'var(--ap-red,#fca5a5)', vio: 'var(--ap-vio,#c4b5fd)', blue: 'var(--ap-blue,#93c5fd)', green: 'var(--ap-green,#6ee7b7)', sub: 'var(--ap-sub,#94a3b8)' };
const AP = {
  /* bench text (themeable) */
  T(x, y, s, o = {}) { return `<text x="${x}" y="${y}" font-size="${o.s || 13}" font-weight="${o.w || 500}" text-anchor="${o.a || 'start'}"${o.i ? ' font-style="italic"' : ''} style="fill:${o.c || 'var(--ap-text,#e5e7eb)'};stroke:var(--ap-halo,#111827)" stroke-width="${o.h ?? 4}" stroke-linejoin="round" paint-order="stroke">${s}</text>`; },
  S(x, y, s, o = {}) { return AP.T(x, y, s, { s: 11.5, c: 'var(--ap-sub,#94a3b8)', ...o }); },
  /* fixed-colour text printed on equipment */
  F(x, y, s, o = {}) { return `<text x="${x}" y="${y}" font-size="${o.s || 10}" font-weight="${o.w || 700}" text-anchor="${o.a || 'middle'}" fill="${o.c || '#cbd5e1'}"${o.f ? ` font-family="${o.f}"` : ''} letter-spacing="${o.ls || 0}">${s}</text>`; },
  part(id, inner) { return `<g class="part" data-p="${id}">${inner}</g>`; },
  shadow(x, y, w, h, rx = 12) { return `<rect x="${x + 3}" y="${y + 6}" width="${w}" height="${h}" rx="${rx}" fill="#000" opacity=".28"/>`; },
  post(x, y, kind = 'brass') {
    const cap = kind === 'red' ? '#dc2626' : kind === 'black' ? '#111827' : '#c99a2e', rim = kind === 'red' ? '#fca5a5' : kind === 'black' ? '#6b7280' : '#fde68a';
    return `<circle cx="${x}" cy="${y + 2}" r="11" fill="#000" opacity=".3"/><circle cx="${x}" cy="${y}" r="11" fill="${cap}" stroke="${rim}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="4.2" fill="#0b0f17" stroke="${rim}" stroke-width="1"/>`;
  },
  knob(x, y, lab, ang = -40) {
    const a = ang * Math.PI / 180;
    return `<circle cx="${x}" cy="${y}" r="15" fill="#0f172a" stroke="#64748b" stroke-width="2"/><circle cx="${x}" cy="${y}" r="10" fill="#1e293b"/><line x1="${x}" y1="${y}" x2="${(x + 12 * Math.sin(a)).toFixed(1)}" y2="${(y - 12 * Math.cos(a)).toFixed(1)}" stroke="#e2e8f0" stroke-width="2.2" stroke-linecap="round"/>` + AP.F(x, y + 28, lab, { s: 8.5, c: '#94a3b8' });
  },
  lcd(x, y, w, h, txt, unit, c = '#4ade80') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#04130b" stroke="#14532d" stroke-width="1.5"/>` + AP.F(x + w / 2 - 6, y + h / 2 + 8, txt, { s: 22, c, f: 'JetBrains Mono, Consolas, monospace', w: 600 }) + (unit ? AP.F(x + w - 8, y + h - 7, unit, { s: 10, c, a: 'end' }) : '');
  },
  /* DC regulated power supply: 230 × 150 */
  psu(x, y, o = {}) {
    const w = 230, h = 150, pos = [x + 160, y + 115], neg = [x + 200, y + 115];
    let s = AP.shadow(x, y, w, h) + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#apBox)" stroke="#475569" stroke-width="1.5"/>`;
    s += `<path d="M${x} ${y + 24} V${y + 12} a12 12 0 0 1 12 -12 H${x + w - 12} a12 12 0 0 1 12 12 V${y + 24} Z" fill="#0f172a" opacity=".55"/>` + AP.F(x + w / 2, y + 16, o.title || 'DC REGULATED POWER SUPPLY', { s: 9.5, c: '#e2e8f0', ls: .6 });
    s += AP.lcd(x + 14, y + 34, 122, 44, o.disp || '05.00', 'V');
    s += `<rect x="${x + 150}" y="${y + 36}" width="66" height="26" rx="5" fill="#0f172a" stroke="#475569"/><rect x="${x + 153}" y="${y + 39}" width="30" height="20" rx="4" fill="#16a34a"/>` + AP.F(x + 183, y + 76, 'OUTPUT ON / OFF', { s: 7.5, c: '#94a3b8' });
    s += AP.knob(x + 38, y + 104, 'COARSE', -60) + AP.knob(x + 92, y + 104, 'FINE', 20);
    s += AP.post(...pos, 'red') + AP.post(...neg, 'black') + AP.F(pos[0] - 19, pos[1] + 5, '+', { s: 14, c: '#fca5a5' }) + AP.F(neg[0] + 19, neg[1] + 5, '−', { s: 14, c: '#cbd5e1' });
    return { svg: AP.part(o.id || 'psu', s), pos, neg };
  },
  /* Analogue panel meter: 170 × 135, + on the left, − on the right */
  meter(x, y, o = {}) {
    const w = 170, h = 135, cx = x + w / 2, ay = y + 84, r = 54, acc = o.accent || '#22d3ee', P = th => [cx + r * Math.cos(th * Math.PI / 180), ay + r * Math.sin(th * Math.PI / 180)];
    const pos = [x + 50, y + 113], neg = [x + 120, y + 113];
    let s = AP.shadow(x, y, w, h) + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="url(#apBox)" stroke="#475569" stroke-width="1.5"/>`;
    s += `<rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="80" rx="6" fill="#f8fafc" stroke="${acc}" stroke-width="1.6"/>`;
    const [a0x, a0y] = P(-150), [a1x, a1y] = P(-30);
    s += `<path d="M${a0x.toFixed(1)} ${a0y.toFixed(1)} A${r} ${r} 0 0 1 ${a1x.toFixed(1)} ${a1y.toFixed(1)}" fill="none" stroke="#0f172a" stroke-width="1.2"/>`;
    for (let i = 0; i <= 10; i++) { const th = -150 + 12 * i, m = i % 5 === 0, a = th * Math.PI / 180; s += `<line x1="${(cx + r * Math.cos(a)).toFixed(1)}" y1="${(ay + r * Math.sin(a)).toFixed(1)}" x2="${(cx + (r - (m ? 9 : 5)) * Math.cos(a)).toFixed(1)}" y2="${(ay + (r - (m ? 9 : 5)) * Math.sin(a)).toFixed(1)}" stroke="#0f172a" stroke-width="${m ? 1.6 : 1}"/>`; }
    const mx = o.max || 10, lab = (i, v) => { const a = (-150 + 12 * i) * Math.PI / 180; return AP.F((cx + (r - 18) * Math.cos(a)).toFixed(1), (ay + (r - 18) * Math.sin(a) + 3).toFixed(1), v, { s: 8.5, c: '#334155', w: 600 }); };
    s += lab(0, '0') + lab(5, String(mx / 2)) + lab(10, String(mx));
    s += AP.F(x + w - 18, y + 84, o.u || 'V', { s: 15, c: '#0f172a', w: 800, a: 'end' }) + AP.F(x + 18, y + 25, o.range || '', { s: 8.5, c: '#475569', w: 600, a: 'start' });
    const th = (-150 + 120 * (o.f ?? .5)) * Math.PI / 180;
    s += `<line x1="${cx}" y1="${ay}" x2="${(cx + (r - 3) * Math.cos(th)).toFixed(1)}" y2="${(ay + (r - 3) * Math.sin(th)).toFixed(1)}" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><circle cx="${cx}" cy="${ay}" r="4" fill="#0f172a"/>`;
    s += AP.post(...pos, 'red') + AP.post(...neg, 'black') + AP.F(x + 27, y + 118, '+', { s: 14, c: '#fca5a5' }) + AP.F(x + 143, y + 118, '−', { s: 14, c: '#cbd5e1' });
    s += AP.T(cx, y - 10, `${o.name || 'Meter'}`, { a: 'middle', s: 13, w: 600 });
    return { svg: AP.part(o.id || 'meter', s), pos, neg };
  },
  board(x, y, w, h, title) {
    let s = AP.shadow(x, y, w, h, 14) + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#14532d" stroke="#22c55e" stroke-opacity=".55" stroke-width="1.5"/>`;
    s += `<rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="10" fill="none" stroke="#bbf7d0" stroke-opacity=".28" stroke-dasharray="6 5"/>`;
    [[x + 16, y + 16], [x + w - 16, y + 16], [x + 16, y + h - 16], [x + w - 16, y + h - 16]].forEach(([a, b]) => s += `<circle cx="${a}" cy="${b}" r="4.5" fill="#a3a3a3" stroke="#525252"/>`);
    return s + AP.F(x + 30, y + 30, title, { a: 'start', c: '#dcfce7', s: 10.5, ls: .8 });
  },
  resistor(x1, x2, y, bands) {
    const cx = (x1 + x2) / 2;
    let s = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#cbd5e1" stroke-width="2.6"/><rect x="${cx - 36}" y="${y - 11}" width="72" height="22" rx="10" fill="#e8d5a9" stroke="#b89b62" stroke-width="1.2"/>`;
    [-22, -11, 0, 20].forEach((dx, i) => s += `<rect x="${cx + dx - 3}" y="${y - 11}" width="6" height="22" fill="${bands[i]}"/>`);
    return s;
  },
  /* cable from a to b; da/db = direction the cable leaves each end */
  cable(id, a, b, col, o = {}) {
    const [ax, ay] = a, [bx, by] = b, da = o.da || [0, 1], db = o.db || [0, 1], C = AP_WIRE[col];
    const L = Math.max(60, Math.min(o.max || 190, Math.hypot(bx - ax, by - ay) * .45)) * (o.k || 1), sag = o.sag ?? 30;
    const d = `M${ax} ${ay} C${(ax + da[0] * L).toFixed(1)} ${(ay + da[1] * L + sag).toFixed(1)} ${(bx + db[0] * L).toFixed(1)} ${(by + db[1] * L + sag).toFixed(1)} ${bx} ${by}`;
    const plug = (x, y) => `<circle cx="${x}" cy="${y}" r="8.5" fill="${C.c}" stroke="${C.r}" stroke-width="2"/><circle cx="${x - 2.5}" cy="${y - 2.5}" r="2.4" fill="#fff" opacity=".45"/>`;
    return `<g class="wire${o.loop ? ' loop' : ''}" data-w="${id}">
      <path d="${d}" class="w-glow" fill="none" stroke="#22d3ee" stroke-width="17" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="8" stroke-linecap="round" transform="translate(2 5)"/>
      <path d="${d}" fill="none" stroke="${C.r}" stroke-opacity="${col === 'black' ? .9 : .35}" stroke-width="7.6" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="${C.c}" stroke-width="5.4" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="1.3" stroke-linecap="round" transform="translate(-1 -1.4)"/>
      <path d="${d}" class="w-flow" fill="none" stroke="${C.f}" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="1 17"/>
      ${plug(ax, ay)}${plug(bx, by)}</g>`;
  },
  panel(x, y, w, h, title, lines) {
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="fill:var(--ap-panel,#0b1220);stroke:var(--ap-line,#1f2a3d)"/>` + AP.S(x + 14, y + 22, title, { w: 700, h: 0, s: 11.5 });
    lines.forEach((l, i) => s += AP.T(x + 14, y + 46 + i * 21, l[0], { s: 12.5, w: l[1] || 500, c: l[2], h: 0 }));
    return s;
  },
  defs: `<defs>
    <linearGradient id="apBox" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#1e293b"/></linearGradient>
    <radialGradient id="apGlowR"><stop offset="0" stop-color="#f87171" stop-opacity=".85"/><stop offset="1" stop-color="#f87171" stop-opacity="0"/></radialGradient>
    <radialGradient id="apGlowV"><stop offset="0" stop-color="#ede9fe" stop-opacity=".95"/><stop offset=".45" stop-color="#a78bfa" stop-opacity=".55"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
    <radialGradient id="apGlowY"><stop offset="0" stop-color="#fef9c3" stop-opacity=".95"/><stop offset=".5" stop-color="#facc15" stop-opacity=".35"/><stop offset="1" stop-color="#facc15" stop-opacity="0"/></radialGradient>
    <radialGradient id="apGlass" cx=".4" cy=".35"><stop offset="0" stop-color="#e0f2fe" stop-opacity=".35"/><stop offset="1" stop-color="#67e8f9" stop-opacity=".08"/></radialGradient>
    <pattern id="apDots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" style="fill:var(--ap-dot,#1f2937)"/></pattern>
  </defs>`,
  wrap(body, title) {
    return `<svg class="app-svg" viewBox="0 0 960 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)}" font-family="Inter, system-ui, sans-serif">${AP.defs}<rect width="960" height="560" rx="16" style="fill:var(--ap-bench,#111827)"/><rect width="960" height="560" rx="16" fill="url(#apDots)"/>${body}</svg>`;
  }
};

/* LED and PN-diode boards share one layout */
function apLedDiode(kind) {
  const rev = kind === 'rev', isLed = kind === 'led';
  const P = AP.psu(40, 330, { title: `DC POWER SUPPLY  0–${rev ? 15 : 5} V`, disp: rev ? '08.00' : isLed ? '02.40' : '00.72' });
  const M = AP.meter(300, 40, { id: 'am', u: rev ? 'µA' : 'mA', max: rev ? 100 : 25, name: rev ? 'Microammeter' : 'Milliammeter', range: rev ? 'RANGE 0–100 µA' : 'RANGE 0–25 mA', f: rev ? .12 : .64 });
  const V = AP.meter(690, 40, { id: 'vm', u: 'V', max: rev ? 15 : isLed ? 5 : 1, name: 'Voltmeter', range: rev ? 'RANGE 0–15 V' : isLed ? 'RANGE 0–5 V' : 'RANGE 0–1 V', f: rev ? .6 : isLed ? .42 : .72, accent: '#a78bfa' });
  const R1 = [400, 380], R2 = [580, 380], TOP = [800, 350], BOT = [800, 470];
  let s = AP.board(320, 290, 600, 240, isLed ? 'LED V–I CHARACTERISTICS KIT' : 'PN JUNCTION DIODE KIT');
  const bands = isLed ? ['#facc15', '#8b5cf6', '#92400e', '#d4af37'] : ['#78350f', '#111827', '#dc2626', '#d4af37'];
  s += AP.part('res', AP.resistor(R1[0], R2[0], R1[1], bands) + AP.post(...R1) + AP.post(...R2) + AP.F(490, 418, isLed ? 'R = 470 Ω' : 'R = 1 kΩ', { c: '#dcfce7', s: 12 }) + AP.F(490, 436, 'current-limiting resistor', { c: '#86efac', s: 9.5, w: 500 }) + AP.F(R1[0], 406, 'R1', { c: '#bbf7d0', s: 9.5 }) + AP.F(R2[0], 406, 'R2', { c: '#bbf7d0', s: 9.5 }));
  let dev = '';
  if (isLed) {
    dev += `<circle class="lit" cx="690" cy="410" r="58" fill="url(#apGlowR)"/>`;
    dev += `<polyline points="716,403 750,403 750,${TOP[1]} ${TOP[0] - 10},${TOP[1]}" fill="none" stroke="#cbd5e1" stroke-width="2.6"/><polyline points="716,417 764,417 764,${BOT[1]} ${BOT[0] - 10},${BOT[1]}" fill="none" stroke="#cbd5e1" stroke-width="2.6"/>`;
    dev += `<path d="M714 393 L696 393 A17 17 0 0 0 696 427 L714 427 Z" fill="#ef4444" fill-opacity=".8" stroke="#fecaca" stroke-width="1.4"/><rect x="712" y="389" width="6" height="42" rx="2" fill="#f87171" stroke="#fecaca"/>`;
    dev += AP.F(690, 450, 'LED (red)', { c: '#fecaca', s: 10.5 }) + AP.F(745, 385, 'long leg', { c: '#bbf7d0', s: 8.5, w: 500, a: 'end' });
  } else {
    const bandY = rev ? 390 : 424;
    dev += `<line x1="800" y1="${TOP[1] + 10}" x2="800" y2="388" stroke="#cbd5e1" stroke-width="2.6"/><line x1="800" y1="432" x2="800" y2="${BOT[1] - 10}" stroke="#cbd5e1" stroke-width="2.6"/>`;
    dev += `<rect x="790" y="388" width="20" height="44" rx="6" fill="#111827" stroke="#475569"/><rect x="790" y="${bandY}" width="20" height="6" fill="#e5e7eb"/>`;
    dev += AP.F(770, 406, '1N4007', { c: '#dcfce7', s: 10, a: 'end' }) + AP.F(770, 420, 'band = cathode', { c: '#86efac', s: 9, w: 500, a: 'end' });
  }
  const topL = isLed ? 'A  anode (+)' : rev ? 'K  cathode (n)' : 'A  anode (p)', botL = isLed ? 'K  cathode (−)' : rev ? 'A  anode (p)' : 'K  cathode (n)';
  dev += AP.post(...TOP) + AP.post(...BOT) + AP.F(TOP[0] - 16, TOP[1] - 16, topL, { a: 'end', c: '#dcfce7', s: 10.5 }) + AP.F(BOT[0] - 16, BOT[1] + 30, botL, { a: 'end', c: '#dcfce7', s: 10.5 });
  s += AP.part('dev', dev);
  s += P.svg + M.svg + V.svg;
  // cables: series loop first (conventional current direction), then the voltmeter
  s += AP.cable('w1', P.pos, R1, 'red', { loop: 1, da: [0, 1], db: [0, -1] });
  s += AP.cable('w2', R2, M.pos, 'yellow', { loop: 1, da: [0, -1], db: [0, 1], sag: 10 });
  s += AP.cable('w3', M.neg, TOP, 'yellow', { loop: 1, da: [0, 1], db: [0, -1], sag: 10 });
  s += AP.cable('w4', BOT, P.neg, 'black', { loop: 1, da: [0, 1], db: [0, 1], k: .45 });
  if (rev) {
    s += AP.cable('w5', V.pos, R2, 'red', { da: [0, 1], db: [0, -1], sag: 10, k: .8 });
    s += AP.cable('w6', V.neg, BOT, 'black', { da: [0, 1], db: [1, 0], sag: 0 });
  } else {
    s += AP.cable('w5', V.pos, TOP, 'red', { da: [0, 1], db: [0, -1], sag: 0 });
    s += AP.cable('w6', V.neg, BOT, 'black', { da: [0, 1], db: [1, 0], sag: 0 });
  }
  const dname = isLed ? 'LED' : 'diode', am = rev ? 'µA' : 'mA';
  s += AP.panel(30, 40, 250, 262, 'Current path (series loop)', [
    ['Supply (+)', 700, AC.red], [`→ resistor R → ${am} meter (+ → −)`], [rev ? '→ cathode K of the diode' : `→ anode A of the ${dname}`], [rev ? '→ anode A → supply (−)' : `→ cathode K → supply (−)`],
    ['Voltmeter (parallel)', 700, AC.vio], [rev ? 'across µA meter + diode:' : `directly across the ${dname}:`], [rev ? 'V(+) → R2,  V(−) → anode A' : 'V(+) → A,  V(−) → K'], [rev ? 'Reverse bias: n-side to (+)' : 'Forward bias: p-side to (+)', 600, rev ? AC.green : AC.blue], [isLed ? 'LED glows above the knee voltage' : rev ? 'Current is only a few µA' : 'Current rises sharply after ~0.7 V', 400, AC.sub]
  ]);
  const title = isLed ? 'LED V-I apparatus connections' : `PN diode ${rev ? 'reverse' : 'forward'} bias apparatus connections`;
  const steps = [
    { ids: ['psu'], t: `Keep the power supply <b>OFF</b> with both knobs at zero. Its output switch acts as the key K.` },
    { ids: ['w1', 'psu', 'res'], t: `<b>Red lead</b>: supply (+) → resistor terminal R1. The ${isLed ? '470 Ω' : '1 kΩ'} resistor limits the current.` },
    { ids: ['w2', 'res', 'am'], t: `<b>Yellow link</b>: resistor R2 → ${rev ? 'micro' : 'milli'}ammeter (+). The ammeter goes <b>in series</b>.` },
    { ids: ['w3', 'am', 'dev'], t: rev ? `<b>Yellow link</b>: µA meter (−) → diode <b>cathode K</b> (banded end). This makes the n-side positive.` : `<b>Yellow link</b>: mA meter (−) → ${dname} <b>anode A</b> ${isLed ? '(longer leg)' : '(p-side)'}.` },
    { ids: ['w4', 'dev', 'psu'], t: rev ? `<b>Black lead</b>: diode <b>anode A</b> → supply (−). Series loop complete — reverse bias.` : `<b>Black lead</b>: ${dname} <b>cathode K</b> → supply (−). Series loop complete — forward bias.` },
    { ids: ['w5', 'w6', 'vm'], t: rev ? `<b>Voltmeter</b> across the µA meter + diode: red V(+) → R2, black V(−) → anode A. Then the µA meter does not carry the voltmeter's current.` : `<b>Voltmeter in parallel</b>: red V(+) → A, black V(−) → K, directly across the ${dname}.` },
    { ids: ['w1', 'w2', 'w3', 'w4'], t: `Trace the loop once more, then switch on and raise the voltage slowly in small steps, noting V and I each time.${isLed ? ' The LED lights up past the knee (~1.8 V for red).' : ''}` }
  ];
  return { svg: AP.wrap(s, title), steps, title };
}

const APPARATUS = {
  led() { return apLedDiode('led'); },
  diode(bias = 'forward') { return apLedDiode(bias === 'reverse' ? 'rev' : 'fwd'); },

  photo() {
    let s = '';
    // optical bench
    s += `<rect x="30" y="302" width="520" height="16" rx="4" fill="#64748b" stroke="#94a3b8"/>` + Array.from({ length: 26 }, (_, i) => `<line x1="${40 + i * 20}" y1="304" x2="${40 + i * 20}" y2="${i % 5 ? 309 : 313}" stroke="#1e293b" stroke-width="1"/>`).join('') + AP.S(290, 336, 'optical bench — keep the lamp-to-cell distance fixed', { a: 'middle' });
    // beam
    s += `<polygon points="144,214 212,216 212,246 144,248" fill="#c4b5fd" opacity=".22"/><polygon points="228,220 302,226 302,244 228,240" fill="#8b5cf6" opacity=".45"/>`;
    // lamp
    let lamp = AP.shadow(40, 170, 100, 122, 10) + `<rect x="40" y="170" width="100" height="122" rx="10" fill="url(#apBox)" stroke="#475569" stroke-width="1.5"/><circle cx="90" cy="230" r="34" fill="url(#apGlowV)"/><rect x="82" y="212" width="16" height="36" rx="8" fill="#ede9fe"/><rect x="134" y="208" width="10" height="44" rx="2" fill="#c4b5fd"/><rect x="78" y="292" width="24" height="10" fill="#475569"/>` + AP.F(90, 188, 'Hg LAMP', { s: 9.5, c: '#e2e8f0' });
    s += AP.part('lamp', lamp + AP.T(90, 160, 'Mercury lamp', { a: 'middle', w: 600 }));
    // filter
    s += AP.part('filter', `<rect x="208" y="186" width="24" height="108" rx="3" fill="#334155" stroke="#64748b"/><rect x="212" y="202" width="16" height="74" rx="2" fill="#8b5cf6" fill-opacity=".75" stroke="#c4b5fd"/><rect x="214" y="292" width="12" height="10" fill="#475569"/>` + AP.T(220, 160, 'Filter', { a: 'middle', w: 600 }) + AP.S(220, 176, '(selects ν)', { a: 'middle' }));
    // photocell enclosure with cut-away
    const C = [520, 208], A = [520, 262];
    let cell = AP.shadow(300, 170, 220, 132, 10) + `<rect x="300" y="170" width="220" height="132" rx="10" fill="url(#apBox)" stroke="#475569" stroke-width="1.5"/><rect x="298" y="222" width="8" height="26" rx="2" fill="#0b0f17"/>`;
    cell += `<rect x="322" y="184" width="158" height="104" rx="8" fill="#0b1220" stroke="#64748b" stroke-dasharray="5 4"/><circle cx="401" cy="236" r="44" fill="url(#apGlass)" stroke="#67e8f9" stroke-width="1.6"/>`;
    cell += `<path d="M418 200 A40 40 0 0 1 418 272" fill="none" stroke="#fbbf24" stroke-width="7" stroke-linecap="round"/><line x1="396" y1="206" x2="396" y2="266" stroke="#e2e8f0" stroke-width="2.2"/>`;
    [[300, 228], [300, 236], [300, 244]].forEach(([x, y]) => cell += `<line x1="${x + 8}" y1="${y}" x2="${410}" y2="${y + (236 - y) * .3}" stroke="#a78bfa" stroke-width="1.2" stroke-dasharray="4 3"/>`);
    cell += `<polyline points="430,236 470,236 470,${C[1]} ${C[0] - 11},${C[1]}" fill="none" stroke="#fde68a" stroke-width="1.4"/><polyline points="396,266 396,282 470,282 470,${A[1]} ${A[0] - 11},${A[1]}" fill="none" stroke="#cbd5e1" stroke-width="1.4"/>`;
    cell += AP.post(...C, 'red') + AP.post(...A, 'black') + AP.F(500, C[1] - 14, 'C', { s: 11, c: '#fca5a5' }) + AP.F(500, A[1] + 22, 'A', { s: 11, c: '#cbd5e1' });
    cell += AP.F(440, 200, 'cathode', { s: 8.5, c: '#fde68a', w: 500 }) + AP.F(372, 278, 'anode wire', { s: 8.5, c: '#cbd5e1', w: 500 });
    s += AP.part('cell', cell + AP.T(410, 160, 'Photocell (dark enclosure)', { a: 'middle', w: 600 }));
    // control unit
    const K = [700, 268], An = [780, 268];
    let u = AP.shadow(600, 50, 330, 250) + `<rect x="600" y="50" width="330" height="250" rx="12" fill="url(#apBox)" stroke="#475569" stroke-width="1.5"/>`;
    u += `<path d="M600 76 V62 a12 12 0 0 1 12 -12 H918 a12 12 0 0 1 12 12 V76 Z" fill="#0f172a" opacity=".55"/>` + AP.F(765, 67, "PLANCK'S CONSTANT APPARATUS", { s: 10, c: '#e2e8f0', ls: .8 });
    u += AP.lcd(618, 92, 140, 48, '1.12', 'V') + AP.F(688, 156, 'RETARDING VOLTAGE', { s: 8.5, c: '#94a3b8' });
    u += AP.lcd(774, 92, 140, 48, '0.36', 'µA', '#38bdf8') + AP.F(844, 156, 'PHOTOCURRENT', { s: 8.5, c: '#94a3b8' });
    u += AP.knob(650, 196, 'VOLTAGE', 30) + AP.knob(722, 196, 'ZERO ADJ', -10) + AP.knob(794, 196, 'RANGE', 45);
    u += `<rect x="852" y="182" width="58" height="26" rx="5" fill="#0f172a" stroke="#475569"/><rect x="855" y="185" width="27" height="20" rx="4" fill="#16a34a"/>` + AP.F(881, 222, 'POWER', { s: 8.5, c: '#94a3b8' });
    u += AP.post(...K, 'red') + AP.post(...An, 'black') + AP.F(K[0] - 18, K[1] + 4, 'K (+)', { s: 10.5, c: '#fca5a5', a: 'end' }) + AP.F(An[0] + 18, An[1] + 4, 'A (−)', { s: 10.5, c: '#cbd5e1', a: 'start' }) + AP.F(740, 250, 'PHOTOCELL', { s: 8, c: '#94a3b8', ls: .6 });
    s += AP.part('unit', u + AP.T(765, 34, 'Control unit (DC source + V + µA)', { a: 'middle', w: 600 }));
    // lamp supply
    let ls = AP.shadow(40, 420, 190, 110) + `<rect x="40" y="420" width="190" height="110" rx="12" fill="url(#apBox)" stroke="#475569" stroke-width="1.5"/>` + AP.F(56, 442, 'Hg LAMP SUPPLY', { s: 9.5, c: '#e2e8f0', ls: .5, a: 'start' }) + AP.F(56, 455, 'choke / ballast', { s: 8, c: '#94a3b8', w: 500, a: 'start' });
    ls += `<rect x="58" y="462" width="58" height="26" rx="5" fill="#0f172a" stroke="#475569"/><rect x="61" y="465" width="27" height="20" rx="4" fill="#16a34a"/>` + AP.F(87, 504, 'MAINS', { s: 8.5, c: '#94a3b8' }) + `<circle cx="190" cy="476" r="13" fill="#0f172a" stroke="#64748b" stroke-width="2"/><circle cx="185" cy="476" r="2.5" fill="#94a3b8"/><circle cx="195" cy="476" r="2.5" fill="#94a3b8"/>` + AP.F(190, 504, 'LAMP', { s: 8.5, c: '#94a3b8' });
    s += AP.part('lsup', ls);
    s += AP.panel(258, 362, 320, 168, 'Connection rule', [['Cathode C → K (+) socket', 700, AC.red], ['Anode A → A (−) socket', 700], ['C positive w.r.t. A ⇒ retarding field'], ['Raise V until the current just becomes 0'], ['that voltage is the stopping potential V₀', 600, AC.vio], ['Repeat for each filter (each ν)', 400, AC.sub]]);
    s += AP.panel(610, 350, 320, 180, 'Inside the control unit', [['A variable DC source, a voltmeter and'], ['a microammeter are already wired in'], ['series with the two sockets, so the'], ['photocell needs just two leads.'], ['Electrons travel C → A inside the tube;', 400, AC.sub], ['conventional current returns C → unit → A.', 400, AC.sub]]);
    // cables
    s += AP.cable('p3', [190, 476], [90, 302], 'grey', { da: [0, -1], db: [0, 1], sag: 0, k: .6 });
    s += AP.cable('p1', C, K, 'red', { loop: 1, da: [1, 0], db: [0, 1], sag: 10, k: .8 });
    s += AP.cable('p2', An, A, 'black', { loop: 1, da: [0, 1], db: [1, 0], sag: 0, k: .6 });
    const steps = [
      { ids: ['lamp', 'filter', 'cell'], t: 'Line up the mercury lamp, filter holder and photocell window on the optical bench so the light falls fully on the cathode.' },
      { ids: ['p3', 'lsup', 'lamp'], t: '<b>Lamp cable</b>: connect the lamp to its supply (choke). Switch on and let it warm up for about 5 minutes for a steady output.' },
      { ids: ['p1', 'cell', 'unit'], t: '<b>Red lead</b>: photocell cathode <b>C</b> → <b>K (+)</b> socket. The cathode is made positive, so the field opposes the emitted electrons.' },
      { ids: ['p2', 'cell', 'unit'], t: '<b>Black lead</b>: photocell anode <b>A</b> → <b>A (−)</b> socket. The unit\'s meters are now in the loop.' },
      { ids: ['unit', 'filter'], t: 'Set the retarding voltage to zero and zero the current with ZERO ADJ (in the dark). Insert the first filter.' },
      { ids: ['p1', 'p2', 'unit'], t: 'Increase the retarding voltage slowly until the photocurrent just becomes zero. Note it as V₀. Repeat for every filter.' }
    ];
    return { svg: AP.wrap(s, 'Photoelectric effect apparatus connections'), steps, title: 'Photoelectric effect apparatus connections' };
  },

  solar() {
    let s = '';
    // lamp on a bracket
    let lamp = `<line x1="130" y1="0" x2="130" y2="40" stroke="#64748b" stroke-width="5"/><circle cx="130" cy="96" r="70" fill="url(#apGlowY)"/><path d="M84 40 H176 L160 82 H100 Z" fill="#334155" stroke="#64748b" stroke-width="1.5"/><ellipse cx="130" cy="82" rx="30" ry="6" fill="#fef9c3"/>`;
    [-50, -18, 18, 50].forEach(dx => lamp += `<line x1="${130 + dx * .4}" y1="92" x2="${130 + dx * 1.3}" y2="160" stroke="#facc15" stroke-width="1.6" stroke-dasharray="7 5"/>`);
    s += AP.part('lamp', lamp + AP.T(190, 56, 'Lamp (halogen)', { w: 600 }) + AP.S(190, 74, 'normal incidence'));
    // panel + junction box
    let pn = AP.shadow(50, 168, 230, 150, 6) + `<rect x="50" y="168" width="230" height="150" rx="6" fill="#0f172a" stroke="#93c5fd" stroke-width="2"/>`;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) pn += `<rect x="${60 + i * 43}" y="${178 + j * 44}" width="40" height="40" rx="2" fill="#1e3a8a" stroke="#60a5fa" stroke-width=".8"/><line x1="${80 + i * 43}" y1="${178 + j * 44}" x2="${80 + i * 43}" y2="${218 + j * 44}" stroke="#93c5fd" stroke-opacity=".5"/>`;
    const SP = [140, 356], SN = [190, 356];
    pn += `<rect x="110" y="322" width="110" height="52" rx="8" fill="url(#apBox)" stroke="#475569"/>` + AP.F(140, 338, '+', { s: 13, c: '#fca5a5' }) + AP.F(190, 338, '−', { s: 13, c: '#cbd5e1' }) + AP.post(...SP, 'red') + AP.post(...SN, 'black');
    s += AP.part('cell', pn + AP.T(165, 160, 'Solar cell panel (area A)', { a: 'middle', w: 600 }));
    // irradiance meter
    let lx = AP.shadow(40, 410, 124, 130, 14) + `<rect x="40" y="410" width="124" height="130" rx="14" fill="#facc15" stroke="#a16207" stroke-width="1.5"/>` + AP.F(102, 426, 'SOLAR POWER METER', { s: 7.5, c: '#422006', ls: .4 }) + AP.lcd(54, 433, 96, 36, '850', '') + AP.F(102, 484, 'E  (W m⁻²)', { s: 10, c: '#422006' }) + `<circle cx="102" cy="514" r="13" fill="#f8fafc" stroke="#a16207"/>`;
    s += AP.part('lux', lx);
    const Vm = AP.meter(320, 40, { id: 'vm', u: 'V', max: 1, name: 'Voltmeter', range: 'RANGE 0–1 V', f: .62, accent: '#a78bfa' });
    const Am = AP.meter(560, 40, { id: 'am', u: 'mA', max: 100, name: 'Milliammeter', range: 'RANGE 0–100 mA', f: .4 });
    s += Vm.svg + Am.svg;
    // plug key
    const K1 = [715, 253], K2 = [795, 253];
    s += AP.part('key', AP.shadow(690, 226, 130, 54, 10) + `<rect x="690" y="226" width="130" height="54" rx="10" fill="#1f2937" stroke="#475569"/><rect x="733" y="240" width="44" height="26" rx="4" fill="#c99a2e" stroke="#fde68a"/><rect x="749" y="230" width="12" height="16" rx="3" fill="#111827" stroke="#64748b"/>` + AP.post(...K1) + AP.post(...K2) + AP.T(755, 216, 'Plug key K', { a: 'middle', w: 600, s: 12 }));
    // rheostat
    const rx = 600, ry = 360, rw = 320, T1 = [rx + 13, ry + 68], S2 = [rx + rw - 13, ry + 8], sx = rx + rw * .42;
    let rh = AP.shadow(rx, ry, rw, 80, 8) + `<rect x="${rx}" y="${ry}" width="26" height="80" rx="5" fill="#334155" stroke="#64748b"/><rect x="${rx + rw - 26}" y="${ry}" width="26" height="80" rx="5" fill="#334155" stroke="#64748b"/>`;
    rh += `<rect x="${rx + 26}" y="${ry + 24}" width="${rw - 52}" height="40" rx="18" fill="#e7d9b8" stroke="#a8956b"/>`;
    for (let x = rx + 32; x < rx + rw - 30; x += 5) rh += `<line x1="${x}" y1="${ry + 26}" x2="${x + 2}" y2="${ry + 62}" stroke="#b87333" stroke-width="1.6"/>`;
    rh += `<line x1="${rx + 10}" y1="${ry + 8}" x2="${rx + rw - 10}" y2="${ry + 8}" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round"/><rect x="${sx - 15}" y="${ry - 2}" width="30" height="30" rx="5" fill="#64748b" stroke="#cbd5e1"/><line x1="${sx}" y1="${ry + 28}" x2="${sx}" y2="${ry + 32}" stroke="#cbd5e1" stroke-width="3"/>`;
    rh += AP.post(...T1) + AP.post(rx + rw - 13, ry + 68) + AP.post(...S2) + AP.T(rx - 6, ry + 72, 'T1', { s: 11, w: 700, a: 'end' }) + AP.S(rx + rw + 6, ry + 72, 'T2', { s: 11, w: 700 }) + AP.T(S2[0] - 22, ry - 8, 'S (slider rod)', { s: 11, w: 700, a: 'end' });
    s += AP.part('rheo', rh + AP.T(rx + rw / 2, ry + 126, 'Rheostat = variable load R_L (use T1 and S)', { a: 'middle', w: 600, s: 12 }));
    // cables (conventional current: + → mA → K → rheostat → −)
    s += AP.cable('s1', SP, Am.pos, 'red', { loop: 1, da: [0, 1], db: [0, 1], k: .75 });
    s += AP.cable('s2', Am.neg, K1, 'yellow', { loop: 1, da: [0, 1], db: [0, -1], sag: 0 });
    s += AP.cable('s3', K2, S2, 'yellow', { loop: 1, da: [0, -1], db: [0, -1], sag: 0, k: .8 });
    s += AP.cable('s4', T1, SN, 'black', { loop: 1, da: [0, 1], db: [0, 1], k: .5 });
    s += AP.cable('s5', Vm.pos, SP, 'red', { da: [0, 1], db: [0, 1], k: .4, sag: 0 });
    s += AP.cable('s6', Vm.neg, SN, 'black', { da: [0, 1], db: [0, 1], k: .45, sag: 0 });
    const steps = [
      { ids: ['lamp', 'cell', 'lux'], t: 'Fix the lamp so its light falls <b>normally</b> on the solar cell. Measure the irradiance E at the cell with the solar power / lux meter.' },
      { ids: ['s1', 'cell', 'am'], t: '<b>Red lead</b>: cell (+) → milliammeter (+).' },
      { ids: ['s2', 'am', 'key'], t: '<b>Yellow link</b>: milliammeter (−) → plug key K.' },
      { ids: ['s3', 'key', 'rheo'], t: '<b>Yellow link</b>: key → rheostat slider terminal <b>S</b>. Using S and one end T1 makes the rheostat a variable load R_L.' },
      { ids: ['s4', 'rheo', 'cell'], t: '<b>Black lead</b>: rheostat end <b>T1</b> → cell (−). The load loop is complete.' },
      { ids: ['s5', 's6', 'vm'], t: '<b>Voltmeter across the cell</b>: red V(+) → cell (+), black V(−) → cell (−).' },
      { ids: ['key', 's1', 's2', 's3', 's4'], t: 'Remove the plug: I = 0, so the voltmeter reads <b>V_oc</b>. Insert it and slide from maximum to minimum resistance; near R = 0 the current is <b>I_sc</b>.' }
    ];
    return { svg: AP.wrap(s, 'Solar cell apparatus connections'), steps, title: 'Solar cell apparatus connections' };
  }
};

/* Per-experiment safety checks and common mistakes */
const AP_INFO = {
  led: {
    check: ['Supply OFF, coarse and fine knobs at zero', 'Series resistor in the loop (never connect an LED straight to the supply)', 'mA meter in series, voltmeter across the LED', 'Red leads on (+) terminals, black on (−)', 'LED anode (longer leg) towards supply (+)', 'All terminals tight, no loose wire strands'],
    mistakes: ['LED reversed: no glow and almost no current until breakdown.', 'Voltmeter across the resistor instead of the LED: wrong knee voltage.', 'Ammeter in parallel: it shorts the LED and can burn out the meter.']
  },
  diode: {
    check: ['Supply OFF with knobs at zero', '1 kΩ series resistor in place', 'Correct meter: mA for forward, µA for reverse', 'Voltmeter range: 0–1 V forward, 0–15 V reverse', 'Banded end (cathode) placed as the bias requires', 'Never exceed the rated reverse voltage'],
    mistakes: ['Using the mA meter in reverse bias: the µA current is too small to read.', 'Voltmeter directly across the diode in reverse bias: the µA meter then also reads the voltmeter current.', 'Forgetting the resistor: a large forward current can destroy the diode.']
  },
  photo: {
    check: ['Lamp warmed up (about 5 minutes)', 'Lamp, filter and window on one line', 'Cathode C → K (+), anode A → A (−)', 'Retarding voltage at zero before changing filters', 'Current zeroed in the dark', 'Lamp-to-cell distance unchanged throughout'],
    mistakes: ['Leads swapped: the field accelerates the electrons and the current never reaches zero.', 'Stray room light: a dark current offsets every reading.', 'Reading V₀ too early: approach the zero-current point slowly.']
  },
  solar: {
    check: ['Light falls normally on the cell; E measured at the cell', 'Milliammeter in series with the load', 'Voltmeter across the cell terminals', 'Rheostat used through T1 and the slider S', 'Plug key removed while reading V_oc', 'Cell not heated for long by the lamp'],
    mistakes: ['Voltmeter across the rheostat only: misses the drop in the ammeter.', 'Using T1 and T2: the resistance is then fixed and the curve cannot be traced.', 'Changing the lamp distance midway: the I–V curve mixes two irradiances.']
  }
};

/* ---------- Diagram tab: circuit / apparatus toggle, guided wiring, downloads ---------- */
const AP_STATE = { view: {}, bias: 'forward', flow: true, play: null };
function apFor(id) { return id === 'diode' ? APPARATUS.diode(AP_STATE.bias) : APPARATUS[id](); }
function renderDiagramTab(e, host) {
  if (!host) return;
  const has = !!APPARATUS[e.id], view = has ? (AP_STATE.view[e.id] || 'circuit') : 'circuit';
  clearInterval(AP_STATE.play); AP_STATE.play = null;
  host.innerHTML = `<div class="diag-head"><h3>${icon(view === 'app' ? 'cable' : 'pen-tool')} ${view === 'app' ? 'Apparatus connections' : has ? 'Circuit diagram' : 'Labelled experimental set-up'}</h3>
    ${has ? `<div class="seg diag-seg" id="diagSeg" role="tablist" aria-label="Diagram type"><button data-v="circuit" class="${view === 'circuit' ? 'on' : ''}" role="tab" aria-selected="${view === 'circuit'}">${icon('circuit-board')} Circuit diagram</button><button data-v="app" class="${view === 'app' ? 'on' : ''}" role="tab" aria-selected="${view === 'app'}">${icon('cable')} Apparatus connections</button></div>` : ''}
    <span class="spacer"></span>
    <div class="diag-tools"><button class="btn sm" data-dl="svg" title="Vector file — sharp at any size">${icon('file-code-2')} SVG</button><button class="btn sm" data-dl="png" title="Image as shown on screen">${icon('image-down')} PNG</button><button class="btn sm" data-dl="print" title="White background for your record book">${icon('printer')} Print PNG</button><button class="btn sm" data-fs="diagram">${icon('maximize-2')}<span>Full screen</span></button></div></div>
    <div id="diagBody"></div>`;
  const body = $('#diagBody', host);
  if (view === 'circuit') {
    const d = DIAGRAMS[e.id]();
    body.innerHTML = `<div class="diagram-wrap">${d.svg}</div><ul class="legend-list">${d.legend.map(l => `<li><b>${l[0]}</b><span>${l[1]}</span></li>`).join('')}</ul>${has ? `<button class="app-hint" data-goapp="1">${icon('cable')}<span><b>Wiring the real kit?</b> Switch to <u>Apparatus connections</u> for a pictorial wiring guide with step-by-step highlights and a pre-switch-on checklist.</span>${icon('arrow-right')}</button>` : ''}`;
  } else {
    const a = apFor(e.id), info = AP_INFO[e.id];
    body.innerHTML = `<div class="app-grid"><div class="app-main">
        <div class="app-ctl">${e.id === 'diode' ? `<div class="seg" id="apBias" style="min-width:230px"><button data-b="forward" class="${AP_STATE.bias === 'forward' ? 'on' : ''}">Forward bias</button><button data-b="reverse" class="${AP_STATE.bias === 'reverse' ? 'on' : ''}">Reverse bias</button></div>` : ''}
          <button class="btn sm primary" id="apPlay">${icon('play')} Play wiring sequence</button>
          <label class="row app-flow"><input type="checkbox" id="apFlow" ${AP_STATE.flow ? 'checked' : ''}> Show current flow</label>
          <span class="spacer"></span><button class="btn sm ghost" id="apAll" hidden>${icon('eye')} Show all</button></div>
        <div class="diagram-wrap app-wrap">${a.svg}</div>
        <div class="app-key"><span><i style="background:#dc2626"></i>Red — to (+) terminals</span><span><i style="background:#111827;outline:1.5px solid #9ca3af"></i>Black — to (−) / return</span><span><i style="background:#eab308"></i>Yellow — series links</span><span><i class="dots"></i>Moving dots — conventional current</span></div>
      </div>
      <aside class="app-side">
        <h4>${icon('list-ordered')} Wiring steps <small>tap a step to highlight it</small></h4>
        <ol class="app-steps">${a.steps.map((s, i) => `<li><button data-step="${i}"><b>${i + 1}</b><span>${s.t}</span></button></li>`).join('')}</ol>
        <h4>${icon('shield-check')} Before you switch on <small id="apCk">0/${info.check.length}</small></h4>
        <div class="app-check">${info.check.map((c, i) => `<label><input type="checkbox" data-ck="${i}"> <span>${c}</span></label>`).join('')}</div>
        <h4>${icon('alert-triangle')} Common wiring mistakes</h4>
        <ul class="app-mist">${info.mistakes.map(m => `<li>${m}</li>`).join('')}</ul>
      </aside></div>`;
    const svg = $('.app-svg', body);
    svg.classList.toggle('flowing', AP_STATE.flow);
    const focus = i => {
      const ids = i == null ? null : a.steps[i].ids;
      svg.classList.toggle('focus', !!ids);
      $$('[data-w],[data-p]', svg).forEach(n => n.classList.toggle('hl', !!ids && ids.includes(n.dataset.w || n.dataset.p)));
      $$('[data-step]', body).forEach(b => b.classList.toggle('on', +b.dataset.step === i));
      $('#apAll', body).hidden = !ids;
    };
    const stop = () => { clearInterval(AP_STATE.play); AP_STATE.play = null; const p = $('#apPlay', body); if (p) { p.innerHTML = `${icon('play')} Play wiring sequence`; refreshIcons(); } };
    body.addEventListener('click', ev => {
      const st = ev.target.closest('[data-step]');
      if (st) { stop(); const i = +st.dataset.step; focus(st.classList.contains('on') ? null : i); return; }
      const bb = ev.target.closest('[data-b]');
      if (bb && bb.dataset.b !== AP_STATE.bias) { AP_STATE.bias = bb.dataset.b; renderDiagramTab(e, host); return; }
    });
    $('#apAll', body).onclick = () => { stop(); focus(null); };
    $('#apFlow', body).onchange = ev => { AP_STATE.flow = ev.target.checked; svg.classList.toggle('flowing', AP_STATE.flow); };
    $('#apPlay', body).onclick = ev => {
      if (AP_STATE.play) { stop(); focus(null); return; }
      let i = 0; focus(0); ev.currentTarget.innerHTML = `${icon('square')} Stop`; refreshIcons();
      AP_STATE.play = setInterval(() => {
        if (!svg.isConnected) return stop();
        i++; if (i >= a.steps.length) { stop(); focus(null); return; }
        focus(i); const li = $(`[data-step="${i}"]`, body); li && li.scrollIntoView({ block: 'nearest', behavior: motionOK() ? 'smooth' : 'auto' });
      }, 2600);
    };
    const upd = () => { const n = $$('[data-ck]:checked', body).length; $('#apCk', body).textContent = `${n}/${info.check.length}`; $('#apCk', body).classList.toggle('done', n === info.check.length); if (n === info.check.length) toast('Checklist complete — safe to switch on', 'shield-check'); };
    $$('[data-ck]', body).forEach(c => c.onchange = upd);
  }
  $('#diagSeg', host) && ($('#diagSeg', host).onclick = ev => { const b = ev.target.closest('[data-v]'); if (!b) return; AP_STATE.view[e.id] = b.dataset.v; renderDiagramTab(e, host); });
  const go = $('[data-goapp]', host); if (go) go.onclick = () => { AP_STATE.view[e.id] = 'app'; renderDiagramTab(e, host); host.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  $$('[data-dl]', host).forEach(b => b.onclick = () => diagDownload($('#diagBody svg', host), `physlab-${e.id}-${view === 'app' ? 'connections' + (e.id === 'diode' ? '-' + AP_STATE.bias : '') : 'diagram'}`, b.dataset.dl));
  $('[data-fs="diagram"]', host).onclick = () => toggleFullscreen($('#diagBody .diagram-wrap', host));
  refreshIcons();
}

/* ---------- Diagram export (SVG / PNG / print-ready PNG) ---------- */
function diagSvgString(svgEl, print, bgColor = '#0d1018') {
  const c = svgEl.cloneNode(true), ns = 'http://www.w3.org/2000/svg', app = c.classList.contains('app-svg');
  c.classList.remove('focus', 'flowing'); c.querySelectorAll('.hl').forEach(n => n.classList.remove('hl'));
  const vb = (c.getAttribute('viewBox') || '0 0 960 540').split(/\s+/).map(Number);
  c.setAttribute('xmlns', ns); c.setAttribute('width', vb[2]); c.setAttribute('height', vb[3]);
  if (app && print) c.setAttribute('style', AP_PRINT_VARS);
  const st = document.createElementNS(ns, 'style');
  st.textContent = "text{font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif}.w-glow,.w-flow,.lit{display:none}";
  c.insertBefore(st, c.firstChild);
  if (!app) { const bg = document.createElementNS(ns, 'rect'); bg.setAttribute('width', vb[2]); bg.setAttribute('height', vb[3]); bg.setAttribute('fill', bgColor); c.insertBefore(bg, st.nextSibling); }
  return new XMLSerializer().serializeToString(c);
}
/* Swap light and dark while keeping hue: rgb + (1 − max − min) maps HSL lightness L → 1 − L */
function lightInvert(cv) {
  const g = cv.getContext('2d'), im = g.getImageData(0, 0, cv.width, cv.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const r = d[i], gg = d[i + 1], b = d[i + 2], k = 255 - Math.max(r, gg, b) - Math.min(r, gg, b); d[i] = r + k; d[i + 1] = gg + k; d[i + 2] = b + k; }
  g.putImageData(im, 0, 0);
}
function svgToCanvas(str, scale = 2) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale); const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height); res(c); };
    img.onerror = rej;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(str);
  });
}
function saveBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); }
async function diagDownload(svgEl, name, kind) {
  if (!svgEl) return;
  const app = svgEl.classList.contains('app-svg');
  try {
    if (kind === 'svg') { saveBlob(new Blob([diagSvgString(svgEl, false)], { type: 'image/svg+xml' }), name + '.svg'); toast('Diagram saved as SVG', 'download'); return; }
    // circuit diagrams: draw on pure black, then swap lightness so the paper comes out pure white
    const print = kind === 'print', cv = await svgToCanvas(diagSvgString(svgEl, print && app, print && !app ? '#000000' : '#0d1018'), 2);
    if (print && !app) lightInvert(cv);
    cv.toBlob(b => { saveBlob(b, name + (print ? '-print' : '') + '.png'); toast(print ? 'Print-ready diagram saved' : 'Diagram saved as PNG', 'download'); }, 'image/png');
  } catch (err) { toast('Could not export this diagram', 'alert-circle'); }
}
