# MauCuan exhibition demo redesign

The web demo uses the finished Android app as its visual reference: `src/components/ui.tsx`, `src/Main.tsx`, `src/components/pet-habitat.tsx`, and `docs/screenshots/`. Production Android source is unchanged.

- Start local preview: `node scripts/serve-website.cjs`, then open http://localhost:4173/demo/.
- Regression check: `node --test tests/website-demo.test.cjs` (also included in `npm test`).
- Static deployment directory: `website`. No build, account credentials, backend, or external font requests are required for the demo.
- All demo data lives in memory. Reset and reload restore the starting scenario. Receipt recognition uses the supplied example rather than a camera or OCR service.
- Miko's five expressions and Plus Jakarta Sans / Ionicons fonts are copied from the existing application assets/dependencies. Font licenses are included beside the assets.

Verified in the in-app browser: desktop 1440×1000 and laptop 1366×768, mobile 390×844 and 320×740; manual expense, edited receipt save, goal creation/allocation, Miko expressions/check-in, full quiz, reset, and keyboard scan. Drag/drop and touch-pointer handlers have runnable regression coverage. Native Windows mouse-drag automation was unavailable because the browser URL could not be verified; run a final physical mouse/touch check on the exhibition device.

Publish `website` to the existing Vercel project only with explicit approval. The user approved pushing this redesign and the updated landing page to GitHub and Vercel on November 20, 2026.

Laptop layout gate: at 1440×900, 1366×768, 1280×720, and 1024×600, open Beranda and Macan with the app at scroll position zero. Scan/manual buttons, check-in, the three recent transactions, all six Miko actions, and XP must lie entirely inside `#app`, above navigation. The room image must stay inside the habitat. The app now adapts to the device screen height (including browser zoom); laptop Miko controls sit beside the habitat.
