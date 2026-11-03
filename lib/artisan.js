
/**
 * Artisan — Pedagogical UI/UX & Visual Layout Engine (University Edition)
 * Converts Markdown knowledge bases into interactive, highly-scannable study web applications.
 */

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

/** Escape text destined for an HTML context. */
export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only http(s), relative and data-image URLs may reach an href or src. */
export function safeUrl(url) {
  const trimmed = String(url ?? '').trim();
  if (/^(https?:|mailto:|#|\/|\.{1,2}\/)/i.test(trimmed)) return trimmed;
  if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(trimmed)) return trimmed;
  if (/^[\w.-]+(\/[\w.-]+)*\.[a-z0-9]{1,5}$/i.test(trimmed)) return trimmed; // bare relative path
  return '';
}

export function highlightKeyTerms(text) {
  if (!text) return '';

  // Code spans are extracted first and put back last, so a URL or an asterisk
  // inside backticks is never re-interpreted as markup.
  const spans = [];
  let out = String(text).replace(/`([^`]+)`/g, (_, code) => {
    spans.push(`<code class="inline-code">${escapeHtml(code)}</code>`);
    return `\u0000${spans.length - 1}\u0000`;
  });

  out = out
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (match, alt, src, title) => {
      const url = safeUrl(src);
      if (!url) return escapeHtml(alt);
      const caption = title || alt;
      return `<figure class="study-figure"><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" loading="lazy">${
        caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''
      }</figure>`;
    })
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => {
      const url = safeUrl(href);
      if (!url) return escapeHtml(label);
      const external = /^https?:/i.test(url);
      return `<a class="study-link" href="${escapeHtml(url)}"${
        external ? ' target="_blank" rel="noopener noreferrer"' : ''
      }>${escapeHtml(label)}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="highlight-term">$1</strong>')
    .replace(/\b(D\.Lgs\.\s*\d+\/\d+|L\.\s*\d+\/\d+|Art\.\s*\d+(?:\s*Cost\.)?|Legge Costituzionale\s*\d+\/\d+)/gi, '<span class="legal-badge">⚖️ $1</span>');

  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)]);
}

export function injectExamTraps(html) {
  if (!html) return '';

  // Il testo puo contenere tag gia generati (grassetto, badge): le virgolette
  // si cercano solo fuori dai tag e la parte corretta arriva a fine riga.
  const trapRegex = /(?:<p class="study-paragraph">)?❌\s*"((?:<[^>]*>|[^"<])+)"\s*→\s*✅\s*([^\n]+?)(?:<\/p>|(?=<\/li>)|(?=\n)|$)/gi;

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

  const quoteRegex = /(?:<p class="study-paragraph">)?🎯\s*"((?:<[^>]*>|[^"<])+)"(?:<\/p>)?/gi;

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

  // Un paragrafo che contiene almeno un carattere di disegno ad albero.
  const treeRegex = /<p class="study-paragraph">((?:(?!<\/p>)[\s\S])*?[│├└─](?:(?!<\/p>)[\s\S])*)<\/p>/gi;

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

export function injectExamFrequencyBadges(html) {
  if (!html) return '';

  return html
    .replace(/🔴\s*Sicuro/gi, '<span class="badge-freq badge-sicuro">🔴 SICURO D\'ESAME</span>')
    .replace(/🟡\s*Frequente/gi, '<span class="badge-freq badge-frequente">🟡 FREQUENTE</span>')
    .replace(/🟢\s*Raro/gi, '<span class="badge-freq badge-raro">🟢 RARO</span>');
}

const TREE_CHARS = /[│├└─]/;

/** "**Termine**: definizione" (o "**Termine:** definizione") -> card; altrimenti null. */
function definitionCard(text) {
  const m = /^\*\*([^*]+?)\*\*\s*:\s*(.+)$/.exec(text) || /^\*\*([^*]+?):\*\*\s*(.+)$/.exec(text);
  if (!m) return null;
  return `<div class="definition-card"><span class="definition-term">${escapeHtml(m[1].trim())}</span><span class="definition-text">${highlightKeyTerms(m[2])}</span></div>`;
}

