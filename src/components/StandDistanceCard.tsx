import {
  Badge,
  Box,
  Collapse,
  Group,
  Paper,
  Stack,
  Text,
  UnstyledButton
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronDown, IconRun, IconWalk } from "@tabler/icons-react";
import type { GPSCoordinate } from "../types.ts";
import {
  estimateTimeByCoordsDistance,
  haversineDistance,
  MOVING_MODES,
  type MovingMode
} from "../utils/map.ts";
import { ModeTile } from "./ModeTile.tsx";

const MODE_META: Record<
  MovingMode,
  { description: string; color: string; icon: typeof IconWalk }
> = {
  walking: { description: "Camminata", color: "teal", icon: IconWalk },
  fastWalking: {
    description: "Camminata veloce",
    color: "cyan",
    icon: IconWalk
  },
  lightRunning: {
    description: "Corsa leggera",
    color: "yellow",
    icon: IconRun
  },
  moderateRunning: {
    description: "Corsa moderata",
    color: "orange",
    icon: IconRun
  },
  sustainedRunning: {
    description: "Corsa sostenuta",
    color: "red",
    icon: IconRun
  }
};

function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)} m`
    : `${(meters / 1000).toFixed(1)} km`;
}

type StandDistanceCardProps = {
  accentColor: string;
  name: string;
  origin: GPSCoordinate;
  destination: GPSCoordinate;
  subtitle?: string;
};

export const StandDistanceCard = ({
  accentColor,
  name,
  origin,
  destination,
  subtitle
}: StandDistanceCardProps) => {
  const times = estimateTimeByCoordsDistance(origin, destination);
  const distance = haversineDistance(origin, destination);
  const [opened, { toggle }] = useDisclosure(false);

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
                  {name}
                </Text>
                {subtitle && (
                  <Text
                    size="xs"
                    c="dimmed"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {subtitle}
                  </Text>
                )}
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
              <ModeTile
                key={mode}
                color={MODE_META[mode].color}
                description={MODE_META[mode].description}
                icon={MODE_META[mode].icon}
                minutes={times[mode]}
              />
            ))}
          </Group>
        </Collapse>
      </Stack>
    </Paper>
  );
};
