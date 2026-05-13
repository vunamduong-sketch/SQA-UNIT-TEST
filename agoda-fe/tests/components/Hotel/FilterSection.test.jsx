import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FilterSection from "src-under-test/components/Hotel/FilterSection";

const mockCallFetchRoomQuery = jest.fn();
const mockCallFetchAmenities = jest.fn();

jest.mock("config/api", () => ({
  callFetchRoomQuery: (...args) => mockCallFetchRoomQuery(...args),
  callFetchAmenities: (...args) => mockCallFetchAmenities(...args),
}));

jest.mock("@mui/icons-material", () => ({
  Tune: () => <span>tune</span>,
}));

describe("Hotel FilterSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC ID: HOTEL-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads merged amenities from all rooms and supports show more" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads merged amenities from all rooms and supports show more", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchRoomQuery.mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }],
    });
    mockCallFetchAmenities
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ data: [{ id: 1, name: "Wifi" }, { id: 2, name: "TV" }, { id: 3, name: "Mini Bar" }, { id: 4, name: "Kitchen" }] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ data: [{ id: 5, name: "Pool" }, { id: 6, name: "Balcony" }, { id: 7, name: "Gym" }] });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FilterSection hotelId={99} />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Wifi")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Xem thêm 1 mục")).toBeInTheDocument();
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Xem thêm 1 mục"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Gym")).toBeInTheDocument();
  });

  // TC ID: HOTEL-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "toggles amenities and clears all filters" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("toggles amenities and clears all filters", async () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const onFilterChange = jest.fn();
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchRoomQuery.mockResolvedValue({
      data: [{ id: 1 }],
    });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchAmenities.mockResolvedValue({
      data: [{ id: 1, name: "Wifi" }, { id: 2, name: "TV" }],
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FilterSection hotelId={55} onFilterChange={onFilterChange} />);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const wifiButton = await screen.findByText("Wifi");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(wifiButton);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(onFilterChange).toHaveBeenCalledWith(["Wifi"]);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Xóa hết"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(onFilterChange).toHaveBeenLastCalledWith([]);
  });
});
