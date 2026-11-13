/* ---------- Study tools: quiz, flashcards, notes, focus timer, analytics, settings, search ---------- */

/* ================= QUIZ ================= */
function quizPool(ids) {
  const pool = [];
  ids.forEach(id => (MCQ[id] || []).forEach((m, i) => pool.push({ id: `${id}-m${i}`, exp: id, q: m.q, o: m.o, a: m.a, e: m.e })));
  // auto-generated: which experiment does this formula belong to?
  ids.forEach(id => { const e = expById(id); e.formulas.slice(0, 3).forEach((f, i) => { const wrong = shuffle(EXPS.filter(x => x.id !== id)).slice(0, 3); pool.push({ id: `${id}-g${i}`, exp: id, q: `The relation ${tex(f.tex)} is used in which experiment?`, o: [e.title, ...wrong.map(w => w.title)], a: 0, e: `${f.name} — ${f.desc}`, html: true }); }); });
  return pool;
}
let QZ = null;
VIEWS.quiz = () => `<div class="page-head"><div><span class="eyebrow">Practice</span><h1>Randomised Quiz</h1><p>Questions and options are shuffled every attempt. Scores are saved to your analytics.</p></div></div><div id="quizHost" class="quiz-wrap"></div>`;
function mountQuiz(params) {
  const pre = params.get('exp');
  QZ = null;
  quizSetup(pre ? [pre] : EXPS.map(e => e.id));
}
function quizSetup(sel) {
  const host = $('#quizHost'); let chosen = new Set(sel), count = 10, mode = 'instant', timed = false;
  const hist = Store.s.quizHistory.slice(-5).reverse();
  host.innerHTML = `<div class="card pad-lg">
    <h3>${icon('settings-2')} Set up your quiz</h3>
    <div class="field" style="margin-bottom:16px"><label>Experiments</label><div class="row" id="qzExps">${EXPS.map(e => `<button class="chip ${chosen.has(e.id) ? 'on' : ''}" data-e="${e.id}" aria-pressed="${chosen.has(e.id)}"><span class="dot" style="background:${e.color}"></span>${e.title}</button>`).join('')}</div><div class="row" style="margin-top:8px"><button class="btn sm ghost" id="qzAll">Select all</button><button class="btn sm ghost" id="qzNone">Clear</button></div></div>
    <div class="grid g3 quiz-setup" style="margin-bottom:20px">
      <div class="field"><label>Number of questions</label><div class="seg" id="qzCount">${[5, 10, 15, 20].map(n => `<button data-n="${n}" class="${n === count ? 'on' : ''}">${n}</button>`).join('')}</div></div>
      <div class="field"><label>Feedback</label><div class="seg" id="qzMode"><button data-m="instant" class="on">Instant</button><button data-m="exam">Exam mode</button></div></div>
      <div class="field"><label>Timer</label><div class="seg" id="qzTimed"><button data-t="0" class="on">Off</button><button data-t="1">45 s / question</button></div></div>
    </div>
    <div class="row"><button class="btn primary" id="qzStart">${icon('play')} Start quiz</button><span class="dim" id="qzPoolInfo" style="font-size:13px"></span></div>
  </div>
  ${hist.length ? `<div class="card" style="margin-top:18px"><h3>${icon('history')} Recent attempts</h3>${hist.map(h => `<div class="row" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px"><span>${new Date(h.date).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><span class="dim">${h.exps.length === EXPS.length ? 'All experiments' : h.exps.map(id => expById(id) ? expById(id).title : id).join(', ')}</span><b class="mono">${h.score}/${h.total} (${Math.round(h.score / h.total * 100)}%)</b></div>`).join('')}</div>` : ''}`;
  refreshIcons();
  const info = () => { const n = quizPool([...chosen]).length; $('#qzPoolInfo').textContent = chosen.size ? `${n} questions in pool` : 'Select at least one experiment'; $('#qzStart').disabled = !chosen.size; };
  const syncChips = () => $$('#qzExps .chip').forEach(c => { c.classList.toggle('on', chosen.has(c.dataset.e)); c.setAttribute('aria-pressed', chosen.has(c.dataset.e)); });
  $('#qzExps').onclick = e => { const c = e.target.closest('.chip'); if (!c) return; chosen.has(c.dataset.e) ? chosen.delete(c.dataset.e) : chosen.add(c.dataset.e); syncChips(); info(); };
  $('#qzAll').onclick = () => { chosen = new Set(EXPS.map(e => e.id)); syncChips(); info(); };
  $('#qzNone').onclick = () => { chosen.clear(); syncChips(); info(); };
  const seg = (id, attr, set) => $(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; $$(id + ' button').forEach(x => x.classList.toggle('on', x === b)); set(b.dataset[attr]); };
  seg('#qzCount', 'n', v => count = +v); seg('#qzMode', 'm', v => mode = v); seg('#qzTimed', 't', v => timed = v === '1');
  $('#qzStart').onclick = () => {
    const qs = shuffle(quizPool([...chosen])).slice(0, count).map(q => { const order = shuffle(q.o.map((_, i) => i)); return { ...q, opts: order.map(i => q.o[i]), correct: order.indexOf(q.a), pick: null }; });
    QZ = { qs, i: 0, mode, timed, exps: [...chosen], start: Date.now(), tLeft: 45 };
    quizQuestion();
  };
  info();
}
let quizTimer = null;
function quizQuestion() {
  clearInterval(quizTimer);
  const host = $('#quizHost'); if (!host || !QZ) return;
  const q = QZ.qs[QZ.i], e = expById(q.exp), answered = q.pick != null;
  host.innerHTML = `<div class="card pad-lg">
    <div class="row" style="justify-content:space-between;margin-bottom:10px"><span class="tag" style="border-color:${hexA(e.color, .4)};color:${e.color}">${e.num}. ${e.title}</span><span class="mono dim">Question ${QZ.i + 1} / ${QZ.qs.length}</span>${QZ.timed ? `<span class="tag amber mono" id="qzClock">${icon('timer')} ${QZ.tLeft}s</span>` : ''}</div>
    <div class="progress" style="margin-bottom:22px"><i style="width:${(QZ.i) / QZ.qs.length * 100}%"></i></div>
    <h2 style="font-size:19px;font-family:var(--font);font-weight:600;line-height:1.5;margin-bottom:20px">${q.q}</h2>
    <div role="radiogroup" aria-label="Options">${q.opts.map((o, i) => { let cls = ''; if (answered && QZ.mode === 'instant') { if (i === q.correct) cls = 'correct'; else if (i === q.pick) cls = 'wrong'; } else if (answered && i === q.pick) cls = 'on'; return `<button class="option ${cls}" data-o="${i}" ${answered && QZ.mode === 'instant' ? 'disabled' : ''} role="radio" aria-checked="${q.pick === i}"><span class="key">${i + 1}</span><span>${o}</span></button>`; }).join('')}</div>
    ${answered && QZ.mode === 'instant' ? `<div class="callout ${q.pick === q.correct ? 'cyan' : 'amber'}"><b>${q.pick === q.correct ? '✓ Correct!' : q.pick === -1 ? '⏱ Time up.' : '✗ Not quite.'}</b> ${q.e}</div>` : ''}
    <div class="row" style="justify-content:space-between;margin-top:18px"><button class="btn ghost sm" id="qzQuit">${icon('x')} Quit</button><button class="btn primary" id="qzNext" ${answered ? '' : 'disabled'}>${QZ.i === QZ.qs.length - 1 ? 'Finish' : 'Next'} ${icon('arrow-right')}</button></div>
    <p class="dim" style="font-size:12px;margin:10px 0 0">Keyboard: 1–4 to answer, Enter for next.</p></div>`;
  refreshIcons();
  host.querySelectorAll('.option').forEach(b => b.onclick = () => quizPick(+b.dataset.o));
  $('#qzNext').onclick = quizNext;
  $('#qzQuit').onclick = async () => { if (await confirmModal('Quit quiz?', 'Your progress in this attempt will be lost.', 'Quit')) { clearInterval(quizTimer); QZ = null; quizSetup(EXPS.map(e => e.id)); } };
  if (QZ.timed && !answered) {
    QZ.tLeft = 45;
    quizTimer = setInterval(() => { if (!$('#qzClock')) return clearInterval(quizTimer); QZ.tLeft--; $('#qzClock').innerHTML = `${icon('timer')} ${QZ.tLeft}s`; refreshIcons(); if (QZ.tLeft <= 0) { clearInterval(quizTimer); quizPick(-1); if (QZ.mode === 'exam') quizNext(); } }, 1000);
  }
}
function quizPick(i) {
  if (!QZ) return; const q = QZ.qs[QZ.i];
  if (q.pick != null && QZ.mode === 'instant') return;
  q.pick = i; quizQuestion(); const n = $('#qzNext'); n && n.focus();
}
function quizNext() {
  if (!QZ || QZ.qs[QZ.i].pick == null) return;
  if (QZ.i < QZ.qs.length - 1) { QZ.i++; quizQuestion(); } else quizResult();
}
function quizResult() {
  clearInterval(quizTimer);
  const qs = QZ.qs, score = qs.filter(q => q.pick === q.correct).length, pct = Math.round(score / qs.length * 100), dur = Math.round((Date.now() - QZ.start) / 1000);
  const byExp = {}; qs.forEach(q => { byExp[q.exp] = byExp[q.exp] || [0, 0]; byExp[q.exp][1]++; if (q.pick === q.correct) byExp[q.exp][0]++; });
  Store.s.quizHistory.push({ date: Date.now(), score, total: qs.length, exps: QZ.exps, dur, byExp }); Store.save();
  const c = 2 * Math.PI * 64, col = pct >= 80 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171';
  $('#quizHost').innerHTML = `<div class="card pad-lg" style="text-align:center">
    <svg class="score-ring" viewBox="0 0 150 150"><circle cx="75" cy="75" r="64" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="10"/><circle cx="75" cy="75" r="64" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c * pct / 100} ${c}" transform="rotate(-90 75 75)"/><text x="75" y="82" text-anchor="middle" fill="currentColor" font-size="30" font-family="Space Grotesk" font-weight="600">${pct}%</text></svg>
    <h2 style="margin:10px 0 4px">${pct >= 80 ? 'Excellent work!' : pct >= 50 ? 'Good effort — keep revising' : 'Needs more practice'}</h2>
    <p class="muted">${score} of ${qs.length} correct · ${fmtDuration(dur) === '0m' ? dur + 's' : fmtDuration(dur)}</p>
    <div class="row" style="justify-content:center;margin:14px 0">${Object.entries(byExp).map(([id, v]) => `<span class="tag">${expById(id).title}: ${v[0]}/${v[1]}</span>`).join('')}</div>
    <div class="row" style="justify-content:center"><button class="btn primary" id="qzRetry">${icon('rotate-ccw')} New attempt (same settings)</button><button class="btn" id="qzNew">${icon('settings-2')} Change settings</button></div></div>
    <h3 style="font-size:17px;margin:24px 0 12px">Review answers</h3>
    ${qs.map((q, i) => `<div class="card" style="margin-bottom:10px;padding:16px;border-left:3px solid ${q.pick === q.correct ? 'var(--green)' : 'var(--red)'}"><div style="font-weight:600;margin-bottom:6px">${i + 1}. ${q.q}</div><div style="font-size:13.5px">Your answer: <span style="color:${q.pick === q.correct ? 'var(--green)' : 'var(--red)'}">${q.pick >= 0 ? q.opts[q.pick] : 'No answer (time up)'}</span>${q.pick !== q.correct ? ` · Correct: <span style="color:var(--green)">${q.opts[q.correct]}</span>` : ''}</div><div class="muted" style="font-size:13px;margin-top:4px">${q.e}</div></div>`).join('')}`;
  refreshIcons();
  const settings = { mode: QZ.mode, timed: QZ.timed, exps: QZ.exps, n: qs.length };
  $('#qzRetry').onclick = () => { const pool = shuffle(quizPool(settings.exps)).slice(0, settings.n).map(q => { const order = shuffle(q.o.map((_, i) => i)); return { ...q, opts: order.map(i => q.o[i]), correct: order.indexOf(q.a), pick: null }; }); QZ = { qs: pool, i: 0, mode: settings.mode, timed: settings.timed, exps: settings.exps, start: Date.now(), tLeft: 45 }; quizQuestion(); };
  $('#qzNew').onclick = () => { QZ = null; quizSetup(settings.exps); };
}

