import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import TopHotel from "src-under-test/components/City/TopHotel/index";

// ============================================================
// TÊN FILE TEST: TopHotel.test.jsx
// MÔ TẢ CHUNG:
// - File này chỉ giữ 1 test trọng tâm cho TopHotel.
// - Test kiểm tra luồng quan trọng nhất: khi vào trang City,
//   component gọi API lấy khách sạn đúng cityId và render hotel nhận được.
// - Không test quá nhiều filter/pagination/error ở file này để bộ test gọn.
// ============================================================

const mockCallFetchHotel = jest.fn();

// Mock API để kiểm soát data trả về và verify tham số component gửi lên.
jest.mock("config/api", () => ({
  callFetchHotel: (...args) => mockCallFetchHotel(...args),
}));

// Mock route param vì TopHotel lấy cityId từ URL bằng useParams().
// Với test này, cityId cố định là "2" để assertion ổn định.
jest.mock("react-router-dom", () => ({
  useParams: () => ({ cityId: "2" }),
}), { virtual: true });

jest.mock("utils/slugHelpers", () => ({
  createHotelSlug: (name, id) => `${name}-${id}`,
}), { virtual: true });

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value || "fallback.jpg",
}), { virtual: true });

jest.mock("constants/hotel", () => ({
  RANGE_PRICE_HOTEL: 100000,
}), { virtual: true });

// Mock antd để tránh phụ thuộc UI library trong unit test.
// Test chỉ cần biết loading/empty/pagination có render được, không cần style thật.
jest.mock("antd", () => {
  const React = require("react");
  const Empty = ({ description }) => <div>{description}</div>;
  Empty.PRESENTED_IMAGE_SIMPLE = "empty";
  return {
    Empty,
    Pagination: ({ current, total }) => <div>{`pagination-${current}-${total}`}</div>,
    Slider: ({ value, onChange }) => (
      <input
        aria-label="price-slider"
        value={value.join(",")}
        onChange={() => onChange?.([0, 50])}
      />
    ),
    Spin: () => <div>Loading...</div>,
    message: { error: jest.fn() },
  };
});

// Mock các component con để test TopHotel ở mức container.
// Nhờ vậy test tập trung vào API + render data, không bị nhiễu bởi UI chi tiết.
jest.mock("src-under-test/components/City/TopHotel/FilterGroup", () => ({
  __esModule: true,
  default: ({ title }) => <div>{title}</div>,
}));

jest.mock("src-under-test/components/City/TopHotel/SortBar", () => ({
  __esModule: true,
  default: ({ sorts }) => (
    <div>{sorts.map((sort) => <button key={sort.value}>{sort.label}</button>)}</div>
  ),
}));

jest.mock("src-under-test/components/City/TopHotel/HotelCard", () => ({
  __esModule: true,
  default: ({ hotel }) => <div>{hotel.name}</div>,
}));

describe("City TopHotel", () => {
  beforeEach(() => {
    // Reset mock để đảm bảo số lần gọi API không bị cộng dồn giữa các test.
    jest.clearAllMocks();
  });

  // TC ID: CITY-TC-002
  // MỤC TIÊU:
  // - Kiểm tra TopHotel gọi API lấy danh sách khách sạn theo đúng cityId.
  // - Kiểm tra dữ liệu khách sạn từ API được render ra UI.
  //
  // LÝ DO TEST CASE NÀY QUAN TRỌNG:
  // - Đây là chức năng cốt lõi của trang City: hiển thị khách sạn theo thành phố.
  // - Nếu gọi sai cityId hoặc không render data, user sẽ thấy sai danh sách hotel.
  // - Test này kiểm tra behavior từ góc nhìn user/API contract, không kiểm tra state nội bộ.
  //
  // INPUT:
  // - URL param cityId = "2".
  // - API callFetchHotel trả về 1 khách sạn tên "Hotel A".
  //
  // EXPECTED OUTPUT:
  // - callFetchHotel được gọi với cityId="2", current=1, pageSize=10,
  //   recommended=true và khoảng giá mặc định.
  // - Tên khách sạn "Hotel A" hiển thị trên màn hình.
  // TC ID: CITY-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "CITY-TC-002 - fetches hotels for the city and renders returned hotel" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("CITY-TC-002 - fetches hotels for the city and renders returned hotel", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchHotel.mockResolvedValue({
      isSuccess: true,
      data: [
        {
          id: 1,
          name: "Hotel A",
          images: [{ image: "/hotel-a.jpg" }],
          avg_star: 4.5,
          location: "Da Nang",
          facilities: "<table><tr><td>Pool</td><td>Wifi</td></tr></table>",
          best_comment: "Rat tot",
          review_count: 10,
          min_price: 1500000,
          city: { id: 2, name: "Da Nang" },
        },
      ],
      meta: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 1,
        totalPages: 1,
      },
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TopHotel />);

    // Chờ useEffect gọi API, sau đó kiểm tra request params quan trọng.
    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() =>
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHotel).toHaveBeenCalledWith(
        expect.objectContaining({
          cityId: "2",
          current: 1,
          pageSize: 10,
          recommended: true,
          min_avg_price: 0,
          max_avg_price: 10000000,
        })
      )
    );

    // Kiểm tra dữ liệu hotel user nhìn thấy đã được render.
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Hotel A")).toBeInTheDocument();
  });
});
