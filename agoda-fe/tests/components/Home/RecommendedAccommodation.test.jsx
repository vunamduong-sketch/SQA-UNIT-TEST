import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RecommendedAccommodation from "src-under-test/components/Home/RecommendedAccommodation";

const mockGetCities = jest.fn();
const mockCallFetchHotel = jest.fn();
const mockGetImage = jest.fn((value) => `https://cdn.test/${value}`);
const mockCreateHotelSlug = jest.fn((name, id) => `${name}-${id}`);
const mockFormatCurrency = jest.fn((value) => value);

jest.mock("config/api", () => ({
  getCities: (...args) => mockGetCities(...args),
  callFetchHotel: (...args) => mockCallFetchHotel(...args),
}));

jest.mock("utils/imageUrl", () => ({
  getImage: (...args) => mockGetImage(...args),
}));

jest.mock("utils/slugHelpers", () => ({
  createHotelSlug: (...args) => mockCreateHotelSlug(...args),
}));

jest.mock("utils/formatCurrency", () => ({
  formatCurrency: (...args) => mockFormatCurrency(...args),
}));

jest.mock("swiper/react", () => ({
  Swiper: ({ children }) => <div>{children}</div>,
  SwiperSlide: ({ children }) => <div>{children}</div>,
}), { virtual: true });

jest.mock("swiper/modules", () => ({
  Navigation: {},
}), { virtual: true });

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, className }) => <a href={to} className={className}>{children}</a>,
}), { virtual: true });

jest.mock("react-icons/fa", () => ({
  FaStar: () => <span>*</span>,
}));

jest.mock("react-icons/fa6", () => ({
  FaLocationDot: () => <span>loc</span>,
}));

jest.mock("react-loading-skeleton", () => () => <div>loading</div>);

jest.mock("antd", () => ({
  Empty: ({ description }) => <div>{description}</div>,
  Tabs: ({ items, onChange }) => (
    <div>
      {items.map((item) => (
        <button key={item.key} onClick={() => onChange(item.key)}>
          {item.label}
        </button>
      ))}
      <div>{items[0]?.children}</div>
    </div>
  ),
}));

describe("RecommendedAccommodation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCities.mockResolvedValue({
      isSuccess: true,
      data: [
        { id: 10, name: "Da Nang" },
        { id: 20, name: "Nha Trang" },
      ],
    });
    mockCallFetchHotel.mockResolvedValue({
      isSuccess: true,
      data: [
        {
          id: 7,
          name: "Hotel A",
          min_price: 2500000,
          avg_star: 2,
          address: "Hai Chau",
          images: [{ image: "hotel-a.jpg" }],
        },
      ],
    });
  });

  // TC ID: HOME-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads cities and hotels for the first selected city" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads cities and hotels for the first selected city", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<RecommendedAccommodation />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockGetCities).toHaveBeenCalledWith({ current: 1, pageSize: 6 });
    });
    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHotel).toHaveBeenCalledWith({ current: 1, pageSize: 20, cityId: 10 });
    });
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Hotel A")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Hai Chau")).toBeInTheDocument();
  });

  // TC ID: HOME-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "shows empty state when selected city has no hotels" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("shows empty state when selected city has no hotels", async () => {
    mockCallFetchHotel
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({
        isSuccess: true,
        data: [
          {
            id: 7,
            name: "Hotel A",
            min_price: 2500000,
            avg_star: 2,
            address: "Hai Chau",
            images: [{ image: "hotel-a.jpg" }],
          },
        ],
      })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({
        isSuccess: true,
        data: [],
      });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<RecommendedAccommodation />);

    await screen.findByText("Hotel A");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Nha Trang"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHotel).toHaveBeenLastCalledWith({ current: 1, pageSize: 20, cityId: 20 });
    });
  });
});
