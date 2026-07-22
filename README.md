# Artisan — Pedagogical UI/UX & Visual Layout Engine for Higher Education

`artisan` is a zero-dependency, ultra-lightweight Node.js engine for converting raw Markdown knowledge bases into interactive, beautifully formatted, high-retention HTML study web applications.

## 4 Study Phases & 6 Visual Layers

| Study Phase | Student Activity | Active Artisan Layers | Interactive Tools |
| :--- | :--- | :--- | :--- |
| 1. Active Reading | Read, highlight, annotate | Layer 1 (Key Terms), Layer 6 (Decision Logic) | Live Search, Term Highlighting |
| 2. Summarization | Synthesize into topic blocks, map concepts | Layer 4 (ASCII Trees), Layer 5 (Cross-Topic Links), Mermaid Mindmaps | Mermaid mindmaps, synthesis outlines |
| 3. Active Recall | Spaced repetition, self-assessment | Layer 2 (Exam Traps), 3D Flashcards | 3D Flashcards with SRS, Quiz Simulator, Progress Tracking |
| 4. Oral Rehearsal | Timed verbal presentation | Layer 3 (Oral Exam Ready Quotes), Oral Simulation | Oral Mode with countdown timer, synthesis quotes |

## Features

- **6-Layer Visual Hierarchy**: Highlighted key terms, legal badges, callout boxes for exam traps (`❌ -> ✅`), oral exam synthesis quotes (`🎯`), and ASCII tree outlines (`🗺️`).
- **Spaced Repetition System (SRS)**: SuperMemo-2 (SM-2) algorithm for optimal memory retention.
- **Oral Exam Simulation Mode**: Configurable countdown timer (10 minutes) with benchmark oral synthesis sentences.
- **LaTeX Math Decision Algorithms**: KaTeX case-by-case decision trees (`\begin{cases}`).
- **Accessibility & DSA Support**: One-click Dyslexia-friendly font toggle and Speech Synthesis (Text-to-Speech).
- **Client-side Mermaid.js**: Renders mindmaps, architecture diagrams, and historical timelines.
- **Print & PDF Optimization**: Clean `@media print` styles for reading on paper or tablet.

## Usage

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

## Testing

```bash
node --test tests/*.test.js
```

## License

MIT © G10DC
