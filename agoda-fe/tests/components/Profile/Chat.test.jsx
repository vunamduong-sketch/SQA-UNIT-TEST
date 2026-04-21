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

  it("loads customer list for non-customer users", async () => {
    // TC_PROFILE_01
    mockCallFetchUser.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 2, first_name: "A", last_name: "B", username: "ab", avatar: "a.png" }],
    });

    render(<Chat />);

    await waitFor(() => {
      expect(mockCallFetchUser).toHaveBeenCalledWith("current=1&pageSize=1000&role=customer");
    });
    expect(screen.getByLabelText("Select a person")).toBeInTheDocument();
  });

  it("creates or opens a conversation when selecting a user", async () => {
    // TC_PROFILE_02
    mockCallFetchUser.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 2, first_name: "A", last_name: "B", username: "ab", avatar: "a.png" }],
    });
    mockCallGetOrCreateConversation.mockResolvedValue({
      isSuccess: true,
      data: { id: "conv-new", otherUser: { id: 2 } },
    });

    render(<Chat />);

    fireEvent.change(await screen.findByLabelText("Select a person"), { target: { value: "2" } });

    await waitFor(() => {
      expect(mockCallGetOrCreateConversation).toHaveBeenCalledWith({ user_id: 2 });
      expect(mockSetConversations).toHaveBeenCalled();
      expect(mockSetSelectedConversation).toHaveBeenCalled();
    });
  });
});
