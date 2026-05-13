import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Chat from "src-under-test/components/Profile/Chat";

const mockCallFetchUser = jest.fn();
const mockCallGetOrCreateConversation = jest.fn();
const mockSetSelectedConversation = jest.fn();
const mockSetConversations = jest.fn();

jest.mock("config/api", () => ({
  callFetchUser: (...args) => mockCallFetchUser(...args),
  callGetOrCreateConversation: (...args) => mockCallGetOrCreateConversation(...args),
}));

jest.mock("redux/hooks", () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (selector) =>
    selector({
      account: { user: { id: 10, role: "admin" } },
    }),
}));

jest.mock("uuid", () => ({
  v4: () => "uuid-1",
}));

jest.mock("utils/conversation", () => ({
  getOtherUser: (conv) => conv.otherUser || { id: 2 },
}));

jest.mock("constants/role", () => ({
  ROLE: { CUSTOMER: "customer" },
}));

jest.mock("antd", () => ({
  Select: ({ options, onChange, placeholder }) => (
    <select aria-label={placeholder} onChange={(e) => onChange(Number(e.target.value))}>
      <option value="">choose</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.value}</option>
      ))}
    </select>
  ),
}));

jest.mock("utils/imageUrl", () => ({
  getUserAvatar: () => "avatar.png",
}));

jest.mock("contexts/SocketProvider", () => ({
  useSocket: () => ({
    conversations: [{ id: "conv-1", otherUser: { id: 2 }, latest_message: null, unseen_count: 0 }],
    setConversations: mockSetConversations,
    selectedConversation: {},
    setSelectedConversation: mockSetSelectedConversation,
    loadingConversations: false,
  }),
}));

jest.mock("react-loading-skeleton", () => () => <div>loading</div>);
jest.mock("react-icons/io5", () => ({ IoChatboxEllipses: () => <span>chat-icon</span> }));
jest.mock("lodash", () => ({ isEmpty: (obj) => !obj || Object.keys(obj).length === 0 }));

describe("Profile Chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC ID: PROFILE-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads customer list for non-customer users" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads customer list for non-customer users", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchUser.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 2, first_name: "A", last_name: "B", username: "ab", avatar: "a.png" }],
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Chat />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchUser).toHaveBeenCalledWith("current=1&pageSize=1000&role=customer");
    });
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByLabelText("Select a person")).toBeInTheDocument();
  });

  // TC ID: PROFILE-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "creates or opens a conversation when selecting a user" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("creates or opens a conversation when selecting a user", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchUser.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 2, first_name: "A", last_name: "B", username: "ab", avatar: "a.png" }],
    });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallGetOrCreateConversation.mockResolvedValue({
      isSuccess: true,
      data: { id: "conv-new", otherUser: { id: 2 } },
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Chat />);

    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(await screen.findByLabelText("Select a person"), { target: { value: "2" } });

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallGetOrCreateConversation).toHaveBeenCalledWith({ user_id: 2 });
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockSetConversations).toHaveBeenCalled();
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockSetSelectedConversation).toHaveBeenCalled();
    });
  });
});
