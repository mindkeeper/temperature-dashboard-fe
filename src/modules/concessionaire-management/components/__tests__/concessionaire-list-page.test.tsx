import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "tests/test-utils";
import { describe, expect, it } from "vitest";

import { ConcessionaireListPage } from "../concessionaire-list-page";

describe("ConcessionaireListPage", () => {
  it("renders page title", () => {
    render(<ConcessionaireListPage />);

    expect(screen.getByRole("heading", { name: "Concessionaires" })).toBeInTheDocument();
  });

  it("shows search input", () => {
    render(<ConcessionaireListPage />);

    expect(screen.getByPlaceholderText(/search concessionaires/i)).toBeInTheDocument();
  });

  it("opens create modal when Add Concessionaire clicked", async () => {
    const user = userEvent.setup();
    render(<ConcessionaireListPage />);

    await user.click(screen.getByRole("button", { name: /add concessionaire/i }));

    expect(screen.getByRole("heading", { name: "Create Concessionaire" })).toBeInTheDocument();
  });
});
