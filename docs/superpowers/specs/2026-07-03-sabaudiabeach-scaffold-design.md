# SabaudiaBeach — Project Scaffold Design

Date: 2026-07-03

## Goal

Scaffold a client-side React application (no Next.js, no SSR, no backend server, no
database) that is deployable on Vercel as a static SPA. It uses Mantine for UI and
renders an interactive Mapbox map whose access token is read from the environment.

## Constraints

- TypeScript
- pnpm as package manager
- Pure React (no Next.js)
- Mantine as UI library
- A map component + its library
- Map API key read from env; a committed `.env.example`
- Must be deployable on Vercel (no SSR, no server, no DB)
- All dependencies at their latest stable versions

## Stack & Tooling

- **Vite** (`react-ts` template) as build tool — standard for pure React, builds a
  static SPA that Vercel auto-detects (`vite build` → `dist/`).
- **pnpm** — `packageManager` field pinned, `pnpm-lock.yaml` committed.
- **TypeScript** in strict mode.
- **React 19** (latest stable).

## UI

- **Mantine** (`@mantine/core`, `@mantine/hooks`) at latest v8.
- Wired via `MantineProvider` in `main.tsx` and the `postcss-preset-mantine` PostCSS
  preset so Mantine breakpoints/styles work.

## Mobile-first

- The app is designed mobile-first: layout and styles target small screens first,
  scaling up via Mantine breakpoints (`min-width` media queries).
- `index.html` sets `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- The demo page and map fill the mobile viewport (full-height layout, touch-friendly
  spacing), then use responsive Mantine props (e.g. `visibleFrom`/`hiddenFrom`, grid
  columns) to adapt on larger screens.

## Map

- **react-map-gl** + **mapbox-gl** at latest stable.
- A `MapView` component reads `import.meta.env.VITE_MAPBOX_ACCESS_TOKEN`.
- Default view centered on Sabaudia, Italy (~41.30°N, 13.03°E).
- If the token is missing, `MapView` renders a clear inline warning instead of a
  broken/blank map.

## Environment

- `.env.example` documents `VITE_MAPBOX_ACCESS_TOKEN=`.
- Real `.env` is gitignored.
- On Vercel the same variable is set in project Environment Variables.

## Vercel Deployability

- Vite SPA needs no special build config; Vercel auto-detects it.
- `vercel.json` adds an SPA rewrite (all routes → `/index.html`) so client-side
  routing does not 404.
- No blockers: every choice above is Vercel-compatible.

## Project Layout

```
src/
  main.tsx          # React root + MantineProvider
  App.tsx           # demo page using Mantine layout + <MapView>
  components/
    MapView.tsx     # Mapbox map, reads token from env
  theme.ts          # Mantine theme
.env.example
vercel.json
README.md           # setup: install, env, dev, build, deploy
```

## README

Covers: prerequisites (Node, pnpm), `pnpm install`, copying `.env.example` → `.env`
and obtaining a Mapbox token, `pnpm dev`, `pnpm build`, and Vercel deploy steps.
