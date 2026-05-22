import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Loading from "@/app/loading";
import Error from "@/app/error";

describe("frontend loading and error states", () => {
  it("renders loading skeletons", () => {
    render(<Loading />);
    expect(document.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders retry action on errors", () => {
    render(<Error error={new Error("boom")} reset={vi.fn()} />);
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });
});
