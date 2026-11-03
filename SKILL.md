---
name: artisan
description: >-
  Converte una guida di studio in Markdown (di solito prodotta da alembic) in una pagina HTML di studio offline: definizioni in card, priorita d'esame, trappole, frasi per l'orale, quiz Domanda/Risposta a risposta nascosta, indice e avanzamento. Si invoca con /artisan.
disable-model-invocation: true
---

# Artisan: guida di studio Markdown -> pagina HTML

Seconda tappa della catena `alembic` (libro o dispensa -> guida Markdown) -> `artisan` (Markdown -> pagina HTML). Il risultato e un unico file `.html`, senza dipendenze e senza richieste di rete (font di sistema), stampabile in PDF dal browser. Per un video usa prima `yt-digest` e dai il suo Markdown ad artisan.

## Uso principale

La skill sta in `~/.claude/skills/artisan/`; i file `guida.md` / `guida.html` stanno nella cartella di lavoro dell'utente (quella da cui si lavora; con alembic è `work/`, per esempio `work/guida.md`), non nella cartella della skill.

```bash
node ~/.claude/skills/artisan/lib/cli.js guida.md guida.html --course "IUS/10" --theme light
```

`node ~/.claude/skills/artisan/lib/cli.js <in.md> <out.html> [--title T] [--course C] [--theme light|dark]`. Il titolo di default e il primo `# ` del file; il tema di default e `dark`. File mancante o opzioni errate: messaggio chiaro e codice di uscita 1.

## Formato di ingresso (contratto con alembic)

- Un solo `# Titolo`; capitoli `## N. Titolo`; sottosezioni `###`.
- Definizione, riga a se: `**Termine**: definizione.`
- Priorita d'esame: paragrafo o voce che inizia con `🔴 Sicuro`, `🟡 Frequente` o `🟢 Raro`.
- Trappola: `❌ "formulazione sbagliata" → ✅ formulazione corretta`
- Frase per l'orale: `🎯 "frase da dire"`
- Domande di verifica: sezione `## Domande di verifica` con righe consecutive `Domanda: testo` e `Risposta: testo` (etichette senza grassetto).
- Glossario finale `## Glossario` con le definizioni.
- L'eventuale `## Indice` prodotto da alembic non viene reso (c'è già il sommario laterale).

## Cosa diventa

| Sorgente | Resa |
| :-- | :-- |
| `**Termine**: definizione` (anche `**Termine:** ...`, anche come voce `- `) | card di definizione (`definition-card`), stampabile |
| `Domanda:` + `Risposta:` | `<details><summary>` nativo: la risposta si apre con un clic, senza JavaScript; in stampa le risposte sono visibili |
| `🔴 Sicuro` / `🟡 Frequente` / `🟢 Raro` | badge colorati nel testo (nessun filtro per priorita) |
| `❌ "sbagliato" → ✅ corretto` | riquadro trappola d'esame, su una riga, virgolette dritte `"` |
| `🎯 "frase"` | riquadro "frase pronta per l'orale", su una riga, virgolette dritte `"` |
| righe consecutive con `├ │ └ ─` | un solo schema ad albero, con indentazione |
| `#` `##` `###` `####` | titoli con indice laterale; sui `##` la casella "Studiato" |
| `-` `*` `1.` | elenchi |
| `\| a \| b \|` | tabella scorrevole |
| `> ...` | riquadro, tipizzato dalle parole (trappola, norma, mnemonica, sintesi) |
| `**grassetto**` | termine chiave evidenziato; citazioni di legge (`Art. 5`, `D.Lgs. 1/2001`) in badge |
| blocco ```` ``` ````, `` `codice` ``, `![alt](src)`, `[testo](url)` | codice letterale, immagini con didascalia, link (solo http(s), mailto, ancore, percorsi relativi, immagini base64) |

Non esistono: corsivo, Mermaid, KaTeX, flashcard, quiz a scelta multipla, modalita orale, ripetizione dilazionata, filtro per priorita. Un `*corsivo*` resta con gli asterischi.

## Cosa fa la pagina

Indice laterale; ricerca testuale su paragrafi, riquadri, definizioni, domande, voci e righe di tabella; casella "Studiato" per capitolo con barra di avanzamento salvata nel `localStorage` del browser, con chiave derivata da titolo e corso (due manuali non si mescolano); cambio tema chiaro/scuro; pulsante font per dislessia; stampa/PDF con `@media print` (niente menu, colori leggibili su carta, risposte dei quiz aperte).

## Uso da codice

```javascript
import fs from 'node:fs';
import { transformToPedagogicalHtml } from './lib/artisan.js';

const html = transformToPedagogicalHtml(fs.readFileSync('guida.md', 'utf8'), {
  title: 'Diritto amministrativo',
  courseCode: 'IUS/10',
  theme: 'light',
});
fs.writeFileSync('guida.html', html);
```

| Funzione | Parametri | Ritorna |
| :-- | :-- | :-- |
| `transformToPedagogicalHtml(md, options)` | `options`: `title`, `courseCode`, `theme` (`light` o `dark`, altro vale `dark`) | pagina HTML completa |
| `parseMarkdownToCleanHtml(md)` | markdown | solo il corpo HTML, senza pagina |
| `generateDesignSystemCss(options)` | non legge nulla da `options`; il tema si sceglie con `data-theme` | CSS con entrambi i temi |
| `highlightKeyTerms(text)` | testo di una riga | grassetto, link, immagini, codice, badge di legge |
| `injectExamTraps(html)`, `injectOralQuotes(html)`, `injectAsciiTrees(html)`, `injectExamFrequencyBadges(html)` | HTML gia convertito | HTML con trappole, frasi, schemi, badge |
| `escapeHtml(text)`, `safeUrl(url)` | stringa | stringa escapata; URL ammesso oppure `""` |

## Limiti

Il testo dei paragrafi non viene escapato (solo titolo, corso, termini delle definizioni e URL): usa Markdown tuo o di alembic, non contenuti web non fidati.

## Test

```bash
npm test
```

Licenza MIT.
