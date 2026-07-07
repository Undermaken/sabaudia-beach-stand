import {
  Badge,
  Box,
  Collapse,
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
  estimateTimeByDistance,
  haversineDistance,
  MOVING_MODES,
  type MovingMode
} from "../utils/map.ts";
import { COLORS } from "../utils/colors.ts";

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
            overflow: "hidden"
          }
        }}
      >
        <Drawer.Header
          style={{
            position: "relative",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <Drawer.Title
            style={{
              margin: 0,
              textAlign: "center",
              fontWeight: 700,
              // Larger than the NeighborCard titles (which use size="lg").
              fontSize: "1.75rem"
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
          mt="sm"
          mb="md"
          style={{
            width: 40,
            height: 4,
            borderRadius: 999,
            backgroundColor: "var(--mantine-color-gray-4)",
            flexShrink: 0
          }}
        />

        <Drawer.Body style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {beachStand && <NeighborTravelTimes beachStand={beachStand} />}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};

const NeighborTravelTimes = ({ beachStand }: { beachStand: BeachStand }) => {
  const neighboors = useAtomValue(selectedBeachStandNeighbors);

  return (
    <Stack gap="sm" pb="md" maw={520} mx="auto" w="100%">
      {neighboors.map(neighboor => (
        <NeighborCard origin={beachStand.coordinates} neighbor={neighboor} />
      ))}
    </Stack>
  );
};

type NeighborCardProps = {
  origin: GPSCoordinate;
  neighbor: BeachStandNeighbor;
};

const NeighborCard = ({ origin, neighbor }: NeighborCardProps) => {
  const times = estimateTimeByDistance(origin, neighbor.coordinates);
  const distance = haversineDistance(origin, neighbor.coordinates);
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="sm" align="center">
        <Stack gap={4} align="center">
          <UnstyledButton onClick={toggle} aria-expanded={opened}>
            <Group gap="xs" justify="center" wrap="nowrap">
              <Text
                fw={700}
                size="lg"
                ta="center"
                lh={1.2}
                style={{
                  color:
                    neighbor.direction === "next"
                      ? COLORS.nextBeachStandLineColor
                      : COLORS.prevBeachStandLineColor
                }}
              >
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
              <IconChevronDown
                size={18}
                style={{
                  transition: "transform 150ms ease",
                  transform: opened ? "rotate(180deg)" : "rotate(0deg)"
                }}
              />
            </Group>
          </UnstyledButton>

          <Text size="xs" tt="uppercase" fw={700} c="dimmed" ta="center">
            <Text span size="xs" tt="none" fw={500} c="dimmed">
              punto di servizio{" "}
            </Text>
            {DIRECTION_META[neighbor.direction].label}{" "}
          </Text>
          <Text span size="xs" tt="none" fw={500} c="dimmed">
            ({DIRECTION_META[neighbor.direction].note})
          </Text>
        </Stack>

        <Collapse expanded={opened}>
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
};
