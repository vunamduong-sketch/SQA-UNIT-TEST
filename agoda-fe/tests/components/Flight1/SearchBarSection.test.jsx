import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchBarSection from "src-under-test/components/Flight1/SearchBarSection";

jest.mock("lucide-react", () => ({
  Check: () => <span>check</span>,
  ChevronDown: () => <span>down</span>,
  ChevronUp: () => <span>up</span>,
}));

describe("Flight1 SearchBarSection", () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });

  // TC ID: FLIGHT1-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "updates origin and destination inputs" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates origin and destination inputs", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<SearchBarSection />);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const inputs = screen.getAllByRole("textbox");
    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(inputs[0], { target: { value: "Ha Noi (HAN)" } });
    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(inputs[1], { target: { value: "Da Nang (DAD)" } });

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(inputs[0]).toHaveValue("Ha Noi (HAN)");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(inputs[1]).toHaveValue("Da Nang (DAD)");
  });

  // TC ID: FLIGHT1-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "updates guest count after changing passenger numbers" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates guest count after changing passenger numbers", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<SearchBarSection />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("1 khách"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getAllByText("+")[1]);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(screen.getByText("2 khách")).toBeInTheDocument();
    });
  });

  // TC ID: TC_FLIGHT1_03

  // MỤC TIÊU: Kiểm tra kịch bản "shows search summary in alert when clicking search".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("shows search summary in alert when clicking search", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<SearchBarSection />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Tìm"));

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.alert).toHaveBeenCalled();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.alert.mock.calls[0][0]).toContain("From: Hồ Chí Minh (SGN)");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.alert.mock.calls[0][0]).toContain("To: Nhật Chiếu (RIZ)");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.alert.mock.calls[0][0]).toContain("Class: Phổ thông");
  });
});
