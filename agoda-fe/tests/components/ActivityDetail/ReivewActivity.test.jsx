import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReviewActivity from "src-under-test/components/ActivityDetail/ReivewActivity";
import { callFetchReview, callCreateReview } from "config/api";
import { toast } from "react-toastify";

jest.mock("redux/hooks", () => ({
  useAppSelector: jest.fn((selector) =>
    selector({ account: { user: { id: 1, first_name: "A", last_name: "B" } } })
  ),
}));

jest.mock("config/api", () => ({
  callFetchReview: jest.fn(),
  callDeleteReview: jest.fn(),
  callUpdateReview: jest.fn(),
  callCreateReview: jest.fn(),
}));

jest.mock("constants/serviceType", () => ({
  ServiceType: { ACTIVITY: 2 },
}));

jest.mock("react-toastify", () => ({
  toast: { error: jest.fn() },
}));

jest.mock("utils/imageUrl", () => ({ getUserAvatar: jest.fn(() => "avatar") }));

jest.mock(
  "react-router-dom",
  () => ({
    useParams: () => ({ activityId: "10" }),
  }),
  { virtual: true }
);

jest.mock("@ant-design/icons", () => ({
  SendOutlined: () => null,
  EditOutlined: () => null,
  DeleteOutlined: () => null,
}));

jest.mock("antd", () => {
  const React = require("react");
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
    jest.clearAllMocks();
    callFetchReview.mockResolvedValue({
      isSuccess: true,
      data: [],
      meta: { totalItems: 0, totalPages: 1 },
    });
  });

  it("fetches activity reviews on mount", async () => {
    // TC_ACTIVITYDETAIL_06
    render(<ReviewActivity activity={{ avg_star: 4.5 }} />);
    await waitFor(() =>
      expect(callFetchReview).toHaveBeenCalledWith(
        "current=1&pageSize=10&service_type=2&service_ref_id=10"
      )
    );
    expect(screen.getByText("Chưa có đánh giá nào")).toBeInTheDocument();
  });

  it("shows validation error when submitting an empty review", async () => {
    // TC_ACTIVITYDETAIL_07
    render(<ReviewActivity activity={{ avg_star: 4.5 }} />);
    fireEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
    expect(toast.error).toHaveBeenCalled();
    expect(callCreateReview).not.toHaveBeenCalled();
  });
});
