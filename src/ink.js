/* ---------- Stylus handwriting: ink pads, notebooks, rough work, answer pads, page annotation ---------- */
const INK_PAPER_COLORS = ['#111827', '#1d4ed8', '#dc2626', '#047857', '#7c3aed'];
const inkScreenColors = () => document.body.classList.contains('light') ? ['#0f172a', '#2563eb', '#dc2626', '#059669', '#7c3aed'] : ['#f8fafc', '#22d3ee', '#f43f5e', '#fbbf24', '#a78bfa'];
const INK_SIZES = [1.6, 3, 6];
const ERASER_R = [8, 16, 32]; // eraser radius in screen px
const segDist = (ax, ay, bx, by, px, py) => { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy; let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(ax + t * dx - px, ay + t * dy - py); };
function inkStore() { Store.s.ink = Store.s.ink || { pads: {}, pages: {}, mode: {}, annot: {} }; ['pads', 'pages', 'mode', 'annot', 'paper'].forEach(k => Store.s.ink[k] = Store.s.ink[k] || {}); return Store.s.ink; }
const penOnly = () => Store.s.settings.penOnly !== false;
const usePressure = () => Store.s.settings.pressure !== false;

/* Shared tool state (one per toolbar) */
function inkTools(palette) { return { tool: 'pen', color: palette[0], size: 1, emode: 'part', esize: 1, palette, pads: new Set(), last: null }; }

