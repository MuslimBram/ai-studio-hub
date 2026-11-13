# AI Tools Hub

AI Tools Hub është një aplikacion React + Vite me mbështetje Progressive Web App (PWA).

## Instalimi si aplikacion
- Android: Chrome → menuja → Install app / Add to Home Screen.
- iPhone/iPad: Safari → Share → Add to Home Screen.
- Desktop: Chrome/Edge → ikona Install në shiritin e adresës ose menuja e shfletuesit.

PWA kërkon HTTPS. Service worker-i ruan vetëm app shell dhe asetet statike; nuk ruan autentikim, thirrje API ose të dhëna të përdoruesit. Funksionet që kërkojnë rrjet, llogari ose shërbime AI vazhdojnë të kërkojnë internet.

## Zhvillimi lokal
```bash
npm ci
npm run dev
```

## Build
```bash
npx vite build
```

Vercel përdor `vercel.json` dhe dosjen `dist`.
