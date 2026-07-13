import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Provider as JotaiProvider } from "jotai";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { theme } from "./theme.ts";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <JotaiProvider>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-center" />
        <App />
      </MantineProvider>
    </JotaiProvider>
  </StrictMode>
);
