import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FilterSideBar from "src-under-test/components/Flight1/FilterSideBar";

describe("Flight1 FilterSideBar", () => {
  // TC ID: FLIGHT1-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "expands airline list and shows all airlines" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("expands airline list and shows all airlines", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FilterSideBar />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.queryByText("Vietnam Airlines")).not.toBeInTheDocument();
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Hiện tất cả 6 hãng hàng không"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Vietnam Airlines")).toBeInTheDocument();
  });

  // TC ID: TC_FLIGHT1_05

  // MỤC TIÊU: Kiểm tra kịch bản "selects all airlines and clears baggage filter".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("selects all airlines and clears baggage filter", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FilterSideBar />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByLabelText("Đã gồm hành lý ký gửi"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByLabelText("Đã gồm hành lý ký gửi")).toBeChecked();

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Chọn tất cả"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByLabelText("Air China")).toBeChecked();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByLabelText("Asiana Airlines")).toBeChecked();

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getAllByText("Xóa")[0]);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByLabelText("Đã gồm hành lý ký gửi")).not.toBeChecked();
  });
});
