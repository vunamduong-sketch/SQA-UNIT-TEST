import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MessageChatbotInput } from "src-under-test/components/Chatbot/MessageChatbotInput";

describe("MessageChatbotInput", () => {
  it("submits a trimmed message and clears the textarea", () => {
    // TC_CHATBOT_04
    const onSendMessage = jest.fn();
    render(<MessageChatbotInput onSendMessage={onSendMessage} />);

    const textarea = screen.getByPlaceholderText("Hãy hỏi 1 câu hỏi bất kỳ");
    fireEvent.change(textarea, { target: { value: "  Xin chao  " } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi" }));

    expect(onSendMessage).toHaveBeenCalledWith("Xin chao");
    expect(textarea.value).toBe("");
  });

  it("disables sending while waiting for a response", () => {
    // TC_CHATBOT_05
    const onSendMessage = jest.fn();
    render(<MessageChatbotInput onSendMessage={onSendMessage} disabled />);

    expect(screen.getByPlaceholderText("Đang chờ phản hồi...")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Đang gửi/ })).toBeDisabled();
  });
});
