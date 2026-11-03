import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { highlightKeyTerms, injectExamTraps, injectOralQuotes, injectExamFrequencyBadges, transformToPedagogicalHtml, parseMarkdownToCleanHtml, escapeHtml, safeUrl } from '../lib/artisan.js';
test('injectExamFrequencyBadges replaces priority markers with styled badges', () => {
  const input = '🔴 Sicuro 🟡 Frequente 🟢 Raro';
  const output = injectExamFrequencyBadges(input);

  assert.ok(output.includes('badge-sicuro'));
  assert.ok(output.includes('badge-frequente'));
  assert.ok(output.includes('badge-raro'));
});

test('transformToPedagogicalHtml includes DSA font toggle', () => {
  const md = '# Modulo 1\n🔴 Sicuro\n**Burocrazia**';
  const html = transformToPedagogicalHtml(md, { title: 'University Study Manual', courseCode: '12 CFU' });

  assert.ok(html.includes('Font DSA'));
  assert.ok(html.includes('badge-sicuro'));
  assert.ok(html.includes('University Study Manual'));
});

test('escapeHtml neutralises every HTML-significant character', () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  assert.equal(escapeHtml(null), '');
});

test('safeUrl admits the schemes a study manual needs and refuses the rest', () => {
  assert.equal(safeUrl('https://example.test/a'), 'https://example.test/a');
  assert.equal(safeUrl('frames/frame_01.png'), 'frames/frame_01.png');
  assert.equal(safeUrl('./local.png'), './local.png');
  assert.equal(safeUrl('#anchor'), '#anchor');
  assert.ok(safeUrl('data:image/png;base64,AAAA').startsWith('data:image/png'));
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('data:text/html;base64,AAAA'), '');
  assert.equal(safeUrl(undefined), '');
});

test('images become captioned figures -- previously they were dropped entirely', () => {
  const html = highlightKeyTerms('![Terminale a 22:15](frames/frame_07.png)');
  assert.match(html, /<figure class="study-figure">/);
  assert.match(html, /src="frames\/frame_07\.png"/);
  assert.match(html, /alt="Terminale a 22:15"/);
  assert.match(html, /<figcaption>Terminale a 22:15<\/figcaption>/);
  assert.match(html, /loading="lazy"/);
});

test('an image with a hostile src degrades to its alt text', () => {
  const html = highlightKeyTerms('![fallback](javascript:alert(1))');
  assert.ok(!html.includes('<img'), html);
  assert.ok(!html.includes('javascript:'), html);
});

test('inline links are rendered, and external ones get rel=noopener', () => {
  const html = highlightKeyTerms('vedi [la fonte](https://example.test/v) e [qui](#nota)');
  assert.match(html, /<a class="study-link" href="https:\/\/example\.test\/v" target="_blank" rel="noopener noreferrer">la fonte<\/a>/);
  assert.match(html, /<a class="study-link" href="#nota">qui<\/a>/);
  assert.ok(!/href="#nota" target/.test(html), 'an internal anchor should not open a new tab');
});

test('a code span is never re-interpreted as markup', () => {
  const html = highlightKeyTerms('esegui `node --test **x** [y](z)` adesso');
  assert.match(html, /<code class="inline-code">node --test \*\*x\*\* \[y\]\(z\)<\/code>/);
  assert.ok(!html.includes('<strong'), html);
});

test('restoring code spans does not collide with digits in the prose', () => {
  const html = highlightKeyTerms('gira a 4 token/s con `--ctx 262144` su 12 thread');
  assert.match(html, /gira a 4 token\/s con <code class="inline-code">--ctx 262144<\/code> su 12 thread/);
});

test('fenced code blocks survive verbatim with their language label', () => {
  const html = parseMarkdownToCleanHtml('# T\n\n```bash\nyt-dlp --write-subs <url>\nnode lib/vtt.mjs a.vtt b.md\n```\n\ndopo\n');
  assert.match(html, /<div class="code-block">/);
  assert.match(html, /<div class="code-label">bash<\/div>/);
  assert.match(html, /class="language-bash"/);
  assert.match(html, /yt-dlp --write-subs &lt;url&gt;/);
  assert.ok(!html.includes('<p class="study-paragraph">yt-dlp'), 'code must not be reflowed as prose');
  assert.match(html, /<p class="study-paragraph">dopo<\/p>/);
});

