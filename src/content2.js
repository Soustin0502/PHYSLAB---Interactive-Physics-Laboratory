/* ---------- Experiment content: 3 LED, 4 PN Junction Diode ---------- */
EXPS.push({
  id: 'led', num: 3, title: 'LED Characteristics', subtitle: 'V-I characteristics of a light emitting diode', icon: 'lightbulb',
  color: '#fb7185', color2: '#fbbf24', topic: 'Semiconductors · Optoelectronics',
  aim: 'To study the forward V-I characteristics of a light emitting diode (LED), determine its knee (threshold) voltage, and estimate Planck’s constant from the threshold voltage and emission wavelength.',
  apparatus: ['LEDs (red ≈ 630 nm; optionally green, yellow, blue)', 'Regulated DC power supply (0–5 V)', 'Current-limiting resistor (≈ 330–470 Ω) or rheostat', 'DC voltmeter (0–5 V)', 'DC milliammeter (0–25 mA)', 'Breadboard and connecting wires'],
  principle: R`<p>An LED is a heavily doped <b>p-n junction</b> made of a <b>direct band-gap</b> semiconductor (GaAs, GaAsP, GaP, InGaN …). When it is forward biased, electrons from the n-region and holes from the p-region are injected across the junction. They <b>recombine radiatively</b>: an electron falls from the conduction band to the valence band and the energy is emitted as a photon (electroluminescence):</p>
  $$h\nu \approx E_g \quad\Rightarrow\quad \lambda = \frac{hc}{E_g}$$
  <p>Appreciable current (and light) flows only after the applied voltage exceeds the <b>knee (threshold) voltage</b> \(V_k\), which is approximately \(E_g/e\).</p>`,
  theory: R`<h3>Current–voltage relation</h3>
  <p>Like any p-n junction, the LED obeys the Shockley diode equation</p>
  $$I = I_s\left(e^{\,eV/\eta k_BT} - 1\right)$$
  <p>where \(I_s\) is the reverse saturation current, \(\eta\) the ideality factor (1–2) and \(k_BT/e \approx 25.85\) mV at 300 K. The current is negligible below \(V_k\) and rises steeply (exponentially) above it.</p>
  <h3>Knee voltage and colour</h3>
  <p>A photon of wavelength \(\lambda\) needs an electron energy of at least \(hc/\lambda\), so \(eV_k \approx hc/\lambda\). Shorter wavelength (higher energy) LEDs therefore have higher knee voltages:</p>
  <ul><li>Infrared (GaAs, ~940 nm): ≈ 1.2 V</li><li>Red (GaAsP/AlGaInP, ~630 nm): ≈ 1.8 V</li><li>Yellow (~590 nm): ≈ 2.0 V</li><li>Green (GaP/InGaN, ~565 nm): ≈ 2.1–2.2 V</li><li>Blue (InGaN, ~470 nm): ≈ 2.7–3.0 V</li></ul>
  <h3>Direct vs indirect band gap</h3>
  <p>In direct band-gap materials (GaAs) the conduction-band minimum and valence-band maximum occur at the same crystal momentum, so recombination emits a photon efficiently. In indirect materials (Si, Ge) momentum conservation requires a phonon, and the energy is released mostly as heat — hence Si and Ge are not used for LEDs.</p>`,
  derivation: R`<h3>Determination of knee voltage</h3>
  <p>The steep, nearly linear portion of the forward characteristic is extended back to meet the voltage axis. The intercept is the knee voltage \(V_k\). If the linear part is \(I = m(V - V_k)\), then</p>
  $$V_k = -\frac{c}{m}\quad\text{for a fitted line } I = mV + c$$
  <h3>Estimating Planck’s constant</h3>
  <p>At threshold, the electrical energy given to each electron equals the photon energy:</p>
  $$eV_k = h\nu = \frac{hc}{\lambda}$$
  <div class="formula-box">$$h = \frac{e\,V_k\,\lambda}{c}$$</div>
  <p>With several LEDs, a graph of \(V_k\) versus \(1/\lambda\) is a straight line of slope \(hc/e\), so \(h = e\times\text{slope}/c\). (Losses in the junction make \(eV_k\) slightly less than \(E_g\); the estimate is typically within 5–10 % of \(6.626\times10^{-34}\) J s.)</p>
  <h3>Dynamic and static resistance</h3>
  $$r_d = \frac{\Delta V}{\Delta I}\quad\text{(slope of linear part)},\qquad R_{s} = \frac{V}{I}$$
  <p>Band gap and wavelength are related by the convenient form \(\lambda(\text{nm}) \approx 1240 / E_g(\text{eV})\).</p>`,
  formulas: [
    { name: 'Photon energy – band gap', tex: R`E_g \approx h\nu = \frac{hc}{\lambda}`, desc: 'Energy released per radiative recombination.', vars: [['E_g', 'Band-gap energy', 'J (or eV)'], ['λ', 'Peak emission wavelength', 'm']] },
    { name: 'Planck’s constant from LED', tex: R`h = \frac{e V_k \lambda}{c}`, desc: 'eV_k ≈ hc/λ at threshold.', vars: [['V_k', 'Knee voltage', 'V'], ['e', '1.602 × 10⁻¹⁹ C', 'C'], ['c', '2.998 × 10⁸ m/s', 'm s⁻¹']] },
    { name: 'Wavelength–energy shortcut', tex: R`\lambda\,(\text{nm}) \approx \frac{1240}{E_g\,(\text{eV})}`, desc: 'Quick conversion.', vars: [] },
    { name: 'Diode (Shockley) equation', tex: R`I = I_s\left(e^{eV/\eta k_BT}-1\right)`, desc: 'Forward current rises exponentially above threshold.', vars: [['I_s', 'Saturation current', 'A'], ['η', 'Ideality factor', '—']] },
    { name: 'Dynamic resistance', tex: R`r_d = \frac{\Delta V}{\Delta I}`, desc: 'Inverse slope of the linear part of the I-V curve.', vars: [] }
  ],
  procedure: [
    'Connect the circuit: power supply → resistor → milliammeter → LED (anode to + side); connect the voltmeter directly across the LED.',
    'Ensure the LED is forward biased (longer lead / anode towards positive terminal).',
    'Start with supply at zero. Increase the voltage in small steps (0.1 V near the knee) and note the LED voltage V and current I.',
    'Observe the voltage at which the LED just begins to glow.',
    'Continue until the current reaches about 15–20 mA; do not exceed the rated current.',
    'Repeat for LEDs of other colours (optional) and note their wavelengths from the data sheet.',
    'Plot I (y-axis) versus V (x-axis). Extend the linear portion to meet the V-axis to obtain V_k.',
    'Calculate h = eV_kλ/c and the dynamic resistance from the slope.'
  ],
  precautions: ['Always use a series current-limiting resistor; never connect the LED directly to the supply.', 'Do not exceed the maximum forward current (≈ 20 mA) or apply reverse voltage above ≈ 5 V.', 'Take closely spaced readings near the knee.', 'Voltmeter should be connected directly across the LED.', 'Allow the LED to cool; heating lowers the knee voltage.', 'Note the polarity of the LED and meters carefully.'],
  errors: ['Uncertainty in locating the linear part of the curve', 'LED emission is not perfectly monochromatic (spectral width 20–30 nm)', 'Junction heating at higher currents'],
  graphNote: 'Plot forward current I (mA) versus voltage V (V). The curve is nearly zero until the knee, then rises steeply. The tangent to the linear part meets the voltage axis at V_k.',
  keyValues: [['Red LED V_k', '≈ 1.8 V'], ['Blue LED V_k', '≈ 2.8 V'], ['λ–E shortcut', 'λ(nm) ≈ 1240/E(eV)'], ['Max current', '≈ 20 mA'], ['Material', 'Direct band gap']],
  resultLabel: 'Knee voltage of red LED', standard: null, standardUnit: 'V',
  viva: [
    ['What is an LED?', 'A light emitting diode is a forward-biased p-n junction of a direct band-gap semiconductor that emits light when electrons and holes recombine across the junction.'],
    ['What is electroluminescence?', 'The emission of light from a material when an electric current passes through it, as a result of radiative recombination of electrons and holes.'],
    ['Why are silicon and germanium not used to make LEDs?', 'They are indirect band-gap semiconductors. Recombination needs a phonon to conserve momentum, so the energy is released mostly as heat and light emission is extremely weak.'],
    ['Which materials are used for LEDs of different colours?', 'GaAs (infrared), GaAsP / AlGaInP (red, orange, yellow), GaP (green), InGaN / GaN (blue, green, white with phosphor).'],
    ['What is the knee (threshold) voltage?', 'The forward voltage beyond which the current increases rapidly; it is found by extrapolating the linear part of the I-V curve to the voltage axis. For a red LED it is about 1.8 V.'],
    ['Why do LEDs of different colours have different knee voltages?', 'Each colour corresponds to a different band gap (photon energy = hc/λ). A blue photon has more energy than a red one, so a larger voltage is needed to give each electron that energy.'],
    ['Why is a resistor connected in series with the LED?', 'Above the knee, the LED’s dynamic resistance is very small, so a small increase in voltage causes a large current that can destroy it. The series resistor limits the current.'],
    ['Why is an LED not operated in reverse bias?', 'In reverse bias no carriers are injected so no light is emitted, and LEDs have a low reverse breakdown voltage (≈ 5 V), so they can be damaged.'],
    ['How is the wavelength related to the band gap?', 'λ = hc/E_g, or λ(nm) ≈ 1240/E_g(eV). For example, E_g = 1.97 eV gives about 630 nm (red).'],
    ['How can Planck’s constant be found using LEDs?', 'At threshold eV_k ≈ hc/λ, so h = eV_kλ/c. Using several LEDs, a plot of V_k against 1/λ gives a straight line of slope hc/e.'],
    ['What is the difference between a direct and an indirect band gap?', 'In a direct band gap, the conduction-band minimum and valence-band maximum occur at the same crystal momentum, so an electron can recombine by emitting only a photon. In an indirect gap they are at different momenta and a phonon is also required.'],
    ['What are the advantages of LEDs over incandescent lamps?', 'Low operating voltage and power, high efficiency, long life, fast switching, small size, robustness and nearly monochromatic output.'],
    ['How is a white LED made?', 'Usually a blue InGaN LED coated with a yellow phosphor (Ce:YAG); the blue and yellow light combine to appear white. Alternatively red, green and blue LEDs are combined.'],
    ['Why is the LED chip enclosed in a dome-shaped epoxy lens?', 'Semiconductors have a high refractive index, so much light is trapped by total internal reflection. The dome reduces this loss and directs the light forward.'],
    ['What is the dynamic resistance of an LED?', 'r_d = ΔV/ΔI in the linear region of the characteristic — typically a few ohms to tens of ohms.'],
    ['What is the effect of temperature on the knee voltage?', 'The knee voltage decreases with increasing temperature (about −2 mV/°C) and the emission wavelength shifts slightly towards longer wavelengths.'],
    ['Is the emitted light from an LED coherent?', 'No. LED light comes from spontaneous emission, so it is incoherent with a spectral width of about 20–40 nm, unlike a laser.']
  ]
});

