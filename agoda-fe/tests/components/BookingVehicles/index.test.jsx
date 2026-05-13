import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BookingVehicles from "src-under-test/components/BookingVehicles/index";
import { toast } from "react-toastify";

// ============================================================
// TÊN FILE TEST: index.test.jsx
// MỤC ĐÍCH:
// - Kiểm thử màn danh sách xe trong luồng BookingVehicles.
// - Giữ số lượng test vừa phải theo chuẩn mới: fetch empty state, mở extras,
//   validation search và 1 expected fail cho lỗi API chưa được handle.
// - Test tập trung vào behavior user-facing và API contract, không phụ thuộc CSS.
// ============================================================

const mockNavigate = jest.fn();
const mockCallFetchCar = jest.fn();
const mockCreate = jest.fn();
const mockCreateSearchParams = jest.fn(() => ({ toString: () => "data=encoded" }));

// Mock user đăng nhập để component có user id khi tạo booking.
jest.mock("redux/hooks", () => ({
  useAppSelector: jest.fn((selector) =>
    selector({
      account: {
        user: {
          id: 1,
          first_name: "An",
          last_name: "Nguyen",
          email: "an@example.com",
          phone_number: "0123456789",
        },
      },
    })
  ),
}));

// Mock API của BookingVehicles.
// callFetchCar là API chính để lấy danh sách xe theo khu vực/tuyến đường.
jest.mock("config/api", () => ({
  callFetchCar: (...args) => mockCallFetchCar(...args),
  callBook: jest.fn(),
  callFetchDetailUserCarInteractionByCarId: jest.fn(),
  callUpsertUserCarInteraction: jest.fn(),
  callFetchAirport: jest.fn().mockResolvedValue({ isSuccess: true, data: [] }),
  callFetchLocationMapInAllWorld: jest.fn().mockResolvedValue({ isSuccess: true, data: [] }),
  callFetchHotelQuery: jest.fn().mockResolvedValue({ isSuccess: true, data: [] }),
}));

// Mock constant bị import bằng alias trong source.
// Nếu không mock virtual, Jest có thể báo Cannot find module constants/booking.
jest.mock("constants/booking", () => ({
  SERVICE_TYPE: { CAR: 3 },
  CAR_BOOKING_STATUS: { STARTING: "STARTING" },
}), { virtual: true });
jest.mock("constants/drive", () => ({ DRIVER_STATUS: { IDLE: "idle" } }), { virtual: true });

// Component dùng Groq để suy luận tên khu vực từ điểm đón/trả.
// Mock response "Ha Noi" để query callFetchCar deterministic.
jest.mock("groq-sdk", () =>
  jest.fn().mockImplementation(() => ({
    chat: { completions: { create: (...args) => mockCreate(...args) } },
  }))
);

// Mock route state giống user đi từ form tìm xe sang trang booking vehicles.
// Dữ liệu này giúp component có đủ airport/location/time/capacity để fetch xe.
jest.mock("react-router-dom", () => ({
  createSearchParams: (...args) => mockCreateSearchParams(...args),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      option: "from-airport",
      formFromAirportIn: {
        airportIn: { name: "Noi Bai", lat: 21.2189, lng: 105.8048 },
        locationTo: { name: "My Dinh", lat: 21.0285, lng: 105.7835 },
        timeStart: "2025-10-06T10:00:00.000Z",
        capacity: 2,
      },
      formFromLocationIn: {
        locationIn: { name: "Hanoi", lat: 21.0285, lng: 105.8542 },
        airportTo: { name: "Noi Bai", lat: 21.2189, lng: 105.8048 },
        timeStart: "2025-10-06T10:00:00.000Z",
        capacity: 2,
      },
    },
    search: "",
  }),
}), { virtual: true });

// Mock toast để kiểm tra validation message mà không cần ToastContainer thật.
jest.mock("react-toastify", () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

// Mock map và icon libraries để jsdom không phải xử lý map/canvas/layout phức tạp.
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div />,
}));
jest.mock("react-leaflet-cluster", () => ({ children }) => <div>{children}</div>);
jest.mock("leaflet", () => ({ Icon: jest.fn() }));
jest.mock("@ant-design/icons", () => {
  const MockIcon = (props) => <span {...props} />;
  return new Proxy({}, { get: () => MockIcon });
});
jest.mock("react-icons/md", () => ({ MdOutlineFreeCancellation: () => <span /> }));
jest.mock("react-icons/bs", () => ({ BsFillLightningChargeFill: () => <span /> }));
jest.mock("react-icons/io5", () => ({ IoAirplaneOutline: () => <span />, IoLocationOutline: () => <span /> }));
jest.mock("react-icons/hi2", () => ({ HiOutlineUsers: () => <span /> }));

