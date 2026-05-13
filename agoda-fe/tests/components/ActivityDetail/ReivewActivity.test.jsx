import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReviewActivity from "src-under-test/components/ActivityDetail/ReivewActivity";
import { callCreateReview, callFetchReview } from "config/api";
import { toast } from "react-toastify";

// ============================================================
// TÊN FILE TEST: ReivewActivity.test.jsx
// MỤC ĐÍCH:
// - Kiểm thử review section trong Activity Detail.
// - Giữ số lượng test vừa phải: fetch empty state, validate form, create review,
//   và 1 expected fail để ghi nhận bug thật về API error handling.
// - Test ưu tiên behavior user-facing và API contract thay vì implementation detail.
// LƯU Ý:
// - Tên source file hiện là "ReivewActivity" theo codebase, không tự sửa chính tả
//   để tránh lệch import path hiện tại.
// ============================================================

// Mock user đăng nhập để form review được hiển thị.
// Nếu user.id không > 0, component sẽ không render form submit review.
jest.mock("redux/hooks", () => ({
  useAppSelector: jest.fn((selector) =>
    selector({
      account: {
        user: { id: 1, first_name: "A", last_name: "B" },
      },
    })
  ),
}));

// Mock review APIs.
// callFetchReview dùng để load danh sách review.
// callCreateReview dùng khi user gửi đánh giá mới.
// callDeleteReview/callUpdateReview vẫn mock để component import không lỗi,
// dù bộ test rút gọn hiện không kiểm tra edit/delete.
jest.mock("config/api", () => ({
  callFetchReview: jest.fn(),
  callDeleteReview: jest.fn(),
  callUpdateReview: jest.fn(),
  callCreateReview: jest.fn(),
}));

// Mock service type để query review dùng service_type=2 cho ACTIVITY.
jest.mock("constants/serviceType", () => ({ ServiceType: { ACTIVITY: 2 } }), { virtual: true });

// Mock toast để kiểm tra validation error mà không cần render toast container thật.
jest.mock("react-toastify", () => ({ toast: { error: jest.fn() } }));

// Mock avatar util và router params.
// activityId=10 là input chính để verify query string callFetchReview/callCreateReview.
jest.mock("utils/imageUrl", () => ({ getUserAvatar: jest.fn(() => "avatar") }), { virtual: true });
jest.mock("react-router-dom", () => ({ useParams: () => ({ activityId: "10" }) }), { virtual: true });
jest.mock("@ant-design/icons", () => ({ SendOutlined: () => null, EditOutlined: () => null, DeleteOutlined: () => null }));

// Mock Ant Design components bằng HTML đơn giản:
// - Rate không disabled render thành button "Set Rating" để test click chọn 5 sao.
// - TextArea render textarea thật để fireEvent.change nhập comment.
// - Empty render description để assert empty state.
// - Modal/Popconfirm/Pagination mock tối giản vì không phải trọng tâm test rút gọn.
jest.mock("antd", () => {
  const Button = ({ children, onClick, loading }) => (
    <button onClick={onClick} disabled={loading}>{children}</button>
  );
  const TextArea = ({ value, onChange, placeholder }) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} />
  );

  return {
    Rate: ({ value = 0, onChange, disabled }) =>
      disabled ? <div>{value} stars</div> : <button onClick={() => onChange(5)}>Set Rating</button>,
    Input: { TextArea },
    Button,
    Avatar: ({ children }) => <div>{children}</div>,
    Empty: ({ description }) => <div>{description}</div>,
    Modal: ({ children, open }) => (open ? <div>{children}</div> : null),
    Popconfirm: ({ children }) => <div>{children}</div>,
    Space: ({ children }) => <div>{children}</div>,
    Pagination: () => <div>Pagination</div>,
    Spin: ({ children }) => <div>{children}</div>,
  };
});

