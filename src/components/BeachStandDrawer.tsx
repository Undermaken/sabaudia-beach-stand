import { Box, Divider, Drawer, Group, Stack, Text } from "@mantine/core";
import { useAtomValue } from "jotai";
import { selectedBeachStandAtom } from "../atoms/selectedBeackStand.ts";
import { useResetAtom } from "jotai/utils";
import { getBesideBeachStand, type BeachStand } from "../data/points.ts";
import { estimateTimeByDistance, haversineDistance } from "../utils/map.ts";

/**
 * Bottom-sheet-like drawer that opens whenever a beach stand is selected
 * (i.e. `selectedBeachStandAtom` is defined) and clears the selection on close.
 */
export const BeachStandDrawer = () =>  {
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const resetAtom = useResetAtom(selectedBeachStandAtom);

  return (
    <Drawer
      opened={beachStand !== undefined}
      onClose={resetAtom}
      position="bottom"
      size="sm"
      radius="lg"
      withCloseButton
      title={beachStand?.name}
      styles={{
        title: { fontWeight: 700, fontSize: "var(--mantine-font-size-lg)" }
      }}
    >
      {/* Bottom-sheet grab handle. */}
      <Box
        mx="auto"
        mb="sm"
        style={{
          width: 40,
          height: 4,
          borderRadius: 999,
          backgroundColor: "var(--mantine-color-gray-4)"
        }}
      />

      {beachStand && (
        <Stack gap="xs" pb="md">
          <Test beachStand={beachStand}/>
          <DetailRow label="Provider" value={beachStand.provider} />
          <DetailRow
            label="Coordinates"
            value={`${beachStand.coordinates.latitude.toFixed(5)}, ${beachStand.coordinates.longitude.toFixed(5)}`}
          />
          {beachStand.address && beachStand.address !== "N/A" && (
            <DetailRow label="Address" value={beachStand.address} />
          )}
          <Divider />
          <Text size="xs" c="dimmed">
            Recorded {new Date(beachStand.timestamp).toLocaleString()}
          </Text>
        </Stack>
      )}
    </Drawer>
  );
}

const Test: React.FC<{beachStand: BeachStand}> = ({beachStand}) => {
  const previous = getBesideBeachStand(beachStand, "previous");  
  const next = getBesideBeachStand(beachStand, "next"); 
  const nextDistanceInMeters = next ? haversineDistance(beachStand.coordinates, next.coordinates) : undefined; 
  const nextTime = next ? estimateTimeByDistance(beachStand.coordinates, next.coordinates) : undefined;
  console.log({nextDistanceInMeters,nextTime});
  return null;
} 

const DetailRow = ({ label, value }: { label: string; value: string })  => {
  return (
    <Group justify="space-between" gap="xl" wrap="nowrap">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} ta="right">
        {value}
      </Text>
    </Group>
  );
}
