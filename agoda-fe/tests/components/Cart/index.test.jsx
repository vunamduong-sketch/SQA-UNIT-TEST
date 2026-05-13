import React from "react";
import { render, screen } from "@testing-library/react";
import Cart from "src-under-test/components/Cart/index";

// ============================================================
// TÊN FILE TEST: index.test.jsx
// MÔ TẢ:
// - Kiểm thử màn Cart chính theo góc nhìn người dùng.
// - Test tập trung vào nội dung hiển thị, tab hoạt động và link gợi ý hoàn tất chuyến đi.
// - Không assert className/CSS để tránh test phụ thuộc implementation.
// ============================================================

// Mock danh sách shortcut ở phần "Hoàn tất chuyến đi với".
// Dữ liệu mock có link/text rõ ràng để kiểm tra navigation user-facing.
jest.mock("constants/profile", () => ({
  planForTripsBlueIcon: [
    { link: "/hotel", icon: "test-file-stub", text: "Hotel", subtext: "ưu đãi" },
    { link: "/flight", icon: "test-file-stub", text: "Flight", subtext: "giá tốt" },
  ],
}), { virtual: true });

// Mock Link bằng thẻ <a> để có thể kiểm tra href trong jsdom.
jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to || "#"}>{children}</a>,
}), { virtual: true });

// Mock Swiper vì unit test chỉ cần kiểm tra nội dung slide, không cần layout/drag thật.
jest.mock("swiper/react", () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}), { virtual: true });

jest.mock("swiper/modules", () => ({
  Navigation: {},
  Pagination: {},
}), { virtual: true });

jest.mock("@ant-design/icons", () => {
  const React = require("react");
  const MockIcon = (props) => <span {...props} />;
  return new Proxy({}, { get: () => MockIcon });
});

// Mock Ant Design bằng HTML đơn giản để test hành vi hiển thị ổn định.
// Tabs render label của tất cả tab và children của tab đầu tiên.
jest.mock("antd", () => {
  const React = require("react");
  return {
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    Checkbox: ({ children, onChange }) => (
      <label>
        <input
          type="checkbox"
          onChange={(event) =>
            onChange?.({ target: { checked: event.target.checked } })
          }
        />
        {children}
      </label>
    ),
    Tabs: ({ items }) => (
      <div>
        <div>{items.map((item) => <div key={item.key}>{item.label}</div>)}</div>
        <div>{items[0]?.children}</div>
      </div>
    ),
    Tag: ({ children }) => <span>{children}</span>,
  };
});

jest.mock("react-icons/pi", () => ({
  PiBuildingApartmentFill: () => <span />,
  PiListChecksFill: () => <span />,
}));
jest.mock("react-icons/fa", () => ({
  FaCar: () => <span />,
  FaRegCalendarCheck: () => <span />,
  FaStarHalf: () => <span />,
  FaTrashAlt: () => <span />,
}));
jest.mock("react-icons/io", () => ({
  IoIosStar: () => <span />,
  IoMdMusicalNote: () => <span />,
}));
jest.mock("react-icons/fa6", () => ({
  FaCheck: () => <span />,
  FaLocationDot: () => <span />,
  FaUserGroup: () => <span />,
  FaTent: () => <span />,
}));
jest.mock("react-icons/io5", () => ({
  IoShieldCheckmark: () => <span />,
}));
jest.mock("react-icons/bi", () => ({
  BiSolidPlaneAlt: () => <span />,
}));
jest.mock("react-icons/ai", () => ({
  AiOutlineSwapRight: () => <span />,
}));
jest.mock("react-icons/md", () => ({
  MdTour: () => <span />,
}));
jest.mock("react-icons/im", () => ({
  ImSpoonKnife: () => <span />,
}));
jest.mock("react-icons/bs", () => ({
  BsLightningChargeFill: () => <span />,
}));

describe("Cart", () => {
  // TC ID: CART-TC-001
  // MỤC TIÊU: Màn Cart phải hiển thị tổng quan giỏ hàng và các booking chính.
  // INPUT: Render <Cart /> với dữ liệu tĩnh hiện tại của component.
  // EXPECTED OUTPUT: User thấy tiêu đề giỏ hàng, nút tiếp tục, booking khách sạn và chuyến bay.
  it("CART-TC-001 - renders cart summary and major booking sections", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Cart />);

    // Kiểm tra tiêu đề giỏ hàng và CTA thanh toán ở sidebar.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Xe đẩy hàng của quý khách (6)")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByRole("button", { name: "Tiếp theo" })).toBeInTheDocument();

    // Kiểm tra các loại booking chính user đang có trong cart.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(
      screen.getAllByText("Khách sạn Sài Gòn's Book Đà Lạt (Saigon’s Book Da Lat Hotel)").length
    ).toBeGreaterThan(0);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Hà Nội (HAN)").length).toBeGreaterThan(0);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Đà Lạt (DLI)").length).toBeGreaterThan(0);
  });

  // TC ID: CART-TC-002
  // MỤC TIÊU: Khu vực gợi ý hoạt động phải hiển thị đủ nhãn tab để user lọc loại hoạt động.
  // INPUT: Render <Cart />.
  // EXPECTED OUTPUT: 7 nhãn tab hoạt động hiển thị đầy đủ.
  it("CART-TC-002 - renders all activity tab labels", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Cart />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Chuyến tham quan")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Trải nghiệm")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Di chuyển").length).toBeGreaterThan(0);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Ẩm thực")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Điểm tham quan")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Hành trang du lịch")).toBeInTheDocument();
  });

  // TC ID: CART-TC-003
  // MỤC TIÊU: Phần "Hoàn tất chuyến đi với" phải render link điều hướng đúng.
  // INPUT: Mock constants/profile gồm Hotel và Flight.
  // EXPECTED OUTPUT: Link Hotel trỏ /hotel, link Flight trỏ /flight.
  it("CART-TC-003 - renders trip completion shortcut links", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Cart />);

    // Kiểm tra text section và href để đảm bảo user có thể đi tiếp sang dịch vụ khác.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Hoàn tất chuyến đi với")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByRole("link", { name: /Hotel ưu đãi/i })).toHaveAttribute("href", "/hotel");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByRole("link", { name: /Flight giá tốt/i })).toHaveAttribute("href", "/flight");
  });
});
