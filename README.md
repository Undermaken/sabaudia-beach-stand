# Sabaudia Beach

<p align="center">
  <img src="docs/preview.png" alt="Sabaudia Beach — service points along the coastline" width="600" />
</p>

An interactive map of food, drink and restroom service points along the Sabaudia coastline (Latina, Italy). The app answers a simple question: *if I pick a random spot on this beach, how far do I have to walk to reach the nearest service?*

It plots every tracked service point on a Mapbox map, computes coverage gaps, estimates the number of people and the economic opportunity left unserved, and bundles everything into a printable report. Users can adjust the maximum walking time and watch every metric update in real time. A GPS-based "my position" mode shows the nearest services from wherever you are.

---

A mobile-first, client-side React single-page application. No SSR, no backend
server, no database — it runs entirely in the browser and is deployable as a
static site on Vercel.

## Tech stack

- **Vite** — build tool / dev server
- **React 19** + **TypeScript** (strict)
- **Mantine** — UI component library
- **react-map-gl** + **mapbox-gl** — interactive map
- **Biome** — formatter and linter
- **pnpm** — package manager

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (22+ recommended)
- [pnpm](https://pnpm.io/) 10+ (`corepack enable` or `npm i -g pnpm`)
- A [Mapbox](https://account.mapbox.com/access-tokens/) access token

## Setup

```bash
pnpm install
cp .env.example .env
```

Then open `.env` and set your Mapbox token:

```
VITE_MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

> Without a token the app still runs, but the map area shows a warning instead
> of a map.

## Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `pnpm dev`       | Start the dev server (http://localhost:5173) |
| `pnpm build`     | Type-check and build to `dist/`              |
| `pnpm preview`   | Preview the production build locally         |
| `pnpm typecheck` | Run the TypeScript compiler                  |
| `pnpm lint`      | Lint with Biome                              |
| `pnpm format`    | Format with Biome                            |
| `pnpm check`     | Lint + format + safe fixes with Biome        |

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in [Vercel](https://vercel.com/new). It auto-detects Vite
   (build command `pnpm build`, output directory `dist`).
3. Under **Settings → Environment Variables**, add
   `VITE_MAPBOX_ACCESS_TOKEN` with your Mapbox token.
4. Deploy. `vercel.json` rewrites all routes to `index.html` so client-side
   routing works without 404s.

## Project structure

```
src/
  main.tsx            # React root + MantineProvider
  App.tsx             # App shell (mobile-first) + map
  components/
    MapView.tsx       # Mapbox map, reads token from env
  theme.ts            # Mantine theme
  index.css           # global styles
.env.example          # documents required env vars
biome.json            # Biome formatter/linter config
vercel.json           # SPA rewrite for Vercel
```