/* ================= FLASHCARDS ================= */
let FC = null;
VIEWS.flashcards = () => `<div class="page-head"><div><span class="eyebrow">Practice</span><h1>Flashcards</h1><p>Active recall with a simple Leitner system: cards you know move up a box and appear less often; “Again” sends a card back to box 0.</p></div></div>
  <div class="toolbar"><div class="seg" id="fcType" style="min-width:260px"><button data-t="viva" class="on">Viva</button><button data-t="formula">Formulas</button><button data-t="mixed">Mixed</button></div>
  <select class="input" id="fcExp" style="width:auto" aria-label="Deck"><option value="">All experiments</option>${EXPS.map(e => `<option value="${e.id}">${e.num}. ${e.title}</option>`).join('')}</select>
  <button class="chip" id="fcDue">${icon('filter')} Not yet mastered</button><span class="spacer"></span><button class="btn sm" id="fcShuffle">${icon('shuffle')} Shuffle</button></div>
  <div id="fcHost"></div>`;
function mountFlash(params) {
  FC = { type: 'viva', exp: params.get('exp') || '', due: false, i: 0, cards: [] };
  $('#fcExp').value = FC.exp;
  const build = (doShuffle = true) => {
    let cards = [];
    const exps = EXPS.filter(e => !FC.exp || e.id === FC.exp);
    if (FC.type !== 'formula') exps.forEach(e => e.viva.forEach((v, i) => cards.push({ id: `${e.id}-${i}`, exp: e, front: v[0], back: v[1], kind: 'Viva' })));
    if (FC.type !== 'viva') exps.forEach(e => e.formulas.forEach((f, i) => cards.push({ id: `${e.id}-f${i}`, exp: e, front: f.name, back: tex(f.tex, true) + `<p class="muted" style="font-size:14px">${f.desc}</p>`, kind: 'Formula' })));
    if (FC.due) cards = cards.filter(c => (Store.s.flash[c.id] || 0) < 3);
    // lower boxes first, randomised within box
    FC.cards = doShuffle ? shuffle(cards).sort((a, b) => (Store.s.flash[a.id] || 0) - (Store.s.flash[b.id] || 0)) : cards;
    FC.i = 0; drawCard();
  };
  $('#fcType').onclick = e => { const b = e.target.closest('button'); if (!b) return; $$('#fcType button').forEach(x => x.classList.toggle('on', x === b)); FC.type = b.dataset.t; build(); };
  $('#fcExp').onchange = e => { FC.exp = e.target.value; build(); };
  $('#fcDue').onclick = e => { FC.due = !FC.due; e.currentTarget.classList.toggle('on', FC.due); build(); };
  $('#fcShuffle').onclick = () => { FC.cards = shuffle(FC.cards); FC.i = 0; drawCard(); toast('Deck shuffled', 'shuffle'); };
  build();
}
function drawCard() {
  const host = $('#fcHost'); if (!host || !FC) return;
  const n = FC.cards.length, mastered = FC.cards.filter(c => (Store.s.flash[c.id] || 0) >= 3).length;
  if (!n) { host.innerHTML = `<div class="empty">${icon('party-popper')}<div>No cards here — ${FC.due ? 'everything in this deck is mastered!' : 'try another deck.'}</div></div>`; refreshIcons(); return; }
  const c = FC.cards[FC.i], box = Store.s.flash[c.id] || 0;
  host.innerHTML = `<div class="row" style="justify-content:space-between;max-width:680px;margin:0 auto 12px"><span class="mono dim">Card ${FC.i + 1} / ${n}</span><span class="tag green">${mastered} mastered</span><span class="tag">Box ${box} / 5</span></div>
    <div class="flash-stage"><div class="flash" id="fcCard" tabindex="0" role="button" aria-label="Flashcard. Press space to flip."><div class="flash-face flash-front"><span class="lab">${c.kind} · ${c.exp.title}</span><div class="txt">${c.front}</div><div class="dim" style="position:absolute;bottom:16px;font-size:12px">Click or press Space to reveal</div></div><div class="flash-face flash-back"><span class="lab">Answer</span><div class="txt">${c.back}</div></div></div></div>
    <div class="row" style="justify-content:center;margin-top:18px"><button class="btn" id="fcPrev" aria-label="Previous card">${icon('chevron-left')}</button><button class="btn danger" data-g="0">${icon('rotate-ccw')} Again <kbd>1</kbd></button><button class="btn" data-g="1">${icon('minus')} Hard <kbd>2</kbd></button><button class="btn primary" data-g="2">${icon('check')} Good <kbd>3</kbd></button><button class="btn" id="fcNext" aria-label="Next card">${icon('chevron-right')}</button></div>
    <div class="progress" style="max-width:680px;margin:18px auto 0"><i style="width:${mastered / n * 100}%;background:var(--green)"></i></div>`;
  refreshIcons();
  const card = $('#fcCard');
  card.onclick = () => card.classList.toggle('flipped');
  $('#fcPrev').onclick = () => { FC.i = (FC.i - 1 + n) % n; drawCard(); };
  $('#fcNext').onclick = () => { FC.i = (FC.i + 1) % n; drawCard(); };
  $$('[data-g]', host).forEach(b => b.onclick = () => fcGrade(+b.dataset.g));
}
function fcGrade(gr) {
  const c = FC.cards[FC.i]; if (!c) return;
  const box = Store.s.flash[c.id] || 0;
  Store.s.flash[c.id] = gr === 0 ? 0 : gr === 1 ? box : Math.min(5, box + 1);
  Store.save();
  if (FC.due && Store.s.flash[c.id] >= 3) { FC.cards.splice(FC.i, 1); if (FC.i >= FC.cards.length) FC.i = 0; }
  else FC.i = (FC.i + 1) % FC.cards.length;
  drawCard();
}

