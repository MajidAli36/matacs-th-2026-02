import sharp from "sharp";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="980" viewBox="0 0 1400 980">
  <defs>
    <style>
      .title { font-family: Georgia, 'Times New Roman', serif; font-size: 28px; fill: #1a2332; }
      .sub { font-family: Georgia, 'Times New Roman', serif; font-size: 14px; fill: #5a6577; }
      .box { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; fill: #1a2332; }
      .small { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; fill: #3d4a5c; }
      .legend { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 12px; fill: #1a2332; }
    </style>
  </defs>

  <rect width="1400" height="980" fill="#f7f3eb"/>
  <text x="48" y="48" class="title">Proposal triage — upload to ranked list</text>
  <text x="48" y="72" class="sub">MATACS-TH-2026-02 · AI steps, rule steps, human checkpoints</text>

  <!-- Legend -->
  <rect x="48" y="100" width="18" height="18" rx="3" fill="#dce8f5" stroke="#3a6d9a" stroke-width="2"/>
  <text x="74" y="114" class="legend">Rules / code</text>
  <rect x="180" y="100" width="18" height="18" rx="3" fill="#e7f0e4" stroke="#4d7a45" stroke-width="2"/>
  <text x="206" y="114" class="legend">AI</text>
  <rect x="260" y="100" width="18" height="18" rx="3" fill="#f5e6d0" stroke="#a06b2c" stroke-width="2"/>
  <text x="286" y="114" class="legend">Human</text>
  <rect x="370" y="100" width="18" height="18" rx="3" fill="#f0e0e0" stroke="#9a4444" stroke-width="2"/>
  <text x="396" y="114" class="legend">Stop / branch</text>

  <!-- Row 1 -->
  <rect x="48" y="160" width="200" height="70" rx="8" fill="#f5e6d0" stroke="#a06b2c" stroke-width="2"/>
  <text x="68" y="190" class="box">1. Reviewer uploads</text>
  <text x="68" y="210" class="small">PDFs + picks category</text>

  <path d="M248 195 H290" stroke="#5a6577" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
  <polygon points="290,190 302,195 290,200" fill="#5a6577"/>

  <rect x="310" y="160" width="210" height="70" rx="8" fill="#dce8f5" stroke="#3a6d9a" stroke-width="2"/>
  <text x="330" y="190" class="box">2. Load criteria snapshot</text>
  <text x="330" y="210" class="small">Admin config, freeze for run</text>

  <path d="M520 195 H560" stroke="#5a6577" stroke-width="2" fill="none"/>
  <polygon points="560,190 572,195 560,200" fill="#5a6577"/>

  <rect x="580" y="160" width="210" height="70" rx="8" fill="#dce8f5" stroke="#3a6d9a" stroke-width="2"/>
  <text x="600" y="190" class="box">3. Extract PDF text</text>
  <text x="600" y="210" class="small">Text layer / OCR fallback</text>

  <path d="M790 195 H830" stroke="#5a6577" stroke-width="2" fill="none"/>
  <polygon points="830,190 842,195 830,200" fill="#5a6577"/>

  <rect x="850" y="160" width="230" height="70" rx="8" fill="#e7f0e4" stroke="#4d7a45" stroke-width="2"/>
  <text x="870" y="190" class="box">4. AI field extraction</text>
  <text x="870" y="210" class="small">Prompt 1 → structured JSON</text>

  <!-- Row 2 human check -->
  <line x1="965" y1="230" x2="965" y2="280" stroke="#5a6577" stroke-width="2"/>
  <polygon points="960,280 965,292 970,280" fill="#5a6577"/>

  <rect x="850" y="300" width="230" height="70" rx="8" fill="#f5e6d0" stroke="#a06b2c" stroke-width="2"/>
  <text x="870" y="330" class="box">5. Reviewer spot-check</text>
  <text x="870" y="350" class="small">Fix licence / price if wrong</text>

  <line x1="850" y1="335" x2="720" y2="335" stroke="#5a6577" stroke-width="2"/>
  <polygon points="720,330 708,335 720,340" fill="#5a6577"/>

  <rect x="480" y="300" width="230" height="70" rx="8" fill="#dce8f5" stroke="#3a6d9a" stroke-width="2"/>
  <text x="500" y="330" class="box">6. Mandatory rules gate</text>
  <text x="500" y="350" class="small">Licence, WSIB, $5M, etc.</text>

  <!-- Branch -->
  <line x1="595" y1="370" x2="595" y2="420" stroke="#5a6577" stroke-width="2"/>
  <polygon points="590,420 595,432 600,420" fill="#5a6577"/>

  <rect x="470" y="440" width="250" height="78" rx="8" fill="#f0e0e0" stroke="#9a4444" stroke-width="2"/>
  <text x="490" y="470" class="box">7. Status decision (rules)</text>
  <text x="490" y="490" class="small">fail mandatory → ineligible</text>
  <text x="490" y="506" class="small">injection / missing weeks → flagged</text>

  <!-- three outs -->
  <line x1="470" y1="479" x2="200" y2="479" stroke="#5a6577" stroke-width="2"/>
  <line x1="200" y1="479" x2="200" y2="560" stroke="#5a6577" stroke-width="2"/>
  <polygon points="195,560 200,572 205,560" fill="#5a6577"/>

  <rect x="70" y="580" width="260" height="70" rx="8" fill="#f0e0e0" stroke="#9a4444" stroke-width="2"/>
  <text x="90" y="610" class="box">Ineligible / Flagged</text>
  <text x="90" y="630" class="small">Parked — no auto rank</text>

  <line x1="200" y1="650" x2="200" y2="720" stroke="#5a6577" stroke-width="2"/>
  <line x1="200" y1="720" x2="480" y2="720" stroke="#5a6577" stroke-width="2"/>

  <rect x="70" y="740" width="260" height="70" rx="8" fill="#f5e6d0" stroke="#a06b2c" stroke-width="2"/>
  <text x="90" y="770" class="box">8. Human clears flags</text>
  <text x="90" y="790" class="small">Override + required comment</text>

  <!-- eligible path -->
  <line x1="720" y1="479" x2="900" y2="479" stroke="#5a6577" stroke-width="2"/>
  <line x1="900" y1="479" x2="900" y2="560" stroke="#5a6577" stroke-width="2"/>
  <polygon points="895,560 900,572 905,560" fill="#5a6577"/>
  <text x="730" y="468" class="small">eligible</text>

  <rect x="790" y="580" width="250" height="70" rx="8" fill="#dce8f5" stroke="#3a6d9a" stroke-width="2"/>
  <text x="810" y="608" class="box">9a. Numeric scores (code)</text>
  <text x="810" y="628" class="small">Price, timeline, warranty math</text>

  <rect x="1090" y="580" width="250" height="70" rx="8" fill="#e7f0e4" stroke="#4d7a45" stroke-width="2"/>
  <text x="1110" y="608" class="box">9b. Soft scores (AI)</text>
  <text x="1110" y="628" class="small">Experience + team only</text>

  <line x1="1040" y1="615" x2="1090" y2="615" stroke="#5a6577" stroke-width="2"/>
  <polygon points="1090,610 1102,615 1090,620" fill="#5a6577"/>

  <line x1="915" y1="650" x2="915" y2="700" stroke="#5a6577" stroke-width="2"/>
  <line x1="1215" y1="650" x2="1215" y2="700" stroke="#5a6577" stroke-width="2"/>
  <line x1="915" y1="700" x2="1215" y2="700" stroke="#5a6577" stroke-width="2"/>
  <line x1="1065" y1="700" x2="1065" y2="730" stroke="#5a6577" stroke-width="2"/>
  <polygon points="1060,730 1065,742 1070,730" fill="#5a6577"/>

  <rect x="940" y="750" width="250" height="70" rx="8" fill="#dce8f5" stroke="#3a6d9a" stroke-width="2"/>
  <text x="960" y="780" class="box">10. Weighted sum + sort</text>
  <text x="960" y="800" class="small">Snapshot weights; stable order</text>

  <line x1="1065" y1="820" x2="1065" y2="860" stroke="#5a6577" stroke-width="2"/>
  <line x1="1065" y1="860" x2="480" y2="860" stroke="#5a6577" stroke-width="2"/>
  <line x1="480" y1="860" x2="480" y2="880" stroke="#5a6577" stroke-width="2"/>
  <line x1="200" y1="810" x2="200" y2="860" stroke="#5a6577" stroke-width="2"/>

  <rect x="280" y="880" width="420" height="70" rx="8" fill="#f5e6d0" stroke="#a06b2c" stroke-width="2"/>
  <text x="300" y="910" class="box">11. Reviewer + award decision</text>
  <text x="300" y="930" class="small">Ranked list is advice. Human picks winner. Everything logged.</text>

  <!-- Admin side note -->
  <rect x="1100" y="160" width="240" height="90" rx="8" fill="#f5e6d0" stroke="#a06b2c" stroke-width="2" stroke-dasharray="5 3"/>
  <text x="1120" y="190" class="box">Admin (anytime)</text>
  <text x="1120" y="210" class="small">Edit criteria / weights</text>
  <text x="1120" y="228" class="small">Old runs stay frozen;</text>
  <text x="1120" y="244" class="small">re-score = new run</text>
</svg>`;

const outSvg = join(__dirname, "process-flow.svg");
const outPng = join(__dirname, "process-flow.png");
writeFileSync(outSvg, svg);
await sharp(Buffer.from(svg)).png().toFile(outPng);
console.log("wrote", outPng);
