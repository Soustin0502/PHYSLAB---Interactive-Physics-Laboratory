/* ---------- Observation & calculation workspace: configs, sample data, calculations ---------- */
const WS = {};
const rnd = (v, d) => Number(v.toFixed(d));
const resRow = (k, v) => [k, v];
const stepT = (txt, t) => `<div class="calc-step">${txt}${t ? `$$${t}$$` : ''}</div>`;
const errLine = (val, std, unit) => std ? `${fx(pctErr(val, std), 2)} % (standard ${std} ${unit})` : '—';

/* 1. Newton's rings */
(() => {
  const r = seeded(11), lam = 589.3e-9, R0 = 1.0, c = 4.5, rows = [];
  for (let n = 2; n <= 20; n += 2) { const D2 = 4 * n * lam * R0 * 1e4 + 0.0012, D = Math.sqrt(D2); rows.push({ n, L: rnd(c + D / 2 + (r() - .5) * .0016, 3), Rr: rnd(c - D / 2 + (r() - .5) * .0016, 3) }); }
  WS.newton = {
    params: [{ k: 'R', label: 'Radius of curvature R', unit: 'm', val: 1.0 }, { k: 'p', label: 'p for difference formula', unit: '', val: 10 }],
    tables: [{ k: 't', title: 'Ring diameters (travelling microscope, LC = 0.001 cm)', cols: [{ k: 'n', label: 'Ring no. n' }, { k: 'L', label: 'Left reading (cm)' }, { k: 'Rr', label: 'Right reading (cm)' }], derived: [{ label: 'D = |L − R| (cm)', f: x => Math.abs(x.L - x.Rr), d: 3 }, { label: 'D² (cm²)', f: x => (x.L - x.Rr) ** 2, d: 5 }] }],
    sample: { params: { R: 1.0, p: 10 }, tables: { t: rows } },
    calc(T, P) {
      const rs = T.t.filter(x => isFinite(x.n) && isFinite(x.L) && isFinite(x.Rr));
      if (rs.length < 2) throw 'Enter at least two rings (n, left and right readings).';
      if (!(P.R > 0)) throw 'Radius of curvature must be positive.';
      const xs = rs.map(x => x.n), ys = rs.map(x => (x.L - x.Rr) ** 2 * 1e-4);
      const fit = linfit(xs, ys); if (!fit) throw 'Ring numbers must not all be equal.';
      const lamG = fit.m / (4 * P.R);
      const pairs = []; rs.forEach(a => { const b = rs.find(x => x.n === a.n + P.p); if (b) pairs.push({ n: a.n, l: ((b.L - b.Rr) ** 2 - (a.L - a.Rr) ** 2) * 1e-4 / (4 * P.p * P.R) }); });
      const lamF = pairs.length ? mean(pairs.map(x => x.l)) : NaN;
      const steps = [
        stepT(`Linear fit of D² (m²) against n over ${rs.length} rings: slope = ${sci(fit.m, 4)} m², intercept = ${sci(fit.c, 3)} m², R² = ${fit.r2.toFixed(5)}`),
        stepT('Wavelength from slope:', R`\lambda = \frac{\text{slope}}{4R} = \frac{${sciTex(fit.m, 4)}}{4\times${P.R}} = ${sciTex(lamG, 4)}\ \text{m} = ${(lamG * 1e9).toFixed(1)}\ \text{nm}`)
      ];
      if (pairs.length) steps.push(stepT(`Difference formula with p = ${P.p} (pairs: ${pairs.map(x => `n=${x.n}→${x.n + P.p}`).join(', ')}):`, R`\lambda = \frac{D_{n+${P.p}}^2 - D_n^2}{4\cdot${P.p}\cdot R} \Rightarrow \bar\lambda = ${(lamF * 1e9).toFixed(1)}\ \text{nm}`));
      const lmax = Math.max(...xs);
      return {
        meta: { v: lamG, fit }, headline: `λ = ${(lamG * 1e9).toFixed(1)} nm`, sub: 'Wavelength of sodium light (from graph slope)',
        results: [resRow('λ (graph)', (lamG * 1e9).toFixed(2) + ' nm'), resRow('λ (difference formula)', isFinite(lamF) ? (lamF * 1e9).toFixed(2) + ' nm' : 'need pairs n, n+p'), resRow('Slope 4λR', sci(fit.m, 4) + ' m²'), resRow('Linearity R²', fit.r2.toFixed(5)), resRow('% error', errLine(lamG * 1e9, 589.3, 'nm'))],
        steps, charts: [{ title: 'D² versus ring number n', spec: { datasets: [{ label: 'Measured D²', data: rs.map(x => ({ x: x.n, y: (x.L - x.Rr) ** 2 * 1e-4 })), color: PAL.violet, line: false }, { label: 'Least-squares fit', data: [{ x: 0, y: fit.c }, { x: lmax + 1, y: fit.m * (lmax + 1) + fit.c }], color: PAL.cyan, points: false, dashed: true }], x: { title: 'Ring number n', min: 0 }, y: { title: 'D² (m²)' } } }]
      };
    }
  };
})();

