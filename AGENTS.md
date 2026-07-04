# AGENTS.md

Guidance for AI agents working in this repository.

## Project

Sabaudia Beach — a mobile-first, client-side React SPA (Vite + TypeScript +
Mantine) that renders a Mapbox map with beach-stand waypoints. No SSR, no
backend, no database. Deployable as a static site on Vercel.

State is managed with Jotai. Icons come from `@tabler/icons-react`. Formatting
and linting are handled by Biome (`biome.json`).

## Required checks

**After concluding any change, always run `pnpm check:types` to compile the
TypeScript project and confirm there are no compilation errors.** Do not
consider a change complete until this passes.

```bash
pnpm check:types   # tsc -b --noEmit — must pass before finishing
```

Also run Biome on touched files:

```bash
pnpm check         # biome check --write . (format + safe lint fixes)
```

## Conventions

- **Always write React components as constant arrow functions**
  (`const MyComponent = (props: Props) => { ... }`), never as `function`
  declarations. This applies to every component, including small local helpers.
- Write code, comments, and documentation in English.
- Match the existing Biome style (2-space indent, width 80, double quotes,
  no trailing commas, `asNeeded` arrow parentheses).
- Use `.ts`/`.tsx` extensions in relative imports (bundler resolution).
- Read the Mapbox token from `import.meta.env.VITE_MAPBOX_ACCESS_TOKEN`; never
  hardcode secrets. Document new env vars in `.env.example`.
