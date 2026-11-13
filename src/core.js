'use strict';
/* ---------- Core utilities, persistent store, helpers ---------- */
const R = String.raw;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (n, cls = '') => `<i data-lucide="${n}" class="${cls}" aria-hidden="true"></i>`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const EXPS = []; // filled by content files
const expById = id => EXPS.find(e => e.id === id);

const PHYS = { h: 6.62607015e-34, c: 2.99792458e8, e: 1.602176634e-19, kB: 1.380649e-23, g: 9.80665 };

/* Number formatting */
function fmt(v, d = 3) {
  if (v == null || !isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return sci(v, d);
  return Number(v.toFixed(d)).toString();
}
function fx(v, d = 3) { return (v == null || !isFinite(v)) ? '—' : v.toFixed(d); }
function sci(v, d = 3) {
  if (!isFinite(v)) return '—';
  if (v === 0) return '0';
  const ex = Math.floor(Math.log10(Math.abs(v)));
  const m = v / Math.pow(10, ex);
  return `${m.toFixed(d)} × 10<sup>${ex}</sup>`;
}
function sciTex(v, d = 3) {
  if (!isFinite(v)) return R`\text{—}`;
  if (v === 0) return '0';
  const ex = Math.floor(Math.log10(Math.abs(v)));
  if (ex >= -2 && ex <= 3) return Number(v.toFixed(d)).toString();
  const m = v / Math.pow(10, ex);
  return `${m.toFixed(d)}\\times10^{${ex}}`;
}

/* Linear regression y = m x + c */
function linfit(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; syy += ys[i] * ys[i]; }
  const den = n * sxx - sx * sx;
  if (Math.abs(den) < 1e-30) return null;
  const m = (n * sxy - sx * sy) / den;
  const c = (sy - m * sx) / n;
  const ssTot = syy - sy * sy / n;
  let ssRes = 0;
  for (let i = 0; i < n; i++) ssRes += Math.pow(ys[i] - (m * xs[i] + c), 2);
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 1;
  const Sxx = sxx - sx * sx / n, s2 = n > 2 ? ssRes / (n - 2) : 0;
  return { m, c, r2, n, sm: Sxx > 0 ? Math.sqrt(s2 / Sxx) : 0, sc: Sxx > 0 ? Math.sqrt(s2 * (1 / n + (sx / n) ** 2 / Sxx)) : 0 };
}
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const stdev = a => { if (a.length < 2) return 0; const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
const pctErr = (exp, std) => Math.abs(exp - std) / Math.abs(std) * 100;

/* Wavelength (nm) → CSS rgb, approximate visible spectrum mapping */
function waveRGB(nm, gammaBoost = 1) {
  let r = 0, g = 0, b = 0;
  if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 780) { r = 1; }
  let f = 1;
  if (nm < 380) { r = .55; g = .3; b = 1; f = .7; } // UV shown as violet glow
  else if (nm < 420) f = .3 + .7 * (nm - 380) / 40;
  else if (nm > 700) f = .3 + .7 * (780 - nm) / 80;
  if (nm > 780) { r = .7; g = .1; b = .1; f = .5; }
  const c = x => Math.round(255 * Math.pow(Math.max(0, x * f), .8) * gammaBoost);
  return [clamp(c(r), 0, 255), clamp(c(g), 0, 255), clamp(c(b), 0, 255)];
}
const rgbStr = (a, al = 1) => `rgba(${a[0]},${a[1]},${a[2]},${al})`;

/* Persistent store (localStorage with graceful fallback) */
const STORE_KEY = 'physlab.v1', ACTIVE_KEY = 'physlab.active';
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
function activeProfile() { return lsGet(ACTIVE_KEY) || 'default'; }
function storeKey() { const a = activeProfile(); return a === 'default' ? STORE_KEY : STORE_KEY + ':' + a; }
const DEFAULT_STATE = () => ({
  progress: {}, bookmarks: { exp: [], viva: [], formula: [] }, notes: {}, viva: {}, flash: {},
  quizHistory: [], study: {}, focus: {}, timeByExp: {}, ws: {}, lastVisited: null,
  profile: { name: '', roll: '', branch: '', college: '', goal: 30 }, onboarded: false, seenVersion: '', notifRead: {}, badgeLog: [], lastBackup: 0, plan: null, planDone: {}, checklist: {}, mockHistory: [], errIn: {},
  trainer: { correct: 0, attempts: 0, streak: 0, best: 0 }, graphBest: {}, puzzles: {}, examHistory: [], daily: {}, badges: [], vlab: 0, recordViews: 0,
  ink: { pads: {}, pages: {}, mode: {}, annot: {} },
  exam: { label: 'Physics Practical Exam', date: '' },
  pomo: { work: 25, short: 5, long: 15, sessions: 0, autoNext: true },
  settings: { reduceMotion: false, sound: true, theme: 'dark', penOnly: true, pressure: true, tourAlways: false }, created: Date.now()
});
let memoryStore = null;
const Store = {
  s: null,
  load() {
    let raw = null;
    this.key = storeKey(); this.profileId = activeProfile();
    try { raw = localStorage.getItem(this.key); } catch (e) { raw = memoryStore; }
    let parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { parsed = null; }
    const d = DEFAULT_STATE();
    this.s = parsed ? deepMerge(d, parsed) : d;
    return this.s;
  },
  save() {
    if (this.locked) return; // a profile switch / reset is reloading the page
    const str = JSON.stringify(this.s);
    this.s.savedAt = Date.now();
    try { localStorage.setItem(this.key || storeKey(), str); this.lastWritten = str.length; } catch (e) { memoryStore = str; if (!this.warned && typeof toast === 'function') { this.warned = true; toast('Browser storage is full — export a backup in Settings and delete old handwriting', 'alert-triangle'); } }
  },
  reset(part) {
    const d = DEFAULT_STATE();
    if (!part) this.s = d;
    else if (part === 'progress') { this.s.progress = {}; this.s.viva = {}; this.s.flash = {}; this.s.ws = {}; }
    else this.s[part] = d[part];
    this.save();
  }
};
function deepMerge(base, over) {
  for (const k in over) {
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) base[k] = deepMerge(base[k], over[k]);
    else base[k] = over[k];
  }
  return base;
}
let saveTimer = null;
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(() => Store.save(), 250); }

