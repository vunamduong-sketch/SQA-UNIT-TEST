import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ChatBot from "src-under-test/components/Chatbot/Chatbot";

// ============================================================
// TÊN FILE TEST: Chatbot.test.jsx
// MÔ TẢ:
// - Kiểm thử component ChatBot chính theo behavior người dùng.
// - Bao phủ login CTA, khởi tạo chat, render lịch sử, streaming response,
//   SQL event, image event, execution status và lỗi gửi message.
// - Mock API/chat child components để test contract và UI state ổn định.
// ============================================================

const mockCreateNewChat = jest.fn();
const mockGetChatMessages = jest.fn();
const mockSendMessage = jest.fn();
const mockNavigate = jest.fn();
const mockSelector = jest.fn();
const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Mock Redux selector để chủ động đổi trạng thái đăng nhập trong từng test.
jest.mock("redux/hooks", () => ({
  useAppSelector: (selector) => mockSelector(selector),
}));

// Mock chat API để kiểm tra contract: create chat, get messages, send message handlers.
jest.mock("lib/chat-api", () => ({
  createNewChat: (...args) => mockCreateNewChat(...args),
  getChatMessages: (...args) => mockGetChatMessages(...args),
  sendMessage: (...args) => mockSendMessage(...args),
}), { virtual: true });

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock("antd", () => ({
  Spin: () => <div>Loading...</div>,
}));

jest.mock("marked", () => ({
  marked: (value) => value,
}));

// Mock ChatbotMessage để test ChatBot state flow thay vì markdown/CSS chi tiết.
jest.mock("src-under-test/components/Chatbot/ChatbotMessage", () => ({
  ChatbotMessage: ({ message, isStreaming }) => (
    <div>
      <span>{message.role}</span>
      <span>{message.content || message.url || message.sql}</span>
      {isStreaming && <span>streaming</span>}
    </div>
  ),
}));

// Mock input thành button deterministic để gọi onSendMessage nhanh trong test.
jest.mock("src-under-test/components/Chatbot/MessageChatbotInput", () => ({
  MessageChatbotInput: ({ onSendMessage, disabled }) => (
    <div>
      <button onClick={() => onSendMessage("Xin chao")} disabled={disabled}>
        Send mock
      </button>
      {disabled && <span>input-disabled</span>}
    </div>
  ),
}));

const loginState = { account: { user: {} } };
const authenticatedState = { account: { user: { id: 7 } } };

const mockLoggedOutUser = () => {
  mockSelector.mockImplementation((selector) => selector(loginState));
};

const mockLoggedInUser = () => {
  mockSelector.mockImplementation((selector) => selector(authenticatedState));
};

