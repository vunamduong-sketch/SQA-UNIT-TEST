import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BookingContactActivityStep2 from "src-under-test/components/ActivityDetail/BookingContactActivityStep2";
import { callFetchDetailActivityDateBooking, createPayment, getBookingDetail, getPayment, payWithStripe } from "config/api";

// ============================================================
// TÊN FILE TEST: BookingContactActivityStep2.test.jsx
// MỤC ĐÍCH:
// - Kiểm thử bước 2 của luồng đặt Activity: chọn phương thức thanh toán.
// - Chỉ giữ test case vừa đủ: render payment UI và online payment redirect Stripe.
// - Không test quá nhiều nhánh phụ để tránh test suite phình to khó bảo trì.
// QUY ƯỚC:
// - TC ID nối tiếp ACTDETAIL-TC-004 và ACTDETAIL-TC-005.
// - Comment tiếng Việt giải thích rõ mock, input và expected output.
// ============================================================

// Mock alert để component có thể gọi alert ở nhánh lỗi mà không mở popup thật.
jest.spyOn(window, "alert").mockImplementation(() => {});

// Mock các API được dùng trong bước thanh toán.
// getPayment/createPayment/payWithStripe là trọng tâm của test online payment.
jest.mock("config/api", () => ({
  getBookingDetail: jest.fn(),
  createPayment: jest.fn(),
  payWithStripe: jest.fn(),
  confirmCashPayment: jest.fn(),
  getPayment: jest.fn(),
  callFetchDetailActivityDateBooking: jest.fn(),
  callFetchDetailCarBooking: jest.fn(),
  callFetchDetailRoomBooking: jest.fn(),
}));

// Mock constant để component hiểu:
// - service type 2 là ACTIVITY.
// - payment method 1 là online, 2 là cash.
// Label được render ra UI nên test có thể query bằng text.
jest.mock("constants/serviceType", () => ({
  ServiceType: { HOTEL: 1, ACTIVITY: 2, CAR: 3, FLIGHT: 4 },
  PaymentMethod: { ONLINE: 1, CASH: 2 },
  PaymentMethodLabel: { 1: "Thanh toán online", 2: "Thanh toán tiền mặt" },
  ServiceTypeLabelIcon: { 2: "🎟" },
  ServiceTypeLabelVi: { 2: "Hoạt động" },
}), { virtual: true });

// Mock các dependency phụ không phải trọng tâm để test chỉ tập trung payment flow.
jest.mock("constants/airline", () => ({ SEAT_CLASS_VI: {} }), { virtual: true });
jest.mock("utils/googleMap", () => ({ haversine: jest.fn(() => 10) }), { virtual: true });
jest.mock("utils/imageUrl", () => ({ getImage: jest.fn(() => "img") }), { virtual: true });
jest.mock("utils/formatCurrency", () => ({ formatCurrency: jest.fn((value) => `formatted-${value}`) }));

// Mock query string giống URL thật: /book/payment?booking_id=1&type=2&ref=abc.
// Component dùng các giá trị này để tạo success_url/cancel_url cho Stripe.
jest.mock("react-router-dom", () => ({
  useSearchParams: () => [{ get: (key) => ({ booking_id: "1", type: "2", ref: "abc" }[key] ?? null) }],
}), { virtual: true });

// Mock UI libraries bằng HTML đơn giản để dễ query text và click button.
jest.mock("antd", () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  Divider: () => <hr />,
  Spin: () => <div>Loading Spinner</div>,
}));
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div>TileLayer</div>,
}), { virtual: true });
jest.mock("react-leaflet-cluster", () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }), { virtual: true });
jest.mock("leaflet", () => ({ Icon: function Icon() {} }), { virtual: true });
jest.mock("@ant-design/icons", () => ({ CarOutlined: () => null, EditOutlined: () => null, UserOutlined: () => null }));
jest.mock("lucide-react", () => new Proxy({}, { get: () => () => null }), { virtual: true });