/* 2. Single-slit diffraction */
(() => {
  const r = seeded(22), lam = 632.8e-9, a = 1e-4, rows = [];
  [[1.0, 4], [0.8, 3]].forEach(([D, nmax]) => { for (let n = 1; n <= nmax; n++) rows.push({ n, D, X: rnd(2 * n * lam * D / a * 1e3 + (r() - .5) * .25, 2) }); });
  WS.diffraction = {
    params: [{ k: 'a', label: 'Slit width a', unit: 'mm', val: 0.10 }],
    tables: [{ k: 't', title: 'Positions of minima', cols: [{ k: 'n', label: 'Order n' }, { k: 'D', label: 'Distance D (m)' }, { k: 'X', label: '2xₙ between nth minima (mm)' }], derived: [{ label: 'xₙ (mm)', f: x => x.X / 2, d: 2 }, { label: 'λ = a xₙ/(nD) (nm)', f: (x, P) => P.a * 1e-3 * (x.X / 2e3) / (x.n * x.D) * 1e9, d: 1 }] }],
    sample: { params: { a: 0.10 }, tables: { t: rows } },
    calc(T, P) {
      const rs = T.t.filter(x => x.n > 0 && x.D > 0 && x.X > 0);
      if (!rs.length) throw 'Enter at least one row with n, D and 2xₙ.';
      if (!(P.a > 0)) throw 'Slit width must be positive.';
      const a = P.a * 1e-3, ls = rs.map(x => a * (x.X / 2e3) / (x.n * x.D));
      const lm = mean(ls), sd = stdev(ls);
      const fit = rs.length >= 2 ? linfit(rs.map(x => x.n * x.D), rs.map(x => x.X / 2e3)) : null;
      const lf = fit ? fit.m * a : NaN;
      const D0 = rs[0].D, xr = 3.6 * lm * D0 / a * 1e3;
      const Ifn = xm => { const th = Math.atan(xm * 1e-3 / D0), b = Math.PI * a * Math.sin(th) / lm; return b === 0 ? 1 : (Math.sin(b) / b) ** 2; };
      const r0 = rs[0];
      const steps = [stepT(`Sample row: n = ${r0.n}, D = ${r0.D} m, xₙ = ${(r0.X / 2).toFixed(2)} mm`, R`\lambda = \frac{a\,x_n}{nD} = \frac{${P.a}\times10^{-3}\times${(r0.X / 2e3).toExponential(3).replace('e', '\\times10^{') + '}'}}{${r0.n}\times${r0.D}} = ${(ls[0] * 1e9).toFixed(1)}\ \text{nm}`),
        stepT(`Mean of ${ls.length} readings: λ̄ = ${(lm * 1e9).toFixed(1)} nm, standard deviation = ${(sd * 1e9).toFixed(1)} nm`)];
      if (fit) steps.push(stepT(`Graph of xₙ vs nD: slope = λ/a = ${sci(fit.m, 4)}, so λ = slope × a = ${(lf * 1e9).toFixed(1)} nm (R² = ${fit.r2.toFixed(4)})`));
      return {
        meta: { v: lm, rs, a }, headline: `λ = ${(lm * 1e9).toFixed(1)} nm`, sub: 'Wavelength of He-Ne laser (mean of readings)',
        results: [resRow('Mean λ', (lm * 1e9).toFixed(2) + ' nm'), resRow('Std deviation', (sd * 1e9).toFixed(2) + ' nm'), resRow('λ from graph', isFinite(lf) ? (lf * 1e9).toFixed(2) + ' nm' : '—'), resRow('Central max width (D=' + D0 + ' m)', (2 * lm * D0 / a * 1e3).toFixed(2) + ' mm'), resRow('% error', errLine(lm * 1e9, 632.8, 'nm'))],
        steps, charts: [
          { title: 'xₙ versus n·D', spec: { datasets: [{ label: 'Measured xₙ', data: rs.map(x => ({ x: x.n * x.D, y: x.X / 2 })), color: PAL.pink, line: false }, ...(fit ? [{ label: 'Fit', data: [{ x: 0, y: fit.c * 1e3 }, { x: Math.max(...rs.map(x => x.n * x.D)) * 1.1, y: (fit.m * Math.max(...rs.map(x => x.n * x.D)) * 1.1 + fit.c) * 1e3 }], color: PAL.cyan, points: false, dashed: true }] : [])], x: { title: 'n·D (m)', min: 0 }, y: { title: 'xₙ (mm)', min: 0 } } },
          { title: `Intensity profile I/I₀ for λ̄ at D = ${D0} m`, spec: { datasets: [{ label: 'I/I₀ = (sin β/β)²', data: fnPoints(Ifn, -xr, xr, 400), color: PAL.red, points: false, fill: true }, { label: 'Measured minima', data: rs.filter(x => x.D === D0).flatMap(x => [{ x: x.X / 2, y: 0 }, { x: -x.X / 2, y: 0 }]), color: PAL.cyan, line: false, r: 5 }], x: { title: 'x on screen (mm)' }, y: { title: 'I / I₀', min: 0, max: 1.05 } } }
        ]
      };
    }
  };
})();

/* Helper: knee voltage from linear part of an I-V curve */
function kneeFit(rs, frac = .3) {
  const Imax = Math.max(...rs.map(x => x.I));
  let lin = rs.filter(x => x.I >= frac * Imax);
  if (lin.length < 2) lin = rs.slice(-2);
  const fit = linfit(lin.map(x => x.V), lin.map(x => x.I));
  return { fit, lin, Vk: fit ? -fit.c / fit.m : NaN, Imax };
}

/* 3. LED */
WS.led = {
  params: [{ k: 'lam', label: 'Peak wavelength of LED λ', unit: 'nm', val: 630 }],
  tables: [{ k: 't', title: 'Forward characteristic', cols: [{ k: 'V', label: 'Voltage V (V)' }, { k: 'I', label: 'Current I (mA)' }], derived: [{ label: 'Power P (mW)', f: x => x.V * x.I, d: 2 }] }],
  sample: { params: { lam: 630 }, tables: { t: [[0, 0], [1, 0], [1.4, 0], [1.6, .05], [1.7, .3], [1.75, .9], [1.8, 2.1], [1.85, 4], [1.9, 6.3], [1.95, 8.8], [2, 11.4], [2.05, 14], [2.1, 16.7]].map(([V, I]) => ({ V, I })) } },
  calc(T, P) {
    const rs = T.t.filter(x => isFinite(x.V) && isFinite(x.I)).sort((a, b) => a.V - b.V);
    if (rs.length < 3) throw 'Enter at least three (V, I) readings.';
    const k = kneeFit(rs); if (!k.fit || k.fit.m <= 0) throw 'Could not identify a rising linear region; check the readings.';
    const h = PHYS.e * k.Vk * P.lam * 1e-9 / PHYS.c, rd = 1 / k.fit.m * 1e3;
    const Vmax = Math.max(...rs.map(x => x.V));
    return {
      meta: { v: h, Vk: k.Vk, lam: P.lam }, headline: `V_k = ${k.Vk.toFixed(3)} V`, sub: 'Knee (threshold) voltage of the LED',
      results: [resRow('Knee voltage V_k', k.Vk.toFixed(3) + ' V'), resRow('Dynamic resistance r_d', rd.toFixed(2) + ' Ω'), resRow('Photon energy hc/λ', (1240 / P.lam).toFixed(3) + ' eV'), resRow('h = eV_kλ/c', sci(h, 3) + ' J s'), resRow('% error in h', errLine(h / 1e-34, 6.626, '× 10⁻³⁴ J s'))],
      steps: [stepT(`Linear region (I ≥ 30 % of I_max = ${k.Imax} mA): ${k.lin.length} points; fit I = ${k.fit.m.toFixed(2)} V ${k.fit.c >= 0 ? '+' : '−'} ${Math.abs(k.fit.c).toFixed(2)} (mA)`),
      stepT('Extrapolate to I = 0:', R`V_k = -\frac{c}{m} = \frac{${Math.abs(k.fit.c).toFixed(2)}}{${k.fit.m.toFixed(2)}} = ${k.Vk.toFixed(3)}\ \text{V}`),
      stepT('Planck’s constant estimate:', R`h = \frac{eV_k\lambda}{c} = \frac{1.602\times10^{-19}\times${k.Vk.toFixed(3)}\times${P.lam}\times10^{-9}}{2.998\times10^{8}} = ${sciTex(h, 3)}\ \text{J s}`),
      stepT('Dynamic resistance from the slope of the linear part:', R`r_d = \frac{\Delta V}{\Delta I} = \frac{1}{${k.fit.m.toFixed(2)}\ \text{mA/V}} = ${rd.toFixed(2)}\ \Omega`)],
      charts: [{ title: 'Forward I–V characteristic', spec: { datasets: [{ label: 'Measured', data: rs.map(x => ({ x: x.V, y: x.I })), color: PAL.red, smooth: true }, { label: 'Tangent to linear part', data: [{ x: k.Vk, y: 0 }, { x: Vmax, y: k.fit.m * Vmax + k.fit.c }], color: PAL.amber, points: false, dashed: true }, { label: 'V_k', data: [{ x: k.Vk, y: 0 }], color: PAL.cyan, line: false, r: 6 }], x: { title: 'Forward voltage V (V)', min: 0 }, y: { title: 'Current I (mA)', min: 0 } } }]
    };
  }
};

