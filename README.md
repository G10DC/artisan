# Artisan

Trasforma una guida di studio in Markdown (per esempio quella prodotta da `alembic`) in una pagina HTML di studio offline: definizioni in card, priorita d'esame, trappole, frasi per l'orale, quiz Domanda/Risposta a risposta nascosta, indice, avanzamento e stampa in PDF.

```bash
node ~/.claude/skills/artisan/lib/cli.js guida.md guida.html --course "IUS/10" --theme light
```

Dettagli, formato di ingresso e API in `SKILL.md`. Solo moduli integrati di Node (>= 22). Test: `npm test`.