test('a fence with no language still renders as a code block', () => {
  const html = parseMarkdownToCleanHtml('```\nplain\n```\n');
  assert.match(html, /<div class="code-block"><pre><code>plain<\/code><\/pre><\/div>/);
  assert.ok(!html.includes('code-label'));
});

test('a fence closes an open list before opening the block', () => {
  const html = parseMarkdownToCleanHtml('- primo\n- secondo\n```sh\nls\n```\n');
  assert.ok(html.indexOf('</ul>') < html.indexOf('code-block'), html);
});

test('an unterminated fence does not swallow the rest silently', () => {
  const html = parseMarkdownToCleanHtml('```py\nx = 1\n');
  assert.match(html, /<div class="code-block">/);
  assert.match(html, /x = 1/);
});

test('the document shell escapes the title and course code', () => {
  const html = transformToPedagogicalHtml('# T\n', {
    title: 'Qwen <script>alert(1)</script>',
    courseCode: '"><b>x',
  });
  assert.ok(!html.includes('<script>alert(1)</script>'), 'title must not inject a script tag');
  assert.match(html, /<title>Qwen &lt;script&gt;/);
  assert.match(html, /class="nav-badge">&quot;&gt;&lt;b&gt;x</);
});

test('the stylesheet defines the classes the new blocks emit', () => {
  const html = transformToPedagogicalHtml('# T\n', { title: 'T' });
  for (const cls of ['.study-figure', '.code-block', '.code-label', '.study-link']) {
    assert.ok(html.includes(cls), `${cls} missing from the design system CSS`);
  }
});

const CLI = path.join(import.meta.dirname, '..', 'lib', 'cli.js');

test('"**Termine**: definizione" diventa una card di definizione', () => {
  const html = parseMarkdownToCleanHtml('**Atto amministrativo**: manifestazione di volonta della P.A.');
  assert.match(html, /<div class="definition-card"><span class="definition-term">Atto amministrativo<\/span><span class="definition-text">manifestazione di volonta della P\.A\.<\/span><\/div>/);
  assert.ok(!html.includes('study-paragraph'));
});