/* 4. PN junction diode */
WS.diode = {
  params: [],
  tables: [
    { k: 'f', title: 'Forward bias', cols: [{ k: 'V', label: 'V_F (V)' }, { k: 'I', label: 'I_F (mA)' }], derived: [{ label: 'R = V/I (Ω)', f: x => x.I > 0 ? x.V / x.I * 1e3 : NaN, d: 1 }] },
    { k: 'r', title: 'Reverse bias', cols: [{ k: 'V', label: 'V_R (V)' }, { k: 'I', label: 'I_R (µA)' }], derived: [{ label: 'R = V/I (MΩ)', f: x => x.I > 0 ? x.V / x.I : NaN, d: 2 }] }
  ],
  sample: { params: {}, tables: { f: [[0, 0], [.1, 0], [.2, 0], [.3, 0], [.4, 0], [.5, .01], [.55, .02], [.6, .05], [.65, .4], [.7, 1.8], [.72, 3.9], [.74, 7.2], [.76, 11.8], [.78, 17.6]].map(([V, I]) => ({ V, I })), r: [[0, 0], [1, .2], [2, .35], [4, .5], [6, .6], [8, .7], [10, .8], [12, .9]].map(([V, I]) => ({ V, I })) } },
  calc(T) {
    const f = T.f.filter(x => isFinite(x.V) && isFinite(x.I)).sort((a, b) => a.V - b.V), r = T.r.filter(x => isFinite(x.V) && isFinite(x.I)).sort((a, b) => a.V - b.V);
    if (f.length < 3) throw 'Enter at least three forward-bias readings.';
    const k = kneeFit(f); if (!k.fit || k.fit.m <= 0) throw 'Forward readings do not show a rising linear region.';
    const rd = 1 / k.fit.m * 1e3, last = f[f.length - 1], Rs = last.V / last.I * 1e3;
    let rr = NaN, rfit = null; if (r.length >= 3) { const rl = r.filter(x => x.V >= r[Math.floor(r.length / 3)].V); rfit = linfit(rl.map(x => x.V), rl.map(x => x.I)); if (rfit && rfit.m > 0) rr = 1 / rfit.m; }
    const rlast = r.length ? r[r.length - 1] : null;
    const Vmax = last.V;
    return {
      meta: { v: k.Vk, k, rd }, headline: `V_k = ${k.Vk.toFixed(3)} V`, sub: 'Knee (cut-in) voltage of the silicon diode',
      results: [resRow('Knee voltage', k.Vk.toFixed(3) + ' V'), resRow('Dynamic resistance r_d', rd.toFixed(2) + ' Ω'), resRow(`Static R at ${last.V} V`, Rs.toFixed(1) + ' Ω'), resRow('Reverse dynamic R', isFinite(rr) ? rr.toFixed(1) + ' MΩ' : '—'), resRow('Reverse static R', rlast && rlast.I > 0 ? (rlast.V / rlast.I).toFixed(1) + ' MΩ at ' + rlast.V + ' V' : '—')],
      steps: [stepT(`Forward linear region (${k.lin.length} points): I = ${k.fit.m.toFixed(1)} V ${k.fit.c >= 0 ? '+' : '−'} ${Math.abs(k.fit.c).toFixed(2)} mA`, R`V_k = -\frac{c}{m} = ${k.Vk.toFixed(3)}\ \text{V}`),
      stepT('Dynamic resistance:', R`r_d = \frac{\Delta V}{\Delta I} = \frac{1}{${k.fit.m.toFixed(1)}\ \text{mA V}^{-1}} = ${rd.toFixed(2)}\ \Omega`),
      stepT(`Static resistance at the last reading (${last.V} V, ${last.I} mA):`, R`R_{dc} = \frac{V}{I} = \frac{${last.V}}{${last.I}\times10^{-3}} = ${Rs.toFixed(1)}\ \Omega`),
      ...(isFinite(rr) ? [stepT(`Reverse bias: slope of I_R vs V_R in the saturation region = ${rfit.m.toFixed(4)} µA/V`, R`R_{rev} = \frac{\Delta V_R}{\Delta I_R} = ${rr.toFixed(1)}\ \text{M}\Omega`)] : [])],
      charts: [
        { title: 'Forward characteristic (1st quadrant)', spec: { datasets: [{ label: 'I_F', data: f.map(x => ({ x: x.V, y: x.I })), color: PAL.blue, smooth: true }, { label: 'Tangent', data: [{ x: k.Vk, y: 0 }, { x: Vmax, y: k.fit.m * Vmax + k.fit.c }], color: PAL.amber, points: false, dashed: true }], x: { title: 'V_F (V)', min: 0 }, y: { title: 'I_F (mA)', min: 0 } } },
        ...(r.length ? [{ title: 'Reverse characteristic (3rd quadrant)', spec: { datasets: [{ label: 'I_R', data: r.map(x => ({ x: -x.V, y: -x.I })), color: PAL.green, smooth: true }], x: { title: 'V_R (V)' }, y: { title: 'I_R (µA)' } } }] : [])
      ]
    };
  }
};

