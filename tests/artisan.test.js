import test from 'node:test';
import assert from 'node:assert/strict';
import { highlightKeyTerms, injectExamTraps, injectOralQuotes, injectAsciiTrees, transformToPedagogicalHtml } from '../lib/artisan.js';

test('highlightKeyTerms wraps bold terms and legal references', () => {
  const input = 'Il **New Public Management** è regolato dal D.Lgs. 150/2009 e dall\'Art. 97 Cost.';
  const output = highlightKeyTerms(input);

  assert.ok(output.includes('<strong class="highlight-term">New Public Management</strong>'));
  assert.ok(output.includes('<span class="legal-badge">⚖️ D.Lgs. 150/2009</span>'));
  assert.ok(output.includes('<span class="legal-badge">⚖️ Art. 97 Cost.</span>'));
});

test('injectExamTraps converts ❌ -> ✅ into Callout box', () => {
  const input = '<p class="study-paragraph">❌ "Governance è uguale a Governo" → ✅ Governance è un modello a rete opposto a government.</p>';
  const output = injectExamTraps(input);

  assert.ok(output.includes('callout-oral-error'));
  assert.ok(output.includes('TRAPPOLA D\'ESAME & ERRORE TIPICO'));
  assert.ok(output.includes('Governance è uguale a Governo'));
});

test('injectOralQuotes converts 🎯 into summary card', () => {
  const input = '<p class="study-paragraph">🎯 "Le amministrazioni si collocano lungo un continuum."</p>';
  const output = injectOralQuotes(input);

  assert.ok(output.includes('callout-summary'));
  assert.ok(output.includes('FRASE PRONTA PER L\'ORALE (30 E LODE)'));
});

test('transformToPedagogicalHtml generates complete HTML doc', () => {
  const md = '# Modulo 1\n**Burocrazia** ex Art. 97 Cost.\n🎯 "Frase orale"';
  const html = transformToPedagogicalHtml(md, { title: 'Test Manual', courseCode: '12 CFU' });

  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('Test Manual'));
  assert.ok(html.includes('12 CFU'));
  assert.ok(html.includes('highlight-term'));
});
