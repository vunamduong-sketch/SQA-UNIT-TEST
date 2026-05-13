import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReviewTabView from "src-under-test/components/Hotel/ReviewTabView";

const mockCallFetchReview = jest.fn();
const mockCallCreateReview = jest.fn();
const mockCallUpdateReview = jest.fn();
const mockCallDeleteReview = jest.fn();
const mockToastError = jest.fn();
const mockGetUserAvatar = jest.fn(() => "avatar.png");

jest.mock("config/api", () => ({
  callFetchReview: (...args) => mockCallFetchReview(...args),
  callCreateReview: (...args) => mockCallCreateReview(...args),
  callUpdateReview: (...args) => mockCallUpdateReview(...args),
  callDeleteReview: (...args) => mockCallDeleteReview(...args),
}));

jest.mock("constants/serviceType", () => ({
  ServiceType: { HOTEL: "hotel" },
}));

jest.mock("redux/hooks", () => ({
  useAppSelector: (selector) =>
    selector({
      hotel: { hotelDetail: { avg_star: 7.2 } },
      account: { user: { id: 1, first_name: "A", last_name: "B" } },
    }),
}));

jest.mock("react-toastify", () => ({
  toast: { error: (...args) => mockToastError(...args) },
}));

jest.mock("utils/imageUrl", () => ({
  getUserAvatar: (...args) => mockGetUserAvatar(...args),
}));

jest.mock("antd", () => {
  const React = require("react");
  const Rate = ({ value, onChange, disabled }) =>
    disabled ? <div>{value}</div> : <button onClick={() => onChange(4)}>rate</button>;
  const Input = {
    TextArea: ({ value, onChange, placeholder }) => (
      <textarea placeholder={placeholder} value={value} onChange={onChange} />
    ),
  };
  const Button = ({ children, onClick, icon, loading }) => (
    <button onClick={onClick} disabled={loading}>{children}</button>
  );
  const Avatar = ({ children }) => <div>{children}</div>;
  const Empty = ({ description }) => <div>{description}</div>;
  const Modal = ({ open, children, onOk, onCancel }) =>
    open ? <div><button onClick={onOk}>Lưu</button><button onClick={onCancel}>Hủy</button>{children}</div> : null;
  const Popconfirm = ({ children, onConfirm }) => <div onClick={onConfirm}>{children}</div>;
  const Space = ({ children }) => <div>{children}</div>;
  const Pagination = ({ onChange }) => <button onClick={() => onChange(2, 10)}>page2</button>;
  const Spin = ({ children }) => <div>{children}</div>;
  return { Rate, Input, Button, Avatar, Empty, Modal, Popconfirm, Space, Pagination, Spin };
});

jest.mock("@ant-design/icons", () => ({
  SendOutlined: () => <span>send</span>,
  EditOutlined: () => <span>edit</span>,
  DeleteOutlined: () => <span>delete</span>,
}));

describe("Hotel ReviewTabView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCallFetchReview.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 10, rating: 5, comment: "Tuyet voi", created_at: "2026-01-01T00:00:00.000Z", user: { id: 1, first_name: "A", last_name: "B", avatar: "a.png" } }],
      meta: { totalItems: 1, totalPages: 1 },
    });
  });

  // TC ID: HOTEL-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads reviews and paginates" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads reviews and paginates", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ReviewTabView hotelId={77} />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Tuyet voi")).toBeInTheDocument();
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("page2"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchReview).toHaveBeenCalledWith(expect.stringContaining("current=2"));
    });
  });

  // TC ID: TC_HOTEL_06

  // MỤC TIÊU: Kiểm tra kịch bản "validates review submission before calling API".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("validates review submission before calling API", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ReviewTabView hotelId={77} />);

    await screen.findByText("Tuyet voi");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Gửi đánh giá"));

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(mockToastError).toHaveBeenCalled();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(mockCallCreateReview).not.toHaveBeenCalled();
  });

  // TC ID: TC_HOTEL_07

  // MỤC TIÊU: Kiểm tra kịch bản "submits a new review when rating and comment are provided".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("submits a new review when rating and comment are provided", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallCreateReview.mockResolvedValue({ isSuccess: true });
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ReviewTabView hotelId={77} />);

    await screen.findByText("Tuyet voi");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("rate"));
    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(screen.getByPlaceholderText("Chia sẻ trải nghiệm của bạn về khách sạn..."), { target: { value: "Khach san dep" } });
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Gửi đánh giá"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallCreateReview).toHaveBeenCalledWith(expect.objectContaining({
        service_ref_id: 77,
        rating: 4,
        comment: "Khach san dep",
      }));
    });
  });
});
