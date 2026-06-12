/**
 * MEXT Physics Study Guide — Markdown → Topic JSON Parser
 *
 * Reads MEXT_Physics_Undergrad_Master_Study_Guide.md and outputs:
 *   src/content/topics/t01.json … t46.json   (raw markdown content)
 *   public/data/search.json
 *
 * Content stored as raw markdown/LaTeX; rendering happens in components
 * using KaTeX (server-side in Astro, client-side in Preact).
 *
 * The guide uses several label spellings, all of which must survive:
 *   **Parameters** / **Parameters (shared)**
 *   **Formulas needed:** …            (single-part problems)
 *   *Formulas:* …                     (multi-part problems)
 *   **Calculations:** / *Calculations:* / *Calculations (units of …):*
 *   **Answer:** …
 *   **Conclusion:** / *Conclusion:*   (same-line content)
 *   **Theory.** / **Theory & Key Formulas.** / **Theory (double slit).**
 *   **Problem-Solving Framework** / **Problem-Solving Framework.** / **Framework.**
 *   **Cross-references:** / **Worked variants:** / **Worked variant:**
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MD_PATH = resolve(ROOT, 'MEXT_Physics_Undergrad_Master_Study_Guide.md');
const TOPICS_OUT = resolve(ROOT, 'src', 'content', 'topics');
const SEARCH_OUT = resolve(ROOT, 'public', 'data');

mkdirSync(TOPICS_OUT, { recursive: true });
mkdirSync(SEARCH_OUT, { recursive: true });

const md = readFileSync(MD_PATH, 'utf-8');

function clean(text) { return text.replace(/\n{3,}/g, '\n\n').trim(); }

const PART_NAMES = {
  'PART I': 'Mechanics', 'PART II': 'Thermodynamics',
  'PART III': 'Waves & Sound', 'PART IV': 'Electricity & Magnetism', 'PART V': 'Optics',
};
const PART_NUMBERS = { 'PART I': 1, 'PART II': 2, 'PART III': 3, 'PART IV': 4, 'PART V': 5 };

// ── Structural line matchers ─────────────────────────────────────────
const THEORY_RE = /^\*\*Theory([^*]*)\.?\*\*\s*(.*)$/;
const KEY_FORMULAS_RE = /^\*\*Key Formulas\*\*\s*$/;
const FRAMEWORK_RE = /^\*\*(?:Problem-Solving )?Framework\.?\*\*:?\s*(.*)$/;
const CONNECTIONS_RE = /^\*\*(Cross-references?|Worked variants?):\*\*\s*(.*)$/;
const PROBLEM_RE = /^#### Problem (\S+) — (.*)$/;
const PART_HEADING_RE = /^\*\*\((\d+)\)\s*(.*?)\*\*\s*$/;
const LABEL_RE = /^\*{1,2}(Parameters|Formulas needed|Formulas|Calculations|Answer|Conclusion)\b([^*]*)\*{1,2}:?\s*(.*)$/;
const LABEL_MAP = {
  'Parameters': 'parameters', 'Formulas needed': 'formulas', 'Formulas': 'formulas',
  'Calculations': 'calculations', 'Answer': 'answer', 'Conclusion': 'conclusion',
};

function isStructural(line) {
  return THEORY_RE.test(line) || KEY_FORMULAS_RE.test(line) || FRAMEWORK_RE.test(line)
    || CONNECTIONS_RE.test(line) || PROBLEM_RE.test(line) || /^---/.test(line) || /^<a id=/.test(line);
}

// Split on a separator, ignoring separators inside $…$ math.
function splitTopLevel(text, sep) {
  const parts = [];
  let depth = false, last = 0, i = 0;
  while (i < text.length) {
    if (text[i] === '$') depth = !depth;
    if (!depth && text.startsWith(sep, i)) {
      parts.push(text.slice(last, i));
      i += sep.length; last = i;
    } else i++;
  }
  parts.push(text.slice(last));
  return parts.map(p => p.trim()).filter(Boolean);
}

// "$latex$ — description" or "label: $latex$ (note)" → { latex, description }
function parseFormula(text) {
  const m = text.match(/\$(.+?)\$/);
  if (!m) return { latex: '', description: text.trim() };
  const prefix = text.slice(0, m.index).trim().replace(/[—:]\s*$/, '').trim();
  const suffix = text.slice(m.index + m[0].length).trim().replace(/^[—:]\s*/, '').trim();
  const description = [prefix, suffix].filter(Boolean).join(' — ');
  return { latex: m[1], description };
}

