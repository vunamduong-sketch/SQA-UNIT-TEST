import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import BookingContactActivity from "src-under-test/components/ActivityDetail/BookingContactActivity";
import { getBookingDetail, getCountries } from "config/api";

const mockNavigate = jest.fn();

jest.mock("redux/hooks", () => ({
  useAppSelector: jest.fn((selector) =>
    selector({ account: { user: { first_name: "", last_name: "", email: "", phone_number: "" } } })
  ),
}));

jest.mock("config/api", () => ({
  getBookingDetail: jest.fn(),
  getCountries: jest.fn(),
  addBookingContact: jest.fn(),
  callFetchDetailActivityDateBooking: jest.fn(),
  callFetchDetailCarBooking: jest.fn(),
  callFetchDetailRoomBooking: jest.fn(),
}));

jest.mock("constants/serviceType", () => ({
  ServiceType: { HOTEL: 1, ACTIVITY: 2, CAR: 3, FLIGHT: 4 },
  ServiceTypeLabelIcon: {},
  ServiceTypeLabelVi: {},
}));

jest.mock("constants/airline", () => ({ SEAT_CLASS_VI: {} }));
jest.mock("utils/googleMap", () => ({ haversine: jest.fn(() => 10) }));
jest.mock("utils/imageUrl", () => ({ getImage: jest.fn(() => "img") }));

jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
    useSearchParams: () => [{ get: (key) => ({ booking_id: "1", type: "1", ref: "abc" }[key] ?? null) }],
    Link: ({ children, to }) => <a href={to}>{children}</a>,
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

describe("BookingContactActivity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = jest.fn();
    getCountries.mockResolvedValue({ data: [] });
  });

  it("shows loading state on first render", () => {
    // TC_ACTIVITYDETAIL_01
    getBookingDetail.mockReturnValue(new Promise(() => {}));
    render(<BookingContactActivity />);
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  it("shows not found message when booking data is missing", async () => {
    // TC_ACTIVITYDETAIL_02
    getBookingDetail.mockResolvedValue(null);
    render(<BookingContactActivity />);
    expect(await screen.findByText("Không tìm thấy thông tin đặt chỗ")).toBeInTheDocument();
  });
});
