import React from "react";
import { render, screen } from "@testing-library/react";
import BackgroundActivity from "src-under-test/components/Activity/BackgroundActivity";

// ============================================================
// TÊN FILE TEST: BackgroundActivity.test.jsx
// MÔ TẢ: Kiểm tra hero section của trang Activity theo hành vi
//        người dùng nhìn thấy: tiêu đề, mô tả, ô nhập và nút tìm kiếm.
//        Test chỉ dựa vào specification trong fe_testing_scope_plan.md,
//        không kiểm tra className hay cấu trúc JSX nội bộ.
// ============================================================

// Mock icon Ant Design để test không phụ thuộc vào thư viện UI thật.
jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => <span aria-hidden="true">search</span>,
}));

// Mock Button/Input theo semantic HTML để query bằng role/placeholder như user.
jest.mock("antd", () => ({
  Button: ({ children, ...props }) => (
    <button type="button" data-button-type={props.type}>
      {children}
    </button>
  ),
  Input: ({ placeholder, prefix }) => (
    <label>
      Điểm đến hoặc hoạt động
      {prefix}
      <input placeholder={placeholder} />
    </label>
  ),
}));

describe("BackgroundActivity", () => {
  // TC ID: ACT-TC-001
  // MỤC TIÊU: Đảm bảo hero landing của Activity hiển thị đúng nội dung
  //           chính để user có thể nhận biết trang và bắt đầu tìm kiếm.
  // LÝ DO: Đây là điểm chạm đầu tiên của user khi vào trang hoạt động;
  //        thiếu heading/input/button sẽ làm hỏng luồng tìm kiếm.
  it("renders the activity landing hero with search controls", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<BackgroundActivity />);

    // Expected: Heading cấp 1 đúng nội dung theo specification.
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Tìm cuộc phiêu lưu tiếp theo của quý khách",
      })
    ).toBeInTheDocument();

    // Expected: Mô tả giá trị của trang Activity được hiển thị.
    expect(
      screen.getByText(/Mang đến cho quý khách các hoạt động tốt nhất/i)
    ).toBeInTheDocument();

    // Expected: Ô tìm kiếm gợi ý điểm đến mặc định "Đà Nẵng".
    expect(screen.getByPlaceholderText("Đà Nẵng")).toBeInTheDocument();

    // Expected: User nhìn thấy nút hành động chính "Tìm kiếm".
    expect(screen.getByRole("button", { name: "Tìm kiếm" })).toBeInTheDocument();
  });
});