class InkPad {
  constructor(canvas, { get, set, tools, height = null, onStroke = null, screen = false } = {}) {
    this.paper = !screen; this.cv = canvas; this.g = canvas.getContext('2d'); this.get = get; this.set = set; this.tools = tools; this.fixedH = height; this.onStroke = onStroke;
    this.data = get() || { w: 0, s: [] }; this.undo = []; this.redo = []; this.cur = null; this.enabled = true;
    tools.pads.add(this);
    this.resize();
    const c = canvas;
    c.addEventListener('pointerover', e => { if (e.pointerType === 'pen') c.style.touchAction = 'none'; });
    c.addEventListener('pointerleave', e => { if (e.pointerType === 'pen' && !this.cur) c.style.touchAction = penOnly() ? 'pan-y' : 'none'; if (!this.erasing) this.blit(); });
    c.style.touchAction = penOnly() ? 'pan-y' : 'none';
    c.addEventListener('pointerdown', e => this.down(e));
    c.addEventListener('pointermove', e => this.move(e));
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => c.addEventListener(t, e => this.up(e)));
    this.ro = window.ResizeObserver ? new ResizeObserver(() => requestAnimationFrame(() => this.resize())) : null; this.ro && this.ro.observe(c.parentElement);
  }
  k() { return this.data.w ? this.W / this.data.w : 1; }
  resize() {
    const r = this.cv.parentElement.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    const W = Math.max(50, Math.round(r.width)), H = this.fixedH || Math.max(50, Math.round(r.height));
    if (W === this.W && H === this.H && this.cv.width) return;
    this.W = W; this.H = H; this.dpr = dpr; this.cv.width = W * dpr; this.cv.height = H * dpr;
    this.cache = this.cache || document.createElement('canvas'); this.cache.width = W * dpr; this.cache.height = H * dpr; this.cg = this.cache.getContext('2d'); this.cg.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0); this.render();
  }
  pt(e) { const r = this.cv.getBoundingClientRect(), k = this.k(); const p = e.pointerType === 'pen' && usePressure() ? (e.pressure || .5) : .5; return [+((e.clientX - r.left) / k).toFixed(1), +((e.clientY - r.top) / k).toFixed(1), +p.toFixed(2)]; }
  down(e) {
    if (!this.enabled) return;
    if (e.pointerType === 'touch' && penOnly()) return; // palm / finger rejection
    if (e.button > 0 && e.pointerType === 'mouse') return;
    e.preventDefault(); try { this.cv.setPointerCapture(e.pointerId); } catch (x) { }
    this.tools.last = this; if (!this.data.w) this.data.w = this.W;
    const T = this.tools;
    // the eraser end of a stylus (button 5 / buttons&32) or the barrel button (buttons&2) erases precisely
    this.flip = e.pointerType === 'pen' && (e.button === 5 || (e.buttons & 32) || (e.buttons & 2));
    if (T.tool === 'eraser' || this.flip) { this.erasing = true; this.snap = this.data.s.slice(); this.changed = false; this.eraseAt(e); return; }
    this.cur = { t: T.tool === 'hl' ? 'hl' : 'pen', c: T.color, w: INK_SIZES[T.size], p: this.pt(e) };
    this.drawStroke(this.cur, this.k());
  }
  move(e) {
    if (this.erasing) { const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : []; (evs.length ? evs : [e]).forEach(ev => this.eraseAt(ev)); this.cursor(e); return; }
    if (!this.cur) { if (this.enabled && this.tools.tool === 'eraser' && !(e.pointerType === 'touch' && penOnly())) this.cursor(e); return; }
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    const s = this.cur, k = this.k(), before = s.p.length;
    (evs.length ? evs : [e]).forEach(ev => s.p.push(...this.pt(ev)));
    if (s.t === 'hl') { this.render(); this.drawStroke(s, k); } else this.drawSeg(s, Math.max(0, before / 3 - 1), k);
  }
  up() {
    if (this.erasing) { this.erasing = false; this.flip = false; if (this.changed) { this.undo.push({ snap: this.snap }); this.redo = []; this.save(); } this.blit(); return; }
    if (!this.cur) return;
    this.data.s.push(this.cur); this.undo.push({ add: this.cur }); this.redo = []; this.cur = null;
    this.save(); this.render();
    if (penOnly()) this.cv.style.touchAction = 'pan-y';
    this.onStroke && this.onStroke();
  }
  eraserR() { return ERASER_R[this.tools.esize] || 16; }
  eraseAt(e) {
    const [x, y] = this.pt(e), R = this.eraserR() / this.k(), whole = this.tools.emode === 'stroke' && !this.flip, out = []; let changed = false;
    for (const s of this.data.s) {
      const r = R + s.w * (s.t === 'hl' ? 2.5 : .6), p = s.p, n = p.length / 3;
      // fast reject with bounding box
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let j = 0; j < p.length; j += 3) { if (p[j] < x0) x0 = p[j]; if (p[j] > x1) x1 = p[j]; if (p[j + 1] < y0) y0 = p[j + 1]; if (p[j + 1] > y1) y1 = p[j + 1]; }
      if (x < x0 - r || x > x1 + r || y < y0 - r || y > y1 + r) { out.push(s); continue; }
      if (n === 1) { if (Math.hypot(p[0] - x, p[1] - y) < r) { changed = true; continue; } out.push(s); continue; }
      if (whole) { let hit = false; for (let j = 3; j < p.length && !hit; j += 3) hit = segDist(p[j - 3], p[j - 2], p[j], p[j + 1], x, y) < r; if (hit) { changed = true; continue; } out.push(s); continue; }
      // precise: densify segments near the eraser, then cut out the points inside the circle
      const P = [[p[0], p[1], p[2]]];
      for (let j = 3; j < p.length; j += 3) {
        const ax = p[j - 3], ay = p[j - 2], bx = p[j], by = p[j + 1];
        if (segDist(ax, ay, bx, by, x, y) < r) { const len = Math.hypot(bx - ax, by - ay), m = Math.max(1, Math.ceil(len / (r / 4))); for (let q = 1; q <= m; q++) { const t = q / m; P.push([ax + (bx - ax) * t, ay + (by - ay) * t, p[j - 1] + (p[j + 2] - p[j - 1]) * t]); } }
        else P.push([bx, by, p[j + 2]]);
      }
      if (!P.some(q => Math.hypot(q[0] - x, q[1] - y) < r)) { out.push(s); continue; }
      changed = true; let cur = [];
      const flush = () => { if (cur.length >= 2) out.push({ ...s, p: cur.flatMap(q => [+q[0].toFixed(1), +q[1].toFixed(1), +q[2].toFixed(2)]) }); cur = []; };
      P.forEach(q => { if (Math.hypot(q[0] - x, q[1] - y) < r) flush(); else cur.push(q); });
      flush();
    }
    if (changed) { this.data.s = out; this.changed = true; this.render(); }
  }
  blit() { if (!this.cache) return; this.g.save(); this.g.setTransform(1, 0, 0, 1, 0, 0); this.g.clearRect(0, 0, this.cv.width, this.cv.height); this.g.drawImage(this.cache, 0, 0); this.g.restore(); }
  cursor(e) {
    const r = this.cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, R = this.eraserR();
    this.blit(); const g = this.g; g.save(); g.beginPath(); g.arc(x, y, R, 0, 7);
    g.fillStyle = 'rgba(148,163,184,.18)'; g.fill(); g.lineWidth = 1.5; g.strokeStyle = this.erasing ? '#f43f5e' : 'rgba(100,116,139,.9)'; g.setLineDash([4, 3]); g.stroke(); g.restore();
  }
  width(s, pr, k) { return (s.t === 'hl' ? s.w * 5 : s.w * (0.35 + pr * 1.3)) * k; }
  drawSeg(s, i, k) {
    const g = this.g, p = s.p, n = p.length / 3; if (n < 2) return;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = s.c;
    for (let j = Math.max(1, Math.floor(i)); j < n; j++) {
      const x0 = p[(j - 1) * 3] * k, y0 = p[(j - 1) * 3 + 1] * k, x1 = p[j * 3] * k, y1 = p[j * 3 + 1] * k;
      g.lineWidth = this.width(s, (p[(j - 1) * 3 + 2] + p[j * 3 + 2]) / 2, 1) * k;
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    }
    g.restore();
  }
  drawStroke(s, k, g = this.g) {
    const p = s.p, n = p.length / 3;
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = s.c; g.fillStyle = s.c;
    if (s.t === 'hl') { g.globalAlpha = .32; g.globalCompositeOperation = document.body.classList.contains('light') || this.paper !== false ? 'multiply' : 'screen'; }
    if (n === 1) { g.beginPath(); g.arc(p[0] * k, p[1] * k, this.width(s, p[2], k) / 2, 0, 7); g.fill(); g.restore(); return; }
    if (s.t === 'hl') { g.lineWidth = this.width(s, .5, k); g.beginPath(); g.moveTo(p[0] * k, p[1] * k); for (let j = 1; j < n; j++) g.lineTo(p[j * 3] * k, p[j * 3 + 1] * k); g.stroke(); g.restore(); return; }
    for (let j = 1; j < n; j++) {
      const xa = p[(j - 1) * 3] * k, ya = p[(j - 1) * 3 + 1] * k, xb = p[j * 3] * k, yb = p[j * 3 + 1] * k;
      g.lineWidth = this.width(s, (p[(j - 1) * 3 + 2] + p[j * 3 + 2]) / 2, k);
      g.beginPath();
      if (j > 1 && j < n - 1) { const xm0 = (p[(j - 2) * 3] * k + xa) / 2, ym0 = (p[(j - 2) * 3 + 1] * k + ya) / 2, xm1 = (xa + xb) / 2, ym1 = (ya + yb) / 2; g.moveTo(xm0, ym0); g.quadraticCurveTo(xa, ya, xm1, ym1); g.lineTo(xb, yb); }
      else { g.moveTo(xa, ya); g.lineTo(xb, yb); }
      g.stroke();
    }
    g.restore();
  }
  render() { const k = this.k(); if (this.cg) { this.cg.clearRect(0, 0, this.W, this.H); this.data.s.forEach(s => this.drawStroke(s, k, this.cg)); this.blit(); } else { this.g.clearRect(0, 0, this.W, this.H); this.data.s.forEach(s => this.drawStroke(s, k)); } }
  save() { this.set(this.data); }
  doUndo() { const a = this.undo.pop(); if (!a) return false; if (a.snap) { const c = this.data.s; this.data.s = a.snap; a.snap = c; } if (a.add) this.data.s = this.data.s.filter(s => s !== a.add); if (a.del) this.data.s.push(...a.del); if (a.clear) this.data.s = a.clear; this.redo.push(a); this.render(); this.save(); return true; }
  doRedo() { const a = this.redo.pop(); if (!a) return false; if (a.snap) { const c = this.data.s; this.data.s = a.snap; a.snap = c; } if (a.add) this.data.s.push(a.add); if (a.del) this.data.s = this.data.s.filter(s => !a.del.includes(s)); if (a.clear) this.data.s = []; this.undo.push(a); this.render(); this.save(); return true; }
  clear() { if (!this.data.s.length) return; this.undo.push({ clear: this.data.s.slice() }); this.data.s = []; this.render(); this.save(); }
  isEmpty() { return !this.data.s.length; }
  toCanvas(bg = '#ffffff', scale = 2) { const c = document.createElement('canvas'); c.width = this.W * scale; c.height = this.H * scale; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); const k = this.k() * scale; this.data.s.forEach(s => this.drawStroke(s, k, g)); return c; }
  destroy() { this.ro && this.ro.disconnect(); this.tools.pads.delete(this); }
}

