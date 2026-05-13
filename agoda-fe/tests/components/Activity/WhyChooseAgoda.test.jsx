import React from "react";
import { render, screen } from "@testing-library/react";
import WhyChooseAgoda from "src-under-test/components/Activity/WhyChooseAgoda";

// ============================================================
// TÊN FILE TEST: WhyChooseAgoda.test.jsx
// MÔ TẢ: Kiểm tra section "Tại sao chọn Agoda?" hiển thị đầy đủ
//        3 value propositions và mô tả tương ứng cho người dùng.
//        Test dựa trên nội dung user-facing, không dựa vào mảng items nội bộ.
// ============================================================

describe("WhyChooseAgoda", () => {
  // TC ID: ACT-TC-009
  // MỤC TIÊU: Đảm bảo 3 lý do chọn Agoda được hiển thị đầy đủ gồm heading
  //           và description để user hiểu giá trị của dịch vụ Activity.
  // LÝ DO: Đây là phần tăng độ tin cậy/chuyển đổi trước khi user đặt trải nghiệm.
  it("communicates all Agoda value propositions with descriptions", () => {
    render(<WhyChooseAgoda />);

    // Expected: Heading section hiển thị đúng nội dung.
    expect(
      screen.getByRole("heading", { name: "Tại sao chọn Agoda?" })
    ).toBeInTheDocument();

    // Expected: Value prop 1 và mô tả tương ứng có mặt.
    expect(screen.getByText("Hơn 300.000 trải nghiệm")).toBeInTheDocument();
    expect(
      screen.getByText(/Đặt mọi chuyến tham quan hoặc vé tham quan/i)
    ).toBeInTheDocument();

    // Expected: Value prop 2 và mô tả tương ứng có mặt.
    expect(screen.getByText("Nhanh chóng và linh hoạt")).toBeInTheDocument();
    expect(
      screen.getByText(/Đặt vé trực tuyến trong vài phút/i)
    ).toBeInTheDocument();

    // Expected: Value prop 3 và mô tả tương ứng có mặt.
    expect(screen.getByText("Trải nghiệm du lịch hợp nhất")).toBeInTheDocument();
    expect(
      screen.getByText(/Lên kế hoạch liền mạch cho các chuyến bay/i)
    ).toBeInTheDocument();
  });
});
