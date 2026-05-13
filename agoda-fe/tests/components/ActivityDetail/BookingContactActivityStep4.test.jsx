import React from "react";
import { render, screen } from "@testing-library/react";
import BookingContactActivityStep4 from "src-under-test/components/ActivityDetail/BookingContactActivityStep4";

// ============================================================
// TÊN FILE TEST: BookingContactActivityStep4.test.jsx
// MỤC ĐÍCH:
// - Kiểm thử bước cuối của luồng booking activity: màn xác nhận đặt chỗ.
// - Đây là component tĩnh, nên chỉ cần 1 test case đủ để kiểm tra các thông tin
//   user-facing quan trọng: success message, mã booking, payment status, link home.
// ============================================================

// Mock Link thành thẻ a đơn giản để test không cần BrowserRouter.
jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

// Mock icon library vì icon không ảnh hưởng behavior cần kiểm thử.
jest.mock("lucide-react", () => new Proxy({}, { get: () => () => null }), { virtual: true });

describe("BookingContactActivityStep4", () => {
  // TC ID: ACTDETAIL-TC-006
  // MỤC TIÊU: Hiển thị màn xác nhận đặt chỗ thành công.
  // INPUT: Render component confirmation.
  // EXPECTED OUTPUT:
  // - Có message "Đặt chỗ thành công!".
  // - Có label mã đặt chỗ và mã booking cụ thể.
  // - Có trạng thái "Thanh toán thành công".
  // - Có lựa chọn quay về trang chủ.
  // LÝ DO TEST: User cần bằng chứng rõ ràng rằng booking đã hoàn tất.
  it("ACTDETAIL-TC-006 - renders booking confirmation screen", () => {
    // Component có thể gọi scrollTo khi mount; mock để tránh lỗi trong jsdom.
    window.scrollTo = jest.fn();

    render(<BookingContactActivityStep4 />);

    // Các assertion đều dựa trên text user nhìn thấy, không phụ thuộc layout/CSS.
    expect(screen.getByText("Đặt chỗ thành công!")).toBeInTheDocument();
    expect(screen.getByText("Mã đặt chỗ của bạn")).toBeInTheDocument();
    expect(screen.getByText("AG-354319176")).toBeInTheDocument();
    expect(screen.getByText("Thanh toán thành công")).toBeInTheDocument();
    expect(screen.getByText("Quay về trang chủ")).toBeInTheDocument();
  });
});
