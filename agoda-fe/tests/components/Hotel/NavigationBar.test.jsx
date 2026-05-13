import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NavigationBar from "src-under-test/components/Hotel/NavigationBar";

const mockFormatCurrency = jest.fn((value) => value);
const mockScrollIntoView = jest.fn();
const observe = jest.fn();
const disconnect = jest.fn();

jest.mock("utils/formatCurrency", () => ({
  formatCurrency: (...args) => mockFormatCurrency(...args),
}));

describe("Hotel NavigationBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.IntersectionObserver = jest.fn(() => ({
      observe,
      disconnect,
    }));
    document.querySelector = jest.fn(() => ({
      scrollIntoView: mockScrollIntoView,
    }));
  });

  // TC ID: HOTEL-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "renders formatted price and calls scrollToSection for overview" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("renders formatted price and calls scrollToSection for overview", () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const scrollToSection = jest.fn();
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<NavigationBar scrollToSection={scrollToSection} hotel={{ min_price: 2500000 }} />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("2500000 VND")).toBeInTheDocument();
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Tổng quan"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(scrollToSection).toHaveBeenCalledWith("overview");
  });

  // TC ID: TC_HOTEL_09

  // MỤC TIÊU: Kiểm tra kịch bản "scrolls to room options when clicking Xem giá".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("scrolls to room options when clicking Xem giá", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<NavigationBar scrollToSection={jest.fn()} hotel={{ min_price: 2500000 }} />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Xem giá"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(observe).toHaveBeenCalled();
  });
});
