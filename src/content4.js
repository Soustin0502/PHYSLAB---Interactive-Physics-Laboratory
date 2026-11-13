/* ---------- Experiment content: 7 Solar Cell, 8 Sonometer ---------- */
EXPS.push({
  id: 'solar', num: 7, title: 'Solar Cell', subtitle: 'V-I characteristics, fill factor and efficiency', icon: 'sun',
  color: '#fbbf24', color2: '#f97316', topic: 'Semiconductors · Photovoltaics',
  aim: 'To study the V-I and power characteristics of a solar cell under illumination and to determine its open-circuit voltage, short-circuit current, maximum power, fill factor and efficiency.',
  apparatus: ['Silicon solar cell / small panel (known active area)', 'Light source (halogen lamp 100–150 W) or sunlight', 'Lux meter or pyranometer (to measure irradiance)', 'Variable load resistance (decade box / rheostat, 0–1 kΩ)', 'DC voltmeter (0–2 V)', 'DC milliammeter (0–200 mA)', 'Metre scale and connecting wires'],
  principle: R`<p>A solar cell is a large-area <b>p-n junction</b> that converts light directly into electricity by the <b>photovoltaic effect</b>. Photons with \(h\nu > E_g\) create electron-hole pairs in and near the depletion region. The built-in electric field <b>separates</b> them — electrons drift to the n-side and holes to the p-side — producing a photo-voltage across the cell. When a load is connected, a current flows through it.</p>
  <p>The cell works in the <b>fourth quadrant</b> of the diode characteristic: the current flows opposite to the diode forward current, so the cell <b>delivers</b> power.</p>`,
  theory: R`<h3>I-V relation of an illuminated cell</h3>
  $$I = I_L - I_0\left(e^{\,V/\eta V_T} - 1\right)$$
  <p>where \(I_L\) is the light-generated current (∝ irradiance), \(I_0\) the dark saturation current and \(V_T = k_BT/e\).</p>
  <ul><li><b>Short-circuit current</b> (V = 0): \(I_{sc} = I_L\)</li><li><b>Open-circuit voltage</b> (I = 0): \(V_{oc} = \eta V_T\ln\!\left(\dfrac{I_L}{I_0} + 1\right)\)</li></ul>
  <h3>Maximum power point</h3>
  <p>Power \(P = VI\) is zero at both ends of the characteristic and has a maximum \(P_{max} = V_mI_m\) at the knee of the I-V curve. The load at which this occurs is \(R_{opt} = V_m/I_m\).</p>
  <h3>Fill factor and efficiency</h3>
  <p>The <b>fill factor</b> is the ratio of the area of the largest rectangle that fits under the I-V curve to the rectangle \(V_{oc}\times I_{sc}\). Typical silicon cells: FF ≈ 0.70–0.85. The <b>efficiency</b> is the ratio of maximum electrical output to incident light power on the cell.</p>`,
  derivation: R`<h3>Fill factor</h3>
  <div class="formula-box">$$FF = \frac{P_{max}}{V_{oc}\,I_{sc}} = \frac{V_m I_m}{V_{oc}\,I_{sc}}$$</div>
  <h3>Efficiency</h3>
  <p>If the irradiance on the cell is \(E\) (W m⁻²) and the active area is \(A\) (m²), the incident power is \(P_{in} = E\,A\). Then</p>
  <div class="formula-box">$$\eta = \frac{P_{max}}{P_{in}}\times100\% = \frac{FF\,V_{oc}\,I_{sc}}{E\,A}\times100\%$$</div>
  <h3>Condition for maximum power</h3>
  <p>Setting \(\dfrac{dP}{dV} = \dfrac{d(VI)}{dV} = 0\) gives \(I + V\dfrac{dI}{dV} = 0\), i.e. at the maximum power point the load resistance equals the magnitude of the cell’s dynamic resistance:</p>
  $$R_{L} = \frac{V_m}{I_m} = -\frac{dV}{dI}$$
  <p>Lux to irradiance (approximate, for sunlight): 1 W m⁻² ≈ 120 lux; for a halogen lamp a calibrated pyranometer is preferred.</p>`,
  formulas: [
    { name: 'Illuminated cell I-V', tex: R`I = I_L - I_0\left(e^{V/\eta V_T}-1\right)`, desc: 'Photocurrent minus diode current.', vars: [['I_L', 'Light-generated current', 'A'], ['I_0', 'Dark saturation current', 'A']] },
    { name: 'Open-circuit voltage', tex: R`V_{oc} = \eta V_T \ln\!\left(\frac{I_L}{I_0}+1\right)`, desc: 'Increases logarithmically with intensity.', vars: [] },
    { name: 'Fill factor', tex: R`FF = \frac{V_m I_m}{V_{oc}I_{sc}}`, desc: 'Squareness of the I-V curve (0.7–0.85 for Si).', vars: [['V_m, I_m', 'Voltage and current at maximum power', 'V, A']] },
    { name: 'Efficiency', tex: R`\eta = \frac{P_{max}}{P_{in}}\times 100 = \frac{V_mI_m}{E\,A}\times100`, desc: 'Incident power = irradiance × area.', vars: [['E', 'Irradiance', 'W m⁻²'], ['A', 'Active area', 'm²']] },
    { name: 'Maximum power', tex: R`P_{max} = V_m I_m = FF\,V_{oc}I_{sc}`, desc: 'Peak of P–V curve.', vars: [] },
    { name: 'Optimum load', tex: R`R_{opt} = \frac{V_m}{I_m}`, desc: 'Load for maximum power transfer.', vars: [] }
  ],
  procedure: [
    'Mount the solar cell facing the lamp at a fixed distance (or in direct sunlight); measure the irradiance on the cell with the lux meter/pyranometer and note the cell area.',
    'Connect the solar cell, milliammeter and variable load resistance in series; connect the voltmeter across the cell.',
    'Open the circuit (R = ∞) and note the open-circuit voltage V_oc.',
    'Set the load to zero (short circuit through the ammeter) and note the short-circuit current I_sc.',
    'Vary the load resistance in steps from zero to a large value, noting V and I for each setting. Take more readings near the knee of the curve.',
    'Calculate the power P = VI for each reading.',
    'Plot I versus V and P versus V. Locate P_max and the corresponding V_m and I_m.',
    'Calculate the fill factor and efficiency; optionally repeat at another light intensity.'
  ],
  precautions: ['Keep the distance and orientation of the lamp fixed throughout.', 'The cell should not heat up excessively; switch off the lamp between sets or use a heat filter (efficiency falls with temperature).', 'Take many readings near the maximum power point.', 'Ensure meters are connected with correct polarity and suitable ranges.', 'Avoid shadows on the cell.', 'Measure the irradiance at the plane of the cell.'],
  errors: ['Non-uniform illumination of the cell', 'Heating of the cell lowers V_oc', 'Uncertainty in irradiance (lux to W/m² conversion)', 'Internal resistance of the ammeter'],
  graphNote: 'Plot I (mA) vs V (V) — nearly constant current up to the knee, then a steep fall to zero at V_oc. On the same voltage axis, plot P = VI vs V — it rises to a peak P_max at V_m and drops to zero at V_oc.',
  keyValues: [['Si FF', '0.70 – 0.85'], ['Si cell V_oc', '≈ 0.5 – 0.6 V'], ['Lab η', '≈ 5 – 15 %'], ['STC irradiance', '1000 W m⁻²'], ['Quadrant', 'Fourth (power source)']],
  resultLabel: 'Fill factor and efficiency', standard: null, standardUnit: '',
  viva: [
    ['What is a solar cell?', 'A p-n junction device that converts light energy directly into electrical energy by the photovoltaic effect, without any moving parts or external bias.'],
    ['What is the photovoltaic effect?', 'The generation of a voltage (and current) across a junction of two materials when it is exposed to light, due to separation of photo-generated electron-hole pairs by the junction field.'],
    ['Which materials are used to make solar cells?', 'Mono- and poly-crystalline silicon, amorphous silicon, GaAs, CdTe, CIGS (copper indium gallium selenide) and perovskites. Silicon (E_g = 1.12 eV) is the most common.'],
    ['Define open-circuit voltage and short-circuit current.', 'V_oc is the maximum voltage across the cell when no current is drawn (infinite load). I_sc is the current when the terminals are shorted (zero load, V = 0); it is proportional to light intensity.'],
    ['What is fill factor?', 'FF = V_mI_m/(V_ocI_sc). It measures how close the I-V curve is to an ideal rectangle; higher FF means lower internal losses. Typical silicon cells have FF of 0.7–0.85.'],
    ['How is the efficiency of a solar cell defined?', 'η = P_max/P_in × 100 %, where P_in = irradiance × active area of the cell.'],
    ['Why does a solar cell operate in the fourth quadrant?', 'In the illuminated cell, current flows out of the p-side through the external load while the voltage is positive, so V × I is negative in diode convention — the device delivers power instead of consuming it.'],
    ['How do V_oc and I_sc vary with light intensity?', 'I_sc increases linearly with intensity, while V_oc increases only logarithmically (V_oc ∝ ln I_L).'],
    ['What is the effect of temperature on a solar cell?', 'Increasing temperature increases I₀, so V_oc decreases (≈ −2.3 mV/°C per Si cell); I_sc increases slightly. Overall efficiency falls with temperature.'],
    ['Why is the solar cell made with a very thin top (n) layer?', 'So that light can reach the junction region, where generated electron-hole pairs are efficiently separated before they recombine.'],
    ['What is the role of the anti-reflection coating?', 'It reduces reflection of light from the cell surface (silicon reflects ~30 % uncoated), increasing absorption. Silicon nitride coatings give the blue-black appearance.'],
    ['Why is maximum power not obtained at V_oc or I_sc?', 'At V_oc the current is zero and at I_sc the voltage is zero, so P = VI = 0 at both points. The maximum lies at the knee of the curve.'],
    ['What is the theoretical maximum efficiency of a single-junction silicon cell?', 'About 29–33 % (Shockley–Queisser limit), because photons with energy below E_g are not absorbed and excess energy above E_g is lost as heat.'],
    ['How are solar cells connected to increase voltage and current?', 'Cells in series increase the voltage; cells (or strings) in parallel increase the current. Panels combine both.'],
    ['What are the applications of solar cells?', 'Power supply for satellites, rooftop and grid-scale power plants, calculators, street lights, water pumps and remote telecommunication stations.'],
    ['What is the condition for maximum power transfer?', 'The load resistance must equal the magnitude of the dynamic resistance of the cell at the operating point: R_L = V_m/I_m. MPPT controllers adjust the load to achieve this.'],
    ['What is series resistance and how does it affect the cell?', 'The resistance of the semiconductor bulk, contacts and fingers. High series resistance reduces the fill factor and slope near V_oc, lowering the maximum power.']
  ]
});

