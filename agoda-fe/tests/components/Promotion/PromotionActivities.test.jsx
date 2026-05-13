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

  // TC ID: PROMO-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads city filters and renders activity promotion list" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads city filters and renders activity promotion list", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockGetCities.mockResolvedValue({ data: [{ id: 1, name: "Da Nang" }] });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
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

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<PromotionActivities />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockGetCities).toHaveBeenCalled();
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockGetPromotionDetail).toHaveBeenCalledWith("33", { promotion_type: 3 });
    });

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Ba Na Hills")).toBeInTheDocument();
  });

  // TC ID: PROMO-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "updates filters and navigates to activity detail" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates filters and navigates to activity detail", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockGetCities.mockResolvedValue({ data: [{ id: 1, name: "Da Nang" }] });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
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

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<PromotionActivities />);

    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(await screen.findByLabelText("Chọn thành phố"), {
      target: { value: "1" },
    });
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(await screen.findByText("choose-range"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(await screen.findByText("Xem chi tiết"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockGetPromotionDetail).toHaveBeenLastCalledWith("33", {
        promotion_type: 3,
        city_id: 1,
        start_date: "2026-06-01",
        end_date: "2026-06-03",
      });
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockNavigate).toHaveBeenCalledWith("/activity/detail/9");
    });
  });
});
