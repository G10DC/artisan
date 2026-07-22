import test from 'node:test';
import assert from 'node:assert/strict';
import { highlightKeyTerms, injectExamTraps, injectOralQuotes, injectExamFrequencyBadges, transformToPedagogicalHtml } from '../lib/artisan.js';
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
