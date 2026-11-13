/* ---------- Experiment content: 1 Newton's Rings, 2 Single-Slit Diffraction ---------- */
EXPS.push({
  id: 'newton', num: 1, title: "Newton's Rings", subtitle: 'Wavelength of sodium light', icon: 'circle-dot',
  color: '#a78bfa', color2: '#22d3ee', topic: 'Wave Optics · Interference',
  aim: 'To determine the wavelength of sodium light by forming Newton’s rings with a plano-convex lens resting on a plane glass plate.',
  apparatus: ['Sodium vapour lamp (λ ≈ 589.3 nm)', 'Plano-convex lens of large radius of curvature (R ≈ 1 m)', 'Optically plane glass plate', 'Glass plate inclined at 45°', 'Convex (collimating) lens', 'Travelling microscope (LC = 0.001 cm)', 'Spherometer (to measure R)', 'Black paper / Newton’s rings stand', 'Reading lamp'],
  principle: R`<p>When a plano-convex lens of large radius of curvature is placed with its convex surface on a plane glass plate, a <b>thin air film of gradually increasing thickness</b> is formed between them. When monochromatic light falls normally on this film, the rays reflected from the <b>top</b> and <b>bottom</b> surfaces of the air film are coherent (obtained by <b>division of amplitude</b>) and interfere.</p>
  <p>Since the thickness of the film is constant along circles centred at the point of contact, the interference fringes are <b>concentric circles</b> — fringes of equal thickness — called <b>Newton’s rings</b>. In reflected light the centre is dark.</p>`,
  theory: R`<h3>Path difference in the air film</h3>
  <p>For a film of thickness \(t\) and refractive index \(\mu\), with angle of refraction \(r\), the effective path difference between the two reflected rays is</p>
  $$\Delta = 2\mu t\cos r + \frac{\lambda}{2}$$
  <p>The extra \(\lambda/2\) arises because the ray reflected from the lower glass plate (rarer → denser medium) suffers a phase change of \(\pi\). For normal incidence \(r = 0\), and for an air film \(\mu = 1\).</p>
  <h4>Conditions</h4>
  <ul><li><b>Dark ring:</b> \(2\mu t = n\lambda\), &nbsp; n = 0, 1, 2, …</li><li><b>Bright ring:</b> \(2\mu t = (2n-1)\dfrac{\lambda}{2}\), &nbsp; n = 1, 2, 3, …</li></ul>
  <p>At the point of contact \(t = 0\), so \(\Delta = \lambda/2\): the centre of the pattern in reflected light is <b>dark</b>.</p>`,
  derivation: R`<h3>Derivation of the ring diameter</h3>
  <p>Let \(R\) be the radius of curvature of the lens and \(r_n\) the radius of the n-th ring, where the film thickness is \(t\). From the geometry of the circle (intersecting chords theorem):</p>
  $$r_n^2 = (2R - t)\,t = 2Rt - t^2$$
  <p>Since \(R \gg t\), the term \(t^2\) is negligible:</p>
  $$t = \frac{r_n^2}{2R}$$
  <p>Substituting in the condition for the n-th <b>dark</b> ring, \(2\mu t = n\lambda\):</p>
  $$\frac{2\mu\,r_n^2}{2R} = n\lambda \;\;\Rightarrow\;\; r_n^2 = \frac{n\lambda R}{\mu}$$
  <p>In terms of diameter \(D_n = 2r_n\):</p>
  $$D_n^2 = \frac{4n\lambda R}{\mu}\qquad(\mu = 1 \text{ for air})$$
  <p>Thus \(D_n \propto \sqrt{n}\) — the rings get closer together as their order increases. For the \((n+p)\)-th ring, \(D_{n+p}^2 = 4(n+p)\lambda R\). Subtracting,</p>
  <div class="formula-box">$$\lambda = \frac{D_{n+p}^2 - D_n^2}{4pR}$$</div>
  <p>Using the <b>difference</b> of squares eliminates the error from an unknown extra thickness at the point of contact (dust, deformation), since such an error adds the same constant to every \(D^2\). Equivalently, the slope of the graph of \(D_n^2\) versus \(n\) equals \(4\lambda R\).</p>
  <h4>Radius of curvature with a spherometer</h4>
  $$R = \frac{l^2}{6h} + \frac{h}{2}$$
  <p>where \(l\) is the mean distance between the spherometer legs and \(h\) the sagitta (height) reading.</p>`,
  formulas: [
    { name: 'Wavelength from ring diameters', tex: R`\lambda = \frac{D_{n+p}^2 - D_n^2}{4pR}`, desc: 'Main working formula; uses difference of squares to cancel contact errors.', vars: [['D_{n+p}', 'Diameter of (n+p)-th dark ring', 'm'], ['D_n', 'Diameter of n-th dark ring', 'm'], ['p', 'Difference in ring order', '—'], ['R', 'Radius of curvature of lens', 'm']] },
    { name: 'Diameter of n-th dark ring', tex: R`D_n^2 = \frac{4n\lambda R}{\mu}`, desc: 'Reflected light; μ = 1 for air film.', vars: [['n', 'Ring order', '—'], ['μ', 'Refractive index of film', '—']] },
    { name: 'Diameter of n-th bright ring', tex: R`D_n^2 = \frac{2(2n-1)\lambda R}{\mu}`, desc: 'Reflected light, bright rings.', vars: [] },
    { name: 'Air-film thickness', tex: R`t = \frac{r^2}{2R}`, desc: 'Thickness of film at distance r from point of contact.', vars: [['t', 'Film thickness', 'm'], ['r', 'Distance from contact point', 'm']] },
    { name: 'Path difference (reflected)', tex: R`\Delta = 2\mu t\cos r + \frac{\lambda}{2}`, desc: 'λ/2 from reflection at the denser glass plate.', vars: [] },
    { name: 'Refractive index of a liquid', tex: R`\mu = \frac{(D_{n+p}^2 - D_n^2)_{\text{air}}}{(D_{n+p}^2 - D_n^2)_{\text{liquid}}}`, desc: 'Liquid film between lens and plate shrinks rings by √μ.', vars: [] },
    { name: 'Spherometer: radius of curvature', tex: R`R = \frac{l^2}{6h} + \frac{h}{2}`, desc: 'l = distance between legs, h = sagitta.', vars: [['l', 'Leg separation', 'm'], ['h', 'Sagitta', 'm']] }
  ],
  procedure: [
    'Clean the plano-convex lens and the glass plate; place the lens (convex side down) on the plate inside the Newton’s rings stand.',
    'Switch on the sodium lamp and allow 5–10 minutes for it to reach full brightness (yellow light).',
    'Place the 45° glass plate so that a parallel beam from the lamp (via the collimating lens) is reflected vertically down onto the lens.',
    'Focus the travelling microscope on the air film until sharp, concentric dark and bright rings with a dark centre are seen.',
    'Adjust the microscope so that the vertical cross-wire passes through the centre of the ring system and the horizontal wire is tangential to the rings.',
    'Move the microscope to the left until the cross-wire is beyond the 20th dark ring; then move back and set it tangentially on the 20th dark ring. Note the reading.',
    'Continue moving in the same direction, noting readings on the 18th, 16th, …, 2nd rings on the left, cross the centre, and note readings on the 2nd, 4th, …, 20th rings on the right.',
    'Find the diameter of each ring as the difference of left and right readings; compute D².',
    'Measure the radius of curvature R of the lens with a spherometer (or use the given value).',
    'Plot D² against ring number n; calculate λ from the slope (slope = 4λR) and also using the formula with p = 10.'
  ],
  precautions: ['The lens and glass plate must be thoroughly clean and dust-free.', 'The microscope screw must be moved in one direction only to avoid backlash error.', 'The cross-wire should be set tangentially to each ring (on the centre of the dark ring’s width).', 'Use a lens of large radius of curvature so that rings are broad.', 'The light falling on the film should be normal (45° plate correctly inclined).', 'Count the rings carefully — do not miss any ring while moving.', 'Do not touch the lens surface with fingers; avoid pressing the lens strongly.'],
  errors: ['Backlash error in the micrometer screw', 'Wrong counting of ring order', 'Dust at the point of contact (largely cancelled by the difference method)', 'Uncertainty in R from spherometer reading'],
  graphNote: 'Plot D² (y-axis) versus ring number n (x-axis). The graph is a straight line; slope = 4λR, so λ = slope / 4R. A non-zero intercept indicates contact error, which does not affect the slope.',
  keyValues: [['Standard λ (Na)', '589.3 nm (D-lines 589.0 & 589.6 nm)'], ['Typical R', '≈ 1 m'], ['Microscope LC', '0.001 cm'], ['Centre (reflected)', 'Dark'], ['Interference type', 'Division of amplitude']],
  resultLabel: 'Wavelength of sodium light', standard: 589.3, standardUnit: 'nm',
  viva: [
    ['What are Newton’s rings?', 'They are concentric, alternately dark and bright circular interference fringes formed when monochromatic light is reflected from the top and bottom surfaces of the thin air film enclosed between a plano-convex lens and a plane glass plate.'],
    ['Why are the fringes circular?', 'The thickness of the air film is the same at all points on a circle centred at the point of contact. Each fringe is a locus of constant film thickness (fringe of equal thickness), so the fringes are circles.'],
    ['Why is the centre dark in reflected light?', 'At the point of contact the film thickness is nearly zero, so the only path difference is λ/2 due to the phase change of π on reflection at the glass plate (denser medium). This gives destructive interference, hence a dark centre.'],
    ['What will you observe in transmitted light?', 'The ring pattern is complementary to the reflected one: the centre is bright and dark rings occupy the positions of bright rings. Contrast is poor because the interfering transmitted beams have very unequal amplitudes.'],
    ['Is this interference by division of wavefront or division of amplitude?', 'Division of amplitude — the incident wave is partially reflected at the top and bottom surfaces of the same film, producing two coherent beams.'],
    ['Why do we use a lens of large radius of curvature?', 'With large R the air film thickness increases slowly, so the rings are wider and well separated, making diameter measurement accurate. Also D² ∝ R so diameters are larger.'],
    ['What is the purpose of the glass plate inclined at 45°?', 'It reflects the horizontal beam from the sodium lamp vertically downward so that light falls normally on the air film, and it allows the reflected light to pass upward into the microscope.'],
    ['Why is sodium light used? Why not white light?', 'Sodium light is intense and nearly monochromatic (mean λ = 589.3 nm), giving a large number of sharp rings. With white light the rings of different colours overlap and only a few coloured rings are visible near the centre.'],
    ['Why do we measure diameters and not radii?', 'The centre of the ring system is a dark spot of finite size and cannot be located precisely. Measuring the diameter between two sides of a ring avoids locating the exact centre.'],
    ['Why do we use (D²ₙ₊ₚ − D²ₙ) rather than D²ₙ alone?', 'Dust or elastic deformation at the point of contact introduces an unknown extra thickness, adding a constant term to every D². Taking the difference cancels this term, so λ is obtained accurately.'],
    ['Why do the rings get closer as their order increases?', 'Because Dₙ ∝ √n. The difference between successive diameters, √(n+1) − √n, decreases as n increases, so outer rings are crowded together.'],
    ['What happens when a liquid is introduced between the lens and the plate?', 'The optical path becomes 2μt, so Dₙ² = 4nλR/μ. The rings contract (diameters decrease by a factor √μ). This is used to find the refractive index of the liquid.'],
    ['What happens if the lens is slowly lifted from the plate?', 'The film thickness at every point increases, so each ring moves inward and the rings appear to collapse into the centre one after another.'],
    ['Where are the fringes localised?', 'They are localised in the air film itself (fringes of equal thickness), so the microscope must be focused on the film.'],
    ['What is the least count of a travelling microscope?', 'Least count = value of one main-scale division / number of vernier divisions, typically 0.05 cm / 50 = 0.001 cm.'],
    ['What is backlash error and how is it avoided?', 'It is the lag in the motion of the microscope when the direction of rotation of the screw is reversed, due to play between screw and nut. It is avoided by turning the screw in one direction only while taking readings.'],
    ['What are the applications of Newton’s rings?', 'Determination of wavelength of light, refractive index of a liquid, radius of curvature of a lens, and testing the flatness/quality of optical surfaces.'],
    ['What is the condition for a bright ring in reflected light?', '2μt cos r = (2n − 1)λ/2. For air and normal incidence, Dₙ² = 2(2n − 1)λR.']
  ]
});

