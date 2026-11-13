/* ---------- Feature tour: animated slideshow shown on first launch (and on demand) ---------- */
const ART = {
  welcome() {
    return `<div class="ta-orbit"><div class="ta-core"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><circle cx="12" cy="12" r="2.2" fill="#fff"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg></div>
      <div class="ta-ring">${EXPS.map((e, i) => `<span class="ta-chip" style="--a:${i * 45}deg;--c:${e.color}"><span>${icon(e.icon)}</span></span>`).join('')}</div></div>
      <div class="ta-caption">8 experiments · 30+ tools · works offline</div>`;
  },
  modules() {
    return `<div class="ta-win"><div class="ta-winbar"><i></i><i></i><i></i><b>Newton’s Rings</b></div>
      <div class="ta-tabs">${SECTIONS.map((s, i) => `<span style="--i:${i}">${icon(s.i)}<em>${s.t.split(' ')[0]}</em><b class="ta-ck">${icon('check')}</b></span>`).join('')}<u class="ta-uline"></u></div>
      <div class="ta-mod"><div class="ta-lines"><i style="width:80%"></i><i style="width:65%"></i><i style="width:90%"></i><i style="width:55%"></i></div>
      <svg class="ta-pring" viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" stroke="rgba(255,255,255,.1)" stroke-width="6" fill="none"/><circle class="ta-pring-arc" cx="30" cy="30" r="24" stroke="#a78bfa" stroke-width="6" fill="none" stroke-linecap="round"/></svg></div></div>`;
  },
  sims() {
    return `<div class="ta-win ta-dark"><canvas class="ta-motif" data-tmotif="newton"></canvas><canvas class="ta-motif ta-m2" data-tmotif="sonometer"></canvas>
      <div class="ta-sliders"><div><span>Wavelength λ</span><div class="ta-track"><b class="ta-thumb"></b></div></div><div><span>Radius R</span><div class="ta-track"><b class="ta-thumb t2"></b></div></div></div>
      <div class="ta-btns"><span class="ta-btn p">${icon('pause')} Pause</span><span class="ta-btn">${icon('rotate-ccw')} Reset</span><span class="ta-btn">${icon('maximize-2')} Full screen</span></div></div>`;
  },
  vlab() {
    return `<div class="ta-win"><div class="ta-vl"><div class="ta-vlstep">Step 2 of 2 · ring 5 — now the right edge</div>
      <div class="ta-vlstat"><span class="a">● Turn the screw right by 0.20 mm</span><span class="b">● On the right edge — record it</span></div><div class="ta-meter"><i></i></div>
      <div class="ta-nudge"><span>${icon('chevrons-left')}</span><span>${icon('chevron-left')}</span><b>1.715 mm</b><span class="hit">${icon('chevron-right')}</span><span>${icon('chevrons-right')}</span></div>
      <div class="ta-rec">${icon('clipboard-plus')} Record reading <kbd>R</kbd></div></div>
      <div class="ta-table"><div class="h"><span>n</span><span>Left (cm)</span><span>Right (cm)</span></div><div class="r r1"><span>5</span><span>4.329</span><span>4.671</span></div><div class="r r2"><span>10</span><span>4.257</span><span>4.743</span></div></div></div>`;
  },
  workspace() {
    return `<div class="ta-win"><div class="ta-ws"><div class="ta-table sm"><div class="h"><span>n</span><span>D² (cm²)</span></div>${[[4, '0.095'], [8, '0.188'], [12, '0.285'], [16, '0.378']].map((r, i) => `<div class="r" style="--i:${i}"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div>
      <svg class="ta-chart" viewBox="0 0 220 150"><path d="M30 10 V125 H210" stroke="rgba(255,255,255,.3)" fill="none"/>${[[55, 103], [95, 80], [135, 55], [175, 32]].map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#a78bfa" style="--i:${i}" class="ta-pt"/>`).join('')}<path class="ta-fit" d="M30 118 L205 20" stroke="#22d3ee" stroke-width="2" stroke-dasharray="6 4" fill="none"/></svg></div>
      <div class="ta-result"><span>Result</span><b>λ = (590 ± 18) nm</b><em>${icon('ruler')} Scale: 1 cm = 2 × 10⁻⁶ m²</em></div></div>`;
  },
  record() {
    return `<div class="ta-paper"><div class="ta-ph"><span>Exp. 1</span><span>13/11</span><span>A. Student</span><span>Roll 42</span></div><b class="ta-pt1">Newton’s Rings</b>
      ${['1. Aim', '2. Apparatus', '3. Formula', '4. Diagram', '5. Observations', '6. Result'].map((t, i) => `<div class="ta-psec" style="--i:${i}"><em>${t}</em><i></i></div>`).join('')}
      <span class="ta-print">${icon('printer')} Print / Save PDF</span></div>`;
  },
  practice() {
    return `<div class="ta-two"><div class="ta-flash"><div class="ta-fin"><div class="f">Why is the centre dark in reflected light?</div><div class="b">Phase change of π on reflection at the glass plate → destructive interference.</div></div></div>
      <div class="ta-quiz"><b>Diameter of the n-th dark ring ∝</b>${['n', '√n', 'n²', '1/n'].map((o, i) => `<span class="${i === 1 ? 'ok' : ''}"><kbd>${'ABCD'[i]}</kbd>${o}</span>`).join('')}</div></div>`;
  },
  skills() {
    const q = { mm: 55.5, zero: 0 };
    return `<div class="ta-vern">${INSTR.vernier.svg(q, true)}</div><div class="ta-puz"><span class="p1">${icon('grip-vertical')} Path difference Δ = 2μt + λ/2</span><span class="p2">${icon('grip-vertical')} Dark ring: 2μt = nλ</span><span class="p3">${icon('grip-vertical')} t = r²/2R</span></div>`;
  },
  exam() {
    return `<div class="ta-lot">${EXPS.map((e, i) => `<span style="--i:${i};--c:${e.color}">${icon(e.icon)}</span>`).join('')}</div>
      <div class="ta-exrow"><span class="ta-clock">${icon('timer')} 29:58</span><span class="ta-mic">${icon('mic')}</span><span class="ta-score">50<em>/50</em></span></div>
      <div class="ta-parts"><span>A · Theory 10</span><span>B · Calculation 20</span><span>C · Viva 20</span></div>`;
  },
  plan() {
    return `<div class="ta-two"><svg class="ta-pomo" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,.08)" stroke-width="9" fill="none"/><circle class="ta-pomo-arc" cx="60" cy="60" r="50" stroke="url(#taGrad)" stroke-width="9" fill="none" stroke-linecap="round" transform="rotate(-90 60 60)"/><defs><linearGradient id="taGrad"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><text x="60" y="66" text-anchor="middle" fill="currentColor" font-size="18" font-family="JetBrains Mono">24:12</text></svg>
      <div class="ta-tasks">${['Newton’s Rings: theory & derivation', 'Simulation + virtual lab readings', 'Viva questions + quiz', 'Exam-day checklist'].map((t, i) => `<span style="--i:${i}"><b>${icon('check')}</b>${t}</span>`).join('')}<div class="ta-count"><b>13</b><em>days</em><b>19</b><em>hrs</em></div></div></div>`;
  },
  ink() {
    const hand = "'Segoe Print','Bradley Hand','Comic Sans MS','Chalkboard SE',cursive";
    return `<div class="ta-ink"><svg viewBox="0 0 320 170"><defs><clipPath id="taW1"><rect class="c1" x="0" y="20" width="0" height="60"/></clipPath><clipPath id="taW2"><rect class="c2" x="0" y="88" width="0" height="50"/></clipPath></defs>
      <path class="w2" d="M44 118 L210 118" stroke="#a78bfa" stroke-width="18" stroke-linecap="round" opacity=".35"/>
      <text x="44" y="66" clip-path="url(#taW1)" font-family="${hand}" font-size="34" fill="#1d4ed8">λ = 589.3 nm</text>
      <text x="44" y="126" clip-path="url(#taW2)" font-family="${hand}" font-size="26" fill="#111827">D² = 4nλR</text>
      <circle class="er" cx="60" cy="152" r="12" fill="rgba(148,163,184,.25)" stroke="#f43f5e" stroke-dasharray="4 3"/></svg>
      <div class="ta-inkbar"><span class="on">${icon('pen-tool')}</span><span>${icon('highlighter')}</span><span>${icon('eraser')}</span><i style="--c:#111827"></i><i style="--c:#1d4ed8"></i><i style="--c:#dc2626"></i></div></div>`;
  },
  progress() {
    return `<div class="ta-badges">${[['footprints', 'First Steps'], ['trophy', 'Exam Ace'], ['ruler', 'Vernier Virtuoso'], ['flame', 'On Fire']].map((b, i) => `<span style="--i:${i}"><b>${icon(b[0])}</b><em>${b[1]}</em></span>`).join('')}</div>
      <div class="ta-xp"><div class="ta-lv">3</div><div><b>Careful Recorder</b><div class="ta-bar"><i></i></div><em>277 XP · 4 / 20 badges</em></div></div>`;
  },
  power() {
    return `<div class="ta-pal"><div class="ta-pin">${icon('search')}<span class="ta-type">stopping potential</span><kbd>Ctrl K</kbd></div>${[['Formula', 'Stopping potential'], ['Viva', 'What is stopping potential?'], ['Section', 'Photoelectric → Theory']].map((r, i) => `<div class="ta-pr" style="--i:${i}"><em>${r[0]}</em>${r[1]}</div>`).join('')}</div>
      <div class="ta-pills"><span>${icon('wifi-off')} Works offline</span><span>${icon('shield-check')} Private — data stays on this device</span><span>${icon('sun-moon')} Dark & light themes</span><span>${icon('users')} Multiple student profiles</span></div>`;
  }
};
const TOUR = [
  { k: 'welcome', kicker: 'Welcome', title: 'Your virtual physics laboratory', text: 'PhysLab covers all eight first-year Engineering Physics practicals — from theory to the viva — in one app that runs entirely in your browser.', steps: ['Pick an experiment from the sidebar or the dashboard', 'Learn it, run it, measure it, then practise the viva', 'Your progress, notes and readings save automatically'] },
  { k: 'modules', kicker: 'Learn', title: 'Eight complete experiment modules', text: 'Every experiment has the same eight tabs, so you always know where things are.', steps: ['Overview → Theory & Derivation → Procedure → Diagram', 'Simulation → Observations → Workspace → Viva', 'Electrical set-ups also show how to wire the real kit, step by step'], href: '#/exp/newton/overview' },
  { k: 'sims', kicker: 'Explore', title: 'Live, physically accurate simulations', text: 'Move the sliders and watch rings, fringes, currents and waves respond in real time — computed from the actual equations.', steps: ['Drag a slider or use the arrow keys for any value', 'Play / Pause / Reset, or press Space on the canvas', 'Full screen for a bigger view'], href: '#/exp/diffraction/simulation' },
  { k: 'vlab', kicker: 'Measure', title: 'Virtual lab — take real readings', text: 'Perform the experiment inside the simulation. A guided panel tells you exactly how far off you are.', steps: ['Follow the step guide (e.g. left edge, then right edge)', 'Fine-tune with ‹ › or the [ ] keys until the light turns green', 'Press Record (or R) — the reading lands in your workspace'], href: '#/exp/newton/simulation' },
  { k: 'workspace', kicker: 'Calculate', title: 'Workspace: results, graphs and errors', text: 'Type or record your readings and everything else is calculated instantly.', steps: ['Derived columns and the least-squares graph update live', 'Error analysis gives your result as value ± error', 'Get a suggested graph-paper scale and export CSV'], href: '#/exp/newton/workspace' },
  { k: 'record', kicker: 'Submit', title: 'One-click lab record', text: 'Turn your readings into a complete, printable record page in the standard format.', steps: ['Aim, apparatus, formula, diagram and procedure', 'Your observation table, calculations, graph and error analysis', 'Print or save as PDF — your name and roll number included'], href: '#/record' },
  { k: 'practice', kicker: 'Practise', title: 'Viva bank, quizzes and flashcards', text: '140 viva questions with model answers, randomised quizzes and spaced-repetition flashcards.', steps: ['Mark questions “I know this” or “Review again”', 'Quizzes shuffle questions and options every time', 'Flashcards bring back the ones you find hard'], href: '#/viva' },
  { k: 'skills', kicker: 'Build skills', title: 'Instruments, graphs and derivations', text: 'Practise the hands-on skills the examiner checks.', steps: ['Read vernier, screw gauge, microscope and stopwatch scales', 'Plot points and a best-fit line on virtual graph paper', 'Rebuild derivations step by step in the right order'], href: '#/trainer' },
  { k: 'exam', kicker: 'Exam ready', title: 'Full exam simulation & mock viva', text: 'A lottery draws your experiment, then a timed 50-mark paper — just like the real practical.', steps: ['Part A theory, Part B calculation from fresh data, Part C viva', 'Answer the viva by typing, speaking or handwriting', 'Get a mark, a grade and the worked solution'], href: '#/exam' },
  { k: 'plan', kicker: 'Stay on track', title: 'Planner, countdown and focus timer', text: 'Set your exam date once and PhysLab plans every day until then.', steps: ['A day-by-day plan with your weakest experiments first', 'Pomodoro focus timer that logs your study time', 'Exam-day checklist and last-minute formula sheet'], href: '#/planner' },
  { k: 'ink', kicker: 'Write naturally', title: 'Stylus handwriting everywhere', text: 'Write with a pen on any stylus device — or a mouse — just like a notebook.', steps: ['Handwrite notes, rough work and viva answers', 'Pen (pressure-sensitive), highlighter and a precise eraser', 'Annotate any page; download notes as PDF, PNG, JPEG or SVG'], href: '#/notes' },
  { k: 'progress', kicker: 'Level up', title: 'XP, badges and progress reports', text: 'Everything you do earns XP. Unlock badges, keep a streak and solve the daily challenge.', steps: ['Daily challenge question — one attempt, +30 XP', '20 badges from “First Steps” to “Exam Ace”', 'Analytics and a printable progress report'], href: '#/achievements' },
  { k: 'power', kicker: 'Power tools', title: 'Fast, private and offline', text: 'A few things that make PhysLab feel like professional software.', steps: ['Ctrl + K searches every formula, question and page', 'Profiles for each student sharing a computer', 'Notifications, daily goals, backups and keyboard shortcuts (press ?)'] },
  { k: 'setup', kicker: 'Get started', title: 'Make PhysLab yours', text: 'A few details personalise your dashboard, lab records and study plan. You can change them later in Settings.' }
];
let TOURST = null;
function tourOpen(start = 0) {
  if ($('#tour')) return;
  const el = document.createElement('div'); el.id = 'tour'; el.className = 'tour'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'PhysLab feature tour');
  el.innerHTML = `<div class="tour-box"><header class="tour-head"><span class="brand-mark sm"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="12" cy="12" r="2.2" fill="#fff"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg></span><b>PhysLab tour</b><span class="tour-count mono" id="tourCount"></span><span class="spacer"></span><button class="btn sm ghost" id="tourAuto" aria-pressed="false">${icon('play')} Autoplay</button><button class="icon-btn" id="tourClose" aria-label="Skip tour">${icon('x')}</button></header>
    <div class="tour-prog"><i id="tourProg"></i></div><div class="tour-body" id="tourBody"></div>
    <footer class="tour-foot"><div class="tour-dots" id="tourDots">${TOUR.map((s, i) => `<button data-td="${i}" aria-label="Slide ${i + 1}: ${esc(s.title)}"></button>`).join('')}</div><span class="spacer"></span><button class="btn ghost" id="tourSkip">Skip tour</button><button class="btn" id="tourPrev">${icon('arrow-left')} Back</button><button class="btn primary" id="tourNext">Next ${icon('arrow-right')}</button></footer></div>`;
  document.body.appendChild(el);
  TOURST = { i: start, auto: false, t0: 0, raf: 0, motifs: [] };
  $('#tourClose').onclick = () => tourClose(false); $('#tourSkip').onclick = () => tourClose(false);
  $('#tourPrev').onclick = () => tourGo(TOURST.i - 1); $('#tourNext').onclick = () => TOURST.i === TOUR.length - 1 ? tourFinish() : tourGo(TOURST.i + 1);
  $('#tourDots').onclick = e => { const b = e.target.closest('[data-td]'); if (b) tourGo(+b.dataset.td); };
  $('#tourAuto').onclick = () => { TOURST.auto = !TOURST.auto; $('#tourAuto').innerHTML = `${icon(TOURST.auto ? 'pause' : 'play')} Autoplay`; $('#tourAuto').setAttribute('aria-pressed', TOURST.auto); refreshIcons(); TOURST.t0 = performance.now(); };
  el.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); $('#tourNext').click(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); tourGo(TOURST.i - 1); } else if (e.key === 'Escape') tourClose(false); });
  let sx = null; el.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true }); el.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60 && !e.target.closest('input,select')) dx < 0 ? $('#tourNext').click() : tourGo(TOURST.i - 1); sx = null; });
  const tick = now => { if (!TOURST) return; TOURST.raf = requestAnimationFrame(tick); if (!TOURST.auto || TOUR[TOURST.i].k === 'setup') { $('#tourProg').style.width = ((TOURST.i + 1) / TOUR.length * 100) + '%'; return; } const p = (now - TOURST.t0) / 8000; $('#tourProg').style.width = ((TOURST.i + Math.min(1, p)) / TOUR.length * 100) + '%'; if (p >= 1) tourGo(TOURST.i + 1); };
  TOURST.raf = requestAnimationFrame(tick);
  document.body.classList.add('tour-open');
  tourGo(start);
  setTimeout(() => $('#tourNext') && $('#tourNext').focus(), 50);
}
function tourGo(i) {
  if (!TOURST) return; i = Math.max(0, Math.min(TOUR.length - 1, i));
  const dir = i >= TOURST.i ? 1 : -1; TOURST.i = i; TOURST.t0 = performance.now();
  TOURST.motifs.forEach(f => f()); TOURST.motifs = [];
  const s = TOUR[i], body = $('#tourBody');
  body.innerHTML = s.k === 'setup' ? tourSetupHtml() : `<div class="tour-slide" style="--dir:${dir}"><div class="tour-art ta-${s.k}">${ART[s.k]()}</div>
    <div class="tour-text"><span class="eyebrow">${String(i + 1).padStart(2, '0')} · ${s.kicker}</span><h2>${s.title}</h2><p>${s.text}</p><div class="tour-how">How it works</div><ol>${s.steps.map(t => `<li>${t}</li>`).join('')}</ol>${s.href ? `<button class="btn sm" data-tgo="${s.href}">${icon('arrow-up-right')} Open it now</button>` : ''}</div></div>`;
  $('#tourCount').textContent = `${i + 1} / ${TOUR.length}`;
  $$('#tourDots button').forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('seen', k < i); });
  $('#tourPrev').disabled = i === 0;
  $('#tourNext').innerHTML = i === TOUR.length - 1 ? `${icon('rocket')} Start learning` : `Next ${icon('arrow-right')}`;
  refreshIcons();
  $$('canvas[data-tmotif]', body).forEach(cv => { requestAnimationFrame(() => { const before = MOTIF_LOOPS.size; mountMotif(cv, cv.dataset.tmotif); const added = [...MOTIF_LOOPS].slice(before); TOURST.motifs.push(...added); added.forEach(f => MOTIF_LOOPS.delete(f)); }); });
  const go = $('[data-tgo]', body); if (go) go.onclick = () => { const h = go.dataset.tgo; tourClose(true); location.hash = h; };
  if (s.k === 'setup') tourSetupBind();
}
function tourSetupHtml() {
  const p = Store.s.profile, ed = Store.s.exam.date;
  return `<div class="tour-slide"><div class="tour-art ta-setup"><div class="ta-avatar" id="tsAvatar">${initials(p.name || 'You')}</div><div class="ta-hello" id="tsHello">${greeting()}${p.name ? ', ' + esc(p.name.split(' ')[0]) : ''}!</div><div class="ta-caption">Your dashboard, lab records and study plan use these details.</div></div>
    <div class="tour-text"><span class="eyebrow">${TOUR.length} · Get started</span><h2>Make PhysLab yours</h2><p class="muted" style="margin-top:0">${TOUR[TOUR.length - 1].text}</p>
      <div class="grid g2" style="gap:12px"><div class="field"><label for="tsName">Your name</label><input class="input" id="tsName" value="${esc(p.name || '')}" placeholder="e.g. Priya Sharma" autocomplete="name"></div><div class="field"><label for="tsRoll">Roll number</label><input class="input" id="tsRoll" value="${esc(p.roll || '')}" placeholder="optional"></div>
      <div class="field"><label for="tsExam">Practical exam date</label><input class="input" id="tsExam" type="datetime-local" value="${esc(ed || '')}"></div><div class="field"><label for="tsBranch">Branch / section</label><input class="input" id="tsBranch" value="${esc(p.branch || '')}" placeholder="optional"></div></div>
      <div class="field" style="margin-top:12px"><label>Daily study goal</label><div class="seg" id="tsGoal">${[15, 30, 45, 60, 90].map(m => `<button data-g="${m}" class="${(p.goal || 30) === m ? 'on' : ''}">${m} min</button>`).join('')}</div></div>
      <div class="field" style="margin-top:12px"><label>Theme</label><div class="seg" id="tsTheme"><button data-t="dark" class="${!isLight() ? 'on' : ''}">${icon('moon')} Dark</button><button data-t="light" class="${isLight() ? 'on' : ''}">${icon('sun')} Light</button></div></div>
      <label class="row" style="font-size:13px;margin-top:12px;cursor:pointer;gap:8px"><input type="checkbox" id="tsAlways" ${Store.s.settings.tourAlways ? 'checked' : ''}> Show this tour every time PhysLab opens</label></div></div>`;
}
function tourSetupBind() {
  const nm = $('#tsName'); nm.oninput = () => { $('#tsAvatar').textContent = initials(nm.value || 'You'); $('#tsHello').textContent = `${greeting()}${nm.value.trim() ? ', ' + nm.value.trim().split(' ')[0] : ''}!`; };
  $('#tsGoal').onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; $$('#tsGoal button').forEach(x => x.classList.toggle('on', x === b)); };
  $('#tsTheme').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; $$('#tsTheme button').forEach(x => x.classList.toggle('on', x === b)); Store.s.settings.theme = b.dataset.t; applyTheme(); };
  nm.focus();
}
function tourFinish() {
  const p = Store.s.profile;
  if ($('#tsName')) {
    p.name = $('#tsName').value.trim(); p.roll = $('#tsRoll').value.trim(); p.branch = $('#tsBranch').value.trim();
    const g = $('#tsGoal .on'); p.goal = g ? +g.dataset.g : 30;
    const ex = $('#tsExam').value; if (ex) { Store.s.exam.date = ex; if (typeof buildPlan === 'function') { const pl = buildPlan(); if (!pl.error) Store.s.plan = pl; } }
    Store.s.settings.tourAlways = $('#tsAlways').checked;
    syncProfileName();
  }
  tourClose(true);
  toast(p.name ? `Welcome, ${p.name.split(' ')[0]}! Let’s start.` : 'Welcome to PhysLab!', 'rocket');
  route();
}
function tourClose(done) {
  if (!TOURST) return;
  cancelAnimationFrame(TOURST.raf); TOURST.motifs.forEach(f => f()); TOURST = null;
  Store.s.onboarded = true; Store.s.seenVersion = APP_VERSION; Store.save();
  const el = $('#tour'); if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 350); }
  document.body.classList.remove('tour-open');
  updateSaas();
}
function tourMaybeStart() {
  const deep = location.search.match(/[?&]tour=(\d+)/);
  if (!deep && !(!Store.s.onboarded || Store.s.settings.tourAlways)) return false;
  const go = () => tourOpen(deep ? Math.max(0, Math.min(TOUR.length - 1, +deep[1] - 1)) : 0);
  const intro = $('#intro');
  if (intro && !intro.hidden) { const mo = new MutationObserver(() => { if (!document.body.contains(intro)) { mo.disconnect(); setTimeout(go, 150); } }); mo.observe(document.body, { childList: true }); }
  else setTimeout(go, 250);
  return true;
}
