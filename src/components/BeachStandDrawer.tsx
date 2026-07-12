import { Divider, Drawer, Box, Group, Stack, Text } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import {
  selectedBeachStandAtom,
  selectedBeachStandNeighbors,
  type BeachStandNeighbor
} from "../atoms/selectedBeackStand.ts";
import { type BeachStand } from "../data/points.ts";
import { COLORS } from "../utils/colors.ts";
import { myPositionAtom } from "../atoms/myPosition.ts";
import { StandDistanceCard } from "./StandDistanceCard.tsx";

const DIRECTION_META: Record<
  BeachStandNeighbor["direction"],
  { label: string; note: string }
> = {
  previous: { label: "Precedente", note: "direzione Latina" },
  next: { label: "Successivo", note: "direzione San Felice" }
};

/**
 * Bottom-sheet-like drawer that opens when a beach stand is selected
 * (`selectedBeachStandAtom` defined) and clears the selection on close.
 */
export const BeachStandDrawer = () => {
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const resetAtom = useResetAtom(selectedBeachStandAtom);
  const myPosition = useAtomValue(myPositionAtom);

  return (
    <Drawer.Root
      opened={beachStand !== undefined && !myPosition.active}
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
            <Text
              mt={4}
              size={"sm"}
              style={{
                color: "gray"
              }}
            >
              di seguito trovi i punti di servizio più vicini a{" "}
              <b>"{beachStand?.name}"</b>
            </Text>
            <Text
              mt={0}
              size={"sm"}
              style={{
                color: "gray"
              }}
            >
              se li espandi puoi sapere quanto tempo impiegheresti
              <br /> a raggiungerli partendo da questo punto
            </Text>
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
  const firstNext = neighboors.find(n => n.direction === "next");
  const firstPrevious = neighboors.find(n => n.direction === "previous");
  return (
    <Stack gap="md" pb="md" maw={520} mx="auto" w="100%">
      {[
        ...(firstNext ? [firstNext] : []),
        ...(firstPrevious ? [firstPrevious] : []),
        ...neighboors.filter(
          n => n.id !== firstNext?.id && n.id !== firstPrevious?.id
        )
      ]
        .slice(0, 6)
        .map(neighboor => {
          const accentColor =
            neighboor.direction === "next"
              ? COLORS.nextBeachStandLineColor
              : COLORS.prevBeachStandLineColor;
          return (
            <StandDistanceCard
              key={neighboor.id}
              accentColor={accentColor}
              name={neighboor.name}
              origin={beachStand.coordinates}
              destination={neighboor.coordinates}
              subtitle={`${DIRECTION_META[neighboor.direction].label} · ${DIRECTION_META[neighboor.direction].note}`}
            />
          );
        })}
    </Stack>
  );
};