/* 5. Photoelectric */
(() => {
  const nz = [.007, -.008, .006, -.006, .006];
  const rows = [578.0, 546.1, 435.8, 404.7, 365.0].map((l, i) => ({ lam: l, V0: rnd(1239.84 / l - 1.80 + nz[i], 3) }));
  WS.photo = {
    params: [],
    tables: [{ k: 't', title: 'Stopping potential for each filter', cols: [{ k: 'lam', label: 'Wavelength λ (nm)' }, { k: 'V0', label: 'Stopping potential V₀ (V)' }], derived: [{ label: 'ν = c/λ (× 10¹⁴ Hz)', f: x => PHYS.c / (x.lam * 1e-9) / 1e14, d: 4 }] }],
    sample: { params: {}, tables: { t: rows } },
    calc(T) {
      const rs = T.t.filter(x => x.lam > 0 && isFinite(x.V0));
      if (rs.length < 2) throw 'Enter at least two filters (λ and V₀).';
      const xs = rs.map(x => PHYS.c / (x.lam * 1e-9)), ys = rs.map(x => x.V0);
      const fit = linfit(xs, ys); if (!fit) throw 'Wavelengths must be different.';
      const h = PHYS.e * fit.m, phi = -fit.c, nu0 = -fit.c / fit.m;
      const xmax = Math.max(...xs) * 1.05;
      return {
        meta: { v: h, fit, rs }, headline: `h = ${sci(h, 3)} J s`, sub: 'Planck’s constant (slope × e)',
        results: [resRow('Slope h/e', sci(fit.m, 4) + ' V s'), resRow('Planck’s constant h', sci(h, 4) + ' J s'), resRow('Work function φ', phi.toFixed(3) + ' eV'), resRow('Threshold frequency ν₀', sci(nu0, 3) + ' Hz'), resRow('Threshold wavelength λ₀', (PHYS.c / nu0 * 1e9).toFixed(0) + ' nm'), resRow('% error in h', errLine(h / 1e-34, 6.626, '× 10⁻³⁴ J s'))],
        steps: [stepT(`Least-squares line through ${rs.length} points: V₀ = (${sci(fit.m, 4)}) ν ${fit.c >= 0 ? '+' : '−'} ${Math.abs(fit.c).toFixed(4)}, R² = ${fit.r2.toFixed(5)}`),
        stepT('Planck’s constant from the slope:', R`h = e\times\text{slope} = 1.602\times10^{-19}\times${sciTex(fit.m, 4)} = ${sciTex(h, 4)}\ \text{J s}`),
        stepT('Work function from the intercept:', R`\phi = -e\,c \;\Rightarrow\; \phi = ${phi.toFixed(3)}\ \text{eV} = ${sciTex(phi * PHYS.e, 3)}\ \text{J}`),
        stepT('Threshold frequency:', R`\nu_0 = \frac{\phi}{h} = ${sciTex(nu0, 3)}\ \text{Hz},\quad \lambda_0 = \frac{c}{\nu_0} = ${(PHYS.c / nu0 * 1e9).toFixed(0)}\ \text{nm}`)],
        charts: [{ title: 'Stopping potential V₀ versus frequency ν', spec: { datasets: [{ label: 'Measured V₀', data: rs.map((x, i) => ({ x: xs[i], y: x.V0 })), color: PAL.cyan, line: false }, { label: 'Fit (slope = h/e)', data: [{ x: Math.min(nu0, Math.min(...xs)) * .98, y: fit.m * Math.min(nu0, Math.min(...xs)) * .98 + fit.c }, { x: xmax, y: fit.m * xmax + fit.c }], color: PAL.violet, points: false, dashed: true }, { label: 'ν₀ (threshold)', data: [{ x: nu0, y: 0 }], color: PAL.amber, line: false, r: 6 }], x: { title: 'Frequency ν (Hz)' }, y: { title: 'V₀ (V)' } } }]
      };
    }
  };
})();

