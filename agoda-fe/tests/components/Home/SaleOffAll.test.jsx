import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import SaleOffAll from "src-under-test/components/Home/SaleOffAll";

const mockGetPromotionsAdmin = jest.fn();
const mockGetImage = jest.fn((value) => `https://cdn.test/${value}`);

jest.mock("config/api", () => ({
  getPromotionsAdmin: (...args) => mockGetPromotionsAdmin(...args),
}));

jest.mock("utils/imageUrl", () => ({
  getImage: (...args) => mockGetImage(...args),
}));

jest.mock("constants/promotion", () => ({
  PROMOTION_TYPE: {
    HOTEL: "hotel",
    FLIGHT: "flight",
    ACTIVITY: "activity",
  },
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

describe("SaleOffAll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests hotel, flight and activity promotions and renders promotion links", async () => {
    // TC_HOME_03
    mockGetPromotionsAdmin
      .mockResolvedValueOnce({ data: [{ id: 1, image: "hotel.jpg", title: "Hotel promo" }] })
      .mockResolvedValueOnce({ data: [{ id: 2, image: "flight.jpg", title: "Flight promo" }] })
      .mockResolvedValueOnce({ data: [{ id: 3, image: "activity.jpg", title: "Activity promo" }] });

    render(<SaleOffAll />);

    await waitFor(() => {
      expect(mockGetPromotionsAdmin).toHaveBeenCalledTimes(3);
    });
    const hotelPromo = await screen.findByAltText("Hotel promo");
    const flightPromo = await screen.findByAltText("Flight promo");
    const activityPromo = await screen.findByAltText("Activity promo");

    expect(hotelPromo.closest("a")).toHaveAttribute("href", "/promotions/1?type=accommodation");
    expect(flightPromo.closest("a")).toHaveAttribute("href", "/promotions/2?type=flight");
    expect(activityPromo.closest("a")).toHaveAttribute("href", "/promotions/3?type=activity");
  });
});