function inkToolbarHtml(T, extra = '') {
  return `<div class="ink-bar" role="toolbar" aria-label="Handwriting tools" data-tool="${T.tool}">
    <div class="seg ink-tools">${[['pen', 'pen-tool', 'Pen'], ['hl', 'highlighter', 'Highlighter'], ['eraser', 'eraser', 'Eraser']].map(t => `<button data-it="${t[0]}" class="${T.tool === t[0] ? 'on' : ''}" title="${t[2]}" aria-label="${t[2]}">${icon(t[1])}</button>`).join('')}</div>
    <div class="ink-colors">${T.palette.map((c, i) => `<button data-ic="${i}" class="${T.color === c ? 'on' : ''}" style="--c:${c}" aria-label="Colour ${i + 1}"></button>`).join('')}</div>
    <div class="ink-sizes">${INK_SIZES.map((s, i) => `<button data-is="${i}" class="${T.size === i ? 'on' : ''}" aria-label="Size ${i + 1}"><i style="width:${4 + i * 4}px;height:${4 + i * 4}px"></i></button>`).join('')}</div>
    <div class="ink-eopts"><div class="seg ink-emode"><button data-em="part" class="${T.emode === 'part' ? 'on' : ''}" title="Erase only what you rub over">Precise</button><button data-em="stroke" class="${T.emode === 'stroke' ? 'on' : ''}" title="Erase whole strokes you touch">Whole stroke</button></div>
      <div class="ink-sizes">${ERASER_R.map((r, i) => `<button data-es="${i}" class="${T.esize === i ? 'on' : ''}" aria-label="Eraser size ${i + 1}" title="Eraser size"><i style="width:${6 + i * 6}px;height:${6 + i * 6}px;background:transparent;border:1.5px dashed var(--text-2)"></i></button>`).join('')}</div></div>
    <span class="spacer"></span>
    <button class="icon-btn" data-ia="undo" title="Undo" aria-label="Undo">${icon('undo-2')}</button><button class="icon-btn" data-ia="redo" title="Redo" aria-label="Redo">${icon('redo-2')}</button><button class="icon-btn" data-ia="clear" title="Clear" aria-label="Clear">${icon('trash-2')}</button>${extra}</div>`;
}
function bindInkToolbar(bar, T, onExtra) {
  // one toolbar listener per element: re-mounting a notebook in the same host replaces the old one
  if (bar._inkOff) bar._inkOff();
  const h = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.it) { T.tool = b.dataset.it; $$('[data-it]', bar).forEach(x => x.classList.toggle('on', x === b)); $$('.ink-bar', bar.classList.contains('ink-bar') ? bar.parentElement : bar).forEach(x => x.dataset.tool = T.tool); if (bar.classList.contains('ink-bar')) bar.dataset.tool = T.tool; }
    else if (b.dataset.em) { T.emode = b.dataset.em; $$('[data-em]', bar).forEach(x => x.classList.toggle('on', x === b)); }
    else if (b.dataset.es != null) { T.esize = +b.dataset.es; $$('[data-es]', bar).forEach(x => x.classList.toggle('on', x === b)); }
    else if (b.dataset.ic != null) { T.color = T.palette[+b.dataset.ic]; if (T.tool === 'eraser') { T.tool = 'pen'; $$('[data-it]', bar).forEach(x => x.classList.toggle('on', x.dataset.it === 'pen')); $$('.ink-bar', bar.parentElement || bar).forEach(x => x.dataset.tool = 'pen'); if (bar.classList.contains('ink-bar')) bar.dataset.tool = 'pen'; } $$('[data-ic]', bar).forEach(x => x.classList.toggle('on', x === b)); }
    else if (b.dataset.is != null) { T.size = +b.dataset.is; $$('[data-is]', bar).forEach(x => x.classList.toggle('on', x === b)); }
    else if (b.dataset.ia === 'undo') { (T.last || [...T.pads][0]) && (T.last || [...T.pads][0]).doUndo(); }
    else if (b.dataset.ia === 'redo') { (T.last || [...T.pads][0]) && (T.last || [...T.pads][0]).doRedo(); }
    else if (b.dataset.ia === 'clear') { const p = T.last || [...T.pads][0]; if (p && !p.isEmpty()) confirmModal('Clear this page?', 'Your handwriting on this page will be erased. You can undo straight after.', 'Clear').then(ok => ok && p.clear()); }
    else if (onExtra) onExtra(b);
  };
  bar.addEventListener('click', h);
  bar._inkOff = () => { bar.removeEventListener('click', h); bar._inkOff = null; };
}

