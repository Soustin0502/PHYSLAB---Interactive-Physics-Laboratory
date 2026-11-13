/* ---------- Views: sidebar, dashboard, experiment module, revision, formulas, viva, bookmarks ---------- */
const VIEWS = {};
let heroStop = null;
let currentExp = null, currentTab = null;
const ringSvg = (pct, size = 16, col = '#a78bfa') => { const r = size / 2 - 2, c = 2 * Math.PI * r; return `<svg class="ring" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="2.5"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="${c * pct / 100} ${c}" stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`; };
const ALL_FORMULAS = () => EXPS.flatMap(e => e.formulas.map((f, i) => ({ ...f, id: `${e.id}-f${i}`, exp: e })));
const ALL_VIVA = () => EXPS.flatMap(e => e.viva.map((v, i) => ({ q: v[0], a: v[1], id: `${e.id}-${i}`, exp: e, i })));

function buildSidebar() {
  const r = location.hash || '#/';
  const item = (href, ic, label, badge = '') => `<a class="nav-item ${r === href || (href !== '#/' && r.startsWith(href + '/')) || (href === '#/' && (r === '#/' || r === '')) ? 'active' : ''}" href="${href}">${icon(ic)}<span>${label}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</a>`;
  $('#sidebar').innerHTML = `
    <a class="brand" href="#/" aria-label="PhysLab home"><span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="12" cy="12" r="2.2" fill="#fff"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg></span><span><b>PHYSLAB</b><small>Interactive Physics Lab</small></span></a>
    <div class="nav-label">Learn</div>
    ${item('#/', 'layout-dashboard', 'Dashboard')}${item('#/revision', 'zap', 'Quick Revision')}${item('#/formulas', 'sigma', 'Formula Library', ALL_FORMULAS().length)}
    <div class="nav-label">Experiments</div>
    ${EXPS.map(e => { const p = expProgress(e.id); const act = r.startsWith('#/exp/' + e.id); return `<a class="nav-item nav-exp ${act ? 'active' : ''}" href="#/exp/${e.id}/overview" style="${expStyle(e)}"><span class="num">${e.num}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.title}</span>${ringSvg(p.pct, 16, e.color)}</a>`; }).join('')}
    <div class="nav-label">Practice</div>
    ${item('#/viva', 'messages-square', 'Viva Bank', ALL_VIVA().length)}${item('#/quiz', 'list-checks', 'Quiz')}${item('#/flashcards', 'layers', 'Flashcards')}${item('#/trainer', 'ruler', 'Instrument Trainer')}${item('#/graphlab', 'line-chart', 'Graph Practice')}${item('#/puzzles', 'puzzle', 'Derivation Puzzles')}
    <div class="nav-label">Exam toolkit</div>
    ${item('#/exam', 'graduation-cap', 'Exam Simulation')}${item('#/record', 'file-text', 'Lab Record')}${item('#/mock', 'mic', 'Mock Viva')}${item('#/planner', 'calendar-check', 'Study Planner')}${item('#/checklist', 'clipboard-check', 'Exam Checklist')}${item('#/toolkit', 'wrench', 'Lab Toolkit')}
    <div class="nav-label">Personal</div>
    ${item('#/bookmarks', 'bookmark', 'Bookmarks', Store.s.bookmarks.exp.length + Store.s.bookmarks.viva.length + Store.s.bookmarks.formula.length || '')}${item('#/notes', 'notebook-pen', 'Notes')}${item('#/timer', 'timer', 'Focus Timer')}${item('#/achievements', 'trophy', 'Achievements', Store.s.badges.length || '')}${item('#/analytics', 'bar-chart-3', 'Analytics')}${item('#/report', 'clipboard-list', 'Progress Report')}${item('#/settings', 'settings', 'Settings')}
    <div class="side-user" id="sideUser"></div>
    <a class="side-count" href="#/settings" style="text-decoration:none;color:inherit;margin-top:10px" id="sideCount"></a>`;
  updateSideCount();
}
function examDiff() { const d = Store.s.exam.date ? new Date(Store.s.exam.date) : null; return d && !isNaN(d) ? d - Date.now() : null; }
function updateSideCount() {
  const el = $('#sideCount'); if (!el) return;
  const diff = examDiff();
  if (diff == null) el.innerHTML = `<div class="t">Exam countdown</div><div class="s" style="margin-top:4px">${icon('calendar-plus')} Set your exam date</div>`;
  else if (diff <= 0) el.innerHTML = `<div class="t">${esc(Store.s.exam.label)}</div><div class="v">Today / done</div><div class="s">Best of luck!</div>`;
  else { const d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5); el.innerHTML = `<div class="t">${esc(Store.s.exam.label)}</div><div class="v">${d}d ${h}h</div><div class="s">${new Date(Store.s.exam.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>`; }
}

