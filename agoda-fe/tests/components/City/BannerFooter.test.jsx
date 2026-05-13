import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Banner from "src-under-test/components/City/Banner";

// ============================================================
// TÊN FILE TEST: BannerFooter.test.jsx
// MÔ TẢ CHUNG:
// - File này chỉ giữ 1 test quan trọng cho City Banner.
// - Mục tiêu là kiểm tra hành vi user-facing chính:
//   user mở ô tìm kiếm trên banner và có thể đóng lại bằng backdrop.
// - Footer không test riêng ở đây để tránh test quá nhiều chi tiết phụ.
//   Phần Footer chủ yếu render link từ API, ít critical hơn luồng tìm kiếm.
// ============================================================

// Mock SearchBar để test Banner một cách độc lập.
// Lý do:
// - Banner chỉ chịu trách nhiệm quản lý activeInput và backdrop.
// - Logic chi tiết của SearchBar thuộc component khác, không nên kéo vào test này.
// - Mock này mô phỏng đúng hành vi user cần: mở search và đóng search.
jest.mock("src-under-test/components/Search/SearchBar", () => ({
  __esModule: true,
  default: ({ activeInput, setActiveInput, handleBackdropClick }) => (
    <div>
      <button onClick={() => setActiveInput("destination")}>Open search</button>
      <span>{activeInput || "closed"}</span>
      <button onClick={handleBackdropClick}>Close search</button>
    </div>
  ),
}));

// Banner import getImage từ utils/imageUrl.
// Mock virtual để Jest không phụ thuộc cấu hình alias thật khi chạy unit test cô lập.
jest.mock("utils/imageUrl", () => ({
  getImage: jest.fn((value) => value),
}), { virtual: true });

describe("City Banner", () => {
  beforeEach(() => {
    // Xóa mock trước mỗi test để tránh state của test trước ảnh hưởng test sau.
    jest.clearAllMocks();
  });

  // TC ID: CITY-TC-001
  // MỤC TIÊU:
  // - Kiểm tra Banner hiển thị heading chính cho trang City.
  // - Kiểm tra khi user mở SearchBar thì backdrop xuất hiện.
  // - Kiểm tra khi click backdrop thì trạng thái search được đóng lại.
  //
  // LÝ DO TEST CASE NÀY QUAN TRỌNG:
  // - Banner là điểm user tương tác đầu tiên trên trang City.
  // - Nếu backdrop không đóng được, user có thể bị kẹt ở trạng thái overlay.
  // - Đây là behavior nhìn thấy trực tiếp, không phụ thuộc implementation nội bộ.
  //
  // INPUT:
  // - Render Banner với city có image và name.
  // - Click button mock "Open search" để mở search.
  // - Click backdrop để đóng search.
  //
  // EXPECTED OUTPUT:
  // - Heading "Khách sạn và nơi để ở" hiển thị.
  // - Sau khi mở search, trạng thái activeInput là "destination".
  // - Sau khi click backdrop, trạng thái quay về "closed".
  // TC ID: CITY-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "CITY-TC-001 - renders banner search overlay and closes it by backdrop" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("CITY-TC-001 - renders banner search overlay and closes it by backdrop", () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const { container } = render(
      <Banner city={{ image: "/uploads/city.jpg", name: "Da Nang" }} />
    );

    // Kiểm tra heading chính mà user nhìn thấy trên banner.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Khách sạn và nơi để ở")).toBeInTheDocument();

    // Mô phỏng user mở khu vực tìm kiếm điểm đến.
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Open search"));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("destination")).toBeInTheDocument();

    // Backdrop chỉ xuất hiện khi activeInput khác null.
    // Click backdrop để đảm bảo user có thể đóng overlay.
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(container.querySelector('[data-selenium="backdrop"]'));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("closed")).toBeInTheDocument();
  });
});
