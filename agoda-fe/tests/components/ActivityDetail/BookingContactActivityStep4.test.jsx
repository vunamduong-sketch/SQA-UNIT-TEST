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
  // TC ID: ACTDETAIL-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "ACTDETAIL-TC-006 - renders booking confirmation screen" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("ACTDETAIL-TC-006 - renders booking confirmation screen", () => {
    // Component có thể gọi scrollTo khi mount; mock để tránh lỗi trong jsdom.
    window.scrollTo = jest.fn();

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<BookingContactActivityStep4 />);

    // Các assertion đều dựa trên text user nhìn thấy, không phụ thuộc layout/CSS.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Đặt chỗ thành công!")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Mã đặt chỗ của bạn")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("AG-354319176")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Thanh toán thành công")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Quay về trang chủ")).toBeInTheDocument();
  });
});