test('la definizione vale anche come voce di elenco (Glossario) e con i due punti nel grassetto', () => {
  const html = parseMarkdownToCleanHtml('## Glossario\n- **Silenzio-assenso**: effetto di accoglimento.\n**Dolo:** volonta di commettere il fatto.');
  assert.match(html, /<li><div class="definition-card"><span class="definition-term">Silenzio-assenso<\/span>/);
  assert.match(html, /definition-term">Dolo</);
  assert.match(html, /<h2 id="glossario"/);
});

test('il termine della definizione e escapato', () => {
  const html = parseMarkdownToCleanHtml('**<img src=x>**: prova');
  assert.ok(!html.includes('<img src=x>'));
});

test('Domanda/Risposta diventa un <details> nativo con la risposta nascosta', () => {
  const html = parseMarkdownToCleanHtml("## Domande di verifica\nDomanda: Cos'e il silenzio-assenso?\nRisposta: L'inerzia vale accoglimento.\n");
  assert.match(html, /<details class="quiz-item"><summary>Cos'e il silenzio-assenso\?<\/summary><div class="quiz-answer">L'inerzia vale accoglimento\.<\/div><\/details>/);
});

test('una Domanda senza Risposta resta un paragrafo', () => {
  const html = parseMarkdownToCleanHtml('Domanda: sola?\n\nAltro testo');
  assert.ok(!html.includes('<details'));
  assert.match(html, /<p class="study-paragraph">Domanda: sola\?<\/p>/);
});

test('in stampa le risposte dei quiz risultano visibili', () => {
  const html = transformToPedagogicalHtml('# T\nDomanda: a?\nRisposta: b\n', { title: 'T' });
  const print = html.slice(html.indexOf('@media print'));
  assert.match(print, /\.quiz-item::details-content\s*{[^}]*content-visibility:\s*visible/);
  assert.match(print, /\.quiz-item > \.quiz-answer\s*{\s*display:\s*block/);
  assert.match(html, /addEventListener\('beforeprint'/);
});

test('trappola e frase orale reggono il grassetto e le virgolette dentro i tag', () => {
  const html = transformToPedagogicalHtml('# T\n\n❌ "dice **A**" → ✅ dice **B** (art. 3)\n\n🎯 "la **P.A.** agisce"\n');
  assert.match(html, /Errore Tipico:<\/strong> "dice <strong class="highlight-term">A<\/strong>"/);
  assert.match(html, /Risposta Corretta per l'Orale:<\/strong> dice <strong class="highlight-term">B<\/strong>/);
  assert.match(html, /FRASE PRONTA PER L'ORALE[\s\S]*la <strong class="highlight-term">P\.A\.<\/strong> agisce/);
  assert.ok(!html.includes('</div><strong'), 'nessun resto di tag fuori dalla callout');
});

test('un albero ASCII su piu righe diventa un solo schema, con indentazione', () => {
  const html = transformToPedagogicalHtml('# T\n\nPotere\n├─ Legislativo\n│  └─ Camere\n└─ Esecutivo\n');
  assert.equal((html.match(/SCHEMA DI SINTESI VISUALE/g) || []).length, 1);
  assert.match(html, /├─ Legislativo\n│  └─ Camere\n└─ Esecutivo/);
});

test('i file con fine riga CRLF si leggono come gli altri', () => {
  const html = parseMarkdownToCleanHtml('**Dolo**: volonta.\r\nDomanda: a?\r\nRisposta: b\r\n');
  assert.match(html, /definition-card/);
  assert.match(html, /<details class="quiz-item">/);
});

test('la chiave di avanzamento deriva da titolo e corso, non e fissa', () => {
  const key = (opts) => /const STORAGE_KEY = "([^"]+)"/.exec(transformToPedagogicalHtml('# T\n', opts))[1];
  const a = key({ title: 'Diritto Amministrativo', courseCode: 'IUS/10' });
  const b = key({ title: 'Diritto Privato', courseCode: 'IUS/01' });
  assert.equal(a, 'artisan_progress_diritto-amministrativo-ius10');
  assert.notEqual(a, b);
  assert.ok(!transformToPedagogicalHtml('# T\n').includes('scienza_pa_progress'));
  assert.equal(key({ title: '???' }), 'artisan_progress_manuale');
});

test('la pagina non fa richieste esterne per i font', () => {
  const html = transformToPedagogicalHtml('# T\n', { title: 'T' });
  assert.ok(!html.includes('fonts.googleapis.com'));
  assert.ok(!/<link[^>]+rel="stylesheet"/.test(html));
  assert.match(html, /--font-body: system-ui/);
});

test('il tema e ridotto a light o dark', () => {
  assert.match(transformToPedagogicalHtml('# T\n', { theme: 'light' }), /data-theme="light"/);
  assert.match(transformToPedagogicalHtml('# T\n', { theme: '"><script>' }), /data-theme="dark"/);
});

test('CLI: file mancante -> uscita diversa da 0 e messaggio chiaro', () => {
  const r = spawnSync(process.execPath, [CLI, 'non-esiste.md', 'out.html'], { encoding: 'utf8' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /file non trovato: non-esiste\.md/);
});

test('CLI: argomenti mancanti o tema errato -> uscita diversa da 0', () => {
  assert.notEqual(spawnSync(process.execPath, [CLI], { encoding: 'utf8' }).status, 0);
  assert.notEqual(spawnSync(process.execPath, [CLI, 'a.md', 'b.html', '--theme', 'viola'], { encoding: 'utf8' }).status, 0);
});

test('CLI: converte il file e prende il titolo dal primo "# "', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'artisan-'));
  try {
    const md = path.join(dir, 'in.md');
    const out = path.join(dir, 'out.html');
    fs.writeFileSync(md, '# Diritto Pubblico\n\n**Stato**: ente sovrano.\n');
    const r = spawnSync(process.execPath, [CLI, md, out, '--course', 'IUS/09', '--theme', 'light'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const html = fs.readFileSync(out, 'utf8');
    assert.match(html, /<title>Diritto Pubblico<\/title>/);
    assert.match(html, /data-theme="light"/);
    assert.match(html, /class="definition-card"/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('la sezione "## Indice" di alembic non viene resa, le altre restano', () => {
  const md = ['# T', '', '## Indice', '', '- [1. Uno](#1-uno)', '', '## 1. Uno', '', 'testo', '', '## Glossario', '', '**Termine**: definizione lunga.', ''].join('\n');
  const html = parseMarkdownToCleanHtml(md);
  assert.ok(!html.includes('Indice'));
  assert.ok(!html.includes('#1-uno'));
  assert.ok(html.includes('1. Uno'));
  assert.ok(html.includes('Glossario'));
});
