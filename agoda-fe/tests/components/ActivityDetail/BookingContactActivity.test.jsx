import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BookingContactActivity from "src-under-test/components/ActivityDetail/BookingContactActivity";
import { addBookingContact, callFetchDetailActivityDateBooking, getBookingDetail, getCountries } from "config/api";

// ============================================================
// TÊN FILE TEST: BookingContactActivity.test.jsx
// MÔ TẢ: Kiểm tra vừa đủ bước nhập thông tin liên hệ: loading,
//        booking missing và submit contact để sang bước payment.
// ============================================================

// Mock hàm navigate của react-router-dom để kiểm tra component điều hướng đúng URL.
const mockNavigate = jest.fn();

// Mock alert để tránh popup thật trong môi trường test jsdom.
// File này không assert alert, nhưng component có thể gọi alert ở nhánh lỗi.
jest.spyOn(window, "alert").mockImplementation(() => { });

// Mock redux selector để component luôn nhận được user đăng nhập ổn định.
// Việc này giúp test không phụ thuộc Redux store thật của ứng dụng.
jest.mock("redux/hooks", () => ({
  useAppSelector: jest.fn((selector) =>
    selector({
      account: {
        user: {
          first_name: "An",
          last_name: "Nguyen",
          email: "an@example.com",
          phone_number: "0912345678",
        },
      },
    })
  ),
}));

// Mock toàn bộ API mà BookingContactActivity sử dụng.
// Mỗi API là jest.fn() để từng test case có thể tự quyết định response.
jest.mock("config/api", () => ({
  getBookingDetail: jest.fn(),
  getCountries: jest.fn(),
  addBookingContact: jest.fn(),
  callFetchDetailActivityDateBooking: jest.fn(),
  callFetchDetailCarBooking: jest.fn(),
  callFetchDetailRoomBooking: jest.fn(),
}));

// Mock service type để component hiểu type=2 là ACTIVITY.
// virtual:true dùng vì trong môi trường test alias module có thể không resolve được như app thật.
jest.mock("constants/serviceType", () => ({
  ServiceType: { HOTEL: 1, ACTIVITY: 2, CAR: 3, FLIGHT: 4 },
  ServiceTypeLabelIcon: { 2: "🎟" },
  ServiceTypeLabelVi: { 2: "Hoạt động" },
}), { virtual: true });

// Mock các dependency phụ không phải trọng tâm test.
// Mục tiêu là cô lập logic của BookingContactActivity, tránh lỗi từ map/image/icon/format.
jest.mock("constants/airline", () => ({ SEAT_CLASS_VI: {} }), { virtual: true });
jest.mock("utils/googleMap", () => ({ haversine: jest.fn(() => 10) }), { virtual: true });
jest.mock("utils/imageUrl", () => ({ getImage: jest.fn(() => "img") }), { virtual: true });
jest.mock("utils/formatCurrency", () => ({ formatCurrency: jest.fn((value) => `formatted-${value}`) }));

// Mock router:
// - useSearchParams trả về query booking_id=1, type=2, ref=abc giống URL thật.
// - useNavigate dùng mockNavigate để assert sau khi submit contact.
// - Link render thành thẻ a đơn giản để không cần Router provider.
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [{ get: (key) => ({ booking_id: "1", type: "2", ref: "abc" }[key] ?? null) }],
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

// Mock Ant Design bằng HTML đơn giản.
// Spin render text cố định để test loading bằng screen.getByText.
jest.mock("antd", () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  Divider: () => <hr />,
  Spin: () => <div>Loading Spinner</div>,
}));

// Mock map và icon libraries vì các thành phần này không phải behavior chính cần kiểm thử.
// Nếu dùng component thật, test dễ fail vì jsdom không hỗ trợ đầy đủ map/canvas/layout.
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
}), { virtual: true });
jest.mock("react-leaflet-cluster", () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }), { virtual: true });
jest.mock("leaflet", () => ({ Icon: function Icon() { } }), { virtual: true });
jest.mock("@ant-design/icons", () => ({ CarOutlined: () => null, EditOutlined: () => null, UserOutlined: () => null }));
jest.mock("lucide-react", () => new Proxy({}, { get: () => () => null }), { virtual: true });

// Dữ liệu booking giả lập cho happy path.
// service_type=2 tương ứng ACTIVITY, service_ref_ids[0]=44 dùng để fetch activity date detail.
// guest_info mô phỏng dữ liệu liên hệ đã có sẵn trong booking.
const bookingResponse = {
  id: 1,
  service_type: 2,
  service_ref_ids: [44],
  total_price: 1200000,
  guest_info: {
    full_name: "Nguyen An",
    email: "old@example.com",
    phone: "+84987654321",
    special_request: "Near entrance",
  },
  activity_date_detail: [
    {
      adult_quantity_booking: 2,
      child_quantity_booking: 1,
      activity_date: { promotion: { discount_percent: 10 } },
    },
  ],
};

// Dữ liệu chi tiết activity date giả lập để summary bên phải render tên activity.
// Test chỉ cần verify tên "Saigon Food Tour" xuất hiện trước khi submit.
const activityDateBooking = {
  activity_name: "Saigon Food Tour",
  activity_image: "/activity.jpg",
  avg_star: 4.6,
  date_launch: "2026-05-01T08:00:00Z",
  activity_package_name: "Morning Package",
  adult_quantity_booking: 2,
  child_quantity_booking: 1,
  activity_date: { activity_package: { activity: { review_count: 88 } } },
};

