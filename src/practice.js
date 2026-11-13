/* ---------- Practice tools: instrument reading trainer, virtual experiment mode, graph plotting practice, derivation puzzles ---------- */
const rndIn = (a, b) => a + Math.random() * (b - a);
const roundTo = (v, step) => Math.round(v / step) * step;
const noise = s => (Math.random() - .5) * 2 * s;

/* =====================================================================
   1. INSTRUMENT READING TRAINER
   ===================================================================== */
const INSTR = {
  vernier: {
    name: 'Vernier calipers', icon: 'ruler', unit: 'cm', dp: 2, lc: 0.01,
    about: 'Main scale in mm. 10 vernier divisions = 9 main-scale divisions, so LC = 1 MSD − 1 VSD = 1 mm − 0.9 mm = 0.1 mm = 0.01 cm.',
    gen(zero) { const mm = roundTo(rndIn(8, 92), 0.1); return { mm, zero: zero ? Math.round(rndIn(-5, 5)) || 3 : 0 }; },
    value: q => q.mm / 10,
    svg(q, reveal) {
      const R = q.mm, s = 24, cx = 300, X = v => cx + (v - R) * s;
      const msr = Math.floor(R + 1e-9), vc = Math.round((R - msr) * 10) % 10;
      let o = `<rect x="0" y="40" width="900" height="56" fill="#cbd5e1" rx="4"/><rect x="${X(R) - 4}" y="96" width="${10 * 0.9 * s + 30}" height="52" fill="#94a3b8" rx="4"/>`;
      for (let m = Math.floor(R - 12); m <= R + 26; m++) { if (m < 0) continue; const x = X(m), L = m % 10 === 0 ? 34 : m % 5 === 0 ? 24 : 15; o += `<line x1="${x}" y1="96" x2="${x}" y2="${96 - L}" stroke="#0f172a" stroke-width="1.4"/>`; if (m % 10 === 0) o += `<text x="${x}" y="56" font-size="15" text-anchor="middle" fill="#0f172a" font-weight="700">${m / 10}</text>`; }
      for (let k = 0; k <= 10; k++) { const x = X(R + 0.9 * k), L = k % 5 === 0 ? 26 : 16, hit = reveal && k === vc; o += `<line x1="${x}" y1="96" x2="${x}" y2="${96 + L}" stroke="${hit ? '#16a34a' : '#0f172a'}" stroke-width="${hit ? 3 : 1.4}"/>`; if (k % 5 === 0) o += `<text x="${x}" y="140" font-size="13" text-anchor="middle" fill="#0f172a" font-weight="600">${k}</text>`; }
      if (reveal) o += `<line x1="${X(msr)}" y1="40" x2="${X(msr)}" y2="96" stroke="#2563eb" stroke-width="3"/>`;
      o += `<text x="20" y="30" font-size="13" fill="#94a3b8">Main scale (cm, 1 MSD = 1 mm)</text><text x="20" y="172" font-size="13" fill="#94a3b8">Vernier scale (10 divisions)</text>`;
      return `<svg viewBox="0 0 900 185" class="instr-svg">${o}</svg>`;
    },
    explain(q) { const msr = Math.floor(q.mm + 1e-9), vc = Math.round((q.mm - msr) * 10) % 10, obs = q.mm / 10; return { obs, steps: [`Main scale reading (MSR) = last main-scale mark before vernier zero = <b>${msr} mm = ${(msr / 10).toFixed(1)} cm</b>`, `Vernier coincidence (VC) = division <b>${vc}</b> lines up exactly with a main-scale mark`, `Observed reading = MSR + VC × LC = ${(msr / 10).toFixed(1)} + ${vc} × 0.01 = <b>${obs.toFixed(2)} cm</b>`] }; }
  },
  screw: {
    name: 'Screw gauge', icon: 'disc', unit: 'mm', dp: 2, lc: 0.01,
    about: 'Pitch = 0.5 mm (sleeve marks every 0.5 mm: whole mm above the line, half mm below). Circular scale has 50 divisions, so LC = pitch / divisions = 0.5 / 50 = 0.01 mm.',
    gen(zero) { const psr = roundTo(rndIn(2, 22), 0.5), csr = Math.floor(rndIn(0, 50)); return { psr, csr, zero: zero ? (Math.round(rndIn(-6, 6)) || 4) : 0 }; },
    value: q => q.psr + q.csr * 0.01,
    svg(q, reveal) {
      const R = q.psr + q.csr * 0.01, s = 34, ex = 560, X = v => ex + (v - R) * s, y = 100;
      let o = `<rect x="40" y="${y - 32}" width="${ex - 40}" height="64" fill="#cbd5e1"/><line x1="40" y1="${y}" x2="${ex}" y2="${y}" stroke="#0f172a" stroke-width="1.6"/>`;
      for (let v = Math.ceil((R - 14) * 2) / 2; v <= R + 1e-9; v += 0.5) { if (v < 0) continue; const x = X(v), whole = Math.abs(v - Math.round(v)) < 1e-6; o += `<line x1="${x}" y1="${y}" x2="${x}" y2="${whole ? y - 18 : y + 14}" stroke="#0f172a" stroke-width="1.6"/>`; if (whole && Math.round(v) % 5 === 0) o += `<text x="${x}" y="${y - 22}" font-size="13" text-anchor="middle" fill="#0f172a" font-weight="700">${Math.round(v)}</text>`; }
      o += `<rect x="${ex}" y="${y - 70}" width="220" height="140" rx="8" fill="#94a3b8"/><rect x="${ex}" y="${y - 70}" width="14" height="140" fill="#64748b"/>`;
      for (let d = -7; d <= 7; d++) { const j = ((q.csr + d) % 50 + 50) % 50, yy = y - d * 9, L = j % 5 === 0 ? 22 : 12, hit = reveal && d === 0; o += `<line x1="${ex}" y1="${yy}" x2="${ex + L}" y2="${yy}" stroke="${hit ? '#16a34a' : '#0f172a'}" stroke-width="${hit ? 3 : 1.4}"/>`; if (j % 5 === 0) o += `<text x="${ex + 28}" y="${yy + 4}" font-size="12" fill="#0f172a" font-weight="600">${j}</text>`; }
      if (reveal) o += `<line x1="${X(q.psr)}" y1="${y - 30}" x2="${X(q.psr)}" y2="${y + 30}" stroke="#2563eb" stroke-width="3"/>`;
      o += `<text x="40" y="28" font-size="13" fill="#94a3b8">Sleeve (pitch scale): mm above the line, half-mm below</text><text x="${ex + 60}" y="${y + 92}" font-size="13" fill="#94a3b8">Thimble (circular scale)</text>`;
      return `<svg viewBox="0 0 900 200" class="instr-svg">${o}</svg>`;
    },
    explain(q) { const obs = q.psr + q.csr * 0.01; return { obs, steps: [`Pitch scale reading (PSR) = last visible sleeve mark = <b>${q.psr.toFixed(1)} mm</b>${Math.abs(q.psr % 1 - .5) < 1e-6 ? ' (a half-mm mark below the line is visible)' : ''}`, `Circular scale reading (CSR) = thimble division on the reference line = <b>${q.csr}</b>`, `Observed reading = PSR + CSR × LC = ${q.psr.toFixed(1)} + ${q.csr} × 0.01 = <b>${obs.toFixed(2)} mm</b>`] }; }
  },
  microscope: {
    name: 'Travelling microscope', icon: 'microscope', unit: 'cm', dp: 3, lc: 0.001,
    about: '1 MSD = 0.5 mm = 0.05 cm. 50 vernier divisions = 49 MSD, so LC = 1 MSD / 50 = 0.05 / 50 = 0.001 cm.',
    gen() { const mm = roundTo(rndIn(20, 140), 0.01); return { mm, zero: 0 }; },
    value: q => q.mm / 10,
    svg(q, reveal) {
      const R = q.mm, s = 32, x0 = 70, X = v => x0 + (v - R) * s;
      const msr = Math.floor(R * 2 + 1e-9) / 2, vc = Math.round((R - msr) * 100);
      let o = `<rect x="0" y="40" width="900" height="56" fill="#cbd5e1" rx="4"/><rect x="${x0 - 10}" y="96" width="${49 * 0.5 * s + 20}" height="58" fill="#94a3b8" rx="4"/>`;
      for (let v = Math.ceil((R - 2) * 2) / 2; v <= R + 26; v += 0.5) { const x = X(v), mmI = Math.round(v * 2) / 2, L = Math.abs(mmI % 10) < 1e-6 ? 34 : Math.abs(mmI % 5) < 1e-6 ? 26 : Math.abs(mmI % 1) < 1e-6 ? 18 : 12; o += `<line x1="${x}" y1="96" x2="${x}" y2="${96 - L}" stroke="#0f172a" stroke-width="1.2"/>`; if (Math.abs(mmI % 10) < 1e-6) o += `<text x="${x}" y="56" font-size="15" text-anchor="middle" fill="#0f172a" font-weight="700">${mmI / 10}</text>`; }
      for (let k = 0; k <= 50; k++) { const x = X(R + 0.49 * k), L = k % 10 === 0 ? 28 : k % 5 === 0 ? 20 : 12, hit = reveal && k === vc; o += `<line x1="${x}" y1="96" x2="${x}" y2="${96 + L}" stroke="${hit ? '#16a34a' : '#0f172a'}" stroke-width="${hit ? 3 : 1.1}"/>`; if (k % 10 === 0) o += `<text x="${x}" y="146" font-size="12" text-anchor="middle" fill="#0f172a" font-weight="600">${k}</text>`; }
      if (reveal) o += `<line x1="${X(msr)}" y1="40" x2="${X(msr)}" y2="96" stroke="#2563eb" stroke-width="3"/>`;
      o += `<text x="20" y="30" font-size="13" fill="#94a3b8">Main scale (cm, 1 MSD = 0.5 mm)</text><text x="20" y="176" font-size="13" fill="#94a3b8">Vernier scale (50 divisions)</text>`;
      return `<svg viewBox="0 0 900 190" class="instr-svg">${o}</svg>`;
    },
    explain(q) { const msr = Math.floor(q.mm * 2 + 1e-9) / 2, vc = Math.round((q.mm - msr) * 100), obs = q.mm / 10; return { obs, steps: [`Main scale reading = last 0.5 mm mark before vernier zero = <b>${msr.toFixed(1)} mm = ${(msr / 10).toFixed(2)} cm</b>`, `Vernier coincidence = division <b>${vc}</b>`, `Reading = MSR + VC × LC = ${(msr / 10).toFixed(2)} + ${vc} × 0.001 = <b>${obs.toFixed(3)} cm</b>`] }; }
  },
  stopwatch: {
    name: 'Stopwatch', icon: 'timer', unit: 's', dp: 1, lc: 0.2,
    about: 'Big hand: 1 revolution = 30 s, 150 divisions, so LC = 30 / 150 = 0.2 s. Small dial counts completed half-minutes (1 revolution = 15 min).',
    gen() { return { t: roundTo(rndIn(12, 880), 0.2), zero: 0 }; },
    value: q => q.t,
    svg(q, reveal) {
      const cx = 450, cy = 110, R = 95, big = (q.t % 30) / 30 * 360, small = (q.t / 900) * 360;
      let o = `<circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="#e2e8f0" stroke="#64748b" stroke-width="4"/><rect x="${cx - 12}" y="${cy - R - 26}" width="24" height="14" rx="3" fill="#64748b"/>`;
      for (let i = 0; i < 150; i++) { const a = i / 150 * 2 * Math.PI, L = i % 25 === 0 ? 14 : i % 5 === 0 ? 9 : 5; o += `<line x1="${cx + Math.sin(a) * R}" y1="${cy - Math.cos(a) * R}" x2="${cx + Math.sin(a) * (R - L)}" y2="${cy - Math.cos(a) * (R - L)}" stroke="#0f172a" stroke-width="${i % 5 === 0 ? 1.4 : .8}"/>`; if (i % 25 === 0) o += `<text x="${cx + Math.sin(a) * (R - 26)}" y="${cy - Math.cos(a) * (R - 26) + 5}" font-size="13" text-anchor="middle" fill="#0f172a" font-weight="700">${i / 5}</text>`; }
      const sx = cx, sy = cy + 38, r2 = 24;
      o += `<circle cx="${sx}" cy="${sy}" r="${r2}" fill="#f8fafc" stroke="#94a3b8"/>`;
      for (let i = 0; i < 30; i++) { const a = i / 30 * 2 * Math.PI; o += `<line x1="${sx + Math.sin(a) * r2}" y1="${sy - Math.cos(a) * r2}" x2="${sx + Math.sin(a) * (r2 - (i % 2 ? 3 : 6))}" y2="${sy - Math.cos(a) * (r2 - (i % 2 ? 3 : 6))}" stroke="#0f172a" stroke-width=".8"/>`; }
      [0, 5, 10].forEach((m, i) => { const a = m / 15 * 2 * Math.PI; o += `<text x="${sx + Math.sin(a) * (r2 - 12)}" y="${sy - Math.cos(a) * (r2 - 12) + 3}" font-size="8" text-anchor="middle" fill="#0f172a">${m}</text>`; });
      o += `<line x1="${sx}" y1="${sy}" x2="${sx + Math.sin(small * Math.PI / 180) * (r2 - 4)}" y2="${sy - Math.cos(small * Math.PI / 180) * (r2 - 4)}" stroke="#dc2626" stroke-width="2"/>`;
      o += `<line x1="${cx - Math.sin(big * Math.PI / 180) * 16}" y1="${cy + Math.cos(big * Math.PI / 180) * 16}" x2="${cx + Math.sin(big * Math.PI / 180) * (R - 4)}" y2="${cy - Math.cos(big * Math.PI / 180) * (R - 4)}" stroke="${reveal ? '#16a34a' : '#0f172a'}" stroke-width="2.4"/><circle cx="${cx}" cy="${cy}" r="5" fill="#0f172a"/>`;
      o += `<text x="80" y="60" font-size="13" fill="#94a3b8">Big dial: seconds (0–30)</text><text x="80" y="80" font-size="13" fill="#94a3b8">Small dial: minutes (0–15)</text>`;
      return `<svg viewBox="0 0 900 225" class="instr-svg">${o}</svg>`;
    },
    explain(q) { const half = Math.floor(q.t / 30), sec = q.t - half * 30; return { obs: q.t, steps: [`Small dial: <b>${half}</b> completed half-minutes = ${half * 30} s (${(half / 2).toFixed(1)} min)`, `Big hand: <b>${sec.toFixed(1)} s</b> (each small division = 0.2 s)`, `Time = ${half * 30} + ${sec.toFixed(1)} = <b>${q.t.toFixed(1)} s</b>`] }; }
  }
};
let TR = null;
VIEWS.trainer = () => `<div class="page-head"><div><span class="eyebrow">Practice</span><h1>Instrument Reading Trainer</h1><p>Read real-looking scales of the instruments used in the lab. Find the main-scale reading, the coinciding division and apply the least count — then check yourself.</p></div><div class="row"><span class="tag green" id="trScore"></span></div></div>
  <div class="row" style="margin-bottom:16px" id="trTabs">${Object.entries(INSTR).map(([k, v]) => `<button class="chip" data-in="${k}">${icon(v.icon)} ${v.name}</button>`).join('')}</div>
  <div class="card pad-lg" id="trCard"></div>`;