/* 6. Bar pendulum */
(() => {
  const r = seeded(66), g = 9.80, K = 1 / Math.sqrt(12), rows = [];
  [1, -1].forEach(s => { for (let c = 45; c >= 5; c -= 5) { const l = c / 100, t = 20 * 2 * Math.PI * Math.sqrt((K * K + l * l) / (g * l)); rows.push({ l: s * c, t1: rnd(t + (r() - .5) * .16, 2), t2: rnd(t + (r() - .5) * .16, 2) }); } });
  WS.pendulum = {
    params: [{ k: 'N', label: 'Oscillations timed (N)', unit: '', val: 20 }],
    tables: [{ k: 't', title: 'Time periods (side A: +l, side B: −l)', cols: [{ k: 'l', label: 'Distance from G, l (cm)' }, { k: 't1', label: 't₁ for N osc (s)' }, { k: 't2', label: 't₂ for N osc (s)' }], derived: [{ label: 'T (s)', f: (x, P) => (x.t1 + x.t2) / 2 / P.N, d: 4 }, { label: 'T²l (m s²)', f: (x, P) => ((x.t1 + x.t2) / 2 / P.N) ** 2 * Math.abs(x.l) / 100, d: 4 }, { label: 'l² (m²)', f: x => (x.l / 100) ** 2, d: 4 }] }],
    sample: { params: { N: 20 }, tables: { t: rows } },
    calc(T, P) {
      const rs = T.t.filter(x => isFinite(x.l) && x.l !== 0 && x.t1 > 0).map(x => ({ l: x.l, T: ((x.t1 + (x.t2 > 0 ? x.t2 : x.t1)) / 2) / P.N }));
      if (rs.length < 3) throw 'Enter at least three holes (l and times).';
      if (!(P.N > 0)) throw 'N must be positive.';
      const fit = linfit(rs.map(x => (x.l / 100) ** 2), rs.map(x => x.T ** 2 * Math.abs(x.l) / 100));
      if (!fit || fit.m <= 0) throw 'Data do not give a positive slope; check readings.';
      const g = 4 * Math.PI ** 2 / fit.m, K = fit.c > 0 ? Math.sqrt(fit.c / fit.m) : NaN;
      // graphical method
      const sorted = rs.slice().sort((a, b) => a.l - b.l), Tmin = Math.min(...rs.map(x => x.T));
      const outer = [sorted[0], sorted[sorted.length - 1]].map(x => x.T), Ts = +(Tmin + 0.6 * (Math.min(...outer) - Tmin)).toFixed(3);
      const cross = []; for (let i = 1; i < sorted.length; i++) { const a = sorted[i - 1], b = sorted[i]; if (Math.sign(a.l) !== Math.sign(b.l)) continue; if ((a.T - Ts) * (b.T - Ts) <= 0 && a.T !== b.T) cross.push(a.l + (Ts - a.T) * (b.l - a.l) / (b.T - a.T)); }
      let gGraph = NaN, Lg = NaN;
      if (cross.length === 4) { cross.sort((a, b) => a - b); Lg = ((cross[2] - cross[0]) + (cross[3] - cross[1])) / 2 / 100; gGraph = 4 * Math.PI ** 2 * Lg / (Ts * Ts); }
      const Tf = l => 2 * Math.PI * Math.sqrt((K * K + l * l) / (g * Math.abs(l)));
      const lmax = Math.max(...rs.map(x => Math.abs(x.l))) / 100;
      const curveA = isFinite(K) ? fnPoints(l => Tf(l), .03, lmax + .02, 120).map(p => ({ x: p.x * 100, y: p.y })) : [];
      const steps = [stepT(`Linearised plot y = T²l against x = l² (${rs.length} points): slope = ${fit.m.toFixed(4)} s² m⁻¹, intercept = ${fit.c.toFixed(5)} m s², R² = ${fit.r2.toFixed(5)}`),
      stepT('Acceleration due to gravity:', R`g = \frac{4\pi^2}{\text{slope}} = \frac{39.478}{${fit.m.toFixed(4)}} = ${g.toFixed(3)}\ \text{m s}^{-2}`),
      stepT('Radius of gyration about G:', R`K = \sqrt{\frac{\text{intercept}}{\text{slope}}} = ${isFinite(K) ? (K * 100).toFixed(2) : '—'}\ \text{cm}`)];
      if (isFinite(gGraph)) steps.push(stepT(`Graphical method: horizontal line at T = ${Ts} s cuts the W-curve at ${cross.map(c => c.toFixed(1)).join(', ')} cm`, R`L = \frac{AC + BD}{2} = ${(Lg * 100).toFixed(2)}\ \text{cm},\quad g = \frac{4\pi^2L}{T^2} = ${gGraph.toFixed(3)}\ \text{m s}^{-2}`));
      return {
        meta: { v: g, fit, rs }, headline: `g = ${g.toFixed(3)} m/s²`, sub: 'Acceleration due to gravity (least squares)',
        results: [resRow('g (T²l vs l²)', g.toFixed(3) + ' m s⁻²'), resRow('g (W-curve method)', isFinite(gGraph) ? gGraph.toFixed(3) + ' m s⁻²' : 'need 4 crossings'), resRow('Radius of gyration K', isFinite(K) ? (K * 100).toFixed(2) + ' cm' : '—'), resRow('Minimum period', isFinite(K) ? (2 * Math.PI * Math.sqrt(2 * K / g)).toFixed(3) + ' s at l = K' : '—'), resRow('% error', errLine(g, 9.81, 'm s⁻²'))],
        steps, charts: [
          { title: 'T versus distance from G (W-curve)', spec: { datasets: [{ label: 'Measured T', data: rs.map(x => ({ x: x.l, y: x.T })), color: PAL.green, line: false }, { label: 'Fitted theory (side A)', data: curveA, color: PAL.cyan, points: false }, { label: 'Fitted theory (side B)', data: curveA.map(p => ({ x: -p.x, y: p.y })), color: PAL.cyan, points: false }, { label: `T = ${Ts} s line`, data: [{ x: -lmax * 100 - 3, y: Ts }, { x: lmax * 100 + 3, y: Ts }], color: PAL.amber, points: false, dashed: true }], x: { title: 'l (cm)  — side B negative' }, y: { title: 'T (s)' } } },
          { title: 'T²l versus l² (linear method)', spec: { datasets: [{ label: 'T²l', data: rs.map(x => ({ x: (x.l / 100) ** 2, y: x.T ** 2 * Math.abs(x.l) / 100 })), color: PAL.violet, line: false }, { label: 'Fit', data: [{ x: 0, y: fit.c }, { x: lmax * lmax * 1.05, y: fit.m * lmax * lmax * 1.05 + fit.c }], color: PAL.cyan, points: false, dashed: true }], x: { title: 'l² (m²)', min: 0 }, y: { title: 'T²l (m s²)', min: 0 } } }
        ]
      };
    }
  };
})();

