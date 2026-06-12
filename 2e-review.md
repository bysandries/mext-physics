# 2e Adaptation Review — MEXT Physics Study Site

A review of the course content, curriculum, and project structure against the twice-exceptional
(2e) adult-learning directions (strengths-based instruction, dual differentiation, UDL,
curriculum compacting, compensatory strategies, self-regulated learning), and the changes made.

## Review findings

### The source content was already strongly 2e-aligned

The master study guide is unusually well suited to a gifted/ADHD cognitive profile:

- **Insight-first theory.** Each topic opens with the governing idea ("displacement = area under
  the v–t curve; draw the triangle"), not definitions — top-down, pattern-first exposition.
- **Metacognitive conclusions.** Every worked problem ends with a `Conclusion` carrying limit-case
  checks, planted-trap analysis, "two routes" comparisons, and benchmark numbers — exactly the
  self-regulated-learning (SRL) and compensatory-strategy content the 2e literature prioritizes.
- **Compensatory speed rules.** The "ten speed rules" and mental-math toolkit are bypass
  strategies (dimensional analysis, limiting cases, never integrate) rather than rote drilling.
- **Cross-referenced network.** Topics link laterally ("Cross-references:", "Worked variants:",
  "via Topic N") — a latent concept map.

### …but the build pipeline destroyed the best of it

The markdown → JSON parser silently lost the highest-value layers:

| Lost content | Scale | 2e relevance |
|---|---|---|
| Problem **conclusions** | **95 of 95** empty | The SRL/metacognition layer — traps, limit checks, sanity reflexes |
| Multi-part **calculations** | 71 of 95 empty | The worked reasoning itself |
| Per-part **formulas** | most multi-part problems | The "which tool and why" step |
| **Frameworks** | 26 of 46 collapsed into one unnumbered blob; 15 sentence-form ones dropped entirely | The executive-function scaffold (downward differentiation) |
| **Cross-references / worked variants** | all dropped | The concept-map edges |
| Problem & part **titles** | all dropped | Big-picture labels that reduce working-memory load |
| Sections 1–3 + Appendices B–D | never parsed | The entire compensatory strategy layer |

Cause: the guide uses `*Conclusion:*` / `*Calculations:*` (single asterisk, same-line content) in
multi-part problems but `**Conclusion:**` in single-part ones; the old parser only matched the
latter, and only as block headings.

## Changes made

1. **Parser rewritten for full fidelity** (`scripts/parse-markdown.js`).
   Handles every label variant (single/double asterisk, same-line content, `Calculations (units
   of …)`, `Theory & Key Formulas`, `Theory (double slit)`, sentence-form frameworks). Result:
   95/95 answers + parameters, 91/95 calculations (4 have none in the source), **59/59
   conclusions**, 31 topics with properly split frameworks (104 steps), formula bullets split
   into individual cards.
   - *2e mapping:* restores the metacognition layer to the progressive-reveal flow — the
     "Conclusion" step is now the payoff of every problem (dual differentiation: scaffolded
     process, full-complexity content).

2. **Connections as first-class content** (`connections` field in schema; new "Connections"
   section on topic pages; `Topic N` mentions auto-linked in theory and connections text).
   - *2e mapping:* concept-map navigation leverages pattern-recognition strengths and supports
     non-linear, interest-driven traversal instead of lock-step ordering.

3. **Problem and part titles surfaced** (e.g. "Block riding a sliding plank", "Force acting
   on Q") in problem headers and reveal steps.
   - *2e mapping:* big-picture labels before detail; offloads working memory while scanning.

4. **New `/strategy` page** (test-day facts, ten speed rules, constants & benchmarks,
   mental-math toolkit, 3-pass drill plan), linked in the header nav.
   - *2e mapping:* the compensatory/bypass layer is now part of the curriculum, not buried in a
     markdown file. The 3-pass plan explicitly endorses curriculum compacting ("if a topic is
     already solid, mark it and move on").

## Recommended next steps (not yet implemented)

- **Compacting check per topic:** a 1-question diagnostic at the top of each topic ("solve this
  in 2.5 min → skip to problems / mark mastered") to formalize curriculum compacting.
- **Feed conclusions into flashcards:** the restored conclusions are ideal SM-2 card material
  (trap-recognition cards: "options 0.13/1.3/13 — what is being tested?").
- **Visual concept map page:** render the `connections` graph (46 nodes, parts as clusters) for
  spatial navigation; the data now exists in the JSON.
- **Quiz "why" feedback:** after answering, show the problem's conclusion as the explanation —
  turning every wrong answer into a limit-check lesson.
- **Hyperfocus-friendly sessions:** a "next most-connected unstudied topic" suggestion on the
  progress page, so momentum follows interest chains rather than topic numbering.
