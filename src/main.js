/* ---------- Router, global events, activity tracking, boot ---------- */
function parseHash() {
  const h = (location.hash || '#/').slice(1), [path, qs] = h.split('?');
  return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(qs || '') };
}
function setCrumbs(items) { $('#crumbs').innerHTML = items.map((c, i) => i === items.length - 1 ? `<b>${esc(c)}</b>` : `<span>${esc(c)}</span><span aria-hidden="true">/</span>`).join(''); }
function route() {
  if (activeSim) activeSim.destroy();
  stopMotifs();
  destroyCharts();
  if (heroStop) { heroStop(); heroStop = null; }
  clearInterval(quizTimer);
  mockCleanup(); examCleanup(); stopListening(); annUnmount(); inkCleanup();
  currentExp = null;
  const { parts, params } = parseHash(), v = $('#view'), page = parts[0] || '';
  let html = '', after = null, crumbs = ['PhysLab'];
  switch (page) {
    case '': html = VIEWS.dashboard(); after = mountDashboard; crumbs.push('Dashboard'); break;
    case 'exp': { const e = expById(parts[1]); if (!e) { html = VIEWS.notFound(); break; } const tab = SECTIONS.some(s => s.k === parts[2]) ? parts[2] : 'overview'; html = VIEWS.exp(e.id, tab); after = () => mountExp(e.id, tab); crumbs.push('Experiments', `${e.num}. ${e.title}`); break; }
    case 'revision': html = VIEWS.revision(expById(parts[1]) ? parts[1] : null); crumbs.push('Quick Revision'); break;
    case 'formulas': html = VIEWS.formulas(); after = mountFormulas; crumbs.push('Formula Library'); break;
    case 'viva': html = VIEWS.viva(); after = mountViva; crumbs.push('Viva Bank'); break;
    case 'quiz': html = VIEWS.quiz(); after = () => mountQuiz(params); crumbs.push('Quiz'); break;
    case 'flashcards': html = VIEWS.flashcards(); after = () => mountFlash(params); crumbs.push('Flashcards'); break;
    case 'bookmarks': html = VIEWS.bookmarks(); after = mountBookmarks; crumbs.push('Bookmarks'); break;
    case 'notes': html = VIEWS.notes(); after = () => mountNotes(params); crumbs.push('Notes'); break;
    case 'timer': html = VIEWS.timer(); after = mountTimer; crumbs.push('Focus Timer'); break;
    case 'analytics': html = VIEWS.analytics(); after = mountAnalytics; crumbs.push('Analytics'); break;
    case 'settings': html = VIEWS.settings(); after = mountSettings; crumbs.push('Settings'); break;
    case 'record': if (parts[1]) { const e = expById(parts[1]); html = VIEWS.record(parts[1]); after = () => mountRecord(parts[1], params); crumbs.push('Lab Record', e ? e.title : '—'); } else { html = VIEWS.recordList(); after = mountRecordList; crumbs.push('Lab Record'); } break;
    case 'toolkit': html = VIEWS.toolkit(); after = mountToolkit; crumbs.push('Lab Toolkit'); break;
    case 'mock': html = VIEWS.mock(); after = mountMock; crumbs.push('Mock Viva'); break;
    case 'planner': html = VIEWS.planner(); after = mountPlanner; crumbs.push('Study Planner'); break;
    case 'checklist': html = VIEWS.checklist(); after = mountChecklist; crumbs.push('Exam Checklist'); break;
    case 'trainer': html = VIEWS.trainer(); after = () => mountTrainer(params); crumbs.push('Instrument Trainer'); break;
    case 'graphlab': html = VIEWS.graphlab(); after = () => mountGraphLab(params); crumbs.push('Graph Practice'); break;
    case 'puzzles': html = VIEWS.puzzles(); after = () => mountPuzzles(params); crumbs.push('Derivation Puzzles'); break;
    case 'exam': html = VIEWS.exam(); after = mountExam; crumbs.push('Exam Simulation'); break;
    case 'achievements': html = VIEWS.achievements(); after = mountAchievements; crumbs.push('Achievements'); break;
    case 'report': html = VIEWS.report(); after = mountReport; crumbs.push('Progress Report'); break;
    case 'help': html = VIEWS.help(); after = mountHelp; crumbs.push('Help centre'); break;
    default: html = VIEWS.notFound(); crumbs.push('Not found');
  }
  v.innerHTML = html;
  if (!route.vt) { v.classList.remove('view-enter'); void v.offsetWidth; v.classList.add('view-enter'); } else v.classList.remove('view-enter');
  setCrumbs(crumbs);
  buildSidebar();
  try { after && after(); } catch (err) { console.error(err); }
  renderMath(v); refreshIcons(); pomoUI();
  closeMenu();
  if (pendingFocus) {
    const sel = pendingFocus; pendingFocus = null;
    setTimeout(() => { const el = $(sel); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (el.classList.contains('qa')) { el.classList.add('open'); } el.style.boxShadow = '0 0 0 2px var(--violet)'; setTimeout(() => el.style.boxShadow = '', 1800); } }, 60);
  } else if (!(page === 'exp' && route.lastExp === parts[1])) window.scrollTo(0, 0);
  else { const tabs = $('#expTabs'); if (tabs && window.scrollY > tabs.offsetTop) window.scrollTo(0, Math.max(0, $('#expTabs').getBoundingClientRect().top + window.scrollY - 70)); }
  route.lastExp = page === 'exp' ? parts[1] : null;
  try { immersiveAfterRoute(); } catch (err) { console.error(err); }
  try { checkBadges(); } catch (err) { console.error(err); }
  try { inkAfterRoute(); } catch (err) { console.error(err); }
  try { saasAfterRoute(); } catch (err) { console.error(err); }
  v.focus({ preventScroll: true });
}

