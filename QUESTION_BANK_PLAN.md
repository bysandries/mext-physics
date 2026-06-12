# Question Bank Plan — 460 MEXT-Style Questions

Goal: a curated bank of **10 multiple-choice questions per topic × 46 topics = 460 questions**, modeled on the real MEXT exams in `/examples` (adapted past questions + new original questions in the same style).

Built in **23 phases of 20 questions (2 topics per phase)**, because of per-session output limits.

## Question format

One file per topic: `src/content/questions/<topicId>.json`

```json
{
  "topicId": "t01",
  "questions": [
    {
      "id": "t01-q01",
      "source": "2016-UG-Q1-(1)",      // real exam ref, "adapted: <ref>", or "original"
      "question": "Markdown + $LaTeX$ problem statement.",
      "choices": ["$vt$", "$\\frac{1}{2}vt$", "..."],   // 4–6 choices, MEXT uses 6
      "correctIndex": 1,
      "explanation": "Why the answer is right + common traps."
    }
  ]
}
```

Style rules (matching `/examples`):
- Mostly **symbolic** answers (express in terms of $m$, $v$, $g$, …); some numeric like real exams.
- 6 choices (a)–(f) where possible; distractors are *plausible errors* (sign flips, missing ½, swapped ratios).
- Each topic mixes: ~2–4 questions adapted from real past exams (cite source), rest original in identical style.
- Explanations are short: the key step + the trap the distractors represent.

## Infrastructure (done in Phase 1)

- [x] `questions` content collection in `src/content/config.ts`
- [x] `QuizPanel.tsx` reads the curated bank (per-part filter, random 10) instead of improvising choices from other topics' answers

## Phases

| Phase | Topics | Status |
|-------|--------|--------|
| 1  | t01 Uniform Acceleration Kinematics, t02 Projectile Motion | ✅ done |
| 2  | t03 Newton's Laws, t04 Friction | ✅ done |
| 3  | t05 Circular Motion, t06 Pendulum Motion | ✅ done |
| 4  | t07 Atwood Machine, t08 Work–Energy Theorem | ✅ done |
| 5  | t09 Coefficient of Restitution, t10 Inelastic Collisions | ⬜ |
| 6  | t11 Simple Harmonic Motion, t12 Escape Velocity & Surface Gravity | ⬜ |
| 7  | t13 Kepler's Third Law, t14 Ideal Gas Law | ⬜ |
| 8  | t15 Internal Energy of Monatomic Gas, t16 Isobaric Processes | ⬜ |
| 9  | t17 Isochoric Processes, t18 Isothermal Processes | ⬜ |
| 10 | t19 Adiabatic Processes, t20 First Law of Thermodynamics | ⬜ |
| 11 | t21 Molar Specific Heats, t22 PV Diagrams & Cycles | ⬜ |
| 12 | t23 Gas Density/Temperature, t24 Gas Mixing | ⬜ |
| 13 | t25 Piston–Cylinder Systems, t26 Traveling Waves & Sound | ⬜ |
| 14 | t27 Standing Waves, t28 Resonance in Pipes | ⬜ |
| 15 | t29 Speed of Sound, t30 Doppler Effect | ⬜ |
| 16 | t31 Beats, t32 Coulomb's Law & Potential Energy | ⬜ |
| 17 | t33 Electric Potential & Uniform Fields, t34 Capacitors | ⬜ |
| 18 | t35 Hall Effect, t36 Lorentz Force | ⬜ |
| 19 | t37 Charge in a Magnetic Field, t38 Electromagnetic Induction | ⬜ |
| 20 | t39 Magnetic Fields from Wires, t40 RC Circuits | ⬜ |
| 21 | t41 RL Circuits & LC Oscillations, t42 Joule Heating | ⬜ |
| 22 | t43 Snell's Law, t44 Total Internal Reflection | ⬜ |
| 23 | t45 Young's Double Slit & Thin Films, t46 Light Through Multiple Media | ⬜ |

## How to continue

In a new session say: **"Continue the question bank plan — do the next phase"**. The assistant should:
1. Read this file to find the next ⬜ phase.
2. Read the two topic JSONs (`src/content/topics/tNN.json`) for theory/formulas/real exam problems.
3. Grep `/examples` for related past-exam questions to adapt.
4. Write the two `src/content/questions/tNN.json` files (10 questions each).
5. Run `npm run build` to validate against the schema.
6. Mark the phase ✅ here.
