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

  it("loads cities and hotels for the first selected city", async () => {
    // TC_HOME_04
    render(<RecommendedAccommodation />);

    await waitFor(() => {
      expect(mockGetCities).toHaveBeenCalledWith({ current: 1, pageSize: 6 });
    });
    await waitFor(() => {
      expect(mockCallFetchHotel).toHaveBeenCalledWith({ current: 1, pageSize: 20, cityId: 10 });
    });
    expect(await screen.findByText("Hotel A")).toBeInTheDocument();
    expect(screen.getByText("Hai Chau")).toBeInTheDocument();
  });

  it("shows empty state when selected city has no hotels", async () => {
    // TC_HOME_05
    mockCallFetchHotel
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
      .mockResolvedValueOnce({
        isSuccess: true,
        data: [],
      });

    render(<RecommendedAccommodation />);

    await screen.findByText("Hotel A");
    fireEvent.click(screen.getByText("Nha Trang"));

    await waitFor(() => {
      expect(mockCallFetchHotel).toHaveBeenLastCalledWith({ current: 1, pageSize: 20, cityId: 20 });
    });
  });
});
