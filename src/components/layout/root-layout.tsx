import { Outlet } from "react-router";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";

import { Sidebar } from "./sidebar";

export function RootLayout() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 pt-16 transition-all duration-300 md:pt-0",
          sidebarCollapsed ? "md:ml-14" : "md:ml-[280px]"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