/* ================= NOTES ================= */
VIEWS.notes = () => `<div class="page-head"><div><span class="eyebrow">Personal</span><h1>Notes</h1><p>One notebook per experiment plus a general notebook. Everything autosaves to this browser.</p></div><div class="row"><button class="btn" id="nExport">${icon('download')} Export all (.txt)</button></div></div>
  <div class="notes"><div class="card notes-list" style="padding:10px" id="nList" role="tablist" aria-label="Notebooks"></div>
  <div class="card"><div class="row" style="justify-content:space-between;margin-bottom:12px"><h3 style="margin:0" id="nTitle"></h3><div class="row"><span class="dim" id="nCount" style="font-size:12.5px"></span><button class="btn sm danger" id="nClear">${icon('trash-2')} Clear</button></div></div>
  <textarea class="input note-ed" id="nEd" aria-label="Note editor"></textarea><div class="dim" style="font-size:12px;margin-top:6px" id="nSaved">Saved automatically</div></div></div>`;
function mountNotes(params) {
  let cur = params.get('n') || 'general';
  const books = [{ id: 'general', title: 'General notes', ic: 'notebook' }, ...EXPS.map(e => ({ id: e.id, title: `${e.num}. ${e.title}`, ic: e.icon }))];
  const list = () => { $('#nList').innerHTML = books.map(b => { const t = Store.s.notes[b.id] || '', w = t.trim() ? t.trim().split(/\s+/).length : 0; return `<button class="nav-item ${b.id === cur ? 'active' : ''}" data-n="${b.id}" role="tab" aria-selected="${b.id === cur}">${icon(b.ic)}<span>${b.title}</span><span class="badge">${w || ''}</span></button>`; }).join(''); refreshIcons(); };
  const open = () => { const b = books.find(x => x.id === cur); $('#nTitle').textContent = b.title; $('#nEd').value = Store.s.notes[cur] || ''; $('#nEd').placeholder = cur === 'general' ? 'Exam timetable, doubts to ask, general formulas…' : `Observations, doubts and viva points for ${b.title}…`; count(); list(); inkNotesOpen(cur); };
  const count = () => { const t = $('#nEd').value; $('#nCount').textContent = `${t.trim() ? t.trim().split(/\s+/).length : 0} words · ${t.length} chars`; };
  let tm;
  $('#nEd').oninput = () => { Store.s.notes[cur] = $('#nEd').value; count(); $('#nSaved').textContent = 'Saving…'; clearTimeout(tm); tm = setTimeout(() => { Store.save(); $('#nSaved').textContent = 'Saved ' + new Date().toLocaleTimeString(); list(); }, 400); };
  $('#nList').onclick = e => { const b = e.target.closest('[data-n]'); if (!b) return; Store.save(); cur = b.dataset.n; open(); $('#nEd').focus(); };
  $('#nClear').onclick = async () => { if (await confirmModal('Clear this notebook?', 'The text in this notebook will be deleted permanently.', 'Clear')) { delete Store.s.notes[cur]; Store.save(); open(); } };
  $('#nExport').onclick = () => { const txt = books.filter(b => (Store.s.notes[b.id] || '').trim()).map(b => `=== ${b.title} ===\n${Store.s.notes[b.id]}\n`).join('\n'); if (!txt) return toast('No notes to export yet', 'alert-circle'); download('physlab-notes.txt', `PhysLab notes — exported ${new Date().toLocaleString()}\n\n` + txt); toast('Notes exported', 'download'); };
  open();
}

