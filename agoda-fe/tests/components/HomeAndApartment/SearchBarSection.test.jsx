import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchBarSection from "src-under-test/components/HomeAndApartment/SearchBarSection";

jest.mock("@mui/icons-material", () => ({
  CalendarToday: () => <span>calendar</span>,
  People: () => <span>people</span>,
  Search: () => <span>search</span>,
}));

describe("HomeAndApartment SearchBarSection", () => {
  // TC ID: HOMEAPT-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "updates room and guest counts from the dropdown" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates room and guest counts from the dropdown", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<SearchBarSection />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("1 người lớn, 1 phòng"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getAllByText("+")[0]);
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getAllByText("+")[1]);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(screen.getByText((_, node) => node.textContent === "2 người lớn, 2 phòng")).toBeInTheDocument();
    });
  });

  // TC ID: HOMEAPT-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "updates the first selected date from the date picker" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates the first selected date from the date picker", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<SearchBarSection />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("22 tháng 8 2025"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("25"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(screen.getByText("25 tháng 8 2025")).toBeInTheDocument();
    });
  });
});
