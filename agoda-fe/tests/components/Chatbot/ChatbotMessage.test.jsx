import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChatbotMessage } from "src-under-test/components/Chatbot/ChatbotMessage";

// ============================================================
// TÊN FILE TEST: ChatbotMessage.test.jsx
// MÔ TẢ:
// - Bộ test rút gọn cho component hiển thị từng message trong Chatbot.
// - Chỉ giữ behavior quan trọng nhất: render text và xem kết quả SQL.
// - Bỏ case image/streaming cursor để giảm số lượng test chi tiết.
// ============================================================

jest.mock("marked", () => ({
  marked: (value) => value,
}));

describe("ChatbotMessage", () => {
  // TC ID: CHATBOT-TC-006
  // MỤC TIÊU: Text message phải render đúng nội dung user nhìn thấy.
  // INPUT: message.role=user, content="Hello bot".
  // EXPECTED OUTPUT: Nội dung text hiển thị trên màn hình.
  it("CHATBOT-TC-006 - renders text message content", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(
      <ChatbotMessage
        message={{
          role: "user",
          content: "Hello bot",
          timestamp: "2026-01-01T10:00:00.000Z",
        }}
      />
    );

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Hello bot")).toBeInTheDocument();
  });

  // TC ID: CHATBOT-TC-007
  // MỤC TIÊU: SQL message phải cho phép user bật xem kết quả truy vấn.
  // INPUT: message.isSQL=true, result có msg "2 rows".
  // EXPECTED OUTPUT: Click "Show Result" thì nội dung kết quả hiển thị.
  it("CHATBOT-TC-007 - toggles SQL result visibility", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(
      <ChatbotMessage
        message={{
          isSQL: true,
          sql: "SELECT * FROM hotels",
          result: { msg: "2 rows" },
          timestamp: "2026-01-01T10:00:00.000Z",
        }}
      />
    );

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("SQL Query")).toBeInTheDocument();
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByRole("button", { name: "Show Result" }));
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("2 rows")).toBeInTheDocument();
  });
});
