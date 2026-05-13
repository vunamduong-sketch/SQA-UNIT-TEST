import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ReviewTabView from "src-under-test/components/HomeAndApartment/ReviewTabView";

describe("HomeAndApartment ReviewTabView", () => {
  // TC ID: HOMEAPT-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "renders Agoda review summary by default" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("renders Agoda review summary by default", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ReviewTabView />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Điểm số qua Agoda")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("7,0/10")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Review comments mock")).toBeInTheDocument();
  });

  // TC ID: TC_HOMEAPT_06

  // MỤC TIÊU: Kiểm tra kịch bản "changes the active pagination button".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("changes the active pagination button", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ReviewTabView />);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const pageThree = screen.getByText("3");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(pageThree);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(pageThree.className).toContain("bg-blue-600");
  });
});
