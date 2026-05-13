import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HotelCard from "src-under-test/components/Search/HotelCard";
import { getImageUrl } from "config/api";

// ============================================================
// TÊN FILE TEST: HotelCard.test.jsx
// MÔ TẢ: Kiểm tra card khách sạn trong trang Search theo hành vi
//        người dùng nhìn thấy: thông tin khách sạn, giá, tiện nghi,
//        ảnh và điều hướng sang trang chi tiết kèm query search.
//        Test dựa trên specification/user-facing behavior, không kiểm tra
//        className hoặc cấu trúc JSX nội bộ.
// ============================================================

const mockNavigate = jest.fn();

// Mock API build URL ảnh để test chỉ kiểm tra contract gọi ảnh, không phụ thuộc CDN thật.
jest.mock("config/api", () => ({
  getImageUrl: jest.fn(),
}));

// Mock điều hướng để verify URL user sẽ được chuyển tới khi bấm "Xem phòng".
jest.mock(
  "react-router-dom",
  () => ({
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

// Mock icon để tránh phụ thuộc UI icon khi chạy unit test.
jest.mock("@ant-design/icons", () => ({
  HeartOutlined: () => null,
  WifiOutlined: () => null,
  CarOutlined: () => null,
  EnvironmentOutlined: () => null,
  HomeOutlined: () => null,
  SoundOutlined: () => null,
  RestOutlined: () => null,
  FireOutlined: () => null,
}));

// Mock Ant Design thành semantic HTML đơn giản để query theo text/button như user.
jest.mock("antd", () => ({
  Tooltip: ({ children }) => <div>{children}</div>,
  Card: ({ children }) => <div>{children}</div>,
  Rate: ({ defaultValue }) => <div>{defaultValue} stars</div>,
  Button: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Tag: ({ children }) => <span>{children}</span>,
  Badge: ({ children }) => <div>{children}</div>,
  Image: ({ src, alt }) => <img src={src} alt={alt} />,
}));

describe("HotelCard", () => {
  // --- Setup chung ---
  beforeEach(() => {
    // Xóa mock trước mỗi test để call count/URL điều hướng không bị ảnh hưởng chéo.
    jest.clearAllMocks();
    // Thiết lập URL ảnh giả mà component sẽ nhận từ getImageUrl.
    getImageUrl.mockReturnValue("https://cdn.example/hotel.jpg");
  });

  // TC ID: SEARCH-TC-007
  // MỤC TIÊU: Kiểm tra HotelCard hiển thị thông tin user-facing quan trọng:
  //           tên khách sạn, giá đã format, tóm tắt tiện nghi và ảnh.
  // LÝ DO: Đây là dữ liệu chính giúp user so sánh khách sạn trong search result.
  it("SEARCH-TC-007 - renders hotel information and summarizes extra amenities", () => {
    // Input: Hotel có đầy đủ thông tin và 6 tiện nghi, trong đó chỉ hiện 4 tiện nghi đầu.
    render(
      <HotelCard
        hotel={{
          id: 12,
          name: "Khách sạn Đà Lạt View",
          avg_star: 4,
          review_count: 128,
          location: "Đà Lạt",
          min_price: "2500000",
          images: [{ image: "/hotel.jpg" }],
          amenitiesAndFacilities: "WiFi, Parking, Spa, Gym, Bar, Pool",
          mostFeature: "Feature",
          facilities: "Facilities",
          regulation: "Regulation",
          withUs: "With us",
        }}
      />
    );

    // Expected: Tên khách sạn hiển thị đúng để user nhận diện kết quả.
    expect(screen.getByText("Khách sạn Đà Lạt View")).toBeInTheDocument();

    // Expected: Giá được format theo chuẩn vi-VN và kèm đơn vị VND.
    expect(screen.getByText("2.500.000 VND")).toBeInTheDocument();

    // Expected: Khi có hơn 4 tiện nghi, card hiển thị số tiện nghi còn lại.
    expect(screen.getByText("+2 tiện nghi")).toBeInTheDocument();

    // Expected: Ảnh khách sạn được build từ path backend thông qua getImageUrl.
    expect(getImageUrl).toHaveBeenCalledWith("/hotel.jpg");
  });

  // TC ID: SEARCH-TC-008
  // MỤC TIÊU: Khi user bấm "Xem phòng", component điều hướng đến trang detail
  //           với slug khách sạn và toàn bộ search params hiện tại.
  // LÝ DO: Nếu thiếu params, trang detail sẽ mất ngày, số khách/phòng hoặc loại lưu trú.
  it("SEARCH-TC-008 - navigates to the hotel detail page with search parameters", () => {
    // Input: Hotel và các search params đang được truyền từ trang Search.
    render(
      <HotelCard
        hotel={{
          id: 77,
          name: "Khách sạn Đà Nẵng",
          avg_star: 5,
          review_count: 99,
          location: "Đà Nẵng",
          min_price: "1800000",
          images: [{ image: "/hotel.jpg" }],
          amenitiesAndFacilities: "WiFi, Parking",
        }}
        startDate="2026-05-01"
        endDate="2026-05-03"
        adult={2}
        child={1}
        room={1}
        stay_type="overnight"
      />
    );

    // Action: User bấm nút xem phòng trên card.
    fireEvent.click(screen.getByRole("button", { name: "Xem phòng" }));

    // Expected: Điều hướng đúng slug không dấu và giữ đầy đủ query params.
    expect(mockNavigate).toHaveBeenCalledWith(
      "/hotel/khach-san-da-nang-77?startDate=2026-05-01&endDate=2026-05-03&adult=2&child=1&room=1&stay_type=overnight"
    );
  });
});