function mountTrainer(params) {
  TR = { k: params.get('i') || 'vernier', zero: false };
  $('#trTabs').onclick = e => { const b = e.target.closest('[data-in]'); if (!b) return; TR.k = b.dataset.in; trNew(); };
  trNew();
}
function trScore() { const s = Store.s.trainer; $('#trScore').textContent = `${s.correct} correct · streak ${s.streak} · best ${s.best}`; }
function trNew() {
  const I = INSTR[TR.k]; TR.q = I.gen(TR.zero && (TR.k === 'vernier' || TR.k === 'screw')); TR.done = false;
  $$('#trTabs .chip').forEach(c => c.classList.toggle('on', c.dataset.in === TR.k));
  const z = TR.q.zero, zeroTxt = z ? (TR.k === 'vernier' ? `With the jaws closed, vernier zero lies <b>${Math.abs(z)} division${Math.abs(z) > 1 ? 's' : ''} ${z > 0 ? 'to the right of' : 'to the left of'}</b> main-scale zero — zero error = <b>${z > 0 ? '+' : '−'}${(Math.abs(z) * 0.01).toFixed(2)} cm</b>.` : `With the anvils touching, the circular scale reads <b>${z > 0 ? z + ' divisions above' : -z + ' divisions below'}</b> zero — zero error = <b>${z > 0 ? '+' : '−'}${(Math.abs(z) * 0.01).toFixed(2)} mm</b>.`) : '';
  $('#trCard').innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">${icon(I.icon)} ${I.name}</h3><div class="row"><span class="tag violet">LC = ${I.lc} ${I.unit}</span>${(TR.k === 'vernier' || TR.k === 'screw') ? `<label class="row" style="font-size:13px;cursor:pointer;gap:6px"><input type="checkbox" id="trZero" ${TR.zero ? 'checked' : ''}> Include zero error</label>` : ''}</div></div>
    <p class="muted" style="font-size:13.5px;margin-top:0">${I.about}</p>
    <div class="instr-wrap" id="trSvg">${I.svg(TR.q, false)}</div>
    ${zeroTxt ? `<div class="callout amber" style="font-size:13.5px">${zeroTxt} Enter the <b>corrected</b> reading = observed − zero error.</div>` : ''}
    <div class="row" style="margin-top:14px"><div class="field" style="flex:1;min-width:200px"><label for="trAns">Your reading (${I.unit}, ${I.dp} decimal places)</label><input class="input mono" id="trAns" type="number" step="any" inputmode="decimal" placeholder="e.g. ${(I.value(I.gen(false))).toFixed(I.dp)}"></div>
    <button class="btn primary" id="trCheck" style="align-self:flex-end">${icon('check')} Check</button><button class="btn" id="trNext" style="align-self:flex-end">${icon('refresh-cw')} New reading</button></div>
    <div id="trOut" style="margin-top:14px"></div>`;
  refreshIcons(); trScore();
  const z0 = $('#trZero'); if (z0) z0.onchange = () => { TR.zero = z0.checked; trNew(); };
  $('#trCheck').onclick = trCheck; $('#trNext').onclick = trNew;
  $('#trAns').onkeydown = e => { if (e.key === 'Enter') TR.done ? trNew() : trCheck(); };
  $('#trAns').focus({ preventScroll: true });
}
function trCheck() {
  if (TR.done) return;
  const I = INSTR[TR.k], a = parseFloat($('#trAns').value);
  if (!isFinite(a)) return toast('Type your reading first', 'alert-circle');
  const ex = I.explain(TR.q), zeroVal = TR.q.zero * 0.01, correct = ex.obs - zeroVal, ok = Math.abs(a - correct) < I.lc / 2 + 1e-9;
  TR.done = true; const s = Store.s.trainer; s.attempts++;
  if (ok) { s.correct++; s.streak++; s.best = Math.max(s.best, s.streak); } else s.streak = 0;
  Store.save();
  $('#trSvg').innerHTML = I.svg(TR.q, true);
  $('#trOut').innerHTML = `<div class="${ok ? 'result-box' : 'callout amber'}" style="${ok ? '' : 'margin:0'}"><b>${ok ? '✓ Correct!' : `✗ Not quite — you entered ${a}`}</b><ol style="margin:8px 0 0;padding-left:20px;font-size:14px">${ex.steps.map(x => `<li>${x}</li>`).join('')}${zeroVal ? `<li>Corrected = observed − zero error = ${ex.obs.toFixed(I.dp)} − (${zeroVal > 0 ? '+' : ''}${zeroVal.toFixed(2)}) = <b>${correct.toFixed(I.dp)} ${I.unit}</b></li>` : ''}</ol><p class="dim" style="font-size:12.5px;margin:8px 0 0">Green = coinciding division; blue = main-scale reading. Press Enter for a new reading.</p></div>`;
  trScore(); if (ok && s.streak && s.streak % 5 === 0) { toast(`${s.streak} in a row!`, 'flame'); confetti(); }
}

/* =====================================================================
   2. VIRTUAL EXPERIMENT MODE — record readings from simulations into the workspace
   ===================================================================== */
function wsAddRow(id, tk, row, params) {
  const cfg = WS[id], st = wsState(id), tbl = st.tables[tk], t = cfg.tables.find(x => x.k === tk);
  if (params) Object.entries(params).forEach(([k, v]) => st.params[k] = String(v));
  const strRow = Object.fromEntries(t.cols.map(c => [c.k, row[c.k] == null ? '' : String(row[c.k])]));
  const empty = tbl.findIndex(r => t.cols.every(c => r[c.k] === '' || r[c.k] == null));
  let n; if (empty >= 0) { tbl[empty] = strRow; n = empty + 1; } else { tbl.push(strRow); n = tbl.length; }
  Store.s.vlab = (Store.s.vlab || 0) + 1; Store.save();
  return n;
}
function vlabDone(id, n, extra = '') { toast(`Reading saved to workspace row ${n}${extra}`, 'clipboard-check'); const c = $('#vlabCount'); if (c) c.textContent = vlabCount(id); }
function vlabCount(id) { const w = Store.s.ws[id]; if (!w) return '0 readings in workspace'; const n = Object.values(w.tables).reduce((s, rows) => s + rows.filter(r => Object.values(r).some(v => v !== '' && v != null)).length, 0); return `${n} reading${n === 1 ? '' : 's'} in workspace`; }
const VLAB = {
  newton: {
    help: 'Turn the microscope screw to put the crosshair on the <b>left</b> edge of dark ring n and record, then on the <b>right</b> edge and record again. Microscope zero is at 4.500 cm.',
    rec(st) {
      const lam = st.lam * 1e-9, rn = Math.sqrt(Math.max(0, st.R * (st.n * lam / st.mu - 2 * st.gap * 1e-9))) * 1e3, x = st.cross, read = +(4.5 + x / 10).toFixed(3);
      if (Math.abs(Math.abs(x) - rn) > 0.06) return `The crosshair is ${Math.abs(Math.abs(x) - rn).toFixed(2)} mm away from dark ring ${st.n}. Fine-tune the screw.`;
      if (!st.vpend || st.vpend.n !== st.n) { st.vpend = { n: st.n, side: Math.sign(x), read }; return { msg: `${x < 0 ? 'Left' : 'Right'} reading ${read.toFixed(3)} cm noted for ring ${st.n} — now go to the other side.` }; }
      if (Math.sign(x) === st.vpend.side) return 'Now set the crosshair on the opposite side of the same ring.';
      const L = st.vpend.side < 0 ? st.vpend.read : read, Rr = st.vpend.side < 0 ? read : st.vpend.read; st.vpend = null;
      return { tk: 't', row: { n: st.n, L: L.toFixed(3), Rr: Rr.toFixed(3) }, params: { R: st.R.toFixed(2) } };
    }
  },
  diffraction: {
    help: 'Drag the pointer onto the n-th <b>dark minimum</b> on one side and record, then onto the same minimum on the other side. The distance between them (2xₙ) goes into the table.',
    rec(st) {
      const s = st.ord * st.lam * 1e-9 / (st.a * 1e-3); if (s >= 1) return 'That order does not exist for this slit — choose a lower order.';
      const xn = st.D * Math.tan(Math.asin(s)) * 1e3, x = st.xm;
      if (Math.abs(Math.abs(x) - xn) > Math.max(0.3, xn * 0.04)) return `The pointer is not on minimum n = ${st.ord} (off by ${Math.abs(Math.abs(x) - xn).toFixed(2)} mm).`;
      if (!st.vpend || st.vpend.n !== st.ord) { st.vpend = { n: st.ord, x }; return { msg: `Marked x = ${x.toFixed(2)} mm — now mark the same minimum on the other side.` }; }
      if (Math.sign(x) === Math.sign(st.vpend.x)) return 'Mark the same order on the opposite side of the centre.';
      const X = Math.abs(x - st.vpend.x); st.vpend = null;
      return { tk: 't', row: { n: st.ord, D: st.D.toFixed(2), X: X.toFixed(2) }, params: { a: st.a.toFixed(3) } };
    }
  },
  led: { help: 'Set the supply, then record the LED voltage and current shown on the meters. Take more readings near the knee.', rec(st) { const m = ledModel(st); if (m.I > 0.03) return 'Current above 30 mA would damage the LED — lower the supply.'; return { tk: 't', row: { V: m.V.toFixed(2), I: (m.I * 1e3).toFixed(1) }, params: { lam: st.col } }; } },
  diode: { help: 'Record (V, I) at different biases. Positive bias goes to the forward table (mA); negative bias goes to the reverse table (µA).', rec(st) { const I = diodeI(st.V, st.T); if (st.V >= 0) { if (I > 0.03) return 'Forward current too high (> 30 mA) — reduce the bias.'; return { tk: 'f', row: { V: st.V.toFixed(2), I: (I * 1e3).toFixed(2) } }; } return { tk: 'r', row: { V: Math.abs(st.V).toFixed(1), I: (Math.abs(I) * 1e6).toFixed(2) } }; } },
  photo: { help: 'Make the anode negative and raise the retarding potential slowly until the photocurrent <b>just</b> becomes zero, then record V₀. Repeat for other wavelengths.', rec(st) { const m = photoModel(st); if (m.K <= 0) return 'No photoemission at this wavelength — choose a shorter wavelength.'; if (st.V >= 0) return 'Apply a retarding (negative) anode potential first.'; if (m.I > 0.004) return `Current is still ${m.I.toFixed(3)} µA — increase the retarding potential.`; if (-st.V > m.V0 + 0.05) return 'You went past the stopping point — reduce until the current just becomes zero.'; return { tk: 't', row: { lam: st.lam, V0: (-st.V).toFixed(2) } }; } },
  pendulum: { help: 'Choose the side and the hole (l), let the bar settle into steady oscillations, then time 20 oscillations. Two trials are recorded with realistic reaction-time scatter.', rec(st) { if (!st.Tm || st.n < 2) return 'Let it complete a couple of oscillations first.'; if (st.amp > 10) return 'Amplitude is above 10° — use a small amplitude (< 5°) for SHM.'; const t = 20 * st.Tm; return { tk: 't', row: { l: (+st.side) * st.l, t1: (t + noise(.08)).toFixed(2), t2: (t + noise(.08)).toFixed(2) }, params: { N: 20 } }; } },
  solar: { help: 'Change the load resistance in steps and record V and I each time. Include short circuit (small R) and near open circuit (large R).', rec(st) { const m = solarModel(st); return { tk: 't', row: { V: m.V.toFixed(3), I: (m.I * 1e3).toFixed(1) }, params: { E: st.G, A: 4 } }; } },
  sonometer: { help: 'Strike the fork and slide the bridge until resonance (the rider flies off), then record. Repeat with other loads.', rec(st) { const m = sonoModel(st); if (!(m.p === 1 && m.amp > .5)) return 'Not at resonance yet — adjust the bridge (or use Auto-tune) until the rider flies off.'; const wire = { '5.55e-4': [0.30, 7850], '9.86e-4': [0.40, 7850], '6.01e-4': [0.30, 8500] }[st.wire] || [0.3, 7850]; return { tk: 't', row: { M: st.M.toFixed(1), l1: st.l.toFixed(1), l2: (st.l + noise(.2)).toFixed(1) }, params: { d: wire[0].toFixed(2), rho: wire[1], g: 9.81 } }; } }
};
(function installVirtualLab() {
  // extra controls for measurement
  SIMS.newton.controls.push({ k: 'cross', label: 'Microscope screw (crosshair x)', min: -3.5, max: 3.5, step: 0.005, val: 0, unit: 'mm', fmt: v => v.toFixed(3) });
  const nd = SIMS.newton.draw;
  SIMS.newton.draw = function (g, W, H, st) {
    nd.call(this, g, W, H, st);
    const S = Math.min(H - 30, W * .58), cx = 15 + S / 2, cy = H / 2, px = cx + st.cross / 3.5 * S / 2;
    g.save(); g.beginPath(); g.arc(cx, cy, S / 2, 0, 7); g.clip();
    SG.line(g, px, cy - S / 2, px, cy + S / 2, '#f43f5e', 1.4); SG.line(g, px - 12, cy, px + 12, cy, '#f43f5e', 1.4); g.restore();
    SG.mono(g, `Microscope: ${(4.5 + st.cross / 10).toFixed(3)} cm`, cx + S / 2 - 4, 22, '#fda4af', 12, 'right');
  };
  const nr = SIMS.newton.readouts; SIMS.newton.readouts = st => [['Microscope reading', (4.5 + st.cross / 10).toFixed(3) + ' cm'], ...nr(st).slice(0, 7)];
  SIMS.diffraction.controls.push({ k: 'ord', label: 'Order of minimum to mark (n)', min: 1, max: 4, step: 1, val: 1, unit: '' }, { k: 'xm', label: 'Pointer on screen (x)', min: -40, max: 40, step: 0.05, val: -4, unit: 'mm', fmt: v => v.toFixed(2) });
  const dd = SIMS.diffraction.draw;
  SIMS.diffraction.draw = function (g, W, H, st) {
    dd.call(this, g, W, H, st);
    const topH = H * .52, y0 = topH + 14, py0 = y0 + 22 + 12, ph = H - py0 - 26, pl = 40, pr = W - 20, X = xm => pl + (xm + 40) / 80 * (pr - pl), x = X(st.xm);
    SG.line(g, x, y0 - 4, x, py0 + ph, '#f43f5e', 1.6, [4, 3]);
    g.fillStyle = '#f43f5e'; g.beginPath(); g.moveTo(x - 6, y0 - 10); g.lineTo(x + 6, y0 - 10); g.lineTo(x, y0 - 2); g.fill();
    SG.mono(g, `x = ${st.xm.toFixed(2)} mm`, Math.min(Math.max(x, 60), W - 60), y0 - 14, '#fda4af', 11, 'center');
  };
  SIMS.pendulum.selects.push({ k: 'side', label: 'Knife-edge side (virtual lab)', options: [['1', 'Side A (+l)'], ['-1', 'Side B (−l)']], val: '1' });
  Object.keys(VLAB).forEach(id => {
    const def = SIMS[id]; if (!def) return;
    def.note = (def.note ? def.note + '<br><br>' : '') + `<b>Virtual experiment:</b> ${VLAB[id].help}`;
    def.buttons = def.buttons || [];
    def.buttons.push({ label: 'Record reading', icon: 'clipboard-plus', fn: st => {
      const r = VLAB[id].rec(st);
      if (typeof r === 'string') return toast(r, 'alert-circle');
      if (r.msg) return toast(r.msg, 'crosshair');
      const n = wsAddRow(id, r.tk, r.row, r.params); vlabDone(id, n);
    } });
  });
})();
function vlabBanner(id) { return `<div class="vlab-bar no-print"><span class="tag cyan">${icon('flask-conical')} Virtual lab</span><span class="muted" style="font-size:13px" id="vlabCount">${vlabCount(id)}</span><span class="spacer"></span><a class="btn sm" href="#/exp/${id}/workspace">${icon('table-2')} Open workspace</a></div>`; }

/* =====================================================================
   3. GRAPH PLOTTING PRACTICE
   ===================================================================== */
const GRAPHS = {
  newton: { ci: 0, what: 'D² against ring number n', result: (m, P) => ({ label: 'λ = slope / 4R', v: m / (4 * P.R) * 1e9, unit: 'nm' }) },
  diffraction: { ci: 0, what: 'xₙ against n·D', result: (m, P) => ({ label: 'λ = slope × a', v: m * 1e-3 * P.a * 1e-3 * 1e9, unit: 'nm' }) },
  photo: { ci: 0, what: 'stopping potential V₀ against frequency ν', result: m => ({ label: 'h = e × slope', v: PHYS.e * m * 1e34, unit: '× 10⁻³⁴ J s' }) },
  pendulum: { ci: 1, what: 'T²l against l²', result: m => ({ label: 'g = 4π² / slope', v: 4 * Math.PI ** 2 / m, unit: 'm s⁻²' }) },
  sonometer: { ci: 0, what: 'l² against load M', result: (m, P) => { const mm = Math.PI * (P.d / 2e3) ** 2 * P.rho; return { label: 'f = √(g / 4m·slope)', v: Math.sqrt(P.g / (4 * mm * m)), unit: 'Hz' }; } }
};
let GL = null;
VIEWS.graphlab = () => `<div class="page-head"><div><span class="eyebrow">Practice</span><h1>Graph Plotting Practice</h1><p>Plot the observations yourself on graph paper, as in the exam: choose a scale, mark each point and draw the best-fit straight line. You are scored on scale, points and slope — and your slope gives the result.</p></div><div class="row"><select class="input" id="glExp" style="width:auto" aria-label="Experiment">${Object.keys(GRAPHS).map(id => `<option value="${id}">${expById(id).num}. ${expById(id).title}</option>`).join('')}</select><button class="btn" id="glNew">${icon('refresh-cw')} Restart</button></div></div>
  <div class="grid" style="grid-template-columns:minmax(0,1fr) 320px" id="glGrid"><div class="card" style="padding:14px"><div class="graph-paper-wrap"><canvas id="glCv" aria-label="Graph paper. Click to plot points." role="img"></canvas></div><div class="row" style="margin-top:10px" id="glTools"></div></div><div style="display:flex;flex-direction:column;gap:16px"><div class="card" id="glSide"></div><div class="card" id="glData"></div></div></div>`;
function mountGraphLab(params) {
  const sel = $('#glExp'); sel.value = GRAPHS[params.get('exp')] ? params.get('exp') : 'newton';
  sel.onchange = () => glStart(sel.value); $('#glNew').onclick = () => glStart(sel.value);
  if (window.innerWidth < 1000) $('#glGrid').style.gridTemplateColumns = '1fr';
  glStart(sel.value);
}
function glStart(id) {
  const cfg = WS[id], mine = hasMyData(id);
  let T, P;
  if (mine) { const st = Store.s.ws[id]; T = {}; cfg.tables.forEach(t => T[t.k] = numRows(st.tables[t.k]).filter(r => Object.values(r).some(isFinite))); P = numParams(st.params); }
  else { T = {}; cfg.tables.forEach(t => T[t.k] = cfg.sample.tables[t.k]); P = cfg.sample.params; }
  let out; try { out = cfg.calc(T, P); } catch (e) { T = {}; cfg.tables.forEach(t => T[t.k] = cfg.sample.tables[t.k]); P = cfg.sample.params; out = cfg.calc(T, P); }
  const spec = out.charts[GRAPHS[id].ci].spec, pts = spec.datasets[0].data.map(p => ({ x: p.x, y: p.y }));
  const fit = linfit(pts.map(p => p.x), pts.map(p => p.y));
  const PX = 20, PY = 14; // paper size in cm (landscape)
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y), sx = niceScale(Math.min(...xs), Math.max(...xs), PX - 3);
  const sy = niceScale(Math.min(...ys), Math.max(...ys), PY - 2.5);
  const opts = shuffle([{ k: 'ok', x: sx.step, y: sy.step }, { k: 'small', x: sx.step * 2, y: sy.step * 2 }, { k: 'big', x: sx.step / 2, y: sy.step / 2 }]);
  GL = { id, mine, P, pts, fit, spec, sx, sy, PX, PY, opts, phase: 'scale', user: [], line: [], score: {} };
  glDrawSide(); glData(); glCanvas();
}
function glData() {
  const { spec, pts, id, mine } = GL;
  $('#glData').innerHTML = `<h3>${icon('table-2')} Data to plot</h3><p class="dim" style="font-size:12.5px;margin:-6px 0 8px">${mine ? 'Your workspace readings' : 'Illustrative sample data'} · ${GRAPHS[id].what}</p><div class="table-wrap"><table class="data" style="min-width:0"><thead><tr><th>#</th><th>${esc(spec.x.title)}</th><th>${esc(spec.y.title)}</th></tr></thead><tbody>${pts.map((p, i) => `<tr><td>${i + 1}</td><td>${fmtTick(p.x)}</td><td>${fmtTick(p.y)}</td></tr>`).join('')}</tbody></table></div>`;
  refreshIcons();
}
function glDrawSide() {
  const S = $('#glSide'), g = GL;
  if (g.phase === 'scale') {
    S.innerHTML = `<h3>${icon('ruler')} Step 1 — choose a scale</h3><p class="muted" style="font-size:13.5px;margin-top:0">Graph area: ${g.PX - 3} cm × ${(g.PY - 2.5).toFixed(1)} cm. A good scale uses most of the sheet and has easy 1-2-5 steps.</p>${g.opts.map((o, i) => `<button class="option" data-sc="${i}"><span class="key">${i + 1}</span><span><b>X-axis:</b> 1 cm = ${fmtScale(o.x)}<br><b>Y-axis:</b> 1 cm = ${fmtScale(o.y)}</span></button>`).join('')}`;
    $$('[data-sc]', S).forEach(b => b.onclick = () => {
      const o = g.opts[+b.dataset.sc]; g.score.scale = o.k === 'ok' ? 20 : 8;
      toast(o.k === 'ok' ? 'Good scale choice!' : o.k === 'small' ? 'That scale makes the graph too small — using the better scale.' : 'That scale would run off the paper — using the better scale.', o.k === 'ok' ? 'check-circle-2' : 'alert-circle');
      g.phase = 'points'; glDrawSide(); glCanvas();
    });
  } else if (g.phase === 'points') {
    S.innerHTML = `<h3>${icon('mouse-pointer-click')} Step 2 — plot the points</h3><p class="muted" style="font-size:13.5px;margin-top:0">Click on the paper to mark each of the <b>${g.pts.length}</b> points (snaps to 0.5 mm). Use the table on the right.</p><div class="progress"><i style="width:${g.user.length / g.pts.length * 100}%"></i></div><p class="mono" style="margin:8px 0 0">${g.user.length} / ${g.pts.length} plotted</p>`;
    $('#glTools').innerHTML = `<button class="btn sm" id="glUndo" ${g.user.length ? '' : 'disabled'}>${icon('undo-2')} Undo</button>${g.user.length === g.pts.length ? `<button class="btn sm primary" id="glToLine">${icon('arrow-right')} Draw best-fit line</button>` : ''}`;
    $('#glUndo').onclick = () => { g.user.pop(); glDrawSide(); glCanvas(); };
    const tl = $('#glToLine'); if (tl) tl.onclick = () => { g.phase = 'line'; glDrawSide(); glCanvas(); };
  } else if (g.phase === 'line') {
    S.innerHTML = `<h3>${icon('spline')} Step 3 — best-fit line</h3><p class="muted" style="font-size:13.5px;margin-top:0">Click two points far apart to draw the straight line that best balances the points (about as many above as below).</p><p class="mono">${g.line.length} / 2 points</p>`;
    $('#glTools').innerHTML = `<button class="btn sm" id="glUndo" ${g.line.length ? '' : 'disabled'}>${icon('undo-2')} Undo</button>${g.line.length === 2 ? `<button class="btn sm primary" id="glCheck">${icon('check')} Check my graph</button>` : ''}`;
    $('#glUndo').onclick = () => { g.line.pop(); glDrawSide(); glCanvas(); };
    const ck = $('#glCheck'); if (ck) ck.onclick = glCheck;
  } else {
    const sc = g.score, tot = Math.round(sc.scale + sc.points + sc.line), r = g.res;
    S.innerHTML = `<h3>${icon('award')} Your score</h3><div class="stat"><span class="v" style="font-size:40px">${tot}<span class="dim" style="font-size:18px"> / 100</span></span></div>
      <div class="readouts" style="margin:10px 0"><div class="readout"><span>Scale</span><b>${sc.scale}/20</b></div><div class="readout"><span>Points</span><b>${sc.points.toFixed(0)}/50</b></div><div class="readout"><span>Best-fit line</span><b>${sc.line.toFixed(0)}/30</b></div><div class="readout"><span>Slope error</span><b>${(g.slopeErr * 100).toFixed(1)} %</b></div></div>
      <div class="result-box" style="padding:12px 14px"><div class="dim" style="font-size:12px">From your slope</div><b class="mono">${r.mine.label}: ${fmt(r.mine.v, 4)} ${r.mine.unit}</b><div class="dim" style="font-size:12px;margin-top:6px">Least-squares: ${fmt(r.best.v, 4)} ${r.best.unit}</div></div>
      <p class="dim" style="font-size:12.5px">Green = correct positions and least-squares line. Average point error: ${g.avgErr.toFixed(2)} mm on paper.</p>`;
    $('#glTools').innerHTML = `<button class="btn sm primary" id="glAgain">${icon('rotate-ccw')} Try again</button>`;
    $('#glAgain').onclick = () => glStart(g.id);
    Store.s.graphBest[g.id] = Math.max(Store.s.graphBest[g.id] || 0, tot); Store.save();
    if (tot >= 90) confetti();
  }
  refreshIcons();
}
function glGeom() {
  const cv = $('#glCv'), W = cv.parentElement.clientWidth, g = GL, mm = Math.min(W / (g.PX * 10), 4.2), H = g.PY * 10 * mm;
  const ox = 2.2 * 10 * mm, oy = H - 1.8 * 10 * mm; // origin 2.2 cm from left, 1.8 cm from bottom
  const X = v => ox + (v - g.sx.origin) / g.sx.step * 10 * mm, Y = v => oy - (v - g.sy.origin) / g.sy.step * 10 * mm;
  const iX = px => g.sx.origin + (px - ox) / (10 * mm) * g.sx.step, iY = py => g.sy.origin + (oy - py) / (10 * mm) * g.sy.step;
  return { cv, W: g.PX * 10 * mm, H, mm, ox, oy, X, Y, iX, iY };
}
function glCanvas() {
  const G = glGeom(), { cv, W, H, mm } = G, g = GL, dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.fillStyle = '#fbfdf7'; c.fillRect(0, 0, W, H);
  for (let i = 0; i <= g.PX * 10; i++) { c.strokeStyle = i % 10 === 0 ? 'rgba(22,101,52,.55)' : i % 5 === 0 ? 'rgba(22,101,52,.3)' : 'rgba(22,101,52,.13)'; c.lineWidth = i % 10 === 0 ? 1 : .6; c.beginPath(); c.moveTo(i * mm, 0); c.lineTo(i * mm, H); c.stroke(); }
  for (let i = 0; i <= g.PY * 10; i++) { c.strokeStyle = i % 10 === 0 ? 'rgba(22,101,52,.55)' : i % 5 === 0 ? 'rgba(22,101,52,.3)' : 'rgba(22,101,52,.13)'; c.lineWidth = i % 10 === 0 ? 1 : .6; c.beginPath(); c.moveTo(0, H - i * mm); c.lineTo(W, H - i * mm); c.stroke(); }
  if (g.phase === 'scale') { c.fillStyle = 'rgba(15,23,42,.55)'; c.font = '600 15px Inter'; c.textAlign = 'center'; c.fillText('Choose a scale to begin →', W / 2, H / 2); return; }
  c.strokeStyle = '#0f172a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(G.ox, 4); c.lineTo(G.ox, G.oy); c.lineTo(W - 4, G.oy); c.stroke();
  c.fillStyle = '#0f172a'; c.font = '11px JetBrains Mono, monospace'; c.textAlign = 'center';
  for (let i = 0; G.ox + i * 10 * mm < W - 6; i += 2) c.fillText(fmtTick(g.sx.origin + i * g.sx.step), G.ox + i * 10 * mm, G.oy + 14);
  c.textAlign = 'right'; for (let i = 0; G.oy - i * 10 * mm > 8; i += 2) c.fillText(fmtTick(g.sy.origin + i * g.sy.step), G.ox - 4, G.oy - i * 10 * mm + 4);
  c.font = '600 12px Inter'; c.textAlign = 'right'; c.fillText(g.spec.x.title + ' →', W - 8, G.oy + 30); c.save(); c.translate(14, 10); c.textAlign = 'left'; c.fillText('↑ ' + g.spec.y.title, 0, 0); c.restore();
  c.font = '11px Inter'; c.fillStyle = '#166534'; c.textAlign = 'left'; c.fillText(`Scale: X 1 cm = ${fmtTick(g.sx.step)}, Y 1 cm = ${fmtTick(g.sy.step)}`, G.ox + 8, 16);
  if (g.phase === 'done') {
    c.strokeStyle = '#16a34a'; c.lineWidth = 1.6; c.setLineDash([6, 4]); const x0 = g.sx.origin, x1 = g.sx.origin + (g.PX - 3) * g.sx.step; c.beginPath(); c.moveTo(G.X(x0), G.Y(g.fit.m * x0 + g.fit.c)); c.lineTo(G.X(x1), G.Y(g.fit.m * x1 + g.fit.c)); c.stroke(); c.setLineDash([]);
    g.pts.forEach(p => { c.strokeStyle = '#16a34a'; c.lineWidth = 1.5; c.beginPath(); c.arc(G.X(p.x), G.Y(p.y), 5, 0, 7); c.stroke(); });
  }
  g.user.forEach(p => { const x = G.X(p.x), y = G.Y(p.y); c.strokeStyle = '#1d4ed8'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x + 4, y + 4); c.moveTo(x + 4, y - 4); c.lineTo(x - 4, y + 4); c.stroke(); c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.stroke(); });
  if (g.line.length) { c.fillStyle = '#b91c1c'; g.line.forEach(p => { c.beginPath(); c.arc(G.X(p.x), G.Y(p.y), 3.5, 0, 7); c.fill(); }); }
  if (g.line.length === 2) { const [a, b] = g.line, m = (b.y - a.y) / (b.x - a.x), xs = [g.sx.origin, g.sx.origin + (g.PX - 3) * g.sx.step]; c.strokeStyle = '#b91c1c'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(G.X(xs[0]), G.Y(a.y + m * (xs[0] - a.x))); c.lineTo(G.X(xs[1]), G.Y(a.y + m * (xs[1] - a.x))); c.stroke(); }
  cv.onclick = e => {
    if (g.phase !== 'points' && g.phase !== 'line') return;
    const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    const snap = v => Math.round(v / (G.mm / 2)) * (G.mm / 2);
    const p = { x: G.iX(snap(px)), y: G.iY(snap(py)) };
    if (g.phase === 'points' && g.user.length < g.pts.length) g.user.push(p);
    else if (g.phase === 'line' && g.line.length < 2) g.line.push(p);
    glDrawSide(); glCanvas();
  };
}
function glCheck() {
  const g = GL, G = glGeom(), mm = G.mm;
  const left = g.user.slice(); let errSum = 0, pScore = 0;
  g.pts.forEach(p => { let bi = 0, bd = 1e9; left.forEach((u, i) => { const d = Math.hypot(G.X(u.x) - G.X(p.x), G.Y(u.y) - G.Y(p.y)) / mm; if (d < bd) { bd = d; bi = i; } }); left.splice(bi, 1); errSum += bd; pScore += bd <= .75 ? 1 : bd >= 4 ? 0 : 1 - (bd - .75) / 3.25; });
  const [a, b] = g.line, m = (b.y - a.y) / (b.x - a.x), se = Math.abs(m - g.fit.m) / Math.abs(g.fit.m);
  g.slopeErr = se; g.avgErr = errSum / g.pts.length;
  g.score.points = pScore / g.pts.length * 50; g.score.line = se <= .02 ? 30 : se >= .2 ? 0 : 30 * (1 - (se - .02) / .18);
  const R = GRAPHS[g.id].result; g.res = { mine: R(m, g.P), best: R(g.fit.m, g.P) };
  g.phase = 'done'; glDrawSide(); glCanvas(); $('#glTools') && refreshIcons();
}

