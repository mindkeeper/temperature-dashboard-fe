import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/global.css";
import { App } from "./app";

async function enableMocking() {
  // Only enable MSW in development mode and if MSW is enabled via environment variable
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === "true") {
    const { worker } = await import("./mocks/browser");
    return worker.start({ onUnhandledRequest: "bypass" });
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

await enableMocking();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
