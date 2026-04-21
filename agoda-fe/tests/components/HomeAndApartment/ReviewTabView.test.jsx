import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ReviewTabView from "src-under-test/components/HomeAndApartment/ReviewTabView";

describe("HomeAndApartment ReviewTabView", () => {
  it("renders Agoda review summary by default", () => {
    // TC_HOMEAPT_05
    render(<ReviewTabView />);

    expect(screen.getByText("Điểm số qua Agoda")).toBeInTheDocument();
    expect(screen.getByText("7,0/10")).toBeInTheDocument();
    expect(screen.getByText("Review comments mock")).toBeInTheDocument();
  });

  it("changes the active pagination button", () => {
    // TC_HOMEAPT_06
    render(<ReviewTabView />);

    const pageThree = screen.getByText("3");
    fireEvent.click(pageThree);

    expect(pageThree.className).toContain("bg-blue-600");
  });
});