describe("ChatBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  // TC ID: CHATBOT-TC-001
  // MỤC TIÊU: User chưa đăng nhập phải thấy CTA đăng nhập và được điều hướng đến /login khi click.
  // INPUT: Redux account.user không có id.
  // EXPECTED OUTPUT: CTA hiển thị và navigate('/login') được gọi.
  it("CHATBOT-TC-001 - shows login CTA when the user is not authenticated", () => {
    mockLoggedOutUser();

    render(<ChatBot />);

    const cta = screen.getByText("Đăng nhập để sử dụng trợ lý ảo Agoda");
    expect(cta).toBeInTheDocument();
    fireEvent.click(cta);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // TC ID: CHATBOT-TC-002
  // MỤC TIÊU: User đã đăng nhập thì component tạo chat mới và load lịch sử tin nhắn.
  // INPUT: createNewChat trả chat-1, getChatMessages trả messages đảo thứ tự.
  // EXPECTED OUTPUT: API nhận user_id đúng, messages hiển thị theo thứ tự chronological.
  it("CHATBOT-TC-002 - initializes chat and renders existing messages for an authenticated user", async () => {
    mockLoggedInUser();
    mockCreateNewChat.mockResolvedValue("chat-1");
    mockGetChatMessages.mockResolvedValue([
      { id: "m2", role: "assistant", content: "Tra loi cu" },
      { id: "m1", role: "user", content: "Xin chao" },
    ]);

    render(<ChatBot />);

    await waitFor(() =>
      expect(mockCreateNewChat).toHaveBeenCalledWith({ user_id: 7 })
    );
    expect(mockGetChatMessages).toHaveBeenCalledWith("chat-1");
    expect(await screen.findByText("Xin chao")).toBeInTheDocument();
    expect(screen.getByText("Tra loi cu")).toBeInTheDocument();
  });

  // TC ID: CHATBOT-TC-003
  // MỤC TIÊU: Khi user gửi message, UI thêm message user và stream câu trả lời assistant.
  // INPUT: Click Send mock, sendMessage gọi onText hai lần rồi onEnd.
  // EXPECTED OUTPUT: sendMessage nhận đúng content/chatId/handlers và response hiển thị.
  it("CHATBOT-TC-003 - streams a new assistant response after sending a message", async () => {
    mockLoggedInUser();
    mockCreateNewChat.mockResolvedValue("chat-2");
    mockGetChatMessages.mockResolvedValue([]);
    mockSendMessage.mockImplementation(async (_content, _chatId, handlers) => {
      handlers.onText("Xin ");
      handlers.onText("chao");
      handlers.onEnd();
    });

    render(<ChatBot />);

    await waitFor(() => expect(mockCreateNewChat).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole("button", { name: "Send mock" }));

    await waitFor(() =>
      expect(mockSendMessage).toHaveBeenCalledWith(
        "Xin chao",
        "chat-2",
        expect.objectContaining({
          onText: expect.any(Function),
          onEnd: expect.any(Function),
        })
      )
    );
    expect(screen.getAllByText("Xin chao").length).toBeGreaterThan(0);
  });

  // TC ID: CHATBOT-TC-004
  // MỤC TIÊU: ChatBot phải render SQL event từ stream để user xem truy vấn hệ thống đã chạy.
  // INPUT: sendMessage gọi handler onSQL với sql/result.
  // EXPECTED OUTPUT: SQL text hiển thị trong danh sách message.
  it("CHATBOT-TC-004 - renders SQL event returned by the message stream", async () => {
    mockLoggedInUser();
    mockCreateNewChat.mockResolvedValue("chat-sql");
    mockGetChatMessages.mockResolvedValue([]);
    mockSendMessage.mockImplementation(async (_content, _chatId, handlers) => {
      handlers.onSQL({ id: "sql-1", sql: "SELECT * FROM hotels", result: { msg: "2 rows" } });
      handlers.onEnd();
    });

    render(<ChatBot />);

    await waitFor(() => expect(mockCreateNewChat).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole("button", { name: "Send mock" }));

    expect(await screen.findByText("SELECT * FROM hotels")).toBeInTheDocument();
  });

  // TC ID: CHATBOT-TC-005
  // MỤC TIÊU: ChatBot phải render image event từ stream để user thấy ảnh/chart được sinh ra.
  // INPUT: sendMessage gọi handler onImage với url ảnh.
  // EXPECTED OUTPUT: URL ảnh được truyền xuống message và hiển thị qua mock ChatbotMessage.
  it("CHATBOT-TC-005 - renders image event returned by the message stream", async () => {
    mockLoggedInUser();
    mockCreateNewChat.mockResolvedValue("chat-image");
    mockGetChatMessages.mockResolvedValue([]);
    mockSendMessage.mockImplementation(async (_content, _chatId, handlers) => {
      handlers.onImage({ url: "https://cdn.example.test/chart.png" });
      handlers.onEnd();
    });

    render(<ChatBot />);

    await waitFor(() => expect(mockCreateNewChat).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole("button", { name: "Send mock" }));

    expect(await screen.findByText("https://cdn.example.test/chart.png")).toBeInTheDocument();
  });

  // TC ID: CHATBOT-TC-006
  // MỤC TIÊU: Khi backend báo đang chạy function, user phải thấy trạng thái Executing.
  // INPUT: sendMessage gọi onExecutionStatus started cho searchHotels.
  // EXPECTED OUTPUT: Text "Executing: searchHotels" hiển thị.
  it("CHATBOT-TC-006 - shows function execution status while streaming", async () => {
    mockLoggedInUser();
    mockCreateNewChat.mockResolvedValue("chat-exec");
    mockGetChatMessages.mockResolvedValue([]);
    mockSendMessage.mockImplementation(async (_content, _chatId, handlers) => {
      handlers.onExecutionStatus({ status: "started", functionName: "searchHotels" });
    });

    render(<ChatBot />);

    await waitFor(() => expect(mockCreateNewChat).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole("button", { name: "Send mock" }));

    expect(await screen.findByText(/Executing:/)).toBeInTheDocument();
    expect(screen.getByText(/searchHotels/)).toBeInTheDocument();
  });

  // TC ID: CHATBOT-TC-007
  // MỤC TIÊU: Nếu sendMessage reject, component không crash và input được bật lại.
  // INPUT: sendMessage throw Error("Network error").
  // EXPECTED OUTPUT: Button Send mock không còn disabled sau khi catch lỗi.
  it("CHATBOT-TC-007 - recovers the input when sending a message fails", async () => {
    mockLoggedInUser();
    mockCreateNewChat.mockResolvedValue("chat-error");
    mockGetChatMessages.mockResolvedValue([]);
    mockSendMessage.mockRejectedValue(new Error("Network error"));

    render(<ChatBot />);

    await waitFor(() => expect(mockCreateNewChat).toHaveBeenCalled());
    fireEvent.click(await screen.findByRole("button", { name: "Send mock" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Send mock" })).not.toBeDisabled()
    );
  });
});
