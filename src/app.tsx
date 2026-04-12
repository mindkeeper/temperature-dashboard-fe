import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

import { AppRouter } from "./router";

export function App() {
  return (
    <QueryProvider>
      <NuqsAdapter>
        <AppRouter />
        <Toaster richColors position="top-right" />
      </NuqsAdapter>
    </QueryProvider>
  );
}
