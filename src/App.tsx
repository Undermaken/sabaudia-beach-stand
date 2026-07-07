import {
  AppShell,
  Burger,
  Group,
  Stack,
  Switch,
  Text,
  Title
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { activeSettingsAtom, toggleSettingAtom } from "./atoms/settings.ts";
import { BeachStandDrawer } from "./components/BeachStandDrawer.tsx";
import { MapView } from "./components/MapView.tsx";

export function App() {
  const [opened, { toggle }] = useDisclosure();
  const activeSettings = useAtomValue(activeSettingsAtom);
  const toggleSetting = useSetAtom(toggleSettingAtom);

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: !opened }
      }}
      padding={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Burger opened={opened} onClick={toggle} size="sm" />
          <Title order={4}>Sabaudia Servizi balneari</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            Navigazione
          </Text>
          <Switch
            label="Mostra raggio di servizio"
            checked={activeSettings.includes("beach_stand_cover_area")}
            onChange={() => toggleSetting("beach_stand_cover_area")}
          />
          <Switch
            label="Mostra nome stabilimenti"
            checked={activeSettings.includes("beach_stand_label")}
            onChange={() => toggleSetting("beach_stand_label")}
          />
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main
        style={{ display: "flex", flexDirection: "column", height: "100dvh" }}
      >
        <MapView />
      </AppShell.Main>

      <BeachStandDrawer />
    </AppShell>
  );
}
