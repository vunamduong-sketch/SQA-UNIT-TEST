import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FlightList from "src-under-test/components/Flight/FlightList";

const mockGetFlights = jest.fn();
const mockGetImageUrl = jest.fn((value) => `https://cdn.test/${value}`);
const mockUseSearchParams = jest.fn();

jest.mock("config/api", () => ({
  getFlights: (...args) => mockGetFlights(...args),
  getImageUrl: (...args) => mockGetImageUrl(...args),
}));

jest.mock("react-router-dom", () => ({
  useSearchParams: () => mockUseSearchParams(),
}), { virtual: true });

jest.mock("antd", () => ({
  Spin: () => <div>Loading flights</div>,
}));

jest.mock("react-icons/fa", () => ({
  FaChevronDown: () => <span>down</span>,
  FaChevronUp: () => <span>up</span>,
}));

const searchParams = new URLSearchParams("origin=1&destination=2&departureDate=2026-05-01&seatClass=economy");

const flight = {
  id: 10,
  departure_time: "2026-05-01T08:00:00.000Z",
  arrival_time: "2026-05-01T10:30:00.000Z",
  stops: 1,
  total_duration: 150,
  base_price: 1200000,
  has_promotion: true,
  promotion: { discount_percent: 10 },
  airline: { name: "Vietnam Airlines", logo: "logo.png" },
  departure_airport: { code: "SGN", name: "Tan Son Nhat" },
  arrival_airport: { code: "HAN", name: "Noi Bai" },
  aircraft: { model: "Airbus A321" },
  legs: [
    {
      id: 101,
      departure_time: "2026-05-01T08:00:00.000Z",
      arrival_time: "2026-05-01T09:00:00.000Z",
      departure_airport: { code: "SGN", name: "Tan Son Nhat" },
      arrival_airport: { code: "DAD", name: "Da Nang" },
      duration_minutes: 60,
      flight_code: "VN123",
    },
    {
      id: 102,
      departure_time: "2026-05-01T09:45:00.000Z",
      arrival_time: "2026-05-01T10:30:00.000Z",
      departure_airport: { code: "DAD", name: "Da Nang" },
      arrival_airport: { code: "HAN", name: "Noi Bai" },
      duration_minutes: 45,
      flight_code: "VN456",
    },
  ],
  seat_classes: [
    { id: 1, seat_class: "economy", price: 1200000, available_seats: 5 },
    { id: 2, seat_class: "business", price: 2200000, available_seats: 2 },
  ],
};

describe("FlightList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue([searchParams]);
  });

  it("shows empty criteria message when search params are missing", () => {
    // TC_FLIGHT_06
    mockUseSearchParams.mockReturnValue([new URLSearchParams()]);

    render(<FlightList />);

    expect(screen.getByText("Vui lòng chọn điểm đi, điểm đến và ngày khởi hành để tìm chuyến bay")).toBeInTheDocument();
  });

  it("renders empty state when no flights are returned", async () => {
    // TC_FLIGHT_07
    mockGetFlights.mockResolvedValue({ data: [] });

    render(<FlightList origin="1" destination="2" departureDate="2026-05-01" />);

    expect(await screen.findByText("Không tìm thấy chuyến bay phù hợp")).toBeInTheDocument();
  });

  it("renders flight details and selects a seat class before choosing a flight", async () => {
    // TC_FLIGHT_08
    const onSelectFlight = jest.fn();
    mockGetFlights.mockResolvedValue({ data: [flight] });

    render(
      <FlightList
        origin="1"
        destination="2"
        departureDate="2026-05-01"
        onSelectFlight={onSelectFlight}
      />
    );

    expect(await screen.findByText("Vietnam Airlines")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Vietnam Airlines"));
    fireEvent.click(screen.getByText("Thương gia"));
    fireEvent.click(screen.getByText("Chọn"));

    await waitFor(() => {
      expect(onSelectFlight).toHaveBeenCalledWith(
        flight,
        expect.objectContaining({ seat_class: "business" })
      );
    });
  });
});
