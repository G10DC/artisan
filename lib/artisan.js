import fs from 'fs';

/**
 * Artisan — Pedagogical UI/UX & Visual Layout Engine
 * Converts Markdown knowledge bases into interactive, highly-scannable study web applications.
 */

export function highlightKeyTerms(text) {
  if (!text) return '';

  return text
    // Highlight bold terms
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="highlight-term">$1</strong>')
    // Highlight inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Highlight legal references (D.Lgs., Legge, Art., Cost.)
    .replace(/\b(D\.Lgs\.\s*\d+\/\d+|L\.\s*\d+\/\d+|Art\.\s*\d+(?:\s*Cost\.)?|Legge Costituzionale\s*\d+\/\d+)/gi, '<span class="legal-badge">⚖️ $1</span>');
}

export function injectExamTraps(html) {
  if (!html) return '';

  // Converts ❌ ... -> ✅ ... patterns into styled Callout boxes
  const trapRegex = /(?:<p class="study-paragraph">)?❌\s*"([^"]+)"\s*→\s*✅\s*([^<]+)(?:<\/p>)?/gi;

  return html.replace(trapRegex, (match, wrong, right) => {
    return `
<div class="callout callout-oral-error">
  <div class="callout-header"><span class="callout-icon">⚠️</span> <span class="callout-title">TRAPPOLA D'ESAME & ERRORE TIPICO</span></div>
  <div class="callout-content">
    <div style="margin-bottom: 0.5rem;"><strong style="color: var(--accent-rose);">❌ Errore Tipico:</strong> "${wrong}"</div>
    <div><strong style="color: var(--accent-emerald);">✅ Risposta Corretta per l'Orale:</strong> ${right}</div>
  </div>
</div>`;
  });
}

export function injectOralQuotes(html) {
  if (!html) return '';

  const quoteRegex = /(?:<p class="study-paragraph">)?🎯\s*"([^"]+)"(?:<\/p>)?/gi;

  return html.replace(quoteRegex, (match, quote) => {
    return `
<div class="callout callout-summary">
  <div class="callout-header"><span class="callout-icon">🎯</span> <span class="callout-title">FRASE PRONTA PER L'ORALE (30 E LODE)</span></div>
  <div class="callout-content" style="font-size: 1.05rem; font-style: italic; font-weight: 600; color: var(--accent-emerald);">
    "${quote}"
  </div>
</div>`;
  });
}

export function injectAsciiTrees(html) {
  if (!html) return '';

  // Detect pre/code blocks or paragraphs with ASCII tree characters
  const treeRegex = /<p class="study-paragraph">((?:[^<]*[│├└─][^<]*\n?)+)<\/p>/gi;

  return html.replace(treeRegex, (match, content) => {
    return `
<div class="callout callout-mnemonic">
  <div class="callout-header"><span class="callout-icon">🗺️</span> <span class="callout-title">SCHEMA DI SINTESI VISUALE</span></div>
  <div class="callout-content" style="font-family: var(--font-code); font-size: 0.88rem; white-space: pre-wrap; color: var(--accent-purple);">
${content.trim()}
  </div>
</div>`;
  });
}

export function generateDesignSystemCss(options = {}) {
  return `
    :root {
      --bg-body: #0b0f19;
      --bg-surface: #151d30;
      --bg-card: #1e293b;
      --bg-sidebar: #090d16;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --text-bold: #ffffff;
      --border-color: #26334d;
      --accent-purple: #818cf8;
      --accent-indigo: #6366f1;
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --accent-cyan: #06b6d4;
      --accent-blue: #3b82f6;
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --shadow-lg: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-code: 'Fira Code', monospace;
    }

    [data-theme="light"] {
      --bg-body: #f8fafc;
      --bg-surface: #ffffff;
      --bg-card: #ffffff;
      --bg-sidebar: #f1f5f9;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --text-bold: #0f172a;
      --border-color: #cbd5e1;
      --shadow-lg: 0 20px 40px -15px rgba(0, 0, 0, 0.08);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-body);
      background-color: var(--bg-body);
      color: var(--text-main);
      line-height: 1.8;
      transition: background-color 0.3s, color 0.3s;
    }

    .highlight-term {
      color: var(--text-bold);
      font-weight: 700;
      background: rgba(99, 102, 241, 0.15);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      border-bottom: 2px solid var(--accent-indigo);
    }

    .legal-badge {
      background: rgba(59, 130, 246, 0.15);
      color: var(--accent-blue);
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      font-size: 0.88rem;
    }

    .callout {
      border-radius: var(--radius-md);
      padding: 1.4rem 1.8rem;
      margin: 2rem 0;
      border-left: 5px solid;
      background: var(--bg-surface);
      box-shadow: var(--shadow-lg);
    }

    .callout-summary { border-color: var(--accent-emerald); background: rgba(16, 185, 129, 0.07); }
    .callout-oral-error { border-color: var(--accent-rose); background: rgba(244, 63, 94, 0.09); }
    .callout-legal { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.08); }
    .callout-mnemonic { border-color: var(--accent-purple); background: rgba(129, 140, 248, 0.08); }

    .callout-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1.05rem;
      margin-bottom: 0.6rem;
    }

    .callout-summary .callout-title { color: var(--accent-emerald); }
    .callout-oral-error .callout-title { color: var(--accent-rose); }
    .callout-legal .callout-title { color: var(--accent-blue); }
    .callout-mnemonic .callout-title { color: var(--accent-purple); }

    @media print {
      header, sidebar, .btn-tool { display: none !important; }
      body { background: white !important; color: black !important; }
    }
  `;
}

export function transformToPedagogicalHtml(markdownText, options = {}) {
  const { title = 'Manuale di Studio', courseCode = '', theme = 'dark' } = options;

  let processedHtml = markdownText
    .replace(/^# (.*$)/gim, '<h1 class="chapter-heading">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="section-heading">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="subsection-heading">$1</h3>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p class="study-paragraph">');

  processedHtml = highlightKeyTerms(processedHtml);
  processedHtml = injectExamTraps(processedHtml);
  processedHtml = injectOralQuotes(processedHtml);
  processedHtml = injectAsciiTrees(processedHtml);

  return `<!DOCTYPE html>
<html lang="it" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">
  <style>${generateDesignSystemCss(options)}</style>
</head>
<body>
  <header style="padding: 1rem 2rem; background: var(--bg-surface); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
    <h1 style="font-family: var(--font-heading); font-size: 1.4rem;">📚 ${title}</h1>
    <span style="background: var(--accent-indigo); color: white; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 800;">${courseCode}</span>
  </header>
  <main style="max-width: 1000px; margin: 2rem auto; padding: 0 1.5rem;">
    <p class="study-paragraph">${processedHtml}</p>
  </main>
</body>
</html>`;
}
