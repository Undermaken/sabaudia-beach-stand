import {
  Badge,
  Box,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon
} from "@mantine/core";
import { type IconProps, IconRun, IconWalk } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import type { ComponentType } from "react";
import { selectedBeachStandAtom } from "../atoms/selectedBeackStand.ts";
import { type BeachStand, getBesideBeachStand } from "../data/points.ts";
import type { GPSCoordinate } from "../types.ts";
import {
  estimateTimeByDistance,
  haversineDistance,
  MOVING_MODES,
  type MovingMode
} from "../utils/map.ts";

/** Descrizione leggibile, colore e icona per ogni tipo di movimento. */
const MODE_META: Record<
  MovingMode,
  { descrizione: string; color: string; Icon: ComponentType<IconProps> }
> = {
  walking: { descrizione: "Camminata", color: "teal", Icon: IconWalk },
  fastWalking: {
    descrizione: "Camminata veloce",
    color: "cyan",
    Icon: IconWalk
  },
  lightRunning: {
    descrizione: "Corsa leggera",
    color: "yellow",
    Icon: IconRun
  },
  moderateRunning: {
    descrizione: "Corsa moderata",
    color: "orange",
    Icon: IconRun
  },
  sustainedRunning: {
    descrizione: "Corsa sostenuta",
    color: "red",
    Icon: IconRun
  }
};

const DIRECTION_META: Record<
  "previous" | "next",
  { label: string; note: string }
> = {
  previous: { label: "Precedente", note: "direzione Latina" },
  next: { label: "Successivo", note: "direzione San Felice" }
};

function formatDuration(minutes: number): string {
  if (minutes < 1) return "<1 min";
  const total = Math.round(minutes);
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Drawer stile bottom-sheet che si apre quando uno stabilimento è selezionato
 * (`selectedBeachStandAtom` definito) e azzera la selezione alla chiusura.
 */
export const BeachStandDrawer = () => {
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const resetAtom = useResetAtom(selectedBeachStandAtom);

  return (
    <Drawer
      opened={beachStand !== undefined}
      onClose={resetAtom}
      position="bottom"
      size="auto"
      radius="lg"
      withCloseButton
      title={beachStand?.name}
      styles={{
        // Titolo (nome dello stabilimento) centrato orizzontalmente: la close
        // button è posizionata in assoluto così non sbilancia il centraggio.
        header: { position: "relative", justifyContent: "center" },
        close: {
          position: "absolute",
          top: "var(--mantine-spacing-md)",
          right: "var(--mantine-spacing-md)"
        },
        title: {
          margin: 0,
          textAlign: "center",
          fontWeight: 700,
          fontSize: "var(--mantine-font-size-lg)"
        },
        // Bottom-sheet: al massimo metà schermo, con scroll interno del corpo.
        content: { maxHeight: "50dvh" },
        body: { overflowY: "auto" }
      }}
    >
      {/* Maniglia della bottom-sheet. */}
      <Box
        mx="auto"
        mb="md"
        style={{
          width: 40,
          height: 4,
          borderRadius: 999,
          backgroundColor: "var(--mantine-color-gray-4)"
        }}
      />

      {beachStand && <NeighborTravelTimes beachStand={beachStand} />}
    </Drawer>
  );
};

/** Mostra i tempi di spostamento verso lo stabilimento precedente e successivo. */
function NeighborTravelTimes({ beachStand }: { beachStand: BeachStand }) {
  const previous = getBesideBeachStand(beachStand, "previous");
  const next = getBesideBeachStand(beachStand, "next");

  return (
    <Stack gap="sm" pb="md" maw={520} mx="auto" w="100%">
      {previous && (
        <NeighborCard
          direction="previous"
          origin={beachStand.coordinates}
          neighbor={previous}
        />
      )}
      {next && (
        <NeighborCard
          direction="next"
          origin={beachStand.coordinates}
          neighbor={next}
        />
      )}
    </Stack>
  );
}

type NeighborCardProps = {
  direction: "previous" | "next";
  origin: GPSCoordinate;
  neighbor: BeachStand;
};

function NeighborCard({ direction, origin, neighbor }: NeighborCardProps) {
  const times = estimateTimeByDistance(origin, neighbor.coordinates);
  const distance = haversineDistance(origin, neighbor.coordinates);

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm" align="center">
        <Text size="xs" tt="uppercase" fw={700} c="dimmed" ta="center">
          {DIRECTION_META[direction].label}{" "}
          <Text span size="xs" tt="none" fw={500} c="dimmed">
            ({DIRECTION_META[direction].note})
          </Text>
        </Text>

        <Group gap="xs" justify="center" wrap="nowrap">
          <Text fw={700} size="lg" ta="center" lh={1.2}>
            {neighbor.name}
          </Text>
          <Badge
            variant="light"
            color="gray"
            radius="sm"
            style={{ flexShrink: 0 }}
          >
            {formatDistance(distance)}
          </Badge>
        </Group>

        <Group gap="md" justify="center" wrap="wrap">
          {MOVING_MODES.map(mode => (
            <ModeTile key={mode} mode={mode} minutes={times[mode]} />
          ))}
        </Group>
      </Stack>
    </Paper>
  );
}

function ModeTile({ mode, minutes }: { mode: MovingMode; minutes: number }) {
  const { descrizione, color, Icon } = MODE_META[mode];

  return (
    <Stack gap={4} align="center" style={{ width: 88 }}>
      <ThemeIcon variant="light" color={color} radius="md" size={42}>
        <Icon size={22} />
      </ThemeIcon>
      <Text fw={700} size="sm" lh={1}>
        {formatDuration(minutes)}
      </Text>
      <Text size="xs" c="dimmed" ta="center" lh={1.1}>
        {descrizione}
      </Text>
    </Stack>
  );
}
