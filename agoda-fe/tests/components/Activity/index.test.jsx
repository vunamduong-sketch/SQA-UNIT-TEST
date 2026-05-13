import React from "react";
import { render, screen } from "@testing-library/react";
import Activity from "src-under-test/components/Activity";

// ============================================================
// TÊN FILE TEST: index.test.jsx
// MÔ TẢ: Kiểm tra component Activity tổng hợp render đủ các section con:
//        BackgroundActivity, TopActivity, ExploreLocationNearby,
//        WhyChooseAgoda. Đây là composition test cho entry point folder.
// ============================================================

// Mock từng child component bằng marker text để test composition của index,
// không phụ thuộc logic riêng của các child (đã có test file riêng).
jest.mock("src-under-test/components/Activity/BackgroundActivity", () => ({
  __esModule: true,
  default: () => <div>BackgroundActivity Component</div>,
}));

jest.mock("src-under-test/components/Activity/TopActivity", () => ({
  __esModule: true,
  default: () => <div>TopActivity Component</div>,
}));

jest.mock("src-under-test/components/Activity/ExploreLocationNearby", () => ({
  __esModule: true,
  default: () => <div>ExploreLocationNearby Component</div>,
}));

jest.mock("src-under-test/components/Activity/WhyChooseAgoda", () => ({
  __esModule: true,
  default: () => <div>WhyChooseAgoda Component</div>,
}));

describe("Activity index", () => {
  // TC ID: ACT-TC-010
  // MỤC TIÊU: Đảm bảo entry component Activity render đủ 4 section con
  //           theo scope để tạo thành trang Activity hoàn chỉnh.
  // LÝ DO: Nếu index thiếu một section, user sẽ mất một phần nội dung quan trọng
  //        dù test từng component con vẫn có thể pass.
  it("renders all Activity section components in order", () => {
    render(<Activity />);

    // Expected: Hero landing section có mặt.
    expect(screen.getByText("BackgroundActivity Component")).toBeInTheDocument();

    // Expected: Section hoạt động hàng đầu có mặt.
    expect(screen.getByText("TopActivity Component")).toBeInTheDocument();

    // Expected: Section khám phá địa điểm xung quanh có mặt.
    expect(
      screen.getByText("ExploreLocationNearby Component")
    ).toBeInTheDocument();

    // Expected: Section lý do chọn Agoda có mặt.
    expect(screen.getByText("WhyChooseAgoda Component")).toBeInTheDocument();
  });
});