/* Browser-tab title: the hover tooltip shows the whole line, so it carries the description */
const APP_TITLE = 'PhysLab — Interactive Physics Laboratory | Virtual lab for BTech Engineering Physics practicals: 8 experiments, simulations, viva bank, quizzes and lab records. Works offline.';
const todayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* Bookmarks */
function isBm(type, id) { return Store.s.bookmarks[type].includes(id); }
function toggleBm(type, id) {
  const a = Store.s.bookmarks[type];
  const i = a.indexOf(id);
  if (i >= 0) a.splice(i, 1); else a.push(id);
  Store.save();
  toast(i >= 0 ? 'Bookmark removed' : 'Bookmarked', i >= 0 ? 'bookmark-minus' : 'bookmark-check');
  return i < 0;
}

/* Progress */
const SECTIONS = [
  { k: 'overview', t: 'Overview', i: 'target' },
  { k: 'theory', t: 'Theory & Derivation', i: 'sigma' },
  { k: 'procedure', t: 'Procedure', i: 'list-ordered' },
  { k: 'diagram', t: 'Diagram', i: 'pen-tool' },
  { k: 'simulation', t: 'Simulation', i: 'atom' },
  { k: 'observations', t: 'Observations & Calculation', i: 'table-2' },
  { k: 'workspace', t: 'Workspace', i: 'calculator' },
  { k: 'viva', t: 'Viva', i: 'messages-square' }
];
function expProgress(id) {
  const p = Store.s.progress[id] || {};
  const done = SECTIONS.filter(s => p[s.k]).length;
  return { done, total: SECTIONS.length, pct: Math.round(done / SECTIONS.length * 100) };
}
function setSection(id, k, v) {
  Store.s.progress[id] = Store.s.progress[id] || {};
  Store.s.progress[id][k] = v;
  Store.save();
}
function overallProgress() {
  const t = EXPS.reduce((s, e) => s + expProgress(e.id).done, 0);
  return Math.round(t / (EXPS.length * SECTIONS.length) * 100);
}

/* UI helpers */
function toast(msg, ic = 'check-circle-2') {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = icon(ic) + `<span>${esc(msg)}</span>`;
  $('#toasts').appendChild(t);
  refreshIcons(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 320); }, 2200);
}
function confirmModal(title, msg, okLabel = 'Confirm', danger = true) {
  return new Promise(res => {
    const m = $('#modal');
    m.innerHTML = `<div class="modal-box" role="document"><h3>${esc(title)}</h3><p>${msg}</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-r="0">Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-r="1">${esc(okLabel)}</button></div></div>`;
    m.hidden = false;
    const prev = document.activeElement;
    const close = v => { m.hidden = true; m.innerHTML = ''; document.removeEventListener('keydown', onKey); prev && prev.focus && prev.focus(); res(v); };
    const onKey = e => { if (e.key === 'Escape') close(false); };
    document.addEventListener('keydown', onKey);
    m.onclick = e => { const b = e.target.closest('[data-r]'); if (b) close(b.dataset.r === '1'); else if (e.target === m) close(false); };
    $('[data-r="1"]', m).focus();
  });
}
function refreshIcons(root) {
  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons({ attrs: { 'aria-hidden': 'true' } }); } catch (e) { }
  }
}
function renderMath(el) {
  if (!el) return;
  if (window.renderMathInElement) {
    try {
      renderMathInElement(el, {
        delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }],
        throwOnError: false, strict: false
      });
    } catch (e) { }
  }
}
function tex(s, display = false) {
  if (window.katex) { try { return katex.renderToString(s, { displayMode: display, throwOnError: false, strict: false }); } catch (e) { } }
  return `<code class="mono">${esc(s)}</code>`;
}
function download(name, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function setRangeFill(inp) { const p = (inp.value - inp.min) / (inp.max - inp.min) * 100; inp.style.setProperty('--p', p + '%'); }
function fmtDuration(sec) {
  sec = Math.round(sec);
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function expStyle(e) { return `--exp-color:${e.color};--exp-soft:${hexA(e.color, .14)};--exp-color2:${e.color2};--exp-grad:linear-gradient(90deg,${e.color},${e.color2})`; }
/* Seeded pseudo-random noise for reproducible illustrative data */
function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