EXPS.push({
  id: 'diffraction', num: 2, title: 'Single-Slit Diffraction', subtitle: 'Wavelength of He-Ne laser', icon: 'waves',
  color: '#f472b6', color2: '#8b5cf6', topic: 'Wave Optics · Diffraction',
  aim: 'To determine the wavelength of He-Ne laser light using Fraunhofer diffraction at a single slit of known width.',
  apparatus: ['He-Ne laser (λ = 632.8 nm, 1–2 mW)', 'Single slit of known width a (e.g. 0.10 mm)', 'Slit holder on optical bench', 'White screen with graph paper', 'Metre scale / measuring tape', 'Travelling microscope (to measure slit width)', 'Laser stand'],
  principle: R`<p>When a plane monochromatic wavefront falls on a narrow slit whose width is comparable to the wavelength, every point of the wavefront in the slit acts as a source of <b>secondary wavelets</b> (Huygens’ principle). These wavelets interfere on a distant screen, producing a bright <b>central maximum</b> flanked by dark minima and progressively weaker secondary maxima.</p>
  <p>Since the laser beam is already a plane wavefront and the screen is far from the slit (\(D \gg a^2/\lambda\)), the pattern is of the <b>Fraunhofer</b> type. Minima occur where</p>
  $$a\sin\theta = n\lambda,\quad n = \pm1, \pm2, \pm3,\dots$$`,
  theory: R`<h3>Condition for minima</h3>
  <p>Divide the slit of width \(a\) into two equal halves. For a direction \(\theta\), wavelets from corresponding points in the two halves (separated by \(a/2\)) have path difference \(\tfrac{a}{2}\sin\theta\). If this equals \(\lambda/2\), every pair cancels, giving the first minimum: \(a\sin\theta = \lambda\). Dividing into 4, 6, … parts gives the general condition \(a\sin\theta_n = n\lambda\).</p>
  <h3>Intensity distribution</h3>
  <p>Adding the contributions of all wavelets (phasor method) gives the resultant amplitude \(A = A_0\,\sin\beta/\beta\), hence</p>
  $$I = I_0\left(\frac{\sin\beta}{\beta}\right)^2,\qquad \beta = \frac{\pi a\sin\theta}{\lambda}$$
  <ul><li><b>Central maximum</b> at \(\beta = 0\): \(I = I_0\).</li><li><b>Minima</b> at \(\beta = n\pi\), i.e. \(a\sin\theta = n\lambda\).</li><li><b>Secondary maxima</b> where \(\tan\beta = \beta\): \(\beta \approx 1.430\pi, 2.459\pi, 3.471\pi\) with intensities ≈ 4.72 %, 1.65 %, 0.83 % of \(I_0\).</li></ul>
  <h3>Fraunhofer vs Fresnel</h3>
  <p>In Fraunhofer diffraction, the source and screen are effectively at infinite distance (plane wavefronts); in Fresnel diffraction they are at finite distances (spherical/cylindrical wavefronts).</p>`,
  derivation: R`<h3>Derivation of the working formula</h3>
  <p>Let the screen be at distance \(D\) from the slit and let \(x_n\) be the distance of the n-th minimum from the centre of the central maximum. Then</p>
  $$\tan\theta_n = \frac{x_n}{D}$$
  <p>For small angles (\(x_n \ll D\)), \(\sin\theta_n \approx \tan\theta_n \approx \theta_n\). Substituting in \(a\sin\theta_n = n\lambda\):</p>
  $$a\frac{x_n}{D} = n\lambda \;\;\Rightarrow\;\; x_n = \frac{n\lambda D}{a}$$
  <div class="formula-box">$$\lambda = \frac{a\,x_n}{n\,D} = \frac{a\,(2x_n)}{2nD}$$</div>
  <p>In practice the distance \(2x_n\) between the n-th minima on either side of the centre is measured, reducing centring errors.</p>
  <h4>Width of the central maximum</h4>
  $$W = 2x_1 = \frac{2\lambda D}{a},\qquad \text{angular half-width } \theta_1 = \sin^{-1}\!\frac{\lambda}{a}$$
  <p>The central maximum is twice as wide as each secondary maximum. A graph of \(x_n\) versus \(n\) is a straight line through the origin with slope \(\lambda D/a\).</p>
  <h4>Intensity (phasor) derivation, outline</h4>
  <p>Divide the slit into N strips; adjacent strips differ in phase by \(\delta = \tfrac{2\pi}{\lambda}\tfrac{a}{N}\sin\theta\). The N phasors form an arc of a circle with total phase \(2\beta = \tfrac{2\pi a\sin\theta}{\lambda}\). The chord of an arc of length \(A_0\) subtending angle \(2\beta\) is \(A = A_0\sin\beta/\beta\), giving \(I = I_0(\sin\beta/\beta)^2\).</p>`,
  formulas: [
    { name: 'Condition for minima', tex: R`a\sin\theta_n = n\lambda`, desc: 'n = ±1, ±2, … (n = 0 is the central maximum).', vars: [['a', 'Slit width', 'm'], ['θₙ', 'Angle of n-th minimum', 'rad'], ['n', 'Order of minimum', '—']] },
    { name: 'Wavelength (working formula)', tex: R`\lambda = \frac{a\,x_n}{n\,D}`, desc: 'Small-angle approximation, sin θ ≈ x/D.', vars: [['xₙ', 'Distance of n-th minimum from centre', 'm'], ['D', 'Slit-to-screen distance', 'm']] },
    { name: 'Intensity distribution', tex: R`I = I_0\left(\frac{\sin\beta}{\beta}\right)^2,\;\; \beta = \frac{\pi a\sin\theta}{\lambda}`, desc: 'Fraunhofer single-slit pattern.', vars: [['I₀', 'Central intensity', 'W m⁻²'], ['β', 'Half phase difference across slit', 'rad']] },
    { name: 'Width of central maximum', tex: R`W = \frac{2\lambda D}{a}`, desc: 'Linear width on the screen.', vars: [] },
    { name: 'Secondary maxima condition', tex: R`\tan\beta = \beta`, desc: 'β ≈ 1.430π, 2.459π, …; I ≈ 4.7 %, 1.7 % of I₀.', vars: [] },
    { name: 'Fraunhofer condition', tex: R`D \gg \frac{a^2}{\lambda}`, desc: 'Far-field (Fresnel number ≪ 1).', vars: [] }
  ],
  procedure: [
    'Mount the He-Ne laser and the single slit on the bench; switch on the laser (never look into the beam).',
    'Adjust the slit vertical and perpendicular to the laser beam so that the beam passes centrally through it.',
    'Place the screen with graph paper at a distance D ≈ 1 m from the slit, perpendicular to the beam.',
    'Observe the diffraction pattern: a bright central maximum with alternate dark and weaker bright fringes on both sides.',
    'Mark the positions of the 1st, 2nd, 3rd and 4th minima on both sides of the central maximum on the graph paper.',
    'Measure the distance 2xₙ between the n-th minima on either side; find xₙ.',
    'Measure D accurately with the metre scale; note the slit width a (or measure it with a travelling microscope).',
    'Repeat for two or three values of D.',
    'Calculate λ = a xₙ / (nD) for each reading and take the mean. Plot xₙ versus n; slope = λD/a.'
  ],
  precautions: ['Never look directly into the laser beam or its specular reflection.', 'The slit must be vertical and normal to the incident beam.', 'Screen distance should be large compared to slit width (Fraunhofer condition).', 'Mark the centres of the dark fringes carefully; work in a darkened room.', 'Do not touch the slit edges; dust changes the effective width.', 'The screen must be perpendicular to the line joining laser and slit.'],
  errors: ['Uncertainty in slit width a (largest source of error)', 'Locating the exact centre of broad dark fringes', 'Screen not perpendicular / D not measured from slit plane'],
  graphNote: 'Plot xₙ (y-axis) versus order n (x-axis). The straight line passes through the origin with slope = λD/a, so λ = a × slope / D. The intensity profile follows (sin β/β)².',
  keyValues: [['He-Ne λ', '632.8 nm'], ['Minima', 'a sin θ = nλ'], ['1st secondary max', '≈ 4.7 % of I₀'], ['Central max width', '2λD/a'], ['Type', 'Fraunhofer']],
  resultLabel: 'Wavelength of He-Ne laser', standard: 632.8, standardUnit: 'nm',
  viva: [
    ['What is diffraction of light?', 'The bending of light around the edges of an obstacle or aperture and its spreading into the region of geometrical shadow. It results from the interference of secondary wavelets from different parts of the same wavefront.'],
    ['State Huygens’ principle.', 'Every point on a wavefront acts as a source of secondary spherical wavelets that spread out with the speed of the wave; the new wavefront is the forward envelope of these wavelets at a later time.'],
    ['Distinguish between Fresnel and Fraunhofer diffraction.', 'In Fresnel diffraction the source and/or screen are at finite distances and wavefronts are spherical or cylindrical; no lenses are needed. In Fraunhofer diffraction both are effectively at infinity, wavefronts are plane, and the analysis is simpler.'],
    ['Which type of diffraction is studied in this experiment and why?', 'Fraunhofer diffraction, because the laser provides a plane, parallel wavefront and the screen is far from the slit (D ≫ a²/λ).'],
    ['What is the condition for the n-th minimum?', 'a sin θ = nλ, where a is the slit width and n = ±1, ±2, …'],
    ['Why is the central maximum twice as wide as the secondary maxima?', 'The central maximum extends between the first minima on either side (sin θ from −λ/a to +λ/a), while each secondary maximum lies between two consecutive minima separated by only λ/a.'],
    ['What are the relative intensities of the secondary maxima?', 'Approximately 4.7 %, 1.7 % and 0.8 % of the central maximum intensity for the 1st, 2nd and 3rd secondary maxima.'],
    ['What happens to the pattern if the slit width is decreased?', 'The pattern spreads out — the central maximum becomes wider (W = 2λD/a) and the intensity decreases.'],
    ['What happens if the slit width is equal to the wavelength?', 'sin θ₁ = 1, so the first minimum is at 90°; the central maximum fills the whole screen and no minima are observed.'],
    ['Why is a laser used as the source?', 'Laser light is highly monochromatic, coherent, intense and unidirectional, so it directly provides a plane wavefront and a bright, sharp pattern without collimating lenses.'],
    ['What is the wavelength of a He-Ne laser? How does it work?', '632.8 nm (red). Helium atoms are excited by electric discharge and transfer energy by resonant collisions to neon atoms, creating population inversion in neon; lasing occurs between neon levels (3s → 2p).'],
    ['What is the difference between interference and diffraction?', 'Interference is the superposition of waves from two (or more) separate coherent sources, producing equally spaced fringes of equal intensity. Diffraction is superposition of wavelets from different parts of the same wavefront, giving unequally intense fringes with a broad central maximum.'],
    ['What happens if white light is used?', 'The central maximum is white, but the other fringes are coloured, with violet nearer the centre and red farther away, since fringe positions depend on λ.'],
    ['Why is diffraction not noticeable for wide openings like doors?', 'Diffraction angle θ ≈ λ/a. When a ≫ λ the angle is extremely small, so light appears to travel in straight lines (geometrical optics).'],
    ['Why is sin θ ≈ x/D justified here?', 'Typical x ≈ 6 mm while D ≈ 1 m, so θ ≈ 0.006 rad; for such small angles sin θ ≈ tan θ ≈ θ with negligible error.'],
    ['How does the pattern change if the whole set-up is immersed in water?', 'The wavelength in water becomes λ/μ, so the pattern shrinks by a factor μ (≈ 1.33).'],
    ['What precautions are needed while handling a laser?', 'Never look into the beam or its reflections, avoid shiny objects in the beam path, and keep the beam at a height away from eye level.'],
    ['What is the effect of increasing the slit-to-screen distance D?', 'All distances xₙ increase in proportion to D, so the pattern becomes larger (but dimmer); the angular positions remain unchanged.']
  ]
});