/* =====================================================================
   4. DERIVATION PUZZLES
   ===================================================================== */
const PUZZLES = {
  newton: [['Path difference between rays reflected from the two surfaces of the film', R`\Delta = 2\mu t\cos r + \tfrac{\lambda}{2}`], ['Dark ring for normal incidence (cos r = 1)', R`2\mu t = n\lambda`], ['Geometry of the lens (intersecting chords)', R`r_n^2 = (2R - t)\,t \approx 2Rt`], ['Film thickness at radius rₙ', R`t = \frac{r_n^2}{2R}`], ['Substitute t into the dark-ring condition', R`D_n^2 = \frac{4n\lambda R}{\mu}`], ['Subtract the n-th from the (n+p)-th ring', R`D_{n+p}^2 - D_n^2 = 4p\lambda R`], ['Working formula', R`\lambda = \frac{D_{n+p}^2 - D_n^2}{4pR}`]],
  diffraction: [['Split the slit into two equal halves; path difference of corresponding wavelets', R`\delta = \tfrac{a}{2}\sin\theta`], ['They cancel when this equals half a wavelength', R`\tfrac{a}{2}\sin\theta = \tfrac{\lambda}{2}`], ['General condition for the n-th minimum', R`a\sin\theta_n = n\lambda`], ['Geometry of the screen at distance D', R`\tan\theta_n = \frac{x_n}{D}`], ['Small-angle approximation', R`\sin\theta_n \approx \frac{x_n}{D}`], ['Working formula', R`\lambda = \frac{a\,x_n}{nD}`]],
  led: [['Forward bias injects electrons and holes across the junction', R`\text{injection of } e^- \text{ and } h^+`], ['They recombine radiatively, releasing the band-gap energy', R`h\nu \approx E_g`], ['Photon energy in terms of wavelength', R`E_g = \frac{hc}{\lambda}`], ['At the knee each electron receives energy eV_k', R`eV_k \approx E_g`], ['Equate the two energies', R`eV_k = \frac{hc}{\lambda}`], ['Planck’s constant', R`h = \frac{eV_k\lambda}{c}`]],
  diode: [['Shockley diode equation', R`I = I_0\left(e^{V/\eta V_T} - 1\right)`], ['Differentiate with respect to V', R`\frac{dI}{dV} = \frac{I_0}{\eta V_T}e^{V/\eta V_T}`], ['Rewrite using the diode equation', R`\frac{dI}{dV} = \frac{I + I_0}{\eta V_T}`], ['Dynamic resistance is the reciprocal', R`r_d = \frac{\eta V_T}{I + I_0}`], ['For I ≫ I₀', R`r_d \approx \frac{\eta V_T}{I}`]],
  photo: [['Energy of one photon', R`E = h\nu`], ['Einstein’s equation', R`h\nu = \phi + K_{max}`], ['Retarding potential just stops the fastest electrons', R`eV_0 = K_{max}`], ['Combine the two', R`eV_0 = h\nu - \phi`], ['Straight-line form', R`V_0 = \frac{h}{e}\nu - \frac{\phi}{e}`], ['Planck’s constant from the slope', R`h = e \times \text{slope}`]],
  pendulum: [['Restoring torque for a small displacement θ', R`\tau = -mgl\sin\theta \approx -mgl\,\theta`], ['Newton’s second law for rotation', R`I\ddot\theta = -mgl\,\theta`], ['Parallel-axis theorem', R`I = m(K^2 + l^2)`], ['Simple harmonic motion with', R`\omega^2 = \frac{gl}{K^2 + l^2}`], ['Time period', R`T = 2\pi\sqrt{\frac{K^2 + l^2}{gl}}`], ['Equivalent length and g', R`L = l + \frac{K^2}{l},\quad g = \frac{4\pi^2L}{T^2}`]],
  solar: [['I–V of an illuminated cell', R`I = I_L - I_0\left(e^{V/\eta V_T}-1\right)`], ['Power delivered to the load', R`P = VI`], ['Maximum power point', R`P_{max} = V_m I_m`], ['Fill factor', R`FF = \frac{V_mI_m}{V_{oc}I_{sc}}`], ['Incident power on the cell', R`P_{in} = E \cdot A`], ['Efficiency', R`\eta = \frac{P_{max}}{P_{in}} \times 100\%`]],
  sonometer: [['Net transverse force on a string element dx', R`F = T\frac{\partial^2 y}{\partial x^2}dx`], ['Newton’s law gives the wave equation and speed', R`v = \sqrt{T/m}`], ['Both bridges are nodes in the fundamental mode', R`l = \frac{\lambda}{2}`], ['Frequency from v = fλ', R`f = \frac{v}{2l}`], ['Substitute v', R`f = \frac{1}{2l}\sqrt{\frac{T}{m}}`], ['Tension from the hanging mass', R`f = \frac{1}{2l}\sqrt{\frac{Mg}{m}}`]]
};
let PZ = null;
VIEWS.puzzles = () => `<div class="page-head"><div><span class="eyebrow">Practice</span><h1>Derivation Puzzles</h1><p>Each derivation is cut into steps and shuffled. Put them back in order — drag the cards or use the arrow buttons — then check. Hints cost points.</p></div></div>
  <div class="row" style="margin-bottom:16px" id="pzTabs">${EXPS.map(e => `<button class="chip" data-pz="${e.id}"><span class="dot" style="background:${e.color}"></span>${e.title}${(Store.s.puzzles[e.id] || {}).solved ? ' ✓' : ''}</button>`).join('')}</div>
  <div class="card pad-lg" id="pzCard"></div>`;