// La sezione "## Indice" di alembic duplica il sommario laterale: la salto fino
// al prossimo "## " (fuori dai blocchi di codice).
function withoutIndexSection(lines) {
  const out = [];
  let inFence = false;
  let skipping = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && /^##\s/.test(line)) skipping = /^##\s+Indice\s*$/i.test(line);
    if (!skipping) out.push(line);
  }
  return out;
}

export function parseMarkdownToCleanHtml(mdText) {
  const lines = withoutIndexSection(mdText.split(/\r?\n/));
  let html = '';
  let inTable = false;
  let inList = false;
  let listType = 'ul';
  let inBlockquote = false;
  let blockquoteLines = [];

  const flushBlockquote = () => {
    if (!inBlockquote) return;
    const text = blockquoteLines.join(' ');
    let calloutClass = 'callout-summary';
    let icon = '💡';
    let title = 'Sintesi Strategica d\'Esame';

    if (text.includes('Errori tipici') || text.includes('⚠️') || text.toLowerCase().includes('trappola')) {
      calloutClass = 'callout-oral-error';
      icon = '🚨';
      title = 'Errori Tipici all\'Orale & Trappole d\'Esame';
    } else if (text.toLowerCase().includes('norma') || text.toLowerCase().includes('d.lgs') || text.toLowerCase().includes('legge') || text.toLowerCase().includes('art.')) {
      calloutClass = 'callout-legal';
      icon = '⚖️';
      title = 'Riferimento Normativo / Quadro Legislativo';
    } else if (text.toLowerCase().includes('mnemon') || text.toLowerCase().includes('ricorda')) {
      calloutClass = 'callout-mnemonic';
      icon = '🧠';
      title = 'Anchor Mnemonica per la Memoria';
    }

    const cleanText = text.replace(/^>\s*/, '');
    html += `\n<div class="callout ${calloutClass}">\n  <div class="callout-header"><span class="callout-icon">${icon}</span> <span class="callout-title">${title}</span></div>\n  <div class="callout-content">${highlightKeyTerms(cleanText)}</div>\n</div>\n`;
    inBlockquote = false;
    blockquoteLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Fenced code block. Taken before any other rule so its contents are
    // emitted verbatim -- a study manual for a technical subject is mostly
    // useless if the commands and snippets in it are reflowed as prose.
    const fence = /^\s*```+\s*([\w+-]*)\s*$/.exec(line);
    if (fence) {
      if (inList) {
        html += `</${listType}>\n`;
        inList = false;
      }
      if (inTable) {
        html += `</tbody></table></div>\n`;
        inTable = false;
      }
      if (inBlockquote) flushBlockquote();

      const language = fence[1];
      const body = [];
      i++;
      while (i < lines.length && !/^\s*```+\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      const label = language
        ? `<div class="code-label">${escapeHtml(language)}</div>`
        : '';
      html += `<div class="code-block">${label}<pre><code${
        language ? ` class="language-${escapeHtml(language)}"` : ''
      }>${escapeHtml(body.join('\n'))}</code></pre></div>\n`;
      continue;
    }

    if (inList && !line.trim().startsWith('- ') && !line.trim().startsWith('* ') && !/^\d+\.\s/.test(line.trim())) {
      html += `</${listType}>\n`;
      inList = false;
    }

    if (inTable && !line.trim().startsWith('|')) {
      html += `</tbody></table></div>\n`;
      inTable = false;
    }

    if (line.trim().startsWith('>')) {
      inBlockquote = true;
      blockquoteLines.push(line.trim().replace(/^>\s*/, ''));
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    if (line.trim() === '---' || line.trim() === '***') {
      html += `<hr class="section-divider" />\n`;
      continue;
    }

    if (line.startsWith('# ')) {
      const title = line.replace(/^#\s+/, '').trim();
      const id = slugify(title);
      html += `<h1 id="${id}" class="chapter-heading"><span class="heading-badge">Modulo</span> ${highlightKeyTerms(title)}</h1>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      const title = line.replace(/^##\s+/, '').trim();
      const id = slugify(title);
      html += `<h2 id="${id}" class="section-heading"><span class="section-text">${highlightKeyTerms(title)}</span> <label class="study-check"><input type="checkbox" data-sec="${id}" onchange="onSectionCheck(this)"> <span class="check-label">Studiato</span></label></h2>\n`;
      continue;
    }
    if (line.startsWith('### ')) {
      const title = line.replace(/^###\s+/, '').trim();
      const id = slugify(title);
      html += `<h3 id="${id}" class="subsection-heading">${highlightKeyTerms(title)}</h3>\n`;
      continue;
    }
    if (line.startsWith('#### ')) {
      const title = line.replace(/^####\s+/, '').trim();
      const id = slugify(title);
      html += `<h4 id="${id}" class="topic-heading">${highlightKeyTerms(title)}</h4>\n`;
      continue;
    }

    if (line.trim().startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }
      if (!inTable) {
        inTable = true;
        html += `<div class="table-wrapper"><table class="study-table"><thead><tr>`;
        cells.forEach(c => { html += `<th>${highlightKeyTerms(c)}</th>`; });
        html += `</tr></thead><tbody>\n`;
      } else {
        html += `<tr>`;
        cells.forEach(c => { html += `<td>${highlightKeyTerms(c)}</td>`; });
        html += `</tr>\n`;
      }
      continue;
    }

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        inList = true;
        listType = 'ul';
        html += `<ul class="study-list">\n`;
      }
      const itemContent = line.trim().replace(/^[-*]\s+/, '');
      html += `  <li>${definitionCard(itemContent) || highlightKeyTerms(itemContent)}</li>\n`;
      continue;
    }
    if (/^\d+\.\s/.test(line.trim())) {
      if (!inList) {
        inList = true;
        listType = 'ol';
        html += `<ol class="study-list">\n`;
      }
      const itemContent = line.trim().replace(/^\d+\.\s+/, '');
      html += `  <li>${highlightKeyTerms(itemContent)}</li>\n`;
      continue;
    }

    // Domanda/Risposta: due righe consecutive (righe vuote in mezzo tollerate).
    const question = /^Domanda:\s*(.+)$/.exec(line.trim());
    if (question) {
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      const answer = j < lines.length ? /^Risposta:\s*(.+)$/.exec(lines[j].trim()) : null;
      if (answer) {
        html += `<details class="quiz-item"><summary>${highlightKeyTerms(question[1])}</summary><div class="quiz-answer">${highlightKeyTerms(answer[1])}</div></details>\n`;
        i = j;
        continue;
      }
    }

    const definition = definitionCard(line.trim());
    if (definition) {
      html += definition + '\n';
      continue;
    }

    // Albero ASCII: le righe consecutive con ├ │ └ ─ restano un unico paragrafo,
    // con l'indentazione, cosi injectAsciiTrees ne fa un solo schema.
    if (TREE_CHARS.test(line)) {
      const tree = [line.trimEnd()];
      while (i + 1 < lines.length && TREE_CHARS.test(lines[i + 1])) tree.push(lines[++i].trimEnd());
      html += `<p class="study-paragraph">${tree.map(highlightKeyTerms).join('\n')}</p>\n`;
      continue;
    }

    if (line.trim().length > 0) {
      html += `<p class="study-paragraph">${highlightKeyTerms(line.trim())}</p>\n`;
    }
  }

  flushBlockquote();
  return html;
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
      --font-heading: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      --font-body: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      --font-code: ui-monospace, 'Cascadia Code', Consolas, Menlo, 'DejaVu Sans Mono', monospace;
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

    .dyslexic-font {
      font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
      line-height: 2.0 !important;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-body);
      background-color: var(--bg-body);
      color: var(--text-main);
      line-height: 1.8;
      transition: background-color 0.3s, color 0.3s;
    }

    .badge-freq {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-sicuro { background: rgba(244, 63, 94, 0.2); color: var(--accent-rose); border: 1px solid var(--accent-rose); }
    .badge-frequente { background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); border: 1px solid var(--accent-amber); }
    .badge-raro { background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); border: 1px solid var(--accent-emerald); }

    .top-nav {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(11, 15, 25, 0.92);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-color);
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }

    [data-theme="light"] .top-nav { background: rgba(248, 250, 252, 0.92); }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 1.2rem;
      color: var(--text-bold);
    }

    .nav-badge {
      background: linear-gradient(135deg, var(--accent-indigo), #a855f7);
      color: white;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.7rem;
      border-radius: 20px;
    }

    .nav-search { flex: 1; max-width: 450px; position: relative; }
    .nav-search input {
      width: 100%;
      padding: 0.6rem 1rem 0.6rem 2.5rem;
      border-radius: 30px;
      border: 1px solid var(--border-color);
      background: var(--bg-surface);
      color: var(--text-main);
      font-size: 0.9rem;
      outline: none;
    }

    .nav-tools { display: flex; align-items: center; gap: 0.8rem; }
    .btn-tool {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.45rem 0.9rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .btn-tool:hover { border-color: var(--accent-indigo); color: var(--accent-indigo); }

    .app-container { display: flex; min-height: calc(100vh - 65px); }

    aside.sidebar {
      width: 320px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      padding: 1.5rem 1rem;
      position: sticky;
      top: 65px;
      height: calc(100vh - 65px);
      overflow-y: auto;
      flex-shrink: 0;
    }

    .progress-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;
      margin-bottom: 1.2rem;
    }
    .progress-header { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; }
    .progress-track { height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden; margin-top: 0.5rem; }
    .progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--accent-indigo), var(--accent-emerald)); transition: width 0.4s; }

    .toc-tree { list-style: none; }
    .toc-link { display: block; padding: 0.45rem 0.7rem; border-radius: 6px; color: var(--text-muted); text-decoration: none; font-size: 0.85rem; }
    .toc-link:hover, .toc-link.active { background: rgba(99, 102, 241, 0.15); color: var(--accent-purple); font-weight: 600; }
    .toc-sub-1 { padding-left: 1.2rem; }
    .toc-sub-2 { padding-left: 2rem; }

    main.main-body { flex: 1; padding: 3rem 4rem; max-width: 1050px; margin: 0 auto; }

    .chapter-heading {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--text-bold);
      margin-top: 3.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.8rem;
      border-bottom: 3px solid var(--accent-indigo);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .heading-badge { background: var(--accent-indigo); color: white; font-size: 0.8rem; font-weight: 800; padding: 0.25rem 0.7rem; border-radius: 6px; }

    .section-heading {
      font-family: var(--font-heading);
      font-size: 1.55rem;
      font-weight: 800;
      color: var(--text-bold);
      margin-top: 2.5rem;
      margin-bottom: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-left: 4px solid var(--accent-purple);
      padding-left: 1rem;
    }

    .subsection-heading { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--accent-purple); margin-top: 2rem; margin-bottom: 1rem; }
    .study-paragraph { font-size: 1.02rem; margin-bottom: 1.2rem; color: var(--text-main); }

    .highlight-term { color: var(--text-bold); font-weight: 700; background: rgba(99, 102, 241, 0.15); padding: 0.12rem 0.35rem; border-radius: 4px; border-bottom: 2px solid var(--accent-indigo); }
    .legal-badge { background: rgba(59, 130, 246, 0.15); color: var(--accent-blue); font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 6px; font-size: 0.88rem; }

    .callout { border-radius: var(--radius-md); padding: 1.4rem 1.8rem; margin: 2rem 0; border-left: 5px solid; background: var(--bg-surface); box-shadow: var(--shadow-lg); }
    .callout-summary { border-color: var(--accent-emerald); background: rgba(16, 185, 129, 0.07); }
    .callout-oral-error { border-color: var(--accent-rose); background: rgba(244, 63, 94, 0.09); }
    .callout-legal { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.08); }
    .callout-mnemonic { border-color: var(--accent-purple); background: rgba(129, 140, 248, 0.08); }
    .callout-header { display: flex; align-items: center; gap: 0.6rem; font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; margin-bottom: 0.6rem; }

    .table-wrapper { overflow-x: auto; margin: 2rem 0; border-radius: var(--radius-md); border: 1px solid var(--border-color); }
    .study-table { width: 100%; border-collapse: collapse; font-size: 0.94rem; text-align: left; }
    .study-table th { background: var(--bg-surface); color: var(--accent-purple); font-family: var(--font-heading); font-weight: 800; padding: 0.9rem 1.2rem; border-bottom: 2px solid var(--border-color); }
    .study-table td { padding: 0.85rem 1.2rem; border-bottom: 1px solid var(--border-color); }

    .study-list { margin: 1rem 0 1.5rem 1.8rem; }
    .study-list li { margin-bottom: 0.5rem; }

    .study-figure { margin: 2rem 0; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-surface); }
    .study-figure img { display: block; width: 100%; height: auto; }
    .study-figure figcaption { font-size: 0.85rem; line-height: 1.5; color: var(--text-muted); padding: 0.75rem 1.1rem; border-top: 1px solid var(--border-color); }

    .code-block { margin: 1.5rem 0; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; background: var(--bg-sidebar); }
    .code-label { font-family: var(--font-code); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); padding: 0.4rem 1.1rem; border-bottom: 1px solid var(--border-color); background: var(--bg-surface); }
    .code-block pre { margin: 0; padding: 1rem 1.1rem; overflow-x: auto; }
    .code-block code { font-family: var(--font-code); font-size: 0.86rem; line-height: 1.6; color: var(--text-main); background: none; padding: 0; white-space: pre; }

    .study-link { color: var(--accent-cyan); text-decoration: underline; text-underline-offset: 2px; }
    .study-link:hover { color: var(--accent-blue); }

    .study-check { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.4rem; background: var(--bg-surface); padding: 0.25rem 0.7rem; border-radius: 20px; border: 1px solid var(--border-color); }

    .definition-card { display: flex; flex-direction: column; gap: 0.25rem; margin: 1.1rem 0; padding: 0.9rem 1.2rem; border-left: 5px solid var(--accent-indigo); border-radius: var(--radius-sm); background: rgba(99, 102, 241, 0.1); break-inside: avoid; }
    .definition-term { font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; color: var(--accent-purple); }
    .definition-text { font-size: 0.98rem; }
    .study-list li > .definition-card { margin: 0.4rem 0; }

    .quiz-item { margin: 0.9rem 0; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-surface); break-inside: avoid; }
    .quiz-item summary { cursor: pointer; padding: 0.8rem 1.1rem; font-weight: 700; }
    .quiz-item summary:hover { color: var(--accent-purple); }
    .quiz-answer { padding: 0.8rem 1.1rem; border-top: 1px dashed var(--border-color); color: var(--accent-emerald); }

    @media print {
      header, aside, .btn-tool, .study-check { display: none !important; }
      main { padding: 0 !important; max-width: 100% !important; }
      html, html[data-theme] { --bg-body: #fff; --bg-surface: #fff; --bg-card: #fff; --text-main: #111; --text-muted: #444; --text-bold: #000; --accent-emerald: #0a6b46; --accent-purple: #3730a3; --shadow-lg: none; }
      body { background: white !important; color: black !important; }
      .callout, .definition-card, .quiz-item, .code-block, .study-figure { break-inside: avoid; box-shadow: none; }
      .definition-card { background: none; border: 1px solid #999; border-left: 5px solid #3730a3; }
      .quiz-item { border-color: #999; }
      .quiz-item summary { list-style: none; }
      .quiz-item summary::-webkit-details-marker { display: none; }
      .quiz-item::details-content { content-visibility: visible; display: block; }
      .quiz-item > .quiz-answer { display: block; }
    }
  `;
}

export function transformToPedagogicalHtml(markdownText, options = {}) {
  const { title = 'Manuale di Studio', courseCode = '' } = options;
  const theme = options.theme === 'light' ? 'light' : 'dark';
  // Chiave di avanzamento propria di ogni manuale: due manuali non si mescolano.
  const storageKey = JSON.stringify('artisan_progress_' + (slugify(`${title} ${courseCode}`).replace(/^-+|-+$/g, '') || 'manuale'));

  let bodyHtml = parseMarkdownToCleanHtml(markdownText);
  bodyHtml = injectExamTraps(bodyHtml);
  bodyHtml = injectOralQuotes(bodyHtml);
  bodyHtml = injectAsciiTrees(bodyHtml);
  bodyHtml = injectExamFrequencyBadges(bodyHtml);

  return `<!DOCTYPE html>
<html lang="it" data-theme="${theme}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>${generateDesignSystemCss(options)}</style>
</head>
<body>
  <header class="top-nav">
    <div class="nav-brand">
      <span>📚 ${escapeHtml(title)}</span>
      ${courseCode ? `<span class="nav-badge">${escapeHtml(courseCode)}</span>` : ''}
    </div>
    <div class="nav-search">
      <input type="text" id="globalSearchInput" placeholder="Cerca concetti, riforme, leggi, trappole d'esame..." oninput="filterContent(this.value)">
    </div>
    <div class="nav-tools">
      <button class="btn-tool" onclick="document.body.classList.toggle('dyslexic-font')">🔤 Font DSA</button>
      <button class="btn-tool" onclick="toggleThemeMode()">🌙 / ☀️</button>
      <button class="btn-tool" onclick="window.print()">🖨️ Stampa / PDF</button>
    </div>
  </header>

  <div class="app-container">
    <aside class="sidebar">
      <div class="progress-card">
        <div class="progress-header">
          <span>Avanzamento Studio</span>
          <span id="progressPercent">0%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="progressFillBar"></div>
        </div>
      </div>
      <ul class="toc-tree" id="tocTreeList"></ul>
    </aside>

    <main class="main-body" id="mainStudyBody">
      ${bodyHtml}
    </main>
  </div>

  <script>
    const STORAGE_KEY = ${storageKey};
    function toggleThemeMode() {
      const htmlEl = document.documentElement;
      const curTheme = htmlEl.getAttribute('data-theme');
      htmlEl.setAttribute('data-theme', curTheme === 'light' ? 'dark' : 'light');
    }

    function generateTOC() {
      const headings = document.querySelectorAll('main h1, main h2, main h3');
      const tocTreeList = document.getElementById('tocTreeList');
      if (!tocTreeList) return;
      tocTreeList.innerHTML = '';
      headings.forEach(h => {
        if (!h.id) return;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.className = 'toc-link';
        a.textContent = h.textContent.replace(/^Modulo\s*/, '').replace(/🔴|🟡|🟢|SICURO D'ESAME|FREQUENTE|RARO/g, '').trim();
        if (h.tagName === 'H2') a.classList.add('toc-sub-1');
        if (h.tagName === 'H3') a.classList.add('toc-sub-2');
        li.appendChild(a);
        tocTreeList.appendChild(li);
      });
    }

    function onSectionCheck(checkbox) {
      const secId = checkbox.getAttribute('data-sec');
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      store[secId] = checkbox.checked;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      refreshProgressBar();
    }

    function refreshProgressBar() {
      const checkboxes = document.querySelectorAll('.study-check input');
      if (checkboxes.length === 0) return;
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      let checkedTotal = 0;
      checkboxes.forEach(cb => {
        const id = cb.getAttribute('data-sec');
        if (store[id]) {
          cb.checked = true;
          checkedTotal++;
        }
      });
      const percentage = Math.round((checkedTotal / checkboxes.length) * 100);
      document.getElementById('progressFillBar').style.width = percentage + '%';
      document.getElementById('progressPercent').textContent = percentage + '%';
    }

    function filterContent(query) {
      const term = query.toLowerCase().trim();
      const elements = document.querySelectorAll('.study-paragraph, .callout, .definition-card, .quiz-item, .study-list li, .study-table tr');
      if (!term) {
        elements.forEach(el => el.style.display = '');
        return;
      }
      elements.forEach(el => {
        el.style.display = el.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    }

    // Alcuni browser non stampano il contenuto dei <details> chiusi: li apro per la stampa.
    let apertiPrima = [];
    window.addEventListener('beforeprint', () => {
      apertiPrima = [...document.querySelectorAll('details.quiz-item')].filter(d => !d.open);
      apertiPrima.forEach(d => { d.open = true; });
    });
    window.addEventListener('afterprint', () => {
      apertiPrima.forEach(d => { d.open = false; });
      apertiPrima = [];
    });

    window.addEventListener('DOMContentLoaded', () => {
      generateTOC();
      refreshProgressBar();
    });
  </script>
</body>
</html>`;
}
