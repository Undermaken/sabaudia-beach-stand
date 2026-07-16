import {
  AppShell,
  Burger,
  Button,
  Group,
  ScrollArea,
  Stack,
  Switch,
  Text,
  Title
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChartBar, IconMail } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { serviceCoverageMaxDistanceToStandMetersAtom } from "./atoms/serviceCoverage.ts";
import { activeSettingsAtom, toggleSettingAtom } from "./atoms/settings.ts";
import { BeachStandDrawer } from "./components/BeachStandDrawer.tsx";
import { MapView } from "./components/MapView.tsx";
import { MyPositionDrawer } from "./components/MyPositionDrawer.tsx";
import { SensorErrorHandler } from "./components/SensorErrorHandler.tsx";
import { ServiceCoverageReportModal } from "./components/ServiceCoverageReportModal.tsx";
import { formatMeters } from "./utils/units.ts";

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
        <AppShell.Section grow component={ScrollArea}>
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
              label="Mostra nome punti di servizio"
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
        </AppShell.Section>

        <AppShell.Section mt="md">
          <Button
            component="a"
            href="mailto:mbmaken@hotmail.it?subject=contatto%20da%20sabaudia-beach%20app"
            leftSection={<IconMail size={18} />}
            variant="light"
            color="teal"
            fullWidth
          >
            Contatta l'autore
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main
        style={{ display: "flex", flexDirection: "column", height: "100dvh" }}
      >
        <MapView />
      </AppShell.Main>

      <BeachStandDrawer />
      <MyPositionDrawer />
      <ServiceCoverageReportModal opened={reportOpened} onClose={closeReport} />
      <SensorErrorHandler />
    </AppShell>
  );
};