describe("ReviewActivity", () => {
  beforeEach(() => {
    // Reset mock để test không bị phụ thuộc số lần gọi API từ case trước.
    jest.clearAllMocks();

    // Response mặc định: fetch review thành công nhưng chưa có review nào.
    // Đây là trạng thái phổ biến và dùng cho TC-007, TC-008, TC-009.
    callFetchReview.mockResolvedValue({
      isSuccess: true,
      data: [],
      meta: { totalItems: 0, totalPages: 1 },
    });

    // Mặc định create review thành công để test submit valid không bị lỗi API.
    callCreateReview.mockResolvedValue({ isSuccess: true });
  });

  // TC ID: ACTDETAIL-TC-007
  // MỤC TIÊU: Fetch review đúng activityId và hiển thị empty state.
  // INPUT:
  // - URL param activityId = 10.
  // - callFetchReview trả về isSuccess=true, data=[].
  // EXPECTED OUTPUT:
  // - API được gọi với query current=1&pageSize=10&service_type=2&service_ref_id=10.
  // - User nhìn thấy "Chưa có đánh giá nào".
  // LÝ DO TEST: Đảm bảo review section gắn đúng Activity hiện tại và xử lý danh sách rỗng.
  it("ACTDETAIL-TC-007 - fetches activity reviews and shows empty state", async () => {
    render(<ReviewActivity activity={{ avg_star: 4.5 }} />);

    await waitFor(() =>
      expect(callFetchReview).toHaveBeenCalledWith(
        "current=1&pageSize=10&service_type=2&service_ref_id=10"
      )
    );
    expect(screen.getByText("Chưa có đánh giá nào")).toBeInTheDocument();
  });

  // TC ID: ACTDETAIL-TC-008
  // MỤC TIÊU: Submit review rỗng báo lỗi validation và không gọi API create.
  // INPUT: User click "Gửi đánh giá" khi chưa chọn rating và chưa nhập comment.
  // EXPECTED OUTPUT:
  // - toast.error được gọi.
  // - callCreateReview không được gọi.
  // LÝ DO TEST: Chặn dữ liệu rỗng trước khi gửi lên backend.
  it("ACTDETAIL-TC-008 - shows validation error when submitting an empty review", () => {
    render(<ReviewActivity activity={{ avg_star: 4.5 }} />);

    fireEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    expect(toast.error).toHaveBeenCalled();
    expect(callCreateReview).not.toHaveBeenCalled();
  });

  // TC ID: ACTDETAIL-TC-009
  // MỤC TIÊU: User nhập rating/comment hợp lệ thì create review.
  // INPUT:
  // - User chọn rating 5 sao qua mock button "Set Rating".
  // - User nhập comment "Amazing trip".
  // - User click "Gửi đánh giá".
  // EXPECTED OUTPUT: callCreateReview được gọi với service_type, activityId, rating và comment đúng.
  // LÝ DO TEST: Đây là happy path chính của tính năng gửi review.
  it("ACTDETAIL-TC-009 - creates a review when rating and comment are provided", async () => {
    render(<ReviewActivity activity={{ avg_star: 4.5 }} />);

    fireEvent.click(screen.getByText("Set Rating"));
    fireEvent.change(screen.getByPlaceholderText("Chia sẻ trải nghiệm của bạn về khách sạn..."), {
      target: { value: "Amazing trip" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));

    await waitFor(() =>
      expect(callCreateReview).toHaveBeenCalledWith({
        service_type: 2,
        service_ref_id: "10",
        rating: 5,
        comment: "Amazing trip",
      })
    );
  });

  // TC ID: ACTDETAIL-TC-010
  // MỤC TIÊU: Khi review API lỗi, page vẫn nên không crash và hiển thị empty/error-safe state.
  // INPUT: callFetchReview bị reject với Network error.
  // EXPECTED OUTPUT THEO YÊU CẦU SẢN PHẨM:
  // - Component không crash.
  // - Review section vẫn ổn định, có thể hiển thị empty state hoặc error state thân thiện.
  // RESULT HIỆN TẠI: FAIL CÓ CHỦ ĐÍCH.
  // NOTES KHI BÁO CÁO:
  // - ReviewActivity hiện chưa try/catch lỗi callFetchReview rejected.
  // - Jest hiển thị "Network error" vì component để unhandled promise rejection.
  // - Đây là fail thật để document robustness gap, không phải fail giả.
  it("ACTDETAIL-TC-010 - should keep review section stable when review API fails", async () => {
    callFetchReview.mockRejectedValue(new Error("Network error"));

    render(<ReviewActivity activity={{ avg_star: 4.5 }} />);

    expect(await screen.findByText("Chưa có đánh giá nào")).toBeInTheDocument();
  });
});
