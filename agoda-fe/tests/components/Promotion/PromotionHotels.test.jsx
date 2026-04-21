import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PromotionHotels from "src-under-test/components/Promotion/PromotionHotels";

const mockNavigate = jest.fn();
const mockGetCountries = jest.fn();
const mockGetCities = jest.fn();
const mockGetPromotionDetail = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ promotionId: "11" }),
}), { virtual: true });

jest.mock("config/api", () => ({
  getCountries: (...args) => mockGetCountries(...args),
  getCities: (...args) => mockGetCities(...args),
  getPromotionDetail: (...args) => mockGetPromotionDetail(...args),
}));

jest.mock("lucide-react", () => ({
  Hotel: () => <span>hotel-icon</span>,
  ArrowLeft: () => <span>back-icon</span>,
  Home: () => <span>home-icon</span>,
}));

jest.mock("antd", () => {
  const React = require("react");
  const Select = ({ placeholder, value, onChange, disabled, children }) => (
    <select
      aria-label={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled}
    >
      <option value="">none</option>
      {children}
    </select>
  );
  Select.Option = ({ value, children }) => <option value={value}>{children}</option>;
  return {
    Spin: () => <div>loading</div>,
    Alert: ({ description }) => <div>{description}</div>,
    Select,
    InputNumber: ({ placeholder, value, onChange }) => (
      <input
        aria-label={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      />
    ),
    Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  };
});

jest.mock("src-under-test/components/Promotion/PromotionBanner", () => (props) => (
  <div>banner-{props.title}</div>
));
jest.mock("src-under-test/components/Promotion/HotelCard", () => ({ item }) => (
  <div>{item.name}</div>
));
jest.mock("src-under-test/components/Promotion/PromotionEmptyState", () => ({ message, onReset }) => (
  <div>
    <span>{message}</span>
    <button onClick={onReset}>Bỏ lọc</button>
  </div>
));

describe("PromotionHotels", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads countries and renders hotel promotion list", async () => {
    // TC_PROMOTION_01
    mockGetCountries.mockResolvedValue({ data: [{ id: 1, name: "Viet Nam" }] });
    mockGetCities.mockResolvedValue({ data: [] });
    mockGetPromotionDetail.mockResolvedValue({
      data: {
        title: "Sale Hotel",
        description: "desc",
        discount_percent: 20,
        start_date: "2026-04-01",
        end_date: "2026-04-30",
        hotels: [{ id: 1, name: "Hotel A" }],
        hotel_promotions: [{ id: 1 }],
      },
    });

    render(<PromotionHotels />);

    await waitFor(() => {
      expect(mockGetCountries).toHaveBeenCalled();
      expect(mockGetPromotionDetail).toHaveBeenCalledWith("11", { promotion_type: 1 });
    });

    expect(await screen.findByText("banner-Sale Hotel")).toBeInTheDocument();
    expect(await screen.findByText("Hotel A")).toBeInTheDocument();
  });

  it("loads cities when selecting a country and shows empty state", async () => {
    // TC_PROMOTION_02
    mockGetCountries.mockResolvedValue({ data: [{ id: 1, name: "Viet Nam" }] });
    mockGetCities.mockResolvedValue({ data: [{ id: 10, name: "Da Nang" }] });
    mockGetPromotionDetail.mockResolvedValue({
      data: {
        title: "Sale Hotel",
        description: "desc",
        discount_percent: 20,
        start_date: "2026-04-01",
        end_date: "2026-04-30",
        hotels: [],
        hotel_promotions: [],
      },
    });

    render(<PromotionHotels />);

    fireEvent.change(await screen.findByLabelText("Chọn quốc gia"), {
      target: { value: "1" },
    });

    await waitFor(() => {
      expect(mockGetCities).toHaveBeenCalledWith({ country_id: 1 });
    });

    expect(
      await screen.findByText("Không có khách sạn phù hợp với bộ lọc của bạn.")
    ).toBeInTheDocument();
  });
});