/* ================= FOCUS TIMER (Pomodoro) ================= */
const POMO = { mode: 'work', running: false, endAt: 0, remaining: 25 * 60, total: 25 * 60, count: 0, tick: null };
function pomoDur(m) { const p = Store.s.pomo; return (m === 'work' ? p.work : m === 'short' ? p.short : p.long) * 60; }
function pomoSet(mode) { POMO.mode = mode; POMO.running = false; POMO.total = POMO.remaining = pomoDur(mode); pomoUI(); }
function pomoStart() { if (POMO.running) return; POMO.running = true; POMO.endAt = Date.now() + POMO.remaining * 1000; clearInterval(POMO.tick); POMO.tick = setInterval(pomoTick, 250); pomoUI(); }
function pomoPause() { if (!POMO.running) return; POMO.running = false; POMO.remaining = Math.max(0, Math.round((POMO.endAt - Date.now()) / 1000)); clearInterval(POMO.tick); pomoUI(); }
let pomoLastSec = null;
function pomoTick() {
  const rem = Math.max(0, Math.ceil((POMO.endAt - Date.now()) / 1000));
  if (rem !== pomoLastSec) {
    if (POMO.mode === 'work' && pomoLastSec != null && rem < pomoLastSec) { const k = todayKey(); Store.s.focus[k] = (Store.s.focus[k] || 0) + (pomoLastSec - rem); saveSoon(); }
    pomoLastSec = rem; POMO.remaining = rem; pomoUI();
  }
  if (rem <= 0) pomoDone();
}
function pomoDone() {
  clearInterval(POMO.tick); POMO.running = false; pomoLastSec = null;
  beep();
  if (POMO.mode === 'work') {
    Store.s.pomo.sessions++; const k = todayKey(); Store.s.pomo.days = Store.s.pomo.days || {}; Store.s.pomo.days[k] = (Store.s.pomo.days[k] || 0) + 1; Store.save();
    POMO.count++; toast('Focus session complete — take a break!', 'coffee');
    pomoSet(POMO.count % 4 === 0 ? 'long' : 'short');
  } else { toast('Break over — back to focus!', 'brain'); pomoSet('work'); }
  if (Store.s.pomo.autoNext) pomoStart();
  try { if ('Notification' in window && Notification.permission === 'granted') new Notification('PhysLab', { body: POMO.mode === 'work' ? 'Break over — time to focus.' : 'Focus session complete. Take a break!' }); } catch (e) { }
}
function beep() {
  if (!Store.s.settings.sound) return;
  try { const A = new (window.AudioContext || window.webkitAudioContext)(); [0, .25, .5].forEach((t, i) => { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = [660, 880, 990][i]; o.connect(g); g.connect(A.destination); g.gain.setValueAtTime(.0001, A.currentTime + t); g.gain.exponentialRampToValueAtTime(.25, A.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, A.currentTime + t + .22); o.start(A.currentTime + t); o.stop(A.currentTime + t + .25); }); } catch (e) { }
}
const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
function pomoUI() {
  const chip = $('#pomoChip'), show = POMO.running || (POMO.remaining !== POMO.total);
  chip.hidden = !show || (location.hash === '#/timer'); $('#pomoChipTime').textContent = mmss(POMO.remaining); chip.classList.toggle('break', POMO.mode !== 'work');
  const t = $('#pTime'); if (!t) return;
  t.textContent = mmss(POMO.remaining);
  $('#pLabel').textContent = POMO.mode === 'work' ? 'Focus' : POMO.mode === 'short' ? 'Short break' : 'Long break';
  const c = 2 * Math.PI * 140; $('#pArc').setAttribute('stroke-dasharray', `${c * (1 - POMO.remaining / POMO.total)} ${c}`); $('#pArc').setAttribute('stroke', POMO.mode === 'work' ? 'url(#pg)' : '#34d399');
  $('#pStart').innerHTML = POMO.running ? `${icon('pause')} Pause` : `${icon('play')} ${POMO.remaining === POMO.total ? 'Start' : 'Resume'}`;
  $$('#pModes button').forEach(b => b.classList.toggle('on', b.dataset.m === POMO.mode));
  const today = (Store.s.pomo.days || {})[todayKey()] || 0;
  $('#pStats').innerHTML = `<div class="readout"><span>Sessions today</span><b>${today}</b></div><div class="readout"><span>Focus today</span><b>${fmtDuration(Store.s.focus[todayKey()] || 0)}</b></div><div class="readout"><span>All-time sessions</span><b>${Store.s.pomo.sessions}</b></div><div class="readout"><span>Cycle</span><b>${POMO.count % 4} / 4 → long break</b></div>`;
  document.title = POMO.running ? `${mmss(POMO.remaining)} · PhysLab` : APP_TITLE;
  refreshIcons();
}
VIEWS.timer = () => `<div class="page-head"><div><span class="eyebrow">Focus</span><h1>Pomodoro Focus Timer</h1><p>Study in focused blocks with short breaks. Focus minutes are logged to your analytics. The timer keeps running while you browse other pages.</p></div></div>
  <div class="pomo"><div class="card pad-lg" style="text-align:center">
    <div class="seg" id="pModes" style="max-width:420px;margin:0 auto"><button data-m="work">Focus</button><button data-m="short">Short break</button><button data-m="long">Long break</button></div>
    <div class="pomo-ring"><svg viewBox="0 0 300 300"><defs><linearGradient id="pg" x1="0" x2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="10"/><circle id="pArc" cx="150" cy="150" r="140" fill="none" stroke="url(#pg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 900"/></svg><div class="time"><b id="pTime">25:00</b><span id="pLabel">Focus</span></div></div>
    <div class="row" style="justify-content:center"><button class="btn primary" id="pStart" style="min-width:130px"></button><button class="btn" id="pReset">${icon('rotate-ccw')} Reset</button><button class="btn" id="pSkip">${icon('skip-forward')} Skip</button></div>
    <p class="dim" style="font-size:12px;margin-top:12px">Shortcut: press <kbd>P</kbd> anywhere to start / pause.</p>
  </div>
  <div style="display:flex;flex-direction:column;gap:18px">
    <div class="card"><h3>${icon('activity')} Today</h3><div class="readouts" id="pStats"></div></div>
    <div class="card"><h3>${icon('sliders-horizontal')} Durations (minutes)</h3><div class="grid g3">
      <div class="field"><label for="pw">Focus</label><input class="input mono" id="pw" type="number" min="1" max="120" value="${Store.s.pomo.work}"></div>
      <div class="field"><label for="ps">Short</label><input class="input mono" id="ps" type="number" min="1" max="60" value="${Store.s.pomo.short}"></div>
      <div class="field"><label for="pl">Long</label><input class="input mono" id="pl" type="number" min="1" max="90" value="${Store.s.pomo.long}"></div></div>
      <label class="row" style="margin-top:14px;font-size:14px;cursor:pointer"><input type="checkbox" id="pAuto" ${Store.s.pomo.autoNext ? 'checked' : ''}> Auto-start the next session</label>
      <label class="row" style="margin-top:8px;font-size:14px;cursor:pointer"><input type="checkbox" id="pSound" ${Store.s.settings.sound ? 'checked' : ''}> Play a chime when a session ends</label></div>
    <div class="card"><h3>${icon('lightbulb')} Suggested focus plan</h3><ol class="muted" style="font-size:13.5px;margin:0;padding-left:20px"><li>Focus 1: theory &amp; derivation of one experiment</li><li>Focus 2: run the simulation, then solve the sample calculation</li><li>Focus 3: 20 viva flashcards + a 10-question quiz</li><li>Long break, then repeat for the next experiment</li></ol></div>
  </div></div>`;