// Mock Ant Design bằng HTML đơn giản.
// Radio.Button gọi onClick trực tiếp để có thể đổi tab search trong test validation.
jest.mock("antd", () => {
  const React = require("react");
  const InputComponent = React.forwardRef(({ children, ...props }, ref) => <input ref={ref} {...props}>{children}</input>);
  InputComponent.Group = ({ children }) => <div>{children}</div>;
  const Select = ({ children, value, defaultValue, onChange, ...props }) => (
    <select data-testid={props["data-testid"]} value={value ?? defaultValue ?? ""} onChange={(event) => onChange?.(event.target.value)}>
      {children}
    </select>
  );
  Select.Option = ({ children, value }) => <option value={value}>{children}</option>;
  const Checkbox = ({ children, checked, onChange }) => (
    <label>
      <input type="checkbox" checked={!!checked} onChange={(event) => onChange?.({ target: { checked: event.target.checked } })} />
      {children}
    </label>
  );
  return {
    DatePicker: (props) => <input aria-label={props.placeholder || "date-picker"} />,
    Button: ({ children, onClick, disabled, ...props }) => <button onClick={onClick} disabled={disabled} {...props}>{children}</button>,
    Card: ({ children, onClick }) => <div onClick={onClick}>{children}</div>,
    Rate: () => <div />,
    Tag: ({ children }) => <span>{children}</span>,
    Input: InputComponent,
    Divider: () => <div />,
    Badge: ({ children }) => <div>{children}</div>,
    InputNumber: ({ value, onChange }) => <input type="number" value={value ?? ""} onChange={(event) => onChange?.(Number(event.target.value))} />,
    Checkbox,
    Radio: {
      Group: ({ children }) => <div>{children}</div>,
      Button: ({ children, value, onClick }) => <button data-value={value} onClick={onClick}>{children}</button>,
    },
    Popover: ({ children }) => <div>{children}</div>,
    Spin: () => <div>Loading...</div>,
    Empty: ({ description }) => <div>{description}</div>,
    Select,
  };
});

describe("BookingVehicles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "location", { writable: true, value: { href: "http://localhost/booking-vehicles" } });

    // Groq trả về tên khu vực để build query fetch xe.
    mockCreate.mockResolvedValue({ choices: [{ message: { content: "Ha Noi" } }] });

    // Response mặc định: fetch xe thành công nhưng không có xe phù hợp.
    mockCallFetchCar.mockResolvedValue({ isSuccess: true, data: [] });
  });

  // TC ID: BOOKVEH-TC-001
  // MỤC TIÊU: Fetch danh sách xe theo query ban đầu và hiển thị empty state.
  // INPUT: Route state hợp lệ, Groq trả về "Ha Noi", callFetchCar trả về data rỗng.
  // EXPECTED OUTPUT: API được gọi đúng query và user thấy "Chưa có xe taxi".
  it("BOOKVEH-TC-001 - fetches car data and renders empty state", async () => {
    render(<BookingVehicles />);

    await waitFor(() =>
      expect(mockCallFetchCar).toHaveBeenCalledWith(
        "current=1&pageSize=20&driver_status=idle&driver_area_name=Ha Noi&recommended=true"
      )
    );
    expect(screen.getByText("Chưa có xe taxi")).toBeInTheDocument();
  });

  // TC ID: BOOKVEH-TC-002
  // MỤC TIÊU: User mở phần Add extras thì thấy các tùy chọn bổ sung.
  // INPUT: Click nút "Add extras".
  // EXPECTED OUTPUT: Hiển thị "Điểm dừng thêm" và "Vật nuôi".
  it("BOOKVEH-TC-002 - opens extras section when user clicks Add extras", async () => {
    render(<BookingVehicles />);

    await screen.findByText("Add extras");
    fireEvent.click(screen.getByText("Add extras"));

    expect(screen.getByText("Điểm dừng thêm")).toBeInTheDocument();
    expect(screen.getByText("Vật nuôi")).toBeInTheDocument();
  });

  // TC ID: BOOKVEH-TC-003
  // MỤC TIÊU: Khi API fetch car bị lỗi, component nên catch lỗi thay vì để promise reject.
  // RESULT HIỆN TẠI: EXPECTED FAIL.
  // NOTES: handleGetCars hiện chưa try/catch callFetchCar rejected nên Jest chỉ báo Network error.
  it("BOOKVEH-TC-003 - should handle rejected fetch car API request", async () => {
    mockCallFetchCar.mockRejectedValue(new Error("Network error"));

    render(<BookingVehicles />);

    // Chỉ chờ API được gọi, không tìm text trong DOM.
    // Nếu tiếp tục findByText khi API fail, Testing Library sẽ in toàn bộ DOM rất dài.
    await waitFor(() => expect(mockCallFetchCar).toHaveBeenCalled());
  });
});