/* ---------------- Dashboard ---------------- */
VIEWS.dashboard = () => {
  const ov = overallProgress(), st = Store.s;
  const today = st.study[todayKey()] || 0, focusT = st.focus[todayKey()] || 0;
  const qh = st.quizHistory, avg = qh.length ? Math.round(mean(qh.map(q => q.score / q.total * 100))) : null;
  const known = Object.values(st.viva).filter(v => v === 'known').length, tot = ALL_VIVA().length;
  const last = st.lastVisited && expById(st.lastVisited.exp) ? st.lastVisited : null;
  const lastE = last ? expById(last.exp) : EXPS[0];
  const weakest = EXPS.slice().sort((a, b) => expProgress(a.id).pct - expProgress(b.id).pct)[0];
  return `
  <section class="hero" aria-label="Welcome">
    <canvas class="hero-bg" id="heroCanvas" aria-hidden="true"></canvas>
    <div class="hero-chips" aria-hidden="true">${[['λ = (D²ₙ₊ₚ − D²ₙ) / 4pR', 62, 16, 1.4], ['hν = φ + ½mv²ₘₐₓ', 80, 38, .8], ['a sin θ = nλ', 66, 62, 1.1], ['f = (1/2l) √(T/m)', 84, 74, 1.6], ['T = 2π √((K²+l²)/gl)', 74, 88, .9], ['FF = VₘIₘ / V_oc I_sc', 79, 4, 1.2]].map((c, i) => `<span class="hero-chip" data-depth="${c[3]}" style="left:${c[1]}%;top:${c[2]}%;animation-delay:${i * -1.3}s">${c[0]}</span>`).join('')}</div>
    <div class="hero-content">
      <span class="eyebrow">Engineering Physics · Practical Lab</span>
      <h1>Master every experiment, <span class="grad">one wave at a time.</span></h1>
      <p>Theory, derivations, live simulations, a calculation workspace, viva practice and exam tools for all eight first-year practicals — in one place.</p>
      <div class="row">
        <a class="btn primary" href="#/exp/${lastE.id}/${last ? last.tab : 'overview'}">${icon('play')} ${last ? 'Continue: ' + esc(lastE.title) : 'Start with Experiment 1'}</a>
        <a class="btn" href="#/quiz">${icon('list-checks')} Take a quiz</a>
        <a class="btn ghost" href="#/revision">${icon('zap')} Quick revision</a>
      </div>
    </div>
  </section>
  <div class="grid g4" style="margin-top:20px">
    <div class="card"><div class="stat"><span class="k">${icon('target')} Overall progress</span><span class="v">${ov}%</span><div class="progress" style="margin-top:6px"><i style="width:${ov}%"></i></div></div></div>
    <div class="card"><div class="stat"><span class="k">${icon('clock')} Studied today</span><span class="v">${fmtDuration(today)}</span><span class="s">Focus sessions: ${fmtDuration(focusT)}</span></div></div>
    <div class="card"><div class="stat"><span class="k">${icon('award')} Quiz average</span><span class="v">${avg == null ? '—' : avg + '%'}</span><span class="s">${qh.length} quiz${qh.length === 1 ? '' : 'zes'} taken</span></div></div>
    <div class="card"><div class="stat"><span class="k">${icon('brain')} Viva mastered</span><span class="v">${known}<span class="dim" style="font-size:17px"> / ${tot}</span></span><span class="s">${Object.values(st.viva).filter(v => v === 'review').length} marked for review</span></div></div>
  </div>
  <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);margin-top:20px" id="dashRow2">${dailyHtml()}${levelCardHtml()}</div>
  <div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);margin-top:20px" id="dashRow">
    <div class="card">
      <h3>${icon('calendar-clock')} Exam countdown <span class="spacer"></span><a class="btn sm ghost" href="#/settings">${icon('pencil')} Edit</a></h3>
      <div id="dashCountdown"></div>
    </div>
    ${todayPlanHtml() ? `<div class="card" id="dashPlan"><h3>${icon('calendar-check')} Today’s plan <span class="spacer"></span><a class="btn sm ghost" href="#/planner">All days</a></h3>${todayPlanHtml()}</div>` : `<div class="card">
      <h3>${icon('lightbulb')} Suggested next</h3>
      <p class="muted" style="margin:0 0 12px;font-size:14px">Your least-complete module is <b style="color:var(--text)">${esc(weakest.title)}</b> (${expProgress(weakest.id).pct}%).</p>
      <a class="btn sm" href="#/exp/${weakest.id}/overview">${icon('arrow-right')} Open module</a>
      <a class="btn sm ghost" href="#/planner">${icon('calendar-check')} Make a study plan</a>
    </div>`}
  </div>
  <div class="page-head" style="margin:32px 0 16px"><div><h2 style="font-size:22px">Experiments</h2><p>Eight complete learning modules. Progress is tracked per section.</p></div></div>
  <div class="exp-grid">
    ${EXPS.map(e => { const p = expProgress(e.id); return `<a class="exp-card" href="#/exp/${e.id}/overview" style="${expStyle(e)}"><canvas class="card-motif" data-motif="${e.id}" aria-hidden="true"></canvas>
      <div class="top"><span class="exp-icon">${icon(e.icon)}</span><div><span class="n">EXPERIMENT ${String(e.num).padStart(2, '0')}</span><h4>${e.title}</h4></div>${isBm('exp', e.id) ? `<span style="margin-left:auto;color:var(--amber)">${icon('bookmark')}</span>` : ''}</div>
      <p>${e.subtitle}. ${e.topic}.</p>
      <div class="meta"><div class="progress"><i style="width:${p.pct}%;background:var(--exp-grad)"></i></div><span>${p.done}/${p.total}</span></div></a>`; }).join('')}
  </div>`;
};
function mountDashboard() {
  renderCountdown();
  const cd = setInterval(() => { if (!$('#dashCountdown')) return clearInterval(cd); renderCountdown(); }, 1000);
  if (window.innerWidth < 900) { const r = $('#dashRow'); if (r) r.style.gridTemplateColumns = '1fr'; }
  heroStop = startHero($('#heroCanvas'));
  $$('[data-dpt]').forEach(c => c.onchange = () => { if (c.checked) Store.s.planDone[c.dataset.dpt] = true; else delete Store.s.planDone[c.dataset.dpt]; Store.save(); c.closest('.plan-task').classList.toggle('done', c.checked); });
}
function renderCountdown() {
  const el = $('#dashCountdown'); if (!el) return;
  const diff = examDiff();
  if (diff == null) { el.innerHTML = `<p class="muted" style="margin:0 0 12px">Set your practical exam date to see a live countdown.</p><div class="row"><input type="datetime-local" class="input" id="quickExam" style="max-width:260px" aria-label="Exam date and time"><button class="btn primary sm" id="quickExamSave">${icon('check')} Save</button></div>`; refreshIcons(); $('#quickExamSave').onclick = () => { const v = $('#quickExam').value; if (!v) return toast('Pick a date first', 'alert-circle'); Store.s.exam.date = v; Store.save(); renderCountdown(); updateSideCount(); toast('Exam date saved'); }; return; }
  if (el.dataset.mode !== 'run') { el.dataset.mode = 'run'; el.innerHTML = `<p class="muted" style="margin:0 0 12px">${esc(Store.s.exam.label)} — ${new Date(Store.s.exam.date).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p><div class="countdown" id="cdv"></div>`; }
  const v = Math.max(0, diff), parts = [[Math.floor(v / 864e5), 'Days'], [Math.floor(v % 864e5 / 36e5), 'Hours'], [Math.floor(v % 36e5 / 6e4), 'Min'], [Math.floor(v % 6e4 / 1e3), 'Sec']];
  $('#cdv').innerHTML = parts.map(p => `<div><b>${String(p[0]).padStart(2, '0')}</b><span>${p[1]}</span></div>`).join('');
}

