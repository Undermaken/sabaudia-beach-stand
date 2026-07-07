# Service Area Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a navbar toggle "Mostra raggio di servizio" that draws a translucent, geographically-accurate 700m-radius circle under each beach stand marker.

**Architecture:** A new `Setting` literal-union atom (`activeSettingsAtom`) drives visibility. A new `ServiceAreaCircle` component computes its pixel diameter from a meters-to-pixels Web Mercator formula, re-subscribing to the map's `zoom` event so it stays accurate as the user zooms. It's nested inside `BeachStandMarker`'s existing `<Marker>`, behind the existing dot, via a zero-footprint positioning wrapper that leaves the marker's anchor behavior unchanged.

**Tech Stack:** React 19, TypeScript, Jotai (atoms), Mantine (Switch/Stack), react-map-gl v8 (`@vis.gl/react-mapbox` under the hood) / mapbox-gl, Biome (lint/format), Vite.

## Global Constraints

- No test runner exists in this project (no jest/vitest/playwright in `package.json`) — do not add one. Verify each task with `pnpm check:types`, `pnpm lint`, and (for the final task) manual browser verification via `pnpm dev`.
- Follow the existing Biome formatting (2-space indent, 80-col width) — run `pnpm check` (writes fixes) before each commit if unsure.
- `SERVICE_AREA_RADIUS_METERS = 700` and `SERVICE_AREA_OPACITY = 0.25` are the configurable constants named in the spec; circle color is `#4dabf7` (Mantine `blue.4`).
- The settings atom is in-memory only (no localStorage), matching the existing `selectedBeachStandAtom` pattern in `src/atoms/selectedBeackStand.ts`.
- Spec: `docs/superpowers/specs/2026-07-07-service-area-toggle-design.md`

---

### Task 1: Settings atom

**Files:**
- Create: `src/atoms/settings.ts`

**Interfaces:**
- Produces: `SETTINGS: readonly ["beach_stand_cover_area"]`, `type Setting = "beach_stand_cover_area"`, `activeSettingsAtom: PrimitiveAtom<Setting[]>` (via `atomWithReset`, default `[]`), `toggleSettingAtom: WritableAtom<null, [Setting], void>` (write-only, flips membership of the given setting in `activeSettingsAtom`).

- [ ] **Step 1: Create the atom file**

```ts
import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";

export const SETTINGS = ["beach_stand_cover_area"] as const;
export type Setting = (typeof SETTINGS)[number];

export const activeSettingsAtom = atomWithReset<Setting[]>([]);

export const toggleSettingAtom = atom(null, (get, set, setting: Setting) => {
  const current = get(activeSettingsAtom);
  set(
    activeSettingsAtom,
    current.includes(setting)
      ? current.filter(s => s !== setting)
      : [...current, setting]
  );
});
```

- [ ] **Step 2: Type-check and lint**

Run: `pnpm check:types && pnpm lint`
Expected: both exit with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/atoms/settings.ts
git commit -m "$(cat <<'EOF'
Add settings atom for togglable app-wide flags

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `ServiceAreaCircle` component

**Files:**
- Create: `src/components/ServiceAreaCircle.tsx`
- Create: `src/components/ServiceAreaCircle.module.css`

**Interfaces:**
- Consumes: `useMap` from `react-map-gl/mapbox` (returns `{ current?: MapRef }`, where `MapRef` has `getZoom(): number`, `on(event, cb)`, `off(event, cb)` — confirmed against `node_modules/.pnpm/@vis.gl+react-mapbox*/node_modules/@vis.gl/react-mapbox/dist/mapbox/create-ref.d.ts`).
- Produces: `ServiceAreaCircle({ latitude: number }): JSX.Element`, `SERVICE_AREA_RADIUS_METERS = 700`, `SERVICE_AREA_OPACITY = 0.25` — all three consumed by Task 3.

- [ ] **Step 1: Create the CSS module**

```css
.circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: #4dabf7;
  pointer-events: none;
}
```

- [ ] **Step 2: Create the component**

```tsx
import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/mapbox";
import classes from "./ServiceAreaCircle.module.css";

export const SERVICE_AREA_RADIUS_METERS = 700;
export const SERVICE_AREA_OPACITY = 0.25;

type ServiceAreaCircleProps = {
  latitude: number;
};

// Web Mercator ground resolution: meters per pixel at a given latitude/zoom.
const metersPerPixel = (latitude: number, zoom: number): number =>
  (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;

export const ServiceAreaCircle = ({ latitude }: ServiceAreaCircleProps) => {
  const { current: map } = useMap();
  const [zoom, setZoom] = useState(() => map?.getZoom() ?? 0);

  useEffect(() => {
    if (!map) {
      return;
    }
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoom", onZoom);
    return () => {
      map.off("zoom", onZoom);
    };
  }, [map]);

  const diameterPx =
    (2 * SERVICE_AREA_RADIUS_METERS) / metersPerPixel(latitude, zoom);

  return (
    <div
      className={classes.circle}
      style={{
        width: diameterPx,
        height: diameterPx,
        opacity: SERVICE_AREA_OPACITY
      }}
    />
  );
};
```

- [ ] **Step 3: Type-check and lint**

Run: `pnpm check:types && pnpm lint`
Expected: both exit with no errors. If `useExhaustiveDependencies` (Biome) flags the `useEffect`, confirm the dependency array is exactly `[map]` (it is — `setZoom` is stable and excluded by design).

- [ ] **Step 4: Commit**