function openMenu() { $('#sidebar').classList.add('open'); $('#scrim').hidden = false; }
function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; }

/* Active study-time tracking: counts seconds while the tab is visible and the user was active in the last 2 minutes */
let lastActivity = Date.now();
['pointerdown', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(ev => window.addEventListener(ev, () => lastActivity = Date.now(), { passive: true }));
setInterval(() => {
  if (document.hidden || Date.now() - lastActivity > 120000) return;
  const k = todayKey(); Store.s.study[k] = (Store.s.study[k] || 0) + 5;
  const { parts } = parseHash(); if (parts[0] === 'exp' && expById(parts[1])) Store.s.timeByExp[parts[1]] = (Store.s.timeByExp[parts[1]] || 0) + 5;
  saveSoon();
}, 5000);
setInterval(updateSideCount, 30000);

function boot() {
  Store.load();
  document.body.classList.toggle('reduce-motion', !!Store.s.settings.reduceMotion);
  applyTheme();
  $('#themeBtn').onclick = toggleTheme;
  $('#annotBtn').onclick = () => annToggle(!(ANN && ANN.active));
  if (window.matchMedia) matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (Store.s.settings.theme === 'system') { applyTheme(); route(); } });
  POMO.total = POMO.remaining = pomoDur('work');
  window.addEventListener('hashchange', () => { route.vt = !!(document.startViewTransition && motionOK()); routeWithTransition(); });
  immersiveBoot();
  $('#menuBtn').onclick = openMenu; $('#scrim').onclick = closeMenu;
  $('#searchBtn').onclick = openPalette;
  $('#pomoChip').onclick = () => location.hash = '#/timer';
  $('#palette').onclick = e => { if (e.target.id === 'palette') closePalette(); const b = e.target.closest('.pr-item'); if (b) palGo(+b.dataset.i); };
  $('#paletteInput').oninput = e => palSearch(e.target.value);
  $('#paletteInput').onkeydown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); palSel = Math.min(palItems.length - 1, palSel + 1); palDraw(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); palSel = Math.max(0, palSel - 1); palDraw(); }
    else if (e.key === 'Enter') { e.preventDefault(); palGo(palSel); }
  };
  let gPressed = 0;
  document.addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#palette').hidden ? openPalette() : closePalette(); return; }
    if (e.key === 'Escape') { if (!$('#palette').hidden) closePalette(); closeMenu(); return; }
    if (typing || !$('#modal').hidden || !$('#palette').hidden || $('#tour')) return;
    if (e.key === '/') { e.preventDefault(); openPalette(); return; }
    const { parts } = parseHash();
    if (parts[0] === 'quiz' && QZ) { if (/^[1-4]$/.test(e.key)) { quizPick(+e.key - 1); return; } if (e.key === 'Enter') { e.preventDefault(); quizNext(); return; } }
    if (parts[0] === 'mock' && MV && $('#mvBtns')) { if (e.key === ' ' && !MV.revealed) { e.preventDefault(); mvReveal(); return; } if (MV.revealed && /^[1-3]$/.test(e.key)) { mvGrade(2 - (+e.key - 1)); return; } }
    if (parts[0] === 'flashcards' && FC && FC.cards.length) {
      if (e.key === ' ') { e.preventDefault(); const c = $('#fcCard'); c && c.classList.toggle('flipped'); return; }
      if (e.key === 'ArrowRight') { FC.i = (FC.i + 1) % FC.cards.length; drawCard(); return; }
      if (e.key === 'ArrowLeft') { FC.i = (FC.i - 1 + FC.cards.length) % FC.cards.length; drawCard(); return; }
      if (/^[1-3]$/.test(e.key)) { fcGrade(+e.key - 1); return; }
    }
    if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) { POMO.running ? pomoPause() : pomoStart(); toast(POMO.running ? 'Focus timer started' : 'Focus timer paused', 'timer'); return; }
    if (e.key.toLowerCase() === 'g') { gPressed = Date.now(); return; }
    if (e.key.toLowerCase() === 'd' && Date.now() - gPressed < 800) { location.hash = '#/'; }
  });
  window.addEventListener('beforeunload', () => Store.save());
  window.addEventListener('pagehide', () => Store.save());
  document.addEventListener('visibilitychange', () => { if (document.hidden) Store.save(); });
  route();
  try { saasBoot(); } catch (err) { console.error(err); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