/* Three.js hero: animated interference wave surface (falls back to 2D canvas) */
function startHero(cv) {
  if (!cv) return null;
  const reduce = Store.s.settings.reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const w = () => cv.clientWidth, h = () => cv.clientHeight;
  if (window.THREE) {
    try {
      const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setSize(w(), h(), false);
      const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, w() / h(), .1, 100);
      cam.position.set(0, 7.5, 11); cam.lookAt(2.2, 0, 0);
      const N = 90, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * N * 3), col = new Float32Array(N * N * 3);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const k = (i * N + j) * 3; pos[k] = (i / (N - 1) - .5) * 16 + 3; pos[k + 2] = (j / (N - 1) - .5) * 12; }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: .07, vertexColors: true, transparent: true, opacity: .95 }));
      scene.add(pts);
      const s1 = [-1, -3], s2 = [-1, 3];
      let raf, t = 0, alive = true;
      const frame = () => {
        if (!alive) return;
        t += reduce ? 0 : .016;
        for (let i = 0; i < N * N; i++) {
          const x = pos[i * 3], z = pos[i * 3 + 2], r1 = Math.hypot(x - s1[0], z - s1[1]), r2 = Math.hypot(x - s2[0], z - s2[1]);
          const y = (Math.sin(r1 * 2.2 - t * 2.4) / Math.sqrt(r1 + 1) + Math.sin(r2 * 2.2 - t * 2.4) / Math.sqrt(r2 + 1)) * .9;
          pos[i * 3 + 1] = y; const v = (y + 1.2) / 2.4;
          col[i * 3] = .35 + .25 * v; col[i * 3 + 1] = .3 + .55 * v; col[i * 3 + 2] = .95;
        }
        geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
        if (cv.width !== Math.floor(w() * renderer.getPixelRatio())) { renderer.setSize(w(), h(), false); cam.aspect = w() / h(); cam.updateProjectionMatrix(); }
        renderer.render(scene, cam);
        raf = requestAnimationFrame(frame);
      };
      frame();
      return () => { alive = false; cancelAnimationFrame(raf); geo.dispose(); renderer.dispose(); };
    } catch (e) { /* fall through to 2D */ }
  }
  const g = cv.getContext('2d'); let raf, t = 0, alive = true;
  const frame = () => {
    if (!alive) return; cv.width = w(); cv.height = h(); t += reduce ? 0 : .02;
    for (let x = 0; x < cv.width; x += 8) for (let y = 0; y < cv.height; y += 8) { const r1 = Math.hypot(x - cv.width * .55, y - cv.height * .3), r2 = Math.hypot(x - cv.width * .55, y - cv.height * .7); const v = (Math.sin(r1 / 12 - t * 3) + Math.sin(r2 / 12 - t * 3)) / 2; g.fillStyle = `rgba(139,92,246,${Math.max(0, v) * .5})`; g.fillRect(x, y, 3, 3); }
    raf = requestAnimationFrame(frame);
  };
  frame();
  return () => { alive = false; cancelAnimationFrame(raf); };
}

