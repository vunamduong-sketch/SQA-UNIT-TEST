import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Flight from "src-under-test/components/Profile/Flight";
import Hotel from "src-under-test/components/Profile/Hotel";
import Activity from "src-under-test/components/Profile/Activity";
import Car from "src-under-test/components/Profile/Car";

jest.mock("constants/profile", () => ({
  ServiceTab: {
    INCOMING: "incoming",
    SUCCESSFUL: "successful",
    CANCELLED: "cancelled",
  },
}));

jest.mock("antd", () => ({
  Tabs: ({ items, onChange, activeKey }) => (
    <div>
      {items.map((item) => (
        <button key={item.key} onClick={() => onChange(item.key)}>
          {item.key}
        </button>
      ))}
      <div>{items.find((item) => item.key === activeKey)?.children}</div>
    </div>
  ),
}));

describe("Profile service tabs", () => {
  it("switches Flight tabs", () => {
    // TC_PROFILE_03
    render(<Flight />);
    fireEvent.click(screen.getByText("successful"));
    expect(screen.getByText("flight-successful")).toBeInTheDocument();
  });

  it("switches Hotel tabs", () => {
    // TC_PROFILE_04
    render(<Hotel />);
    fireEvent.click(screen.getByText("cancelled"));
    expect(screen.getByText("hotel-cancelled")).toBeInTheDocument();
  });

  it("switches Activity tabs", () => {
    // TC_PROFILE_05
    render(<Activity />);
    fireEvent.click(screen.getByText("successful"));
    expect(screen.getByText("activity-successful")).toBeInTheDocument();
  });

  it("switches Car tabs", () => {
    // TC_PROFILE_06
    render(<Car />);
    fireEvent.click(screen.getByText("cancelled"));
    expect(screen.getByText("car-cancelled")).toBeInTheDocument();
  });
});
