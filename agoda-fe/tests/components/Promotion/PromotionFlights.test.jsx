import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PromotionFlights from "src-under-test/components/Promotion/PromotionFlights";

const mockNavigate = jest.fn();
const mockGetAirports = jest.fn();
const mockGetAirlines = jest.fn();
const mockGetPromotionDetail = jest.fn();
const mockMessageError = jest.fn();
const mockMessageWarning = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ promotionId: "22" }),
}), { virtual: true });

jest.mock("config/api", () => ({
  getAirports: (...args) => mockGetAirports(...args),
  getAirlines: (...args) => mockGetAirlines(...args),
  getPromotionDetail: (...args) => mockGetPromotionDetail(...args),
}));

jest.mock("lucide-react", () => ({
  Plane: () => <span>plane-icon</span>,
  Calendar: () => <span>calendar-icon</span>,
  Users: () => <span>user-icon</span>,
}));

jest.mock("utils/formatDate", () => ({
  formatDate: (value) => value,
}));

jest.mock("antd", () => {
  const React = require("react");
  const Select = ({ placeholder, value, onChange, children }) => (
    <select
      aria-label={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">none</option>
      {children}
    </select>
  );
  Select.Option = ({ value, children }) => <option value={value}>{children}</option>;
  const DatePicker = ({ placeholder, onChange }) => (
    <input
      aria-label={placeholder}
      onChange={(e) =>
        onChange({
          format: () => e.target.value,
        })
      }
    />
  );
  const RadioComp = ({ value, children, onChange }) => (
    <label>
      <input type="radio" value={value} onChange={onChange} />
      {children}
    </label>
  );
  return {
    Spin: () => <div>loading</div>,
    Alert: ({ description }) => <div>{description}</div>,
    Select,
    Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
    DatePicker,
    Radio: Object.assign(RadioComp, {
      Group: ({ value, onChange, children }) => (
        <div data-value={value}>
          {React.Children.map(children, (child) =>
            React.cloneElement(child, { onChange })
          )}
        </div>
      ),
    }),
    InputNumber: ({ value, onChange }) => (
      <input
        aria-label="passengers"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    ),
    message: {
      error: (...args) => mockMessageError(...args),
      warning: (...args) => mockMessageWarning(...args),
    },
  };
}, { virtual: true });

describe("PromotionFlights", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAirports.mockResolvedValue({
      data: [
        { id: "1", name: "Da Nang", code: "DAD" },
        { id: "2", name: "Ha Noi", code: "HAN" },
      ],
    });
    mockGetAirlines.mockResolvedValue({ data: [{ id: 1, name: "VN" }] });
    mockGetPromotionDetail.mockResolvedValue({
      data: {
        title: "Sale Flight",
        description: "desc",
        start_date: "2026-04-01",
        end_date: "2026-04-30",
        discount_percent: 30,
        flight_promotions: [],
      },
    });
  });

  // TC ID: PROMO-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "shows validation error when missing required search fields" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("shows validation error when missing required search fields", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<PromotionFlights />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(await screen.findByText("TÌM CHUYẾN BAY"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockMessageError).toHaveBeenCalled();
    });
  });

  // TC ID: TC_PROMOTION_04

  // MỤC TIÊU: Kiểm tra kịch bản "navigates to flight search when search form is valid".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("navigates to flight search when search form is valid", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<PromotionFlights />);

    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(await screen.findByLabelText("Chọn sân bay đi"), {
      target: { value: "1" },
    });
    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(screen.getByLabelText("Chọn sân bay đến"), {
      target: { value: "2" },
    });
    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(screen.getByLabelText("Chọn ngày đi"), {
      target: { value: "2026-05-10" },
    });
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("TÌM CHUYẾN BAY"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockNavigate).toHaveBeenCalledWith(
        "/flight?origin=1&destination=2&departureDate=2026-05-10&returnDate=&passengers=1&seatClass=economy&tripType=one-way&promotionId=22"
      );
    });
  });
});
