# MEXT Physics Study Guide

Interactive study guide for the MEXT Scholarship Physics exam — 46 topics spanning Mechanics, Thermodynamics, Waves & Sound, Electricity & Magnetism, and Optics.

**Live site → [bysandries.github.io/mext-physics](https://bysandries.github.io/mext-physics)**

## Features

- **46 topic pages** with theory, key formulas, and worked problems
- **Flashcard mode** — term/definition cards per topic
- **Quiz mode** — timed multiple-choice practice
- **Practice mode** — step-by-step problem reveal with 2.5 min timer
- **Progress dashboard** — track completed topics across all 5 parts
- **Full-text search** powered by Fuse.js
- **Exam strategy guide** — speed rules, mental-math toolkit, Japanese-convention notes
- Math rendered with KaTeX

## Syllabus coverage

| Part | Topics | Coverage |
|------|--------|----------|
| Mechanics | 1–13 | Kinematics, Newton's laws, energy, rotation, gravity, oscillations |
| Thermodynamics | 14–25 | Gas laws, first & second law, entropy, cycles |
| Waves & Sound | 26–31 | Wave mechanics, Doppler, standing waves |
| Electricity & Magnetism | 32–42 | Electrostatics, circuits, induction, Maxwell |
| Optics | 43–46 | Geometric optics, interference, diffraction |

## Local development

```bash
npm install
npm run dev       # start dev server at localhost:4321
npm run build     # parse content + build static site
npm run preview   # preview production build
```

## Stack

- [Astro](https://astro.build) — static site framework
- [Preact](https://preactjs.com) — interactive components (flashcards, quiz, practice)
- [KaTeX](https://katex.org) — math rendering
- [Fuse.js](https://fusejs.io) — fuzzy search