EXPS.push({
  id: 'diode', num: 4, title: 'PN Junction Diode', subtitle: 'Forward and reverse bias characteristics', icon: 'git-commit-horizontal',
  color: '#60a5fa', color2: '#34d399', topic: 'Semiconductors · Junctions',
  aim: 'To study the forward and reverse bias V-I characteristics of a silicon p-n junction diode and to determine its knee voltage, static resistance and dynamic resistance.',
  apparatus: ['Silicon diode (e.g. 1N4007)', 'Regulated DC power supply (0–15 V)', 'Current-limiting resistor (1 kΩ)', 'DC voltmeters (0–1 V and 0–15 V)', 'DC milliammeter (0–30 mA)', 'DC microammeter (0–100 µA)', 'Breadboard and connecting wires'],
  principle: R`<p>A p-n junction is formed when p-type and n-type semiconductors are joined. Diffusion of majority carriers across the junction leaves behind immobile ions, forming a <b>depletion region</b> with a built-in <b>barrier potential</b> (≈ 0.7 V for Si, 0.3 V for Ge).</p>
  <ul><li><b>Forward bias</b> (p to +, n to −): the barrier is lowered, majority carriers cross the junction and the current rises exponentially beyond the knee voltage.</li><li><b>Reverse bias</b> (p to −, n to +): the barrier and depletion width increase; only a tiny, nearly constant <b>reverse saturation current</b> due to minority carriers flows until breakdown.</li></ul>`,
  theory: R`<h3>Diode equation</h3>
  $$I = I_0\left(e^{\,V/\eta V_T} - 1\right),\qquad V_T = \frac{k_BT}{e} \approx 25.85\ \text{mV at } 300\ \text{K}$$
  <p>\(\eta \approx 1\) for Ge and 1–2 for Si. In forward bias with \(V \gg V_T\), \(I \approx I_0e^{V/\eta V_T}\); in reverse bias with \(|V| \gg V_T\), \(I \approx -I_0\).</p>
  <h3>Barrier potential and depletion width</h3>
  $$V_{bi} = \frac{k_BT}{e}\ln\frac{N_AN_D}{n_i^2},\qquad W \propto \sqrt{V_{bi} - V}$$
  <p>Forward bias (V &gt; 0) narrows the depletion region; reverse bias widens it, which is why a reverse-biased diode behaves like a voltage-dependent capacitor (varactor).</p>
  <h3>Breakdown</h3>
  <p>At a large reverse voltage the current increases sharply: <b>Zener breakdown</b> (heavily doped, field emission, &lt; ~5 V) or <b>avalanche breakdown</b> (lightly doped, impact ionisation, higher voltages). A rectifier diode like 1N4007 breaks down at ≈ 1000 V, so breakdown is not reached in this experiment.</p>`,
  derivation: R`<h3>Static (DC) resistance</h3>
  $$R_{dc} = \frac{V}{I}$$
  <h3>Dynamic (AC) resistance</h3>
  <p>Differentiating the diode equation,</p>
  $$\frac{dI}{dV} = \frac{I_0}{\eta V_T}e^{V/\eta V_T} = \frac{I + I_0}{\eta V_T}$$
  <div class="formula-box">$$r_d = \frac{dV}{dI} = \frac{\eta V_T}{I + I_0} \approx \frac{\eta V_T}{I}$$</div>
  <p>Thus at 10 mA, \(r_d \approx 26\ \text{mV}/10\ \text{mA} \approx 2.6\ \Omega\) (η = 1). Experimentally \(r_d = \Delta V/\Delta I\) from the linear region of the forward curve.</p>
  <h3>Knee voltage</h3>
  <p>Extrapolating the linear part of the forward characteristic to the voltage axis gives the knee (cut-in) voltage, ≈ 0.6–0.7 V for silicon.</p>
  <h3>Reverse resistance</h3>
  $$R_{rev} = \frac{V_R}{I_R}\quad(\text{typically several M}\Omega)$$`,
  formulas: [
    { name: 'Shockley diode equation', tex: R`I = I_0\left(e^{V/\eta V_T}-1\right)`, desc: 'Valid in forward and reverse bias (below breakdown).', vars: [['I_0', 'Reverse saturation current', 'A'], ['V_T', 'Thermal voltage k_BT/e', 'V'], ['η', 'Ideality factor', '—']] },
    { name: 'Dynamic resistance', tex: R`r_d = \frac{\Delta V}{\Delta I} \approx \frac{\eta V_T}{I}`, desc: 'Small-signal resistance in forward bias.', vars: [] },
    { name: 'Static resistance', tex: R`R_{dc} = \frac{V}{I}`, desc: 'DC resistance at an operating point.', vars: [] },
    { name: 'Thermal voltage', tex: R`V_T = \frac{k_BT}{e}`, desc: '≈ 25.85 mV at 300 K.', vars: [['k_B', '1.381 × 10⁻²³ J/K', 'J K⁻¹'], ['T', 'Temperature', 'K']] },
    { name: 'Built-in potential', tex: R`V_{bi} = \frac{k_BT}{e}\ln\frac{N_AN_D}{n_i^2}`, desc: 'Barrier potential of the junction.', vars: [['N_A, N_D', 'Doping concentrations', 'm⁻³'], ['n_i', 'Intrinsic carrier concentration', 'm⁻³']] },
    { name: 'Depletion width dependence', tex: R`W \propto \sqrt{V_{bi} - V}`, desc: 'Widens in reverse bias (V < 0).', vars: [] }
  ],
  procedure: [
    '<b>Forward bias:</b> connect supply (+) → 1 kΩ resistor → milliammeter → anode of diode; cathode to supply (−). Connect the 0–1 V voltmeter across the diode.',
    'Increase the supply in small steps; record the diode voltage V_F and current I_F. Take close readings between 0.5 V and 0.75 V.',
    'Stop when the current reaches about 20–25 mA.',
    '<b>Reverse bias:</b> reverse the diode connections (cathode to +), replace the milliammeter with a microammeter and use the 0–15 V voltmeter.',
    'Increase the reverse voltage in steps of 1–2 V up to about 10–12 V and record V_R and I_R (in µA).',
    'Plot the forward and reverse characteristics on the same graph (different scales in the 1st and 3rd quadrants).',
    'Determine the knee voltage, static resistance at a chosen point, dynamic resistance from the slope, and the reverse resistance.'
  ],
  precautions: ['Use a series resistor to limit the current in forward bias.', 'Do not exceed the maximum forward current rating of the diode.', 'In reverse bias use a microammeter and connect the voltmeter across the series combination only if its current is negligible (voltmeter before the µA meter).', 'Take more readings near the knee of the forward curve.', 'Do not reach the breakdown voltage in reverse bias.', 'Check polarities of meters and diode before switching on.'],
  errors: ['Voltmeter current adds to measured reverse current', 'Heating of the junction at high forward currents', 'Meter zero errors'],
  graphNote: 'Forward: I_F (mA) vs V_F (V) — negligible current until ≈ 0.6 V, then a steep rise. Reverse: I_R (µA) vs V_R (V) — small, nearly constant saturation current. Plot forward in the first quadrant and reverse in the third.',
  keyValues: [['Si knee voltage', '≈ 0.7 V'], ['Ge knee voltage', '≈ 0.3 V'], ['V_T at 300 K', '25.85 mV'], ['Reverse current (Si)', 'nA – µA'], ['r_d at 10 mA', '≈ 2.6–5 Ω']],
  resultLabel: 'Knee voltage of Si diode', standard: 0.7, standardUnit: 'V',
  viva: [
    ['What is a p-n junction?', 'A single crystal in which one region is doped p-type and the adjacent region n-type; the boundary between them is the junction, across which a depletion region and barrier potential form.'],
    ['What is the depletion region?', 'A region near the junction depleted of mobile charge carriers, containing only immobile ionised donors (+) on the n-side and acceptors (−) on the p-side, which create an electric field.'],
    ['What is barrier potential? What are its values for Si and Ge?', 'The potential difference across the depletion region that opposes further diffusion of majority carriers. About 0.7 V for silicon and 0.3 V for germanium at room temperature.'],
    ['What is forward bias?', 'Connecting the p-side to the positive terminal and the n-side to the negative terminal. It reduces the barrier and the depletion width, allowing a large majority-carrier current.'],
    ['What is reverse bias?', 'Connecting the p-side to the negative terminal and the n-side to the positive terminal. It increases the barrier and depletion width; only a small minority-carrier current flows.'],
    ['What is the knee (cut-in) voltage?', 'The forward voltage after which the current increases rapidly; obtained by extending the linear part of the forward characteristic to the voltage axis.'],
    ['What is reverse saturation current? On what does it depend?', 'The small, nearly constant reverse current due to thermally generated minority carriers. It depends strongly on temperature (roughly doubling every 10 °C) and not on the reverse voltage.'],
    ['Why is reverse current in silicon much smaller than in germanium?', 'Silicon has a larger band gap (1.12 eV vs 0.66 eV), so far fewer electron-hole pairs are thermally generated, giving nA-level instead of µA-level reverse current.'],
    ['Distinguish between static and dynamic resistance.', 'Static resistance R = V/I at a particular point; dynamic resistance r_d = ΔV/ΔI is the inverse slope of the characteristic at that point and is relevant for small AC signals.'],
    ['What is the ideal value of dynamic resistance at a forward current of 10 mA?', 'r_d ≈ ηV_T/I = 25.85 mV / 10 mA ≈ 2.6 Ω for η = 1 (≈ 5 Ω for η = 2).'],
    ['What is breakdown? Name its types.', 'A sharp increase of reverse current at a certain reverse voltage. Zener breakdown (heavily doped, strong field pulls electrons from bonds) and avalanche breakdown (lightly doped, carriers gain energy and ionise atoms by collision).'],
    ['Why is a microammeter used in reverse bias?', 'Because the reverse saturation current is extremely small (nA to µA), which a milliammeter cannot measure.'],
    ['Why is a resistor used in series with the diode?', 'To limit the forward current, since beyond the knee a small voltage change causes a large current that could destroy the diode.'],
    ['What is the effect of temperature on diode characteristics?', 'The reverse saturation current increases with temperature and the forward voltage for a given current decreases by about 2 mV/°C.'],
    ['Write the diode equation and explain the terms.', 'I = I₀(e^(V/ηV_T) − 1), where I₀ is the reverse saturation current, V the applied voltage, η the ideality factor and V_T = k_BT/e the thermal voltage.'],
    ['What are the applications of a p-n junction diode?', 'Rectifiers, clippers and clampers, voltage multipliers, switches, protection circuits, detectors in radios, and (as Zener) voltage regulators.'],
    ['Why does the depletion layer behave as a capacitor?', 'It is an insulating region between two conducting regions with stored opposite charges; its width varies with reverse voltage, giving a voltage-dependent junction (transition) capacitance.'],
    ['What is meant by an ideal diode?', 'A diode with zero resistance (short circuit) in forward bias and infinite resistance (open circuit) in reverse bias, with zero knee voltage.']
  ]
});
