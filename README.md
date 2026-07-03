# Sabaudia Beach

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