describe("BookingContactActivity", () => {
  beforeEach(() => {
    // Reset toàn bộ số lần gọi mock để test case độc lập với nhau.
    jest.clearAllMocks();

    // Component gọi scrollTo khi mount; mock để tránh lỗi jsdom.
    window.scrollTo = jest.fn();

    // Base URL dùng khi component build image src.
    process.env.REACT_APP_BE_URL = "https://cdn.example.test";

    // Response mặc định cho các API phụ trong happy path.
    getCountries.mockResolvedValue({
      data: [{ id: 1, name: "Vietnam", calling_code: "+84" }],
    });
    callFetchDetailActivityDateBooking.mockResolvedValue({
      isSuccess: true,
      data: activityDateBooking,
    });
    addBookingContact.mockResolvedValue({ isSuccess: true });
  });

  // TC ID: ACTDETAIL-TC-001
  // MỤC TIÊU: Hiển thị loading khi booking API chưa trả về.
  // INPUT: getBookingDetail trả về Promise pending vô thời hạn.
  // EXPECTED OUTPUT: User nhìn thấy Loading Spinner.
  // LÝ DO TEST: Đảm bảo màn hình có feedback trong lúc hệ thống tải dữ liệu booking.
  it("ACTDETAIL-TC-001 - shows loading state while booking data is being fetched", () => {
    // Arrange: giả lập API lấy booking chưa resolve để component luôn ở trạng thái loading.
    // Promise không gọi resolve/reject giúp test kiểm tra đúng UI trong lúc chờ dữ liệu.
    // Arrange: cau hinh mock tra ve gia tri can thiet cho test case nay.
    getBookingDetail.mockReturnValue(new Promise(() => { }));

    // Act: render component như khi user mở trang nhập thông tin liên hệ booking activity.
    render(<BookingContactActivity />);

    // Assert: spinner phải xuất hiện ngay lập tức để user biết hệ thống đang tải dữ liệu.
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  // TC ID: ACTDETAIL-TC-002
  // MỤC TIÊU: Hiển thị not found khi không có booking.
  // INPUT: getBookingDetail trả về null.
  // EXPECTED OUTPUT: Message "Không tìm thấy thông tin đặt chỗ" được hiển thị.
  // LÝ DO TEST: Không được render form contact/payment với dữ liệu booking không tồn tại.
  it("ACTDETAIL-TC-002 - shows not found message when booking data is missing", async () => {
    // Arrange: giả lập backend không tìm thấy booking tương ứng booking_id trên URL.
    getBookingDetail.mockResolvedValue(null);

    // Act: render component để useEffect gọi API và xử lý response null.
    render(<BookingContactActivity />);

    // Assert: dùng findByText vì thông báo chỉ xuất hiện sau khi Promise getBookingDetail hoàn tất.
    // Kỳ vọng page hiển thị trạng thái not found thay vì tiếp tục render form sai dữ liệu.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Không tìm thấy thông tin đặt chỗ")).toBeInTheDocument();
  });

  // TC ID: ACTDETAIL-TC-003
  // MỤC TIÊU: Submit contact info và điều hướng sang payment.
  // INPUT: Booking hợp lệ, activity detail hợp lệ, user click "Tiếp tục đến thanh toán".
  // EXPECTED OUTPUT:
  // - addBookingContact được gọi để lưu thông tin liên hệ.
  // - navigate chuyển sang /book/payment với booking_id/type/ref đúng.
  // LÝ DO TEST: Đây là luồng chính của bước nhập thông tin liên hệ trong booking activity.
  it("ACTDETAIL-TC-003 - submits contact information and navigates to payment step", async () => {
    // Arrange: giả lập booking hợp lệ để component có đủ dữ liệu render form và summary.
    // bookingResponse chứa service_ref_ids[0] để component tiếp tục gọi API lấy activity detail.
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    getBookingDetail.mockResolvedValue(bookingResponse);

    // Act: render component, các API phụ đã được setup mặc định trong beforeEach.
    render(<BookingContactActivity />);

    // Assert bước load dữ liệu: chờ tên activity xuất hiện để chắc chắn booking detail
    // và activity date detail đã load xong trước khi user bấm tiếp tục.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Saigon Food Tour")).toBeInTheDocument();

    // Act: mô phỏng user bấm nút chuyển sang bước thanh toán sau khi kiểm tra thông tin.
    fireEvent.click(screen.getByText("Tiếp tục đến thanh toán"));

    // Assert: hệ thống phải gọi API lưu thông tin liên hệ trước khi điều hướng thanh toán.
    // waitFor cần thiết vì submit có thể xử lý bất đồng bộ.
    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => expect(addBookingContact).toHaveBeenCalled());

    // Assert: sau khi lưu contact thành công, component điều hướng đúng route payment
    // và giữ nguyên booking_id/type/ref lấy từ query string ban đầu.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(mockNavigate).toHaveBeenCalledWith("/book/payment?booking_id=1&type=2&ref=abc");
  });
});
