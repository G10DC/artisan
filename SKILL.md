---
name: artisan
description: Pedagogical UI/UX layout, typography, and visual hierarchy engine for study manuals, educational web apps, and interactive learning documents.
---

# Artisan — Pedagogical UI/UX & Visual Layout Engine

`artisan` converts markdown knowledge bases into interactive, pedagogically optimized HTML/CSS study applications, enforcing a 6-layer visual hierarchy for fast scanning ("colpo d'occhio") and oral-exam readiness while preserving 100% of source content.

## Requirements

- Node.js ≥ 18
- Peer dependencies: Mermaid.js (diagrams), KaTeX (math rendering)

## Core Principles

1. **Zero Information Loss** — every law, date, author, and nuance from source docs is preserved.
2. **Visual Hierarchy**
   - Key terms → `<strong class="highlight-term">`
   - Exam traps → `❌ Falso Mito → ✅ Risposta Esatta` callouts
   - Oral-exam quotes → `🎯 Frase Pronta per l'Orale` cards
   - Concept trees → ASCII `🗺️ SCHEMA DI SINTESI`
   - Cross-topic links → `🔗 COLLEGAMENTI E FILO CONDUTTORE`
   - Decision logic → KaTeX blocks
3. **Interactive Tools** — live search, progress tracking (localStorage), 3D flashcards, exam simulator, Mermaid diagrams, dark/light glassmorphism, print/PDF export.

## Quick Start

```javascript
import { transformToPedagogicalHtml } from './lib/artisan.js';

const markdown = fs.readFileSync('study_notes.md', 'utf8');
const html = transformToPedagogicalHtml(markdown, {
  title: "Manuale di Studio Supremo",   // string, required
  courseCode: "SPS/04 - 12 CFU",        // string, optional
  theme: "dark",                         // "dark" | "light"
  enableQuiz: true,                      // boolean
  enableFlashcards: true,                // boolean
  enableKaTeX: true,                     // boolean
  enableMermaid: true                    // boolean
});
fs.writeFileSync('Manuale_Studio.html', html);
```

## API Reference

| Method | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| `transformToPedagogicalHtml(md, options)` | markdown: string, options: object | string (HTML) | Full-featured study web app from raw markdown |
| `highlightKeyTerms(text)` | text: string | string | Wraps key concepts/laws/dates in markup |
| `injectExamTraps(html)` | html: string | string | Formats ❌→✅ traps into callouts |
| `injectOralQuotes(html)` | html: string | string | Formats 🎯 quotes into synthesis cards |
| `injectAsciiTrees(html)` | html: string | string | Wraps ASCII trees in styled callouts |
| `generateDesignSystemCss(theme)` | theme: "dark"\|"light" | string (CSS) | Generates glassmorphic CSS tokens |

## Testing

```bash
node --test tests/*.test.js
```

Test suite covers markdown parsing, term highlighting, and CSS generation output.
