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

  it("shows validation error when missing required search fields", async () => {
    // TC_PROMOTION_03
    render(<PromotionFlights />);

    fireEvent.click(await screen.findByText("TÌM CHUYẾN BAY"));

    await waitFor(() => {
      expect(mockMessageError).toHaveBeenCalled();
    });
  });

  it("navigates to flight search when search form is valid", async () => {
    // TC_PROMOTION_04
    render(<PromotionFlights />);

    fireEvent.change(await screen.findByLabelText("Chọn sân bay đi"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Chọn sân bay đến"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Chọn ngày đi"), {
      target: { value: "2026-05-10" },
    });
    fireEvent.click(screen.getByText("TÌM CHUYẾN BAY"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/flight?origin=1&destination=2&departureDate=2026-05-10&returnDate=&passengers=1&seatClass=economy&tripType=one-way&promotionId=22"
      );
    });
  });
});
