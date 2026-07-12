import { Divider, Drawer, Box, Stack, Text } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import {
  myPositionAtom,
  myPositionNearbyStandsAtom
} from "../atoms/myPosition.ts";
import { selectedBeachStandAtom } from "../atoms/selectedBeackStand.ts";
import { StandDistanceCard } from "./StandDistanceCard.tsx";

const ACCENT_COLOR = "#1885d7";

export const MyPositionDrawer = () => {
  const myPosition = useAtomValue(myPositionAtom);
  const setMyPosition = useSetAtom(myPositionAtom);
  const nearbyStands = useAtomValue(myPositionNearbyStandsAtom);
  const selectedStand = useAtomValue(selectedBeachStandAtom);

  const lat = myPosition.position?.latitude;
  const lon = myPosition.position?.longitude;
  const hasPosition = lat != null && lon != null;
  const origin = hasPosition
    ? { latitude: lat, longitude: lon, altitude: 0 }
    : null;

  const selectedNearby = selectedStand
    ? nearbyStands.find(s => s.id === selectedStand.id)
    : undefined;
  const otherStands = selectedStand
    ? nearbyStands.filter(s => s.id !== selectedStand.id)
    : nearbyStands;

  return (
    <Drawer.Root
      opened={myPosition.active && myPosition.drawerOpen}
      onClose={() => setMyPosition(pv => ({ ...pv, drawerOpen: false }))}
      position="bottom"
      size="auto"
      radius="md"
      lockScroll={false}
      trapFocus={false}
      closeOnClickOutside={false}
    >
      <Drawer.Content
        styles={{
          inner: { pointerEvents: "none" },
          content: {
            maxHeight: "40dvh",
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
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
              fontSize: "1.5rem"
            }}
          >
            La tua posizione
            <Text mt={4} size="sm" style={{ color: "gray" }}>
              Ecco i punti di servizio più vicini a te, ordinati per distanza
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
          {origin && (
            <Stack gap="md" pb="md" maw={520} mx="auto" w="100%">
              {selectedNearby && (
                <>
                  <Text size="sm" fw={700} c="dimmed" ta="center">
                    Punto di servizio selezionato
                  </Text>
                  <StandDistanceCard
                    accentColor={ACCENT_COLOR}
                    name={selectedNearby.name}
                    origin={origin}
                    destination={selectedNearby.coordinates}
                  />
                  <Divider color="gray.2" />
                </>
              )}
              {otherStands.map(stand => (
                <StandDistanceCard
                  key={stand.id}
                  accentColor="var(--mantine-color-teal-6)"
                  name={stand.name}
                  origin={origin}
                  destination={stand.coordinates}
                />
              ))}
            </Stack>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  );
};
