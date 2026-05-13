import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FlightList from "src-under-test/components/Flight1/FlightList";

jest.mock("react-icons/fa", () => ({
  FaChevronDown: () => <span>down</span>,
  FaChevronUp: () => <span>up</span>,
}));

describe("Flight1 FlightList", () => {
  // TC ID: FLIGHT1-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "renders static flight cards" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("renders static flight cards", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FlightList />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("10.104.858 đ")).toHaveLength(3);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Vietnam Airlines")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("SGN - RIZ")).toHaveLength(3);
  });

  // TC ID: TC_FLIGHT1_07

  // MỤC TIÊU: Kiểm tra kịch bản "expands flight details when clicking a flight card".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("expands flight details when clicking a flight card", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FlightList />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getAllByText("China Eastern Airlines")[0]);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Hồ Chí Minh (SGN) - Sân bay Quốc tế Tân Sơn Nhất")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Thêm vào xe đẩy hàng")).toBeInTheDocument();
  });
});