/* 7. Solar cell */
(() => {
  const r = seeded(77), m = solarModel({ G: 800, T: 25, R: 4 }), rows = [{ V: 0, I: rnd(m.Isc * 1e3, 1) }];
  [.1, .2, .3, .35, .4, .42, .44, .46, .48, .5, .52, .54, .56, .58].forEach(V => rows.push({ V, I: rnd(Math.max(0, m.Icell(V) * 1e3 + (r() - .5) * .4), 1) }));
  rows.push({ V: rnd(m.Voc, 3), I: 0 });
  WS.solar = {
    params: [{ k: 'E', label: 'Irradiance on cell E', unit: 'W/m²', val: 800 }, { k: 'A', label: 'Active area A', unit: 'cm²', val: 4 }],
    tables: [{ k: 't', title: 'V–I readings with varying load', cols: [{ k: 'V', label: 'Voltage V (V)' }, { k: 'I', label: 'Current I (mA)' }], derived: [{ label: 'P = VI (mW)', f: x => x.V * x.I, d: 2 }, { label: 'R_L = V/I (Ω)', f: x => x.I > 0 ? x.V / x.I * 1e3 : NaN, d: 2 }] }],
    sample: { params: { E: 800, A: 4 }, tables: { t: rows } },
    calc(T, P) {
      const rs = T.t.filter(x => isFinite(x.V) && isFinite(x.I) && x.V >= 0 && x.I >= 0).sort((a, b) => a.V - b.V);
      if (rs.length < 3) throw 'Enter at least three (V, I) readings.';
      let Isc = rs[0].V === 0 ? rs[0].I : rs[0].I + (rs[1].I - rs[0].I) / (rs[1].V - rs[0].V) * (0 - rs[0].V);
      const lst = rs[rs.length - 1], pr = rs[rs.length - 2];
      let Voc = lst.I === 0 ? lst.V : lst.V + (0 - lst.I) * (lst.V - pr.V) / (lst.I - pr.I);
      let best = rs[0]; rs.forEach(x => { if (x.V * x.I > best.V * best.I) best = x; });
      const Pm = best.V * best.I, FF = Pm / (Voc * Isc), Pin = P.E * P.A * 1e-4 * 1e3, eta = Pm / Pin * 100;
      return {
        meta: { v: eta, best, FF, Pin }, headline: `FF = ${FF.toFixed(3)}, η = ${eta.toFixed(2)} %`, sub: 'Fill factor and efficiency of the solar cell',
        results: [resRow('Open-circuit voltage V_oc', Voc.toFixed(3) + ' V'), resRow('Short-circuit current I_sc', Isc.toFixed(2) + ' mA'), resRow('V_m, I_m', `${best.V} V, ${best.I} mA`), resRow('P_max', Pm.toFixed(2) + ' mW'), resRow('Fill factor', FF.toFixed(3)), resRow('Input power P_in', Pin.toFixed(1) + ' mW'), resRow('Efficiency η', eta.toFixed(2) + ' %'), resRow('Optimum load', (best.V / best.I * 1e3).toFixed(2) + ' Ω')],
        steps: [stepT(`From the table: I_sc = ${Isc.toFixed(2)} mA (V = 0), V_oc = ${Voc.toFixed(3)} V (I = 0). Maximum product V × I occurs at V_m = ${best.V} V, I_m = ${best.I} mA.`),
        stepT('Fill factor:', R`FF = \frac{V_mI_m}{V_{oc}I_{sc}} = \frac{${best.V}\times${best.I}}{${Voc.toFixed(3)}\times${Isc.toFixed(2)}} = ${FF.toFixed(3)}`),
        stepT('Input power:', R`P_{in} = E\,A = ${P.E}\ \text{W m}^{-2}\times${P.A}\times10^{-4}\ \text{m}^2 = ${Pin.toFixed(1)}\ \text{mW}`),
        stepT('Efficiency:', R`\eta = \frac{P_{max}}{P_{in}}\times100 = \frac{${Pm.toFixed(2)}}{${Pin.toFixed(1)}}\times100 = ${eta.toFixed(2)}\ \%`)],
        charts: [{ title: 'I–V and P–V characteristics', spec: { datasets: [{ label: 'Current I (mA)', data: rs.map(x => ({ x: x.V, y: x.I })), color: PAL.amber, smooth: true }, { label: 'Power P (mW)', data: rs.map(x => ({ x: x.V, y: x.V * x.I })), color: PAL.violet, smooth: true, y2: true }, { label: 'MPP', data: [{ x: best.V, y: best.I }], color: PAL.cyan, line: false, r: 7 }], x: { title: 'Voltage V (V)', min: 0 }, y: { title: 'Current I (mA)', min: 0 }, y2: { title: 'Power P (mW)', min: 0 } } }]
      };
    }
  };
})();

/* 8. Sonometer */
(() => {
  const r = seeded(88), f = 256, mm = Math.PI * (0.15e-3) ** 2 * 7850, rows = [];
  [1, 1.5, 2, 2.5, 3, 3.5].forEach(M => { const l = 1 / (2 * f) * Math.sqrt(M * 9.81 / mm) * 100; rows.push({ M, l1: rnd(l + (r() - .5) * .4, 1), l2: rnd(l + (r() - .5) * .4, 1) }); });
  WS.sonometer = {
    params: [{ k: 'd', label: 'Wire diameter d', unit: 'mm', val: 0.30 }, { k: 'rho', label: 'Density of wire ρ', unit: 'kg/m³', val: 7850 }, { k: 'g', label: 'g', unit: 'm/s²', val: 9.81 }],
    tables: [{ k: 't', title: 'Resonating lengths for different loads', cols: [{ k: 'M', label: 'Load M (kg)' }, { k: 'l1', label: 'l₁ increasing (cm)' }, { k: 'l2', label: 'l₂ decreasing (cm)' }], derived: [{ label: 'Mean l (cm)', f: x => (x.l1 + x.l2) / 2, d: 2 }, { label: 'l² (m²)', f: x => ((x.l1 + x.l2) / 200) ** 2, d: 5 }, { label: 'f (Hz)', f: (x, P) => { const m = Math.PI * (P.d / 2e3) ** 2 * P.rho; return 1 / (2 * (x.l1 + x.l2) / 200) * Math.sqrt(x.M * P.g / m); }, d: 1 }] }],
    sample: { params: { d: 0.30, rho: 7850, g: 9.81 }, tables: { t: rows } },
    calc(T, P) {
      const rs = T.t.filter(x => x.M > 0 && x.l1 > 0).map(x => ({ M: x.M, l: (x.l1 + (x.l2 > 0 ? x.l2 : x.l1)) / 2 / 100 }));
      if (!rs.length) throw 'Enter at least one load with its resonating length.';
      if (!(P.d > 0 && P.rho > 0)) throw 'Diameter and density must be positive.';
      const m = Math.PI * (P.d / 2e3) ** 2 * P.rho, fs = rs.map(x => 1 / (2 * x.l) * Math.sqrt(x.M * P.g / m)), fm = mean(fs);
      const fit = rs.length >= 2 ? linfit(rs.map(x => x.M), rs.map(x => x.l * x.l)) : null;
      const fg = fit && fit.m > 0 ? Math.sqrt(P.g / (4 * m * fit.m)) : NaN;
      const r0 = rs[0], Mx = Math.max(...rs.map(x => x.M)) * 1.1;
      return {
        meta: { v: fm, rs, m }, headline: `f = ${fm.toFixed(1)} Hz`, sub: 'Frequency of the tuning fork (mean)',
        results: [resRow('Linear density m', sci(m, 4) + ' kg/m'), resRow('Mean frequency', fm.toFixed(2) + ' Hz'), resRow('Std deviation', stdev(fs).toFixed(2) + ' Hz'), resRow('f from l² vs M graph', isFinite(fg) ? fg.toFixed(2) + ' Hz' : '—'), resRow('M / l² (const.)', mean(rs.map(x => x.M / (x.l * x.l))).toFixed(2) + ' kg m⁻²'), resRow('% error (vs 256 Hz)', errLine(fm, 256, 'Hz'))],
        steps: [stepT('Linear mass density of the wire:', R`m = \pi r^2\rho = \pi\times(${(P.d / 2).toFixed(3)}\times10^{-3})^2\times${P.rho} = ${sciTex(m, 4)}\ \text{kg m}^{-1}`),
        stepT(`First reading: M = ${r0.M} kg, l = ${(r0.l * 100).toFixed(2)} cm`, R`f = \frac{1}{2l}\sqrt{\frac{Mg}{m}} = \frac{1}{2\times${r0.l.toFixed(4)}}\sqrt{\frac{${r0.M}\times${P.g}}{${sciTex(m, 4)}}} = ${fs[0].toFixed(2)}\ \text{Hz}`),
        ...(fit ? [stepT(`Graph of l² vs M: slope = ${sci(fit.m, 4)} m² kg⁻¹ (R² = ${fit.r2.toFixed(5)})`, R`f = \sqrt{\frac{g}{4\,m\,\text{slope}}} = ${isFinite(fg) ? fg.toFixed(2) : '—'}\ \text{Hz}`)] : [])],
        charts: [{ title: 'l² versus load M', spec: { datasets: [{ label: 'l²', data: rs.map(x => ({ x: x.M, y: x.l * x.l })), color: PAL.violet, line: false }, ...(fit ? [{ label: 'Fit', data: [{ x: 0, y: fit.c }, { x: Mx, y: fit.m * Mx + fit.c }], color: PAL.pink, points: false, dashed: true }] : [])], x: { title: 'Load M (kg)', min: 0 }, y: { title: 'l² (m²)', min: 0 } } }]
      };
    }
  };
})();

