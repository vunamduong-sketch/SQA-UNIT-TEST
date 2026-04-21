import React from "react";
import { render, screen } from "@testing-library/react";
import Activity from "src-under-test/components/Activity";

jest.mock("src-under-test/components/Activity/BackgroundActivity", () => ({
  __esModule: true,
  default: () => <div>BackgroundActivity Component</div>,
}));

jest.mock("src-under-test/components/Activity/TopActivity", () => ({
  __esModule: true,
  default: () => <div>TopActivity Component</div>,
}));

jest.mock("src-under-test/components/Activity/ExploreLocationNearby", () => ({
  __esModule: true,
  default: () => <div>ExploreLocationNearby Component</div>,
}));

jest.mock("src-under-test/components/Activity/WhyChooseAgoda", () => ({
  __esModule: true,
  default: () => <div>WhyChooseAgoda Component</div>,
}));

describe("Activity index", () => {
  it("renders all Activity section components in order", () => {
    // TC_ACTIVITY_04
    render(<Activity />);

    expect(screen.getByText("BackgroundActivity Component")).toBeInTheDocument();
    expect(screen.getByText("TopActivity Component")).toBeInTheDocument();
    expect(
      screen.getByText("ExploreLocationNearby Component")
    ).toBeInTheDocument();
    expect(screen.getByText("WhyChooseAgoda Component")).toBeInTheDocument();
  });
});
