import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FlightSortFilter from "src-under-test/components/Flight1/FlightSortFilter";

describe("Flight1 FlightSortFilter", () => {
  it("changes sort mode when clicking a tab", () => {
    // TC_FLIGHT1_08
    const onSortChange = jest.fn();
    render(<FlightSortFilter onSortChange={onSortChange} />);

    fireEvent.click(screen.getByText("Nhanh nhất"));
    expect(onSortChange).toHaveBeenCalledWith("fastest");
  });

  it("selects a dropdown sort option with keyboard navigation", async () => {
    // TC_FLIGHT1_09
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
