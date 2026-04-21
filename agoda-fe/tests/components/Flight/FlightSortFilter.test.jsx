import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FlightSortFilter from "src-under-test/components/Flight/FlightSortFilter";

describe("FlightSortFilter", () => {
  it("changes sort mode when clicking a tab", () => {
    // TC_FLIGHT_09
    const onSortChange = jest.fn();
    render(<FlightSortFilter onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText("Nhanh nhất"));
    expect(onSortChange).toHaveBeenCalledWith("fastest");
  });

  it("selects a dropdown-only sort option by keyboard navigation", async () => {
    // TC_FLIGHT_10
    const onSortChange = jest.fn();
    render(<FlightSortFilter onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText("Sắp xếp theo"));
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "Enter" });

    await waitFor(() => {
      expect(onSortChange).toHaveBeenCalledWith("departure");
    });
  });
});
