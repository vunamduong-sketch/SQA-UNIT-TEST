import React from "react";
import { render, screen, within } from "@testing-library/react";
import TopActivity from "src-under-test/components/Activity/TopActivity";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { fetchActivity } from "redux/slice/activitySlide";

// ============================================================
// TÊN FILE TEST: TopActivity.test.jsx
// MÔ TẢ: Kiểm tra section hoạt động hàng đầu: dispatch action lấy
//        recommended activities, render card từ Redux store, xử lý list rỗng
//        và ghi nhận edge case khi thiếu avg_price.
//        Test không phụ thuộc className/DOM nội bộ, chỉ kiểm tra behavior.
// ============================================================

const mockDispatch = jest.fn();

// Mock icon để tránh phụ thuộc package icon khi chạy unit test.
jest.mock(
  "react-icons/io",
  () => ({
    IoIosStar: () => <span aria-hidden="true">★</span>,
  }),
  { virtual: true }
);

jest.mock(
  "react-icons/bs",
  () => ({
    BsLightningChargeFill: () => <span aria-hidden="true">⚡</span>,
  }),
  { virtual: true }
);

// Mock Tag của antd thành span để vẫn giữ text user nhìn thấy.
jest.mock("antd", () => ({
  Tag: ({ children }) => <span>{children}</span>,
}));

// Mock Link thành thẻ a để assert href điều hướng activity detail.
jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }),
  { virtual: true }
);

// Helper render component với Redux store giả theo từng test case.
const renderWithActivities = (activities) => {
  useAppDispatch.mockReturnValue(mockDispatch);
  useAppSelector.mockImplementation((selector) =>
    selector({ activity: { data: activities } })
  );
  fetchActivity.mockReturnValue({ type: "activity/fetchActivity" });

  return render(<TopActivity />);
};

describe("TopActivity", () => {
  // --- Setup chung ---
  beforeEach(() => {
    // Xóa toàn bộ mock trước mỗi test để tránh call count bị cộng dồn.
    jest.clearAllMocks();
    // Thiết lập URL ảnh giả để component build src ảnh ổn định.
    process.env.REACT_APP_BE_URL = "https://cdn.example.test";
  });

  // TC ID: ACT-TC-005
  // MỤC TIÊU: Khi component mount, nó phải dispatch fetchActivity với query
  //           recommended=true để lấy danh sách hoạt động được đề xuất.
  // LÝ DO: Nếu không gọi đúng query, user sẽ không thấy đúng nhóm hoạt động nổi bật.
  it("requests the first page of recommended activities when mounted", () => {
    renderWithActivities([]);

    // Expected: action creator nhận đúng query string theo specification.
    expect(fetchActivity).toHaveBeenCalledWith({
      query: "current=1&pageSize=10&recommended=true",
    });

    // Expected: dispatch thực sự được gọi với action trả về từ fetchActivity.
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "activity/fetchActivity",
    });
  });

  // TC ID: ACT-TC-006
  // MỤC TIÊU: Render card activity với tên, sao, giá và link detail từ store.
  // LÝ DO: Đây là thông tin chính giúp user quyết định click xem chi tiết hoạt động.
  it("renders activity cards with user-visible details from store data", () => {
    // Input: Redux store có 2 activities hợp lệ.
    renderWithActivities([
      {
        id: 11,
        name: "Bà Nà Hills",
        avg_star: 4.5,
        avg_price: 1200000,
        images: [{ image: "/bana.jpg" }],
      },
      {
        id: 12,
        name: "Du thuyền sông Hàn",
        avg_star: 4.2,
        avg_price: 350000,
        images: [{ image: "/han-river.jpg" }],
      },
    ]);

    // Expected: Heading section hiển thị đúng.
    expect(
      screen.getByRole("heading", {
        name: "Các hoạt động hàng đầu gần quý khách",
      })
    ).toBeInTheDocument();

    // Expected: Card Bà Nà Hills là link tới trang detail đúng id.
    const banaLink = screen.getByRole("link", { name: /Bà Nà Hills/i });
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(banaLink).toHaveAttribute("href", "/activity/detail/11");

    // Expected: Trong card có điểm sao và giá đã format để user đọc được.
    expect(within(banaLink).getByText("4.5")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(within(banaLink).getByText(/1\.200\.000\s*₫/)).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(within(banaLink).getByText("1.200.000")).toBeInTheDocument();

    // Expected: Activity thứ hai cũng điều hướng đúng detail path.
    expect(
      screen.getByRole("link", { name: /Du thuyền sông Hàn/i })
    ).toHaveAttribute("href", "/activity/detail/12");
  });

  // TC ID: ACT-TC-007
  // MỤC TIÊU: Khi store data rỗng, component không crash và không render link giả.
  // LÝ DO: Trạng thái chưa có dữ liệu là tình huống phổ biến trong thực tế.
  it("renders an empty section without crashing when there are no activities", () => {
    // Expected: Render list rỗng không throw exception.
    expect(() => renderWithActivities([])).not.toThrow();

    // Expected: Không có link activity nào khi data=[].
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    // Expected: Swiper container vẫn render để layout section không biến mất.
    expect(screen.getByTestId("swiper")).toBeInTheDocument();
  });

  // TC ID: ACT-TC-008
  // MỤC TIÊU: Ghi nhận robustness gap hiện tại — khi activity thiếu avg_price,
  //           component throw do gọi toFixed trên undefined.
  // LÝ DO: Test này document edge case để dễ phát hiện khi component được fix sau này.
  it("exposes a robustness gap when activity price is missing", () => {
    // Input: Activity thiếu avg_price.
    // Expected: Hành vi hiện tại là throw, đúng với scope plan ACT-TC-008.
    expect(() =>
      renderWithActivities([
        {
          id: 99,
          name: "Activity thiếu giá",
          avg_star: 4,
          images: [],
        },
      ])
    ).toThrow();
  });
});
