import {
  AppShell,
  Burger,
  Button,
  Group,
  Stack,
  Switch,
  Text,
  Title
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChartBar } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { serviceCoverageMaxDistanceToStandMetersAtom } from "./atoms/serviceCoverage.ts";
import { activeSettingsAtom, toggleSettingAtom } from "./atoms/settings.ts";
import { BeachStandDrawer } from "./components/BeachStandDrawer.tsx";
import { MapView } from "./components/MapView.tsx";
import { ServiceCoverageReportModal } from "./components/ServiceCoverageReportModal.tsx";

const meterFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 0
});
const formatMeters = (meters: number) => `${meterFormatter.format(meters)} m`;

export const App = () => {
  const [opened, { toggle }] = useDisclosure();
  const [reportOpened, { close: closeReport, open: openReport }] =
    useDisclosure(false);
  const activeSettings = useAtomValue(activeSettingsAtom);
  const serviceCoverageMaxDistanceToStandMeters = useAtomValue(
    serviceCoverageMaxDistanceToStandMetersAtom
  );
  const toggleSetting = useSetAtom(toggleSettingAtom);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened }
      }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Burger opened={opened} onClick={toggle} size="sm" />
            <Title
              order={4}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              Sabaudia Servizi balneari - 2026
            </Title>
          </Group>
          <Button
            leftSection={<IconChartBar size={18} />}
            onClick={openReport}
            variant="filled"
            color="teal"
            size="sm"
            style={{ flexShrink: 0 }}
          >
            Leggi i numeri
          </Button>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Navigazione
          </Text>
          <Switch
            label={`Mostra raggio di servizio (${formatMeters(serviceCoverageMaxDistanceToStandMeters)})`}
            checked={activeSettings.includes("beach_stand_cover_area")}
            onChange={() => toggleSetting("beach_stand_cover_area")}
          />
          <Switch
            label="Mostra nome stabilimenti"
            checked={activeSettings.includes("beach_stand_label")}
            onChange={() => toggleSetting("beach_stand_label")}
          />
          <Button
            leftSection={<IconChartBar size={18} />}
            onClick={openReport}
            variant="light"
            color="teal"
            mt="sm"
          >
            Leggi i numeri
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        style={{ display: "flex", flexDirection: "column", height: "100dvh" }}
      >
        <MapView />
      </AppShell.Main>

      <BeachStandDrawer />
      <ServiceCoverageReportModal opened={reportOpened} onClose={closeReport} />
    </AppShell>
  );
};