// Split "1. Foo. 2. Bar." prose into numbered steps (only at the running 1., 2., … markers).
function splitSteps(text) {
  const t = clean(text);
  if (!t) return [];
  const marks = [];
  let expected = 1, inMath = false;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '$') inMath = !inMath;
    if (inMath) continue;
    if ((i === 0 || /\s/.test(t[i - 1]))) {
      const m = t.slice(i).match(/^(\d+)\.\s+/);
      if (m && parseInt(m[1]) === expected) { marks.push({ idx: i, skip: m[0].length }); expected++; }
    }
  }
  if (marks.length === 0) return [t];
  const steps = [];
  const lead = t.slice(0, marks[0].idx).trim();
  if (lead) steps.push(lead);
  for (let k = 0; k < marks.length; k++) {
    const start = marks[k].idx + marks[k].skip;
    const end = k + 1 < marks.length ? marks[k + 1].idx : t.length;
    const s = t.slice(start, end).trim();
    if (s) steps.push(s);
  }
  return steps;
}

// Collect labeled segments (Parameters / Formulas / Calculations / Answer / Conclusion)
// from a run of lines. Unlabeled leading lines (e.g. "*Two independent derivations…*"
// bullets) are folded into `formulas` so no reasoning is lost.
function collectSegments(lines) {
  const seg = { parameters: '', formulas: '', calculations: '', answer: '', conclusion: '' };
  let current = null, leading = [];
  const push = (key, text) => { seg[key] = seg[key] ? seg[key] + '\n' + text : text; };
  for (const line of lines) {
    if (/^---/.test(line) || /^<a id=/.test(line)) break;
    const lm = line.match(LABEL_RE);
    if (lm) {
      current = LABEL_MAP[lm[1]];
      if (lm[3].trim()) push(current, lm[3].trim());
      continue;
    }
    if (!line.trim()) { if (current === null) continue; push(current, ''); continue; }
    if (current === null) leading.push(line);
    else push(current, line);
  }
  if (leading.length) seg.formulas = clean(leading.join('\n') + (seg.formulas ? '\n' + seg.formulas : ''));
  for (const k of Object.keys(seg)) seg[k] = clean(seg[k]);
  return seg;
}

function parseProblem(text) {
  const lines = text.split('\n');
  const hm = lines[0].match(PROBLEM_RE);
  if (!hm) return null;
  const examRef = hm[1].trim();
  const title = hm[2].trim();
  const year = parseInt(examRef.match(/^(\d{4})/)?.[1] || '0');

  // Locate numbered sub-part headings.
  const headings = [];
  for (let i = 1; i < lines.length; i++) {
    const pm = lines[i].match(PART_HEADING_RE);
    if (pm) headings.push({ idx: i, partNum: parseInt(pm[1]), title: pm[2].trim() });
  }

  if (headings.length === 0) {
    const seg = collectSegments(lines.slice(1));
    const hasContent = Object.values(seg).some(Boolean);
    return { examRef, title, year, parts: hasContent ? [{ partNum: 1, title: '', ...seg }] : [] };
  }

  // Shared preamble (Parameters (shared) etc.) before the first sub-part.
  const shared = collectSegments(lines.slice(1, headings[0].idx));
  const parts = headings.map((h, k) => {
    const end = k + 1 < headings.length ? headings[k + 1].idx : lines.length;
    const seg = collectSegments(lines.slice(h.idx + 1, end));
    if (!seg.parameters && shared.parameters) seg.parameters = shared.parameters;
    return { partNum: h.partNum, title: h.title, ...seg };
  });
  return { examRef, title, year, parts };
}

// ── Split markdown into topic sections ───────────────────────────────
const topicAnchorRegex = /^<a id="(t\d+)"><\/a>$/gm;
const anchors = [];
let aMatch;
while ((aMatch = topicAnchorRegex.exec(md)) !== null) {
  if (/^t\d+$/.test(aMatch[1])) anchors.push({ id: aMatch[1], index: aMatch.index });
}

const sections = [];
let currentPart = '', currentPartNum = 0;
const partHeadingRegex = /^# (PART [IVXLCD]+)/;

