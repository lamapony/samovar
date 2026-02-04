# Samovar - Russisk Sprogkursus

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/samovar)

Akademisk russisk sprogkursus for dansktalende. Et struktureret kursus med fokus på grammatik, fonetik og kulturel forståelse.

**Live site:** [samovar.dk](https://samovar.dk) (foreslået domæne)

## Beskrivelse

## Beskrivelse

Samovar dekonstruerer det russiske sprog og viser logikken bag det tilsyneladende kaos af undtagelser. Vi bruger en komparativ metode, der bygger på kendskabet til det danske grammatiske system.

## Teknologier

- **Vite** - Build tool
- **TypeScript** - Programmeringssprog
- **SCSS/CSS** - Styling
- **HTML5** - Markup

## Installation

```bash
npm install
```

## Udvikling

```bash
npm run dev
```

Serveren starter på `http://localhost:5173`

## Build

```bash
npm run build
```

Output genereres i `dist/`-mappen.

## Deploy

### Netlify (anbefalet)

1. Byg projektet: `npm run build`
2. Deploy `dist/`-mappen til Netlify
3. Eller brug Netlify CLI: `netlify deploy --prod --dir=dist`

### Vercel

```bash
npm i -g vercel
vercel --prod
```

### GitHub Pages

1. Push til GitHub
2. Aktivér GitHub Pages i repository indstillinger
3. Vælg `gh-pages` branch eller GitHub Actions

## Struktur

```
samovar/
├── index.html          # Hovedside
├── cases.html          # Kasus/endinger
├── dictionary.html     # Ordbog
├── phonetics.html      # Fonetik
├── css/               # Stylesheets
├── js/                # TypeScript/JavaScript
├── lessons/           # Lektioner
├── beginner/          # Nybegynderkursus
├── articles/          # Artikler
└── images/            # Billeder
```

## Bidrag

Dette er et personligt projekt. For spørgsmål, kontakt dmitri@babinov.dk

## Licens

MIT License
