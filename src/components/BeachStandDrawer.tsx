import {
  Badge,
  Box,
  Collapse,
  Divider,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronDown,
  type IconProps,
  IconRun,
  IconWalk
} from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import type { ComponentType } from "react";
import {
  selectedBeachStandAtom,
  selectedBeachStandNeighbors,
  type BeachStandNeighbor
} from "../atoms/selectedBeackStand.ts";
import { type BeachStand } from "../data/points.ts";
import type { GPSCoordinate } from "../types.ts";
import {
  estimateTimeByCoordsDistance,
  haversineDistance,
  MOVING_MODES,
  type MovingMode
} from "../utils/map.ts";
import { COLORS } from "../utils/colors.ts";
import { formatDuration } from "../utils/time.ts";

/** Human-readable label, accent color and icon for each moving mode. */
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
  BeachStandNeighbor["direction"],
  { label: string; note: string }
> = {
  previous: { label: "Precedente", note: "direzione Latina" },
  next: { label: "Successivo", note: "direzione San Felice" }
};

function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Bottom-sheet-like drawer that opens when a beach stand is selected
 * (`selectedBeachStandAtom` defined) and clears the selection on close.
 */
export const BeachStandDrawer = () => {
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const resetAtom = useResetAtom(selectedBeachStandAtom);

  return (
    <Drawer.Root
      opened={beachStand !== undefined}
      onClose={resetAtom}
      position="bottom"
      size="auto"
      radius="md"
      lockScroll={false}
      trapFocus={false}
      closeOnClickOutside={false}
    >
      {/* No Drawer.Overlay: keep the map behind the sheet fully interactive. */}
      <Drawer.Content
        styles={{
          // Let clicks/touches pass through the portal wrapper to the map;
          // only the sheet content itself stays interactive.
          inner: { pointerEvents: "none" },
          // Bottom-sheet: at most half the screen height. Laid out as a
          // column so the header (title/close) stays put and only the
          // neighbor list below scrolls.
          content: {
            maxHeight: "40dvh",
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            // Lift the sheet off the map beneath it (there's no overlay).
            boxShadow: "0 -2px 16px rgba(0, 0, 0, 0.08)"
          }
        }}
      >
        <Drawer.Header
          style={{
            position: "relative",
            justifyContent: "center",
            flexShrink: 0,
            paddingBottom: "var(--mantine-spacing-sm)"
          }}
        >
          <Drawer.Title
            style={{
              margin: 0,
              textAlign: "center",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              // Larger than the NeighborCard titles (which use size="lg").
              fontSize: "1.5rem"
            }}
          >
            {beachStand?.name}
          </Drawer.Title>
          <Drawer.CloseButton
            style={{
              position: "absolute",
              top: "var(--mantine-spacing-md)",
              right: "var(--mantine-spacing-md)"
            }}
          />
        </Drawer.Header>

        {/* Bottom-sheet grab handle. */}
        <Box
          mx="auto"
          mb="sm"
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            backgroundColor: "var(--mantine-color-gray-3)",
            flexShrink: 0
          }}
        />

        <Divider color="gray.1" style={{ flexShrink: 0 }} />

        <Drawer.Body
          style={{ flex: 1, minHeight: 0, overflowY: "auto" }}
          pt="md"
        >
          {beachStand && <NeighborTravelTimes beachStand={beachStand} />}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

const NeighborTravelTimes = ({ beachStand }: { beachStand: BeachStand }) => {
  const neighboors = useAtomValue(selectedBeachStandNeighbors);

  return (
    <Stack gap="md" pb="md" maw={520} mx="auto" w="100%">
      {neighboors.map(neighboor => (
        <NeighborCard
          key={neighboor.id}
          origin={beachStand.coordinates}
          neighbor={neighboor}
        />
      ))}
    </Stack>
  );
};

type NeighborCardProps = {
  origin: GPSCoordinate;
  neighbor: BeachStandNeighbor;
};

const NeighborCard = ({ origin, neighbor }: NeighborCardProps) => {
  const times = estimateTimeByCoordsDistance(origin, neighbor.coordinates);
  const distance = haversineDistance(origin, neighbor.coordinates);
  const [opened, { toggle }] = useDisclosure(false);
  const accentColor =
    neighbor.direction === "next"
      ? COLORS.nextBeachStandLineColor
      : COLORS.prevBeachStandLineColor;

  return (
    <Paper radius="lg" p="md" shadow="xs" bg="gray.0">
      <Stack gap="md">
        <UnstyledButton onClick={toggle} aria-expanded={opened} w="100%">
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <Box
                style={{
                  width: 4,
                  alignSelf: "stretch",
                  borderRadius: 999,
                  backgroundColor: accentColor
                }}
              />
              <Stack gap={2}>
                <Text
                  fw={600}
                  size="lg"
                  lh={1.2}
                  style={{ color: accentColor }}
                >
                  {neighbor.name}
                </Text>
                <Text size="xs" c="dimmed" style={{ letterSpacing: "0.02em" }}>
                  {DIRECTION_META[neighbor.direction].label} ·{" "}
                  {DIRECTION_META[neighbor.direction].note}
                </Text>
              </Stack>
            </Group>

            <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
              <Badge variant="light" color="gray" radius="sm">
                {formatDistance(distance)}
              </Badge>
              <IconChevronDown
                size={18}
                style={{
                  transition: "transform 150ms ease",
                  transform: opened ? "rotate(180deg)" : "rotate(0deg)"
                }}
              />
            </Group>
          </Group>
        </UnstyledButton>

        <Collapse expanded={opened} style={{ width: "100%" }}>
          <Group
            gap="xs"
            align="flex-start"
            justify="center"
            wrap="wrap"
            pt={4}
          >
            {MOVING_MODES.map(mode => (
              <ModeTile key={mode} mode={mode} minutes={times[mode]} />
            ))}
          </Group>
        </Collapse>
      </Stack>
    </Paper>
  );
};

const ModeTile = ({ mode, minutes }: { mode: MovingMode; minutes: number }) => {
  const { descrizione, color, Icon } = MODE_META[mode];

  return (
    <Stack gap={6} align="center" style={{ width: 90 }}>
      <ThemeIcon variant="light" color={color} radius="md" size={42}>
        <Icon size={22} />
      </ThemeIcon>
      <Text fw={600} style={{ color: "black" }} size="sm" lh={1}>
        {formatDuration(minutes)}
      </Text>
      <Text size="xs" c="dimmed" ta="center" lh={1.1}>
        {descrizione}
      </Text>
    </Stack>
  );
};
