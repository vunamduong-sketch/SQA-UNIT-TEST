import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Flight from "src-under-test/components/Profile/Flight";
import Hotel from "src-under-test/components/Profile/Hotel";
import Activity from "src-under-test/components/Profile/Activity";
import Car from "src-under-test/components/Profile/Car";

jest.mock("constants/profile", () => ({
  ServiceTab: {
    INCOMING: "incoming",
    SUCCESSFUL: "successful",
    CANCELLED: "cancelled",
  },
}));

jest.mock("antd", () => ({
  Tabs: ({ items, onChange, activeKey }) => (
    <div>
      {items.map((item) => (
        <button key={item.key} onClick={() => onChange(item.key)}>
          {item.key}
        </button>
      ))}
      <div>{items.find((item) => item.key === activeKey)?.children}</div>
    </div>
  ),
}));

describe("Profile service tabs", () => {
  // TC ID: PROFILE-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "switches Flight tabs" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("switches Flight tabs", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Flight />);
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("successful"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("flight-successful")).toBeInTheDocument();
  });

  // TC ID: TC_PROFILE_04

  // MỤC TIÊU: Kiểm tra kịch bản "switches Hotel tabs".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("switches Hotel tabs", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Hotel />);
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("cancelled"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("hotel-cancelled")).toBeInTheDocument();
  });

  // TC ID: TC_PROFILE_05

  // MỤC TIÊU: Kiểm tra kịch bản "switches Activity tabs".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("switches Activity tabs", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Activity />);
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("successful"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("activity-successful")).toBeInTheDocument();
  });

  // TC ID: TC_PROFILE_06

  // MỤC TIÊU: Kiểm tra kịch bản "switches Car tabs".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("switches Car tabs", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Car />);
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("cancelled"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("car-cancelled")).toBeInTheDocument();
  });
});