/* ---------- Paper templates + exports (PDF / PNG / JPEG / SVG) ---------- */
const INK_PAPERS = [['lined', 'Lined'], ['grid', 'Graph'], ['dotted', 'Dotted'], ['plain', 'Plain']];
const INK_PAPER_BG = { lined: '#fffef8', grid: '#fbfdf7', dotted: '#fdfcf9', plain: '#ffffff' };
/* the same template the CSS draws behind the canvas, as a list of {c, w, d} paths in page px */
function inkPaperPaths(paper, W, H) {
  const out = [];
  if (paper === 'lined') { let d = ''; for (let y = 33.5; y < H; y += 34) d += `M0 ${y}H${W}`; out.push({ c: 'rgba(59,130,246,.22)', w: 1, d }, { c: 'rgba(239,68,68,.35)', w: 1, d: `M54.5 0V${H}` }); }
  if (paper === 'grid') { let m = '', M = ''; for (let x = .5; x < W; x += 10) { if (Math.round(x - .5) % 50) m += `M${x} 0V${H}`; else M += `M${x} 0V${H}`; } for (let y = .5; y < H; y += 10) { if (Math.round(y - .5) % 50) m += `M0 ${y}H${W}`; else M += `M0 ${y}H${W}`; } out.push({ c: 'rgba(22,101,52,.07)', w: 1, d: m }, { c: 'rgba(22,101,52,.16)', w: 1, d: M }); }
  if (paper === 'dotted') { let d = ''; for (let y = 12; y < H; y += 24) for (let x = 12; x < W; x += 24) d += `M${x} ${y}h.01`; out.push({ c: 'rgba(100,116,139,.45)', w: 2.6, d, cap: 1 }); }
  return out;
}
/* one page rendered to a canvas, optionally on its paper template, with a small footer */
function inkPageCanvas(pad, { paper = 'plain', bg = true, scale = 2, footer = '' } = {}) {
  const W = pad.W, H = pad.H, c = document.createElement('canvas'); c.width = Math.round(W * scale); c.height = Math.round(H * scale);
  const g = c.getContext('2d'); g.fillStyle = bg ? INK_PAPER_BG[paper] || '#fff' : '#ffffff'; g.fillRect(0, 0, c.width, c.height);
  g.save(); g.scale(scale, scale);
  if (bg) inkPaperPaths(paper, W, H).forEach(p => { g.strokeStyle = p.c; g.lineWidth = p.w; g.lineCap = p.cap ? 'round' : 'butt'; g.stroke(new Path2D(p.d)); });
  if (footer) { g.font = '500 10px Inter, Segoe UI, Arial, sans-serif'; g.fillStyle = '#94a3b8'; g.textAlign = 'right'; g.fillText(footer, W - 12, H - 10); }
  g.restore();
  const k = pad.k() * scale; pad.data.s.forEach(s => pad.drawStroke(s, k, g));
  return c;
}
const canvasBlob = (c, type = 'image/png', q = .92) => new Promise(r => c.toBlob(r, type, q));
function inkStack(cs, gap = 24) {
  if (cs.length === 1) return cs[0];
  const out = document.createElement('canvas'); out.width = Math.max(...cs.map(c => c.width)); out.height = cs.reduce((h, c) => h + c.height, 0) + gap * (cs.length - 1);
  const g = out.getContext('2d'); g.fillStyle = '#d1d5db'; g.fillRect(0, 0, out.width, out.height); let y = 0; cs.forEach(c => { g.drawImage(c, 0, y); y += c.height + gap; });
  return out;
}
/* Minimal PDF writer: one JPEG (DCTDecode) per page, A4 width, height follows the page aspect */
async function inkPdf(cs, title) {
  const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
  const push = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (num, body) => { offs[num] = len; push(`${num} 0 obj\n`); if (typeof body === 'string') push(body); else body(); push('\nendobj\n'); };
  const n = cs.length, pg = i => 3 + i * 3, info = 3 + n * 3, total = info;
  push(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 226, 227, 207, 211, 10])); // %PDF-1.4 + binary comment
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${cs.map((_, i) => `${pg(i)} 0 R`).join(' ')}] /Count ${n} >>`);
  for (let i = 0; i < n; i++) {
    const c = cs[i], jpg = new Uint8Array(await (await canvasBlob(c, 'image/jpeg', .9)).arrayBuffer());
    const W = 595.28, H = +(W * c.height / c.width).toFixed(2), cmd = `q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
    obj(pg(i), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${pg(i) + 2} 0 R >> >> /Contents ${pg(i) + 1} 0 R >>`);
    obj(pg(i) + 1, `<< /Length ${cmd.length} >>\nstream\n${cmd}\nendstream`);
    obj(pg(i) + 2, () => { push(`<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); push(jpg); push('\nendstream'); });
  }
  const t = new Date(), p2 = v => String(v).padStart(2, '0'), safe = String(title).replace(/[^\x20-\x7e]/g, '').replace(/[()\\]/g, '');
  obj(info, `<< /Title (${safe}) /Producer (PhysLab) /CreationDate (D:${t.getFullYear()}${p2(t.getMonth() + 1)}${p2(t.getDate())}${p2(t.getHours())}${p2(t.getMinutes())}${p2(t.getSeconds())}) >>`);
  const xref = len;
  push(`xref\n0 ${total + 1}\n0000000000 65535 f \n` + Array.from({ length: total }, (_, k) => String(offs[k + 1]).padStart(10, '0') + ' 00000 n \n').join(''));
  push(`trailer\n<< /Size ${total + 1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
}
/* Vector SVG: strokes become paths; pressure is kept by splitting a stroke into runs of equal width */
function inkSvg(pads, { paper = 'plain', bg = true, gap = 24 } = {}) {
  const W = Math.max(...pads.map(p => p.W)), Ht = pads.reduce((h, p) => h + p.H, 0) + gap * (pads.length - 1), f = v => +v.toFixed(1);
  let y0 = 0, body = '';
  pads.forEach(pad => {
    const k = pad.k(), H = pad.H;
    let g = `<g transform="translate(0 ${y0})"><rect width="${pad.W}" height="${H}" fill="${bg ? INK_PAPER_BG[paper] : '#ffffff'}"/>`;
    if (bg) inkPaperPaths(paper, pad.W, H).forEach(p => g += `<path d="${p.d}" stroke="${p.c}" stroke-width="${p.w}"${p.cap ? ' stroke-linecap="round"' : ''} fill="none"/>`);
    pad.data.s.forEach(s => {
      const p = s.p, n = p.length / 3;
      if (n === 1) { g += `<circle cx="${f(p[0] * k)}" cy="${f(p[1] * k)}" r="${f(pad.width(s, p[2], k) / 2)}" fill="${s.c}"${s.t === 'hl' ? ' fill-opacity=".32"' : ''}/>`; return; }
      if (s.t === 'hl') { g += `<path d="M${Array.from({ length: n }, (_, j) => `${f(p[j * 3] * k)} ${f(p[j * 3 + 1] * k)}`).join('L')}" fill="none" stroke="${s.c}" stroke-opacity=".32" stroke-width="${f(pad.width(s, .5, k))}" stroke-linecap="round" stroke-linejoin="round" style="mix-blend-mode:multiply"/>`; return; }
      let run = null;
      const flush = () => { if (run) g += `<path d="${run.d}" fill="none" stroke="${s.c}" stroke-width="${run.w}" stroke-linecap="round" stroke-linejoin="round"/>`; run = null; };
      for (let j = 1; j < n; j++) {
        const w = Math.round(pad.width(s, (p[(j - 1) * 3 + 2] + p[j * 3 + 2]) / 2, k) * 4) / 4, xa = f(p[(j - 1) * 3] * k), ya = f(p[(j - 1) * 3 + 1] * k), xb = f(p[j * 3] * k), yb = f(p[j * 3 + 1] * k);
        if (!run || run.w !== w) { flush(); run = { w, d: `M${xa} ${ya}` }; }
        run.d += `L${xb} ${yb}`;
      }
      flush();
    });
    body += g + '</g>'; y0 += H + gap;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Ht}" viewBox="0 0 ${W} ${Ht}"><rect width="${W}" height="${Ht}" fill="#d1d5db"/>${body}</svg>`;
}
async function inkExport(pads, fmt, { paper, bg, name, label }) {
  if (!pads.length || pads.every(p => p.isEmpty())) return toast('Nothing written yet', 'alert-circle');
  const n = pads.length, stamp = new Date().toLocaleDateString(), foot = i => `PhysLab · ${label || 'notes'} · ${stamp}${n > 1 ? ` · page ${i + 1}/${n}` : ''}`;
  try {
    if (fmt === 'svg') { saveBlob(new Blob([inkSvg(pads, { paper, bg })], { type: 'image/svg+xml' }), name + '.svg'); toast('Saved as SVG (vector)', 'download'); return; }
    const cs = pads.map((p, i) => inkPageCanvas(p, { paper, bg, scale: 2, footer: foot(i) }));
    if (fmt === 'pdf') { saveBlob(await inkPdf(cs, `PhysLab ${label || 'notes'}`), name + '.pdf'); toast(`Saved as PDF — ${n} page${n > 1 ? 's' : ''}`, 'download'); return; }
    const out = inkStack(cs);
    saveBlob(await canvasBlob(out, fmt === 'jpg' ? 'image/jpeg' : 'image/png', .92), name + (fmt === 'jpg' ? '.jpg' : '.png'));
    toast(`Saved as ${fmt === 'jpg' ? 'JPEG' : 'PNG'}`, 'download');
  } catch (err) { toast('Export failed: ' + (err && err.message || err), 'alert-circle'); }
}
function inkDownloadMenuHtml(bgOn) {
  const it = (f, ic, t, d) => `<button data-ix="dl" data-f="${f}" role="menuitem">${icon(ic)}<span><b>${t}</b><small>${d}</small></span></button>`;
  return `<div class="ink-dlw"><button class="btn sm" data-ix="dlm" aria-haspopup="menu" aria-expanded="false">${icon('download')} Download ${icon('chevron-down')}</button>
    <div class="ink-dlm" role="menu" hidden>${it('pdf', 'file-text', 'PDF document', 'All pages, A4 width — best to share or print')}${it('png', 'image-down', 'PNG image', 'Lossless, pages stacked')}${it('jpg', 'file-image', 'JPEG image', 'Smaller file for chat apps & email')}${it('svg', 'file-code-2', 'SVG vector', 'Razor-sharp at any zoom, editable')}
    <label class="ink-dlopt"><input type="checkbox" data-dlbg ${bgOn ? 'checked' : ''}> Include paper lines</label></div></div>`;
}
document.addEventListener('click', e => { if (!e.target.closest('.ink-dlw')) $$('.ink-dlm').forEach(m => { if (!m.hidden) { m.hidden = true; const b = m.previousElementSibling; if (b) b.setAttribute('aria-expanded', 'false'); } }); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.ink-dlm').forEach(m => { m.hidden = true; }); });

/* Multi-page notebook bound to storage key */
const INK_MOUNTED = new Set();
function inkCleanup() { INK_MOUNTED.forEach(p => p.destroy()); INK_MOUNTED.clear(); }
function mountInkNotebook(host, key, { paper = 'lined', height = 900, pages = true, label = '' } = {}) {
  if (!host) return;
  const S = inkStore(), T = inkTools(INK_PAPER_COLORS);
  const n = () => S.pages[key] || 1, curPaper = () => S.paper[key] || paper;
  const draw = () => {
    [...T.pads].forEach(p => { p.destroy(); INK_MOUNTED.delete(p); });
    host.innerHTML = `${inkToolbarHtml(T, `${pages ? `<button class="btn sm" data-ix="add">${icon('file-plus')} Page</button>` : ''}<select class="ink-psel" aria-label="Paper style" title="Paper style">${INK_PAPERS.map(p => `<option value="${p[0]}" ${curPaper() === p[0] ? 'selected' : ''}>${p[1]} paper</option>`).join('')}</select>${inkDownloadMenuHtml(S.dlbg !== false)}`)}
      <div class="ink-pages">${Array.from({ length: n() }, (_, i) => `<div class="ink-paper ${curPaper()}" style="height:${height}px">${pages && n() > 1 ? `<span class="ink-pno">${i + 1}</span>${i === n() - 1 ? `<button class="ink-del" data-ix="del" title="Delete last page" aria-label="Delete last page">${icon('x')}</button>` : ''}` : ''}<canvas data-pg="${i}" aria-label="Handwriting page ${i + 1}${label ? ' — ' + label : ''}"></canvas></div>`).join('')}</div>
      <p class="dim ink-hint">${penOnly() ? 'Pen-only mode: write with your stylus (or mouse); finger touches scroll the page.' : 'Write with a stylus, finger or mouse.'} Pressure-sensitive pens give natural line widths. Download saves every page as PDF, PNG, JPEG or SVG.</p>`;
    refreshIcons();
    $$('canvas[data-pg]', host).forEach(cv => { const k = `${key}#${cv.dataset.pg}`; const pad = new InkPad(cv, { get: () => S.pads[k] ? JSON.parse(JSON.stringify(S.pads[k])) : null, set: d => { S.pads[k] = d; saveSoon(); }, tools: T, height }); INK_MOUNTED.add(pad); });
    $('.ink-psel', host).onchange = e => { S.paper[key] = e.target.value; saveSoon(); $$('.ink-paper', host).forEach(p => { p.className = 'ink-paper ' + e.target.value; }); };
    $('[data-dlbg]', host).onchange = e => { S.dlbg = e.target.checked; saveSoon(); };
  };
  bindInkToolbar(host, T, b => {
    if (b.dataset.ix === 'add') { S.pages[key] = n() + 1; Store.save(); draw(); host.querySelector('.ink-pages').lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    else if (b.dataset.ix === 'del') { confirmModal('Delete the last page?', 'Its handwriting will be removed permanently.', 'Delete').then(ok => { if (!ok) return; delete S.pads[`${key}#${n() - 1}`]; S.pages[key] = Math.max(1, n() - 1); Store.save(); draw(); }); }
    else if (b.dataset.ix === 'dlm') {
      const m = b.nextElementSibling, open = m.hidden; m.hidden = !open; b.setAttribute('aria-expanded', String(open));
      if (open) { m.style.left = '0'; m.style.right = 'auto'; if (m.getBoundingClientRect().right > innerWidth - 8) { m.style.left = 'auto'; m.style.right = '0'; } const f = $('button', m); if (f) f.focus(); }
    }
    else if (b.dataset.ix === 'dl') {
      const m = b.closest('.ink-dlm'); m.hidden = true; m.previousElementSibling.setAttribute('aria-expanded', 'false');
      const pads = $$('canvas[data-pg]', host).map(cv => [...T.pads].find(p => p.cv === cv)).filter(Boolean);
      inkExport(pads, b.dataset.f, { paper: curPaper(), bg: S.dlbg !== false, name: `physlab-${key}-${todayKey()}`, label: label || 'notes' });
    }
  });
  draw();
}

/* Ink answer pad (modal) with optional handwriting-to-text */
async function recognizeInk(pad) {
  if (!('createHandwritingRecognizer' in navigator) || !window.HandwritingStroke) return null;
  try {
    const rec = await navigator.createHandwritingRecognizer({ languages: ['en'] }), dr = rec.startDrawing({ recognitionType: 'text', inputType: 'stylus' });
    pad.data.s.filter(s => s.t === 'pen').forEach((s, si) => { const st = new HandwritingStroke(); for (let j = 0; j < s.p.length; j += 3) st.addPoint({ x: s.p[j], y: s.p[j + 1], t: si * 1000 + j }); dr.addStroke(st); });
    const pr = await dr.getPrediction(); rec.finish(); return pr && pr[0] ? pr[0].text : null;
  } catch (e) { return null; }
}
function openInkModal({ title = 'Handwrite your answer', onDone }) {
  const m = $('#modal'), T = inkTools(INK_PAPER_COLORS); let tmp = { w: 0, s: [] };
  m.innerHTML = `<div class="modal-box ink-modal" role="document"><h3>${icon('pen-tool')} ${esc(title)}</h3>${inkToolbarHtml(T)}<div class="ink-paper lined" style="height:300px"><canvas aria-label="Handwriting area"></canvas></div><p class="dim" style="font-size:12px;margin:8px 0 14px">${'createHandwritingRecognizer' in navigator ? 'Your handwriting will be converted to text.' : 'Your handwritten answer will be attached as an image for you to compare with the model answer.'}</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-im="0">Cancel</button><button class="btn primary" data-im="1">${icon('check')} Use this answer</button></div></div>`;
  m.hidden = false; refreshIcons();
  const pad = new InkPad($('canvas', m), { get: () => tmp, set: d => tmp = d, tools: T, height: 300 });
  bindInkToolbar(m.querySelector('.modal-box'), T);
  const close = () => { pad.destroy(); m.hidden = true; m.innerHTML = ''; };
  m.onclick = async e => { const b = e.target.closest('[data-im]'); if (!b) return; if (b.dataset.im === '0') return close(); if (pad.isEmpty()) return toast('Write something first', 'alert-circle'); const text = await recognizeInk(pad); const url = pad.toCanvas('#ffffff', 1.5).toDataURL('image/png'); close(); onDone && onDone({ text, url }); };
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-inkfor]'); if (!b) return;
  const ta = document.getElementById(b.dataset.inkfor); if (!ta) return;
  openInkModal({ onDone: ({ text, url }) => {
    if (text) { ta.value = (ta.value ? ta.value + ' ' : '') + text; toast('Handwriting converted to text', 'pen-tool'); }
    else { let im = ta.parentElement.nextElementSibling; if (!im || !im.classList || !im.classList.contains('ink-ans')) { im = document.createElement('img'); im.className = 'ink-ans'; im.alt = 'Your handwritten answer'; ta.parentElement.after(im); } im.src = url; ta.dataset.inked = '1'; toast('Handwritten answer attached', 'pen-tool'); }
  } });
});

/* Page annotation overlay (draw on top of any page with a stylus) */
let ANN = null;
function annKey() { return (location.hash || '#/').split('?')[0]; }
function annMount(active = false) {
  annUnmount();
  const S = inkStore(), key = annKey(), data = S.annot[key];
  if (!active && !(data && data.s && data.s.length)) return;
  const v = $('#view'); v.style.position = 'relative';
  const layer = document.createElement('div'); layer.className = 'ann-layer' + (active ? ' on' : ''); layer.style.height = v.scrollHeight + 'px';
  layer.innerHTML = '<canvas aria-label="Page annotations"></canvas>'; v.appendChild(layer);
  const T = inkTools(inkScreenColors()); T.color = T.palette[2];
  const pad = new InkPad($('canvas', layer), { screen: true, get: () => S.annot[key] ? JSON.parse(JSON.stringify(S.annot[key])) : null, set: d => { S.annot[key] = d; saveSoon(); }, tools: T, height: v.scrollHeight });
  pad.enabled = active;
  ANN = { layer, pad, T, active };
  if (active) {
    const bar = document.createElement('div'); bar.className = 'ann-bar'; bar.innerHTML = inkToolbarHtml(T, `<button class="btn sm primary" data-ax="done">${icon('check')} Done</button>`); document.body.appendChild(bar); refreshIcons();
    bindInkToolbar(bar, T, b => { if (b.dataset.ax === 'done') annToggle(false); });
    ANN.bar = bar;
  }
  $('#annotBtn') && $('#annotBtn').classList.toggle('on', active);
}
function annUnmount() { if (!ANN) return; ANN.pad.destroy(); ANN.layer.remove(); ANN.bar && ANN.bar.remove(); ANN = null; $('#annotBtn') && $('#annotBtn').classList.remove('on'); }
function annToggle(on) { annMount(on); if (on) toast(penOnly() ? 'Annotate with your stylus or mouse — finger scrolls' : 'Annotate this page', 'pen-tool'); }

/* Settings card + hooks after each route */
function stylusSettingsHtml() {
  return `<div class="card" id="stylusCard"><h3>${icon('pen-tool')} Stylus & handwriting</h3>
    <label class="row" style="font-size:14px;cursor:pointer;margin-bottom:10px"><input type="checkbox" id="sPenOnly" ${penOnly() ? 'checked' : ''}> Pen-only writing (palm rejection — finger touches scroll instead of drawing)</label>
    <label class="row" style="font-size:14px;cursor:pointer;margin-bottom:10px"><input type="checkbox" id="sPressure" ${usePressure() ? 'checked' : ''}> Pressure-sensitive line width</label>
    <p class="muted" style="font-size:13px;margin:0 0 12px">Handwriting works in Notes, experiment notes, workspace rough work, viva/exam answers and as page annotations (pen button in the top bar). On iPad (Scribble) and Windows Ink you can also write directly into any text box — the system converts it to text.</p>
    <button class="btn sm danger" id="sClearInk">${icon('trash-2')} Delete all handwriting & annotations</button></div>`;
}
function inkAfterRoute() {
  inkCleanup();
  const { parts } = parseHash();
  // experiment notes: add handwriting toggle
  const en = $('#expNotes');
  if (en && parts[0] === 'exp') {
    const id = parts[1], S = inkStore(), ta = $('#expNoteTa', en);
    ta.insertAdjacentHTML('afterend', `<div class="row" style="margin-top:10px"><div class="seg" id="enMode" style="max-width:280px"><button data-m="type">${icon('type')} Type</button><button data-m="ink">${icon('pen-tool')} Handwrite</button></div></div><div id="enInk" style="margin-top:12px"></div>`);
    const setMode = m => { S.mode[id] = m; saveSoon(); $$('#enMode button').forEach(b => b.classList.toggle('on', b.dataset.m === m)); ta.hidden = m === 'ink'; $('#expNoteSaved').hidden = m === 'ink'; if (m === 'ink') mountInkNotebook($('#enInk'), `nb-${id}`, { height: 520, label: 'notes' }); else { inkCleanup(); $('#enInk').innerHTML = ''; } };
    $('#enMode').onclick = e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); };
    setMode(S.mode[id] || 'type'); refreshIcons();
  }
  // workspace rough work
  if (parts[0] === 'exp' && parts[2] === 'workspace' && $('#wsHost')) {
    const card = $('#wsHost').closest('.card');
    card.insertAdjacentHTML('afterend', `<details class="card no-print" id="roughCard" style="margin-top:18px"><summary style="cursor:pointer;font-weight:600;display:flex;align-items:center;gap:8px">${icon('pen-line')} Rough work — handwrite calculations</summary><div id="roughInk" style="margin-top:12px"></div></details>`);
    $('#roughCard').addEventListener('toggle', e => { if (e.target.open && !$('#roughInk').children.length) mountInkNotebook($('#roughInk'), `rough-${parts[1]}`, { paper: 'grid', height: 620, label: 'rough work' }); });
    refreshIcons();
  }
  // settings
  if (parts[0] === 'settings' && !$('#stylusCard')) {
    const grid = $('#view .grid.g2'); if (grid) { grid.insertAdjacentHTML('beforeend', stylusSettingsHtml()); refreshIcons();
      $('#sPenOnly').onchange = e => { Store.s.settings.penOnly = e.target.checked; Store.save(); };
      $('#sPressure').onchange = e => { Store.s.settings.pressure = e.target.checked; Store.save(); };
      $('#sClearInk').onclick = async () => { if (await confirmModal('Delete all handwriting?', 'All handwritten notes, rough work and page annotations will be permanently deleted.', 'Delete')) { Store.s.ink = { pads: {}, pages: {}, mode: {}, annot: {} }; Store.save(); toast('Handwriting deleted', 'trash-2'); } };
    }
  }
  // page annotations (display existing, drawing off)
  setTimeout(() => annMount(false), 60);
}
/* Notes page: type / handwrite per notebook (called from mountNotes) */
function inkNotesOpen(cur) {
  const S = inkStore(), ta = $('#nEd'); if (!ta) return;
  if (!$('#nMode')) { ta.insertAdjacentHTML('beforebegin', `<div class="seg" id="nMode" style="max-width:280px;margin-bottom:12px"><button data-m="type">${icon('type')} Type</button><button data-m="ink">${icon('pen-tool')} Handwrite</button></div>`); ta.insertAdjacentHTML('afterend', '<div id="nInk"></div>'); refreshIcons(); }
  const setMode = m => { S.mode[cur] = m; saveSoon(); $$('#nMode button').forEach(b => b.classList.toggle('on', b.dataset.m === m)); ta.hidden = m === 'ink'; $('#nSaved').hidden = m === 'ink'; inkCleanup(); if (m === 'ink') mountInkNotebook($('#nInk'), `nb-${cur}`, { height: 900, label: 'notebook' }); else $('#nInk').innerHTML = ''; };
  $('#nMode').onclick = e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); };
  setMode(S.mode[cur] || 'type');
}
window.addEventListener('resize', () => { if (ANN) { const v = $('#view'); ANN.layer.style.height = v.scrollHeight + 'px'; } });