/* ---------------- Experiment module ---------------- */
VIEWS.exp = (id, tab) => {
  const e = expById(id);
  if (!e) return VIEWS.notFound();
  if (!SECTIONS.some(s => s.k === tab)) tab = 'overview';
  currentExp = e; currentTab = tab;
  Store.s.lastVisited = { exp: id, tab }; saveSoon();
  const p = expProgress(id), idx = SECTIONS.findIndex(s => s.k === tab), next = SECTIONS[idx + 1], prev = SECTIONS[idx - 1];
  const done = !!(Store.s.progress[id] || {})[tab];
  return `<div style="${expStyle(e)}">
    <div class="exp-hero">
      <canvas class="exp-banner" data-motif="${id}" aria-hidden="true"></canvas>
      <div style="display:flex;gap:16px;align-items:flex-start"><span class="exp-icon" style="width:54px;height:54px;border-radius:15px">${icon(e.icon)}</span>
        <div><span class="eyebrow" style="color:${e.color}">Experiment ${String(e.num).padStart(2, '0')} · ${e.topic}</span><h1>${e.title}</h1><p>${e.subtitle}</p></div></div>
      <div class="row">
        <div style="text-align:right;margin-right:6px"><div class="dim" style="font-size:11.5px;text-transform:uppercase;letter-spacing:.08em">Module progress</div><div class="mono" style="font-size:18px">${p.pct}%</div></div>
        ${ringSvg(p.pct, 44, e.color).replace('class="ring"', 'class="ring" style="width:44px;height:44px"')}
        <button class="icon-btn ${isBm('exp', id) ? 'on' : ''}" id="bmExp" aria-label="Bookmark experiment" aria-pressed="${isBm('exp', id)}" title="Bookmark">${icon('bookmark')}</button>
        <a class="icon-btn" href="#/revision/${id}" aria-label="Quick revision for this experiment" title="Quick revision">${icon('zap')}</a>
        <a class="icon-btn" href="#/record/${id}" aria-label="Printable lab record" title="Lab record">${icon('file-text')}</a>
        <button class="icon-btn" id="printExp" aria-label="Print this section" title="Print">${icon('printer')}</button>
      </div>
    </div>
    <nav class="tabs" role="tablist" aria-label="Sections" id="expTabs">${SECTIONS.map(s => `<a class="tab ${s.k === tab ? 'active' : ''}" role="tab" aria-selected="${s.k === tab}" href="#/exp/${id}/${s.k}" data-tab="${s.k}">${icon(s.i)}<span>${s.t}</span>${(Store.s.progress[id] || {})[s.k] ? icon('check-circle-2', 'ck') : ''}</a>`).join('')}</nav>
    <div id="tabBody" class="view-enter"></div>
    <div class="complete-bar no-print">
      <div class="row">${prev ? `<a class="btn ghost sm" href="#/exp/${id}/${prev.k}">${icon('arrow-left')} ${prev.t}</a>` : ''}</div>
      <button class="btn ${done ? 'on' : ''}" id="markDone" aria-pressed="${done}">${icon(done ? 'check-circle-2' : 'circle')} ${done ? 'Section completed' : 'Mark section as complete'}</button>
      <div class="row">${next ? `<a class="btn sm" href="#/exp/${id}/${next.k}">${next.t} ${icon('arrow-right')}</a>` : `<a class="btn sm primary" href="#/quiz?exp=${id}">${icon('list-checks')} Quiz on this experiment</a>`}</div>
    </div>
    <details class="card no-print" style="margin-top:16px" id="expNotes" ${Store.s.notes[id] ? 'open' : ''}>
      <summary style="cursor:pointer;font-weight:600;display:flex;align-items:center;gap:8px">${icon('notebook-pen')} My notes for ${e.title}</summary>
      <textarea class="input note-ed" style="min-height:140px;margin-top:12px" id="expNoteTa" placeholder="Write observations, doubts, viva points…" aria-label="Notes for ${esc(e.title)}">${esc(Store.s.notes[id] || '')}</textarea>
      <div class="dim" style="font-size:12px;margin-top:6px" id="expNoteSaved">Saved automatically</div>
    </details>
  </div>`;
};
function updateTabChecks() {
  if (!currentExp) return;
  $$('#expTabs .tab').forEach(t => { const k = t.dataset.tab, has = $('.ck', t), d = (Store.s.progress[currentExp.id] || {})[k]; if (d && !has) { t.insertAdjacentHTML('beforeend', icon('check-circle-2', 'ck')); refreshIcons(); } });
}
function mountExp(id, tab) {
  const e = expById(id); if (!e) return;
  if (!SECTIONS.some(s => s.k === tab)) tab = 'overview';
  const body = $('#tabBody');
  body.innerHTML = renderTab(e, tab);
  if (tab === 'simulation') mountSim($('#simHost'), id);
  if (tab === 'diagram') renderDiagramTab(e, $('#diagCard'));
  if (tab === 'observations') renderObservations(e, $('#obsHost'));
  if (tab === 'workspace') renderWorkspace(e, $('#wsHost'));
  if (tab === 'viva') bindQA(body);
  renderMath(body);
  $('#bmExp').onclick = ev => { const on = toggleBm('exp', id); ev.currentTarget.classList.toggle('on', on); ev.currentTarget.setAttribute('aria-pressed', on); buildSidebar(); refreshIcons(); };
  $('#printExp').onclick = () => window.print();
  $('#markDone').onclick = () => {
    const now = !(Store.s.progress[id] || {})[tab]; setSection(id, tab, now);
    if (now) { toast('Section marked complete'); const i = SECTIONS.findIndex(s => s.k === tab); if (expProgress(id).pct === 100) toast(`🎉 ${e.title} module complete!`, 'trophy'); }
    route();
  };
  const ta = $('#expNoteTa'); let t;
  ta.oninput = () => { Store.s.notes[id] = ta.value; clearTimeout(t); $('#expNoteSaved').textContent = 'Saving…'; t = setTimeout(() => { Store.save(); $('#expNoteSaved').textContent = 'Saved ' + new Date().toLocaleTimeString(); }, 400); };
  const at = $('#expTabs .tab.active'); if (at) at.scrollIntoView({ block: 'nearest', inline: 'center' });
}
function renderTab(e, tab) {
  switch (tab) {
    case 'overview': return `<div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)" id="ovGrid">
      <div class="card pad-lg prose"><h3>${icon('target')} Aim</h3><p style="font-size:16px;color:var(--text)">${e.aim}</p>
        <h3>Principle</h3>${e.principle}
        <h3>Apparatus required</h3><ul class="apparatus">${e.apparatus.map(a => `<li>${a}</li>`).join('')}</ul></div>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div class="card"><h3>${icon('key-round')} Key facts</h3><dl class="kv">${e.keyValues.map(k => `<dt>${k[0]}</dt><dd>${k[1]}</dd>`).join('')}</dl></div>
        <div class="card"><h3>${icon('function-square')} Working formula</h3><div class="formula-card">${tex(e.formulas[0].tex, true)}</div><p class="muted" style="font-size:13px;margin:0">${e.formulas[0].desc}</p></div>
        <div class="card"><h3>${icon('line-chart')} Expected graph</h3><p class="muted" style="font-size:13.5px;margin:0">${e.graphNote}</p></div>
      </div></div>`;
    case 'theory': return `<div class="card pad-lg prose">${e.theory}</div><div class="card pad-lg prose" style="margin-top:18px">${e.derivation}</div>
      <h3 style="font-size:18px;margin:26px 0 12px">Formula sheet</h3><div class="grid g2">${e.formulas.map((f, i) => formulaCard({ ...f, id: `${e.id}-f${i}`, exp: e })).join('')}</div>`;
    case 'procedure': return `<div class="grid" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)" id="prGrid"><div class="card pad-lg prose"><h3>Procedure</h3><ol class="steps">${e.procedure.map(s => `<li>${s}</li>`).join('')}</ol></div>
      <div style="display:flex;flex-direction:column;gap:18px"><div class="card prose"><h3>${icon('shield-alert')} Precautions</h3><ul>${e.precautions.map(s => `<li>${s}</li>`).join('')}</ul></div><div class="card prose"><h3>${icon('alert-triangle')} Sources of error</h3><ul>${e.errors.map(s => `<li>${s}</li>`).join('')}</ul></div>
      <div class="card prose"><h3>${icon('file-check-2')} Result (record format)</h3><p>The ${e.resultLabel.toLowerCase()} is found to be ______ ${e.standardUnit}.${e.standard ? ` Standard value: <b>${e.id === 'photo' ? '6.626 × 10⁻³⁴' : e.standard} ${e.standardUnit}</b>.` : ''}</p><p class="dim" style="font-size:13px">See the Observations tab for a fully worked sample result.</p></div></div></div>`;
    case 'diagram': return `<div class="card pad-lg" id="diagCard"></div>`;
    case 'simulation': return `${VLAB[e.id] ? vlabBanner(e.id) : ''}<div id="simHost"></div>`;
    case 'observations': return `<div class="card pad-lg"><h3>${icon('table-2')} Observation table, sample calculation and graph</h3><div id="obsHost"></div></div>
      <div class="card pad-lg prose" style="margin-top:18px"><h3>Precautions to write in the record</h3><ul>${e.precautions.slice(0, 5).map(s => `<li>${s}</li>`).join('')}</ul></div>`;
    case 'workspace': return `<div class="card pad-lg"><h3>${icon('calculator')} Your observation & calculation workspace</h3><div id="wsHost"></div></div>`;
    case 'viva': return `<div class="toolbar"><span class="tag violet">${e.viva.length} questions</span><span class="spacer"></span><button class="btn sm" data-allqa="1">${icon('eye')} Reveal all</button><a class="btn sm" href="#/flashcards?exp=${e.id}">${icon('layers')} Flashcards</a><a class="btn sm primary" href="#/quiz?exp=${e.id}">${icon('list-checks')} Quiz</a></div>${e.viva.map((v, i) => qaHtml({ q: v[0], a: v[1], id: `${e.id}-${i}`, exp: e, i })).join('')}`;
  }
  return '';
}
function formulaCard(f) {
  return `<div class="card formula-card" data-fid="${f.id}"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div><div style="font-weight:600">${f.name}</div><a class="dim" style="font-size:12px" href="#/exp/${f.exp.id}/theory">${f.exp.num}. ${f.exp.title}</a></div>
    <div class="row" style="flex-wrap:nowrap;gap:6px"><button class="icon-btn" style="width:30px;height:30px" data-copy="${esc(f.tex)}" aria-label="Copy LaTeX" title="Copy LaTeX">${icon('copy')}</button><button class="icon-btn ${isBm('formula', f.id) ? 'on' : ''}" style="width:30px;height:30px" data-bmf="${f.id}" aria-label="Bookmark formula" title="Bookmark">${icon('bookmark')}</button></div></div>
    <div style="overflow-x:auto">${tex(f.tex, true)}</div><p class="muted" style="font-size:13px;margin:0">${f.desc}</p>
    ${f.vars && f.vars.length ? `<div class="vars">${f.vars.map(v => `<span class="mono" style="color:var(--cyan)">${symHtml(v[0])}</span><span>${v[1]}</span><span class="u">${v[2]}</span>`).join('')}</div>` : ''}</div>`;
}
function qaHtml(v, showExp = false) {
  const s = Store.s.viva[v.id] || '';
  return `<div class="qa ${s}" data-qid="${v.id}"><button class="qa-head" aria-expanded="false"><span class="qn">Q${v.i + 1}</span><span class="q">${v.q}${showExp ? `<span class="tag" style="margin-left:8px;vertical-align:middle">${v.exp.num}. ${v.exp.title}</span>` : ''}</span>${isBm('viva', v.id) ? `<span style="color:var(--amber)">${icon('bookmark')}</span>` : ''}${icon('chevron-down', 'chev')}</button>
    <div class="qa-body"><div>${v.a}</div><div class="qa-actions"><button class="btn sm ${s === 'known' ? 'on' : ''}" data-mark="known">${icon('check')} I know this</button><button class="btn sm ${s === 'review' ? 'on' : ''}" data-mark="review">${icon('rotate-cw')} Review again</button><button class="btn sm ghost" data-bmq="1">${icon('bookmark')} ${isBm('viva', v.id) ? 'Bookmarked' : 'Bookmark'}</button></div></div></div>`;
}
function bindQA(root, onChange) {
  root.addEventListener('click', ev => {
    if (ev.target.closest('[data-allqa]')) { const all = $$('.qa', root), open = all.some(q => !q.classList.contains('open')); all.forEach(q => { q.classList.toggle('open', open); $('.qa-head', q).setAttribute('aria-expanded', open); }); return; }
    const qa = ev.target.closest('.qa'); if (!qa) return;
    const id = qa.dataset.qid;
    if (ev.target.closest('.qa-head')) { const o = qa.classList.toggle('open'); $('.qa-head', qa).setAttribute('aria-expanded', o); return; }
    const mk = ev.target.closest('[data-mark]');
    if (mk) { const v = mk.dataset.mark; Store.s.viva[id] = Store.s.viva[id] === v ? undefined : v; if (!Store.s.viva[id]) delete Store.s.viva[id]; Store.save(); qa.classList.remove('known', 'review'); if (Store.s.viva[id]) qa.classList.add(Store.s.viva[id]); $$('[data-mark]', qa).forEach(b => b.classList.toggle('on', b.dataset.mark === Store.s.viva[id])); onChange && onChange(); return; }
    if (ev.target.closest('[data-bmq]')) { const on = toggleBm('viva', id); ev.target.closest('[data-bmq]').innerHTML = icon('bookmark') + (on ? ' Bookmarked' : ' Bookmark'); refreshIcons(); buildSidebar(); refreshIcons(); onChange && onChange(); }
  });
}
function bindFormulaActions(root) {
  root.addEventListener('click', ev => {
    const c = ev.target.closest('[data-copy]');
    if (c) { const txt = c.dataset.copy; (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('LaTeX copied', 'copy')).catch(() => { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('LaTeX copied', 'copy'); } catch (e) { } ta.remove(); }); return; }
    const b = ev.target.closest('[data-bmf]'); if (b) { const on = toggleBm('formula', b.dataset.bmf); b.classList.toggle('on', on); buildSidebar(); refreshIcons(); }
  });
}

