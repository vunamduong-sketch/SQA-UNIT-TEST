import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FilterSection from "src-under-test/components/HomeAndApartment/FilterSection";

jest.mock("@mui/icons-material", () => ({
  Tune: () => <span>tune</span>,
}));

describe("HomeAndApartment FilterSection", () => {
  // TC ID: HOMEAPT-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "toggles a filter selection" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("toggles a filter selection", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FilterSection />);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const button = screen.getByText("Không hút thuốc (5)").closest("button");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(button);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(button.className).toContain("bg-blue-600");
  });

  // TC ID: TC_HOMEAPT_04

  // MỤC TIÊU: Kiểm tra kịch bản "clears all selected filters".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("clears all selected filters", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FilterSection />);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const smokeButton = screen.getByText("Không hút thuốc (5)").closest("button");
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const seaButton = screen.getByText("Hướng biển (3)").closest("button");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(smokeButton);
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(seaButton);
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Xóa hết"));

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(smokeButton.className).not.toContain("bg-blue-600");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(seaButton.className).not.toContain("bg-blue-600");
  });
});
