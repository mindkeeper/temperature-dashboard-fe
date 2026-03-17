import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Thermometer } from "lucide-react";
import { describe, it, expect, vi } from "vitest";

import { KpiCard } from "../kpi-card";

describe("KpiCard", () => {
  it("renders title, primary metric, and secondary detail", () => {
    render(
      <KpiCard
        title="Test Metric"
        icon={Thermometer}
        primaryMetric="123"
        secondaryDetail="Test detail"
      />
    );

    expect(screen.getByText("Test Metric")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
    expect(screen.getByText("Test detail")).toBeInTheDocument();
  });

  it("renders with status color variants", () => {
    const { container } = render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
        variant="success"
      />
    );

    expect(container.querySelector('[data-variant="success"]')).toBeInTheDocument();
  });

  it("renders as non-interactive by default", () => {
    const { container } = render(
      <KpiCard title="Test" icon={Thermometer} primaryMetric="100" secondaryDetail="detail" />
    );

    expect(container.querySelector("button")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
        onClick={onClick}
      />
    );

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows active state when isActive is true", () => {
    const onClick = vi.fn();
    const { container } = render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
        onClick={onClick}
        isActive={true}
        activeLabel="Viewing filtered"
      />
    );

    expect(screen.getByText("Viewing filtered")).toBeInTheDocument();
    expect(container.querySelector(".ring-2")).toBeInTheDocument();
  });

  it("supports keyboard interaction with Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <KpiCard
        title="Test"
        icon={Thermometer}
        primaryMetric="100"
        secondaryDetail="detail"
        onClick={onClick}
      />
    );

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