/* ---------------- Formula library ---------------- */
VIEWS.formulas = () => `<div class="page-head"><div><span class="eyebrow">Reference</span><h1>Formula Library</h1><p>Every working formula, derivation result and constant across all eight experiments — searchable, with symbols and SI units.</p></div></div>
  <div class="toolbar"><div class="search-box">${icon('search')}<input class="input" id="fSearch" placeholder="Search formulas, symbols, descriptions…" aria-label="Search formulas"></div><button class="chip" id="fBmOnly">${icon('bookmark')} Bookmarked</button></div>
  <div class="row" style="margin-bottom:18px" id="fChips"><button class="chip on" data-e="">All</button>${EXPS.map(e => `<button class="chip" data-e="${e.id}"><span class="dot" style="background:${e.color}"></span>${e.title}</button>`).join('')}</div>
  <div class="card" style="margin-bottom:18px;padding:16px 20px"><div class="row" style="gap:18px;font-size:13px"><b>Constants:</b><span class="mono">h = 6.626×10⁻³⁴ J s</span><span class="mono">c = 2.998×10⁸ m/s</span><span class="mono">e = 1.602×10⁻¹⁹ C</span><span class="mono">k_B = 1.381×10⁻²³ J/K</span><span class="mono">g = 9.81 m/s²</span><span class="mono">1 eV = 1.602×10⁻¹⁹ J</span></div></div>
  <div class="grid g2" id="fList"></div>`;
