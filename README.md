# 🎨 Artisan — Pedagogical UI/UX & Visual Layout Engine

`artisan` is a zero-dependency, ultra-lightweight Node.js engine for converting raw Markdown knowledge bases into interactive, beautifully formatted, high-retention HTML study web applications.

## Features

- **6-Layer Visual Hierarchy**: Highlighted key terms, legal badges, callout boxes for exam traps (`❌ -> ✅`), oral exam synthesis quotes (`🎯`), and ASCII tree outlines (`🗺️`).
- **LaTeX Math Decision Algorithms**: Supports $\text{DECIDE}()$ decision trees via KaTeX rendering.
- **Client-side Mermaid.js**: Renders architecture diagrams and historical timelines.
- **Interactive Tools**: Live search, progress checkboxes with local storage persistence, 3D flip flashcards, and exam simulator quiz.
- **Print & PDF Optimization**: Clean `@media print` styles for reading on paper or tablet.

## Usage

```javascript
import { transformToPedagogicalHtml } from '@g10dc/artisan';

const html = transformToPedagogicalHtml(markdownContent, {
  title: 'Manuale di Studio',
  courseCode: '12 CFU',
  theme: 'dark'
});
```

## Testing

```bash
node --test tests/*.test.js
```

## License

MIT © G10DC
