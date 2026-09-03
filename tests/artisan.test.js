import test from 'node:test';
import assert from 'node:assert/strict';
import { highlightKeyTerms, injectExamTraps, injectOralQuotes, injectExamFrequencyBadges, transformToPedagogicalHtml, parseMarkdownToCleanHtml, escapeHtml, safeUrl } from '../lib/artisan.js';
import { calculateSrsReview } from '../lib/srs.js';

test('calculateSrsReview updates interval and repetitions for rating >= 3', () => {
  const initialState = { repetitions: 0, interval: 1, easeFactor: 2.5 };
  const nextState = calculateSrsReview(initialState, 4);

  assert.equal(nextState.repetitions, 1);
  assert.equal(nextState.interval, 1);
  assert.ok(nextState.nextReviewDate);
});

test('calculateSrsReview resets interval for rating < 3', () => {
  const initialState = { repetitions: 3, interval: 12, easeFactor: 2.5 };
  const nextState = calculateSrsReview(initialState, 1);

  assert.equal(nextState.repetitions, 0);
  assert.equal(nextState.interval, 1);
});

test('injectExamFrequencyBadges replaces priority markers with styled badges', () => {
  const input = '🔴 Sicuro 🟡 Frequente 🟢 Raro';
  const output = injectExamFrequencyBadges(input);

  assert.ok(output.includes('badge-sicuro'));
  assert.ok(output.includes('badge-frequente'));
  assert.ok(output.includes('badge-raro'));
});

test('transformToPedagogicalHtml includes DSA font toggle and TTS script', () => {
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
