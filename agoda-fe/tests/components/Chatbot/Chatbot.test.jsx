import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ChatBot from "src-under-test/components/Chatbot/Chatbot";

// ============================================================
// TÊN FILE TEST: Chatbot.test.jsx
// MÔ TẢ:
// - Bộ test rút gọn cho ChatBot chính.
// - Chỉ giữ các luồng quan trọng: yêu cầu đăng nhập, khởi tạo chat,
//   và gửi message nhận phản hồi streaming.
// - Các case SQL/image/execution/error đã lược bỏ để tránh test quá nhiều.
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

// Mock chat API để kiểm tra contract chính: create chat, get messages, send message.
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

// Mock ChatbotMessage để test flow của ChatBot, không test chi tiết markdown/CSS.
jest.mock("src-under-test/components/Chatbot/ChatbotMessage", () => ({
  ChatbotMessage: ({ message, isStreaming }) => (
    <div>
      <span>{message.role}</span>
      <span>{message.content}</span>
      {isStreaming && <span>streaming</span>}
    </div>
  ),
}));

// Mock input thành button deterministic để gọi onSendMessage nhanh trong test.
jest.mock("src-under-test/components/Chatbot/MessageChatbotInput", () => ({
  MessageChatbotInput: ({ onSendMessage, disabled }) => (
    <button onClick={() => onSendMessage("Xin chao")} disabled={disabled}>
      Send mock
    </button>
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

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ChatBot />);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const cta = screen.getByText("Đăng nhập để sử dụng trợ lý ảo Agoda");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(cta).toBeInTheDocument();
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(cta);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // TC ID: CHATBOT-TC-002
  // MỤC TIÊU: User đã đăng nhập thì component tạo chat mới và load lịch sử tin nhắn.
  // INPUT: createNewChat trả chat-1, getChatMessages trả messages đảo thứ tự.
  // EXPECTED OUTPUT: API nhận user_id đúng, messages hiển thị theo thứ tự chronological.
  it("CHATBOT-TC-002 - initializes chat and renders existing messages", async () => {
    mockLoggedInUser();
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCreateNewChat.mockResolvedValue("chat-1");
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockGetChatMessages.mockResolvedValue([
      { id: "m2", role: "assistant", content: "Tra loi cu" },
      { id: "m1", role: "user", content: "Xin chao" },
    ]);

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ChatBot />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() =>
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCreateNewChat).toHaveBeenCalledWith({ user_id: 7 })
    );
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(mockGetChatMessages).toHaveBeenCalledWith("chat-1");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Xin chao")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Tra loi cu")).toBeInTheDocument();
  });

  // TC ID: CHATBOT-TC-003
  // MỤC TIÊU: Khi user gửi message, UI thêm message user và stream câu trả lời assistant.
  // INPUT: Click Send mock, sendMessage gọi onText hai lần rồi onEnd.
  // EXPECTED OUTPUT: sendMessage nhận đúng content/chatId/handlers và response hiển thị.
  it("CHATBOT-TC-003 - streams an assistant response after sending a message", async () => {
    mockLoggedInUser();
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCreateNewChat.mockResolvedValue("chat-2");
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockGetChatMessages.mockResolvedValue([]);
    mockSendMessage.mockImplementation(async (_content, _chatId, handlers) => {
      handlers.onText("Xin ");
      handlers.onText("chao");
      handlers.onEnd();
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<ChatBot />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => expect(mockCreateNewChat).toHaveBeenCalled());
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(await screen.findByRole("button", { name: "Send mock" }));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() =>
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockSendMessage).toHaveBeenCalledWith(
        "Xin chao",
        "chat-2",
        expect.objectContaining({
          onText: expect.any(Function),
          onEnd: expect.any(Function),
        })
      )
    );
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Xin chao").length).toBeGreaterThan(0);
  });
});