function mountTimer() {
  $('#pModes').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (POMO.running) pomoPause(); pomoSet(b.dataset.m); };
  $('#pStart').onclick = () => POMO.running ? pomoPause() : pomoStart();
  $('#pReset').onclick = () => { pomoPause(); pomoSet(POMO.mode); };
  $('#pSkip').onclick = () => { pomoPause(); POMO.endAt = Date.now(); POMO.remaining = 0; pomoLastSec = null; const auto = Store.s.pomo.autoNext; Store.s.pomo.autoNext = false; if (POMO.mode === 'work') { pomoSet(POMO.count % 4 === 3 ? 'long' : 'short'); POMO.count++; } else pomoSet('work'); Store.s.pomo.autoNext = auto; };
  const dur = (id, k) => $(id).onchange = e => { const v = clamp(parseInt(e.target.value) || 1, 1, 120); e.target.value = v; Store.s.pomo[k] = v; Store.save(); if (!POMO.running && POMO.remaining === POMO.total) pomoSet(POMO.mode); toast('Duration updated'); };
  dur('#pw', 'work'); dur('#ps', 'short'); dur('#pl', 'long');
  $('#pAuto').onchange = e => { Store.s.pomo.autoNext = e.target.checked; Store.save(); };
  $('#pSound').onchange = e => { Store.s.settings.sound = e.target.checked; Store.save(); if (e.target.checked) beep(); };
  pomoUI();
}

