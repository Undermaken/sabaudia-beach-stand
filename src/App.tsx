import { AppShell, Burger, Group, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { BeachStandDrawer } from "./components/BeachStandDrawer.tsx";
import { MapView } from "./components/MapView.tsx";

export function App() {
  const [opened, { toggle }] = useDisclosure();

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
        <Text size="sm" c="dimmed">
          Navigazione
        </Text>
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