function mountPuzzles(params) { $('#pzTabs').onclick = e => { const b = e.target.closest('[data-pz]'); if (b) pzStart(b.dataset.pz); }; pzStart(params.get('exp') && PUZZLES[params.get('exp')] ? params.get('exp') : 'newton'); }
function pzStart(id) {
  const steps = PUZZLES[id].map((s, i) => ({ i, t: s[0], tex: s[1] }));
  let order = shuffle(steps); while (order.every((s, k) => s.i === k)) order = shuffle(steps);
  PZ = { id, order, hints: 0, checks: 0, locked: new Set(), solved: false };
  $$('#pzTabs .chip').forEach(c => c.classList.toggle('on', c.dataset.pz === id));
  pzDraw();
}
function pzDraw(feedback) {
  const e = expById(PZ.id), best = (Store.s.puzzles[PZ.id] || {}).best;
  $('#pzCard').innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h3 style="margin:0">${icon('puzzle')} ${e.title}: derive the working formula</h3><div class="row"><span class="tag">Hints used: ${PZ.hints}</span>${best != null ? `<span class="tag green">Best: ${best}</span>` : ''}</div></div>
    <ol class="pz-list" id="pzList">${PZ.order.map((s, k) => { const st = feedback ? (s.i === k ? 'ok' : 'bad') : PZ.locked.has(k) ? 'ok' : ''; return `<li class="pz-item ${st}" draggable="${!PZ.solved && !PZ.locked.has(k)}" data-k="${k}"><span class="pz-num">${k + 1}</span><div class="pz-body"><div class="pz-t">${s.t}</div><div class="pz-tex">${tex(s.tex, false)}</div></div><div class="pz-btns"><button class="icon-btn" data-mv="-1" aria-label="Move up" ${k === 0 || PZ.solved ? 'disabled' : ''}>${icon('chevron-up')}</button><button class="icon-btn" data-mv="1" aria-label="Move down" ${k === PZ.order.length - 1 || PZ.solved ? 'disabled' : ''}>${icon('chevron-down')}</button></div></li>`; }).join('')}</ol>
    <div class="row" style="margin-top:14px">${PZ.solved ? `<button class="btn primary" id="pzNext">${icon('arrow-right')} Next experiment</button><button class="btn" id="pzAgain">${icon('rotate-ccw')} Shuffle again</button>` : `<button class="btn primary" id="pzCheck">${icon('check')} Check order</button><button class="btn" id="pzHint">${icon('lightbulb')} Hint</button><button class="btn ghost" id="pzShuffle">${icon('shuffle')} Reshuffle</button>`}</div><div id="pzMsg" style="margin-top:12px"></div>`;
  refreshIcons();
  const list = $('#pzList'); let drag = null;
  list.addEventListener('dragstart', ev => { const li = ev.target.closest('.pz-item'); drag = +li.dataset.k; li.classList.add('dragging'); ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', String(drag)); } catch (x) { } });
  list.addEventListener('dragover', ev => { ev.preventDefault(); const li = ev.target.closest('.pz-item'); $$('.pz-item', list).forEach(x => x.classList.toggle('over', x === li)); });
  list.addEventListener('drop', ev => { ev.preventDefault(); const li = ev.target.closest('.pz-item'); if (!li || drag == null) return; const to = +li.dataset.k; if (PZ.locked.has(to)) return; const [m] = PZ.order.splice(drag, 1); PZ.order.splice(to, 0, m); drag = null; pzDraw(); });
  list.addEventListener('dragend', () => $$('.pz-item', list).forEach(x => x.classList.remove('dragging', 'over')));
  list.onclick = ev => { const b = ev.target.closest('[data-mv]'); if (!b) return; const k = +b.closest('.pz-item').dataset.k, j = k + +b.dataset.mv; if (j < 0 || j >= PZ.order.length) return; [PZ.order[k], PZ.order[j]] = [PZ.order[j], PZ.order[k]]; PZ.locked.clear(); pzDraw(); const nb = $(`.pz-item[data-k="${j}"] [data-mv="${b.dataset.mv}"]`); nb && !nb.disabled && nb.focus(); };
  const c = $('#pzCheck'); if (c) c.onclick = () => {
    PZ.checks++; const right = PZ.order.filter((s, k) => s.i === k).length;
    if (right === PZ.order.length) {
      PZ.solved = true; const score = Math.max(20, 100 - PZ.hints * 15 - (PZ.checks - 1) * 5);
      const rec = Store.s.puzzles[PZ.id] || {}; Store.s.puzzles[PZ.id] = { solved: true, best: Math.max(rec.best || 0, score) }; Store.save();
      pzDraw(true); $('#pzMsg').innerHTML = `<div class="result-box"><b>Solved! Score ${score}/100.</b> The derivation is in the right order.</div>`; confetti();
      $$('#pzTabs .chip').forEach(ch => { if (ch.dataset.pz === PZ.id && !ch.textContent.includes('✓')) ch.insertAdjacentText('beforeend', ' ✓'); });
    } else { pzDraw(true); $('#pzMsg').innerHTML = `<div class="callout amber" style="margin:0"><b>${right} of ${PZ.order.length}</b> steps are in the right place (green). Rearrange the red ones and check again.</div>`; }
  };
  const h = $('#pzHint'); if (h) h.onclick = () => { const k = PZ.order.findIndex((s, kk) => s.i !== kk); if (k < 0) return; const j = PZ.order.findIndex(s => s.i === k); [PZ.order[k], PZ.order[j]] = [PZ.order[j], PZ.order[k]]; PZ.hints++; PZ.locked.add(k); pzDraw(); toast(`Hint: step ${k + 1} placed`, 'lightbulb'); };
  const sh = $('#pzShuffle'); if (sh) sh.onclick = () => pzStart(PZ.id);
  const nx = $('#pzNext'); if (nx) nx.onclick = () => { const ids = EXPS.map(e => e.id), i = ids.indexOf(PZ.id); pzStart(ids[(i + 1) % ids.length]); };
  const ag = $('#pzAgain'); if (ag) ag.onclick = () => pzStart(PZ.id);
}

/* =====================================================================
   Confetti burst (shared)
   ===================================================================== */
function confetti() {
  if (!motionOK()) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
  const W = cv.width = innerWidth, H = cv.height = innerHeight, g = cv.getContext('2d');
  const cols = ['#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'];
  const P = Array.from({ length: 140 }, () => ({ x: W / 2 + noise(80), y: H * .35, vx: noise(9), vy: -rndIn(4, 13), r: rndIn(3, 7), c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6, va: noise(.3) }));
  const t0 = performance.now();
  const step = now => { const t = (now - t0) / 1000; g.clearRect(0, 0, W, H); P.forEach(p => { p.vy += .32; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.globalAlpha = Math.max(0, 1 - t / 2.4); g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); }); if (t < 2.4) requestAnimationFrame(step); else cv.remove(); };
  requestAnimationFrame(step);
}
