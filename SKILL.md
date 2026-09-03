---
name: artisan
status: implemented
description: >-
  Pedagogical UI/UX layout, typography, and visual hierarchy engine for study
  manuals, educational web apps, and interactive learning documents. Use when
  converting Markdown knowledge bases into interactive study applications with
  layered visual hierarchy mapped to cognitive learning phases. Never use for
  general-purpose web design; never use for non-educational content layouts.
---

# Artisan — Pedagogical UI/UX & Visual Layout Engine for Higher Education

`artisan` converts Markdown knowledge bases into interactive, pedagogically optimized HTML/CSS study applications. It enforces a 6-layer visual hierarchy mapped to the 4 phases of effective study (active reading, summarization, active recall, and oral exam rehearsal) while preserving the source content -- including images, fenced code blocks and links, which earlier versions silently dropped.

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

## Markdown the parser understands

Hand-rolled parser, so this is the whole list. Anything else becomes a paragraph.

| Source | Rendered as |
| :-- | :-- |
| `# ## ### ####` | headings, with a slug id and a "Studiato" checkbox on `##` |
| `- ` / `* ` / `1. ` | study lists |
| `\| a \| b \|` | a scrollable study table |
| `> ...` | a callout, typed from its own wording (trap / legal / mnemonic / summary) |
| `---` | section divider |
| `**bold**` | Layer 1 key term |
| `` `code` `` | inline code, escaped and never re-parsed as markup |
| ```` ```lang ```` fence | a labelled code block, contents verbatim and escaped |
| `![alt](src)` | a captioned `<figure>`; a title attribute wins over the alt as caption |
| `[label](url)` | a link; external targets get `rel="noopener noreferrer"` |

Images and links pass through `safeUrl`: http(s), `mailto:`, anchors, relative
paths and base64 `data:image/*` only. Anything else -- `javascript:` included
-- degrades to the plain alt or label text instead of emitting a tag. Every
interpolated string, the document title and course code included, goes through
`escapeHtml`.

Frame images from `yt-digest` work directly: point `src` at the PNG, or embed
it as a data URI to keep the page self-contained.

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
| `parseMarkdownToCleanHtml(md)` | md: string | string (HTML) | Block-level Markdown to HTML, without the app shell |
| `escapeHtml(text)` | text: any | string | Escapes `& < > " '` for an HTML context |
| `safeUrl(url)` | url: string | string | The URL if its scheme is allowed, otherwise `""` |

## Testing

```bash
node --test tests/*.test.js
```

License: MIT © G10DC

## When to use

- Converting a Markdown study guide or knowledge base into a self-contained, interactive HTML
  study application (flashcards, quiz, oral-exam rehearsal mode) for exam prep.
- You want the 6-layer visual hierarchy (key terms, exam traps, oral quotes, synthesis trees,
  cross-links, decision logic) applied consistently across a set of study notes.

## When NOT to use

- **General-purpose web design or a marketing/product page** — this is scoped to pedagogical
  study-manual layout, not a general HTML/CSS generator.
- **Non-educational content** — the layers (exam traps, oral rehearsal, SRS flashcards) assume
  an exam-prep use case; they don't map onto arbitrary content.
- **Producing the study notes in the first place** — this renders Markdown you already
  have. For a book use `alembic`; for a video use `yt-digest`, then feed its digest
  Markdown here.
