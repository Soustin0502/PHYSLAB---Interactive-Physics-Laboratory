/* ---------- Added features: theme, error analysis, graph scale, lab record, toolkit, mock viva, planner, checklist ---------- */

/* ================= THEME ================= */
function isLight() { const t = Store.s.settings.theme || 'dark'; return t === 'light' || (t === 'system' && window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches); }
function applyTheme() {
  const light = isLight();
  document.body.classList.toggle('light', light);
  const b = $('#themeBtn');
  if (b) { b.innerHTML = icon(light ? 'moon' : 'sun'); b.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme'); b.title = b.getAttribute('aria-label'); refreshIcons(); }
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = light ? '#f5f6fa' : '#0a0c11';
}
function toggleTheme() { Store.s.settings.theme = isLight() ? 'dark' : 'light'; Store.save(); applyTheme(); route(); }

/* ================= ERROR ANALYSIS ================= */
const ERR = {
  newton: {
    inputs: [{ k: 'lc', label: 'Microscope least count', unit: 'cm', val: 0.001 }, { k: 'dR', label: 'Uncertainty in R', unit: 'm', val: 0.01 }],
    f(T, P, E, M) {
      const rs = T.t.filter(x => isFinite(x.n) && isFinite(x.L) && isFinite(x.Rr)).map(x => ({ n: x.n, D: Math.abs(x.L - x.Rr) / 100 })).sort((a, b) => a.n - b.n);
      const A = rs[rs.length - 1], B = rs.find(x => x.n === A.n - P.p) || rs[0];
      const diff = A.D ** 2 - B.D ** 2; if (!(diff > 0)) return null;
      const dD = 2 * E.lc / 100;
      return { name: 'λ', v: M.v, scale: 1e9, unit: 'nm', tex: R`\frac{\delta\lambda}{\lambda} = \frac{2(D_{n+p}+D_n)\,\delta D}{D_{n+p}^2-D_n^2} + \frac{\delta R}{R}`,
        terms: [[`Ring diameters, rings ${B.n} & ${A.n} (δD = 2 × LC)`, 2 * (A.D + B.D) * dD / diff], ['Radius of curvature, δR / R', E.dR / P.R]], stat: M.fit && M.fit.n > 2 ? M.fit.sm / M.fit.m : null };
    }
  },
  diffraction: {
    inputs: [{ k: 'da', label: 'Uncertainty in slit width', unit: 'mm', val: 0.005 }, { k: 'dX', label: 'Reading error in 2xₙ', unit: 'mm', val: 1 }, { k: 'dD', label: 'Reading error in D', unit: 'cm', val: 0.2 }],
    f(T, P, E, M) {
      const rs = M.rs; if (!rs || !rs.length) return null;
      const big = rs.reduce((a, b) => b.X > a.X ? b : a);
      return { name: 'λ', v: M.v, scale: 1e9, unit: 'nm', tex: R`\frac{\delta\lambda}{\lambda} = \frac{\delta a}{a} + \frac{\delta x_n}{x_n} + \frac{\delta D}{D}`,
        terms: [['Slit width, δa / a', E.da / P.a], [`Minima position (largest 2xₙ = ${big.X} mm)`, E.dX / big.X], ['Screen distance, δD / D', E.dD / 100 / big.D]] };
    }
  },
  led: {
    inputs: [{ k: 'dV', label: 'Voltmeter least count', unit: 'V', val: 0.01 }, { k: 'dl', label: 'Spectral half-width of LED', unit: 'nm', val: 10 }],
    f(T, P, E, M) { if (!(M.Vk > 0)) return null; return { name: 'h', v: M.v, scale: 1e34, unit: '× 10⁻³⁴ J s', tex: R`\frac{\delta h}{h} = \frac{\delta V_k}{V_k} + \frac{\delta\lambda}{\lambda}`, terms: [['Knee voltage, δV / V_k', E.dV / M.Vk], ['Wavelength spread, δλ / λ', E.dl / M.lam]] }; }
  },
  diode: {
    inputs: [{ k: 'dV', label: 'Voltmeter least count', unit: 'V', val: 0.01 }, { k: 'dI', label: 'Milliammeter least count', unit: 'mA', val: 0.1 }],
    f(T, P, E, M) {
      if (!(M.v > 0)) return null;
      const lin = M.k.lin, dV = lin[lin.length - 1].V - lin[0].V, dI = lin[lin.length - 1].I - lin[0].I;
      return { name: 'V_k', v: M.v, scale: 1, unit: 'V', tex: R`\frac{\delta V_k}{V_k} = \frac{\delta V}{V_k},\qquad \frac{\delta r_d}{r_d} = \frac{2\,\delta V}{\Delta V} + \frac{2\,\delta I}{\Delta I}`,
        terms: [['Knee voltage, δV / V_k', E.dV / M.v]], extra: dV > 0 && dI > 0 ? `Dynamic resistance r_d = ${M.rd.toFixed(2)} Ω ± ${((2 * E.dV / dV + 2 * E.dI / dI) * 100).toFixed(1)} %` : '' };
    }
  },
  photo: {
    inputs: [{ k: 'dV', label: 'Voltmeter least count', unit: 'V', val: 0.01 }, { k: 'dl', label: 'Filter bandwidth (half)', unit: 'nm', val: 5 }],
    f(T, P, E, M) {
      const rs = M.rs.filter(x => x.lam > 0 && isFinite(x.V0)); if (rs.length < 2) return null;
      const dV0 = Math.max(...rs.map(x => x.V0)) - Math.min(...rs.map(x => x.V0)), lamMid = mean(rs.map(x => x.lam));
      return { name: 'h', v: M.v, scale: 1e34, unit: '× 10⁻³⁴ J s', tex: R`\frac{\delta h}{h} = \frac{2\,\delta V_0}{\Delta V_0} + \frac{\delta\lambda}{\lambda}`, terms: [[`Stopping potential (ΔV₀ = ${dV0.toFixed(3)} V)`, 2 * E.dV / dV0], ['Filter bandwidth, δλ / λ', E.dl / lamMid]], stat: M.fit.n > 2 ? M.fit.sm / M.fit.m : null };
    }
  },
  pendulum: {
    inputs: [{ k: 'dl', label: 'Scale least count (l)', unit: 'cm', val: 0.1 }, { k: 'dt', label: 'Timing error (reaction time)', unit: 's', val: 0.2 }],
    f(T, P, E, M) {
      const rows = T.t.filter(x => isFinite(x.l) && x.l !== 0 && x.t1 > 0); if (!rows.length) return null;
      const far = rows.reduce((a, b) => Math.abs(b.l) > Math.abs(a.l) ? b : a), t = (far.t1 + (far.t2 > 0 ? far.t2 : far.t1)) / 2;
      return { name: 'g', v: M.v, scale: 1, unit: 'm s⁻²', tex: R`\frac{\delta g}{g} = \frac{\delta l}{l} + 2\,\frac{\delta t}{t}`, terms: [[`Distance l (hole at ${Math.abs(far.l)} cm)`, E.dl / Math.abs(far.l)], [`Time for ${P.N} oscillations (t = ${t.toFixed(2)} s), ×2`, 2 * E.dt / t]], stat: M.fit && M.fit.n > 2 ? M.fit.sm / M.fit.m : null };
    }
  },
  solar: {
    inputs: [{ k: 'dV', label: 'Voltmeter least count', unit: 'V', val: 0.001 }, { k: 'dI', label: 'Ammeter least count', unit: 'mA', val: 0.1 }, { k: 'dE', label: 'Irradiance uncertainty', unit: '%', val: 5 }, { k: 'dA', label: 'Area uncertainty', unit: 'cm²', val: 0.1 }],
    f(T, P, E, M) { const b = M.best; if (!b || !(b.V > 0 && b.I > 0)) return null; return { name: 'η', v: M.v, scale: 1, unit: '%', tex: R`\frac{\delta\eta}{\eta} = \frac{\delta V}{V_m} + \frac{\delta I}{I_m} + \frac{\delta E}{E} + \frac{\delta A}{A}`, terms: [['Voltage at MPP, δV / Vₘ', E.dV / b.V], ['Current at MPP, δI / Iₘ', E.dI / b.I], ['Irradiance, δE / E', E.dE / 100], ['Cell area, δA / A', E.dA / P.A]] }; }
  },
  sonometer: {
    inputs: [{ k: 'dl', label: 'Scale least count (l)', unit: 'cm', val: 0.1 }, { k: 'dM', label: 'Uncertainty in mass', unit: 'kg', val: 0.005 }, { k: 'dd', label: 'Screw gauge least count', unit: 'mm', val: 0.01 }],
    f(T, P, E, M) {
      const rs = M.rs; if (!rs || !rs.length) return null;
      const lm = mean(rs.map(x => x.l)) * 100, Mm = mean(rs.map(x => x.M));
      return { name: 'f', v: M.v, scale: 1, unit: 'Hz', tex: R`\frac{\delta f}{f} = \frac{\delta l}{l} + \frac{1}{2}\frac{\delta M}{M} + \frac{1}{2}\cdot\frac{2\,\delta d}{d}`, terms: [[`Resonating length (mean l = ${lm.toFixed(1)} cm)`, E.dl / lm], [`Load (mean M = ${Mm.toFixed(2)} kg), ½δM/M`, .5 * E.dM / Mm], ['Wire diameter, δd / d (m ∝ d²)', E.dd / P.d]] };
    }
  }
};
function errInputs(id) { const cfg = ERR[id]; Store.s.errIn[id] = Store.s.errIn[id] || {}; const o = {}; cfg.inputs.forEach(i => { const v = parseFloat(Store.s.errIn[id][i.k]); o[i.k] = isFinite(v) ? v : i.val; }); return o; }
function errCompute(id, T, P, meta) { if (!ERR[id] || !meta) return null; try { return ERR[id].f(T, P, errInputs(id), meta); } catch (e) { return null; } }
function errResultLine(r) {
  const rel = r.terms.reduce((s, t) => s + t[1], 0), v = r.v * r.scale, dv = v * rel;
  const dec = dv > 0 ? Math.max(0, Math.min(4, 1 - Math.floor(Math.log10(dv)))) : 2;
  return { rel, text: `${r.name} = (${v.toFixed(dec)} ± ${dv.toFixed(dec)}) ${r.unit}` };
}
function renderErrorCard(host, id, T, P, meta) {
  if (!host || !ERR[id]) return;
  const draw = () => {
    const r = errCompute(id, T, P, meta), E = errInputs(id);
    if (!r) { host.innerHTML = `<div class="card"><h3>${icon('sigma-square')} Error analysis</h3><p class="muted" style="margin:0">Enter enough readings to estimate the error.</p></div>`; refreshIcons(); return; }
    const res = errResultLine(r);
    host.innerHTML = `<div class="card err-card"><h3>${icon('sigma-square')} Error analysis — maximum probable error</h3>
      <div class="params" style="margin-bottom:12px">${ERR[id].inputs.map(i => `<div class="field"><label for="ei-${id}-${i.k}">${i.label} (${i.unit})</label><input class="input mono" type="number" step="any" id="ei-${id}-${i.k}" data-ek="${i.k}" value="${E[i.k]}"></div>`).join('')}</div>
      <div class="formula-box" style="margin:6px 0 12px">${tex(r.tex, true)}</div>
      <div class="table-wrap"><table class="data" style="min-width:0"><thead><tr><th>Source of error</th><th>Fractional error</th><th>Contribution</th></tr></thead><tbody>
      ${r.terms.map(t => `<tr><td style="font-family:var(--font);white-space:normal">${t[0]}</td><td>${t[1].toFixed(5)}</td><td>${(t[1] * 100).toFixed(2)} %</td></tr>`).join('')}
      <tr><td style="font-family:var(--font)"><b>Total (worst case)</b></td><td><b>${res.rel.toFixed(5)}</b></td><td><b>${(res.rel * 100).toFixed(2)} %</b></td></tr></tbody></table></div>
      <div class="result-box" style="margin-top:12px;padding:14px 18px"><div class="big" style="font-size:19px">${res.text}</div>
      ${r.stat != null ? `<div class="muted" style="font-size:13px;margin-top:4px">Statistical (random) error from least-squares slope: ± ${(r.stat * 100).toFixed(2)} %</div>` : ''}
      ${r.extra ? `<div class="muted" style="font-size:13px;margin-top:4px">${r.extra}</div>` : ''}</div>
      <p class="dim" style="font-size:12.5px;margin:10px 0 0">Fractional errors of the measured quantities add (with their powers) to give the maximum probable error. Edit the least counts to match your instruments.</p></div>`;
    refreshIcons();
    $$('[data-ek]', host).forEach(inp => inp.oninput = () => { Store.s.errIn[id][inp.dataset.ek] = inp.value; saveSoon(); clearTimeout(host._t); host._t = setTimeout(() => { const f = document.activeElement && document.activeElement.id; draw(); if (f) { const el = document.getElementById(f); if (el) { el.focus(); const v = el.value; el.value = ''; el.value = v; } } }, 500); });
  };
  draw();
}

/* ================= GRAPH-SCALE HELPER ================= */
function niceScale(min, max, cm) {
  if (!isFinite(min) || !isFinite(max)) return null;
  if (max === min) { max = min + Math.abs(min || 1) * .5; }
  let best = null;
  for (let k = -16; k <= 16; k++) for (const s of [1, 2, 5]) {
    const step = s * Math.pow(10, k);
    const origin = (min >= 0 && min <= .35 * max) ? 0 : Math.floor(min / step + 1e-9) * step;
    const top = (max <= 0 && max >= .35 * min) ? 0 : Math.ceil(max / step - 1e-9) * step;
    const used = (top - origin) / step;
    if (used <= cm + 1e-9 && used > 0 && (!best || step < best.step)) best = { step, origin, top, used };
  }
  return best;
}
function fmtScale(v) { if (Math.abs(v) < 1e-300) return '0'; const a = Math.abs(v); if (a >= 1e-3 && a < 1e5) return String(Number(v.toPrecision(6))); const m = a / Math.pow(10, Math.floor(Math.log10(a))); return sci(v, Math.abs(m - Math.round(m)) < 1e-6 ? 0 : 2); }
function axisWord(t) { return (t || '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim() || 'axis'; }
function symHtml(s) { return /[_^\\]/.test(s) ? tex(s) : `<i>${s}</i>`; }
function axisUnit(t) { const m = (t || '').match(/\(([^)]*)\)/); return m ? ' ' + m[1] : ''; }
function graphScaleHtml(spec, paper = { x: 18, y: 25, name: 'A4 graph sheet (portrait, 18 cm × 25 cm usable)' }) {
  const meas = spec.datasets.filter(d => !d.dashed && d.points !== false && !d.y2 && d.data && d.data.length > 1);
  const pts = (meas.length ? meas : spec.datasets.filter(d => !d.y2)).flatMap(d => d.data).filter(p => isFinite(p.x) && isFinite(p.y));
  if (pts.length < 2) return '';
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const sx = niceScale(Math.min(...xs), Math.max(...xs), paper.x), sy = niceScale(Math.min(...ys), Math.max(...ys), paper.y);
  if (!sx || !sy) return '';
  const line = (s, t, axis) => `<b>${axis}</b> (${axisWord(t)}): 1 cm = ${fmtScale(s.step)}${axisUnit(t)}; start at ${fmtScale(s.origin)}${s.origin !== 0 ? ' (false origin)' : ''}; length ≈ ${s.used.toFixed(1)} cm`;
  return `${icon('ruler')}<div><div class="dim" style="font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Suggested scale · ${paper.name}</div>${line(sx, spec.x.title, 'X-axis')}<br>${line(sy, spec.y.title, 'Y-axis')}</div>`;
}

/* ================= LAB RECORD ================= */
function hasMyData(id) { const w = Store.s.ws[id]; return !!(w && Object.values(w.tables).some(rows => rows.some(r => Object.values(r).some(v => v !== '' && v != null && isFinite(parseFloat(v)))))); }
VIEWS.recordList = () => `<div class="page-head"><div><span class="eyebrow">Exam toolkit</span><h1>Lab Record Generator</h1><p>Turns your workspace readings into a complete, printable record page — aim, apparatus, formula, diagram, observation table, calculation, graph, error analysis, result and precautions. Use your browser’s “Save as PDF” to keep a copy.</p></div></div>
  <div class="card" style="margin-bottom:18px"><h3>${icon('user-round')} Record header details</h3><div class="params">${[['name', 'Student name'], ['roll', 'Roll number'], ['branch', 'Branch / section'], ['college', 'Institution']].map(f => `<div class="field"><label for="pf-${f[0]}">${f[1]}</label><input class="input" id="pf-${f[0]}" data-pf="${f[0]}" value="${esc(Store.s.profile[f[0]] || '')}"></div>`).join('')}</div></div>
  <div class="exp-grid">${EXPS.map(e => { const mine = hasMyData(e.id); return `<a class="exp-card" href="#/record/${e.id}" style="${expStyle(e)}"><div class="top"><span class="exp-icon">${icon(e.icon)}</span><div><span class="n">EXPERIMENT ${String(e.num).padStart(2, '0')}</span><h4>${e.title}</h4></div></div><p>${e.subtitle}</p><div class="meta"><span class="tag ${mine ? 'green' : 'amber'}">${mine ? 'Uses your readings' : 'No readings yet — sample data'}</span></div></a>`; }).join('')}</div>`;
function mountRecordList() { $$('[data-pf]').forEach(i => i.oninput = () => { Store.s.profile[i.dataset.pf] = i.value; saveSoon(); }); }
VIEWS.record = id => {
  const e = expById(id); if (!e) return VIEWS.notFound();
  return `<div class="row no-print" style="margin-bottom:16px"><a class="btn ghost sm" href="#/record">${icon('arrow-left')} All records</a><span class="spacer"></span>
    <div class="seg" id="recSrc" style="min-width:260px"><button data-s="mine">My readings</button><button data-s="sample">Sample data</button></div>
    <a class="btn sm" href="#/exp/${id}/workspace">${icon('calculator')} Edit readings</a><button class="btn primary sm" id="recPrint">${icon('printer')} Print / Save PDF</button></div>
    <div id="recHost"></div>`;
};
function mountRecord(id, params) {
  Store.s.recordViews = (Store.s.recordViews || 0) + 1; saveSoon();
  const e = expById(id); if (!e) return;
  let src = params.get('src') || (hasMyData(id) ? 'mine' : 'sample');
  const draw = () => {
    destroyCharts();
    $$('#recSrc button').forEach(b => b.classList.toggle('on', b.dataset.s === src));
    const cfg = WS[id];
    let T, P, label = '';
    if (src === 'mine' && hasMyData(id)) { const st = Store.s.ws[id]; T = {}; cfg.tables.forEach(t => T[t.k] = numRows(st.tables[t.k]).filter(r => Object.values(r).some(isFinite))); P = numParams(st.params); }
    else { T = {}; cfg.tables.forEach(t => T[t.k] = cfg.sample.tables[t.k]); P = cfg.sample.params; label = src === 'mine' ? 'You have no readings for this experiment yet, so illustrative sample data is shown.' : 'Illustrative sample data — replace with your own readings in the workspace.'; }
    let out = null, err = '';
    try { out = cfg.calc(T, P); } catch (x) { err = typeof x === 'string' ? x : x.message; }
    const pf = Store.s.profile, d = DIAGRAMS[id](), f0 = e.formulas[0], er = out ? errCompute(id, T, P, out.meta) : null, erl = er ? errResultLine(er) : null;
    const hdr = (k, l) => `<div><span>${l}</span><input data-pf="${k}" value="${esc(pf[k] || '')}" placeholder="—" aria-label="${l}"></div>`;
    $('#recHost').innerHTML = `<article class="paper">
      <div class="paper-head"><div><span>Experiment No.</span><b>${e.num}</b></div><div><span>Date</span><input type="date" id="recDate" value="${todayKey()}" aria-label="Date"></div>${hdr('name', 'Name')}${hdr('roll', 'Roll No.')}${hdr('branch', 'Branch / Section')}</div>
      <h1>${e.title}</h1><p class="paper-sub">${e.subtitle}${pf.college ? ' · ' + esc(pf.college) : ''}</p>
      ${label ? `<p class="paper-note">${label}</p>` : ''}
      <h3>1. Aim</h3><p>${e.aim}</p>
      <h3>2. Apparatus</h3><ol>${e.apparatus.map(a => `<li>${a}</li>`).join('')}</ol>
      <h3>3. Formula</h3><div class="paper-formula">${tex(f0.tex, true)}</div>
      ${f0.vars.length ? `<p class="paper-small">where ${f0.vars.map(v => `${symHtml(v[0])} = ${v[1].toLowerCase()} (${v[2]})`).join('; ')}.</p>` : ''}
      <h3>4. Diagram</h3><div class="paper-diagram">${d.svg}</div>
      ${APPARATUS[id] ? `<p class="paper-small" style="margin-top:12px"><b>Apparatus connections</b></p><div class="paper-app">${(id === 'diode' ? APPARATUS.diode('forward') : APPARATUS[id]()).svg}</div><p class="paper-app-cap">${id === 'diode' ? 'Forward bias shown. For reverse bias, swap the diode ends, use the µA meter and connect the voltmeter across the µA meter + diode.' : 'Red leads to (+) terminals, black to (−); ammeter in series, voltmeter in parallel.'}</p>` : ''}
      <h3>5. Procedure</h3><ol>${e.procedure.map(p => `<li>${p}</li>`).join('')}</ol>
      <h3>6. Observations</h3>
      ${cfg.params.length ? `<p class="paper-small">${cfg.params.map(p => `${p.label} = <b>${P[p.k]}</b> ${p.unit}`).join(' · ')}</p>` : ''}
      ${cfg.tables.map(t => `<p class="paper-small"><b>${t.title}</b></p><table class="paper-table"><thead><tr><th>S. No.</th>${t.cols.map(c => `<th>${c.label}</th>`).join('')}${t.derived.map(x => `<th>${x.label}</th>`).join('')}</tr></thead><tbody>${T[t.k].map((r, i) => `<tr><td>${i + 1}</td>${t.cols.map(c => `<td>${isFinite(r[c.k]) ? r[c.k] : ''}</td>`).join('')}${t.derived.map(x => { const v = x.f(r, P); return `<td>${isFinite(v) ? fx(v, x.d) : ''}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`).join('')}
      ${out ? `<h3>7. Calculations</h3><div class="calc-steps">${out.steps.join('')}</div>
      <h3>8. Graph</h3>${out.charts.map((c, i) => `<p class="paper-small"><b>${c.title}</b></p><div class="paper-chart"><canvas id="recC${i}"></canvas></div><div class="scale-note paper-scale">${graphScaleHtml(c.spec)}</div>`).join('')}
      ${er ? `<h3>9. Error analysis</h3><div class="paper-formula">${tex(er.tex, true)}</div><table class="paper-table"><tbody>${er.terms.map(t => `<tr><td style="text-align:left">${t[0]}</td><td>${(t[1] * 100).toFixed(2)} %</td></tr>`).join('')}<tr><td style="text-align:left"><b>Maximum probable error</b></td><td><b>${(erl.rel * 100).toFixed(2)} %</b></td></tr></tbody></table>` : ''}
      <h3>${er ? 10 : 9}. Result</h3><div class="paper-result"><p><b>${out.sub}:</b> ${out.headline}${erl ? `<br>With error: <b>${erl.text}</b>` : ''}</p>${out.results.map(r => `<span>${r[0]}: <b>${r[1]}</b></span>`).join('')}</div>` : `<p class="paper-note">${esc(err || 'Not enough readings to calculate.')}</p>`}
      <h3>${er ? 11 : out ? 10 : 7}. Precautions</h3><ol>${e.precautions.map(p => `<li>${p}</li>`).join('')}</ol>
      <div class="paper-sign"><div>Signature of student</div><div>Signature of faculty</div></div>
    </article>`;
    renderMath($('#recHost'));
    if (out) out.charts.forEach((c, i) => plot($('#recC' + i), { ...c.spec, paper: true }));
    refreshIcons();
    $$('#recHost [data-pf]').forEach(i => i.oninput = () => { Store.s.profile[i.dataset.pf] = i.value; saveSoon(); });
  };
  $('#recSrc').onclick = ev => { const b = ev.target.closest('button'); if (!b) return; src = b.dataset.s; draw(); };
  $('#recPrint').onclick = () => window.print();
  draw();
}

/* ================= LAB TOOLKIT: units, constants, calculators, scale ================= */
const CONSTS = [
  ['h', 'Planck’s constant', 6.62607015e-34, 'J s'], ['hbar', 'Reduced Planck constant ħ', 1.054571817e-34, 'J s'], ['c', 'Speed of light', 2.99792458e8, 'm s⁻¹'],
  ['e', 'Elementary charge', 1.602176634e-19, 'C'], ['me', 'Electron mass', 9.1093837015e-31, 'kg'], ['kB', 'Boltzmann constant', 1.380649e-23, 'J K⁻¹'],
  ['NA', 'Avogadro constant', 6.02214076e23, 'mol⁻¹'], ['g', 'Standard gravity', 9.80665, 'm s⁻²'], ['eps0', 'Permittivity of free space ε₀', 8.8541878128e-12, 'F m⁻¹'],
  ['mu0', 'Permeability of free space μ₀', 1.25663706212e-6, 'N A⁻²'], ['eV', 'Electron-volt', 1.602176634e-19, 'J'], ['VT', 'Thermal voltage at 300 K', 0.025852, 'V']
];
const UNITS = {
  Length: { 'm': 1, 'km': 1e3, 'cm': 1e-2, 'mm': 1e-3, 'µm': 1e-6, 'nm': 1e-9, 'Å': 1e-10 },
  Energy: { 'J': 1, 'eV': 1.602176634e-19, 'keV': 1.602176634e-16, 'MeV': 1.602176634e-13, 'erg': 1e-7, 'cal': 4.184 },
  Mass: { 'kg': 1, 'g': 1e-3, 'mg': 1e-6 },
  Time: { 's': 1, 'ms': 1e-3, 'µs': 1e-6, 'min': 60, 'h': 3600 },
  Current: { 'A': 1, 'mA': 1e-3, 'µA': 1e-6, 'nA': 1e-9 },
  Voltage: { 'V': 1, 'mV': 1e-3, 'kV': 1e3 },
  Power: { 'W': 1, 'mW': 1e-3, 'kW': 1e3 },
  Irradiance: { 'W/m²': 1, 'mW/cm²': 10, 'W/cm²': 1e4, 'lux (sunlight, ≈)': 1 / 120 },
  'Linear density': { 'kg/m': 1, 'g/m': 1e-3, 'g/cm': 0.1 },
  Angle: { 'rad': 1, 'degree': Math.PI / 180, 'arc-min': Math.PI / 10800 },
  Temperature: { '°C': 'C', 'K': 'K', '°F': 'F' }
};
function convTemp(v, from, to) { const k = from === 'K' ? v : from === 'C' ? v + 273.15 : (v - 32) * 5 / 9 + 273.15; return to === 'K' ? k : to === 'C' ? k - 273.15 : (k - 273.15) * 9 / 5 + 32; }
const FNS = { sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, log: Math.log10, ln: Math.log, exp: Math.exp, abs: Math.abs, pow: Math.pow, pi: Math.PI };
function safeEval(expr) {
  const names = Object.fromEntries([...CONSTS.map(c => [c[0], c[2]]), ...Object.entries(FNS)]);
  const re = /\s*(\d*\.?\d+(?:[eE][+-]?\d+)?|[A-Za-z_]\w*|\*\*|[-+*/^(),%])/y; let out = '', m; re.lastIndex = 0;
  const src = expr.trim(); if (!src) throw 'Enter an expression';
  while (re.lastIndex < src.length) {
    const at = re.lastIndex; m = re.exec(src);
    if (!m || m.index !== at) throw `Unexpected character near “${src.slice(at, at + 6)}”`;
    const tok = m[1];
    if (/^[A-Za-z_]/.test(tok)) { if (!(tok in names)) throw `Unknown name “${tok}”`; out += `N.${tok}`; }
    else if (tok === '^') out += '**'; else if (tok === '%') throw 'Use /100 instead of %'; else out += tok;
  }
  let v; try { v = Function('N', `"use strict"; return (${out});`)(names); } catch (e) { throw 'Incomplete or invalid expression'; }
  if (typeof v !== 'number' || !isFinite(v)) throw 'Result is not a finite number';
  return v;
}
VIEWS.toolkit = () => `<div class="page-head"><div><span class="eyebrow">Exam toolkit</span><h1>Lab Toolkit</h1><p>Unit converter, physical constants, a scientific calculator that knows the constants, light energy conversions, least-count and percentage-error calculators, and a graph-paper scale helper.</p></div></div>
  <div class="grid g2">
    <div class="card"><h3>${icon('arrow-left-right')} Unit converter</h3>
      <div class="field" style="margin-bottom:10px"><label for="ucCat">Quantity</label><select class="input" id="ucCat">${Object.keys(UNITS).map(k => `<option>${k}</option>`).join('')}</select></div>
      <div class="grid g3" style="align-items:end"><div class="field"><label for="ucVal">Value</label><input class="input mono" id="ucVal" type="number" step="any" value="589.3"></div><div class="field"><label for="ucFrom">From</label><select class="input" id="ucFrom"></select></div><div class="field"><label for="ucTo">To</label><select class="input" id="ucTo"></select></div></div>
      <div class="result-box" style="margin-top:12px;padding:12px 16px"><div class="big mono" id="ucOut" style="font-size:18px">—</div></div><div id="ucAll" class="readouts" style="margin-top:10px"></div></div>
    <div class="card"><h3>${icon('sun')} Light: wavelength ↔ frequency ↔ photon energy</h3><p class="muted" style="font-size:13px;margin-top:0">Edit any one box; the others update. Uses c = 2.998 × 10⁸ m/s and h = 6.626 × 10⁻³⁴ J s.</p>
      <div class="grid g3"><div class="field"><label for="lmL">Wavelength λ (nm)</label><input class="input mono" id="lmL" type="number" step="any" value="589.3"></div><div class="field"><label for="lmF">Frequency ν (× 10¹⁴ Hz)</label><input class="input mono" id="lmF" type="number" step="any"></div><div class="field"><label for="lmE">Photon energy (eV)</label><input class="input mono" id="lmE" type="number" step="any"></div></div>
      <div class="readouts" id="lmMore" style="margin-top:12px"></div><div id="lmSwatch" style="height:14px;border-radius:7px;margin-top:12px"></div></div>
    <div class="card"><h3>${icon('calculator')} Scientific calculator</h3><p class="muted" style="font-size:13px;margin-top:0">Use constants by name (h, c, e, me, kB, g, eps0 …) and functions sqrt, sin, cos, tan, log, ln, exp, pi. Powers: ^ or **. Angles in radians.</p>
      <div class="row" style="flex-wrap:nowrap"><input class="input mono" id="calcIn" placeholder="h*c/(589.3e-9*e)" aria-label="Expression"><button class="btn primary" id="calcGo">=</button></div>
      <div class="result-box" style="margin-top:12px;padding:12px 16px"><div class="big mono" id="calcOut" style="font-size:18px">—</div></div>
      <div class="row" style="margin-top:10px" id="calcEx">${['h*c/(589.3e-9*e)', '4*pi^2*0.6167/1.5753^2', '1/(2*0.3672)*sqrt(2*g/5.55e-4)', 'kB*300/e'].map(x => `<button class="chip mono" data-ex="${x}">${x}</button>`).join('')}</div><div id="calcHist" class="dim mono" style="font-size:12px;margin-top:10px"></div></div>
    <div class="card"><h3>${icon('atom')} Physical constants (CODATA 2018)</h3><div class="table-wrap"><table class="data" style="min-width:0"><thead><tr><th>Name</th><th>Symbol</th><th>Value</th><th></th></tr></thead><tbody>${CONSTS.map(c => `<tr><td style="font-family:var(--font);white-space:normal">${c[1]}</td><td>${c[0]}</td><td>${Math.abs(c[2]) >= 1e-3 && Math.abs(c[2]) < 1e5 ? c[2] : sci(c[2], 4)} ${c[3]}</td><td class="act"><button class="row-del" data-ins="${c[0]}" aria-label="Insert ${c[0]} in calculator" title="Insert in calculator">${icon('corner-down-left')}</button></td></tr>`).join('')}</tbody></table></div></div>
    <div class="card"><h3>${icon('ruler')} Least count & percentage error</h3>
      <div class="grid g2"><div class="field"><label for="lcM">Value of 1 main-scale division</label><input class="input mono" id="lcM" type="number" step="any" value="0.05"></div><div class="field"><label for="lcN">No. of vernier / circular divisions</label><input class="input mono" id="lcN" type="number" step="any" value="50"></div></div>
      <p class="mono" id="lcOut" style="margin:10px 0 16px"></p>
      <div class="grid g2"><div class="field"><label for="peX">Experimental value</label><input class="input mono" id="peX" type="number" step="any" value="590.2"></div><div class="field"><label for="peS">Standard value</label><input class="input mono" id="peS" type="number" step="any" value="589.3"></div></div>
      <p class="mono" id="peOut" style="margin:10px 0 0"></p></div>
    <div class="card"><h3>${icon('grid-3x3')} Graph-paper scale helper</h3><p class="muted" style="font-size:13px;margin-top:0">Enter the smallest and largest values on each axis. The helper picks a 1-2-5 scale that uses as much of the sheet as possible.</p>
      <div class="grid g2"><div class="field"><label for="gsX0">X min</label><input class="input mono" id="gsX0" type="number" step="any" value="0"></div><div class="field"><label for="gsX1">X max</label><input class="input mono" id="gsX1" type="number" step="any" value="20"></div><div class="field"><label for="gsY0">Y min</label><input class="input mono" id="gsY0" type="number" step="any" value="0.048"></div><div class="field"><label for="gsY1">Y max</label><input class="input mono" id="gsY1" type="number" step="any" value="0.473"></div></div>
      <div class="seg" id="gsPaper" style="margin-top:12px"><button data-p="p" class="on">A4 portrait (18 × 25 cm)</button><button data-p="l">A4 landscape (25 × 18 cm)</button></div>
      <div class="scale-note" id="gsOut" style="margin-top:12px"></div></div>
  </div>`;
function mountToolkit() {
  // unit converter
  const fill = () => { const u = Object.keys(UNITS[$('#ucCat').value]); $('#ucFrom').innerHTML = u.map(x => `<option>${x}</option>`).join(''); $('#ucTo').innerHTML = u.map((x, i) => `<option ${i === 1 ? 'selected' : ''}>${x}</option>`).join(''); };
  const conv = () => {
    const cat = $('#ucCat').value, U = UNITS[cat], v = parseFloat($('#ucVal').value), f = $('#ucFrom').value, t = $('#ucTo').value;
    if (!isFinite(v)) { $('#ucOut').textContent = '—'; $('#ucAll').innerHTML = ''; return; }
    const to = x => cat === 'Temperature' ? convTemp(v, U[f], U[x]) : v * U[f] / U[x];
    $('#ucOut').innerHTML = `${v} ${f} = ${fmt(to(t), 6)} ${t}`;
    $('#ucAll').innerHTML = Object.keys(U).filter(x => x !== f).map(x => `<div class="readout"><span>${x}</span><b>${fmt(to(x), 5)}</b></div>`).join('');
  };
  $('#ucCat').onchange = () => { fill(); conv(); }; ['#ucVal', '#ucFrom', '#ucTo'].forEach(s => $(s).oninput = conv);
  $('#ucCat').value = 'Length'; fill(); $('#ucFrom').value = 'nm'; $('#ucTo').value = 'm'; conv();
  // light
  const hc = PHYS.h * PHYS.c;
  const light = from => {
    let lam;
    if (from === 'L') lam = parseFloat($('#lmL').value) * 1e-9; else if (from === 'F') lam = PHYS.c / (parseFloat($('#lmF').value) * 1e14); else lam = hc / (parseFloat($('#lmE').value) * PHYS.e);
    if (!(lam > 0) || !isFinite(lam)) return;
    if (from !== 'L') $('#lmL').value = +(lam * 1e9).toFixed(3); if (from !== 'F') $('#lmF').value = +(PHYS.c / lam / 1e14).toFixed(5); if (from !== 'E') $('#lmE').value = +(hc / lam / PHYS.e).toFixed(5);
    $('#lmMore').innerHTML = `<div class="readout"><span>Photon energy (J)</span><b>${sci(hc / lam, 4)}</b></div><div class="readout"><span>Wavenumber</span><b>${fmt(1 / lam / 100, 6)} cm⁻¹</b></div><div class="readout"><span>Momentum h/λ</span><b>${sci(PHYS.h / lam, 3)} kg m/s</b></div><div class="readout"><span>Region</span><b>${lam < 380e-9 ? 'Ultraviolet' : lam <= 750e-9 ? 'Visible' : 'Infrared'}</b></div>`;
    const nm = lam * 1e9; $('#lmSwatch').style.background = nm >= 380 && nm <= 780 ? rgbStr(waveRGB(nm)) : 'repeating-linear-gradient(45deg,#334155 0 6px,#1e293b 6px 12px)';
  };
  $('#lmL').oninput = () => light('L'); $('#lmF').oninput = () => light('F'); $('#lmE').oninput = () => light('E'); light('L');
  // calculator
  const hist = [];
  const calc = () => { const x = $('#calcIn').value; try { const v = safeEval(x); $('#calcOut').innerHTML = `= ${fmt(v, 6)}`; hist.unshift(`${x} = ${Number(v.toPrecision(6))}`); $('#calcHist').innerHTML = hist.slice(0, 5).map(esc).join('<br>'); } catch (er) { $('#calcOut').innerHTML = `<span style="color:var(--red);font-size:14px">${esc(String(er))}</span>`; } };
  $('#calcGo').onclick = calc; $('#calcIn').onkeydown = ev => { if (ev.key === 'Enter') calc(); };
  $('#calcEx').onclick = ev => { const b = ev.target.closest('[data-ex]'); if (!b) return; $('#calcIn').value = b.dataset.ex; calc(); };
  $$('[data-ins]').forEach(b => b.onclick = () => { const i = $('#calcIn'); i.value += b.dataset.ins; i.focus(); });
  // least count & % error
  const lc = () => { const m = parseFloat($('#lcM').value), n = parseFloat($('#lcN').value); $('#lcOut').innerHTML = m > 0 && n > 0 ? `Least count = ${m} / ${n} = <b>${Number((m / n).toPrecision(4))}</b> (same unit as the main scale)` : 'Enter positive values'; };
  const pe = () => { const x = parseFloat($('#peX').value), s = parseFloat($('#peS').value); $('#peOut').innerHTML = isFinite(x) && s ? `% error = |${x} − ${s}| / ${s} × 100 = <b>${pctErr(x, s).toFixed(3)} %</b>` : 'Enter both values'; };
  ['#lcM', '#lcN'].forEach(s => $(s).oninput = lc); ['#peX', '#peS'].forEach(s => $(s).oninput = pe); lc(); pe();
  // scale helper
  let land = false;
  const gs = () => {
    const v = ['#gsX0', '#gsX1', '#gsY0', '#gsY1'].map(s => parseFloat($(s).value));
    if (v.some(x => !isFinite(x))) { $('#gsOut').innerHTML = 'Enter all four values.'; return; }
    const spec = { datasets: [{ data: [{ x: v[0], y: v[2] }, { x: v[1], y: v[3] }] }], x: { title: 'X' }, y: { title: 'Y' } };
    $('#gsOut').innerHTML = graphScaleHtml(spec, land ? { x: 25, y: 18, name: 'A4 landscape (25 × 18 cm)' } : { x: 18, y: 25, name: 'A4 portrait (18 × 25 cm)' }); refreshIcons();
  };
  ['#gsX0', '#gsX1', '#gsY0', '#gsY1'].forEach(s => $(s).oninput = gs);
  $('#gsPaper').onclick = ev => { const b = ev.target.closest('button'); if (!b) return; land = b.dataset.p === 'l'; $$('#gsPaper button').forEach(x => x.classList.toggle('on', x === b)); gs(); };
  gs();
}

/* ================= MOCK VIVA ================= */
let MV = null, mvTimer = null;
function mvSpeak(text) { try { if (!MV || !MV.voice || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, '')); u.rate = 1; u.lang = 'en-IN'; speechSynthesis.speak(u); } catch (e) { } }
function mockCleanup() { clearInterval(mvTimer); try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) { } }
VIEWS.mock = () => `<div class="page-head"><div><span class="eyebrow">Exam toolkit</span><h1>Mock Viva Interview</h1><p>The examiner asks; you answer aloud before the timer runs out, then reveal the model answer and grade yourself honestly.${window.speechSynthesis ? ' Questions can be read aloud by your browser.' : ''}</p></div></div><div id="mvHost" class="quiz-wrap"></div>`;
function mountMock() { MV = null; mvSetup(); }
function mvSetup() {
  mockCleanup();
  const hasVoice = !!window.speechSynthesis;
  let chosen = new Set(EXPS.map(e => e.id)), n = 10, secs = 60, voice = hasVoice;
  const hist = Store.s.mockHistory.slice(-5).reverse();
  $('#mvHost').innerHTML = `<div class="card pad-lg"><h3>${icon('mic')} Set up the interview</h3>
    <div class="field" style="margin-bottom:16px"><label>Experiments</label><div class="row" id="mvExps">${EXPS.map(e => `<button class="chip on" data-e="${e.id}" aria-pressed="true"><span class="dot" style="background:${e.color}"></span>${e.title}</button>`).join('')}</div></div>
    <div class="grid g3 quiz-setup" style="margin-bottom:20px">
      <div class="field"><label>Questions</label><div class="seg" id="mvN">${[5, 10, 15].map(x => `<button data-n="${x}" class="${x === n ? 'on' : ''}">${x}</button>`).join('')}</div></div>
      <div class="field"><label>Time to answer</label><div class="seg" id="mvT">${[30, 60, 90].map(x => `<button data-t="${x}" class="${x === secs ? 'on' : ''}">${x} s</button>`).join('')}</div></div>
      <div class="field"><label>Read questions aloud</label><div class="seg" id="mvV"><button data-v="1" class="${voice ? 'on' : ''}" ${hasVoice ? '' : 'disabled'}>On</button><button data-v="0" class="${voice ? '' : 'on'}">Off</button></div></div>
    </div><button class="btn primary" id="mvStart">${icon('play')} Start interview</button></div>
    ${hist.length ? `<div class="card" style="margin-top:18px"><h3>${icon('history')} Recent interviews</h3>${hist.map(h => `<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span>${new Date(h.date).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><span class="dim">${h.n} questions</span><b class="mono">${Math.round(h.score / h.max * 100)}%</b></div>`).join('')}</div>` : ''}`;
  refreshIcons();
  $('#mvExps').onclick = ev => { const c = ev.target.closest('.chip'); if (!c) return; chosen.has(c.dataset.e) ? chosen.delete(c.dataset.e) : chosen.add(c.dataset.e); c.classList.toggle('on'); c.setAttribute('aria-pressed', chosen.has(c.dataset.e)); $('#mvStart').disabled = !chosen.size; };
  const seg = (id, a, set) => $(id).onclick = ev => { const b = ev.target.closest('button'); if (!b || b.disabled) return; $$(id + ' button').forEach(x => x.classList.toggle('on', x === b)); set(b.dataset[a]); };
  seg('#mvN', 'n', v => n = +v); seg('#mvT', 't', v => secs = +v); seg('#mvV', 'v', v => voice = v === '1');
  $('#mvStart').onclick = () => {
    const pool = shuffle(ALL_VIVA().filter(v => chosen.has(v.exp.id)));
    // prefer unmarked / review questions first
    pool.sort((a, b) => (Store.s.viva[a.id] === 'known') - (Store.s.viva[b.id] === 'known'));
    MV = { qs: pool.slice(0, n).map(q => ({ ...q, grade: null })), i: 0, secs, voice, revealed: false, exps: [...chosen] };
    mvQuestion();
  };
}
function mvQuestion() {
  mockCleanup();
  const q = MV.qs[MV.i]; MV.revealed = false; MV.tLeft = MV.secs;
  $('#mvHost').innerHTML = `<div class="card pad-lg">
    <div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="tag" style="color:${q.exp.color}">${q.exp.num}. ${q.exp.title}</span><span class="mono dim">Question ${MV.i + 1} / ${MV.qs.length}</span></div>
    <div class="progress" style="margin-bottom:22px"><i style="width:${MV.i / MV.qs.length * 100}%"></i></div>
    <div class="row" style="gap:14px;align-items:flex-start;flex-wrap:nowrap"><span class="exp-icon" style="background:rgba(139,92,246,.15);color:var(--violet-2)">${icon('user-round')}</span><div><div class="dim" style="font-size:12px;text-transform:uppercase;letter-spacing:.1em">Examiner asks</div><h2 style="font-size:21px;font-family:var(--font);font-weight:600;line-height:1.45;margin-top:4px">${q.q}</h2></div></div>
    <div style="margin:22px 0 6px" class="row"><div class="progress" style="flex:1;height:8px"><i id="mvBar" style="width:100%;background:linear-gradient(90deg,#34d399,#fbbf24,#f87171)"></i></div><b class="mono" id="mvClock">${MV.tLeft}s</b></div>
    <div id="mvAns"></div>
    <div class="row" style="justify-content:space-between;margin-top:18px" id="mvBtns"><div class="row"><button class="btn ghost sm" id="mvQuit">${icon('x')} End</button>${window.speechSynthesis ? `<button class="btn sm" id="mvRepeat">${icon('volume-2')} Repeat</button>` : ''}</div><button class="btn primary" id="mvReveal">${icon('eye')} Reveal answer <kbd>Space</kbd></button></div></div>`;
  refreshIcons();
  mvSpeak(q.q);
  $('#mvReveal').onclick = mvReveal;
  const rp = $('#mvRepeat'); if (rp) rp.onclick = () => { const v = MV.voice; MV.voice = true; mvSpeak(q.q); MV.voice = v; };
  $('#mvQuit').onclick = () => { if (MV.qs.some(x => x.grade != null)) { MV.qs = MV.qs.filter(x => x.grade != null); mvResult(); } else { MV = null; mvSetup(); } };
  mvTimer = setInterval(() => {
    if (!MV || !$('#mvClock')) return clearInterval(mvTimer);
    MV.tLeft--; $('#mvClock').textContent = Math.max(0, MV.tLeft) + 's'; $('#mvBar').style.width = Math.max(0, MV.tLeft / MV.secs * 100) + '%';
    if (MV.tLeft <= 0) { clearInterval(mvTimer); if (!MV.revealed) { toast('Time up — compare with the model answer', 'timer'); mvReveal(); } }
  }, 1000);
}
function mvReveal() {
  if (!MV || MV.revealed) return; MV.revealed = true; clearInterval(mvTimer);
  const q = MV.qs[MV.i];
  $('#mvAns').innerHTML = `<div class="callout cyan" style="margin-top:14px"><b>Model answer:</b> ${q.a}</div><p class="muted" style="font-size:13.5px;margin:10px 0 0">How did your answer compare?</p>`;
  $('#mvBtns').innerHTML = `<button class="btn ghost sm" id="mvQuit2">${icon('x')} End</button><div class="row"><button class="btn danger" data-gr="0">${icon('x-circle')} Missed <kbd>3</kbd></button><button class="btn" data-gr="1">${icon('circle-dot')} Partly <kbd>2</kbd></button><button class="btn primary" data-gr="2">${icon('check-circle-2')} Got it <kbd>1</kbd></button></div>`;
  refreshIcons();
  $$('[data-gr]').forEach(b => b.onclick = () => mvGrade(+b.dataset.gr));
  $('#mvQuit2').onclick = () => { MV.qs = MV.qs.filter(x => x.grade != null); if (MV.qs.length) mvResult(); else { MV = null; mvSetup(); } };
}
function mvGrade(g) {
  if (!MV || !MV.revealed) return;
  MV.qs[MV.i].grade = g;
  if (MV.i < MV.qs.length - 1) { MV.i++; mvQuestion(); } else mvResult();
}
function mvResult() {
  mockCleanup();
  const score = MV.qs.reduce((s, q) => s + (q.grade || 0), 0), max = MV.qs.length * 2, pct = Math.round(score / max * 100);
  Store.s.mockHistory.push({ date: Date.now(), score, max, n: MV.qs.length, exps: MV.exps }); Store.save();
  const missed = MV.qs.filter(q => q.grade < 2), verdict = pct >= 85 ? 'Excellent — you would impress the examiner.' : pct >= 65 ? 'Good — polish the questions marked below.' : pct >= 40 ? 'Fair — revise the theory and try again.' : 'Needs work — go through the viva bank for these experiments.';
  $('#mvHost').innerHTML = `<div class="card pad-lg" style="text-align:center"><div class="stat" style="align-items:center"><span class="k">Interview score</span><span class="v" style="font-size:44px">${pct}%</span><span class="s">${score} / ${max} points · ${MV.qs.filter(q => q.grade === 2).length} full, ${MV.qs.filter(q => q.grade === 1).length} partial, ${MV.qs.filter(q => q.grade === 0).length} missed</span></div><p class="muted">${verdict}</p>
    <div class="row" style="justify-content:center">${missed.length ? `<button class="btn" id="mvMark">${icon('rotate-cw')} Mark ${missed.length} for review in Viva Bank</button>` : ''}<button class="btn primary" id="mvAgain">${icon('rotate-ccw')} New interview</button></div></div>
    ${missed.length ? `<h3 style="font-size:17px;margin:22px 0 12px">Questions to revise</h3>${missed.map(q => `<div class="card" style="margin-bottom:10px;padding:16px;border-left:3px solid ${q.grade === 1 ? 'var(--amber)' : 'var(--red)'}"><div style="font-weight:600;margin-bottom:6px">${q.q} <span class="tag" style="margin-left:6px">${q.exp.title}</span></div><div class="muted" style="font-size:13.5px">${q.a}</div></div>`).join('')}` : ''}`;
  refreshIcons();
  const mk = $('#mvMark'); if (mk) mk.onclick = () => { missed.forEach(q => Store.s.viva[q.id] = 'review'); Store.save(); mk.disabled = true; toast(`${missed.length} questions marked for review`, 'rotate-cw'); };
  $('#mvAgain').onclick = () => { MV = null; mvSetup(); };
}

/* ================= STUDY PLANNER ================= */
function planTasks() {
  const order = EXPS.slice().sort((a, b) => expProgress(a.id).pct - expProgress(b.id).pct || a.num - b.num);
  const core = []; order.forEach(e => {
    core.push({ id: `${e.id}-theory`, text: `${e.title}: aim, principle, theory & derivation`, href: `#/exp/${e.id}/theory`, exp: e.id });
    core.push({ id: `${e.id}-setup`, text: `${e.title}: procedure, diagram & simulation`, href: `#/exp/${e.id}/diagram`, exp: e.id });
    core.push({ id: `${e.id}-calc`, text: `${e.title}: observation table, calculation & graph`, href: `#/exp/${e.id}/observations`, exp: e.id });
    core.push({ id: `${e.id}-viva`, text: `${e.title}: viva questions + quiz`, href: `#/exp/${e.id}/viva`, exp: e.id });
  });
  const finals = [{ id: 'fin-rev', text: 'Quick revision of all 8 experiments', href: '#/revision' }, { id: 'fin-mock', text: 'Mock viva interview (15 questions)', href: '#/mock' }, { id: 'fin-quiz', text: 'Full quiz — 20 questions, all experiments', href: '#/quiz' }, { id: 'fin-check', text: 'Go through the exam-day checklist', href: '#/checklist' }];
  return { core, finals, order };
}
function buildPlan() {
  const d = Store.s.exam.date ? new Date(Store.s.exam.date) : null;
  if (!d || isNaN(d)) return { error: 'noDate' };
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const examDay = new Date(d); examDay.setHours(0, 0, 0, 0);
  const days = Math.round((examDay - start) / 864e5);
  if (days < 1) return { error: 'past' };
  const { core, finals, order } = planTasks();
  const plan = { exam: Store.s.exam.date, created: Date.now(), days: [] };
  const dayDate = i => { const x = new Date(start); x.setDate(x.getDate() + i); return todayKey(x); };
  if (days <= 2) {
    const quick = order.map(e => ({ id: `${e.id}-quick`, text: `${e.title}: quick revision sheet + top viva`, href: `#/revision/${e.id}`, exp: e.id }));
    const all = [...quick, ...finals], L = all.length;
    for (let i = 0; i < days; i++) plan.days.push({ date: dayDate(i), tasks: all.slice(Math.round(i * L / days), Math.round((i + 1) * L / days)) });
  } else {
    const rev = days >= 10 ? 2 : 1, study = days - rev, L = core.length;
    for (let i = 0; i < study; i++) plan.days.push({ date: dayDate(i), tasks: core.slice(Math.round(i * L / study), Math.round((i + 1) * L / study)) });
    for (let i = 0; i < rev; i++) plan.days.push({ date: dayDate(study + i), tasks: rev === 1 ? finals : finals.slice(i * 2, i * 2 + 2) });
  }
  plan.days = plan.days.filter(x => x.tasks.length);
  return plan;
}
VIEWS.planner = () => `<div class="page-head"><div><span class="eyebrow">Exam toolkit</span><h1>Study Planner</h1><p>A day-by-day plan from today to your exam. Experiments you have completed least are scheduled first; the last day(s) are kept for revision, a mock viva and a full quiz.</p></div><div class="row" id="plActions"></div></div><div id="plHost"></div>`;
function mountPlanner() {
  const host = $('#plHost');
  const draw = () => {
    const pl = Store.s.plan, diff = examDiff();
    if (diff == null || diff <= 0) {
      $('#plActions').innerHTML = '';
      host.innerHTML = `<div class="card pad-lg" style="max-width:640px"><h3>${icon('calendar-plus')} When is your practical exam?</h3><p class="muted">${diff != null && diff <= 0 ? 'Your saved exam date has passed. Set the next one to build a new plan.' : 'Set the exam date and time to build your plan.'}</p><div class="row"><input type="datetime-local" class="input" id="plDate" style="max-width:260px" aria-label="Exam date and time"><button class="btn primary" id="plSave">${icon('sparkles')} Build my plan</button></div></div>`;
      refreshIcons();
      $('#plSave').onclick = () => { const v = $('#plDate').value; if (!v) return toast('Pick a date first', 'alert-circle'); Store.s.exam.date = v; const p = buildPlan(); if (p.error) return toast(p.error === 'past' ? 'Pick a date after today' : 'Invalid date', 'alert-circle'); Store.s.plan = p; Store.save(); updateSideCount(); draw(); toast('Study plan created'); };
      return;
    }
    if (!pl || pl.exam !== Store.s.exam.date) { const p = buildPlan(); if (!p.error) { Store.s.plan = p; Store.save(); } }
    const plan = Store.s.plan; if (!plan || plan.error) { host.innerHTML = `<div class="empty">Could not build a plan for this date.</div>`; return; }
    const all = plan.days.flatMap(x => x.tasks), done = all.filter(t => Store.s.planDone[t.id]).length, tk = todayKey();
    const overdue = plan.days.filter(x => x.date < tk).flatMap(x => x.tasks).filter(t => !Store.s.planDone[t.id]);
    $('#plActions').innerHTML = `<button class="btn" id="plRegen">${icon('refresh-cw')} Rebuild plan</button><button class="btn" onclick="window.print()">${icon('printer')} Print</button>`;
    host.innerHTML = `<div class="grid g3" style="margin-bottom:18px"><div class="card"><div class="stat"><span class="k">${icon('calendar-clock')} Days to exam</span><span class="v">${Math.ceil(diff / 864e5)}</span><span class="s">${new Date(Store.s.exam.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span></div></div>
      <div class="card"><div class="stat"><span class="k">${icon('list-checks')} Tasks done</span><span class="v">${done}/${all.length}</span><div class="progress" style="margin-top:6px"><i style="width:${all.length ? done / all.length * 100 : 0}%"></i></div></div></div>
      <div class="card"><div class="stat"><span class="k">${icon('alarm-clock')} Overdue</span><span class="v" style="color:${overdue.length ? 'var(--amber)' : 'inherit'}">${overdue.length}</span><span class="s">${overdue.length ? 'Rebuild to spread them over the remaining days' : 'You are on track'}</span></div></div></div>
      <div class="grid g2">${plan.days.map(day => { const dt = new Date(day.date + 'T00:00'), rel = day.date === tk ? 'Today' : day.date < tk ? 'Past' : ''; const dd = day.tasks.filter(t => Store.s.planDone[t.id]).length; return `<div class="card plan-day ${day.date === tk ? 'today' : ''} ${day.date < tk ? 'past' : ''}"><div class="row" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">${icon(day.date === tk ? 'sun' : 'calendar')} ${dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</h3><div class="row">${rel ? `<span class="tag ${rel === 'Today' ? 'violet' : ''}">${rel}</span>` : ''}<span class="tag ${dd === day.tasks.length ? 'green' : ''}">${dd}/${day.tasks.length}</span></div></div>
        ${day.tasks.map(t => `<label class="plan-task ${Store.s.planDone[t.id] ? 'done' : ''}"><input type="checkbox" data-pt="${t.id}" ${Store.s.planDone[t.id] ? 'checked' : ''}><span>${t.text}</span><a href="${t.href}" class="btn sm ghost" aria-label="Open">${icon('arrow-up-right')}</a></label>`).join('')}</div>`; }).join('')}</div>`;
    refreshIcons();
    $$('[data-pt]', host).forEach(c => c.onchange = () => { if (c.checked) Store.s.planDone[c.dataset.pt] = true; else delete Store.s.planDone[c.dataset.pt]; Store.save(); draw(); });
    $('#plRegen').onclick = async () => { if (await confirmModal('Rebuild plan?', 'Tasks are re-spread from today to the exam. Ticked tasks stay ticked.', 'Rebuild', false)) { const p = buildPlan(); if (!p.error) { Store.s.plan = p; Store.save(); draw(); toast('Plan rebuilt'); } } };
  };
  draw();
}
function todayPlanHtml() {
  const plan = Store.s.plan; if (!plan || !plan.days || plan.exam !== Store.s.exam.date) return null;
  const tk = todayKey(), day = plan.days.find(x => x.date === tk);
  const overdue = plan.days.filter(x => x.date < tk).flatMap(x => x.tasks).filter(t => !Store.s.planDone[t.id]).length;
  if (!day) return `<p class="muted" style="margin:0 0 12px;font-size:14px">No tasks scheduled today.${overdue ? ` ${overdue} overdue.` : ''}</p><a class="btn sm" href="#/planner">${icon('calendar-check')} Open planner</a>`;
  return `${day.tasks.map(t => `<label class="plan-task ${Store.s.planDone[t.id] ? 'done' : ''}"><input type="checkbox" data-dpt="${t.id}" ${Store.s.planDone[t.id] ? 'checked' : ''}><span>${t.text}</span><a href="${t.href}" class="btn sm ghost" aria-label="Open">${icon('arrow-up-right')}</a></label>`).join('')}${overdue ? `<p class="dim" style="font-size:12.5px;margin:6px 0 0">${overdue} overdue task${overdue > 1 ? 's' : ''} — <a href="#/planner">open planner</a></p>` : ''}`;
}

/* ================= EXAM-DAY CHECKLIST ================= */
const CHECK = [
  { k: 'carry', t: 'Carry to the lab', i: 'backpack', items: ['Completed record book (all experiments signed)', 'Observation notebook', 'College ID card / hall ticket', 'Scientific calculator (non-programmable)', 'Graph sheets (2–3 spare)', 'HB pencils, eraser and sharpener', '30 cm scale and geometry box', 'Two working pens (blue/black)', 'Lab coat / apron if required', 'Watch (phones are usually not allowed)'] },
  { k: 'night', t: 'The night before', i: 'moon', items: ['Revise the working formula of every experiment', 'Memorise standard values (λ_Na, λ_He-Ne, h, g …)', 'Practise drawing each labelled diagram once', 'Do one mock viva interview', 'Re-read precautions and sources of error', 'Sleep at least 7 hours'] },
  { k: 'hall', t: 'In the exam hall', i: 'flask-conical', items: ['Read the question and note the aim', 'Write the formula with the meaning and unit of each symbol', 'Note the least count of every instrument first', 'Draw the observation table before taking readings', 'Take at least the required number of readings, repeat if possible', 'Write units with every quantity', 'Label graph axes with quantity, unit and scale', 'Calculate the result with units and % error', 'Write precautions and sources of error', 'Show calculations clearly; box the final result'] }
];
const RECORD_ITEMS = [['written', 'Record written'], ['diagram', 'Diagram drawn'], ['graph', 'Graph pasted'], ['signed', 'Signed']];
VIEWS.checklist = () => {
  const c = Store.s.checklist, total = CHECK.reduce((s, x) => s + x.items.length, 0) + EXPS.length * RECORD_ITEMS.length;
  const done = Object.values(c).filter(Boolean).length;
  return `<div class="page-head"><div><span class="eyebrow">Exam toolkit</span><h1>Exam-Day Checklist</h1><p>Tick things off as you go. Everything is saved in this browser.</p></div><div class="row"><button class="btn" onclick="window.print()">${icon('printer')} Print</button><button class="btn danger" id="ckReset">${icon('rotate-ccw')} Untick all</button></div></div>
    <div class="card" style="margin-bottom:18px"><div class="row" style="justify-content:space-between"><b>${done} of ${total} done</b><span class="dim">${Math.round(done / total * 100)}%</span></div><div class="progress" style="margin-top:8px;height:8px"><i style="width:${done / total * 100}%"></i></div></div>
    <div class="grid g3">${CHECK.map(sec => `<div class="card"><h3>${icon(sec.i)} ${sec.t}</h3>${sec.items.map((it, i) => { const id = `${sec.k}-${i}`; return `<label class="plan-task ${c[id] ? 'done' : ''}"><input type="checkbox" data-ck="${id}" ${c[id] ? 'checked' : ''}><span>${it}</span></label>`; }).join('')}</div>`).join('')}</div>
    <div class="card" style="margin-top:18px"><h3>${icon('book-check')} Record book status</h3><div class="table-wrap"><table class="data" style="min-width:560px"><thead><tr><th>Experiment</th>${RECORD_ITEMS.map(r => `<th style="text-align:center">${r[1]}</th>`).join('')}</tr></thead><tbody>
      ${EXPS.map(e => `<tr><td style="font-family:var(--font)">${e.num}. ${e.title}</td>${RECORD_ITEMS.map(r => { const id = `rec-${e.id}-${r[0]}`; return `<td style="text-align:center"><input type="checkbox" class="ck-box" data-ck="${id}" ${c[id] ? 'checked' : ''} aria-label="${e.title}: ${r[1]}"></td>`; }).join('')}</tr>`).join('')}</tbody></table></div></div>
    <div class="card" style="margin-top:18px"><h3>${icon('function-square')} Last-minute formulas & standard values</h3><div class="grid g2">${EXPS.map(e => `<div class="rev-formula" style="padding:10px 14px"><div class="row" style="justify-content:space-between"><b style="font-size:13.5px">${e.num}. ${e.title}</b><span class="dim" style="font-size:12px">${e.keyValues[0][0]}: ${e.keyValues[0][1]}</span></div>${tex(e.formulas[0].tex, true)}</div>`).join('')}</div></div>`;
};
function mountChecklist() {
  $$('[data-ck]').forEach(b => b.onchange = () => { if (b.checked) Store.s.checklist[b.dataset.ck] = true; else delete Store.s.checklist[b.dataset.ck]; Store.save(); const y = window.scrollY; route(); window.scrollTo(0, y); });
  $('#ckReset').onclick = async () => { if (await confirmModal('Untick everything?', 'All checklist ticks will be cleared.', 'Untick all')) { Store.s.checklist = {}; Store.save(); route(); } };
}