function mountFormulas() {
  let q = '', ex = '', bm = false;
  const all = ALL_FORMULAS();
  const draw = () => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = all.filter(f => (!ex || f.exp.id === ex) && (!bm || isBm('formula', f.id)) && words.every(w => (f.name + ' ' + f.desc + ' ' + f.tex + ' ' + f.exp.title + ' ' + (f.vars || []).flat().join(' ')).toLowerCase().includes(w)));
    $('#fList').innerHTML = list.length ? list.map(formulaCard).join('') : `<div class="empty" style="grid-column:1/-1">${icon('search-x')}<div>No formulas match.</div></div>`;
    refreshIcons();
  };
  $('#fSearch').oninput = e => { q = e.target.value; draw(); };
  $('#fChips').onclick = e => { const c = e.target.closest('.chip'); if (!c) return; ex = c.dataset.e; $$('#fChips .chip').forEach(x => x.classList.toggle('on', x === c)); draw(); };
  $('#fBmOnly').onclick = e => { bm = !bm; e.currentTarget.classList.toggle('on', bm); draw(); };
  bindFormulaActions($('#fList'));
  draw();
}

/* ---------------- Viva bank ---------------- */
VIEWS.viva = () => `<div class="page-head"><div><span class="eyebrow">Practice</span><h1>Viva Question Bank</h1><p>${ALL_VIVA().length} examiner-style questions with model answers. Mark what you know; revisit what you don’t.</p></div><div class="row"><a class="btn" href="#/flashcards">${icon('layers')} Flashcard mode</a></div></div>
  <div class="grid g4" style="margin-bottom:18px" id="vStats"></div>
  <div class="toolbar"><div class="search-box">${icon('search')}<input class="input" id="vSearch" placeholder="Search questions and answers…" aria-label="Search viva questions"></div>
  <select class="input" id="vStatus" style="width:auto" aria-label="Filter by status"><option value="">All statuses</option><option value="unseen">Not yet marked</option><option value="known">Known</option><option value="review">Review again</option><option value="bm">Bookmarked</option></select>
  <button class="btn sm" id="vRandom">${icon('shuffle')} Random question</button><button class="btn sm" data-allqa="1" id="vReveal">${icon('eye')} Reveal all</button></div>
  <div class="row" style="margin-bottom:18px" id="vChips"><button class="chip on" data-e="">All experiments</button>${EXPS.map(e => `<button class="chip" data-e="${e.id}"><span class="dot" style="background:${e.color}"></span>${e.title}</button>`).join('')}</div>
  <div id="vList"></div>`;
