import { Link } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/modules/auth";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/brand-logo.svg" alt="ADW" className="h-8 w-auto" />
        </Link>

        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name ?? "test")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name ?? "test"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name ?? "test"}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  void logout();
                }}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
