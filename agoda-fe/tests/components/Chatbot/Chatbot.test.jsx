import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ChatBot from "src-under-test/components/Chatbot/Chatbot";

const mockCreateNewChat = jest.fn();
const mockGetChatMessages = jest.fn();
const mockSendMessage = jest.fn();
const mockNavigate = jest.fn();
const mockSelector = jest.fn();

jest.mock("redux/hooks", () => ({
  useAppSelector: (selector) => mockSelector(selector),
}));

jest.mock("lib/chat-api", () => ({
  createNewChat: (...args) => mockCreateNewChat(...args),
  getChatMessages: (...args) => mockGetChatMessages(...args),
  sendMessage: (...args) => mockSendMessage(...args),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}), { virtual: true });

jest.mock("antd", () => ({
  Spin: () => <div>Loading...</div>,
}));

jest.mock("marked", () => ({
  marked: (value) => value,
}));

jest.mock("src-under-test/components/Chatbot/ChatbotMessage", () => ({
  ChatbotMessage: ({ message, isStreaming }) => (
    <div>
      <span>{message.role}</span>
      <span>{message.content || message.url || message.sql}</span>
      {isStreaming && <span>streaming</span>}
    </div>
  ),
}));

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

describe("ChatBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it("shows login CTA when the user is not authenticated", () => {
    // TC_CHATBOT_01
    mockSelector.mockImplementation((selector) =>
      selector({ account: { user: {} } })
    );

    render(<ChatBot />);

    const cta = screen.getByText("Đăng nhập để sử dụng trợ lý ảo Agoda");
    expect(cta).toBeInTheDocument();
    fireEvent.click(cta);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("initializes chat and renders existing messages for an authenticated user", async () => {
    // TC_CHATBOT_02
    mockSelector.mockImplementation((selector) =>
      selector({ account: { user: { id: 7 } } })
    );
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

  it("streams a new assistant response after sending a message", async () => {
    // TC_CHATBOT_03
    mockSelector.mockImplementation((selector) =>
      selector({ account: { user: { id: 7 } } })
    );
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
});
