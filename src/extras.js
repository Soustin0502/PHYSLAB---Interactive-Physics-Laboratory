/* ---------- Exam simulation, achievements & XP, daily challenge, spoken/typed viva answers, progress report ---------- */

/* =====================================================================
   1. ANSWER SCORING (typed or spoken) — key-point coverage
   ===================================================================== */
const STOP = new Set('about above after again against also although among another because been before being below between both cannot could does doing down during each either else every from further have having here into itself just like made make many more most much must only other ought over same should since some such than that their them then there these they this those though through thus under until upon very what when where which while whom whose will with within without would your called used given gives means which equal equals using value values more less'.split(' '));
function keyTerms(answer) {
  const words = answer.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9α-ωµ⁻\s-]/gi, ' ').split(/\s+/).filter(w => w.length >= 4 && !STOP.has(w));
  const uniq = []; words.forEach(w => { const st = w.slice(0, 6); if (!uniq.some(u => u.slice(0, 6) === st)) uniq.push(w); });
  return uniq.sort((a, b) => b.length - a.length).slice(0, 10);
}
function coverage(answer, said) {
  const terms = keyTerms(answer), s = ' ' + said.toLowerCase().replace(/[^a-z0-9α-ωµ\s-]/gi, ' ') + ' ';
  const hit = terms.filter(t => s.includes(' ' + t.slice(0, Math.min(6, Math.max(4, t.length - 2)))));
  return { terms, hit, pct: terms.length ? hit.length / terms.length : 0 };
}
function coverageHtml(cv) {
  return `<div class="cov"><div class="row" style="justify-content:space-between"><b>Key points covered: ${cv.hit.length} / ${cv.terms.length}</b><span class="tag ${cv.pct >= .6 ? 'green' : cv.pct >= .3 ? 'amber' : 'red'}">${Math.round(cv.pct * 100)}%</span></div><div class="row" style="margin-top:8px;gap:6px">${cv.terms.map(t => `<span class="kw ${cv.hit.includes(t) ? 'hit' : ''}">${esc(t)}</span>`).join('')}</div></div>`;
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let srInst = null;
function stopListening() { try { srInst && srInst.stop(); } catch (e) { } srInst = null; $$('[data-mic]').forEach(b => b.classList.remove('on')); }
function answerBoxHtml(id) { return `<div class="ans-box"><textarea class="input" id="${id}" rows="3" placeholder="${SR ? 'Speak (press the mic) or type' : 'Type'} your answer here — it is compared with the model answer’s key points."></textarea><div class="ans-btns">${SR ? `<button class="icon-btn" data-mic="${id}" aria-label="Answer by voice" title="Answer by voice">${icon('mic')}</button>` : ''}<button class="icon-btn" data-inkfor="${id}" aria-label="Handwrite your answer" title="Handwrite (stylus)">${icon('pen-tool')}</button></div></div>`; }
function bindMic(root) {
  $$('[data-mic]', root).forEach(b => b.onclick = () => {
    if (srInst) { stopListening(); return; }
    const ta = document.getElementById(b.dataset.mic); if (!ta) return;
    try {
      const r = new SR(); r.lang = 'en-IN'; r.continuous = true; r.interimResults = true; const base = ta.value ? ta.value + ' ' : '';
      r.onresult = ev => { let txt = ''; for (let i = 0; i < ev.results.length; i++) txt += ev.results[i][0].transcript; ta.value = base + txt; };
      r.onerror = ev => { toast(ev.error === 'not-allowed' ? 'Microphone permission denied' : 'Voice input stopped', 'mic-off'); stopListening(); };
      r.onend = () => { b.classList.remove('on'); if (srInst === r) srInst = null; };
      r.start(); srInst = r; b.classList.add('on'); toast('Listening… press the mic again to stop', 'mic');
    } catch (e) { toast('Voice input is not available here', 'mic-off'); }
  });
}
/* Upgrade the mock viva with an answer box and key-point check */
(function upgradeMockViva() {
  const q0 = mvQuestion, r0 = mvReveal, c0 = mockCleanup;
  mvQuestion = function () { q0(); const a = $('#mvAns'); if (a) { a.innerHTML = answerBoxHtml('mvText'); bindMic(a); refreshIcons(); } };
  mvReveal = function () {
    if (!MV || MV.revealed) return;
    const said = ($('#mvText') || {}).value || '', inkImg = ($('#mvAns .ink-ans') || {}).src; stopListening(); r0();
    if (inkImg) $('#mvAns').insertAdjacentHTML('afterbegin', `<div class="callout" style="margin-top:14px"><b>Your handwritten answer:</b><img class="ink-ans" src="${inkImg}" alt="Your handwritten answer"></div>`);
    if (said.trim()) {
      const cv = coverage(MV.qs[MV.i].a, said), sug = cv.pct >= .6 ? 2 : cv.pct >= .3 ? 1 : 0;
      $('#mvAns').insertAdjacentHTML('afterbegin', `<div class="callout" style="margin-top:14px"><b>Your answer:</b> ${esc(said)}</div>${coverageHtml(cv)}`);
      const b = $(`[data-gr="${sug}"]`); if (b) { b.classList.add('suggested'); b.title = 'Suggested from key-point coverage'; }
    }
  };
  mockCleanup = function () { c0(); stopListening(); };
})();

/* =====================================================================
   2. FULL EXAM SIMULATION
   ===================================================================== */
const EXAM_ASK = {
  newton: { q: 'wavelength of sodium light λ', unit: 'nm', f: m => m.v * 1e9 }, diffraction: { q: 'wavelength of the laser λ', unit: 'nm', f: m => m.v * 1e9 },
  led: { q: 'knee voltage V_k of the LED', unit: 'V', f: m => m.Vk }, diode: { q: 'knee voltage of the diode', unit: 'V', f: m => m.v },
  photo: { q: 'Planck’s constant h', unit: '× 10⁻³⁴ J s', f: m => m.v * 1e34 }, pendulum: { q: 'acceleration due to gravity g (from the T²l–l² fit)', unit: 'm s⁻²', f: m => m.v },
  solar: { q: 'efficiency η of the solar cell', unit: '%', f: m => m.v }, sonometer: { q: 'frequency of the tuning fork (mean)', unit: 'Hz', f: m => m.v }
};
const pick = a => a[Math.floor(Math.random() * a.length)];
const EXAM_GEN = {
  newton() { const R0 = pick([0.8, 1.0, 1.2]), c = rndIn(3.8, 5.2), rows = []; for (let n = 2; n <= 16; n += 2) { const D = Math.sqrt(4 * n * 589.3e-9 * R0 * 1e4 + 0.001); rows.push({ n, L: +(c + D / 2 + noise(.0008)).toFixed(3), Rr: +(c - D / 2 + noise(.0008)).toFixed(3) }); } return { P: { R: R0, p: 8 }, T: { t: rows } }; },
  diffraction() { const a = pick([0.08, 0.1, 0.12]), D = pick([0.8, 1.0, 1.2]), rows = []; for (let n = 1; n <= 4; n++) rows.push({ n, D, X: +(2 * n * 632.8e-9 * D / (a * 1e-3) * 1e3 + noise(.15)).toFixed(2) }); return { P: { a }, T: { t: rows } }; },
  led() { const lam = pick([630, 590, 565, 470]), Vk = 1240 / lam - .17, rows = [[0, 0]]; [-.6, -.3, -.15, -.07, 0, .05, .1, .15, .2, .25, .3].forEach(d => { const V = +(Vk + d).toFixed(2), x = (V - Vk) / .03, I = 55 * .03 * Math.log(1 + Math.exp(x)); rows.push([V, +Math.max(0, I + noise(.05)).toFixed(1)]); }); return { P: { lam }, T: { t: rows.map(([V, I]) => ({ V, I })) } }; },
  diode() { const sh = rndIn(-.04, .03), f = WS.diode.sample.tables.f.map(r => ({ V: +(r.V > .45 ? r.V + sh : r.V).toFixed(2), I: r.I })), rr = WS.diode.sample.tables.r.map(r => ({ V: r.V, I: +(r.I * rndIn(.85, 1.15)).toFixed(2) })); return { P: {}, T: { f, r: rr } }; },
  photo() { const phi = rndIn(1.6, 2.1); return { P: {}, T: { t: [578.0, 546.1, 435.8, 404.7, 365.0].map(l => ({ lam: l, V0: +(1239.84 / l - phi + noise(.008)).toFixed(3) })) } }; },
  pendulum() { const K = 1 / Math.sqrt(12), rows = []; [1, -1].forEach(s => { for (let c = 40; c >= 10; c -= 5) { const l = c / 100, t = 20 * 2 * Math.PI * Math.sqrt((K * K + l * l) / (9.80 * l)); rows.push({ l: s * c, t1: +(t + noise(.08)).toFixed(2), t2: +(t + noise(.08)).toFixed(2) }); } }); return { P: { N: 20 }, T: { t: rows } }; },
  solar() { const G = pick([600, 800, 1000]), m = solarModel({ G, T: 25, R: 4 }), rows = [{ V: 0, I: +(m.Isc * 1e3).toFixed(1) }]; [.1, .2, .3, .38, .42, .45, .48, .5, .52, .54, .56].forEach(f => { const V = +(f * m.Voc / .6).toFixed(3); rows.push({ V, I: +Math.max(0, m.Icell(V) * 1e3 + noise(.2)).toFixed(1) }); }); rows.push({ V: +m.Voc.toFixed(3), I: 0 }); return { P: { E: G, A: 4 }, T: { t: rows } }; },
  sonometer() { const f = pick([256, 288, 320]), mm = Math.PI * (0.15e-3) ** 2 * 7850, rows = []; [1, 1.5, 2, 2.5, 3].forEach(M => { const l = 1 / (2 * f) * Math.sqrt(M * 9.81 / mm) * 100; rows.push({ M, l1: +(l + noise(.25)).toFixed(1), l2: +(l + noise(.25)).toFixed(1) }); }); return { P: { d: 0.30, rho: 7850, g: 9.81 }, T: { t: rows } }; }
};
let EX = null, exTimer = null;
function examCleanup() { clearInterval(exTimer); stopListening(); }
VIEWS.exam = () => `<div class="page-head"><div><span class="eyebrow">Exam toolkit</span><h1>Exam Simulation</h1><p>A full practical exam in 30 minutes: an experiment is drawn by lottery, then <b>Part A</b> theory (10 marks), <b>Part B</b> calculation from fresh observations (20 marks) and <b>Part C</b> viva (20 marks).</p></div></div><div id="exHost" class="quiz-wrap" style="max-width:900px"></div>`;
function mountExam() { examCleanup(); EX = null; exIntro(); }
function exIntro() {
  const h = Store.s.examHistory.slice(-5).reverse();
  $('#exHost').innerHTML = `<div class="card pad-lg" style="text-align:center"><div class="lottery" id="exLot">${EXPS.map(e => `<span style="--c:${e.color}">${icon(e.icon)}<b>${e.title}</b></span>`).join('')}</div>
    <p class="muted">You will not know the experiment until the draw. Keep a calculator ready — the Lab Toolkit calculator is built into Part B.</p>
    <button class="btn primary" id="exDraw">${icon('dices')} Draw my experiment</button></div>
    ${h.length ? `<div class="card" style="margin-top:18px"><h3>${icon('history')} Previous attempts</h3>${h.map(x => `<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span>${new Date(x.date).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><span class="dim">${expById(x.exp).title}</span><b class="mono">${x.total} / 50</b></div>`).join('')}</div>` : ''}`;
  refreshIcons();
  $('#exDraw').onclick = () => {
    const chosen = pick(EXPS), spans = $$('#exLot span'); let i = 0, n = 0, total = 18 + EXPS.indexOf(chosen);
    $('#exDraw').disabled = true;
    const spin = () => { spans.forEach((s, k) => s.classList.toggle('on', k === i % spans.length)); i++; n++; if (n <= total) setTimeout(spin, motionOK() ? 60 + n * 9 : 0); else setTimeout(() => exStart(chosen), 700); };
    spin();
  };
}
function exStart(e) {
  const gen = EXAM_GEN[e.id](), out = WS[e.id].calc(gen.T, gen.P), ask = EXAM_ASK[e.id];
  const others = shuffle(EXPS.filter(x => x.id !== e.id)).slice(0, 3).map(x => x.formulas[0].tex);
  const formulaQ = { q: `Which is the working formula for <b>${e.title}</b>?`, o: shuffle([e.formulas[0].tex, ...others]), a: e.formulas[0].tex, tex: true, marks: 4 };
  const mcqs = shuffle(MCQ[e.id]).slice(0, 2).map(m => { const order = shuffle(m.o.map((_, i) => i)); return { q: m.q, o: order.map(i => m.o[i]), a: m.o[m.a], marks: 3, e: m.e }; });
  { const S = inkStore(); Object.keys(S.pads).filter(k => k.startsWith('exam-rough')).forEach(k => delete S.pads[k]); delete S.pages['exam-rough']; }
  EX = { e, gen, out, ask, expected: ask.f(out.meta), partA: [formulaQ, ...mcqs], aAns: {}, bAns: null, viva: shuffle(e.viva).slice(0, 5).map(v => ({ q: v[0], a: v[1], g: null })), vi: 0, part: 'A', end: Date.now() + 30 * 60e3 };
  clearInterval(exTimer); exTimer = setInterval(exTick, 1000);
  exRender();
}
function exTick() {
  const c = $('#exClock'); if (!EX || !c) { clearInterval(exTimer); return; }
  const left = Math.max(0, EX.end - Date.now()); c.textContent = mmss(Math.round(left / 1000)); c.classList.toggle('warn', left < 5 * 60e3);
  if (left <= 0) { clearInterval(exTimer); toast('Time is up — your paper has been submitted', 'alarm-clock'); exFinish(); }
}
function exHeader(title) { const e = EX.e; return `<div class="row" style="justify-content:space-between;margin-bottom:12px"><div class="row"><span class="exp-icon" style="${expStyle(e)};background:var(--exp-soft);color:var(--exp-color)">${icon(e.icon)}</span><div><div class="dim" style="font-size:12px;text-transform:uppercase;letter-spacing:.1em">${title}</div><b style="font-size:17px">${e.num}. ${e.title}</b></div></div><span class="ex-clock mono" id="exClock">${mmss(Math.round((EX.end - Date.now()) / 1000))}</span></div><div class="ex-steps">${['A', 'B', 'C'].map(p => `<span class="${EX.part === p ? 'on' : (p < EX.part ? 'done' : '')}">Part ${p}</span>`).join('')}</div>`; }
function exRender() {
  const H = $('#exHost'); if (!H || !EX) return;
  if (EX.part === 'A') {
    H.innerHTML = `<div class="card pad-lg">${exHeader('Part A · Theory (10 marks)')}<p class="muted" style="margin-top:0"><b>Aim:</b> ${EX.e.aim}</p>
      ${EX.partA.map((q, qi) => `<div class="ex-q"><div class="ex-qt"><b>Q${qi + 1}.</b> ${q.q} <span class="tag">${q.marks} marks</span></div>${q.o.map((o, oi) => `<button class="option ${EX.aAns[qi] === oi ? 'on-sel' : ''}" data-a="${qi}:${oi}"><span class="key">${'ABCD'[oi]}</span><span>${q.tex ? tex(o) : o}</span></button>`).join('')}</div>`).join('')}
      <div class="row" style="justify-content:flex-end"><button class="btn primary" id="exNext" ${Object.keys(EX.aAns).length === EX.partA.length ? '' : 'disabled'}>Go to Part B ${icon('arrow-right')}</button></div></div>`;
    $$('[data-a]', H).forEach(b => b.onclick = () => { const [qi, oi] = b.dataset.a.split(':').map(Number); EX.aAns[qi] = oi; exRender(); });
    $('#exNext').onclick = () => { EX.part = 'B'; exRender(); };
  } else if (EX.part === 'B') {
    const cfg = WS[EX.e.id];
    H.innerHTML = `<div class="card pad-lg">${exHeader('Part B · Observations & calculation (20 marks)')}
      ${cfg.params.length ? `<p class="paper-small" style="color:var(--text-2)">${cfg.params.map(p => `${p.label} = <b>${EX.gen.P[p.k]}</b> ${p.unit}`).join(' · ')}</p>` : ''}
      ${cfg.tables.map(t => `<p style="margin:10px 0 6px"><b>${t.title}</b></p><div class="table-wrap"><table class="data"><thead><tr><th>#</th>${t.cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead><tbody>${EX.gen.T[t.k].map((r, i) => `<tr><td class="dim">${i + 1}</td>${t.cols.map(c => `<td>${r[c.k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`).join('')}
      <div class="callout cyan" style="margin-top:16px">Using these observations, calculate the <b>${EX.ask.q}</b>. ${EX.e.graphNote.split('.')[0]}.</div>
      <div class="grid g2" style="align-items:end"><div class="field"><label for="exB">Your answer (${EX.ask.unit})</label><input class="input mono" id="exB" type="number" step="any" value="${EX.bAns ?? ''}"></div>
      <div class="field"><label for="exCalc">Calculator (constants h, c, e, g, pi…)</label><div class="row" style="flex-wrap:nowrap"><input class="input mono" id="exCalc" placeholder="e.g. 2.36e-6/(4*1.0)"><button class="btn" id="exCalcGo">=</button></div><div class="mono dim" id="exCalcOut" style="font-size:12.5px;margin-top:4px"></div></div></div>
      <details class="card" id="exRoughD" style="margin-top:14px;padding:14px 16px"><summary style="cursor:pointer;font-weight:600">✍ Rough work — handwrite your calculation</summary><div id="exRough" style="margin-top:10px"></div></details>
      <div class="row" style="justify-content:space-between;margin-top:16px"><button class="btn ghost" id="exBack">${icon('arrow-left')} Part A</button><button class="btn primary" id="exNext">Go to Part C ${icon('arrow-right')}</button></div></div>`;
    const ci = $('#exCalc'), go = () => { try { $('#exCalcOut').textContent = '= ' + Number(safeEval(ci.value).toPrecision(6)); } catch (err) { $('#exCalcOut').textContent = String(err); } };
    $('#exCalcGo').onclick = go; ci.onkeydown = ev => { if (ev.key === 'Enter') go(); };
    $('#exB').oninput = ev => EX.bAns = ev.target.value;
    const rd = $('#exRoughD'); rd.addEventListener('toggle', () => { if (rd.open && !$('#exRough').children.length) mountInkNotebook($('#exRough'), 'exam-rough', { paper: 'grid', height: 460, label: 'exam rough work' }); });
    $('#exBack').onclick = () => { EX.part = 'A'; exRender(); };
    $('#exNext').onclick = () => { if (!isFinite(parseFloat(EX.bAns))) return toast('Enter your calculated answer first', 'alert-circle'); EX.part = 'C'; exRender(); };
  } else if (EX.part === 'C') {
    const v = EX.viva[EX.vi], revealed = v.revealed;
    H.innerHTML = `<div class="card pad-lg">${exHeader(`Part C · Viva (20 marks) — question ${EX.vi + 1} of 5`)}
      <div class="row" style="gap:14px;align-items:flex-start;flex-wrap:nowrap"><span class="exp-icon" style="background:rgba(139,92,246,.15);color:var(--violet-2)">${icon('user-round')}</span><h2 style="font-size:20px;font-family:var(--font);font-weight:600;line-height:1.45;margin:6px 0 0">${v.q}</h2></div>
      <div id="exAns" style="margin-top:16px">${revealed ? `${v.ink ? `<div class="callout" style="margin:0 0 10px"><b>Your handwritten answer:</b><img class="ink-ans" src="${v.ink}" alt="Your handwritten answer"></div>` : ''}${v.said ? `<div class="callout" style="margin:0 0 10px"><b>Your answer:</b> ${esc(v.said)}</div>${coverageHtml(coverage(v.a, v.said))}` : ''}<div class="callout cyan"><b>Model answer:</b> ${v.a}</div>` : answerBoxHtml('exText')}</div>
      <div class="row" style="justify-content:flex-end;margin-top:14px">${revealed ? `<button class="btn danger" data-g="0">Missed (0)</button><button class="btn" data-g="2">Partly (2)</button><button class="btn primary" data-g="4">Got it (4)</button>` : `<button class="btn primary" id="exReveal">${icon('eye')} Show model answer</button>`}</div></div>`;
    bindMic(H);
    const rv = $('#exReveal'); if (rv) rv.onclick = () => { v.said = ($('#exText') || {}).value || ''; v.ink = ($('#exAns .ink-ans') || {}).src || null; stopListening(); v.revealed = true; exRender(); if (v.said.trim()) { const cv = coverage(v.a, v.said), sug = cv.pct >= .6 ? 4 : cv.pct >= .3 ? 2 : 0; const b = $(`[data-g="${sug}"]`); b && b.classList.add('suggested'); } };
    $$('[data-g]', H).forEach(b => b.onclick = () => { v.g = +b.dataset.g; if (EX.vi < 4) { EX.vi++; exRender(); } else exFinish(); });
  }
  refreshIcons(); renderMath(H); exTick();
}
function exFinish() {
  if (!EX || EX.part === 'R') return;
  examCleanup();
  const a = EX.partA.reduce((s, q, i) => s + (EX.aAns[i] != null && q.o[EX.aAns[i]] === q.a ? q.marks : 0), 0);
  const ans = parseFloat(EX.bAns), err = isFinite(ans) ? Math.abs(ans - EX.expected) / Math.abs(EX.expected) * 100 : Infinity;
  const b = err <= 1.5 ? 20 : err <= 3 ? 15 : err <= 6 ? 10 : err <= 10 ? 5 : 0;
  const c = EX.viva.reduce((s, v) => s + (v.g || 0), 0), total = a + b + c;
  EX.part = 'R';
  Store.s.examHistory.push({ date: Date.now(), exp: EX.e.id, a, b, c, total }); Store.save();
  const grade = total >= 45 ? 'O — Outstanding' : total >= 40 ? 'A+ — Excellent' : total >= 35 ? 'A — Very good' : total >= 30 ? 'B — Good' : total >= 25 ? 'C — Pass' : 'Needs more practice';
  $('#exHost').innerHTML = `<div class="card pad-lg" style="text-align:center"><span class="eyebrow">${EX.e.num}. ${EX.e.title}</span><div class="stat" style="align-items:center"><span class="v" style="font-size:52px">${total}<span class="dim" style="font-size:22px"> / 50</span></span><span class="s">${grade}</span></div>
    <div class="grid g3" style="margin:18px 0;text-align:left"><div class="readout"><span>Part A · Theory</span><b>${a} / 10</b></div><div class="readout"><span>Part B · Calculation</span><b>${b} / 20</b></div><div class="readout"><span>Part C · Viva</span><b>${c} / 20</b></div></div>
    <div class="callout ${b >= 15 ? 'cyan' : 'amber'}" style="text-align:left"><b>Part B:</b> correct ${EX.ask.q} from these readings = <b>${fmt(EX.expected, 4)} ${EX.ask.unit}</b>; you wrote ${isFinite(ans) ? ans : '—'} (${isFinite(err) ? err.toFixed(2) + ' % off' : 'no answer'}). Full marks within 1.5 %.</div>
    <details style="text-align:left;margin-top:10px"><summary style="cursor:pointer;font-weight:600">See the worked calculation</summary><div class="calc-steps" style="margin-top:10px">${EX.out.steps.join('')}</div></details>
    <div class="row" style="justify-content:center;margin-top:16px"><button class="btn primary" id="exAgain">${icon('dices')} Take another exam</button><a class="btn" href="#/exp/${EX.e.id}/overview">${icon('book-open')} Revise this experiment</a></div></div>`;
  renderMath($('#exHost')); refreshIcons();
  $('#exAgain').onclick = () => { EX = null; exIntro(); };
  if (total >= 40) confetti();
  checkBadges();
}

/* =====================================================================
   3. ACHIEVEMENTS, XP AND DAILY CHALLENGE
   ===================================================================== */
function statsSnapshot() {
  const s = Store.s, sec = EXPS.reduce((n, e) => n + expProgress(e.id).done, 0), mods = EXPS.filter(e => expProgress(e.id).pct === 100).length;
  const known = Object.values(s.viva).filter(v => v === 'known').length, fm = Object.values(s.flash).filter(b => b >= 3).length;
  const qc = s.quizHistory.reduce((n, q) => n + q.score, 0), qBest = s.quizHistory.length ? Math.max(...s.quizHistory.map(q => q.score / q.total)) : 0, qPerfect = s.quizHistory.some(q => q.score === q.total && q.total >= 10);
  const daysActive = Object.keys(s.study).filter(k => s.study[k] >= 60 || (s.focus[k] || 0) >= 60).length;
  let streak = 0; const d = new Date(); if (!((s.study[todayKey(d)] || 0) + (s.focus[todayKey(d)] || 0) >= 60)) d.setDate(d.getDate() - 1); while ((s.study[todayKey(d)] || 0) + (s.focus[todayKey(d)] || 0) >= 60) { streak++; d.setDate(d.getDate() - 1); }
  const dailyOk = Object.values(s.daily).filter(x => x.ok).length, puzzles = Object.values(s.puzzles).filter(p => p.solved).length;
  const graphBest = Math.max(0, ...Object.values(s.graphBest)), exBest = s.examHistory.length ? Math.max(...s.examHistory.map(x => x.total)) : 0;
  const ws = EXPS.filter(e => (s.progress[e.id] || {}).workspace).length;
  const mockPts = s.mockHistory.reduce((n, m) => n + m.score, 0);
  return { sec, mods, known, fm, qc, qBest, qPerfect, daysActive, streak, dailyOk, puzzles, graphBest, exBest, exams: s.examHistory.length, ws, mockPts, mocks: s.mockHistory.length, tr: s.trainer.correct, pomo: s.pomo.sessions, sims: s.simUse || 0, vlab: s.vlab || 0, records: s.recordViews || 0 };
}
function xpOf(st) { return st.sec * 20 + st.known * 5 + st.fm * 3 + st.qc * 4 + st.mockPts * 3 + st.dailyOk * 30 + st.puzzles * 40 + st.tr * 5 + Object.values(Store.s.graphBest).reduce((n, v) => n + Math.round(v / 2), 0) + Store.s.examHistory.reduce((n, x) => n + x.total, 0) + st.pomo * 15 + st.vlab * 2; }
function levelOf(xp) { const lv = Math.floor(Math.sqrt(xp / 60)) + 1, lo = 60 * (lv - 1) ** 2, hi = 60 * lv ** 2; return { lv, lo, hi, pct: (xp - lo) / (hi - lo) }; }
const TITLES = ['Lab Newcomer', 'Apprentice Observer', 'Careful Recorder', 'Junior Experimenter', 'Data Wrangler', 'Graph Artisan', 'Viva Contender', 'Lab Specialist', 'Senior Physicist', 'Practical Master', 'Physics Legend'];
const BADGES = [
  ['first', 'First Steps', 'footprints', 'Complete your first section', s => s.sec >= 1],
  ['module', 'Module Master', 'medal', 'Complete every section of one experiment', s => s.mods >= 1],
  ['grad', 'Lab Graduate', 'graduation-cap', 'Complete all 8 modules', s => s.mods >= 8],
  ['calc', 'Data Scientist', 'calculator', 'Calculate results in 3 workspaces', s => s.ws >= 3],
  ['vlab', 'Hands-on', 'flask-conical', 'Record 10 readings in the virtual lab', s => s.vlab >= 10],
  ['sims', 'Explorer', 'atom', 'Explore 8 simulations', s => s.sims >= 8],
  ['quiz', 'Quiz Whiz', 'zap', 'Score 90 % or more in a quiz', s => s.qBest >= .9],
  ['perfect', 'Perfectionist', 'sparkles', 'Score 100 % in a quiz of 10+ questions', s => s.qPerfect],
  ['viva50', 'Viva Ready', 'messages-square', 'Mark 50 viva questions as known', s => s.known >= 50],
  ['vivaAll', 'Viva Legend', 'crown', 'Know all viva questions', s => s.known >= ALL_VIVA().length],
  ['flash', 'Flash Fanatic', 'layers', 'Master 40 flashcards', s => s.fm >= 40],
  ['mock', 'Interview Ready', 'mic', 'Complete 3 mock viva interviews', s => s.mocks >= 3],
  ['vernier', 'Vernier Virtuoso', 'ruler', 'Read 20 instruments correctly', s => s.tr >= 20],
  ['graph', 'Graph Guru', 'line-chart', 'Score 90+ in graph practice', s => s.graphBest >= 90],
  ['puzzle', 'Derivation Detective', 'puzzle', 'Solve all 8 derivation puzzles', s => s.puzzles >= 8],
  ['exam', 'Exam Ace', 'trophy', 'Score 40/50 or more in the exam simulation', s => s.exBest >= 40],
  ['daily', 'Daily Devotee', 'calendar-check', 'Answer 7 daily challenges correctly', s => s.dailyOk >= 7],
  ['focus', 'Deep Focus', 'timer', 'Complete 10 Pomodoro sessions', s => s.pomo >= 10],
  ['streak', 'On Fire', 'flame', 'Study 5 days in a row', s => s.streak >= 5],
  ['record', 'Record Keeper', 'file-text', 'Open 3 lab records', s => s.records >= 3]
];
function checkBadges() {
  const st = statsSnapshot(), have = new Set(Store.s.badges), fresh = BADGES.filter(b => !have.has(b[0]) && b[4](st));
  if (!fresh.length) return;
  fresh.forEach(b => { Store.s.badges.push(b[0]); (Store.s.badgeLog = Store.s.badgeLog || []).push({ id: b[0], ts: Date.now() }); }); Store.save();
  fresh.slice(0, 3).forEach((b, i) => setTimeout(() => toast(`Badge unlocked: ${b[1]}`, 'award'), i * 700));
  confetti();
}
function allMcqs() { return EXPS.flatMap(e => (MCQ[e.id] || []).map((m, i) => ({ ...m, exp: e, id: `${e.id}-m${i}` }))); }
function dailyQ() {
  const k = todayKey(), all = allMcqs(); let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const q = all[h % all.length]; let hh = h; const order = q.o.map((_, i) => i).sort(() => { hh = (hh * 1103515245 + 12345) >>> 0; return (hh & 1) ? 1 : -1; });
  return { k, q, order };
}
function dailyHtml() {
  const { k, q, order } = dailyQ(), d = Store.s.daily[k];
  return `<div class="card daily" style="${expStyle(q.exp)}"><h3>${icon('sparkles')} Daily challenge <span class="spacer"></span><span class="tag">${q.exp.title}</span></h3><p style="margin:0 0 12px;font-weight:500">${q.q}</p>
    ${order.map((oi, j) => { let cls = ''; if (d) { if (oi === q.a) cls = 'correct'; else if (oi === d.pick) cls = 'wrong'; } return `<button class="option ${cls}" data-daily="${oi}" ${d ? 'disabled' : ''}><span class="key">${'ABCD'[j]}</span><span>${q.o[oi]}</span></button>`; }).join('')}
    ${d ? `<div class="callout ${d.ok ? 'cyan' : 'amber'}" style="margin:6px 0 0"><b>${d.ok ? '✓ Correct! +30 XP.' : '✗ Not this time.'}</b> ${q.e} <span class="dim">New challenge tomorrow.</span></div>` : `<p class="dim" style="font-size:12.5px;margin:4px 0 0">One attempt per day · +30 XP</p>`}</div>`;
}
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-daily]'); if (!b || b.disabled) return;
  const { k, q } = dailyQ(); if (Store.s.daily[k]) return;
  const pickI = +b.dataset.daily, ok = pickI === q.a; Store.s.daily[k] = { ok, pick: pickI }; Store.save();
  const card = b.closest('.daily'); card.outerHTML = dailyHtml(); refreshIcons();
  toast(ok ? 'Daily challenge solved! +30 XP' : 'Daily challenge attempted', ok ? 'sparkles' : 'circle');
  if (ok) confetti(); checkBadges();
});
function levelCardHtml() {
  const st = statsSnapshot(), xp = xpOf(st), L = levelOf(xp);
  return `<div class="card level-card"><h3>${icon('trophy')} Level ${L.lv} <span class="spacer"></span><a class="btn sm ghost" href="#/achievements">Badges</a></h3><div class="row" style="gap:16px;flex-wrap:nowrap"><div class="lv-ring" style="--p:${(L.pct * 100).toFixed(1)}"><b>${L.lv}</b></div><div style="flex:1;min-width:0"><b>${TITLES[Math.min(TITLES.length - 1, L.lv - 1)]}</b><div class="dim" style="font-size:12.5px">${xp} XP · ${L.hi - xp} XP to level ${L.lv + 1}</div><div class="progress" style="margin-top:8px"><i style="width:${L.pct * 100}%"></i></div><div class="dim" style="font-size:12.5px;margin-top:8px">${Store.s.badges.length} / ${BADGES.length} badges</div></div></div><div class="quick-grid">${[['#/exam', 'graduation-cap', 'Exam simulation'], ['#/trainer', 'ruler', 'Read instruments'], ['#/graphlab', 'line-chart', 'Plot a graph'], ['#/puzzles', 'puzzle', 'Derivation puzzle']].map(q => `<a class="btn sm" href="${q[0]}">${icon(q[1])} ${q[2]}</a>`).join('')}</div></div>`;
}
VIEWS.achievements = () => {
  const st = statsSnapshot(), xp = xpOf(st), L = levelOf(xp), have = new Set(Store.s.badges);
  return `<div class="page-head"><div><span class="eyebrow">Personal</span><h1>Achievements</h1><p>Earn XP for everything you do in PhysLab — completing sections, quizzes, viva practice, puzzles, graphs, exams and daily challenges — and unlock badges along the way.</p></div></div>
    <div class="grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)" id="achTop">${levelCardHtml()}${dailyHtml()}</div>
    <div class="card" style="margin-top:18px"><h3>${icon('bar-chart-3')} Where your XP comes from</h3><div class="readouts" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">${[['Sections done', st.sec * 20], ['Viva known', st.known * 5], ['Flashcards', st.fm * 3], ['Quiz answers', st.qc * 4], ['Mock viva', st.mockPts * 3], ['Daily challenges', st.dailyOk * 30], ['Puzzles', st.puzzles * 40], ['Instrument reads', st.tr * 5], ['Exams', Store.s.examHistory.reduce((n, x) => n + x.total, 0)], ['Focus sessions', st.pomo * 15]].map(r => `<div class="readout"><span>${r[0]}</span><b>${r[1]} XP</b></div>`).join('')}</div></div>
    <h2 style="font-size:20px;margin:26px 0 14px">Badges · ${have.size} / ${BADGES.length}</h2>
    <div class="ach-grid">${BADGES.map(b => `<div class="ach ${have.has(b[0]) ? 'got' : ''}"><span class="ach-ic">${icon(have.has(b[0]) ? b[2] : 'lock')}</span><b>${b[1]}</b><span>${b[3]}</span></div>`).join('')}</div>`;
};
function mountAchievements() { if (innerWidth < 900) $('#achTop').style.gridTemplateColumns = '1fr'; checkBadges(); }

/* =====================================================================
   4. PROGRESS REPORT
   ===================================================================== */
VIEWS.report = () => `<div class="row no-print" style="margin-bottom:16px"><span class="spacer"></span><button class="btn primary" onclick="window.print()">${icon('printer')} Print / Save PDF</button></div><div id="rpHost"></div>`;
function mountReport() {
  const s = Store.s, st = statsSnapshot(), xp = xpOf(st), L = levelOf(xp), pf = s.profile;
  const accBy = {}; s.quizHistory.forEach(q => Object.entries(q.byExp || {}).forEach(([id, v]) => { accBy[id] = accBy[id] || [0, 0]; accBy[id][0] += v[0]; accBy[id][1] += v[1]; }));
  const rows = EXPS.map(e => { const p = expProgress(e.id), vk = e.viva.filter((_, i) => s.viva[`${e.id}-${i}`] === 'known').length, a = accBy[e.id], ex = s.examHistory.filter(x => x.exp === e.id); return { e, p, vk, acc: a ? a[0] / a[1] : null, ex: ex.length ? Math.max(...ex.map(x => x.total)) : null, time: s.timeByExp[e.id] || 0 }; });
  const weak = rows.map(r => ({ r, w: (1 - r.p.pct / 100) * 2 + (r.acc == null ? .6 : 1 - r.acc) + (1 - r.vk / r.e.viva.length) })).sort((a, b) => b.w - a.w).slice(0, 3);
  const totStudy = Object.values(s.study).reduce((a, b) => a + b, 0), totFocus = Object.values(s.focus).reduce((a, b) => a + b, 0);
  const qAvg = s.quizHistory.length ? Math.round(mean(s.quizHistory.map(q => q.score / q.total * 100))) : null, mAvg = s.mockHistory.length ? Math.round(mean(s.mockHistory.map(m => m.score / m.max * 100))) : null;
  const diff = examDiff();
  $('#rpHost').innerHTML = `<article class="paper">
    <div class="row" style="justify-content:space-between;align-items:flex-start"><div><h1 style="text-align:left;margin:0">Progress Report</h1><p class="paper-sub" style="text-align:left;margin:4px 0 0">PhysLab · Engineering Physics Practicals</p></div><div style="text-align:right;font-size:13px;color:#334155"><b>${esc(pf.name || 'Student')}</b>${pf.roll ? `<br>Roll no. ${esc(pf.roll)}` : ''}${pf.branch ? `<br>${esc(pf.branch)}` : ''}<br>${new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</div></div>
    <div class="rp-kpis">${[['Overall progress', overallProgress() + '%'], ['Level', `${L.lv} · ${xp} XP`], ['Study time', fmtDuration(totStudy + totFocus)], ['Quiz average', qAvg == null ? '—' : qAvg + '%'], ['Mock viva avg', mAvg == null ? '—' : mAvg + '%'], ['Best exam', st.exBest ? st.exBest + ' / 50' : '—'], ['Viva known', `${st.known} / ${ALL_VIVA().length}`], ['Badges', `${s.badges.length} / ${BADGES.length}`]].map(k => `<div><span>${k[0]}</span><b>${k[1]}</b></div>`).join('')}</div>
    ${diff != null && diff > 0 ? `<p class="paper-small">Practical exam in <b>${Math.ceil(diff / 864e5)} days</b> (${new Date(s.exam.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}).</p>` : ''}
    <h3>Experiment-wise progress</h3>
    <table class="paper-table"><thead><tr><th style="text-align:left">Experiment</th><th>Sections</th><th>Viva known</th><th>Quiz accuracy</th><th>Best exam</th><th>Time</th></tr></thead><tbody>${rows.map(r => `<tr><td style="text-align:left;font-family:var(--font)">${r.e.num}. ${r.e.title}</td><td>${r.p.done}/8 <span class="rp-bar"><i style="width:${r.p.pct}%;background:${r.e.color}"></i></span></td><td>${r.vk}/${r.e.viva.length}</td><td>${r.acc == null ? '—' : Math.round(r.acc * 100) + '%'}</td><td>${r.ex == null ? '—' : r.ex + '/50'}</td><td>${fmtDuration(r.time)}</td></tr>`).join('')}</tbody></table>
    <h3>Study activity — last 14 days (minutes)</h3><div class="paper-chart" style="height:220px"><canvas id="rpChart"></canvas></div>
    <h3>Focus areas</h3><ol>${weak.map(x => `<li><b>${x.r.e.title}</b> — ${x.r.p.pct < 100 ? `${8 - x.r.p.done} section${8 - x.r.p.done === 1 ? '' : 's'} left; ` : ''}${x.r.vk < x.r.e.viva.length ? `${x.r.e.viva.length - x.r.vk} viva questions to master; ` : ''}${x.r.acc == null ? 'no quiz attempted yet' : `quiz accuracy ${Math.round(x.r.acc * 100)}%`}.</li>`).join('')}</ol>
    <h3>Practice record</h3><table class="paper-table"><tbody>${[['Quizzes taken', s.quizHistory.length], ['Mock viva interviews', s.mockHistory.length], ['Exam simulations', s.examHistory.length], ['Instrument readings (correct / attempted)', `${s.trainer.correct} / ${s.trainer.attempts}`], ['Derivation puzzles solved', `${st.puzzles} / 8`], ['Best graph-practice score', st.graphBest || '—'], ['Daily challenges solved', st.dailyOk], ['Focus sessions', s.pomo.sessions]].map(r => `<tr><td style="text-align:left;font-family:var(--font)">${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table>
    <h3>Badges earned</h3><p class="paper-small">${s.badges.length ? BADGES.filter(b => s.badges.includes(b[0])).map(b => b[1]).join(' · ') : 'No badges yet.'}</p>
    <div class="paper-sign"><div>Student</div><div>Faculty / mentor</div></div></article>`;
  const labels = [], vals = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = todayKey(d); labels.push(d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })); vals.push(+(((s.study[k] || 0) + (s.focus[k] || 0)) / 60).toFixed(1)); }
  if (window.Chart) CHARTS.add(new Chart($('#rpChart'), { type: 'bar', data: { labels, datasets: [{ label: 'Minutes', data: vals, backgroundColor: '#8b5cf6', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: '#475569' }, grid: { color: 'rgba(15,23,42,.08)' } } } } }));
  refreshIcons();
}
