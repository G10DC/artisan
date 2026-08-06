---
name: artisan
description: >-
  Pedagogical UI/UX layout, typography, and visual hierarchy engine for study
  manuals, educational web apps, and interactive learning documents. Use when
  converting Markdown knowledge bases into interactive study applications with
  layered visual hierarchy mapped to cognitive learning phases. Never use for
  general-purpose web design; never use for non-educational content layouts.
---

# Artisan — Pedagogical UI/UX & Visual Layout Engine for Higher Education

`artisan` converts Markdown knowledge bases into interactive, pedagogically optimized HTML/CSS study applications. It enforces a 6-layer visual hierarchy mapped to the 4 phases of effective study (active reading, summarization, active recall, and oral exam rehearsal) while preserving 100% of source content.

---

## 4 Study Phases & 6 Visual Layers

| Study Phase | Student Activity | Active Artisan Layers | Interactive Tools |
| :--- | :--- | :--- | :--- |
| 1. Active Reading | Read, highlight, annotate | Layer 1 (Key Terms), Layer 6 (Decision Logic) | Live Search, Term Highlighting |
| 2. Summarization | Synthesize into topic blocks, map concepts | Layer 4 (ASCII Trees), Layer 5 (Cross-Topic Links), Mermaid Mindmaps | Mermaid mindmaps, synthesis outlines |
| 3. Active Recall | Spaced repetition, self-assessment | Layer 2 (Exam Traps), 3D Flashcards | 3D Flashcards with SRS, Quiz Simulator, Progress Tracking |
| 4. Oral Rehearsal | Timed verbal presentation | Layer 3 (Oral Exam Ready Quotes), Oral Simulation | Oral Mode with countdown timer, synthesis quotes |

---

## The 6 Layers of Visual Hierarchy

### Layer 1 — Key Terms (`<strong class="highlight-term">`)
Automatic detection of core concepts, legal statutes, key dates, author names, and theoretical distinctions. High-contrast styling for rapid visual scanning ("colpo d'occhio").

### Layer 2 — Exam Traps (`❌ Common Pitfall → ✅ Correct Answer`)
Color-coded callout boxes (amber/rose) highlighting frequent misconceptions examined during oral tests:
- ❌ Common incorrect answer
- ✅ Correct response with legal or theoretical reference
- 📄 Source citation (textbook chapter / statute article / lecture date)

### Layer 3 — Oral Exam Ready Quotes (`🎯`)
Emerald green synthesis cards for instant verbal recall:
- Opening sentence pre-formulated for spoken presentation
- 2-3 core concepts to develop
- Cross-topic link to ensure fluid speech transitions

### Layer 4 — Synthesis Concept Trees (`🗺️ SYNTHESIS OUTLINE`)
ASCII tree outlines for hierarchical visual structuring alongside **Mermaid mindmaps** for non-hierarchical concept connections.

### Layer 5 — Cross-Topic Links (`🔗`)
Dedicated sections linking concepts across chapters and modules, building a cohesive narrative valued in oral examinations.

### Layer 6 — Decision Logic (KaTeX `\begin{cases}`)
Mathematical case-by-case decision trees (e.g., "When to apply Statute X vs Statute Y?").

---

## Exam Priority Markers

Every topic section can be tagged with an exam frequency marker:

| Marker | Meaning | Visual Style |
| :--- | :--- | :--- |
| 🔴 High Priority | Examined almost every semester | Red border, "HIGH PRIORITY" badge |
| 🟡 Frequent | Examined regularly | Amber border, "FREQUENT" badge |
| 🟢 Rare | Occasional / peripheral topic | Green border, "RARE" badge |

Students can filter by priority during final exam revision.

---

## Interactive Study Tools

### Phase 1 — Active Reading
- **Live Search**: Instant text filtering across all modules.
- **Term Highlighting**: Automatic detection and visual badging of statutes and key concepts.

### Phase 2 — Summarization
- **Mermaid Mindmaps**: Client-side concept relation diagrams.
- **ASCII Trees**: Hierarchical structure outlines.
- **Outline View Mode**: Hides prose and displays only outlines, tables, and diagrams.

### Phase 3 — Active Recall
- **3D Flashcards with SRS (Spaced Repetition System)**: Ebbinghaus forgetting curve algorithm (SuperMemo-2). Review intervals calculated from confidence rating (0-5).
- **Quiz Simulator**: Multiple-choice questions with instant explanations.
- **Progress Tracking**: Topic completion monitoring stored in `localStorage`.

### Phase 4 — Oral Rehearsal
- **Oral Simulation Mode**: Randomly extracts a "High Priority" topic and triggers a configurable countdown timer (e.g., 10 minutes). Students can rehearse out loud and reveal the benchmark oral synthesis sentence.
- **Sequence Simulator**: Replicates typical oral exam questioning patterns (topic → deep dive → cross-topic link).

---

## Accessibility & Inclusive Learning

- **Dyslexia-Friendly Font**: One-click toggle for high-readability fonts with expanded line spacing.
- **Text-to-Speech (TTS)**: Built-in speech synthesis for auditory learners.
- **High Contrast Theme**: Dark/Light glassmorphic theme with accessibility mode.
- **Print & PDF Export**: Clean `@media print` styles omitting navigation UI for reading on paper or tablet.

---

## Quick Start

```javascript
import { transformToPedagogicalHtml } from './lib/artisan.js';

const markdown = fs.readFileSync('study_notes.md', 'utf8');
const html = transformToPedagogicalHtml(markdown, {
  title: "Master Study Manual",
  courseCode: "SPS/04 - 12 ECTS",
  theme: "dark",
  enableQuiz: true,
  enableFlashcards: true,
  enableKaTeX: true,
  enableMermaid: true,
  enableOralMode: true,
  enableDyslexicFont: true,
  enableTTS: true
});
fs.writeFileSync('Study_Manual.html', html);
```

## API Reference

| Method | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `transformToPedagogicalHtml(md, options)` | markdown: string, options: object | string (HTML) | Full-featured study web application from raw Markdown |
| `highlightKeyTerms(text)` | text: string | string | Wraps key concepts/statutes/dates in visual markup |
| `injectExamTraps(html)` | html: string | string | Formats ❌→✅ traps into callout boxes |
| `injectOralQuotes(html)` | html: string | string | Formats 🎯 quotes into synthesis cards |
| `injectAsciiTrees(html)` | html: string | string | Wraps ASCII trees in monospaced callout boxes |
| `generateDesignSystemCss(theme)` | theme: "dark"\|"light" | string (CSS) | Generates responsive glassmorphic CSS tokens |

## Testing

```bash
node --test tests/*.test.js
```

License: MIT © G10DC


---

## ⚡ Spark Breakthrough Enhancement

- **Feature**: **Auto-Design System Synthesizer**
- **Description**: Converts wireframe images or text specs into state-of-the-art glassmorphism CSS tokens.
- **Synergy**: Integrated with `scribe` (OCR/Vision) & `spark` (aesthetics).
- **Framework**: Applied via the `spark` 4-Lens Lateral Ideation Engine.
