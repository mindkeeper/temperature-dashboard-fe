import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "tests/test-utils";
import { describe, expect, it, vi } from "vitest";

import type { User } from "../../types/user-management.types";
import { UserTable } from "../user-table";

const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@test.com",
    name: "Admin User",
    role: "SUPERADMIN",
    isNewAccount: false,
    concessionaries: [],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    email: "user@test.com",
    name: "Test User",
    role: "CONCESSIONAIRE",
    isNewAccount: false,
    concessionaries: [{ concessionaireId: "c1", concessionaire: { id: "c1", name: "Conc A" } }],
    createdAt: "2026-02-01T00:00:00.000Z",
  },
];

describe("UserTable", () => {
  it("renders user rows with correct data", () => {
    render(<UserTable users={mockUsers} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("user@test.com")).toBeInTheDocument();
    expect(screen.getByText("Conc A")).toBeInTheDocument();
  });

  it("renders empty state when no users", () => {
    render(<UserTable users={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText(/no users found/i)).toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<UserTable users={mockUsers} onEdit={onEdit} onDelete={vi.fn()} />);

    const editButtons = screen.getAllByRole("button");
    // Edit buttons come before delete buttons
    const editButton = editButtons[0];
    if (!editButton) throw new Error("Edit button not found");
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("calls onDelete when delete button clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<UserTable users={mockUsers} onEdit={vi.fn()} onDelete={onDelete} />);

    const buttons = screen.getAllByRole("button");
    // Delete buttons are after edit buttons (every other button)
    const deleteButton = buttons[1];
    if (!deleteButton) throw new Error("Delete button not found");
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockUsers[0]);
  });

  it("displays role badges correctly", () => {
    render(<UserTable users={mockUsers} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("SUPERADMIN")).toBeInTheDocument();
    expect(screen.getByText("CONCESSIONAIRE")).toBeInTheDocument();
  });
});
