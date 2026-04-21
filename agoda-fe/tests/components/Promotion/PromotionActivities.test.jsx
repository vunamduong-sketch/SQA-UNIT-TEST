import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PromotionActivities from "src-under-test/components/Promotion/PromotionActivities";

const mockNavigate = jest.fn();
const mockGetCities = jest.fn();
const mockGetPromotionDetail = jest.fn();
const mockGetImageUrl = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ promotionId: "33" }),
}), { virtual: true });

jest.mock("config/api", () => ({
  getCities: (...args) => mockGetCities(...args),
  getPromotionDetail: (...args) => mockGetPromotionDetail(...args),
  getImageUrl: (...args) => mockGetImageUrl(...args),
}));

jest.mock("lucide-react", () => ({
  Calendar: () => <span>calendar-icon</span>,
  ArrowLeft: () => <span>back-icon</span>,
  Home: () => <span>home-icon</span>,
}));

jest.mock("antd", () => {
  const Select = ({ placeholder, value, onChange, children }) => (
    <select
      aria-label={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
    >
      <option value="">none</option>
      {children}
    </select>
  );
  Select.Option = ({ value, children }) => <option value={value}>{children}</option>;
  const RangePicker = ({ onChange }) => (
    <button
      onClick={() =>
        onChange([
          { format: () => "2026-06-01" },
          { format: () => "2026-06-03" },
        ])
      }
    >
      choose-range
    </button>
  );
  return {
    Spin: () => <div>loading</div>,
    Alert: ({ description }) => <div>{description}</div>,
    Select,
    Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    DatePicker: { RangePicker },
    Input: ({ placeholder, value, onChange }) => (
      <input
        aria-label={placeholder}
        value={value ?? ""}
        onChange={onChange}
      />
    ),
  };
});

jest.mock("src-under-test/components/Promotion/PromotionBanner", () => (props) => (
  <div>banner-{props.title}</div>
));
jest.mock("src-under-test/components/Promotion/PromotionEmptyState", () => ({ message }) => (
  <div>{message}</div>
));

describe("PromotionActivities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetImageUrl.mockReturnValue("thumb.jpg");
  });

  it("loads city filters and renders activity promotion list", async () => {
    // TC_PROMOTION_05
    mockGetCities.mockResolvedValue({ data: [{ id: 1, name: "Da Nang" }] });
    mockGetPromotionDetail.mockResolvedValue({
      data: {
        title: "Sale Activity",
        description: "desc",
        start_date: "2026-04-01",
        end_date: "2026-04-30",
        discount_percent: 15,
        activity_promotions: [{ id: 1 }],
        activitys: [
          {
            id: 9,
            name: "Ba Na Hills",
            avg_price: 1000000,
            discount: 10,
            avg_star: 4.5,
            thumbnails: "a.jpg",
          },
        ],
      },
    });

    render(<PromotionActivities />);

    await waitFor(() => {
      expect(mockGetCities).toHaveBeenCalled();
      expect(mockGetPromotionDetail).toHaveBeenCalledWith("33", { promotion_type: 3 });
    });

    expect(await screen.findByText("Ba Na Hills")).toBeInTheDocument();
  });

  it("updates filters and navigates to activity detail", async () => {
    // TC_PROMOTION_06
    mockGetCities.mockResolvedValue({ data: [{ id: 1, name: "Da Nang" }] });
    mockGetPromotionDetail.mockResolvedValue({
      data: {
        title: "Sale Activity",
        description: "desc",
        start_date: "2026-04-01",
        end_date: "2026-04-30",
        discount_percent: 15,
        activity_promotions: [{ id: 1 }],
        activitys: [
          {
            id: 9,
            name: "Ba Na Hills",
            avg_price: 1000000,
            discount: 10,
            avg_star: 4.5,
            thumbnails: "a.jpg",
          },
        ],
      },
    });

    render(<PromotionActivities />);

    fireEvent.change(await screen.findByLabelText("Chọn thành phố"), {
      target: { value: "1" },
    });
    fireEvent.click(await screen.findByText("choose-range"));
    fireEvent.click(await screen.findByText("Xem chi tiết"));

    await waitFor(() => {
      expect(mockGetPromotionDetail).toHaveBeenLastCalledWith("33", {
        promotion_type: 3,
        city_id: 1,
        start_date: "2026-06-01",
        end_date: "2026-06-03",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/activity/detail/9");
    });
  });
});