/* ================= ANALYTICS ================= */
VIEWS.analytics = () => {
  const st = Store.s, days = new Set([...Object.keys(st.study), ...Object.keys(st.focus)]);
  const totStudy = Object.values(st.study).reduce((a, b) => a + b, 0), totFocus = Object.values(st.focus).reduce((a, b) => a + b, 0);
  let streak = 0; const d = new Date(); if (!((st.study[todayKey(d)] || 0) + (st.focus[todayKey(d)] || 0))) d.setDate(d.getDate() - 1);
  while ((st.study[todayKey(d)] || 0) + (st.focus[todayKey(d)] || 0) >= 60) { streak++; d.setDate(d.getDate() - 1); }
  const qh = st.quizHistory, avg = qh.length ? Math.round(mean(qh.map(q => q.score / q.total * 100))) : null, best = qh.length ? Math.max(...qh.map(q => Math.round(q.score / q.total * 100))) : null;
  const known = Object.values(st.viva).filter(v => v === 'known').length, fm = Object.values(st.flash).filter(b => b >= 3).length;
  const done = EXPS.filter(e => expProgress(e.id).pct === 100).length;
  const accBy = {}; qh.forEach(q => Object.entries(q.byExp || {}).forEach(([id, v]) => { accBy[id] = accBy[id] || [0, 0]; accBy[id][0] += v[0]; accBy[id][1] += v[1]; }));
  return `<div class="page-head"><div><span class="eyebrow">Insights</span><h1>Study Analytics</h1><p>Your learning activity, quiz performance and mastery across all experiments. Study time counts active minutes on learning pages; focus time comes from the Pomodoro timer.</p></div></div>
  <div class="grid g4">
    ${[['clock', 'Total study time', fmtDuration(totStudy), `${days.size} active day${days.size === 1 ? '' : 's'}`], ['timer', 'Focus time', fmtDuration(totFocus), `${st.pomo.sessions} pomodoro sessions`], ['flame', 'Current streak', `${streak} day${streak === 1 ? '' : 's'}`, '≥ 1 min of study per day'], ['award', 'Quiz average', avg == null ? '—' : avg + '%', best == null ? 'No quizzes yet' : `Best ${best}% · ${qh.length} taken`],
    ['brain', 'Viva mastered', `${known}/${ALL_VIVA().length}`, 'Marked “I know this”'], ['layers', 'Flashcards mastered', `${fm}`, 'Box 3 or higher'], ['check-circle-2', 'Modules completed', `${done}/8`, `Overall ${overallProgress()}%`], ['atom', 'Simulations explored', `${st.simUse || 0}`, 'Interactive sessions']].map(s => `<div class="card"><div class="stat"><span class="k">${icon(s[0])} ${s[1]}</span><span class="v">${s[2]}</span><span class="s">${s[3]}</span></div></div>`).join('')}
  </div>
  <div class="grid g2" style="margin-top:18px">
    <div class="card"><h3>${icon('bar-chart-3')} Last 14 days (minutes)</h3><div class="chart-box sm"><canvas id="anDays"></canvas></div></div>
    <div class="card"><h3>${icon('trending-up')} Quiz scores</h3>${qh.length ? `<div class="chart-box sm"><canvas id="anQuiz"></canvas></div>` : `<div class="empty">${icon('list-checks')}<div>Take a quiz to see your trend.</div><a class="btn sm" style="margin-top:10px" href="#/quiz">Start a quiz</a></div>`}</div>
  </div>
  <div class="card" style="margin-top:18px"><h3>${icon('table-2')} Per-experiment breakdown</h3><div class="table-wrap"><table class="data"><thead><tr><th>Experiment</th><th>Sections</th><th>Progress</th><th>Time spent</th><th>Viva known</th><th>Quiz accuracy</th></tr></thead><tbody>
    ${EXPS.map(e => { const p = expProgress(e.id), vk = e.viva.filter((_, i) => st.viva[`${e.id}-${i}`] === 'known').length, a = accBy[e.id]; return `<tr><td style="font-family:var(--font)"><a href="#/exp/${e.id}/overview" style="color:${e.color}">${e.num}. ${e.title}</a></td><td>${p.done}/${p.total}</td><td style="min-width:140px"><div class="progress"><i style="width:${p.pct}%;background:${e.color}"></i></div></td><td>${fmtDuration(st.timeByExp[e.id] || 0)}</td><td>${vk}/${e.viva.length}</td><td>${a ? Math.round(a[0] / a[1] * 100) + '% (' + a[0] + '/' + a[1] + ')' : '—'}</td></tr>`; }).join('')}
  </tbody></table></div></div>`;
};
function mountAnalytics() {
  const labels = [], study = [], focus = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = todayKey(d); labels.push(d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })); study.push(+((Store.s.study[k] || 0) / 60).toFixed(1)); focus.push(+((Store.s.focus[k] || 0) / 60).toFixed(1)); }
  const TH = chartTheme(); const base = { responsive: true, maintainAspectRatio: false, animation: Store.s.settings.reduceMotion ? false : { duration: 700 }, plugins: { legend: { labels: { color: TH.legend, boxWidth: 10, font: { family: 'Inter' } } } }, scales: { x: { ticks: { color: TH.tick, font: { size: 10 } }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: TH.tick }, grid: { color: TH.grid } } } };
  if (window.Chart) {
    CHARTS.add(new Chart($('#anDays'), { type: 'bar', data: { labels, datasets: [{ label: 'Study', data: study, backgroundColor: '#8b5cf6', borderRadius: 5 }, { label: 'Focus', data: focus, backgroundColor: '#22d3ee', borderRadius: 5 }] }, options: base }));
    const qc = $('#anQuiz');
    if (qc) CHARTS.add(new Chart(qc, { type: 'line', data: { labels: Store.s.quizHistory.map((q, i) => '#' + (i + 1)), datasets: [{ label: 'Score %', data: Store.s.quizHistory.map(q => Math.round(q.score / q.total * 100)), borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,.15)', fill: true, tension: .3, pointRadius: 4 }] }, options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, max: 100 } } } }));
  } else {
    plot($('#anDays'), { datasets: [{ label: 'Study', data: study.map((y, x) => ({ x, y })), color: PAL.violet }, { label: 'Focus', data: focus.map((y, x) => ({ x, y })), color: PAL.cyan }], x: { title: 'Day (last 14)' }, y: { title: 'min' } });
  }
}

/* ================= SETTINGS ================= */
VIEWS.settings = () => `<div class="page-head"><div><span class="eyebrow">Personal</span><h1>Settings & Data</h1><p>Everything is stored locally in this browser (localStorage). Export a backup before clearing browser data.</p></div></div>
  <div class="grid g2">
    <div class="card"><h3>${icon('calendar-clock')} Examination countdown</h3>
      <div class="field" style="margin-bottom:12px"><label for="sxL">Exam name</label><input class="input" id="sxL" value="${esc(Store.s.exam.label)}"></div>
      <div class="field" style="margin-bottom:14px"><label for="sxD">Date and time</label><input class="input" type="datetime-local" id="sxD" value="${esc(Store.s.exam.date)}"></div>
      <div class="row"><button class="btn primary" id="sxSave">${icon('check')} Save</button><button class="btn ghost" id="sxClr">Remove date</button></div></div>
    <div class="card"><h3>${icon('sparkles')} Preferences</h3>
      <div class="field" style="margin-bottom:12px"><label>Theme</label><div class="seg" id="sTheme"><button data-t="dark" class="${(Store.s.settings.theme || 'dark') === 'dark' ? 'on' : ''}">Dark</button><button data-t="light" class="${Store.s.settings.theme === 'light' ? 'on' : ''}">Light</button><button data-t="system" class="${Store.s.settings.theme === 'system' ? 'on' : ''}">System</button></div></div>
      <label class="row" style="font-size:14px;cursor:pointer;margin-bottom:10px"><input type="checkbox" id="sRM" ${Store.s.settings.reduceMotion ? 'checked' : ''}> Reduce motion (disable animations)</label>
      <label class="row" style="font-size:14px;cursor:pointer;margin-bottom:10px"><input type="checkbox" id="sSnd" ${Store.s.settings.sound ? 'checked' : ''}> Timer chime</label>
      <button class="btn sm" id="sNotif">${icon('bell')} Allow desktop notifications for timer</button>
      <div class="divider"></div><h3 style="font-size:15px">${icon('keyboard')} Keyboard shortcuts</h3>
      <dl class="kv"><dt><kbd>Ctrl</kbd> + <kbd>K</kbd> or <kbd>/</kbd></dt><dd>Search everything</dd><dt><kbd>P</kbd></dt><dd>Start / pause focus timer</dd><dt><kbd>G</kbd> then <kbd>D</kbd></dt><dd>Go to dashboard</dd><dt><kbd>Space</kbd></dt><dd>Flip flashcard / play-pause simulation</dd><dt><kbd>1</kbd>–<kbd>4</kbd>, <kbd>Enter</kbd></dt><dd>Answer quiz / next</dd></dl></div>
    <div class="card"><h3>${icon('user-round')} Student profile (for lab records)</h3><div class="grid g2">${[['name', 'Name'], ['roll', 'Roll number'], ['branch', 'Branch / section'], ['college', 'Institution']].map(f => `<div class="field"><label for="sp-${f[0]}">${f[1]}</label><input class="input" id="sp-${f[0]}" data-sp="${f[0]}" value="${esc(Store.s.profile[f[0]] || '')}"></div>`).join('')}</div></div>
    <div class="card"><h3>${icon('hard-drive-download')} Backup</h3><p class="muted" style="font-size:14px;margin-top:0">Download all progress, notes, bookmarks and history as JSON, or restore a previous backup.</p>
      <div class="row"><button class="btn" id="sExp">${icon('download')} Export backup</button><label class="btn" for="sImp" style="cursor:pointer">${icon('upload')} Import backup</label><input type="file" id="sImp" accept="application/json,.json" hidden></div></div>
    <div class="card" style="border-color:rgba(248,113,113,.25)"><h3>${icon('rotate-ccw')} Reset</h3><p class="muted" style="font-size:14px;margin-top:0">Each reset asks for confirmation and cannot be undone.</p>
      <div class="row">${[['progress', 'Progress & mastery'], ['quizHistory', 'Quiz history'], ['mockHistory', 'Mock viva history'], ['plan', 'Study plan'], ['checklist', 'Checklist'], ['notes', 'Notes'], ['bookmarks', 'Bookmarks'], ['study', 'Study statistics']].map(r => `<button class="btn sm danger" data-reset="${r[0]}">${r[1]}</button>`).join('')}</div>
      <div class="divider"></div><button class="btn danger" data-reset="all">${icon('trash-2')} Reset everything</button></div>
  </div>
  <div class="card" style="margin-top:18px"><h3>${icon('info')} About the data & references</h3><p class="muted" style="font-size:13.5px;margin:0 0 10px"><span class="tag green">${icon('wifi-off')} Works offline</span> Everything — libraries, fonts, icons and maths rendering — is built into this single file, so PhysLab needs no internet connection. Bundled: KaTeX 0.16.9, Chart.js 4.4.1, Three.js r128 (MIT); Lucide icons (ISC); Inter, JetBrains Mono and Space Grotesk fonts (SIL OFL).</p><p class="muted" style="font-size:13.5px;margin:0">Sample observation tables are <b>illustrative</b> values generated from the governing equations with small random scatter (seeded), clearly labelled in each module — they are not real measurements. Constants follow CODATA 2018 exact SI values (h = 6.62607015×10⁻³⁴ J s, e = 1.602176634×10⁻¹⁹ C, c = 299 792 458 m/s). Spectral lines: Na D (589.0/589.6 nm), He-Ne 632.8 nm, Hg 365.0/404.7/435.8/546.1/578.0 nm. Work functions are typical textbook values.</p></div>`;
function mountSettings() {
  $('#sxSave').onclick = () => { Store.s.exam.label = $('#sxL').value.trim() || 'Physics Practical Exam'; Store.s.exam.date = $('#sxD').value; Store.save(); updateSideCount(); toast('Exam details saved'); };
  $('#sxClr').onclick = () => { Store.s.exam.date = ''; $('#sxD').value = ''; Store.save(); updateSideCount(); toast('Exam date removed'); };
  $('#sTheme').onclick = e => { const b = e.target.closest('button'); if (!b) return; Store.s.settings.theme = b.dataset.t; Store.save(); applyTheme(); route(); };
  $$('[data-sp]').forEach(i => i.oninput = () => { Store.s.profile[i.dataset.sp] = i.value; saveSoon(); });
  $('#sRM').onchange = e => { Store.s.settings.reduceMotion = e.target.checked; document.body.classList.toggle('reduce-motion', e.target.checked); Store.save(); };
  $('#sSnd').onchange = e => { Store.s.settings.sound = e.target.checked; Store.save(); };
  $('#sNotif').onclick = () => { if (!('Notification' in window)) return toast('Notifications not supported', 'alert-circle'); Notification.requestPermission().then(p => toast(p === 'granted' ? 'Notifications enabled' : 'Notifications not allowed', p === 'granted' ? 'bell' : 'bell-off')); };
  $('#sExp').onclick = () => { Store.s.lastBackup = Date.now(); download(`physlab-backup-${todayKey()}.json`, JSON.stringify(Store.s, null, 2), 'application/json'); toast('Backup downloaded', 'download'); };
  $('#sImp').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = async () => { try { const d = JSON.parse(rd.result); if (typeof d !== 'object' || !d.progress) throw 0; if (await confirmModal('Restore backup?', 'This replaces all current data with the backup file.', 'Restore')) { Store.s = deepMerge(DEFAULT_STATE(), d); Store.save(); toast('Backup restored'); buildSidebar(); route(); } } catch (err) { toast('Invalid backup file', 'alert-circle'); } e.target.value = ''; };
    rd.readAsText(f);
  };
  $$('[data-reset]').forEach(b => b.onclick = async () => {
    const k = b.dataset.reset, label = b.textContent.trim();
    if (!await confirmModal(`Reset ${k === 'all' ? 'everything' : label.toLowerCase()}?`, k === 'all' ? 'All progress, notes, bookmarks, quiz history, statistics and settings will be permanently deleted.' : 'This data will be permanently deleted.', 'Reset')) return;
    if (k === 'all') Store.reset(); else if (k === 'plan') { Store.s.plan = null; Store.s.planDone = {}; Store.save(); } else if (k === 'study') { Store.s.study = {}; Store.s.focus = {}; Store.s.timeByExp = {}; Store.s.simUse = 0; Store.s.pomo.sessions = 0; Store.s.pomo.days = {}; Store.save(); } else Store.reset(k);
    toast('Reset complete', 'rotate-ccw'); buildSidebar(); route();
  });
}

/* ================= SEARCH PALETTE ================= */
let palItems = [], palSel = 0, pendingFocus = null;
function palIndex() {
  const pages = [['Dashboard', '#/', 'layout-dashboard'], ['Quick Revision', '#/revision', 'zap'], ['Formula Library', '#/formulas', 'sigma'], ['Viva Bank', '#/viva', 'messages-square'], ['Quiz', '#/quiz', 'list-checks'], ['Flashcards', '#/flashcards', 'layers'], ['Bookmarks', '#/bookmarks', 'bookmark'], ['Notes', '#/notes', 'notebook-pen'], ['Focus Timer', '#/timer', 'timer'], ['Analytics', '#/analytics', 'bar-chart-3'], ['Settings', '#/settings', 'settings'], ['Lab Record', '#/record', 'file-text'], ['Mock Viva Interview', '#/mock', 'mic'], ['Study Planner', '#/planner', 'calendar-check'], ['Exam-Day Checklist', '#/checklist', 'clipboard-check'], ['Lab Toolkit — units, constants, calculator', '#/toolkit', 'wrench'], ['Instrument Reading Trainer — vernier, screw gauge, microscope, stopwatch', '#/trainer', 'ruler'], ['Graph Plotting Practice', '#/graphlab', 'line-chart'], ['Derivation Puzzles', '#/puzzles', 'puzzle'], ['Exam Simulation', '#/exam', 'graduation-cap'], ['Achievements & Daily Challenge', '#/achievements', 'trophy'], ['Progress Report', '#/report', 'clipboard-list']];
  const out = pages.map(p => ({ ty: 'Page', t: p[0], s: '', href: p[1], k: p[0] }));
  EXPS.forEach(e => { out.push({ ty: 'Experiment', t: `${e.num}. ${e.title}`, s: e.subtitle, href: `#/exp/${e.id}/overview`, k: e.title + ' ' + e.subtitle + ' ' + e.topic }); SECTIONS.forEach(s => out.push({ ty: 'Section', t: `${e.title} → ${s.t}`, s: '', href: `#/exp/${e.id}/${s.k}`, k: e.title + ' ' + s.t })); });
  ALL_FORMULAS().forEach(f => out.push({ ty: 'Formula', t: f.name, s: f.exp.title, href: `#/exp/${f.exp.id}/theory`, focus: `[data-fid="${f.id}"]`, k: f.name + ' ' + f.desc + ' ' + f.exp.title }));
  ALL_VIVA().forEach(v => out.push({ ty: 'Viva', t: v.q, s: v.exp.title, href: `#/exp/${v.exp.id}/viva`, focus: `[data-qid="${v.id}"]`, k: v.q + ' ' + v.a + ' ' + v.exp.title }));
  return out;
}
function openPalette() { const p = $('#palette'); p.hidden = false; const i = $('#paletteInput'); i.value = ''; palSearch(''); setTimeout(() => i.focus(), 20); }
function closePalette() { $('#palette').hidden = true; }
function palSearch(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean), idx = palIndex();
  palItems = (words.length ? idx.filter(it => words.every(w => it.k.toLowerCase().includes(w))) : idx.filter(i => i.ty === 'Page' || i.ty === 'Experiment')).slice(0, 40);
  palSel = 0; palDraw();
}
function palDraw() {
  $('#paletteResults').innerHTML = palItems.length ? palItems.map((it, i) => `<button class="pr-item ${i === palSel ? 'sel' : ''}" data-i="${i}" role="option" aria-selected="${i === palSel}"><span class="ty">${it.ty}</span><span class="tx">${esc(it.t)}${it.s ? `<small>${esc(it.s)}</small>` : ''}</span></button>`).join('') : `<div class="empty" style="border:0">No results</div>`;
  const s = $('.pr-item.sel'); s && s.scrollIntoView({ block: 'nearest' });
}
function palGo(i) { const it = palItems[i]; if (!it) return; closePalette(); pendingFocus = it.focus || null; if (location.hash === it.href) route(); else location.hash = it.href; }
