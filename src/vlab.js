/* ---------- Virtual lab measurement panel: live guidance, fine adjustment, record / undo, keyboard ---------- */
const VLAB_UI = {
  newton: {
    ctl: 'cross', label: 'Microscope screw', unit: 'mm', steps: [0.005, 0.05], dp: 3,
    status(st) {
      const lam = st.lam * 1e-9, rn = Math.sqrt(Math.max(0, st.R * (st.n * lam / st.mu - 2 * st.gap * 1e-9))) * 1e3;
      const want = st.vpend && st.vpend.n === st.n ? -st.vpend.side : (st.cross >= 0 ? 1 : -1), target = want * rn, d = st.cross - target;
      const side = want < 0 ? 'left' : 'right', ok = Math.abs(d) <= 0.06;
      const step = st.vpend && st.vpend.n === st.n ? `Step 2 of 2 · ring ${st.n}: ${st.vpend.side < 0 ? 'left' : 'right'} edge noted at ${st.vpend.read.toFixed(3)} cm — now the ${side} edge` : `Step 1 of 2 · put the crosshair on an edge of dark ring ${st.n}`;
      return { step, ok, close: 1 - Math.min(1, Math.abs(d) / 1), text: ok ? `On the ${side} edge of ring ${st.n} — record it` : `Turn the screw ${d > 0 ? 'left (−)' : 'right (+)'} by about ${Math.abs(d).toFixed(3)} mm to reach the ${side} edge of ring ${st.n}`, read: `Microscope reads ${(4.5 + st.cross / 10).toFixed(3)} cm` };
    }
  },
  diffraction: {
    ctl: 'xm', label: 'Pointer on screen', unit: 'mm', steps: [0.05, 0.5], dp: 2,
    status(st) {
      const s = st.ord * st.lam * 1e-9 / (st.a * 1e-3);
      if (s >= 1) return { step: `Minimum n = ${st.ord}`, ok: false, close: 0, text: 'This order does not exist for this slit — choose a lower order', read: '' };
      const xn = st.D * Math.tan(Math.asin(s)) * 1e3, want = st.vpend && st.vpend.n === st.ord ? -Math.sign(st.vpend.x) : (st.xm >= 0 ? 1 : -1), d = st.xm - want * xn, tol = Math.max(0.3, xn * 0.04), ok = Math.abs(d) <= tol, side = want < 0 ? 'left' : 'right';
      const step = st.vpend && st.vpend.n === st.ord ? `Step 2 of 2 · minimum n = ${st.ord}: first mark at ${st.vpend.x.toFixed(2)} mm — now the ${side} side` : `Step 1 of 2 · move the pointer onto dark minimum n = ${st.ord}`;
      return { step, ok, close: 1 - Math.min(1, Math.abs(d) / 8), text: ok ? `On the ${side} minimum n = ${st.ord} — record it` : `Move the pointer ${d > 0 ? 'left (−)' : 'right (+)'} by about ${Math.abs(d).toFixed(2)} mm`, read: `x = ${st.xm.toFixed(2)} mm, D = ${st.D.toFixed(2)} m` };
    }
  },
  led: { ctl: 'Vs', label: 'Supply voltage', unit: 'V', steps: [0.01, 0.1], dp: 2, status(st) { const m = ledModel(st), ok = m.I <= 0.03; return { step: 'Set the supply, read both meters, record. Take several readings near the knee.', ok, close: ok ? 1 : 0, text: ok ? 'Meters steady — record this reading' : 'Current above 30 mA — lower the supply', read: `V = ${m.V.toFixed(2)} V · I = ${(m.I * 1e3).toFixed(1)} mA` }; } },
  diode: { ctl: 'V', label: 'Applied bias', unit: 'V', steps: [0.01, 0.1], dp: 2, status(st) { const I = diodeI(st.V, st.T), ok = !(st.V >= 0 && I > 0.03); return { step: 'Forward bias (V > 0) fills the forward table; reverse bias (V < 0) fills the reverse table.', ok, close: ok ? 1 : 0, text: ok ? `Record into the ${st.V >= 0 ? 'forward' : 'reverse'} table` : 'Forward current above 30 mA — reduce the bias', read: st.V >= 0 ? `V = ${st.V.toFixed(2)} V · I = ${(I * 1e3).toFixed(2)} mA` : `V = ${Math.abs(st.V).toFixed(1)} V · I = ${(Math.abs(I) * 1e6).toFixed(2)} µA` }; } },
  photo: {
    ctl: 'V', label: 'Anode potential', unit: 'V', steps: [0.01, 0.1], dp: 2, nudgeText: ['Retard more', 'Retard less'],
    status(st) {
      const m = photoModel(st), V0 = m.V0, step = `Filter λ = ${st.lam} nm · raise the retarding potential until the current just becomes zero`;
      if (m.K <= 0) return { step, ok: false, close: 0, text: 'No photoemission at this wavelength — choose a shorter wavelength', read: '' };
      if (st.V >= 0) return { step, ok: false, close: 0, text: 'Make the anode negative (use “Retard more”)', read: `I = ${m.I.toFixed(3)} µA` };
      if (m.I > 0.004) return { step, ok: false, close: Math.max(0, 1 - m.I / m.Isat), text: 'Current still flowing — increase the retarding potential', read: `V = ${st.V.toFixed(2)} V · I = ${m.I.toFixed(3)} µA` };
      if (-st.V > V0 + 0.05) return { step, ok: false, close: .6, text: 'Past the stopping point — reduce the retarding potential', read: `V = ${st.V.toFixed(2)} V · I = 0.000 µA` };
      return { step, ok: true, close: 1, text: 'Current has just become zero — record V₀', read: `V₀ = ${(-st.V).toFixed(2)} V` };
    }
  },
  pendulum: {
    ctl: 'l', label: 'Pivot hole (distance from G)', unit: 'cm', steps: [1, 5], dp: 0,
    status(st) {
      const step = `Side ${+st.side > 0 ? 'A (+l)' : 'B (−l)'} · l = ${st.l} cm · let it swing, then time 20 oscillations`;
      if (!st.playing) return { step, ok: false, close: 0, text: 'Press Play to start the oscillations', read: '' };
      if (st.amp > 10) return { step, ok: false, close: .3, text: 'Amplitude above 10° — reduce it below 5° for SHM', read: '' };
      if (!st.Tm || st.n < 2) return { step, ok: false, close: (st.n || 0) / 2, text: `Settling… ${st.n || 0} / 2 oscillations counted`, read: '' };
      return { step, ok: true, close: 1, text: 'Steady oscillations — record the time for 20', read: `T ≈ ${st.Tm.toFixed(3)} s → t₂₀ ≈ ${(20 * st.Tm).toFixed(2)} s` };
    }
  },
  solar: { ctl: 'R', label: 'Load resistance', unit: 'Ω', steps: [0.1, 1], dp: 1, status(st) { const m = solarModel(st); return { step: 'Vary the load from small (short circuit) to large (open circuit); record V and I each time.', ok: true, close: 1, text: 'Record this load setting', read: `V = ${m.V.toFixed(3)} V · I = ${(m.I * 1e3).toFixed(1)} mA` }; } },
  sonometer: {
    ctl: 'l', label: 'Bridge separation', unit: 'cm', steps: [0.1, 1], dp: 1,
    status(st) {
      const m = sonoModel(st), ok = m.p === 1 && m.amp > .5, step = `Load M = ${st.M.toFixed(1)} kg · fork ${m.ff} Hz · slide the bridge to resonance`;
      return { step, ok, close: Math.min(1, m.amp), text: ok ? 'Resonance — the rider flies off. Record l.' : (m.f0 > m.ff ? 'Natural frequency too high — increase l' : 'Natural frequency too low — decrease l'), read: `l = ${st.l.toFixed(1)} cm · f₀ = ${m.f0.toFixed(1)} Hz` };
    }
  }
};

