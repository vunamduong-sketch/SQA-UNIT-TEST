import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HotelCard from "src-under-test/components/City/TopHotel/HotelCard";

// ============================================================
// TÊN FILE TEST: TopHotelChildren.test.jsx
// MÔ TẢ CHUNG:
// - File này chỉ giữ test cho HotelCard vì đây là phần user nhìn thấy rõ nhất
//   trong danh sách khách sạn của trang City.
// - Không test riêng FilterGroup và SortBar để tránh quá nhiều test nhỏ.
// - Giữ 1 case pass cho hành vi mở rộng review và 1 case fail có chủ đích
//   để document lỗi robustness khi API trả thiếu field facilities.
// ============================================================

jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock("@ant-design/icons", () => ({
  EnvironmentOutlined: () => <span />,
}));

jest.mock("react-icons/fa", () => ({
  FaStar: () => <span>*</span>,
}));

jest.mock("utils/formatCurrency", () => ({
  formatCurrency: (value) => value,
}), { virtual: true });

// Dữ liệu hotel hợp lệ dùng chung cho các test.
// Các field được chọn theo đúng những gì user sẽ thấy trên card:
// tên hotel, sao, thành phố, tiện ích, review, rating, giá và ảnh.
const validHotel = {
  slug: "hotel-a-1",
  image: "/hotel.jpg",
  name: "Hotel A",
  englishName: "Hotel A EN",
  stars: 4,
  city: { id: 2, name: "Da Nang" },
  mapUrl: "https://maps.google.com/?q=1,2",
  facilities: ["Pool", "Wifi"],
  review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(6),
  ratingText: "Tuyệt hảo",
  ratingCount: 22,
  rating: "9.0",
  price: 1500000,
  thumbnails: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg", "/7.jpg", "/8.jpg"],
};

describe("City HotelCard", () => {
  // TC ID: CITY-TC-003
  // MỤC TIÊU:
  // - Kiểm tra HotelCard hiển thị tên khách sạn.
  // - Kiểm tra review dài được rút gọn ban đầu và có thể mở rộng khi user click.
  //
  // LÝ DO TEST CASE NÀY QUAN TRỌNG:
  // - HotelCard là thành phần chính user dùng để xem và chọn khách sạn.
  // - Review dài nếu không có nút mở rộng sẽ làm UI khó đọc.
  // - Đây là hành vi trực tiếp user thao tác, nên đáng giữ lại dù bộ test rút gọn.
  //
  // INPUT:
  // - Render HotelCard với hotel hợp lệ.
  // - Review dài hơn 180 ký tự.
  // - User click button "Xem thêm ▼".
  //
  // EXPECTED OUTPUT:
  // - Tên "Hotel A" hiển thị.
  // - Sau khi click, button đổi thành "Ẩn ▲", chứng tỏ review đã mở rộng.
  // TC ID: CITY-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "CITY-TC-003 - toggles the long review in the hotel card" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("CITY-TC-003 - toggles the long review in the hotel card", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<HotelCard hotel={validHotel} />);

    // Tên khách sạn là thông tin quan trọng nhất trên card.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Hotel A")).toBeInTheDocument();

    // User click để xem đầy đủ review dài.
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByRole("button", { name: "Xem thêm ▼" }));

    // Khi mở rộng thành công, nút đổi sang trạng thái thu gọn.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByRole("button", { name: "Ẩn ▲" })).toBeInTheDocument();
  });

  // TC ID: CITY-TC-004
  // MỤC TIÊU:
  // - Phát hiện lỗi robustness khi dữ liệu hotel từ API thiếu field facilities.
  // - Theo góc nhìn user, card vẫn nên hiển thị được tên hotel thay vì crash toàn trang.
  //
  // LÝ DO TEST CASE NÀY ĐƯỢC GIỮ DÙ FAIL:
  // - API thực tế có thể trả thiếu field hoặc field null.
  // - Nếu component crash, user không thể xem danh sách khách sạn.
  // - Đây là lỗi có giá trị báo cáo, không phải test thừa.
  //
  // INPUT:
  // - Hotel object giống validHotel nhưng bị xóa field facilities.
  //
  // EXPECTED OUTPUT THEO SPEC:
  // - Component không throw error.
  // - Tên "Hotel A" vẫn hiển thị.
  //
  // ACTUAL OUTPUT HIỆN TẠI:
  // - Test FAIL vì HotelCard gọi hotel.facilities.map trực tiếp.
  // - Lỗi nhận được: TypeError: Cannot read properties of undefined (reading 'map').
  // TC ID: CITY-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "CITY-TC-004 - should not crash when hotel facilities are missing" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("CITY-TC-004 - should not crash when hotel facilities are missing", () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const hotelWithoutFacilities = { ...validHotel };
    delete hotelWithoutFacilities.facilities;

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    expect(() => render(<HotelCard hotel={hotelWithoutFacilities} />)).not.toThrow();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Hotel A")).toBeInTheDocument();
  });
});
