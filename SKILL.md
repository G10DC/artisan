---
name: artisan
description: Pedagogical UI/UX layout, typography, and visual hierarchy engine for study manuals, educational web applications, and interactive learning documents.
---

# 🎨 Artisan — Pedagogical UI/UX & Visual Layout Engine

`artisan` is an automated engine that converts markdown knowledge bases and study notes into high-impact, interactive, pedagogically optimized HTML/CSS study applications.

It enforces a strict 6-layer visual hierarchy designed to maximize retention, rapid visual scanning ("colpo d'occhio"), and oral exam readiness while preserving 100% of the underlying information content.

---

## 🏛️ Core Principles & Pedagogical Standard

1. **Zero Information Loss**: Preserves every single law, date, author name, distinction, and theoretical nuance from source documents.
2. **Visual Hierarchy & Scanning ("Colpo d'Occhio")**:
   - **Key Terms**: Highlighted with custom styling (`<strong class="highlight-term">`).
   - **Exam Traps**: Callout boxes displaying `❌ Falso Mito → ✅ Risposta Esatta`.
   - **Oral Exam Quotes**: Dedicated `🎯 Frase Pronta per l'Orale` cards for instant verbal recall.
   - **ASCII Concept Trees**: Visual `🗺️ SCHEMA DI SINTESI` tree outlines.
   - **Inter-topic Connections**: `🔗 COLLEGAMENTI E FILO CONDUTTORE` bridging concepts.
   - **Algorithmic Decision Trees**: KaTeX LaTeX $\text{DECIDE}(\text{Caso}) = \begin{cases}\dots\end{cases}$ blocks.
3. **Interactive Study Tools**:
   - Live Search filtering over all sections.
   - Progress Tracking with local storage persistence.
   - 3D Flip Flashcards & Interactive Exam Simulator.
   - Client-side Mermaid.js architecture diagrams.
   - Dark / Light Glassmorphism Mode Toggle.
   - Print & PDF Export optimization (`@media print`).

---

## 🛠️ Usage & Integration

```javascript
import { transformToPedagogicalHtml, generateDesignSystemCss } from './lib/artisan.js';

const markdown = fs.readFileSync('study_notes.md', 'utf8');

const html = transformToPedagogicalHtml(markdown, {
  title: "Manuale di Studio Supremo",
  courseCode: "SPS/04 - 12 CFU",
  theme: "dark",
  enableQuiz: true,
  enableFlashcards: true,
  enableKaTeX: true,
  enableMermaid: true
});

fs.writeFileSync('Manuale_Studio.html', html);
```

---

## 📊 Engine API Reference

| Method | Description |
| :--- | :--- |
| `transformToPedagogicalHtml(md, options)` | Transforms raw Markdown into a full-featured HTML study web app. |
| `highlightKeyTerms(text)` | Auto-detects and wraps key concepts, laws, and dates in high-impact markup. |
| `injectExamTraps(html)` | Formats `❌ -> ✅` exam traps into color-coded amber/rose callouts. |
| `injectOralQuotes(html)` | Formats `🎯` quotes into emerald synthesis cards. |
| `injectAsciiTrees(html)` | Wraps ASCII tree outlines in purple monospaced callouts. |
| `generateDesignSystemCss(theme)` | Generates responsive, glassmorphic CSS tokens and media queries. |

---

## 🧪 Testing

Run test suite via native Node test runner:

```bash
node --test tests/*.test.js
```
