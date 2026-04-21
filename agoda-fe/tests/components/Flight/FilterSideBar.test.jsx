import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FilterSideBar from "src-under-test/components/Flight/FilterSideBar";

const mockGetAirlines = jest.fn();
const mockSetSearchParams = jest.fn();
const mockSearchParams = new URLSearchParams("origin=1&destination=2&departureDate=2026-05-01&passengers=2&seatClass=economy&tripType=one-way");

jest.mock("config/api", () => ({
  getAirlines: (...args) => mockGetAirlines(...args),
}));

jest.mock("react-router-dom", () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}), { virtual: true });

describe("Flight FilterSideBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAirlines.mockResolvedValue({
      data: [
        { id: 1, name: "Vietnam Airlines" },
        { id: 2, name: "VietJet Air" },
        { id: 3, name: "Bamboo Airways" },
        { id: 4, name: "Pacific Airlines" },
      ],
    });
  });

  it("loads airlines and expands the airline list", async () => {
    // TC_FLIGHT_04
    render(<FilterSideBar />);

    expect(await screen.findByText("Vietnam Airlines")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Hiện tất cả 4 hãng hàng không"));
    expect(screen.getByText("Pacific Airlines")).toBeInTheDocument();
  });

  it("updates search params and callback when selecting baggage and airline filters", async () => {
    // TC_FLIGHT_05
    const onFilterChange = jest.fn();
    render(<FilterSideBar onFilterChange={onFilterChange} />);

    await screen.findByText("Vietnam Airlines");
    fireEvent.click(screen.getByLabelText("Đã gồm hành lý ký gửi"));
    fireEvent.click(screen.getByLabelText("Vietnam Airlines"));

    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalled();
      expect(onFilterChange).toHaveBeenCalled();
    });

    const lastCall = mockSetSearchParams.mock.calls.at(-1)[0];
    expect(lastCall.get("baggageIncluded")).toBe("true");
    expect(lastCall.getAll("airlines[]")).toContain("1");
    expect(lastCall.get("origin")).toBe("1");
  });
});
