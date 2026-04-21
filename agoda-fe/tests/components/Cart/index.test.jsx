import React from "react";
import { render, screen } from "@testing-library/react";
import Cart from "src-under-test/components/Cart/index";

jest.mock("constants/profile", () => ({
  planForTripsBlueIcon: [
    { link: "/hotel", icon: "test-file-stub", text: "Hotel" },
    { link: "/flight", icon: "test-file-stub", text: "Flight" },
  ],
}));

jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to || "#"}>{children}</a>,
}), { virtual: true });

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
  it("renders the cart summary and major booking sections", () => {
    // TC_CART_01
    render(<Cart />);

    expect(screen.getByText("Xe đẩy hàng của quý khách (6)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tiếp theo" })).toBeInTheDocument();
    expect(
      screen.getAllByText("Khách sạn Sài Gòn's Book Đà Lạt (Saigon’s Book Da Lat Hotel)").length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Hà Nội (HAN)").length).toBeGreaterThan(0);
  });

  it("renders all activity tab labels", () => {
    // TC_CART_02
    render(<Cart />);

    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("Chuyến tham quan")).toBeInTheDocument();
    expect(screen.getByText("Trải nghiệm")).toBeInTheDocument();
    expect(screen.getAllByText("Di chuyển").length).toBeGreaterThan(0);
    expect(screen.getByText("Ẩm thực")).toBeInTheDocument();
    expect(screen.getByText("Điểm tham quan")).toBeInTheDocument();
    expect(screen.getByText("Hành trang du lịch")).toBeInTheDocument();
  });
});
