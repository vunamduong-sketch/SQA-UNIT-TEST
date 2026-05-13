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

  // TC ID: FLIGHT-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "shows empty criteria message when search params are missing" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("shows empty criteria message when search params are missing", () => {
    // Arrange: cau hinh mock tra ve gia tri can thiet cho test case nay.
    mockUseSearchParams.mockReturnValue([new URLSearchParams()]);

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FlightList />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Vui lòng chọn điểm đi, điểm đến và ngày khởi hành để tìm chuyến bay")).toBeInTheDocument();
  });

  // TC ID: TC_FLIGHT_07

  // MỤC TIÊU: Kiểm tra kịch bản "renders empty state when no flights are returned".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("renders empty state when no flights are returned", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockGetFlights.mockResolvedValue({ data: [] });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FlightList origin="1" destination="2" departureDate="2026-05-01" />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Không tìm thấy chuyến bay phù hợp")).toBeInTheDocument();
  });

  // TC ID: TC_FLIGHT_08

  // MỤC TIÊU: Kiểm tra kịch bản "renders flight details and selects a seat class before choosing a flight".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("renders flight details and selects a seat class before choosing a flight", async () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const onSelectFlight = jest.fn();
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockGetFlights.mockResolvedValue({ data: [flight] });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(
      <FlightList
        origin="1"
        destination="2"
        departureDate="2026-05-01"
        onSelectFlight={onSelectFlight}
      />
    );

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Vietnam Airlines")).toBeInTheDocument();
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Vietnam Airlines"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Thương gia"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Chọn"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(onSelectFlight).toHaveBeenCalledWith(
        flight,
        expect.objectContaining({ seat_class: "business" })
      );
    });
  });
});
