import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "tests/test-utils";
import { describe, expect, it } from "vitest";

import { UserManagementPage } from "../user-management-page";

describe("UserManagementPage", () => {
  it("renders page title and description", () => {
    render(<UserManagementPage />);

    expect(screen.getByText("User Management")).toBeInTheDocument();
    expect(screen.getByText(/manage user accounts/i)).toBeInTheDocument();
  });

  it("displays users in table after loading", async () => {
    render(<UserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("opens create user modal when Add User clicked", async () => {
    const user = userEvent.setup();
    render(<UserManagementPage />);

    await user.click(screen.getByRole("button", { name: /add user/i }));

    expect(screen.getByRole("heading", { name: "Create User" })).toBeInTheDocument();
  });

  it("shows search input and role filter", () => {
    render(<UserManagementPage />);

    expect(screen.getByPlaceholderText(/search name or email/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