function mountViva() {
  let q = '', ex = '', status = '';
  const all = ALL_VIVA();
  const stats = () => { const k = all.filter(v => Store.s.viva[v.id] === 'known').length, r = all.filter(v => Store.s.viva[v.id] === 'review').length; $('#vStats').innerHTML = [['Total', all.length, 'messages-square'], ['Known', k, 'check-circle-2'], ['Review', r, 'rotate-cw'], ['Unmarked', all.length - k - r, 'circle-dashed']].map(s => `<div class="card" style="padding:16px"><div class="stat"><span class="k">${icon(s[2])} ${s[0]}</span><span class="v">${s[1]}</span></div></div>`).join(''); refreshIcons(); };
  const draw = () => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = all.filter(v => (!ex || v.exp.id === ex) && (!status || (status === 'unseen' ? !Store.s.viva[v.id] : status === 'bm' ? isBm('viva', v.id) : Store.s.viva[v.id] === status)) && words.every(w => (v.q + ' ' + v.a).toLowerCase().includes(w)));
    $('#vList').innerHTML = list.length ? list.map(v => qaHtml(v, !ex)).join('') : `<div class="empty">${icon('search-x')}<div>No questions match these filters.</div></div>`;
    refreshIcons();
  };
  $('#vSearch').oninput = e => { q = e.target.value; draw(); };
  $('#vStatus').onchange = e => { status = e.target.value; draw(); };
  $('#vChips').onclick = e => { const c = e.target.closest('.chip'); if (!c) return; ex = c.dataset.e; $$('#vChips .chip').forEach(x => x.classList.toggle('on', x === c)); draw(); };
  $('#vReveal').onclick = () => { const qs = $$('#vList .qa'), open = qs.some(x => !x.classList.contains('open')); qs.forEach(x => x.classList.toggle('open', open)); };
  $('#vRandom').onclick = () => { const qs = $$('#vList .qa'); if (!qs.length) return; qs.forEach(x => x.classList.remove('open')); const pick = qs[Math.floor(Math.random() * qs.length)]; pick.scrollIntoView({ behavior: 'smooth', block: 'center' }); pick.style.boxShadow = '0 0 0 2px var(--violet)'; setTimeout(() => pick.style.boxShadow = '', 1600); $('.qa-head', pick).focus({ preventScroll: true }); };
  bindQA($('#vList'), stats);
  stats(); draw();
}