// Booking giả lập cho màn payment.
// total_price=1200000 được dùng làm amount khi createPayment.
const bookingResponse = {
  id: 1,
  service_type: 2,
  service_ref_ids: [44],
  total_price: 1200000,
  guest_info: { email: "guest@example.com" },
  activity_date_detail: [
    {
      adult_quantity_booking: 2,
      child_quantity_booking: 1,
      activity_date: { promotion: { discount_percent: 10 } },
    },
  ],
};

// Activity detail giả lập để phần summary hiển thị tên activity.
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

describe("BookingContactActivityStep2", () => {
  beforeEach(() => {
    // Reset mock để mỗi test case độc lập, không bị ảnh hưởng số lần gọi từ test trước.
    jest.clearAllMocks();

    // Component gọi scrollTo khi mount; mock để tránh lỗi jsdom.
    window.scrollTo = jest.fn();

    // Base URL dùng cho image src trong summary card.
    process.env.REACT_APP_BE_URL = "https://cdn.example.test";

    // Mock window.location để assert redirect sang Stripe checkout.
    Object.defineProperty(window, "location", {
      writable: true,
      value: { origin: "http://localhost", href: "http://localhost/book/payment" },
    });

    // Response mặc định cho happy path của màn payment.
    getBookingDetail.mockResolvedValue(bookingResponse);
    callFetchDetailActivityDateBooking.mockResolvedValue({ isSuccess: true, data: activityDateBooking });

    // Mặc định chưa có payment nên component sẽ gọi createPayment.
    getPayment.mockResolvedValue({ count: 0, results: [] });
    createPayment.mockResolvedValue({ id: 99 });

    // Stripe trả về checkout_url để component redirect.
    payWithStripe.mockResolvedValue({ checkout_url: "https://stripe.example/checkout" });
  });

  // TC ID: ACTDETAIL-TC-004
  // MỤC TIÊU: Render payment options và booking summary.
  // INPUT: Booking hợp lệ, activity detail hợp lệ.
  // EXPECTED OUTPUT:
  // - Có tiêu đề "Chi tiết thanh toán".
  // - Có 2 phương thức thanh toán: online và tiền mặt.
  // - Có tên activity trong summary.
  // LÝ DO TEST: User cần thấy đúng thông tin trước khi thực hiện thanh toán.
  it("ACTDETAIL-TC-004 - renders payment options and booking summary", async () => {
    render(<BookingContactActivityStep2 />);

    expect(await screen.findByText("Chi tiết thanh toán")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán online")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán tiền mặt")).toBeInTheDocument();
    expect(screen.getByText("Saigon Food Tour")).toBeInTheDocument();
  });

  // TC ID: ACTDETAIL-TC-005
  // MỤC TIÊU: Online payment tạo payment và redirect sang Stripe.
  // INPUT:
  // - User click "THANH TOÁN NGAY".
  // - getPayment trả về chưa có payment.
  // - createPayment trả về id=99.
  // - payWithStripe trả về checkout_url.
  // EXPECTED OUTPUT:
  // - createPayment được gọi với booking_id, method online và amount.
  // - payWithStripe được gọi với success_url/cancel_url đúng.
  // - window.location.href đổi sang Stripe checkout URL.
  // LÝ DO TEST: Đây là behavior quan trọng nhất của bước thanh toán online.
  it("ACTDETAIL-TC-005 - creates online payment and redirects to Stripe checkout", async () => {
    render(<BookingContactActivityStep2 />);

    fireEvent.click(await screen.findByText("THANH TOÁN NGAY"));

    await waitFor(() =>
      expect(createPayment).toHaveBeenCalledWith({
        booking_id: "1",
        method: 1,
        amount: 1200000,
      })
    );

    expect(payWithStripe).toHaveBeenCalledWith(99, expect.objectContaining({
      success_url: "http://localhost/book/confirmation?isSuccess=true&booking_id=1&type=2&ref=abc",
      cancel_url: "http://localhost/book/confirmation?isSuccess=false&booking_id=1&type=2&ref=abc",
    }));
    expect(window.location.href).toBe("https://stripe.example/checkout");
  });
});
