import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MessageChatbotInput } from "src-under-test/components/Chatbot/MessageChatbotInput";

// ============================================================
// TÊN FILE TEST: MessageChatbotInput.test.jsx
// MÔ TẢ:
// - Bộ test rút gọn cho ô nhập tin nhắn của Chatbot.
// - Chỉ giữ 2 behavior chính: gửi message hợp lệ và trạng thái disabled.
// - Bỏ các case phím tắt Enter/Shift+Enter để giảm số lượng test.
// ============================================================

describe("MessageChatbotInput", () => {
  // TC ID: CHATBOT-TC-004
  // MỤC TIÊU: User nhập khoảng trắng dư vẫn gửi nội dung đã trim và textarea được clear.
  // INPUT: Textarea value "  Xin chao  ", click nút "Gửi".
  // EXPECTED OUTPUT: onSendMessage nhận "Xin chao" và textarea rỗng.
  it("CHATBOT-TC-004 - submits a trimmed message and clears the textarea", () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const onSendMessage = jest.fn();
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<MessageChatbotInput onSendMessage={onSendMessage} />);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const textarea = screen.getByPlaceholderText("Hãy hỏi 1 câu hỏi bất kỳ");
    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(textarea, { target: { value: "  Xin chao  " } });
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByRole("button", { name: "Gửi" }));

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(onSendMessage).toHaveBeenCalledWith("Xin chao");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(textarea.value).toBe("");
  });

  // TC ID: CHATBOT-TC-005
  // MỤC TIÊU: Trong lúc chờ phản hồi, input và button gửi phải bị disable để tránh gửi trùng.
  // INPUT: Render component với prop disabled=true.
  // EXPECTED OUTPUT: Placeholder chờ phản hồi hiển thị, textarea và button disabled.
  it("CHATBOT-TC-005 - disables sending while waiting for a response", () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const onSendMessage = jest.fn();
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<MessageChatbotInput onSendMessage={onSendMessage} disabled />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByPlaceholderText("Đang chờ phản hồi...")).toBeDisabled();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByRole("button", { name: /Đang gửi/ })).toBeDisabled();
  });
});
