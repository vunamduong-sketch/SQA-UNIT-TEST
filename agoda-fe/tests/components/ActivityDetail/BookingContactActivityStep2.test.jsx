import React from "react";
import { render, screen } from "@testing-library/react";
import BookingContactActivityStep2 from "src-under-test/components/ActivityDetail/BookingContactActivityStep2";
import { getBookingDetail } from "config/api";

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

jest.mock("constants/serviceType", () => ({
  ServiceType: { HOTEL: 1, ACTIVITY: 2, CAR: 3, FLIGHT: 4 },
  PaymentMethod: { ONLINE: 1, CASH: 2 },
  PaymentMethodLabel: {},
  ServiceTypeLabelIcon: {},
  ServiceTypeLabelVi: {},
}));

jest.mock("constants/airline", () => ({ SEAT_CLASS_VI: {} }));
jest.mock("utils/googleMap", () => ({ haversine: jest.fn(() => 10) }));
jest.mock("utils/imageUrl", () => ({ getImage: jest.fn(() => "img") }));
jest.mock(
  "react-router-dom",
  () => ({
    useSearchParams: () => [{ get: (key) => ({ booking_id: "1", type: "1", ref: "abc" }[key] ?? null) }],
  }),
  { virtual: true }
);
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

describe("BookingContactActivityStep2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = jest.fn();
  });

  it("shows loading state on first render", () => {
    // TC_ACTIVITYDETAIL_03
    getBookingDetail.mockReturnValue(new Promise(() => {}));
    render(<BookingContactActivityStep2 />);
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  it("shows not found message when booking data is missing", async () => {
    // TC_ACTIVITYDETAIL_04
    getBookingDetail.mockResolvedValue(null);
    render(<BookingContactActivityStep2 />);
    expect(await screen.findByText("Không tìm thấy thông tin đặt chỗ")).toBeInTheDocument();
  });
});
