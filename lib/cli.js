#!/usr/bin/env node
// Uso: node lib/cli.js <in.md> <out.html> [--title T] [--course C] [--theme light|dark]
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { transformToPedagogicalHtml } from './artisan.js';

const USO = 'Uso: node lib/cli.js <in.md> <out.html> [--title T] [--course C] [--theme light|dark]';
const fail = (msg) => { console.error(`artisan: ${msg}`); process.exit(1); };

let args;
try {
  args = parseArgs({
    allowPositionals: true,
    options: { title: { type: 'string' }, course: { type: 'string' }, theme: { type: 'string' } },
  });
} catch (e) {
  fail(`${e.message}\n${USO}`);
}
const [input, output] = args.positionals;
const { title, course, theme = 'dark' } = args.values;
if (!input || !output || args.positionals.length > 2) fail(USO);
if (!['light', 'dark'].includes(theme)) fail(`--theme deve essere light o dark (ricevuto "${theme}")`);

let markdown;
try {
  markdown = fs.readFileSync(input, 'utf8');
} catch (e) {
  fail(e.code === 'ENOENT' ? `file non trovato: ${input}` : `impossibile leggere ${input}: ${e.message}`);
}

const html = transformToPedagogicalHtml(markdown, {
  title: title ?? /^# (.+)$/m.exec(markdown)?.[1].trim() ?? 'Manuale di Studio',
  courseCode: course ?? '',
  theme,
});
try {
  fs.writeFileSync(output, html);
} catch (e) {
  fail(`impossibile scrivere ${output}: ${e.message}`);
}
console.log(`Scritto ${output}`);