/* ---------- Workspace rendering ---------- */
function wsState(id) {
  const cfg = WS[id];
  if (!Store.s.ws[id]) Store.s.ws[id] = { params: Object.fromEntries(cfg.params.map(p => [p.k, p.val])), tables: Object.fromEntries(cfg.tables.map(t => [t.k, [blankRow(t), blankRow(t), blankRow(t)]])) };
  return Store.s.ws[id];
}
function blankRow(t) { return Object.fromEntries(t.cols.map(c => [c.k, ''])); }
function numRows(rows) { return rows.map(r => { const o = {}; for (const k in r) o[k] = r[k] === '' || r[k] == null ? NaN : parseFloat(r[k]); return o; }); }
function numParams(p) { const o = {}; for (const k in p) o[k] = parseFloat(p[k]); return o; }

function renderCalcOutput(host, out, idPrefix, opts = {}) {
  host.innerHTML = `<div class="result-box"><h4>${icon('check-circle-2')} Result</h4><div class="big">${out.headline}</div><div class="muted" style="font-size:13px">${out.sub}</div><div class="result-grid">${out.results.map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div></div>
    <div class="grid ${out.charts.length > 1 ? 'g2' : ''}" style="margin-top:18px">${out.charts.map((c, i) => `<div><p class="chart-title">${c.title}</p><div class="chart-box"><canvas id="${idPrefix}c${i}" aria-label="${esc(c.title)}" role="img"></canvas></div>${opts.scale ? `<div class="scale-note">${graphScaleHtml(c.spec)}</div>` : ''}</div>`).join('')}</div>
    ${opts.err ? `<div id="${idPrefix}err" style="margin-top:18px"></div>` : ''}
    <h3 style="font-size:16px;margin:22px 0 10px">Calculation steps</h3><div class="calc-steps">${out.steps.join('')}</div>`;
  renderMath(host); refreshIcons();
  out.charts.forEach((c, i) => plot($('#' + idPrefix + 'c' + i), c.spec));
  if (opts.err) renderErrorCard($('#' + idPrefix + 'err'), opts.err.id, opts.err.T, opts.err.P, out.meta);
}

function renderObservations(e, el) {
  const cfg = WS[e.id];
  const T = {}; cfg.tables.forEach(t => T[t.k] = cfg.sample.tables[t.k]);
  const P = cfg.sample.params;
  let html = `<div class="row" style="margin-bottom:14px"><span class="sample-label">${icon('flask-conical')} Illustrative sample data — realistic values generated for learning, not real measurements</span></div>`;
  if (cfg.params.length) html += `<div class="row" style="margin-bottom:14px">${cfg.params.map(p => `<span class="tag violet">${p.label} = ${P[p.k]} ${p.unit}</span>`).join('')}</div>`;
  cfg.tables.forEach(t => {
    html += `<h3 style="font-size:16px;margin:14px 0 10px">${t.title}</h3><div class="table-wrap"><table class="data"><thead><tr><th>#</th>${t.cols.map(c => `<th>${c.label}</th>`).join('')}${t.derived.map(d => `<th>${d.label}</th>`).join('')}</tr></thead><tbody>` +
      T[t.k].map((r, i) => `<tr><td class="dim">${i + 1}</td>${t.cols.map(c => `<td>${r[c.k]}</td>`).join('')}${t.derived.map(d => `<td class="calc">${fx(d.f(r, P), d.d)}</td>`).join('')}</tr>`).join('') + `</tbody></table></div>`;
  });
  html += `<div class="callout amber" style="margin-top:16px"><b>Graph:</b> ${e.graphNote}</div><div id="obsOut" style="margin-top:18px"></div>`;
  el.innerHTML = html;
  try { renderCalcOutput($('#obsOut', el), cfg.calc(T, P), 'obs', { scale: true, err: { id: e.id, T, P } }); } catch (err) { $('#obsOut', el).innerHTML = `<div class="err">${esc(err)}</div>`; }
}

