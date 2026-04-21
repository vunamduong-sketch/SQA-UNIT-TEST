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

  it("loads reviews and paginates", async () => {
    // TC_HOTEL_05
    render(<ReviewTabView hotelId={77} />);

    expect(await screen.findByText("Tuyet voi")).toBeInTheDocument();
    fireEvent.click(screen.getByText("page2"));

    await waitFor(() => {
      expect(mockCallFetchReview).toHaveBeenCalledWith(expect.stringContaining("current=2"));
    });
  });

  it("validates review submission before calling API", async () => {
    // TC_HOTEL_06
    render(<ReviewTabView hotelId={77} />);

    await screen.findByText("Tuyet voi");
    fireEvent.click(screen.getByText("Gửi đánh giá"));

    expect(mockToastError).toHaveBeenCalled();
    expect(mockCallCreateReview).not.toHaveBeenCalled();
  });

  it("submits a new review when rating and comment are provided", async () => {
    // TC_HOTEL_07
    mockCallCreateReview.mockResolvedValue({ isSuccess: true });
    render(<ReviewTabView hotelId={77} />);

    await screen.findByText("Tuyet voi");
    fireEvent.click(screen.getByText("rate"));
    fireEvent.change(screen.getByPlaceholderText("Chia sẻ trải nghiệm của bạn về khách sạn..."), { target: { value: "Khach san dep" } });
    fireEvent.click(screen.getByText("Gửi đánh giá"));

    await waitFor(() => {
      expect(mockCallCreateReview).toHaveBeenCalledWith(expect.objectContaining({
        service_ref_id: 77,
        rating: 4,
        comment: "Khach san dep",
      }));
    });
  });
});
