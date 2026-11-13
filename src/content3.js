/* ---------- Experiment content: 5 Photoelectric Effect, 6 Bar Pendulum ---------- */
EXPS.push({
  id: 'photo', num: 5, title: 'Photoelectric Effect', subtitle: 'Planck’s constant and work function', icon: 'zap',
  color: '#22d3ee', color2: '#818cf8', topic: 'Modern Physics · Quantum',
  aim: 'To determine Planck’s constant and the work function of the photocathode material by measuring the stopping potential for light of different frequencies using a photocell.',
  apparatus: ['Vacuum photocell (photo-emissive tube)', 'Mercury vapour lamp (or LED/halogen source)', 'Set of colour filters (365, 405, 436, 546, 578 nm)', 'Variable DC retarding-voltage supply (0–3 V)', 'Digital voltmeter', 'Sensitive nano/microammeter', 'Connecting wires and dark enclosure'],
  principle: R`<p>When light of frequency \(\nu\) above a <b>threshold frequency</b> \(\nu_0\) falls on a metal surface, electrons are emitted instantaneously. According to Einstein, light consists of photons of energy \(h\nu\); a photon gives all its energy to a single electron, part of which is used to overcome the <b>work function</b> \(\phi\) and the rest appears as kinetic energy:</p>
  $$h\nu = \phi + \tfrac{1}{2}mv_{max}^2$$
  <p>If a retarding potential is applied to the anode, the photocurrent falls to zero at the <b>stopping potential</b> \(V_0\), where \(eV_0 = \tfrac12mv_{max}^2\). Hence</p>
  $$V_0 = \frac{h}{e}\,\nu - \frac{\phi}{e}$$
  <p>A graph of \(V_0\) against \(\nu\) is a straight line of slope \(h/e\).</p>`,
  theory: R`<h3>Laws of photoelectric emission</h3>
  <ol><li>For a given metal there is a minimum (threshold) frequency \(\nu_0\) below which no emission occurs, however intense the light.</li><li>The photocurrent (number of electrons per second) is proportional to the intensity of light.</li><li>The maximum kinetic energy of photoelectrons depends linearly on frequency and is independent of intensity.</li><li>Emission is instantaneous (≈ 10⁻⁹ s), with no time lag.</li></ol>
  <p>These cannot be explained by the classical wave theory, but follow naturally from the photon picture.</p>
  <h3>Photocurrent vs anode potential</h3>
  <p>As the anode is made more positive, the current increases to a <b>saturation value</b> when all emitted electrons are collected. As it is made negative (retarding), fewer electrons reach the anode; the current becomes zero at \(-V_0\).</p>
  <ul><li>Increasing <b>intensity</b> (same ν): higher saturation current, same \(V_0\).</li><li>Increasing <b>frequency</b> (same intensity): larger \(V_0\).</li></ul>`,
  derivation: R`<h3>Einstein’s photoelectric equation</h3>
  <p>Energy conservation for one photon absorbed by one electron:</p>
  $$h\nu = \phi + K_{max},\qquad \phi = h\nu_0$$
  <p>An electron leaving the cathode with kinetic energy \(K_{max}\) moving against a retarding potential \(V\) loses energy \(eV\). It just fails to reach the anode when</p>
  $$eV_0 = K_{max} = h\nu - \phi$$
  <div class="formula-box">$$V_0 = \left(\frac{h}{e}\right)\nu - \frac{\phi}{e}$$</div>
  <p>Comparing with \(y = mx + c\):</p>
  <ul><li>Slope \(m = h/e \;\Rightarrow\; h = e\times m\)</li><li>y-intercept \(c = -\phi/e \;\Rightarrow\; \phi = -e\,c\) (in eV: \(\phi = -c\))</li><li>x-intercept (V₀ = 0) gives threshold frequency \(\nu_0 = \phi/h\), threshold wavelength \(\lambda_0 = c/\nu_0\)</li></ul>
  <p>The frequency of each filter is \(\nu = c/\lambda\). Expected slope: \(h/e = 4.136\times10^{-15}\) V s.</p>`,
  formulas: [
    { name: 'Einstein’s photoelectric equation', tex: R`h\nu = \phi + \tfrac{1}{2}mv_{max}^2`, desc: 'One photon ejects one electron.', vars: [['h', 'Planck’s constant', 'J s'], ['ν', 'Frequency of light', 'Hz'], ['φ', 'Work function', 'J or eV']] },
    { name: 'Stopping potential', tex: R`eV_0 = \tfrac{1}{2}mv_{max}^2`, desc: 'Retarding potential that stops the fastest electrons.', vars: [['V_0', 'Stopping potential', 'V']] },
    { name: 'Linear relation (graph)', tex: R`V_0 = \frac{h}{e}\nu - \frac{\phi}{e}`, desc: 'Slope h/e, intercept −φ/e.', vars: [] },
    { name: 'Planck’s constant from slope', tex: R`h = e \times \text{slope}`, desc: 'Slope of V₀ vs ν graph.', vars: [] },
    { name: 'Threshold frequency', tex: R`\nu_0 = \frac{\phi}{h},\quad \lambda_0 = \frac{hc}{\phi}`, desc: 'No emission for ν < ν₀ (λ > λ₀).', vars: [] },
    { name: 'Frequency from wavelength', tex: R`\nu = \frac{c}{\lambda}`, desc: 'c = 2.998 × 10⁸ m/s.', vars: [] }
  ],
  procedure: [
    'Place the photocell in the dark enclosure facing the lamp; switch on the mercury lamp and let it stabilise for ~10 minutes.',
    'Connect the photocell: cathode to the positive and anode to the negative of the variable supply (retarding mode), with the microammeter in series and voltmeter across the tube.',
    'Insert the first filter (e.g. 578 nm yellow). With zero retarding voltage, note the photocurrent.',
    'Increase the retarding voltage slowly until the photocurrent just becomes zero. Record this voltage as the stopping potential V₀.',
    'Repeat for the other filters (546, 436, 405, 365 nm).',
    'Optionally, for one filter record I versus V for two light intensities (by changing the distance) to verify that V₀ is independent of intensity.',
    'Calculate ν = c/λ for each filter, plot V₀ versus ν and determine the slope and intercepts.',
    'Compute h = e × slope, φ = −e × intercept, and the threshold frequency ν₀.'
  ],
  precautions: ['The photocell should be shielded from stray light.', 'Allow the lamp to warm up for a steady output.', 'Increase the retarding potential slowly near the stopping point.', 'Zero the microammeter before each set of readings (dark current).', 'Use filters with narrow pass-bands and keep them clean.', 'Do not look directly at the mercury lamp (UV radiation).'],
  errors: ['Dark current and leakage current in the photocell', 'Contact potential difference between anode and cathode shifts V₀ (affects φ, not h)', 'Finite filter bandwidth', 'Photoemission from the anode (reverse current)'],
  graphNote: 'Plot stopping potential V₀ (y-axis) versus frequency ν (x-axis). The straight line has slope h/e. Extend it to cut the ν-axis at the threshold frequency ν₀; the V₀-axis intercept is −φ/e.',
  keyValues: [['h (standard)', '6.626 × 10⁻³⁴ J s'], ['h/e', '4.136 × 10⁻¹⁵ V s'], ['Hg lines', '365, 405, 436, 546, 578 nm'], ['1 eV', '1.602 × 10⁻¹⁹ J'], ['V₀ depends on', 'Frequency only']],
  resultLabel: 'Planck’s constant', standard: 6.626e-34, standardUnit: 'J s',
  viva: [
    ['What is the photoelectric effect?', 'The emission of electrons from a metal surface when light (electromagnetic radiation) of sufficiently high frequency falls on it.'],
    ['Define work function.', 'The minimum energy required to remove an electron from the surface of a metal. It is characteristic of the metal (e.g. Cs ≈ 2.1 eV, Na ≈ 2.3 eV, Cu ≈ 4.7 eV).'],
    ['What is threshold frequency?', 'The minimum frequency of incident light below which no photoelectrons are emitted, however intense the light is. ν₀ = φ/h.'],
    ['What is stopping potential?', 'The minimum negative (retarding) potential applied to the anode at which the photocurrent becomes zero. It measures the maximum kinetic energy: eV₀ = K_max.'],
    ['State Einstein’s photoelectric equation.', 'hν = φ + ½mv²_max, i.e. the photon energy equals the work function plus the maximum kinetic energy of the emitted electron.'],
    ['Does the stopping potential depend on intensity?', 'No. Intensity changes only the number of photons (and hence photocurrent), not the energy of each photon. V₀ depends only on frequency and the metal.'],
    ['How does photocurrent depend on intensity?', 'The saturation photocurrent is directly proportional to the intensity of light (for ν > ν₀), since more photons eject more electrons.'],
    ['Why could the wave theory not explain the photoelectric effect?', 'Wave theory predicts that energy depends on intensity, that any frequency should work given enough intensity, and that there should be a time lag. Experiments show a threshold frequency, KE independent of intensity, and instantaneous emission.'],
    ['How is Planck’s constant obtained from the graph?', 'The graph of V₀ versus ν is a straight line with slope h/e. Hence h = e × slope.'],
    ['What do the intercepts of the V₀–ν graph represent?', 'The ν-intercept is the threshold frequency ν₀; the V₀-intercept is −φ/e, giving the work function.'],
    ['Is the slope of the V₀–ν graph the same for all metals?', 'Yes, slope = h/e is a universal constant. Only the intercepts (work function and threshold) change from metal to metal, giving parallel lines.'],
    ['What is a photocell? Name its parts.', 'An evacuated glass bulb containing a large semicylindrical photocathode coated with a low work-function material and a thin wire anode at its axis. Light ejects electrons from the cathode which are collected by the anode.'],
    ['Why are alkali metals used as photocathodes?', 'They have low work functions (≈ 2 eV), so they emit electrons with visible light.'],
    ['Why is saturation current reached at high anode potential?', 'At sufficiently high positive potential, all the electrons emitted per second are collected by the anode, so the current cannot increase further.'],
    ['Why does current flow even at zero anode potential?', 'Photoelectrons are emitted with kinetic energy, so some reach the anode without any accelerating potential.'],
    ['What are the applications of photocells?', 'Burglar and fire alarms, automatic door openers, light meters in cameras, reproduction of sound from films, counting devices and street-light automation.'],
    ['What is the energy of a photon of wavelength 500 nm?', 'E = hc/λ = (6.626 × 10⁻³⁴ × 3 × 10⁸)/(500 × 10⁻⁹) ≈ 3.98 × 10⁻¹⁹ J ≈ 2.48 eV.'],
    ['What is the dual nature of light?', 'Light shows wave properties (interference, diffraction) and particle properties (photoelectric effect, Compton effect). The photoelectric effect is direct evidence of its particle (photon) nature.']
  ]
});