```bash
git add src/components/ServiceAreaCircle.tsx src/components/ServiceAreaCircle.module.css
git commit -m "$(cat <<'EOF'
Add ServiceAreaCircle component

Renders a translucent circle sized from a real-world meter radius,
recalculated on every map zoom change so it stays geographically accurate.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Wire the circle into `BeachStandMarker`

**Files:**
- Modify: `src/components/BeachStandMarker.tsx`
- Modify: `src/components/BeachStandMarker.module.css`

**Interfaces:**
- Consumes: `activeSettingsAtom` (Task 1), `ServiceAreaCircle` (Task 2).
- Produces: no new exports; `WaypointMarker` behavior extended (unchanged signature).

- [ ] **Step 1: Add the wrapper class to the CSS module**

In `src/components/BeachStandMarker.module.css`, add this rule above `.dot`:

```css
.markerRoot {
  position: relative;
}

```

- [ ] **Step 2: Update the component**

Replace the full contents of `src/components/BeachStandMarker.tsx` with:

```tsx
import { useAtomValue, useSetAtom } from "jotai";
import { Marker } from "react-map-gl/mapbox";
import { activeSettingsAtom } from "../atoms/settings.ts";
import { selectedBeachStandAtom } from "../atoms/selectedBeackStand.ts";
import type { BeachStand } from "../data/points.ts";
import { ServiceAreaCircle } from "./ServiceAreaCircle.tsx";
import classes from "./BeachStandMarker.module.css";

type BeachStandProps = {
  beachStand: BeachStand;
};

/**
 * A beach stand shown as a red dot with a white stroke. The name is revealed on
 * click (via the selected-stand drawer). When it matches the selected stand it
 * changes color and pulses, to set it apart from the others.
 */
export const WaypointMarker = ({ beachStand }: BeachStandProps) => {
  const { latitude, longitude } = beachStand.coordinates;
  const selectBeachStand = useSetAtom(selectedBeachStandAtom);
  const selected = useAtomValue(selectedBeachStandAtom);
  const activeSettings = useAtomValue(activeSettingsAtom);
  const isSelected = selected?.id === beachStand.id;
  const showServiceArea = activeSettings.includes("beach_stand_cover_area");

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="center"
      onClick={() => selectBeachStand(beachStand)}
    >
      <div className={classes.markerRoot}>
        {showServiceArea && <ServiceAreaCircle latitude={latitude} />}
        <div
          title={beachStand.name}
          className={
            isSelected ? `${classes.dot} ${classes.selected}` : classes.dot
          }
        />
      </div>
    </Marker>
  );
};
```

- [ ] **Step 3: Type-check and lint**

Run: `pnpm check:types && pnpm lint`
Expected: both exit with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/BeachStandMarker.tsx src/components/BeachStandMarker.module.css
git commit -m "$(cat <<'EOF'
Nest ServiceAreaCircle inside beach stand markers

The circle is conditionally rendered behind the existing dot inside a
position:relative wrapper that keeps the Marker's anchor="center"
behavior unchanged (the wrapper's own box still equals the dot's box,
since the circle is absolutely positioned out of flow).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Navbar toggle

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `activeSettingsAtom`, `toggleSettingAtom` (Task 1).

- [ ] **Step 1: Update `App.tsx`**

Replace the full contents of `src/App.tsx` with:

```tsx
import { AppShell, Burger, Group, Stack, Switch, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { activeSettingsAtom, toggleSettingAtom } from "./atoms/settings.ts";
import { BeachStandDrawer } from "./components/BeachStandDrawer.tsx";
import { MapView } from "./components/MapView.tsx";

export function App() {
  const [opened, { toggle }] = useDisclosure();
  const activeSettings = useAtomValue(activeSettingsAtom);
  const toggleSetting = useSetAtom(toggleSettingAtom);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened }
      }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Burger opened={opened} onClick={toggle} size="sm" />
          <Title order={4}>Sabaudia Servizi balneari</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Navigazione
          </Text>
          <Switch
            label="Mostra raggio di servizio"
            checked={activeSettings.includes("beach_stand_cover_area")}
            onChange={() => toggleSetting("beach_stand_cover_area")}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        style={{ display: "flex", flexDirection: "column", height: "100dvh" }}
      >
        <MapView />
      </AppShell.Main>

      <BeachStandDrawer />
    </AppShell>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `pnpm check:types && pnpm lint`
Expected: both exit with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
Add navbar toggle for the beach stand service radius

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Manual verification

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev` and open the printed local URL in a browser.

- [ ] **Step 2: Verify the toggle is off by default**

Open the navbar (burger icon). Confirm "Mostra raggio di servizio" is present and unchecked, and no circles are visible on the map.

- [ ] **Step 3: Verify the circle appears and scales correctly**

Turn the switch on. Confirm a light-blue translucent circle appears centered under every marker dot, and the dot is still on top (clickable, unobscured). Zoom in and out with the map controls/scroll: confirm the circle visibly grows/shrinks in step with the zoom (it should look like a constant ~700m on the ground at every zoom level, not a constant pixel size).

- [ ] **Step 4: Verify marker interactions still work**

With the toggle on, click a marker dot: confirm the selection drawer opens as before and the dot still gets the selected pulse styling. Confirm clicking works precisely on the dot (the circle must not block or shift clicks, since it has `pointer-events: none`).

- [ ] **Step 5: Verify the toggle turns the circles off**

Turn the switch off. Confirm all circles disappear immediately and marker behavior is otherwise unaffected.

- [ ] **Step 6: Check the browser console**

Confirm no errors or warnings were logged during steps 2–5 (especially none related to `map.on`/`map.off` or missing map instance).
