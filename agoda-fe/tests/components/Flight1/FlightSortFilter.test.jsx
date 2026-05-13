import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FlightSortFilter from "src-under-test/components/Flight1/FlightSortFilter";

describe("Flight1 FlightSortFilter", () => {
  // TC ID: FLIGHT1-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "changes sort mode when clicking a tab" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("changes sort mode when clicking a tab", () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const onSortChange = jest.fn();
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FlightSortFilter onSortChange={onSortChange} />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Nhanh nhất"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(onSortChange).toHaveBeenCalledWith("fastest");
  });

  // TC ID: TC_FLIGHT1_09

  // MỤC TIÊU: Kiểm tra kịch bản "selects a dropdown sort option with keyboard navigation".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("selects a dropdown sort option with keyboard navigation", async () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const onSortChange = jest.fn();
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FlightSortFilter onSortChange={onSortChange} />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Sắp xếp theo"));
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "Enter" });

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(onSortChange).toHaveBeenCalledWith("departure");
    });
  });
});
