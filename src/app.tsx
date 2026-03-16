import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

import { QueryProvider } from "@/components/providers/query-provider";

import { AppRouter } from "./router";

export function App() {
  return (
    <QueryProvider>
      <NuqsAdapter>
        <AppRouter />
      </NuqsAdapter>
    </QueryProvider>
  );
}
