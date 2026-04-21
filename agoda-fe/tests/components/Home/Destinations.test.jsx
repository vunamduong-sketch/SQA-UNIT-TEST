import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import VietnamDestination from "src-under-test/components/Home/VietnamDestination";
import ForeignCountryDestination from "src-under-test/components/Home/ForeignCountryDestination";

const mockGetTopVietNamHotel = jest.fn();
const mockGetTopAbroadHotel = jest.fn();

jest.mock("config/api", () => ({
  getTopVietNamHotel: (...args) => mockGetTopVietNamHotel(...args),
  getTopAbroadHotel: (...args) => mockGetTopAbroadHotel(...args),
}));

jest.mock("swiper/react", () => ({
  Swiper: ({ children }) => <div>{children}</div>,
  SwiperSlide: ({ children }) => <div>{children}</div>,
}), { virtual: true });

jest.mock("swiper/modules", () => ({
  Navigation: {},
}), { virtual: true });

jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock("antd", () => ({
  Empty: ({ description }) => <div>{description}</div>,
}));

jest.mock("react-loading-skeleton", () => () => <div>loading</div>);

describe("Home destination sections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and renders top Vietnam destinations", async () => {
    // TC_HOME_01
    mockGetTopVietNamHotel.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 1, name: "Da Nang", hotelCount: 12, image: "/img.jpg" }],
    });

    render(<VietnamDestination />);

    await waitFor(() => {
      expect(mockGetTopVietNamHotel).toHaveBeenCalledWith({ limit: 30 });
    });
    expect(await screen.findByText("Da Nang")).toBeInTheDocument();
    expect(screen.getByText("12 chỗ ở")).toBeInTheDocument();
  });

  it("shows empty state when abroad destinations are empty", async () => {
    // TC_HOME_02
    mockGetTopAbroadHotel.mockResolvedValue({
      isSuccess: true,
      data: [],
    });

    render(<ForeignCountryDestination />);

    await waitFor(() => {
      expect(mockGetTopAbroadHotel).toHaveBeenCalledWith({ limit: 20 });
    });
    expect(await screen.findByText("Chưa có địa điểm nào")).toBeInTheDocument();
  });
});
