---
name: artisan
description: Motore di layout visivo e gerarchia pedagogica per manuali di studio universitari, appunti interattivi e preparazione ad esami orali e scritti.
audience: studente universitario italiano
exam_type: orale + scritto
---

# Artisan — Motore di Layout Visivo e Gerarchia Pedagogica per Studio Universitario

`artisan` trasforma basi di conoscenza in markdown in applicazioni web di studio interattive, ottimizzate per il metodo di studio universitario italiano. Applica una gerarchia visiva a 6 livelli mappata sulle 4 fasi di studio (lettura attiva, schematizzazione, memorizzazione, preparazione all'orale) preservando il 100% del contenuto della fonte.

---

## Le 4 Fasi di Studio e i 6 Livelli Visivi

| Fase di Studio | Cosa fa lo studente | Livelli Artisan attivi | Strumenti interattivi |
|:---|:---|:---|:---|
| 1. Lettura Attiva | Legge, sottolinea, prende appunti | Layer 1 (Termini Chiave), Layer 6 (Logiche Decisionali) | Live Search, evidenziazione termini |
| 2. Schematizzazione | Sintetizza in blocchi tematici, crea mappe | Layer 4 (Alberi ASCII), Layer 5 (Collegamenti), Mappe Mentali Mermaid | Mermaid mindmap, schemi di sintesi |
| 3. Memorizzazione Attiva | Ripassa con ripasso distribuito, si autovaluta | Layer 2 (Trappole d'Esame), Flashcard | Flashcard 3D con SRS, Quiz Simulator, Progress Tracking |
| 4. Preparazione Orale | Prova l'esposizione verbale a tempo | Layer 3 (Frase Pronta per l'Orale), Simulazione Orale | Modalità Orale con timer, frasi-sintesi |

---

## I 6 Livelli della Gerarchia Visiva

### Layer 1 — Termini Chiave (`<strong class="highlight-term">`)
Auto-rilevazione di concetti, leggi, date, nomi di autori e distinzioni teoriche. Stile ad alto impatto per il "colpo d'occhio" durante la rilettura rapida.

### Layer 2 — Trappole d'Esame (`❌ Falso Mito → ✅ Risposta Esatta`)
Callout color-coded (ambra/rosa) che evidenziano gli errori più comuni che il professore tipicamente indaga all'orale. Ogni trappola mostra:
- ❌ La risposta errata diffusa
- ✅ La risposta corretta con riferimento normativo o teorico
- 📄 Fonte (pagina manuale / articolo di legge / lezione)

### Layer 3 — Frase Pronta per l'Orale (`🎯`)
Card di sintesi verde smeraldo per il richiamo verbale immediato. Ogni card contiene:
- Una frase di apertura già formulata per l'esposizione orale
- I 2-3 concetti chiave da sviluppare
- Un collegamento al argomento successivo per mantenere il discorso fluido

### Layer 4 — Alberi di Sintesi (`🗺️ SCHEMA DI SINTESI`)
Outline ad albero in ASCII per la schematizzazione gerarchica. Utilizzare anche **mappe mentali Mermaid** per connessioni non gerarchiche.

### Layer 5 — Collegamenti e Filo Conduttore (`🔗`)
Sezioni che collegano concetti tra capitoli e argomenti, creando un filo conduttore che il professore apprezza negli esami orali articolati.

### Layer 6 — Logiche Decisionali (KaTeX `\begin{cases}`)
Blocchi matematici per alberi decisionali e casistiche (es. "Quando si applica l'art. X invece dell'art. Y?").

---

## Marcatori di Priorità d'Esame

Ogni sezione può essere etichettata con un indicatore di frequenza d'esame:

| Marcatore | Significato | Stile visivo |
|:---|:---|:---|
| 🔴 Sicuro | Argomento richiesto quasi ogni anno | Bordo rosso, badge "SICURO" |
| 🟡 Frequentemente | Richiesto regolarmente, non ogni volta | Bordo ambra, badge "FREQUENTE" |
| 🟢 Raramente | Possibile ma non probabile | Bordo verde, badge "Raro" |

Lo studente può filtrare per priorità durante il ripasso finale.

---

## Strumenti di Studio Interattivi

### Fase 1 — Lettura Attiva
- **Ricerca Live**: filtro testuale istantaneo su tutte le sezioni
- **Evidenziazione Termini**: auto-rilevamento di concetti chiave con stile personalizzato

### Fase 2 — Schematizzazione
- **Mappe Mentali Mermaid**: diagrammi client-side per connessioni concettuali
- **Alberi ASCII**: outline gerarchici per sintesi rapida
- **Modalità Schema**: nasconde il testo discorsivo e mostra solo schemi, tabelle e mappe

### Fase 3 — Memorizzazione Attiva
- **Flashcard 3D con SRS (Spaced Repetition System)**: algoritmo di ripasso distribuito basato sulla curva dell'oblio (SM-2). Frequenza di riproposizione calcolata in base alla confidenza dichiarata (0-5).
- **Quiz Simulator**: domande a risposta multipla e aperta con correzione immediata
- **Progress Tracking**: tracciamento per argomento con localStorage, mostra percentuale di completamento per area tematica

### Fase 4 — Preparazione all'Orale
- **Modalità Orale**: estrae un argomento casuale dai "Sicuri" e attiva un timer configurabile (es. 3 minuti per organizzare, 10 minuti per esporre). Lo studente può registrare la propria esposizione e confrontarla con la Frase Pronta.
- **Simulatore di Sequenza**: simula la sequenza tipica di domande del professore (argomento → approfondimento → collegamento trasversale)
- **Gestione Ansia**: suggerimenti di respirazione e framing mentale prima della simulazione

---

## Accessibilità e DSA

- **Font dislessico**: opzione per OpenDyslexic o font ad alta leggibilità
- **Contrasto alto**: modalità ad alto contrasto per ipovisione
- **Text-to-Speech**: sintesi vocale per ascolto del materiale (supporto stile di apprendimento auditivo)
- **Riduzione carico cognitivo**: frasi brevi, forma attiva, modo indicativo, niente doppie negazioni, blocchi tematici — in linea con le linee guida per materiale didattico accessibile

---

## Tracciamento Bibliografico

Ogni concetto può includere metadati di provenienza:

```yaml
source:
  type: manuale | lezione | articolo | sentenza
  reference: "Cap. 3, pp. 45-67" | "Lezione 12/03/2026" | "Art. 41 Cost." | "Cass. 12345/2024"
  page: 45
  exam_frequency: sicuro | frequente | raro
```

---

## API e Configurazione

### Opzioni di Trasformazione

| Opzione | Tipo | Default | Descrizione |
|:---|:---|:---|:---|
| `title` | `string` | — | Titolo del manuale |
| `courseCode` | `string` | `""` | Codice corso (es. "SPS/04 - 12 CFU") |
| `theme` | `"dark" \| "light"` | `"dark"` | Tema visivo (glassmorphism) |
| `enableQuiz` | `boolean` | `false` | Attiva quiz simulator |
| `enableFlashcards` | `boolean` | `false` | Attiva flashcard 3D con SRS |
| `enableKaTeX` | `boolean` | `false` | Attiva rendering matematico KaTeX |
| `enableMermaid` | `boolean` | `false` | Attiva diagrammi e mappe mentali Mermaid |
| `enableOralMode` | `boolean` | `false` | Attiva modalità simulazione orale |
| `enableDyslexicFont` | `boolean` | `false` | Attiva font OpenDyslexic |
| `enableTTS` | `boolean` | `false` | Attiva sintesi vocale |

---

## Struttura del Repository

```
artisan/
├── lib/
│   ├── artisan.js              # Motore core
│   ├── srs.js                  # Algoritmo spaced repetition
│   └── tts.js                  # Modulo text-to-speech
├── tests/
│   ├── artisan.test.js
│   └── srs.test.js
└── README.md
```

---

## Testing

```bash
node --test tests/*.test.js
```
