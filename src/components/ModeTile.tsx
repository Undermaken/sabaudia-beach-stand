import { Stack, Text, ThemeIcon } from "@mantine/core";
import type { IconProps } from "@tabler/icons-react";
import type { ComponentType } from "react";
import { formatDuration } from "../utils/units.ts";

type ModeTileProps = {
  color: string;
  description: string;
  icon: ComponentType<IconProps>;
  minutes: number;
};

export const ModeTile = ({
  color,
  description,
  icon: Icon,
  minutes
}: ModeTileProps) => (
  <Stack gap={6} align="center" style={{ width: 90 }}>
    <ThemeIcon variant="light" color={color} radius="md" size={42}>
      <Icon size={22} />
    </ThemeIcon>
    <Text fw={600} style={{ color: "black" }} size="sm" lh={1}>
      {formatDuration(minutes)}
    </Text>
    <Text size="xs" c="dimmed" ta="center" lh={1.1}>
      {description}
    </Text>
  </Stack>
);
