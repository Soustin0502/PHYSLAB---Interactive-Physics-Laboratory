// Assembles PhysLab into ONE self-contained HTML file that works fully offline.
// All libraries (KaTeX, Chart.js, Three.js, Lucide) and fonts are inlined from ./vendor.
// Usage: node src/build.js
const fs = require('fs');
const path = require('path');
const dir = __dirname, vdir = path.join(dir, 'vendor');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const vread = (f, enc = 'utf8') => fs.readFileSync(path.join(vdir, f), enc);
const b64 = f => vread(f, null).toString('base64');

const css = read('style.css');
const shell = read('shell.html');
const jsFiles = ['core.js', 'content1.js', 'content2.js', 'content3.js', 'content4.js', 'mcq.js', 'diagrams.js', 'apparatus.js', 'charts.js', 'sims1.js', 'sims2.js', 'workspace.js', 'views.js', 'tools.js', 'features.js', 'practice.js', 'vlab.js', 'extras.js', 'ink.js', 'tour.js', 'saas.js', 'immersive.js', 'main.js'];
const js = jsFiles.map(f => `/* ===== ${f} ===== */\n` + read(f)).join('\n');

// Fonts: Google fonts (Inter, JetBrains Mono, Space Grotesk) + KaTeX math fonts, embedded as data URIs (woff2 only)
const fontCss = vread('fonts.css').replace(/url\(fonts\/(f\d+\.woff2)\)/g, (_, f) => `url(data:font/woff2;base64,${b64('fonts/' + f)})`);
const katexCss = vread('katex.min.css').replace(/src:url\(fonts\/(KaTeX_[A-Za-z0-9_-]+)\.woff2\) format\("woff2"\)(,url\([^)]*\) format\("[a-z]+"\))*/g, (_, f) => `src:url(data:font/woff2;base64,${b64('katex-fonts/' + f + '.woff2')}) format("woff2")`);
if (/url\(fonts\//.test(katexCss)) throw new Error('KaTeX font not inlined');

// Each library in its own <script>; escape any closing-script sequences
const lib = (f, name) => `<script>/* ${name} — inlined for offline use */\n${vread(f).replace(/<\/script/gi, '<\\/script')}\n</script>`;
const vendorHead = `<style>/* Fonts: Inter, JetBrains Mono, Space Grotesk (SIL OFL) */\n${fontCss}</style>\n<style>/* KaTeX 0.16.9 (MIT) */\n${katexCss}</style>`;
const vendorBody = [lib('katex.min.js', 'KaTeX 0.16.9 (MIT)'), lib('auto-render.min.js', 'KaTeX auto-render (MIT)'), lib('chart.umd.min.js', 'Chart.js 4.4.1 (MIT)'), lib('three.min.js', 'Three.js r128 (MIT)'), lib('lucide.min.js', 'Lucide 0.344.0 (ISC)')].join('\n');

// Tab icon: the PhysLab atom on the brand gradient, as an inline SVG data URI (no extra file needed)
const favSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset=".55" stop-color="#3b82f6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="64" height="64" rx="15" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-width="3.6"><ellipse cx="32" cy="32" rx="23" ry="9"/><ellipse cx="32" cy="32" rx="23" ry="9" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="23" ry="9" transform="rotate(120 32 32)"/></g><circle cx="32" cy="32" r="5.2" fill="#fff"/></svg>`;
const favUri = 'data:image/svg+xml,' + encodeURIComponent(favSvg).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%22/g, "'");
const favicon = `<link rel="icon" type="image/svg+xml" href="${favUri}">\n<link rel="mask-icon" href="${favUri}" color="#8b5cf6">`;

const out = shell
  .replace('<!--__FAVICON__-->', () => favicon)
  .replace('<!--__VENDOR_HEAD__-->', () => vendorHead)
  .replace('<!--__VENDOR_BODY__-->', () => vendorBody)
  .replace('/*__CSS__*/', () => css)
  .replace('/*__JS__*/', () => js.replace(/<\/script/gi, '<\\/script'));
if (/https?:\/\/(cdnjs|cdn\.jsdelivr|fonts\.googleapis|fonts\.gstatic|unpkg)/.test(out)) throw new Error('A CDN reference is still present');
fs.writeFileSync(path.join(dir, '..', 'physlab.html'), out);
console.log('Built physlab.html (offline, self-contained)', (out.length / 1024 / 1024).toFixed(2) + ' MB');