EXPS.push({
  id: 'pendulum', num: 6, title: 'Bar Pendulum', subtitle: 'Acceleration due to gravity', icon: 'timer',
  color: '#34d399', color2: '#22d3ee', topic: 'Mechanics · Oscillations',
  aim: 'To determine the acceleration due to gravity (g) and the radius of gyration (K) of a bar about its centre of gravity using a compound (bar) pendulum.',
  apparatus: ['Bar pendulum (≈ 1 m long, holes every 5 cm)', 'Knife-edge and rigid wall bracket', 'Stopwatch (LC 0.01 s)', 'Metre scale', 'Spirit level', 'Graph sheets'],
  principle: R`<p>A rigid body capable of oscillating freely about a fixed horizontal axis is a <b>compound pendulum</b>. For small oscillations about an axis at distance \(l\) from the centre of gravity, the motion is simple harmonic with period</p>
  $$T = 2\pi\sqrt{\frac{K^2 + l^2}{g\,l}}$$
  <p>where \(K\) is the radius of gyration about a parallel axis through the centre of gravity. This equals the period of a simple pendulum of <b>equivalent length</b> \(L = l + K^2/l\), so</p>
  $$g = \frac{4\pi^2L}{T^2}$$`,
  theory: R`<h3>Equation of motion</h3>
  <p>When the bar of mass \(m\) is displaced by angle \(\theta\), gravity produces a restoring torque \(\tau = -mgl\sin\theta \approx -mgl\theta\). With moment of inertia \(I\) about the axis:</p>
  $$I\frac{d^2\theta}{dt^2} = -mgl\,\theta$$
  <p>By the parallel-axis theorem \(I = I_G + ml^2 = m(K^2 + l^2)\). This is SHM with \(\omega^2 = \dfrac{gl}{K^2 + l^2}\).</p>
  <h3>Centres of suspension and oscillation</h3>
  <p>For a given T there are two distances \(l_1\) and \(l_2\) on each side of G satisfying \(l^2 - Ll + K^2 = 0\), so</p>
  $$l_1 + l_2 = L,\qquad l_1l_2 = K^2$$
  <p>The point of suspension and the <b>centre of oscillation</b> (at \(L\) from the pivot) are interchangeable — the period is the same about either.</p>
  <h3>Minimum time period</h3>
  <p>\(T\) is minimum when \(dT/dl = 0\), i.e. at \(l = K\): \(T_{min} = 2\pi\sqrt{2K/g}\). The graph of \(T\) versus \(l\) (both sides of G) is therefore a symmetric <b>W-shaped</b> curve.</p>`,
  derivation: R`<h3>Graphical method (T vs distance)</h3>
  <p>Plot T against the distance of the knife-edge from G (positive on one side, negative on the other). Draw a horizontal line for a chosen period T cutting the curve at A, B (one side) and C, D (other side), in order A, B, C, D. Then</p>
  $$L = \frac{AC + BD}{2},\qquad g = \frac{4\pi^2L}{T^2},\qquad K = \frac{\sqrt{AD \cdot BC}}{2}$$
  <h3>Linear (least-squares) method</h3>
  <p>Squaring the period equation and multiplying by \(l\):</p>
  $$T^2 l = \frac{4\pi^2}{g}\,l^2 + \frac{4\pi^2K^2}{g}$$
  <p>So a plot of \(y = T^2l\) against \(x = l^2\) is a straight line with</p>
  <div class="formula-box">$$g = \frac{4\pi^2}{\text{slope}},\qquad K = \sqrt{\frac{\text{intercept}}{\text{slope}}}$$</div>
  <p>For a uniform bar of length \(\ell\), \(K = \ell/\sqrt{12}\) (≈ 28.9 cm for a 1 m bar), which can be used to check the result.</p>`,
  formulas: [
    { name: 'Period of compound pendulum', tex: R`T = 2\pi\sqrt{\frac{K^2 + l^2}{g\,l}}`, desc: 'Small oscillations about an axis at distance l from G.', vars: [['K', 'Radius of gyration about G', 'm'], ['l', 'Distance of pivot from G', 'm']] },
    { name: 'Equivalent simple pendulum length', tex: R`L = l + \frac{K^2}{l}`, desc: 'Distance from pivot to centre of oscillation.', vars: [['L', 'Equivalent length', 'm']] },
    { name: 'Acceleration due to gravity', tex: R`g = \frac{4\pi^2 L}{T^2}`, desc: 'L from the graph at chosen T.', vars: [['g', 'Acceleration due to gravity', 'm s⁻²']] },
    { name: 'Linearised form', tex: R`T^2l = \frac{4\pi^2}{g}l^2 + \frac{4\pi^2K^2}{g}`, desc: 'Slope 4π²/g, intercept 4π²K²/g.', vars: [] },
    { name: 'Interchangeable points', tex: R`l_1 + l_2 = L,\quad l_1 l_2 = K^2`, desc: 'Same period about two points on one side.', vars: [] },
    { name: 'Minimum period', tex: R`T_{min} = 2\pi\sqrt{\frac{2K}{g}}\ \text{at}\ l = K`, desc: 'Bottom of the W-curve.', vars: [] },
    { name: 'Uniform bar radius of gyration', tex: R`K = \frac{\ell}{\sqrt{12}}`, desc: 'About the centre, for a thin uniform bar of length ℓ.', vars: [] }
  ],
  procedure: [
    'Balance the bar on a knife-edge to locate its centre of gravity G; mark it.',
    'Fix the knife-edge in the first hole near one end (side A) and suspend the bar from the rigid bracket; ensure the knife-edge is horizontal using the spirit level.',
    'Displace the bar through a small angle (< 5°) and release so it oscillates in a vertical plane without wobbling.',
    'Measure the time for 20 oscillations twice and take the mean; compute T = t/20.',
    'Measure the distance l from G to the knife-edge (inner edge of the hole in contact).',
    'Repeat for successive holes on side A up to the hole nearest G, then invert the bar and repeat for side B.',
    'Plot T versus l with side A positive and side B negative to get the W-shaped curve; also plot T²l versus l².',
    'Find L from the graph for two chosen periods and compute g; find K. Compare with the least-squares result.'
  ],
  precautions: ['Amplitude of oscillation must be small (< 5°) for SHM.', 'The knife-edge must be horizontal and the bar should oscillate in a vertical plane without twisting.', 'Start the stopwatch at an extreme or mean position consistently; count oscillations carefully.', 'Measure l from the knife-edge contact to G.', 'The support must be rigid; avoid air draughts.', 'Do not use holes very close to G where T becomes very large and damping is significant.'],
  errors: ['Reaction time in starting/stopping the stopwatch (reduced by timing 20 oscillations)', 'Finite amplitude (period increases by ~θ₀²/16)', 'Friction at the knife-edge and air resistance', 'Error in locating G'],
  graphNote: 'Plot T (y-axis) versus distance l from G (x-axis, side A positive, side B negative): a symmetric W-shaped curve with minima at l = ±K. Also plot T²l vs l²: a straight line with slope 4π²/g.',
  keyValues: [['g (standard)', '9.81 m s⁻²'], ['K for 1 m bar', '≈ 0.289 m'], ['T_min', 'at l = K'], ['Oscillations timed', '20'], ['Amplitude', '< 5°']],
  resultLabel: 'Acceleration due to gravity', standard: 9.81, standardUnit: 'm s⁻²',
  viva: [
    ['What is a compound pendulum?', 'A rigid body of any shape free to oscillate about a fixed horizontal axis passing through it. Its mass is distributed, unlike an ideal simple pendulum.'],
    ['Why is the bar pendulum preferred over a simple pendulum?', 'It is a real rigid body (no massless string assumption), its length can be measured precisely, it has no string stretching, and the period has a minimum, enabling a graphical method that cancels errors.'],
    ['What is radius of gyration?', 'The distance K from the axis at which the whole mass of the body may be assumed concentrated so that I = MK². For a uniform bar about its centre, K = ℓ/√12.'],
    ['What is the equivalent length of a simple pendulum?', 'The length of a simple pendulum having the same period as the compound pendulum: L = l + K²/l.'],
    ['What are the centre of suspension and the centre of oscillation?', 'The centre of suspension is the point through which the axis of rotation passes. The centre of oscillation lies on the line through G at distance L from it. The two are interchangeable — the period is the same about either.'],
    ['Why is the graph of T versus l W-shaped?', 'T is very large as l → 0 (pivot near G) and increases slowly at large l, with a minimum at l = K on each side. Plotting both sides of G gives two symmetric U-shaped branches forming a W.'],
    ['At what point is the time period minimum? What is its value?', 'When the pivot is at distance K from G; T_min = 2π√(2K/g).'],
    ['What happens to the period if the bar is suspended at G?', 'With l = 0, the gravitational torque is zero; the bar stays in neutral equilibrium and does not oscillate (T → ∞).'],
    ['Why should the amplitude be small?', 'The derivation uses sin θ ≈ θ; only then is the motion simple harmonic and the period independent of amplitude.'],
    ['Why do we time 20 oscillations instead of one?', 'To reduce the effect of human reaction time error in starting and stopping the stopwatch, and to increase the precision of T.'],
    ['How many points have the same time period?', 'Four points — two on each side of G (at l₁ and l₂ with l₁l₂ = K²), lying on a line through G.'],
    ['Does the period depend on the mass of the bar?', 'No. Mass cancels in T = 2π√(I/mgl) since I = m(K² + l²); the period depends only on the mass distribution (K) and l.'],
    ['What is Kater’s pendulum?', 'A reversible compound pendulum with two knife-edges and adjustable masses; when the periods about both edges are equal, the distance between edges equals L, giving g very accurately.'],
    ['How does g vary on the Earth?', 'g increases from the equator (≈ 9.78 m/s²) to the poles (≈ 9.83 m/s²) due to Earth’s rotation and oblateness, and decreases with altitude and depth.'],
    ['What will be the period on the Moon?', 'Larger, since g_moon ≈ g/6, so T increases by a factor √6 ≈ 2.45.'],
    ['State the parallel axis theorem.', 'The moment of inertia about any axis equals the moment of inertia about a parallel axis through the centre of mass plus Mh², where h is the distance between the axes: I = I_G + Mh².'],
    ['What is the effect of air resistance and friction at the knife-edge?', 'They cause damping (decrease of amplitude). For light damping the period is almost unchanged, but large damping slightly increases it.']
  ]
});
