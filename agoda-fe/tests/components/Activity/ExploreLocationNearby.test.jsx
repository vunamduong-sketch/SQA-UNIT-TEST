import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import ExploreLocationNearby from "src-under-test/components/Activity/ExploreLocationNearby";
import { getTopVietNamHotel } from "config/api";

// ============================================================
// TÊN FILE TEST: ExploreLocationNearby.test.jsx
// MÔ TẢ: Kiểm tra section khám phá địa điểm xung quanh: gọi API
//        lấy danh sách city, render link điều hướng, và xử lý lỗi API.
//        Test tập trung vào output user nhìn thấy và contract API mong đợi.
// ============================================================

// Mock Link thành thẻ a để kiểm tra href giống hành vi điều hướng thực tế.
jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }),
  { virtual: true }
);

describe("ExploreLocationNearby", () => {
  // --- Setup chung ---
  beforeEach(() => {
    // Xóa mock để mỗi TC có dữ liệu API độc lập, tránh ảnh hưởng chéo.
    jest.clearAllMocks();
    // Thiết lập CDN giả để component build URL ảnh không bị undefined.
    process.env.REACT_APP_BE_URL = "https://cdn.example.test";
  });

  // TC ID: ACT-TC-002
  // MỤC TIÊU: Kiểm tra component gọi API với limit=50 và render city card
  //           có link đúng định dạng /activity/city/:id.
  // LÝ DO: User cần thấy các địa điểm có thể click để đi tới trang city.
  it("loads nearby locations and renders navigable city cards", async () => {
    // Input: API thành công trả về 2 city đại diện.
    getTopVietNamHotel.mockResolvedValue({
      isSuccess: true,
      data: [
        { id: 1, name: "Đà Nẵng", image: "/danang.jpg" },
        { id: 2, name: "Hà Nội", image: "/hanoi.jpg" },
      ],
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ExploreLocationNearby />);

    // Expected: Heading section luôn hiển thị trước/sau khi API hoàn tất.
    expect(
      screen.getByRole("heading", { name: "Khám phá các địa điểm xung quanh" })
    ).toBeInTheDocument();

    // Expected: API được gọi đúng contract limit=50 theo scope plan.
    await waitFor(() =>
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(getTopVietNamHotel).toHaveBeenCalledWith({ limit: 50 })
    );

    // Expected: City Đà Nẵng render thành link điều hướng đúng path.
    expect(await screen.findByRole("link", { name: /Đà Nẵng/i })).toHaveAttribute(
      "href",
      "/activity/city/1"
    );

    // Expected: City Hà Nội cũng có link riêng theo id trả về từ API.
    expect(await screen.findByRole("link", { name: /Hà Nội/i })).toHaveAttribute(
      "href",
      "/activity/city/2"
    );
  });

  // TC ID: ACT-TC-003
  // MỤC TIÊU: Khi API trả isSuccess=false, component không được render data
  //           trong response để tránh hiển thị dữ liệu stale/không hợp lệ.
  // LÝ DO: User chỉ nên thấy dữ liệu đã được backend xác nhận thành công.
  it("does not render stale data when API response is unsuccessful", async () => {
    // Input: API thất bại nhưng vẫn có data trong payload.
    getTopVietNamHotel.mockResolvedValue({
      isSuccess: false,
      data: [{ id: 1, name: "Đà Nẵng", image: "/danang.jpg" }],
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ExploreLocationNearby />);

    // Expected: API đã chạy xong để assertion không bị race condition.
    await waitFor(() => expect(getTopVietNamHotel).toHaveBeenCalledTimes(1));

    // Expected: Không render link city khi isSuccess=false.
    expect(screen.queryByRole("link", { name: /Đà Nẵng/i })).not.toBeInTheDocument();
  });

  // TC ID: ACT-TC-004
  // MỤC TIÊU: Khi network/API reject, page không crash; section heading vẫn
  //           hiển thị và không có link dữ liệu lỗi.
  // LÝ DO: Lỗi backend không nên làm hỏng toàn bộ trải nghiệm trang Activity.
  it("keeps the page usable when the API call fails", async () => {
    // Ẩn console.error có chủ đích để output test sạch hơn.
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    // Arrange: gia lap API bi loi de kiem tra nhanh xu ly loi cua component.
    getTopVietNamHotel.mockRejectedValue(new Error("Network error"));

    // Expected: Render component không throw dù API reject trong effect.
    expect(() => render(<ExploreLocationNearby />)).not.toThrow();

    // Expected: API đã được gọi đúng một lần.
    await waitFor(() => expect(getTopVietNamHotel).toHaveBeenCalledTimes(1));

    // Expected: Heading vẫn có mặt để page còn usable.
    expect(
      screen.getByRole("heading", { name: "Khám phá các địa điểm xung quanh" })
    ).toBeInTheDocument();

    // Expected: Không có link city nào khi fetch thất bại.
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
