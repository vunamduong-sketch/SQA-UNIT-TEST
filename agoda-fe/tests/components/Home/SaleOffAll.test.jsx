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

  // TC ID: HOME-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "requests hotel, flight and activity promotions and renders promotion links" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("requests hotel, flight and activity promotions and renders promotion links", async () => {
    mockGetPromotionsAdmin
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ data: [{ id: 1, image: "hotel.jpg", title: "Hotel promo" }] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ data: [{ id: 2, image: "flight.jpg", title: "Flight promo" }] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ data: [{ id: 3, image: "activity.jpg", title: "Activity promo" }] });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<SaleOffAll />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockGetPromotionsAdmin).toHaveBeenCalledTimes(3);
    });
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const hotelPromo = await screen.findByAltText("Hotel promo");
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const flightPromo = await screen.findByAltText("Flight promo");
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const activityPromo = await screen.findByAltText("Activity promo");

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(hotelPromo.closest("a")).toHaveAttribute("href", "/promotions/1?type=accommodation");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(flightPromo.closest("a")).toHaveAttribute("href", "/promotions/2?type=flight");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(activityPromo.closest("a")).toHaveAttribute("href", "/promotions/3?type=activity");
  });
});
