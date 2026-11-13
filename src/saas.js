/* ---------- SaaS layer: profiles, account menu, notifications, daily goal & streak, help centre, shortcuts, what's new, footer ---------- */
const APP_VERSION = '2.1';
const PROFILES_KEY = 'physlab.profiles';
const AV_COLORS = ['#8b5cf6', '#22d3ee', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#fb7185', '#a78bfa'];
function initials(n) { const p = String(n || '').trim().split(/\s+/).filter(Boolean); return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }
function greeting() { const h = new Date().getHours(); return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

/* ----- local student profiles (each has its own saved data) ----- */
function profilesList() {
  let L = []; try { L = JSON.parse(lsGet(PROFILES_KEY) || '[]'); } catch (e) { }
  if (!L.some(p => p.id === 'default')) L.unshift({ id: 'default', name: 'Student', color: AV_COLORS[0] });
  return L;
}
function profilesSave(L) { lsSet(PROFILES_KEY, JSON.stringify(L)); }
function profName(p) { if (p.id === activeProfile()) return Store.s.profile.name || p.name; try { const d = JSON.parse(lsGet(p.id === 'default' ? STORE_KEY : STORE_KEY + ':' + p.id) || '{}'); return (d.profile && d.profile.name) || p.name; } catch (e) { return p.name; } }
function syncProfileName() { const L = profilesList(), me = L.find(p => p.id === activeProfile()); if (me) { me.name = Store.s.profile.name || me.name || 'Student'; profilesSave(L); } Store.save(); updateSaas(); }
function switchProfile(id) { Store.save(); Store.locked = true; lsSet(ACTIVE_KEY, id); history.replaceState(null, '', location.pathname + '#/'); location.reload(); }
async function addProfile() {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-box" role="document"><h3>${icon('user-plus')} Add a student</h3><p>Each student gets separate progress, notes, readings and settings on this device — ideal for a shared computer.</p><div class="field"><label for="npName">Name</label><input class="input" id="npName" placeholder="e.g. Rahul Verma"></div><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn ghost" data-r="0">Cancel</button><button class="btn primary" data-r="1">${icon('check')} Create & switch</button></div></div>`;
  m.hidden = false; refreshIcons(); $('#npName').focus();
  const done = ok => { const name = $('#npName').value.trim(); m.hidden = true; m.innerHTML = ''; if (!ok) return; if (!name) return toast('Enter a name first', 'alert-circle'); const L = profilesList(), id = 'p' + Date.now().toString(36); L.push({ id, name, color: AV_COLORS[L.length % AV_COLORS.length] }); profilesSave(L); lsSet(STORE_KEY + ':' + id, JSON.stringify({ profile: { name, roll: '', branch: '', college: '', goal: 30 } })); lsSet(SIGNOUT_KEY, ''); switchProfile(id); };
  m.onclick = e => { const b = e.target.closest('[data-r]'); if (b) done(b.dataset.r === '1'); else if (e.target === m) done(false); };
  $('#npName').onkeydown = e => { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); };
}
async function removeProfile(id) {
  const L = profilesList(), p = L.find(x => x.id === id); if (!p || id === activeProfile() || id === 'default') return;
  if (!await confirmModal(`Delete ${esc(profName(p))}?`, 'All progress, notes and readings for this student will be permanently deleted from this device.', 'Delete')) return;
  try { localStorage.removeItem(STORE_KEY + ':' + id); } catch (e) { }
  profilesSave(L.filter(x => x.id !== id)); toast('Student removed', 'trash-2'); closePop();
}

/* ----- notifications (computed from state; read flags stored) ----- */
function notifications() {
  const s = Store.s, tk = todayKey(), N = [];
  if (!s.daily[tk]) N.push({ id: 'daily-' + tk, ic: 'sparkles', t: 'Today’s daily challenge is ready', d: 'One question · +30 XP', href: '#/achievements' });
  const diff = examDiff();
  if (diff != null && diff > 0 && diff < 15 * 864e5) N.push({ id: 'exam-' + tk, ic: 'calendar-clock', t: `Practical exam in ${Math.ceil(diff / 864e5)} day${Math.ceil(diff / 864e5) === 1 ? '' : 's'}`, d: 'Check your plan and the exam-day checklist', href: '#/planner' });
  const plan = s.plan, day = plan && plan.days && plan.days.find(x => x.date === tk), left = day ? day.tasks.filter(t => !s.planDone[t.id]).length : 0;
  if (left) N.push({ id: `plan-${tk}-${left}`, ic: 'list-checks', t: `${left} study task${left > 1 ? 's' : ''} planned for today`, d: day.tasks.find(t => !s.planDone[t.id]).text, href: '#/planner' });
  const rev = Object.values(s.viva).filter(v => v === 'review').length;
  if (rev) N.push({ id: `review-${tk}`, ic: 'rotate-cw', t: `${rev} viva question${rev > 1 ? 's' : ''} marked for review`, d: 'Revise them in the Viva Bank', href: '#/viva' });
  const y = new Date(); y.setDate(y.getDate() - 1); const yk = todayKey(y);
  if (((s.study[yk] || 0) + (s.focus[yk] || 0)) >= 60 && ((s.study[tk] || 0) + (s.focus[tk] || 0)) < 60 && new Date().getHours() >= 17) N.push({ id: 'streak-' + tk, ic: 'flame', t: 'Keep your study streak alive', d: 'Study for a few minutes today', href: '#/' });
  (s.badgeLog || []).filter(b => Date.now() - b.ts < 7 * 864e5).slice(-4).reverse().forEach(b => { const B = BADGES.find(x => x[0] === b.id); if (B) N.push({ id: 'badge-' + b.id, ic: 'award', t: `Badge unlocked: ${B[1]}`, d: B[3], href: '#/achievements', ts: b.ts }); });
  const hasData = EXPS.some(e => expProgress(e.id).done) || Object.keys(s.ws).length;
  if (hasData && (!s.lastBackup || Date.now() - s.lastBackup > 7 * 864e5)) N.push({ id: 'backup-' + Math.floor(Date.now() / (7 * 864e5)), ic: 'hard-drive-download', t: 'Back up your progress', d: 'Your data lives only in this browser — export a backup', action: 'backup' });
  if (s.onboarded && s.seenVersion === APP_VERSION) N.push({ id: 'v' + APP_VERSION, ic: 'gift', t: `What’s new in PhysLab ${APP_VERSION}`, d: 'Apparatus wiring guides, handwriting downloads and more', action: 'whatsnew' });
  return N;
}
const unread = () => notifications().filter(n => !Store.s.notifRead[n.id]).length;

/* ----- popover menus (account + notifications) ----- */
function closePop() { const p = $('#pop'); if (p) p.remove(); $$('.topbar [aria-expanded="true"]').forEach(b => b.setAttribute('aria-expanded', 'false')); }
function openPop(btn, html, cls) {
  const was = $('#pop') && $('#pop').dataset.for === btn.id; closePop(); if (was) return null;
  const p = document.createElement('div'); p.id = 'pop'; p.className = 'pop ' + (cls || ''); p.dataset.for = btn.id; p.innerHTML = html; p.setAttribute('role', 'menu');
  document.body.appendChild(p); const r = btn.getBoundingClientRect();
  p.style.top = (r.bottom + 8) + 'px'; p.style.right = Math.max(8, innerWidth - r.right) + 'px';
  btn.setAttribute('aria-expanded', 'true'); refreshIcons();
  return p;
}
document.addEventListener('click', e => { const p = $('#pop'); if (p && !p.contains(e.target) && !e.target.closest('#avatarBtn,#bellBtn,#goalChip')) closePop(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
function openAccount() {
  const s = Store.s, L = profilesList(), me = activeProfile(), meP = L.find(p => p.id === me) || L[0], xp = typeof xpOf === 'function' ? xpOf(statsSnapshot()) : 0, lv = levelOf(xp);
  const p = openPop($('#avatarBtn'), `<div class="pop-signed">${icon('check-circle-2')} Signed in on this device</div><div class="pop-head"><span class="avatar lg" style="--c:${meP.color}">${initials(s.profile.name || meP.name)}</span><div><b>${esc(s.profile.name || meP.name)}</b><span>${s.profile.roll ? 'Roll ' + esc(s.profile.roll) + ' · ' : ''}Level ${lv.lv} · ${xp} XP</span></div></div>
    <div class="pop-label">Students on this device</div>
    ${L.map(pr => `<div class="pop-item prof ${pr.id === me ? 'on' : ''}"><button data-sw="${pr.id}"><span class="avatar sm" style="--c:${pr.color}">${initials(profName(pr))}</span><span>${esc(profName(pr))}</span>${pr.id === me ? icon('check', 'pop-ck') : ''}</button>${pr.id !== me && pr.id !== 'default' ? `<button class="pop-x" data-rm="${pr.id}" aria-label="Delete ${esc(profName(pr))}">${icon('x')}</button>` : ''}</div>`).join('')}
    <button class="pop-item" data-act="add">${icon('user-plus')} Add a student</button><div class="pop-sep"></div>
    <a class="pop-item" href="#/settings">${icon('user-round-cog')} Profile & settings</a>
    <button class="pop-item" data-act="tour">${icon('presentation')} Feature tour</button>
    <a class="pop-item" href="#/help">${icon('life-buoy')} Help centre</a>
    <button class="pop-item" data-act="keys">${icon('keyboard')} Keyboard shortcuts <kbd>?</kbd></button>
    <button class="pop-item" data-act="new">${icon('gift')} What’s new</button>
    <button class="pop-item" data-act="backup">${icon('hard-drive-download')} Export backup</button>
    <button class="pop-item" data-act="signout">${icon('log-out')} Sign out</button>
    <div class="pop-foot">${icon('shield-check')} Private — your data stays on this device</div>`, 'pop-account');
  if (!p) return;
  p.onclick = e => {
    const b = e.target.closest('button,a'); if (!b) return;
    if (b.dataset.rm) { e.stopPropagation(); return removeProfile(b.dataset.rm); }
    if (b.dataset.sw) { closePop(); signInAs(b.dataset.sw); return; }
    closePop();
    if (b.dataset.act === 'add') addProfile(); else if (b.dataset.act === 'tour') tourOpen(0); else if (b.dataset.act === 'keys') showShortcuts(); else if (b.dataset.act === 'new') showWhatsNew(); else if (b.dataset.act === 'backup') exportBackup(); else if (b.dataset.act === 'signout') signOut();
  };
}
function openBell() {
  const N = notifications(), R = Store.s.notifRead;
  const p = openPop($('#bellBtn'), `<div class="pop-row"><b>Notifications</b><span class="spacer"></span>${N.some(n => !R[n.id]) ? '<button class="btn sm ghost" data-mark="all">Mark all read</button>' : ''}</div>
    ${N.length ? N.map(n => `<button class="notif ${R[n.id] ? '' : 'unread'}" data-nid="${n.id}"><span class="notif-ic">${icon(n.ic)}</span><span class="notif-tx"><b>${esc(n.t)}</b><span>${esc(n.d || '')}</span></span>${R[n.id] ? '' : '<i class="notif-dot"></i>'}</button>`).join('') : `<div class="empty" style="border:0;padding:26px">${icon('bell-off')}<div>You’re all caught up</div></div>`}`, 'pop-bell');
  if (!p) return;
  p.onclick = e => {
    if (e.target.closest('[data-mark]')) { N.forEach(n => R[n.id] = true); Store.save(); updateSaas(); closePop(); openBell(); return; }
    const b = e.target.closest('[data-nid]'); if (!b) return; const n = N.find(x => x.id === b.dataset.nid); R[n.id] = true; Store.save(); updateSaas(); closePop();
    if (n.action === 'backup') exportBackup(); else if (n.action === 'whatsnew') showWhatsNew(); else if (n.href) location.hash = n.href;
  };
}
function exportBackup() { download(`physlab-backup-${todayKey()}.json`, JSON.stringify(Store.s, null, 2), 'application/json'); Store.s.lastBackup = Date.now(); Store.save(); updateSaas(); toast('Backup downloaded', 'download'); }

/* ----- daily goal + streak ----- */
function goalInfo() {
  const s = Store.s, tk = todayKey(), mins = Math.floor(((s.study[tk] || 0) + (s.focus[tk] || 0)) / 60), goal = s.profile.goal || 30;
  let streak = 0; const d = new Date(); if (!((s.study[todayKey(d)] || 0) + (s.focus[todayKey(d)] || 0) >= 60)) d.setDate(d.getDate() - 1);
  while ((s.study[todayKey(d)] || 0) + (s.focus[todayKey(d)] || 0) >= 60) { streak++; d.setDate(d.getDate() - 1); }
  return { mins, goal, pct: Math.min(1, mins / goal), streak };
}
function openGoal() {
  const g = goalInfo();
  const p = openPop($('#goalChip'), `<div class="pop-row"><b>Today’s study goal</b></div><div class="goal-big"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="32" stroke="var(--line-2)" stroke-width="8" fill="none"/><circle cx="40" cy="40" r="32" stroke="url(#ggrad)" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="${(g.pct * 201).toFixed(1)} 201" transform="rotate(-90 40 40)"/><defs><linearGradient id="ggrad"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs></svg><div><b>${g.mins} / ${g.goal} min</b><span>${g.pct >= 1 ? 'Goal reached — great work!' : `${g.goal - g.mins} min to go`}</span><span>${icon('flame')} ${g.streak}-day streak</span></div></div>
    <div class="pop-label">Daily goal</div><div class="seg" id="goalSeg" style="margin:0 12px 12px">${[15, 30, 45, 60, 90].map(m => `<button data-g="${m}" class="${g.goal === m ? 'on' : ''}">${m}</button>`).join('')}</div>
    <a class="pop-item" href="#/timer">${icon('timer')} Start a focus session</a><a class="pop-item" href="#/analytics">${icon('bar-chart-3')} See analytics</a>`, 'pop-goal');
  if (!p) return;
  $('#goalSeg', p).onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; Store.s.profile.goal = +b.dataset.g; Store.save(); updateSaas(); closePop(); openGoal(); };
}

/* ----- topbar widgets ----- */
function updateSaas() {
  const s = Store.s, L = profilesList(), me = L.find(p => p.id === activeProfile()) || L[0];
  const av = $('#avatarBtn'); if (av) { av.innerHTML = `<span class="avatar" style="--c:${me.color}">${initials(s.profile.name || me.name)}</span>`; av.title = (s.profile.name || me.name) + ' — account'; }
  const n = unread(), bb = $('#bellBtn'); if (bb) { bb.innerHTML = icon('bell') + (n ? `<span class="bell-n">${n > 9 ? '9+' : n}</span>` : ''); bb.setAttribute('aria-label', `Notifications${n ? ` (${n} unread)` : ''}`); }
  const g = goalInfo(), gc = $('#goalChip');
  const sc = $('#sideUser'); if (sc) sc.innerHTML = `<span class="avatar sm" style="--c:${me.color}">${initials(s.profile.name || me.name)}</span><span class="su-tx"><b>${esc(s.profile.name || me.name)}</b><em>Signed in · ${goalInfo().mins} min today</em></span><button class="icon-btn su-sw" id="sideSwitch" title="Switch student" aria-label="Switch student">${icon('repeat')}</button>`;
  const ssw = $('#sideSwitch'); if (ssw) ssw.onclick = e => { e.preventDefault(); openPicker(); };
  if (gc) gc.innerHTML = `<svg viewBox="0 0 24 24" class="goal-ring"><circle cx="12" cy="12" r="9" stroke="var(--line-2)" stroke-width="3" fill="none"/><circle cx="12" cy="12" r="9" stroke="${g.pct >= 1 ? '#34d399' : '#a78bfa'}" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="${(g.pct * 56.5).toFixed(1)} 56.5" transform="rotate(-90 12 12)"/></svg><span class="mono">${g.mins}/${g.goal}m</span>${g.streak ? `<span class="streak">${icon('flame')}${g.streak}</span>` : ''}`;
  refreshIcons();
}
setInterval(() => { if (!document.hidden) updateSaas(); }, 60000);

/* ----- shortcuts, what's new ----- */
const SHORTCUTS = [['Ctrl + K  or  /', 'Search everything'], ['?', 'Show keyboard shortcuts'], ['G then D', 'Go to dashboard'], ['P', 'Start / pause focus timer'], ['Space', 'Play / pause simulation (canvas focused) · flip flashcard'], ['[  ]', 'Fine-adjust the virtual-lab control (Shift = coarse)'], ['R', 'Record a virtual-lab reading'], ['1 – 4, Enter', 'Answer a quiz question / next'], ['1 / 2 / 3', 'Grade a flashcard or mock-viva answer'], ['← →', 'Previous / next slide in the tour or flashcards'], ['Esc', 'Close dialogs and menus']];
function showShortcuts() {
  const m = $('#modal'); m.innerHTML = `<div class="modal-box" style="width:min(560px,100%)" role="document"><h3>${icon('keyboard')} Keyboard shortcuts</h3><dl class="kv" style="margin:14px 0 18px;row-gap:10px">${SHORTCUTS.map(s => `<dt><kbd>${esc(s[0])}</kbd></dt><dd>${s[1]}</dd>`).join('')}</dl><div class="row" style="justify-content:flex-end"><button class="btn primary" data-r="1">Got it</button></div></div>`;
  m.hidden = false; refreshIcons(); $('[data-r]', m).focus();
  m.onclick = e => { if (e.target === m || e.target.closest('[data-r]')) { m.hidden = true; m.innerHTML = ''; } };
}
const WHATSNEW = [['cable', 'Apparatus connections', 'LED, PN diode, photoelectric and solar cell now show how to wire the real kit — pictorial bench diagrams with colour-coded leads, step-by-step highlights, animated current flow and a pre-switch-on checklist.'], ['download', 'Download handwritten notes', 'Save any handwritten notebook as a multi-page PDF, PNG, JPEG or vector SVG, with or without the paper lines.'], ['file-image', 'Diagram downloads', 'Export every circuit and apparatus diagram as SVG, PNG or a print-ready white-background PNG for your record book.'], ['notebook-pen', 'Paper styles', 'Lined, graph, dotted or plain paper for every notebook.'], ['flask-conical', 'Virtual lab', 'Take readings inside every simulation with a guided measurement panel; they fill your workspace automatically.'], ['pen-tool', 'Stylus handwriting', 'Handwritten notes, rough work, answers and page annotations — with a precise eraser and pressure-sensitive pen.'], ['wifi-off', 'Fully offline', 'Every library, font and icon is built in; no internet needed.'], ['graduation-cap', 'Exam simulation', 'Lottery-drawn experiment, timed 50-mark paper with theory, calculation and viva.'], ['ruler', 'Skill builders', 'Instrument reading trainer, graph plotting practice and derivation puzzles.'], ['trophy', 'XP & badges', 'Daily challenge, levels, 20 badges and a printable progress report.'], ['users', 'Student profiles', 'Separate progress for each student on a shared computer, plus notifications and daily goals.']];
const WHATSNEW_NEW = 4; // the first N entries are new in this version
function showWhatsNew() {
  Store.s.seenVersion = APP_VERSION; Store.save();
  const m = $('#modal'); m.innerHTML = `<div class="modal-box wn-box" style="width:min(620px,100%)" role="document" aria-labelledby="wnTitle"><span class="eyebrow">Version ${APP_VERSION}</span><h3 style="font-size:22px" id="wnTitle">What’s new in PhysLab</h3><div class="wn-list" tabindex="0" aria-label="Release highlights">${WHATSNEW.map((w, i) => `${i === 0 ? `<span class="wn-sec">New in ${APP_VERSION}</span>` : i === WHATSNEW_NEW ? '<span class="wn-sec">Also in PhysLab</span>' : ''}<div class="wn${i < WHATSNEW_NEW ? ' new' : ''}"><span class="wn-ic">${icon(w[0])}</span><div><b>${w[1]}</b><p>${w[2]}</p></div></div>`).join('')}</div><div class="row wn-foot" style="justify-content:flex-end;gap:8px"><button class="btn" data-x="tour">${icon('presentation')} Take the tour</button><button class="btn primary" data-x="ok">Great!</button></div></div>`;
  m.hidden = false; refreshIcons();
  m.onclick = e => { const b = e.target.closest('[data-x]'); if (e.target === m || b) { m.hidden = true; m.innerHTML = ''; if (b && b.dataset.x === 'tour') tourOpen(0); } };
}

/* ----- help centre ----- */
const FAQ = [
  ['Getting started', 'How do I study an experiment?', 'Open it from the sidebar. Work through the eight tabs from Overview to Viva and press “Mark section as complete” at the bottom of each. The ring next to the experiment fills as you go.'],
  ['Getting started', 'Where is my data saved? Is it private?', 'Everything is stored in this browser on this device (localStorage). Nothing is uploaded anywhere. Export a backup from the account menu or Settings to move it to another device.'],
  ['Getting started', 'Does PhysLab need the internet?', 'No. All libraries, fonts and icons are built into the single HTML file, so it works completely offline — even from a pen drive.'],
  ['Virtual lab', 'How do I take readings in a simulation?', 'Open the Simulation tab. The “Virtual lab — take readings” panel tells you what to do; adjust with the ‹ › buttons (or [ and ] keys) until the light turns green, then press Record or R. Readings appear in the Workspace tab.'],
  ['Virtual lab', 'Why is my reading rejected?', 'Just like a real examiner, PhysLab only accepts valid readings — e.g. the crosshair must sit on the ring edge, the photocurrent must have just reached zero, or the string must be at resonance. The panel says exactly how far off you are.'],
  ['Virtual lab', 'Can I delete a reading?', 'Use the undo button in the panel to remove the last saved reading, or edit and delete rows directly in the Workspace table.'],
  ['Calculations', 'How is the error calculated?', 'The Error analysis card adds the fractional errors of each measured quantity (maximum probable error). Edit the least counts to match your instruments.'],
  ['Calculations', 'How do I get a printable lab record?', 'Open Lab Record (or the file icon on any experiment), choose “My readings” or sample data, then Print / Save PDF. Your name and roll number come from your profile.'],
  ['Experiments', 'How do I see how to wire the circuit?', 'Open an electrical experiment (LED, PN diode, photoelectric effect or solar cell), go to the Diagram tab and switch to “Apparatus connections”. Tap a wiring step to highlight that lead, or press Play to walk through them in order. Turn on “Show current flow” to see the series loop.'],
  ['Experiments', 'Can I download a diagram for my record?', 'Yes. The Diagram tab has SVG, PNG and Print PNG buttons. Print PNG gives a white background that copies cleanly into a record book or document. The Lab Record page includes the apparatus connection diagram automatically.'],
  ['Handwriting', 'How do I download my handwritten notes?', 'In any handwritten notebook, press Download and choose PDF (all pages, A4 width), PNG, JPEG (smaller file) or SVG (vector, sharp at any zoom). Untick “Include paper lines” for a clean white background.'],
  ['Handwriting', 'How do I write with a stylus?', 'Choose Handwrite in Notes or experiment notes, open Rough work in the Workspace, use the pen button next to any answer box, or the pen button in the top bar to annotate a page. Pen-only mode ignores your palm and finger.'],
  ['Handwriting', 'How does the eraser work?', 'Choose the eraser, then Precise (erases only what you rub over) or Whole stroke, and pick a size. On most styluses, flipping to the eraser end or holding the side button erases too. Undo restores anything erased.'],
  ['Practice', 'What is the exam simulation?', 'A 30-minute, 50-mark mock practical: a lottery picks your experiment, then theory MCQs, a calculation from fresh observations, and five viva questions.'],
  ['Practice', 'How do XP and badges work?', 'Almost everything earns XP — completing sections, quizzes, viva practice, puzzles, graphs, exams and the daily challenge. Badges unlock automatically; see them under Achievements.'],
  ['Account', 'Will I stay signed in?', 'Yes. PhysLab remembers the signed-in student on this device and browser, and saves progress automatically as you work (and again whenever you close or leave the page). You stay signed in until you choose Sign out or switch to another student from the account menu or the sidebar. Keep the HTML file in the same place and use the same browser — and export a backup now and then, because clearing browser data erases it.'],
  ['Account', 'What happens if PhysLab is open in two tabs?', 'Tabs of the same student stay in sync automatically. If one tab switches to a different student, the other tab stops saving and asks you to reload, so two students’ progress can never get mixed up.'],
  ['Account', 'Can several students use one computer?', 'Yes. Open the account menu (your initials, top right) and choose “Add a student”. Each profile has completely separate progress and notes.'],
  ['Account', 'How do I reset or move my data?', 'Settings → Backup lets you export or import everything as a file. Settings → Reset clears selected data or everything.']
];
VIEWS.help = () => `<div class="page-head"><div><span class="eyebrow">Support</span><h1>Help centre</h1><p>Guides, answers and shortcuts for everything in PhysLab.</p></div><div class="row"><button class="btn primary" data-help="tour">${icon('presentation')} Replay the feature tour</button></div></div>
  <div class="grid g3" style="margin-bottom:18px">${[['presentation', 'Feature tour', 'A 14-slide walkthrough of every tool', 'tour'], ['keyboard', 'Keyboard shortcuts', 'Work faster with the keyboard', 'keys'], ['gift', 'What’s new', `Highlights of version ${APP_VERSION}`, 'new']].map(c => `<button class="card help-tile" data-help="${c[3]}"><span class="exp-icon" style="background:rgba(139,92,246,.14);color:var(--violet-2)">${icon(c[0])}</span><b>${c[1]}</b><span class="muted">${c[2]}</span></button>`).join('')}</div>
  <div class="toolbar"><div class="search-box">${icon('search')}<input class="input" id="hSearch" placeholder="Search help…" aria-label="Search help"></div></div>
  <div id="hList"></div>
  <div class="card" style="margin-top:18px"><h3>${icon('info')} About PhysLab</h3><dl class="kv"><dt>Version</dt><dd>${APP_VERSION}</dd><dt>Data</dt><dd>Stored only in this browser · ${profilesList().length} student profile${profilesList().length > 1 ? 's' : ''} on this device</dd><dt>Connectivity</dt><dd>Works fully offline</dd><dt>Built with</dt><dd>KaTeX, Chart.js, Three.js, Lucide icons, Inter / JetBrains Mono / Space Grotesk fonts</dd></dl></div>`;
function mountHelp() {
  const draw = q => {
    const w = q.toLowerCase().split(/\s+/).filter(Boolean), list = FAQ.filter(f => w.every(x => (f[1] + ' ' + f[2] + ' ' + f[0]).toLowerCase().includes(x)));
    const cats = [...new Set(list.map(f => f[0]))];
    $('#hList').innerHTML = list.length ? cats.map(c => `<h3 style="font-size:16px;margin:18px 0 10px">${c}</h3>${list.filter(f => f[0] === c).map((f, i) => `<div class="qa"><button class="qa-head" aria-expanded="false"><span class="q">${f[1]}</span>${icon('chevron-down', 'chev')}</button><div class="qa-body" style="padding-left:16px">${f[2]}</div></div>`).join('')}`).join('') : `<div class="empty">${icon('search-x')}<div>No help articles match.</div></div>`;
    refreshIcons();
  };
  $('#hSearch').oninput = e => draw(e.target.value);
  $('#hList').onclick = e => { const h = e.target.closest('.qa-head'); if (h) { const qa = h.closest('.qa'); qa.classList.toggle('open'); h.setAttribute('aria-expanded', qa.classList.contains('open')); } };
  $('#view').addEventListener('click', e => { const b = e.target.closest('[data-help]'); if (!b) return; const a = b.dataset.help; if (a === 'tour') tourOpen(0); else if (a === 'keys') showShortcuts(); else if (a === 'new') showWhatsNew(); });
  draw('');
}

/* ----- footer & settings extras & greeting ----- */
function renderFooter() {
  const f = $('#appFoot'); if (!f) return;
  f.innerHTML = `<span class="foot-brand">PhysLab ${APP_VERSION}</span><span>${icon('shield-check')} Private — data stays on this device</span><span>${icon('wifi-off')} Works offline</span><span class="spacer"></span><a href="#/help">Help</a><button data-foot="tour">Feature tour</button><button data-foot="keys">Shortcuts</button><button data-foot="new">What’s new</button>`;
  f.onclick = e => { const b = e.target.closest('[data-foot]'); if (!b) return; ({ tour: () => tourOpen(0), keys: showShortcuts, new: showWhatsNew })[b.dataset.foot](); };
  refreshIcons();
}
function saasAfterRoute() {
  closePop(); updateSaas();
  const { parts } = parseHash();
  if (parts[0] === 'settings' && !$('#tourCard')) {
    const grid = $('#view .grid.g2'); if (grid) {
      grid.insertAdjacentHTML('beforeend', `<div class="card" id="tourCard"><h3>${icon('presentation')} Feature tour & profile</h3><label class="row" style="font-size:14px;cursor:pointer;margin-bottom:10px"><input type="checkbox" id="sTourAlways" ${Store.s.settings.tourAlways ? 'checked' : ''}> Show the feature tour every time PhysLab opens</label><div class="field" style="margin-bottom:12px"><label>Daily study goal (minutes)</label><div class="seg" id="sGoal">${[15, 30, 45, 60, 90].map(m => `<button data-g="${m}" class="${(Store.s.profile.goal || 30) === m ? 'on' : ''}">${m}</button>`).join('')}</div></div><div class="row"><button class="btn" id="sTourNow">${icon('play')} Replay tour</button><button class="btn" id="sAddStudent">${icon('user-plus')} Add a student</button></div></div>`);
      refreshIcons();
      $('#sTourAlways').onchange = e => { Store.s.settings.tourAlways = e.target.checked; Store.save(); };
      $('#sGoal').onclick = e => { const b = e.target.closest('[data-g]'); if (!b) return; Store.s.profile.goal = +b.dataset.g; Store.save(); $$('#sGoal button').forEach(x => x.classList.toggle('on', x === b)); updateSaas(); };
      $('#sTourNow').onclick = () => tourOpen(0); $('#sAddStudent').onclick = addProfile;
      $$('[data-sp="name"]').forEach(i => i.addEventListener('change', syncProfileName));
    }
  }
  // personal greeting on the dashboard
  const eb = $('.hero .eyebrow'); if (eb && parts.length === 0) { const n = Store.s.profile.name; eb.textContent = n ? `${greeting()}, ${n.split(' ')[0]} 👋` : 'Engineering Physics · Practical Lab'; }
}
function saasBoot() {
  $('#avatarBtn').onclick = openAccount; $('#bellBtn').onclick = openBell; $('#goalChip').onclick = openGoal;
  document.addEventListener('keydown', e => {
    if (e.key !== '?' || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable || $('#tour') || !$('#modal').hidden) return;
    e.preventDefault(); showShortcuts();
  });
  renderFooter(); updateSaas();
  // first launch → tour; returning users on an older version → what's new
  if (lsGet(SIGNOUT_KEY) === '1') { openPicker(); return; }
  const toured = tourMaybeStart();
  if (!toured && Store.s.onboarded && Store.s.seenVersion !== APP_VERSION) setTimeout(showWhatsNew, 900);
  if (!toured && !Store.s.onboarded) { Store.s.onboarded = true; Store.save(); }
}

/* ===== Staying signed in: explicit sign-in / sign-out, multi-tab safety, durable storage ===== */
const SIGNOUT_KEY = 'physlab.signedOut';
function profileStats(p) {
  let d = null;
  if (p.id === Store.profileId) d = Store.s;
  else { try { d = JSON.parse(lsGet(p.id === 'default' ? STORE_KEY : STORE_KEY + ':' + p.id) || 'null'); } catch (e) { d = null; } }
  if (!d) return { name: p.name, pct: 0, last: 0 };
  const pr = d.progress || {}, done = Object.values(pr).reduce((n, x) => n + Object.values(x || {}).filter(Boolean).length, 0);
  return { name: (d.profile && d.profile.name) || p.name, pct: Math.round(done / (EXPS.length * SECTIONS.length) * 100), last: d.savedAt || 0 };
}
function agoText(ts) { if (!ts) return 'not used yet'; const m = Math.round((Date.now() - ts) / 60000); if (m < 2) return 'active just now'; if (m < 60) return `active ${m} min ago`; const h = Math.round(m / 60); if (h < 24) return `active ${h} h ago`; const dd = Math.round(h / 24); return `active ${dd} day${dd > 1 ? 's' : ''} ago`; }
/* Explicit switch: always confirmed, then the choice sticks on this device */
async function signInAs(id) {
  const me = Store.profileId;
  if (id === me) { lsSet(SIGNOUT_KEY, ''); closePicker(); closePop(); return; }
  const st = profileStats(profilesList().find(p => p.id === id) || { id, name: 'student' });
  const fromPicker = !!$('#picker');
  if (!fromPicker && !await confirmModal(`Switch to ${esc(st.name)}?`, `${esc(st.name)} will stay signed in on this device until you switch again. ${esc(Store.s.profile.name || 'The current student')}’s progress is saved.`, 'Switch', false)) return;
  lsSet(SIGNOUT_KEY, '');
  switchProfile(id);
}
function signOut() {
  confirmModal('Sign out?', `${esc(Store.s.profile.name || 'Your')} progress stays saved on this device. Next time PhysLab opens it will ask who is studying.`, 'Sign out', false).then(ok => {
    if (!ok) return; Store.save(); lsSet(SIGNOUT_KEY, '1'); closePop(); openPicker();
  });
}
function closePicker() { const p = $('#picker'); if (p) { p.classList.add('out'); setTimeout(() => p.remove(), 300); } document.body.classList.remove('tour-open'); }
function openPicker() {
  if ($('#picker')) return;
  const L = profilesList(), el = document.createElement('div');
  el.id = 'picker'; el.className = 'picker'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Choose a student');
  el.innerHTML = `<div class="picker-box"><span class="brand-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="12" cy="12" r="2.2" fill="#fff"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg></span>
    <h2>Who’s studying today?</h2><p class="muted">Choose your profile. You’ll stay signed in on this device until you sign out or switch.</p>
    <div class="picker-grid">${L.map(p => { const st = profileStats(p); return `<button class="picker-card" data-pick="${p.id}"><span class="avatar xl" style="--c:${p.color}">${initials(st.name)}</span><b>${esc(st.name)}</b><span class="picker-bar"><i style="width:${st.pct}%"></i></span><em>${st.pct}% complete · ${agoText(st.last)}</em></button>`; }).join('')}
      <button class="picker-card add" data-pick="__add"><span class="avatar xl add">${icon('user-plus')}</span><b>Add a student</b><em>New, separate profile</em></button></div>
    <p class="dim" style="font-size:12px;margin:16px 0 0">${icon('shield-check')} Progress is saved in this browser on this device.</p></div>`;
  document.body.appendChild(el); document.body.classList.add('tour-open'); refreshIcons();
  el.onclick = e => { const b = e.target.closest('[data-pick]'); if (!b) return; if (b.dataset.pick === '__add') { addProfile(); return; } signInAs(b.dataset.pick); };
  setTimeout(() => { const c = $('.picker-card', el); c && c.focus(); }, 80);
}
/* Multi-tab safety: never let a stale tab overwrite another student's or newer data */
window.addEventListener('storage', e => {
  if (e.key === ACTIVE_KEY && (e.newValue || 'default') !== Store.profileId) {
    Store.locked = true;
    const m = $('#modal'); m.innerHTML = `<div class="modal-box" role="document"><h3>${icon('users')} Student changed in another tab</h3><p>Another PhysLab tab switched to a different student. This tab has stopped saving so no progress gets mixed up.</p><div class="row" style="justify-content:flex-end"><button class="btn primary" data-r="1">${icon('refresh-cw')} Reload</button></div></div>`;
    m.hidden = false; refreshIcons(); m.onclick = ev => { if (ev.target.closest('[data-r]')) location.reload(); };
  } else if (e.key === Store.key && e.newValue && !Store.locked) {
    // the same student saved newer progress in another tab: adopt it
    try { const fresh = JSON.parse(e.newValue); if ((fresh.savedAt || 0) > (Store.s.savedAt || 0)) { Store.s = deepMerge(DEFAULT_STATE(), fresh); if (!/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')) route(); } } catch (x) { }
  }
});
/* Ask the browser to keep this data even under storage pressure */
try { navigator.storage && navigator.storage.persist && navigator.storage.persisted().then(p => { if (!p) navigator.storage.persist(); }); } catch (e) { }