EXPS.push({
  id: 'sonometer', num: 8, title: 'Sonometer', subtitle: 'Frequency of a tuning fork', icon: 'music',
  color: '#818cf8', color2: '#f472b6', topic: 'Waves · Acoustics',
  aim: 'To determine the frequency of a given tuning fork using a sonometer by the method of resonance (varying the tension and finding the resonating length).',
  apparatus: ['Sonometer (hollow wooden box with steel wire, two movable knife-edge bridges, pulley)', 'Hanger with slotted weights (0.5 kg each)', 'Tuning fork of unknown frequency and rubber pad', 'Paper rider (small V-shaped paper)', 'Screw gauge (to measure wire diameter)', 'Metre scale', 'Density table for the wire material'],
  principle: R`<p>When a stretched string is plucked, transverse waves travel along it with speed \(v = \sqrt{T/m}\) and are reflected at the fixed bridges, forming <b>stationary waves</b> with nodes at the bridges. In the fundamental mode the vibrating length \(l = \lambda/2\), so the natural frequency is</p>
  $$f = \frac{1}{2l}\sqrt{\frac{T}{m}}$$
  <p>When the stem of an excited tuning fork is pressed on the sonometer box, the string is forced to vibrate. If its natural frequency equals the fork’s frequency, <b>resonance</b> occurs — the amplitude becomes maximum and a paper rider placed at the middle of the wire is thrown off.</p>`,
  theory: R`<h3>Speed of transverse waves on a string</h3>
  <p>Consider a small element of the string of length \(dx\) and mass \(m\,dx\) under tension \(T\). The net vertical force is \(T\,\dfrac{\partial^2 y}{\partial x^2}dx\). By Newton’s second law,</p>
  $$m\,\frac{\partial^2 y}{\partial t^2} = T\frac{\partial^2 y}{\partial x^2}\;\;\Rightarrow\;\; v = \sqrt{\frac{T}{m}}$$
  <h3>Laws of transverse vibration of strings</h3>
  <ol><li><b>Law of length:</b> \(f \propto 1/l\) (T, m constant)</li><li><b>Law of tension:</b> \(f \propto \sqrt{T}\) (l, m constant)</li><li><b>Law of mass:</b> \(f \propto 1/\sqrt{m}\) (l, T constant)</li></ol>
  <h3>Harmonics</h3>
  <p>The string can vibrate in p segments: \(f_p = \dfrac{p}{2l}\sqrt{T/m}\). The resonance method uses the fundamental (p = 1), identified by the rider at the centre flying off.</p>`,
  derivation: R`<h3>Working formula</h3>
  <p>With a hanging mass \(M\) (including the hanger), the tension is \(T = Mg\). The linear mass density of a wire of radius \(r\) and material density \(\rho\) is \(m = \pi r^2\rho\). At resonance with the fork,</p>
  <div class="formula-box">$$f = \frac{1}{2l}\sqrt{\frac{Mg}{m}}$$</div>
  <h3>Graphical method</h3>
  <p>Squaring: \(l^2 = \dfrac{g}{4f^2m}\,M\). A graph of \(l^2\) versus \(M\) is a straight line through the origin with</p>
  $$\text{slope} = \frac{g}{4f^2m}\;\;\Rightarrow\;\; f = \sqrt{\frac{g}{4\,m\,\text{slope}}}$$
  <p>Equivalently \(M/l^2\) should be constant for a given fork — this verifies the law of tension.</p>`,
  formulas: [
    { name: 'Frequency of fundamental mode', tex: R`f = \frac{1}{2l}\sqrt{\frac{T}{m}}`, desc: 'Resonance with the tuning fork.', vars: [['l', 'Resonating length', 'm'], ['T', 'Tension = Mg', 'N'], ['m', 'Linear mass density', 'kg m⁻¹']] },
    { name: 'Wave speed on a string', tex: R`v = \sqrt{\frac{T}{m}}`, desc: 'Transverse waves.', vars: [['v', 'Wave speed', 'm s⁻¹']] },
    { name: 'Linear mass density', tex: R`m = \pi r^2 \rho`, desc: 'Wire of radius r and density ρ.', vars: [['r', 'Wire radius', 'm'], ['ρ', 'Material density', 'kg m⁻³']] },
    { name: 'Graphical relation', tex: R`l^2 = \frac{g}{4f^2m}\,M`, desc: 'Slope of l² vs M gives f.', vars: [['M', 'Suspended mass', 'kg']] },
    { name: 'p-th harmonic', tex: R`f_p = \frac{p}{2l}\sqrt{\frac{T}{m}}`, desc: 'String vibrating in p loops.', vars: [] },
    { name: 'Law of length', tex: R`f\,l = \text{constant}`, desc: 'For fixed T and m.', vars: [] }
  ],
  procedure: [
    'Measure the diameter of the wire with a screw gauge at several places; compute r and m = πr²ρ (or use the given value of m).',
    'Place a load of 1.0 kg (including hanger) on the hanger. Place the bridges close together and a small paper rider at the middle of the wire.',
    'Strike the tuning fork on the rubber pad and press its stem gently on the sonometer box.',
    'Slowly increase the distance between the bridges until the rider vibrates violently and falls off — this is resonance. Fine-tune by moving the bridges in small steps.',
    'Measure the resonating length l between the bridges. Repeat while approaching from the longer-length side and take the mean.',
    'Increase the load in steps of 0.5 kg and repeat the measurement for each load.',
    'Calculate f for each load using f = (1/2l)√(Mg/m) and take the mean.',
    'Plot l² against M; calculate f from the slope.'
  ],
  precautions: ['The wire should be uniform, free of kinks and rust.', 'The tuning fork should not be struck too hard; strike on a rubber pad, never on a hard surface.', 'Press only the stem of the fork on the box; do not touch the prongs.', 'Bridges should be sharp knife-edges; the rider must be at the centre of the vibrating segment.', 'The load must not exceed the elastic limit of the wire.', 'Pulley should be frictionless so that tension equals Mg.'],
  errors: ['Friction at the pulley (tension less than Mg)', 'Non-uniform diameter of the wire', 'Judging exact resonance position', 'Stiffness of the wire and yielding bridges'],
  graphNote: 'Plot l² (y-axis, m²) versus load M (x-axis, kg). The graph is a straight line through the origin; slope = g/(4f²m), so f = √(g/(4m × slope)).',
  keyValues: [['Common forks', '256, 288, 320, 384, 512 Hz'], ['Steel density', '7850 kg m⁻³'], ['Resonance sign', 'Paper rider flies off'], ['f ∝', '√T / (l √m)'], ['Mode used', 'Fundamental (l = λ/2)']],
  resultLabel: 'Frequency of the tuning fork', standard: 256, standardUnit: 'Hz',
  viva: [
    ['What is a sonometer?', 'A hollow wooden box with a stretched wire passing over two movable bridges and a pulley; it is used to study transverse vibrations of strings and to compare/measure frequencies.'],
    ['Why is the sonometer box hollow?', 'The hollow box contains an air column that vibrates in forced vibration with the string, amplifying the sound (acts as a sounding board / resonator). Holes in its side connect the internal air with the outside.'],
    ['What is resonance?', 'When the frequency of the external periodic force (tuning fork) equals the natural frequency of the system (string), the amplitude of vibration becomes maximum. This is resonance.'],
    ['How do you know resonance has occurred?', 'The paper rider placed at the centre of the vibrating wire vibrates violently and is thrown off.'],
    ['State the laws of transverse vibration of strings.', 'f ∝ 1/l for constant T and m; f ∝ √T for constant l and m; f ∝ 1/√m for constant l and T.'],
    ['What are stationary waves?', 'Waves formed by superposition of two identical waves travelling in opposite directions; they have fixed nodes (zero displacement) and antinodes (maximum displacement), and do not transfer energy.'],
    ['What is the relation between vibrating length and wavelength in the fundamental mode?', 'The bridges are nodes and the middle is an antinode, so l = λ/2.'],
    ['What is linear mass density? How is it measured?', 'Mass per unit length of the wire (kg/m). It is calculated as m = πr²ρ using the radius from a screw gauge and the density of the wire material, or by weighing a known length.'],
    ['Why should the tuning fork not be struck on a hard surface?', 'It may produce overtones (higher harmonics) and can damage the fork or change its frequency.'],
    ['Why is the stem of the fork pressed on the box and not the prongs?', 'The prongs vibrate; touching them damps the vibration. The stem transmits the vibrations to the box and the wire.'],
    ['What are forced vibrations?', 'Vibrations of a body under an external periodic force at the frequency of the force rather than its own natural frequency.'],
    ['What is the effect of increasing the tension on the resonating length?', 'Since l = (1/2f)√(T/m), the resonating length increases as √T for a given fork.'],
    ['What are harmonics and overtones?', 'Harmonics are integral multiples of the fundamental frequency. Overtones are the frequencies above the fundamental actually produced; for a string all harmonics are present, so the p-th harmonic is the (p−1)-th overtone.'],
    ['Why is the wire made of steel?', 'Steel has high tensile strength and elasticity, so it can withstand large tensions without permanent deformation and gives a clear tone.'],
    ['Does the frequency of the tuning fork depend on temperature?', 'Slightly — with rising temperature the elasticity of the fork material decreases, so its frequency decreases a little.'],
    ['What is the speed of a transverse wave on a string?', 'v = √(T/m), depending only on the tension and linear mass density, not on the frequency.'],
    ['How can a sonometer be used to determine the frequency of AC mains?', 'By placing an electromagnet (or passing the AC through the wire in a magnetic field) so the wire is forced at 2f or f; adjusting length for resonance gives the AC frequency (≈ 50 Hz).']
  ]
});
