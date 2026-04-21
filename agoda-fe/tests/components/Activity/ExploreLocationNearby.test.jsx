import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ExploreLocationNearby from "src-under-test/components/Activity/ExploreLocationNearby";
import { getTopVietNamHotel } from "config/api";

jest.mock("config/api", () => ({
  getTopVietNamHotel: jest.fn(),
}));

jest.mock(
  "swiper/react",
  () => ({
    Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
    SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
  }),
  { virtual: true }
);

jest.mock(
  "swiper/modules",
  () => ({
    Navigation: {},
  }),
  { virtual: true }
);

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }),
  { virtual: true }
);

describe("ExploreLocationNearby", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls the top city API on mount and renders returned cities", async () => {
    // TC_ACTIVITY_01
    getTopVietNamHotel.mockResolvedValue({
      isSuccess: true,
      data: [
        { id: 1, name: "Đà Nẵng", image: "/danang.jpg" },
        { id: 2, name: "Hà Nội", image: "/hanoi.jpg" },
      ],
    });

    render(<ExploreLocationNearby />);

    await waitFor(() =>
      expect(getTopVietNamHotel).toHaveBeenCalledWith({ limit: 50 })
    );

    expect(await screen.findByText("Đà Nẵng")).toBeInTheDocument();
    expect(await screen.findByText("Hà Nội")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Đà Nẵng/i })).toHaveAttribute(
      "href",
      "/activity/city/1"
    );
  });

  it("renders no city item when the API returns an unsuccessful response", async () => {
    // TC_ACTIVITY_02
    getTopVietNamHotel.mockResolvedValue({
      isSuccess: false,
      data: [{ id: 1, name: "Đà Nẵng", image: "/danang.jpg" }],
    });

    render(<ExploreLocationNearby />);

    await waitFor(() =>
      expect(getTopVietNamHotel).toHaveBeenCalledWith({ limit: 50 })
    );

    expect(screen.queryByText("Đà Nẵng")).not.toBeInTheDocument();
  });
});
