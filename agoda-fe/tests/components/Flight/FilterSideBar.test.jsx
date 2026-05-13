import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FilterSideBar from "src-under-test/components/Flight/FilterSideBar";

const mockGetAirlines = jest.fn();
const mockSetSearchParams = jest.fn();
const mockSearchParams = new URLSearchParams("origin=1&destination=2&departureDate=2026-05-01&passengers=2&seatClass=economy&tripType=one-way");

jest.mock("config/api", () => ({
  getAirlines: (...args) => mockGetAirlines(...args),
}));

jest.mock("react-router-dom", () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}), { virtual: true });

describe("Flight FilterSideBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAirlines.mockResolvedValue({
      data: [
        { id: 1, name: "Vietnam Airlines" },
        { id: 2, name: "VietJet Air" },
        { id: 3, name: "Bamboo Airways" },
        { id: 4, name: "Pacific Airlines" },
      ],
    });
  });

  // TC ID: FLIGHT-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads airlines and expands the airline list" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads airlines and expands the airline list", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FilterSideBar />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Vietnam Airlines")).toBeInTheDocument();
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Hiện tất cả 4 hãng hàng không"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Pacific Airlines")).toBeInTheDocument();
  });

  // TC ID: TC_FLIGHT_05

  // MỤC TIÊU: Kiểm tra kịch bản "updates search params and callback when selecting baggage and airline filters".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("updates search params and callback when selecting baggage and airline filters", async () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const onFilterChange = jest.fn();
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FilterSideBar onFilterChange={onFilterChange} />);

    await screen.findByText("Vietnam Airlines");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByLabelText("Đã gồm hành lý ký gửi"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByLabelText("Vietnam Airlines"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockSetSearchParams).toHaveBeenCalled();
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(onFilterChange).toHaveBeenCalled();
    });

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const lastCall = mockSetSearchParams.mock.calls.at(-1)[0];
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(lastCall.get("baggageIncluded")).toBe("true");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(lastCall.getAll("airlines[]")).toContain("1");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(lastCall.get("origin")).toBe("1");
  });
});
