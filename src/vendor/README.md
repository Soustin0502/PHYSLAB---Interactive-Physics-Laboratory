# Vendored libraries and fonts

These files are inlined into `physlab.html` by `node src/build.js`, so the app works with no internet connection.

| File | Source | Licence |
|---|---|---|
| `katex.min.js`, `katex.min.css`, `auto-render.min.js`, `katex-fonts/*.woff2` | KaTeX 0.16.9 (cdnjs) | MIT |
| `chart.umd.min.js` | Chart.js 4.4.1 (cdnjs) | MIT |
| `three.min.js` | Three.js r128 (cdnjs) | MIT |
| `lucide.min.js` | Lucide 0.344.0 (jsDelivr) | ISC |
| `fonts.css`, `fonts/*.woff2` | Inter, JetBrains Mono, Space Grotesk (Google Fonts: latin, latin-ext, greek subsets) | SIL Open Font License 1.1 |

Only the WOFF2 versions of the KaTeX fonts are embedded; every browser that can run PhysLab supports WOFF2.
