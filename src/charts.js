/* ---------- Chart helpers (Chart.js with a canvas fallback) ---------- */
const CHARTS = new Set();
const PAL = { violet: '#a78bfa', cyan: '#22d3ee', blue: '#60a5fa', green: '#34d399', amber: '#fbbf24', pink: '#f472b6', red: '#f87171', grey: '#94a3b8' };
function destroyCharts() { CHARTS.forEach(c => { try { c.destroy(); } catch (e) { } }); CHARTS.clear(); }

/* spec: {datasets:[{label, data:[{x,y}], color, line:true/false, points:true/false, dashed, fill, y2}], x:{title,min,max}, y:{title,min,max}, y2:{title}} */
function plot(canvas, spec) {
  if (!canvas) return null;
  const TH = chartTheme(spec.paper);
  if (window.Chart) {
    const ds = spec.datasets.map(d => ({
      label: d.label, data: d.data, borderColor: d.color, backgroundColor: d.fill ? hexA(d.color, .15) : d.color,
      showLine: d.line !== false, pointRadius: d.points === false ? 0 : (d.r || 4), pointHoverRadius: d.points === false ? 3 : 6,
      borderWidth: d.w || 2, borderDash: d.dashed ? [6, 5] : [], tension: d.smooth ? .35 : 0, fill: d.fill ? 'origin' : false,
      yAxisID: d.y2 ? 'y2' : 'y', order: d.order || 0, pointBackgroundColor: d.color
    }));
    const axis = (t, o = {}) => ({
      type: 'linear', title: { display: !!t, text: t, color: TH.title, font: { family: 'Inter', size: 12, weight: '600' } },
      grid: { color: TH.grid, drawTicks: false }, border: { color: TH.border },
      ticks: { color: TH.tick, font: { family: 'JetBrains Mono', size: 11 }, padding: 6, maxTicksLimit: 9, callback: v => fmtTick(v) }, ...o
    });
    const scales = { x: axis(spec.x.title, clean({ min: spec.x.min, max: spec.x.max })), y: axis(spec.y.title, clean({ min: spec.y.min, max: spec.y.max })) };
    if (spec.y2) scales.y2 = { ...axis(spec.y2.title, clean({ min: spec.y2.min })), position: 'right', grid: { drawOnChartArea: false } };
    const ch = new Chart(canvas, {
      type: 'scatter', data: { datasets: ds },
      options: {
        responsive: true, maintainAspectRatio: false, animation: Store.s.settings.reduceMotion ? false : { duration: 800, easing: 'easeOutQuart' },
        interaction: { mode: 'nearest', intersect: false }, scales,
        plugins: {
          legend: { labels: { color: TH.legend, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, font: { family: 'Inter', size: 12 } } },
          tooltip: { backgroundColor: '#1f2534', borderColor: 'rgba(255,255,255,.12)', borderWidth: 1, titleFont: { family: 'Inter' }, bodyFont: { family: 'JetBrains Mono' }, callbacks: { label: c => `${c.dataset.label}: (${fmtTick(c.parsed.x)}, ${fmtTick(c.parsed.y)})` } }
        }
      }
    });
    CHARTS.add(ch);
    return ch;
  }
  fallbackPlot(canvas, spec);
  return null;
}
function chartTheme(paper) {
  const light = paper || document.body.classList.contains('light');
  return light ? { title: '#334155', grid: 'rgba(15,23,42,.08)', border: 'rgba(15,23,42,.25)', tick: '#475569', legend: '#1e293b' } : { title: '#a4abbe', grid: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.15)', tick: '#8b93a8', legend: '#cbd5e1' };
}
function clean(o) { const r = {}; for (const k in o) if (o[k] != null) r[k] = o[k]; return r; }
function fmtTick(v) { const a = Math.abs(v); if (a === 0) return '0'; if (a >= 1e5 || a < 1e-3) return v.toExponential(1); return Number(v.toPrecision(4)).toString(); }

function fallbackPlot(canvas, spec) {
  const box = canvas.parentElement, dpr = window.devicePixelRatio || 1;
  const W = box.clientWidth - 24, H = box.clientHeight - 24;
  canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const g = canvas.getContext('2d'); g.scale(dpr, dpr);
  const all = spec.datasets.filter(d => !d.y2).flatMap(d => d.data);
  if (!all.length) return;
  let x0 = spec.x.min ?? Math.min(...all.map(p => p.x)), x1 = spec.x.max ?? Math.max(...all.map(p => p.x));
  let y0 = spec.y.min ?? Math.min(0, ...all.map(p => p.y)), y1 = spec.y.max ?? Math.max(...all.map(p => p.y));
  if (x1 === x0) x1 = x0 + 1; if (y1 === y0) y1 = y0 + 1;
  const L = 56, B = 40, T = 14, Rr = 14;
  const X = x => L + (x - x0) / (x1 - x0) * (W - L - Rr), Y = y => H - B - (y - y0) / (y1 - y0) * (H - B - T);
  g.strokeStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.moveTo(L, T); g.lineTo(L, H - B); g.lineTo(W - Rr, H - B); g.stroke();
  g.fillStyle = '#8b93a8'; g.font = '11px monospace';
  for (let i = 0; i <= 5; i++) { const xv = x0 + (x1 - x0) * i / 5, yv = y0 + (y1 - y0) * i / 5; g.fillText(fmtTick(xv), X(xv) - 12, H - B + 16); g.fillText(fmtTick(yv), 4, Y(yv) + 4); }
  g.fillText(spec.x.title || '', W / 2 - 40, H - 6);
  spec.datasets.filter(d => !d.y2).forEach(d => {
    g.strokeStyle = g.fillStyle = d.color; g.lineWidth = 2; g.setLineDash(d.dashed ? [6, 5] : []);
    if (d.line !== false) { g.beginPath(); d.data.forEach((p, i) => i ? g.lineTo(X(p.x), Y(p.y)) : g.moveTo(X(p.x), Y(p.y))); g.stroke(); }
    if (d.points !== false) d.data.forEach(p => { g.beginPath(); g.arc(X(p.x), Y(p.y), 3.5, 0, 7); g.fill(); });
  });
}
/* Line helper: sample function into points */
function fnPoints(f, a, b, n = 120) { const pts = []; for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; const y = f(x); if (isFinite(y)) pts.push({ x, y }); } return pts; }