function renderWorkspace(e, el) {
  const cfg = WS[e.id], st = wsState(e.id);
  const draw = () => {
    el.innerHTML = `<div class="row" style="margin-bottom:16px">
      <button class="btn primary" id="wsCalc">${icon('calculator')} Calculate</button>
      <button class="btn" id="wsSample">${icon('flask-conical')} Load sample data</button>
      <button class="btn" id="wsCsv">${icon('download')} Export CSV</button>
      <a class="btn" href="#/record/${e.id}">${icon('file-text')} Lab record</a>
      <span class="spacer"></span>
      <button class="btn danger" id="wsClear">${icon('eraser')} Clear</button></div>
      <p class="muted" style="margin-top:0;font-size:13.5px">Type your own readings — derived columns, result and graphs update automatically. Your data is saved in this browser.</p>
      ${cfg.params.length ? `<div class="params">${cfg.params.map(p => `<div class="field"><label for="wp-${p.k}">${p.label}${p.unit ? ' (' + p.unit + ')' : ''}</label><input class="input mono" id="wp-${p.k}" data-p="${p.k}" type="number" step="any" inputmode="decimal" value="${st.params[p.k] ?? ''}"></div>`).join('')}</div>` : ''}
      ${cfg.tables.map(t => `<h3 style="font-size:16px;margin:16px 0 10px">${t.title}</h3><div class="table-wrap"><table class="data" data-t="${t.k}"><thead><tr><th>#</th>${t.cols.map(c => `<th>${c.label}</th>`).join('')}${t.derived.map(d => `<th>${d.label}</th>`).join('')}<th></th></tr></thead><tbody>
        ${st.tables[t.k].map((r, i) => `<tr data-i="${i}"><td class="dim">${i + 1}</td>${t.cols.map(c => `<td><input type="number" step="any" inputmode="decimal" data-c="${c.k}" value="${r[c.k] ?? ''}" aria-label="${esc(c.label)} row ${i + 1}"></td>`).join('')}${t.derived.map((d, j) => `<td class="calc" data-d="${j}">—</td>`).join('')}<td class="act"><button class="row-del" data-del="${i}" aria-label="Delete row ${i + 1}">${icon('x')}</button></td></tr>`).join('')}
      </tbody></table></div><button class="btn sm ghost" style="margin-top:8px" data-add="${t.k}">${icon('plus')} Add row</button>`).join('')}
      <div id="wsOut" style="margin-top:22px"></div>`;
    refreshIcons(); updateDerived(); calc(false);
  };
  const updateDerived = () => {
    const P = numParams(st.params);
    cfg.tables.forEach(t => { const tb = $(`table[data-t="${t.k}"]`, el); numRows(st.tables[t.k]).forEach((r, i) => t.derived.forEach((d, j) => { const c = $(`tr[data-i="${i}"] td[data-d="${j}"]`, tb); if (c) { const v = d.f(r, P); c.textContent = isFinite(v) ? fx(v, d.d) : '—'; } })); });
  };
  const calc = (explicit) => {
    destroyCharts();
    const out = $('#wsOut', el);
    const T = {}; cfg.tables.forEach(t => T[t.k] = numRows(st.tables[t.k]));
    const anyData = Object.values(T).some(rows => rows.some(r => Object.values(r).some(isFinite)));
    if (!anyData) { out.innerHTML = `<div class="empty">${icon('table-2')}<div>Enter readings above or load the sample data to see results and graphs.</div></div>`; refreshIcons(); return; }
    try { const NP = numParams(st.params); renderCalcOutput(out, cfg.calc(T, NP), 'ws', { scale: true, err: { id: e.id, T, P: NP } }); if (explicit) { setSection(e.id, 'workspace', true); toast('Calculated'); updateTabChecks && updateTabChecks(); } }
    catch (err) { out.innerHTML = `<div class="err">${icon('alert-triangle')} ${esc(typeof err === 'string' ? err : 'Calculation error: ' + err.message)}</div>`; refreshIcons(); }
  };
  let tmr = null;
  el.oninput = ev => {
    const t = ev.target;
    if (t.dataset.p) st.params[t.dataset.p] = t.value;
    else if (t.dataset.c) { const tk = t.closest('table').dataset.t, i = +t.closest('tr').dataset.i; st.tables[tk][i][t.dataset.c] = t.value; }
    else return;
    saveSoon(); updateDerived(); clearTimeout(tmr); tmr = setTimeout(() => calc(false), 450);
  };
  el.onclick = async ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.id === 'wsCalc') calc(true);
    else if (b.id === 'wsSample') { st.params = { ...cfg.sample.params }; cfg.tables.forEach(t => st.tables[t.k] = cfg.sample.tables[t.k].map(r => Object.fromEntries(t.cols.map(c => [c.k, String(r[c.k])])))); Store.save(); draw(); toast('Sample data loaded'); }
    else if (b.id === 'wsClear') { if (await confirmModal('Clear workspace?', 'All readings for this experiment will be removed.', 'Clear')) { delete Store.s.ws[e.id]; Store.save(); Object.assign(st, wsState(e.id)); draw(); } }
    else if (b.id === 'wsCsv') {
      const P = numParams(st.params); let csv = `PhysLab — ${e.title}\n`; cfg.params.forEach(p => csv += `${p.label} (${p.unit}),${st.params[p.k]}\n`);
      cfg.tables.forEach(t => { csv += `\n${t.title}\n` + [...t.cols.map(c => c.label), ...t.derived.map(d => d.label)].map(s => `"${s}"`).join(',') + '\n'; numRows(st.tables[t.k]).forEach(r => csv += [...t.cols.map(c => isFinite(r[c.k]) ? r[c.k] : ''), ...t.derived.map(d => { const v = d.f(r, P); return isFinite(v) ? fx(v, d.d) : ''; })].join(',') + '\n'); });
      download(`physlab-${e.id}-readings.csv`, csv, 'text/csv'); toast('CSV exported', 'download');
    }
    else if (b.dataset.add) { const t = cfg.tables.find(t => t.k === b.dataset.add); st.tables[t.k].push(blankRow(t)); Store.save(); draw(); const tb = $(`table[data-t="${t.k}"]`, el); const ins = $$('tr:last-child input', tb); ins[0] && ins[0].focus(); }
    else if (b.dataset.del != null) { const tk = b.closest('table').dataset.t; st.tables[tk].splice(+b.dataset.del, 1); if (!st.tables[tk].length) st.tables[tk].push(blankRow(cfg.tables.find(t => t.k === tk))); Store.save(); draw(); }
  };
  draw();
}
