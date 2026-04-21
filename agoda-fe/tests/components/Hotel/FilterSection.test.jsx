import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FilterSection from "src-under-test/components/Hotel/FilterSection";

const mockCallFetchRoomQuery = jest.fn();
const mockCallFetchAmenities = jest.fn();

jest.mock("config/api", () => ({
  callFetchRoomQuery: (...args) => mockCallFetchRoomQuery(...args),
  callFetchAmenities: (...args) => mockCallFetchAmenities(...args),
}));

jest.mock("@mui/icons-material", () => ({
  Tune: () => <span>tune</span>,
}));

describe("Hotel FilterSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads merged amenities from all rooms and supports show more", async () => {
    // TC_HOTEL_03
    mockCallFetchRoomQuery.mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
    });
    mockCallFetchAmenities
      .mockResolvedValueOnce({ data: [{ id: 1, name: "Wifi" }, { id: 2, name: "TV" }, { id: 3, name: "Mini Bar" }, { id: 4, name: "Kitchen" }] })
      .mockResolvedValueOnce({ data: [{ id: 5, name: "Pool" }, { id: 6, name: "Balcony" }, { id: 7, name: "Gym" }] });

    render(<FilterSection hotelId={99} />);

    expect(await screen.findByText("Wifi")).toBeInTheDocument();
    expect(screen.getByText("Xem thêm 1 mục")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Xem thêm 1 mục"));
    expect(screen.getByText("Gym")).toBeInTheDocument();
  });

  it("toggles amenities and clears all filters", async () => {
    // TC_HOTEL_04
    const onFilterChange = jest.fn();
    mockCallFetchRoomQuery.mockResolvedValue({
      data: [{ id: 1 }],
    });
    mockCallFetchAmenities.mockResolvedValue({
      data: [{ id: 1, name: "Wifi" }, { id: 2, name: "TV" }],
    });

    render(<FilterSection hotelId={55} onFilterChange={onFilterChange} />);

    const wifiButton = await screen.findByText("Wifi");
    fireEvent.click(wifiButton);
    expect(onFilterChange).toHaveBeenCalledWith(["Wifi"]);

    fireEvent.click(screen.getByText("Xóa hết"));
    expect(onFilterChange).toHaveBeenLastCalledWith([]);
  });
});