/* ---------------- Quick revision ---------------- */
VIEWS.revision = sel => `<div class="page-head"><div><span class="eyebrow">Exam eve</span><h1>Quick Revision</h1><p>One-screen summaries: aim, formula, key numbers, graph, precautions and the most-asked viva questions.</p></div><button class="btn no-print" onclick="window.print()">${icon('printer')} Print / save as PDF</button></div>
  <div class="row no-print" style="margin-bottom:18px" id="rChips"><a class="chip ${!sel ? 'on' : ''}" href="#/revision">All</a>${EXPS.map(e => `<a class="chip ${sel === e.id ? 'on' : ''}" href="#/revision/${e.id}"><span class="dot" style="background:${e.color}"></span>${e.title}</a>`).join('')}</div>
  <div class="grid ${sel ? '' : 'g2'}">${EXPS.filter(e => !sel || e.id === sel).map(e => `<article class="card rev-card" style="${expStyle(e)};border-top:3px solid ${e.color}">
    <div class="row" style="justify-content:space-between"><div><span class="eyebrow" style="color:${e.color};margin:0">Exp ${e.num} · ${e.topic}</span><h2 style="font-size:20px;margin-top:4px">${e.title}</h2></div><a class="btn sm ghost no-print" href="#/exp/${e.id}/overview">${icon('arrow-up-right')} Module</a></div>
    <p class="muted" style="font-size:14px">${e.aim}</p>
    ${e.formulas.slice(0, sel ? 4 : 2).map(f => `<div class="rev-formula">${tex(f.tex, true)}</div>`).join('')}
    <dl class="kv" style="margin:12px 0">${e.keyValues.map(k => `<dt>${k[0]}</dt><dd>${k[1]}</dd>`).join('')}</dl>
    <div class="callout" style="font-size:13px"><b>Graph:</b> ${e.graphNote}</div>
    <h4 style="font-size:14px;margin:14px 0 6px">Precautions</h4><ul style="margin:0;padding-left:20px;font-size:13.5px;color:var(--text-2)">${e.precautions.slice(0, sel ? 6 : 3).map(p => `<li>${p}</li>`).join('')}</ul>
    <h4 style="font-size:14px;margin:14px 0 6px">Top viva questions</h4>${e.viva.slice(0, sel ? 10 : 5).map(v => `<div style="font-size:13.5px;margin-bottom:8px"><b>Q. ${v[0]}</b><div class="muted">${v[1]}</div></div>`).join('')}
  </article>`).join('')}</div>`;

/* ---------------- Bookmarks ---------------- */
VIEWS.bookmarks = () => {
  const b = Store.s.bookmarks, all = ALL_VIVA(), fs = ALL_FORMULAS();
  const ex = b.exp.map(expById).filter(Boolean), vs = all.filter(v => b.viva.includes(v.id)), ff = fs.filter(f => b.formula.includes(f.id));
  return `<div class="page-head"><div><span class="eyebrow">Personal</span><h1>Bookmarks</h1><p>Everything you saved for later, in one place. Use the bookmark icon on experiments, formulas and viva questions.</p></div></div>
  <h3 style="font-size:17px;margin-bottom:12px">Experiments (${ex.length})</h3>
  ${ex.length ? `<div class="exp-grid">${ex.map(e => `<a class="exp-card" href="#/exp/${e.id}/overview" style="${expStyle(e)}"><div class="top"><span class="exp-icon">${icon(e.icon)}</span><div><span class="n">EXPERIMENT ${e.num}</span><h4>${e.title}</h4></div></div><p>${e.subtitle}</p></a>`).join('')}</div>` : `<div class="empty">${icon('bookmark')}<div>No experiments bookmarked.</div></div>`}
  <h3 style="font-size:17px;margin:28px 0 12px">Formulas (${ff.length})</h3>
  ${ff.length ? `<div class="grid g2" id="bmF">${ff.map(formulaCard).join('')}</div>` : `<div class="empty">${icon('sigma')}<div>No formulas bookmarked.</div></div>`}
  <h3 style="font-size:17px;margin:28px 0 12px">Viva questions (${vs.length})</h3>
  <div id="bmV">${vs.length ? vs.map(v => qaHtml(v, true)).join('') : `<div class="empty">${icon('messages-square')}<div>No viva questions bookmarked.</div></div>`}</div>`;
};
function mountBookmarks() { const f = $('#bmF'); if (f) bindFormulaActions(f); bindQA($('#bmV')); }

VIEWS.notFound = () => `<div class="empty" style="margin-top:40px">${icon('compass')}<h2 style="margin:8px 0">Page not found</h2><p><a href="#/">Back to dashboard</a></p></div>`;
