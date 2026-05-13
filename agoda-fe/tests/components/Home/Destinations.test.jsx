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

  // TC ID: HOME-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads and renders top Vietnam destinations" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads and renders top Vietnam destinations", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockGetTopVietNamHotel.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 1, name: "Da Nang", hotelCount: 12, image: "/img.jpg" }],
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<VietnamDestination />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockGetTopVietNamHotel).toHaveBeenCalledWith({ limit: 30 });
    });
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Da Nang")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("12 chỗ ở")).toBeInTheDocument();
  });

  // TC ID: HOME-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "shows empty state when abroad destinations are empty" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("shows empty state when abroad destinations are empty", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockGetTopAbroadHotel.mockResolvedValue({
      isSuccess: true,
      data: [],
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ForeignCountryDestination />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockGetTopAbroadHotel).toHaveBeenCalledWith({ limit: 20 });
    });
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Chưa có địa điểm nào")).toBeInTheDocument();
  });
});
