import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MessageChatbotInput } from "src-under-test/components/Chatbot/MessageChatbotInput";

// ============================================================
// TÊN FILE TEST: MessageChatbotInput.test.jsx
// MÔ TẢ:
// - Kiểm thử ô nhập tin nhắn của Chatbot theo behavior người dùng.
// - Bao phủ submit bằng button, disabled state, Enter để gửi và Shift+Enter để xuống dòng.
// - Test không phụ thuộc className/CSS.
// ============================================================

describe("MessageChatbotInput", () => {
  // TC ID: CHATBOT-TC-008
  // MỤC TIÊU: User nhập khoảng trắng dư vẫn gửi nội dung đã trim và textarea được clear.
  // INPUT: Textarea value "  Xin chao  ", click nút "Gửi".
  // EXPECTED OUTPUT: onSendMessage nhận "Xin chao" và textarea rỗng.
  it("CHATBOT-TC-008 - submits a trimmed message and clears the textarea", () => {
    const onSendMessage = jest.fn();
    render(<MessageChatbotInput onSendMessage={onSendMessage} />);

    const textarea = screen.getByPlaceholderText("Hãy hỏi 1 câu hỏi bất kỳ");
    fireEvent.change(textarea, { target: { value: "  Xin chao  " } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi" }));

    expect(onSendMessage).toHaveBeenCalledWith("Xin chao");
    expect(textarea.value).toBe("");
  });

  // TC ID: CHATBOT-TC-009
  // MỤC TIÊU: Trong lúc chờ phản hồi, input và button gửi phải bị disable để tránh gửi trùng.
  // INPUT: Render component với prop disabled=true.
  // EXPECTED OUTPUT: Placeholder chờ phản hồi hiển thị, textarea và button disabled.
  it("CHATBOT-TC-009 - disables sending while waiting for a response", () => {
    const onSendMessage = jest.fn();
    render(<MessageChatbotInput onSendMessage={onSendMessage} disabled />);

    expect(screen.getByPlaceholderText("Đang chờ phản hồi...")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Đang gửi/ })).toBeDisabled();
  });

  // TC ID: CHATBOT-TC-010
  // MỤC TIÊU: User có thể nhấn Enter để gửi nhanh thay vì click button.
  // INPUT: Textarea value "Tim khach san", keyDown Enter không kèm Shift.
  // EXPECTED OUTPUT: onSendMessage được gọi với nội dung đã nhập.
  it("CHATBOT-TC-010 - submits the message when Enter is pressed", () => {
    const onSendMessage = jest.fn();
    render(<MessageChatbotInput onSendMessage={onSendMessage} />);

    const textarea = screen.getByPlaceholderText("Hãy hỏi 1 câu hỏi bất kỳ");
    fireEvent.change(textarea, { target: { value: "Tim khach san" } });
    fireEvent.keyPress(textarea, { key: "Enter", code: "Enter", charCode: 13 });

    expect(onSendMessage).toHaveBeenCalledWith("Tim khach san");
  });

  // TC ID: CHATBOT-TC-011
  // MỤC TIÊU: Shift+Enter không gửi message để user có thể nhập nhiều dòng.
  // INPUT: Textarea value "Dong 1", keyDown Enter kèm shiftKey=true.
  // EXPECTED OUTPUT: onSendMessage không được gọi.
  it("CHATBOT-TC-011 - does not submit when Shift Enter is pressed", () => {
    const onSendMessage = jest.fn();
    render(<MessageChatbotInput onSendMessage={onSendMessage} />);

    const textarea = screen.getByPlaceholderText("Hãy hỏi 1 câu hỏi bất kỳ");
    fireEvent.change(textarea, { target: { value: "Dong 1" } });
    fireEvent.keyPress(textarea, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
      shiftKey: true,
    });

    expect(onSendMessage).not.toHaveBeenCalled();
  });
});