for (let i = 0; i < anchors.length; i++) {
  const start = anchors[i].index;
  const end = i + 1 < anchors.length ? anchors[i + 1].index : md.indexOf('# APPENDICES') !== -1 ? md.indexOf('# APPENDICES') : md.length;
  const raw = md.slice(start, end);
  const before = md.slice(0, start);

  const partLines = before.split('\n').filter(l => partHeadingRegex.test(l));
  if (partLines.length > 0) {
    const pm = partLines[partLines.length - 1].match(partHeadingRegex);
    if (pm) { currentPart = PART_NAMES[pm[1]] || ''; currentPartNum = PART_NUMBERS[pm[1]] || 0; }
  }

  let lines = raw.split('\n');
  const tMatch = lines.find(l => /^## Topic \d+/.test(l))?.match(/^## Topic (\d+) — (.+)$/);
  if (!tMatch) { console.warn(`  ⚠ No topic header at ${anchors[i].id}`); continue; }
  const number = parseInt(tMatch[1]);
  const rawTitle = tMatch[2].trim();
  const theoryOnly = /\[theory only/i.test(rawTitle);
  const title = rawTitle.replace(/\s*\*\*\[.*?\]\*\*\s*/g, ' ').replace(/\s*\[.*?\]\s*/g, ' ').trim();

  // Pull out cross-reference / worked-variant lines wherever they appear,
  // so they become navigable connections instead of being silently dropped.
  const connections = [];
  lines = lines.filter(l => {
    const cm = l.match(CONNECTIONS_RE);
    if (cm && cm[2].trim()) { connections.push(cm[2].trim()); return false; }
    return true;
  });

  // Theory (possibly several blocks, e.g. "Theory (double slit)" + "Theory (thin film …)").
  const theoryBlocks = [];
  for (let li = 0; li < lines.length; li++) {
    const tm = lines[li].match(THEORY_RE);
    if (!tm) continue;
    const label = tm[1].replace(/^[\s&]*/, '').replace(/\.$/, '').trim(); // "(double slit)" or "& Key Formulas"
    const block = [tm[2] || ''];
    for (let lj = li + 1; lj < lines.length; lj++) {
      if (isStructural(lines[lj]) || PART_HEADING_RE.test(lines[lj])) break;
      block.push(lines[lj]);
    }
    const body = clean(block.join('\n'));
    if (body) theoryBlocks.push(label && !/Key Formulas/.test(label) ? `**${label.replace(/[()]/g, '')}.** ${body}` : body);
  }
  const theory = theoryBlocks.join('\n\n');

  // Key Formulas bullets — each bullet may chain several formulas with " · ".
  const formulas = [];
  const kfIdx = lines.findIndex(l => KEY_FORMULAS_RE.test(l));
  if (kfIdx !== -1) {
    for (let li = kfIdx + 1; li < lines.length; li++) {
      const l = lines[li];
      if (isStructural(l)) break;
      const t = l.trim();
      if (t.startsWith('- ')) {
        for (const piece of splitTopLevel(t.slice(2), ' · ')) formulas.push(parseFormula(piece));
      } else if (t.startsWith('$$')) {
        formulas.push({ latex: t.replace(/^\$\$|\$\$$/g, ''), description: '' });
      }
    }
  }

  // Problem-Solving Framework — heading form (numbered lines follow) or
  // sentence form ("**Problem-Solving Framework.** Whole-system N2 …").
  let framework = [];
  for (let li = 0; li < lines.length; li++) {
    const fm = lines[li].match(FRAMEWORK_RE);
    if (!fm) continue;
    const block = [fm[1] || ''];
    for (let lj = li + 1; lj < lines.length; lj++) {
      if (isStructural(lines[lj]) || PART_HEADING_RE.test(lines[lj])) break;
      block.push(lines[lj]);
    }
    framework = splitSteps(block.join('\n'));
    break;
  }

  // Problems.
  const pSections = [];
  let pStart = -1;
  for (let li = 0; li < lines.length; li++) {
    if (PROBLEM_RE.test(lines[li])) { if (pStart !== -1) pSections.push(lines.slice(pStart, li).join('\n')); pStart = li; }
  }
  if (pStart !== -1) pSections.push(lines.slice(pStart).join('\n'));
  const problems = pSections.map(s => parseProblem(s)).filter(Boolean);

  sections.push({
    id: anchors[i].id, number, title, part: currentPart, partNumber: currentPartNum,
    anchor: anchors[i].id, theory, formulas, framework, problems, connections, tags: [], theoryOnly,
  });
}

// ── Write topics ─────────────────────────────────────────────────────
for (const topic of sections) {
  writeFileSync(resolve(TOPICS_OUT, `${topic.id}.json`), JSON.stringify(topic, null, 2), 'utf-8');
  console.log(`  ✓ ${topic.id.padEnd(4)} ${topic.title.slice(0, 60).padEnd(63)} (${topic.problems.length} problems, ${topic.connections.length} connections)`);
}

// Search index
const searchIndex = sections.map(t => ({
  id: t.id, number: t.number, title: t.title, part: t.part,
  partNumber: t.partNumber, tags: [], theoryOnly: t.theoryOnly,
}));
writeFileSync(resolve(SEARCH_OUT, 'search.json'), JSON.stringify(searchIndex, null, 2), 'utf-8');

const partTotal = sections.reduce((s, t) => s + t.problems.reduce((a, p) => a + p.parts.length, 0), 0);
const concTotal = sections.reduce((s, t) => s + t.problems.reduce((a, p) => a + p.parts.filter(x => x.conclusion).length, 0), 0);
console.log(`\n✅ Done — ${sections.length} topics, ${sections.reduce((s, t) => s + t.problems.length, 0)} problems, ${partTotal} parts (${concTotal} with conclusions)`);
