/* ---------- Multiple-choice question bank (answer index a refers to unshuffled options) ---------- */
const MCQ = {
  newton: [
    { q: 'In Newton’s rings observed in reflected light, the centre is dark because:', o: ['Of the phase change of π on reflection at the glass plate', 'The lens absorbs light at the centre', 'The air film is thickest at the centre', 'Light does not reach the point of contact'], a: 0, e: 'At t ≈ 0 the only path difference is λ/2 from reflection at the denser medium → destructive interference.' },
    { q: 'The diameter of the n-th dark ring is proportional to:', o: ['n', '√n', 'n²', '1/n'], a: 1, e: 'Dₙ² = 4nλR, so Dₙ ∝ √n.' },
    { q: 'Newton’s rings are formed due to interference by:', o: ['Division of wavefront', 'Division of amplitude', 'Diffraction at the lens edge', 'Polarisation'], a: 1, e: 'The amplitude of the incident wave is split by partial reflection at the two surfaces of the film.' },
    { q: 'If water (μ = 1.33) fills the gap, the ring diameters:', o: ['Increase by √1.33', 'Decrease by √1.33', 'Remain unchanged', 'Decrease by 1.33'], a: 1, e: 'Dₙ² = 4nλR/μ → Dₙ decreases by the factor √μ.' },
    { q: 'The working formula for wavelength in Newton’s rings is:', o: ['λ = (D²ₙ₊ₚ − D²ₙ)/(4pR)', 'λ = (Dₙ₊ₚ − Dₙ)/(4pR)', 'λ = 4pR/(D²ₙ₊ₚ − D²ₙ)', 'λ = (D²ₙ₊ₚ − D²ₙ)/(2pR)'], a: 0, e: 'Subtracting Dₙ² = 4nλR from D²ₙ₊ₚ = 4(n+p)λR.' },
    { q: 'The slope of the D² versus n graph equals:', o: ['λR', '2λR', '4λR', 'λ/4R'], a: 2, e: 'Dₙ² = 4λR·n, so slope = 4λR.' },
    { q: 'The thickness of the air film at distance r from the contact point is:', o: ['r/2R', 'r²/2R', 'r²/R', '2R/r²'], a: 1, e: 'From r² = (2R − t)t ≈ 2Rt.' },
    { q: 'Why is the travelling microscope screw turned in only one direction?', o: ['To avoid parallax', 'To avoid backlash error', 'To keep rings in focus', 'To save time'], a: 1, e: 'Reversing direction introduces play (backlash) between screw and nut.' }
  ],
  diffraction: [
    { q: 'The condition for the n-th minimum in single-slit diffraction is:', o: ['a sin θ = (2n+1)λ/2', 'a sin θ = nλ', 'd sin θ = nλ', 'a cos θ = nλ'], a: 1, e: 'Pairs of wavelets from the two halves (or 2n parts) of the slit cancel.' },
    { q: 'If the slit width is halved, the width of the central maximum:', o: ['Halves', 'Doubles', 'Remains same', 'Becomes four times'], a: 1, e: 'W = 2λD/a ∝ 1/a.' },
    { q: 'The intensity of the first secondary maximum is about ___ of the central maximum.', o: ['50 %', '25 %', '4.7 %', '0.5 %'], a: 2, e: 'From I = I₀(sinβ/β)² at β ≈ 1.43π: ≈ 0.047 I₀.' },
    { q: 'The wavelength of a He-Ne laser is:', o: ['589.3 nm', '632.8 nm', '546.1 nm', '694.3 nm'], a: 1, e: '632.8 nm red line of neon.' },
    { q: 'Fraunhofer diffraction requires:', o: ['Spherical wavefronts', 'Source and screen at finite distance', 'Plane wavefronts (source and screen effectively at infinity)', 'A double slit'], a: 2, e: 'Far-field diffraction uses plane wavefronts.' },
    { q: 'The working formula used in this experiment is:', o: ['λ = a xₙ/(nD)', 'λ = nD/(a xₙ)', 'λ = xₙ D/(n a)', 'λ = a D/(n xₙ)'], a: 0, e: 'a sin θ = nλ with sin θ ≈ xₙ/D.' },
    { q: 'If red light is replaced by blue light, the diffraction pattern:', o: ['Expands', 'Contracts', 'Is unchanged', 'Disappears'], a: 1, e: 'Fringe positions ∝ λ; blue has shorter λ.' },
    { q: 'In the intensity expression I = I₀(sin β/β)², β equals:', o: ['πa sin θ/λ', '2πa sin θ/λ', 'πλ/(a sin θ)', 'a sin θ/λ'], a: 0, e: 'β is half the phase difference between the edges of the slit.' }
  ],
  led: [
    { q: 'Light emission in an LED is due to:', o: ['Thermionic emission', 'Radiative recombination of electrons and holes', 'Photoelectric effect', 'Heating of the junction'], a: 1, e: 'Electroluminescence from recombination across the band gap.' },
    { q: 'LEDs are made from:', o: ['Indirect band-gap semiconductors like Si', 'Direct band-gap semiconductors like GaAs', 'Metals', 'Insulators'], a: 1, e: 'Direct band gap allows efficient photon emission.' },
    { q: 'An LED with band gap 1.97 eV emits light of wavelength about:', o: ['470 nm', '520 nm', '630 nm', '900 nm'], a: 2, e: 'λ ≈ 1240/1.97 ≈ 630 nm (red).' },
    { q: 'Which LED has the highest knee voltage?', o: ['Infrared', 'Red', 'Green', 'Blue'], a: 3, e: 'Blue photons have the highest energy, so V_k is largest (~2.8 V).' },
    { q: 'Planck’s constant from LED threshold voltage is:', o: ['h = eV_kc/λ', 'h = eV_kλ/c', 'h = V_kλ/(ec)', 'h = ec/(V_kλ)'], a: 1, e: 'eV_k = hc/λ.' },
    { q: 'A series resistor is used with an LED to:', o: ['Increase brightness', 'Limit the forward current', 'Reverse bias it', 'Change its colour'], a: 1, e: 'Above the knee the current rises steeply; R limits it.' },
    { q: 'The approximate maximum reverse voltage of a typical LED is:', o: ['0.7 V', '5 V', '100 V', '1000 V'], a: 1, e: 'LEDs have low reverse breakdown, about 5 V.' },
    { q: 'White LEDs are commonly made using:', o: ['Red LED + green filter', 'Blue LED + yellow phosphor', 'Infrared LED + phosphor', 'Si LED'], a: 1, e: 'Blue InGaN with Ce:YAG yellow phosphor.' }
  ],
  diode: [
    { q: 'The knee voltage of a silicon diode is approximately:', o: ['0.3 V', '0.7 V', '1.8 V', '5 V'], a: 1, e: 'Si barrier ≈ 0.7 V (Ge ≈ 0.3 V).' },
    { q: 'In reverse bias, the depletion region:', o: ['Narrows', 'Widens', 'Disappears', 'Is unaffected'], a: 1, e: 'W ∝ √(V_bi − V); with V negative, W increases.' },
    { q: 'Reverse saturation current is mainly due to:', o: ['Majority carriers', 'Minority carriers', 'Immobile ions', 'Photons'], a: 1, e: 'Thermally generated minority carriers drift across the junction.' },
    { q: 'Dynamic resistance of a diode at 10 mA (η = 1, 300 K) is about:', o: ['0.26 Ω', '2.6 Ω', '26 Ω', '260 Ω'], a: 1, e: 'r_d = V_T/I = 25.85 mV/10 mA ≈ 2.6 Ω.' },
    { q: 'The thermal voltage V_T at 300 K is:', o: ['0.7 V', '25.85 mV', '1.12 V', '2.585 mV'], a: 1, e: 'k_BT/e = (1.381e-23 × 300)/1.602e-19 ≈ 25.85 mV.' },
    { q: 'Which meter is used to measure current in reverse bias?', o: ['Milliammeter', 'Microammeter', 'Ammeter (A)', 'Galvanometer with shunt'], a: 1, e: 'Reverse current is in the nA–µA range.' },
    { q: 'Avalanche breakdown occurs in:', o: ['Heavily doped junctions at low voltage', 'Lightly doped junctions at high reverse voltage', 'Forward bias', 'Metals'], a: 1, e: 'Carriers gain enough energy to ionise atoms by collision.' },
    { q: 'Reverse saturation current of a diode with temperature:', o: ['Decreases', 'Increases', 'Stays constant', 'Becomes zero'], a: 1, e: 'Roughly doubles for every 10 °C rise.' }
  ],
  photo: [
    { q: 'Stopping potential depends on:', o: ['Intensity of light', 'Frequency of light', 'Area of cathode', 'Distance of source'], a: 1, e: 'eV₀ = hν − φ; independent of intensity.' },
    { q: 'The slope of the V₀ versus ν graph is:', o: ['h', 'h/e', 'e/h', 'φ/e'], a: 1, e: 'V₀ = (h/e)ν − φ/e.' },
    { q: 'If intensity of incident light is doubled, the saturation photocurrent:', o: ['Halves', 'Doubles', 'Is unchanged', 'Becomes zero'], a: 1, e: 'Number of photons (and electrons) per second doubles.' },
    { q: 'The work function of a metal with threshold wavelength 620 nm is about:', o: ['1 eV', '2 eV', '3 eV', '4 eV'], a: 1, e: 'φ = 1240/620 ≈ 2.0 eV.' },
    { q: 'The intercept of the V₀–ν graph on the frequency axis gives:', o: ['Planck’s constant', 'Work function', 'Threshold frequency', 'Stopping potential'], a: 2, e: 'At V₀ = 0, ν = ν₀.' },
    { q: 'Which observation could NOT be explained by wave theory?', o: ['Photocurrent increases with intensity', 'Existence of a threshold frequency', 'Light travels in straight lines', 'Light carries energy'], a: 1, e: 'Wave theory predicts emission at any frequency with enough intensity.' },
    { q: 'Photon energy for ν = 6 × 10¹⁴ Hz is about:', o: ['1.5 eV', '2.48 eV', '3.98 eV', '5 eV'], a: 1, e: 'E = hν = 6.626e-34 × 6e14 = 3.98e-19 J = 2.48 eV.' },
    { q: 'Photoemission begins after illumination in about:', o: ['1 s', '1 ms', '10⁻⁹ s (instantaneous)', '1 min'], a: 2, e: 'Emission is effectively instantaneous.' }
  ],
  pendulum: [
    { q: 'The time period of a compound pendulum is:', o: ['2π√(l/g)', '2π√((K²+l²)/(gl))', '2π√(K/g)', '2π√((K²−l²)/(gl))'], a: 1, e: 'From Iθ̈ = −mglθ with I = m(K²+l²).' },
    { q: 'The time period is minimum when the distance from G equals:', o: ['0', 'K', '2K', 'L'], a: 1, e: 'dT/dl = 0 gives l = K.' },
    { q: 'The equivalent length of a compound pendulum is:', o: ['l + K/l', 'l + K²/l', 'K²/l', 'l − K²/l'], a: 1, e: 'L = (K² + l²)/l.' },
    { q: 'For a uniform bar of length 1 m, K about its centre is about:', o: ['0.5 m', '0.289 m', '0.25 m', '0.1 m'], a: 1, e: 'K = ℓ/√12 = 0.2887 m.' },
    { q: 'The graph of T versus l (both sides of G) is:', o: ['A straight line', 'A parabola', 'W-shaped', 'A hyperbola'], a: 2, e: 'Two symmetric branches with minima at ±K.' },
    { q: 'If the pendulum is suspended at its centre of gravity, the period is:', o: ['Zero', 'Minimum', 'Infinite (no oscillation)', 'Same as at l = K'], a: 2, e: 'No restoring torque at l = 0.' },
    { q: 'In the T²l vs l² graph, g equals:', o: ['4π²/slope', 'slope/4π²', '4π² × slope', '2π/slope'], a: 0, e: 'T²l = (4π²/g)l² + 4π²K²/g.' },
    { q: 'For points with equal period on one side of G, l₁ and l₂ satisfy:', o: ['l₁ + l₂ = K', 'l₁l₂ = K²', 'l₁ − l₂ = L', 'l₁/l₂ = K'], a: 1, e: 'Roots of l² − Ll + K² = 0.' }
  ],
  solar: [
    { q: 'Fill factor of a solar cell is defined as:', o: ['V_ocI_sc/(V_mI_m)', 'V_mI_m/(V_ocI_sc)', 'P_max/P_in', 'V_m/V_oc'], a: 1, e: 'Ratio of maximum power to V_oc × I_sc.' },
    { q: 'A solar cell operates in which quadrant of the diode I-V characteristic?', o: ['First', 'Second', 'Third', 'Fourth'], a: 3, e: 'It delivers power: V > 0, I < 0 in diode convention.' },
    { q: 'The short-circuit current of a solar cell varies with light intensity:', o: ['Linearly', 'Logarithmically', 'Inversely', 'Not at all'], a: 0, e: 'I_sc = I_L ∝ photon flux.' },
    { q: 'Open-circuit voltage varies with light intensity:', o: ['Linearly', 'Logarithmically', 'Quadratically', 'Inversely'], a: 1, e: 'V_oc = ηV_T ln(I_L/I₀ + 1).' },
    { q: 'Efficiency of a solar cell is:', o: ['P_max/P_in × 100', 'V_oc I_sc / P_in', 'FF × 100', 'P_in/P_max'], a: 0, e: 'Output power at MPP divided by incident light power.' },
    { q: 'Increasing the temperature of a silicon solar cell:', o: ['Increases V_oc', 'Decreases V_oc', 'Has no effect', 'Increases efficiency greatly'], a: 1, e: 'I₀ rises sharply with T, lowering V_oc (~ −2.3 mV/°C).' },
    { q: 'Typical fill factor of a good silicon solar cell is:', o: ['0.25', '0.45', '0.75–0.85', '1.2'], a: 2, e: 'Commercial Si cells: ~0.75–0.83.' },
    { q: 'Maximum power is delivered when the load resistance equals:', o: ['Zero', 'Infinity', 'V_m/I_m', 'V_oc/I_sc'], a: 2, e: 'Optimum load R = V_m/I_m.' }
  ],
  sonometer: [
    { q: 'The fundamental frequency of a stretched string is:', o: ['(1/l)√(T/m)', '(1/2l)√(T/m)', '(2/l)√(T/m)', '(1/2l)√(m/T)'], a: 1, e: 'l = λ/2 and v = √(T/m).' },
    { q: 'If the tension is made four times, the frequency becomes:', o: ['Four times', 'Twice', 'Half', 'Unchanged'], a: 1, e: 'f ∝ √T.' },
    { q: 'At resonance in the sonometer experiment:', o: ['The wire stops vibrating', 'The paper rider is thrown off', 'The fork stops vibrating', 'The bridges move'], a: 1, e: 'Maximum amplitude throws the rider off.' },
    { q: 'The speed of a transverse wave on a string depends on:', o: ['Frequency only', 'Tension and linear density', 'Amplitude', 'Length of the string'], a: 1, e: 'v = √(T/m).' },
    { q: 'The graph of l² versus M is:', o: ['A straight line through the origin', 'A parabola', 'A hyperbola', 'A W-shaped curve'], a: 0, e: 'l² = (g/4f²m)·M.' },
    { q: 'Linear mass density of a wire of radius r and density ρ is:', o: ['ρ/πr²', 'πr²ρ', '2πrρ', 'ρr'], a: 1, e: 'Mass per unit length = cross-sectional area × density.' },
    { q: 'Doubling the vibrating length (same T, m) makes the frequency:', o: ['Double', 'Half', 'Four times', 'Unchanged'], a: 1, e: 'Law of length: f ∝ 1/l.' },
    { q: 'Why is the sonometer box hollow?', o: ['To make it light', 'To amplify sound through forced vibration of enclosed air', 'To hold weights', 'To reduce tension'], a: 1, e: 'The box acts as a resonator/sounding board.' }
  ]
};
