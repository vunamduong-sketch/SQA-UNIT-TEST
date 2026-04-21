import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HotelCard from "src-under-test/components/Search/HotelCard";
import { getImageUrl } from "config/api";

const mockNavigate = jest.fn();

jest.mock("config/api", () => ({
  getImageUrl: jest.fn(),
}));

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

jest.mock("@ant-design/icons", () => ({
  HeartOutlined: () => null,
  WifiOutlined: () => null,
  CarOutlined: () => null,
  EnvironmentOutlined: () => null,
  HomeOutlined: () => null,
  SoundOutlined: () => null,
  RestOutlined: () => null,
  FireOutlined: () => null,
}));

jest.mock("antd", () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  Card: ({ children }) => <div>{children}</div>,
  Rate: ({ defaultValue }) => <div>{defaultValue} stars</div>,
  Button: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Tag: ({ children }) => <span>{children}</span>,
  Badge: ({ children }) => <div>{children}</div>,
  Image: ({ src, alt }) => <img src={src} alt={alt} />,
}));

describe("HotelCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getImageUrl.mockReturnValue("https://cdn.example/hotel.jpg");
  });

  it("renders hotel information and summarizes extra amenities", () => {
    // TC_SEARCH_07
    render(
      <HotelCard
        hotel={{
          id: 12,
          name: "Khách sạn Đà Lạt View",
          avg_star: 4,
          review_count: 128,
          location: "Đà Lạt",
          min_price: "2500000",
          images: [{ image: "/hotel.jpg" }],
          amenitiesAndFacilities: "WiFi, Parking, Spa, Gym, Bar, Pool",
          mostFeature: "Feature",
          facilities: "Facilities",
          regulation: "Regulation",
          withUs: "With us",
        }}
      />
    );

    expect(screen.getByText("Khách sạn Đà Lạt View")).toBeInTheDocument();
    expect(screen.getByText("2.500.000 VND")).toBeInTheDocument();
    expect(screen.getByText("+2 tiện nghi")).toBeInTheDocument();
    expect(getImageUrl).toHaveBeenCalledWith("/hotel.jpg");
  });

  it("navigates to the hotel detail page with search parameters", () => {
    // TC_SEARCH_08
    render(
      <HotelCard
        hotel={{
          id: 77,
          name: "Khách sạn Đà Nẵng",
          avg_star: 5,
          review_count: 99,
          location: "Đà Nẵng",
          min_price: "1800000",
          images: [{ image: "/hotel.jpg" }],
          amenitiesAndFacilities: "WiFi, Parking",
        }}
        startDate="2026-05-01"
        endDate="2026-05-03"
        adult={2}
        child={1}
        room={1}
        stay_type="overnight"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Xem phòng" }));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/hotel/khach-san-da-nang-77?startDate=2026-05-01&endDate=2026-05-03&adult=2&child=1&room=1&stay_type=overnight"
    );
  });
});
