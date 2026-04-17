import {
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/modules/auth";
import type { AuthUser } from "@/modules/auth";
import { useUIStore } from "@/store/ui-store";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    roles: ["CONCESSIONAIRE", "HEADOFFICE"] as AuthUser["role"][],
  },
  {
    label: "Device Config",
    icon: Radio,
    path: "/device-config",
    roles: ["SUPERADMIN"] as AuthUser["role"][],
  },
  {
    label: "User Management",
    icon: Users,
    path: "/users",
    roles: ["SUPERADMIN"] as AuthUser["role"][],
  },
  {
    label: "Concessionaires",
    icon: Building2,
    path: "/concessionaires",
    roles: ["SUPERADMIN"] as AuthUser["role"][],
  },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    void logout();
    onNavigate?.();
  };

  const visibleMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b p-6">
        <Link to="/" onClick={onNavigate}>
          <img src="/brand-logo.svg" alt="Brand Logo" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      {isAuthenticated && user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3 px-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">
                {getInitials(user.name ?? "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{user.name ?? "User"}</p>
              <p className="text-muted-foreground truncate text-xs">{user.email}</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive h-9 w-9"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <>
      {/* Mobile: Hamburger Menu */}
      <div className="bg-background fixed top-0 left-0 z-50 flex items-center gap-3 border-b p-4 md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent
              onNavigate={() => {
                setIsOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
        <img src="/brand-logo.svg" alt="Brand Logo" className="h-6 w-auto" />
      </div>

      {/* Desktop: Collapsible Sidebar */}
      <aside
        className={cn(
          "bg-background fixed top-0 left-0 z-40 hidden h-screen border-r transition-transform duration-300 md:block",
          sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        )}
        style={{ width: "280px" }}
      >
        <SidebarContent />
      </aside>

      {/* Desktop: Toggle Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className={cn(
                "fixed top-4 z-50 hidden h-8 w-8 rounded-full shadow-md transition-all duration-300 md:flex",
                sidebarCollapsed ? "left-4" : "left-66"
              )}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{sidebarCollapsed ? "Open sidebar" : "Close sidebar"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
