import React from "react";
import { render, screen } from "@testing-library/react";
import ActivityAllTab from "src-under-test/components/Cart/ActivityTab/ActivityAllTab";
import ActivityTourTab from "src-under-test/components/Cart/ActivityTab/ActivityTourTab";
import ActivityExperienceTab from "src-under-test/components/Cart/ActivityTab/ActivityExperienceTab";
import ActivityDriveTab from "src-under-test/components/Cart/ActivityTab/ActivityDriveTab";
import ActivityFoodTab from "src-under-test/components/Cart/ActivityTab/ActivityFoodTab";
import ActivityLocationTab from "src-under-test/components/Cart/ActivityTab/ActivityLocationTab";
import ActivityTravelEssentialTab from "src-under-test/components/Cart/ActivityTab/ActivityTravelEssentialTab";

// ============================================================
// TÊN FILE TEST: ActivityTabs.test.jsx
// MÔ TẢ:
// - Kiểm thử các tab gợi ý hoạt động trong Cart.
// - Vì 7 tab hiện dùng cùng format card tĩnh, dùng it.each để tránh lặp code.
// - Assertion tập trung vào nội dung user nhìn thấy: số card, tên tour, chính sách hủy và giá.
// ============================================================

// Mock Swiper thành wrapper đơn giản để đếm slide trong môi trường jsdom.
jest.mock("swiper/react", () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}), { virtual: true });

jest.mock("swiper/modules", () => ({
  Navigation: {},
  Pagination: {},
}), { virtual: true });

// Mock Tag của Ant Design để chỉ giữ lại text hiển thị.
jest.mock("antd", () => ({
  Tag: ({ children }) => <span>{children}</span>,
}));

jest.mock("react-icons/io", () => ({
  IoIosStar: () => <span />,
}));

jest.mock("react-icons/bs", () => ({
  BsLightningChargeFill: () => <span />,
}));

const cases = [
  ["CART-TC-004", "tab Tất cả", ActivityAllTab],
  ["CART-TC-005", "tab Chuyến tham quan", ActivityTourTab],
  ["CART-TC-006", "tab Trải nghiệm", ActivityExperienceTab],
  ["CART-TC-007", "tab Di chuyển", ActivityDriveTab],
  ["CART-TC-008", "tab Ẩm thực", ActivityFoodTab],
  ["CART-TC-009", "tab Điểm tham quan", ActivityLocationTab],
  ["CART-TC-010", "tab Hành trang du lịch", ActivityTravelEssentialTab],
];

describe("Cart Activity Tabs", () => {
  // TC ID: CART-TC-004 -> CART-TC-010
  // MỤC TIÊU: Mỗi tab hoạt động phải render danh sách card gợi ý nhất quán.
  // INPUT: Render từng Activity tab component độc lập.
  // EXPECTED OUTPUT: Có 15 slide, tên activity, rating, chính sách hủy và giá hiển thị.
  it.each(cases)("%s - renders the activity card list for %s", (_caseId, _label, Component) => {
    render(<Component />);

    // Kiểm tra carousel có đủ 15 card hoạt động như thiết kế hiện tại.
    expect(screen.getAllByTestId("swiper-slide")).toHaveLength(15);

    // Kiểm tra thông tin quan trọng trên card mà user dùng để ra quyết định.
    expect(
      screen.getAllByText("Da Nang Airport Transfer to Da Nang Hotel by Private Car")[0]
    ).toBeInTheDocument();
    expect(screen.getAllByText("Hủy miễn phí")[0]).toBeInTheDocument();
    expect(screen.getAllByText("540.762")[0]).toBeInTheDocument();
    expect(screen.getAllByText("298 người đã đặt")[0]).toBeInTheDocument();
  });
});