function vlabRecord(id, st) {
  const r = VLAB[id].rec(st);
  st.vlog = st.vlog || [];
  if (typeof r === 'string') { vlabFlash(id, r, false); return; }
  if (r.msg) { vlabFlash(id, r.msg, true); vlabPanelUpdate(); return; }
  const n = wsAddRow(id, r.tk, r.row, r.params);
  const cols = WS[id].tables.find(t => t.k === r.tk).cols;
  st.vlog.unshift({ tk: r.tk, n, row: r.row, text: cols.map(c => `${c.label.replace(/\s*\(.*\)/, '')} ${r.row[c.k]}`).join(' · ') });
  vlabFlash(id, `Saved to workspace${WS[id].tables.length > 1 ? ` (${WS[id].tables.find(t => t.k === r.tk).title.toLowerCase()})` : ''}, row ${n}`, true);
  const c = $('#vlabCount'); if (c) c.textContent = vlabCount(id);
  vlabPanelUpdate();
}
function vlabUndo(id, st) {
  const e = (st.vlog || []).shift(); if (!e) return;
  const w = Store.s.ws[id], row = w && w.tables[e.tk][e.n - 1];
  if (row && Object.keys(e.row).every(k => String(row[k]) === String(e.row[k]))) { Object.keys(row).forEach(k => row[k] = ''); Store.save(); vlabFlash(id, `Removed row ${e.n} from the workspace`, true); }
  else vlabFlash(id, 'That row was already changed in the workspace', false);
  const c = $('#vlabCount'); if (c) c.textContent = vlabCount(id);
  vlabPanelUpdate();
}
function vlabFlash(id, msg, good) {
  const el = $('#vlMsg'); if (el) { el.textContent = msg; el.className = 'vl-msg ' + (good ? 'good' : 'bad'); clearTimeout(el._t); el._t = setTimeout(() => { el.textContent = ''; el.className = 'vl-msg'; }, 4500); }
  toast(msg, good ? 'clipboard-check' : 'alert-circle');
}
function vlabNudge(dir, coarse) {
  if (!activeSim || !VLAB_UI[activeSim.id]) return;
  const ui = VLAB_UI[activeSim.id], st = activeSim.st, c = activeSim.def.controls.find(x => x.k === ui.ctl); if (!c) return;
  const step = ui.steps[coarse ? 1 : 0] * dir;
  st[ui.ctl] = clamp(Math.round((st[ui.ctl] + step) / Math.abs(ui.steps[0])) * Math.abs(ui.steps[0]), c.min, c.max);
  st[ui.ctl] = +st[ui.ctl].toFixed(6);
  activeSim.sync(); st.dirty = true;
  if (ui.ctl === 'l' && activeSim.id === 'pendulum' && activeSim.def.onChange) activeSim.def.onChange(st, 'l');
  vlabPanelUpdate();
}
function vlabPanelHtml(id) {
  const ui = VLAB_UI[id], nt = ui.nudgeText || ['', ''];
  return `<div class="card vlab-card" id="vlPanel"><h3 style="font-size:14px;margin-bottom:10px">${icon('flask-conical')} Virtual lab — take readings</h3>
    <div class="vl-step" id="vlStep"></div>
    <div class="vl-status" id="vlStatus"><span class="vl-dot"></span><span id="vlText"></span></div>
    <div class="vl-meter"><i id="vlMeter"></i></div>
    <div class="mono vl-read" id="vlRead"></div>
    <div class="vl-nudge"><span>${ui.label}</span><div class="row" style="gap:4px;flex-wrap:nowrap">
      <button class="icon-btn" data-nd="-1" data-co="1" aria-label="Coarse decrease" title="${nt[0] || 'Coarse −'} (Shift+[)">${icon('chevrons-left')}</button>
      <button class="icon-btn" data-nd="-1" aria-label="Fine decrease" title="${nt[0] || 'Fine −'} ([)">${icon('chevron-left')}</button>
      <b class="mono" id="vlVal"></b>
      <button class="icon-btn" data-nd="1" aria-label="Fine increase" title="${nt[1] || 'Fine +'} (])">${icon('chevron-right')}</button>
      <button class="icon-btn" data-nd="1" data-co="1" aria-label="Coarse increase" title="${nt[1] || 'Coarse +'} (Shift+])">${icon('chevrons-right')}</button></div></div>
    <div class="row" style="gap:8px;margin-top:10px"><button class="btn primary" id="vlRec" style="flex:1;justify-content:center">${icon('clipboard-plus')} Record reading <kbd>R</kbd></button><button class="btn" id="vlUndo" title="Undo last saved reading">${icon('undo-2')}</button></div>
    <div class="vl-msg" id="vlMsg" aria-live="polite"></div>
    <div class="vl-log" id="vlLog"></div>
    <p class="dim" style="font-size:11.5px;margin:8px 0 0">Keys: <kbd>[</kbd> <kbd>]</kbd> fine adjust · hold <kbd>Shift</kbd> for coarse · <kbd>R</kbd> record</p></div>`;
}
function vlabPanelUpdate() {
  if (!activeSim || !VLAB_UI[activeSim.id] || !$('#vlPanel')) return;
  const id = activeSim.id, ui = VLAB_UI[id], st = activeSim.st, s = ui.status(st);
  $('#vlStep').textContent = s.step; $('#vlText').textContent = s.text; $('#vlRead').textContent = s.read || '';
  $('#vlStatus').className = 'vl-status ' + (s.ok ? 'ok' : 'wait');
  $('#vlMeter').style.width = Math.round(Math.max(0, Math.min(1, s.close)) * 100) + '%';
  $('#vlMeter').style.background = s.ok ? 'var(--green)' : 'var(--amber)';
  $('#vlRec').classList.toggle('ready', !!s.ok);
  $('#vlVal').textContent = `${(+st[ui.ctl]).toFixed(ui.dp)} ${ui.unit}`;
  const log = st.vlog || [];
  $('#vlLog').innerHTML = log.length ? `<div class="dim" style="font-size:11.5px;margin-bottom:4px">Saved this session</div>${log.slice(0, 5).map(e => `<div class="vl-row"><span class="tag">row ${e.n}</span><span>${esc(e.text)}</span></div>`).join('')}` : '';
}
(function installVlabPanel() {
  Object.keys(VLAB_UI).forEach(id => {
    const def = SIMS[id]; if (!def) return;
    const b = def.buttons.find(x => x.label === 'Record reading'); if (b) b.fn = st => vlabRecord(id, st);
    def.afterMount = (host, st) => {
      const panel = $('.sim-panel', host); if (!panel) return;
      panel.insertAdjacentHTML('afterbegin', vlabPanelHtml(id)); refreshIcons();
      $$('#vlPanel [data-nd]').forEach(btn => btn.onclick = () => vlabNudge(+btn.dataset.nd, !!btn.dataset.co));
      $('#vlRec').onclick = () => vlabRecord(id, st);
      $('#vlUndo').onclick = () => vlabUndo(id, st);
      st._vlTimer = setInterval(vlabPanelUpdate, 150); vlabPanelUpdate();
    };
    def.onDestroy = st => clearInterval(st && st._vlTimer);
  });
  document.addEventListener('keydown', e => {
    if (!activeSim || !VLAB_UI[activeSim.id] || !$('#vlPanel') || $('#tour') || !$('#modal').hidden) return;
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && e.target.type !== 'range') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '[' || e.key === '{') { e.preventDefault(); vlabNudge(-1, e.shiftKey || e.key === '{'); }
    else if (e.key === ']' || e.key === '}') { e.preventDefault(); vlabNudge(1, e.shiftKey || e.key === '}'); }
    else if (e.key.toLowerCase() === 'r' && !/INPUT|TEXTAREA/.test(e.target.tagName)) { e.preventDefault(); vlabRecord(activeSim.id, activeSim.st); }
  });
})();
/* Toasts must be visible in full-screen mode too */
document.addEventListener('fullscreenchange', () => {
  const t = $('#toasts'), fs = document.fullscreenElement;
  if (t) (fs || document.body).appendChild(t);
});
