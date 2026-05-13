import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChatbotMessage } from "src-under-test/components/Chatbot/ChatbotMessage";

// ============================================================
// TÊN FILE TEST: ChatbotMessage.test.jsx
// MÔ TẢ:
// - Kiểm thử component render từng message trong Chatbot.
// - Bao phủ SQL message, text message có streaming cursor và image message.
// - Assertion dựa vào nội dung user nhìn thấy, không phụ thuộc layout chi tiết.
// ============================================================

jest.mock("marked", () => ({
  marked: (value) => value,
}));

describe("ChatbotMessage", () => {
  // TC ID: CHATBOT-TC-012
  // MỤC TIÊU: SQL message phải cho phép user bật/tắt kết quả truy vấn.
  // INPUT: message.isSQL=true, result có msg "2 rows".
  // EXPECTED OUTPUT: Click "Show Result" thì nội dung kết quả hiển thị.
  it("CHATBOT-TC-012 - toggles SQL result visibility", () => {
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

    expect(screen.getByText("SQL Query")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show Result" }));
    expect(screen.getByText("2 rows")).toBeInTheDocument();
  });

  // TC ID: CHATBOT-TC-013
  // MỤC TIÊU: Text message của user phải render đúng nội dung và streaming cursor khi đang stream.
  // INPUT: message.role=user, content="Hello bot", isStreaming=true.
  // EXPECTED OUTPUT: Nội dung text hiển thị và cursor animate-pulse có mặt.
  it("CHATBOT-TC-013 - renders user text content and streaming cursor", () => {
    const { container } = render(
      <ChatbotMessage
        message={{
          role: "user",
          content: "Hello bot",
          timestamp: "2026-01-01T10:00:00.000Z",
        }}
        isStreaming
      />
    );

    expect(screen.getByText("Hello bot")).toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  // TC ID: CHATBOT-TC-014
  // MỤC TIÊU: Image message phải render ảnh/chart do assistant sinh ra.
  // INPUT: message.isImage=true với url ảnh.
  // EXPECTED OUTPUT: Image alt "Generated chart" có src đúng.
  it("CHATBOT-TC-014 - renders generated image messages", () => {
    render(
      <ChatbotMessage
        message={{
          isImage: true,
          url: "https://cdn.example.test/chart.png",
          timestamp: "2026-01-01T10:00:00.000Z",
        }}
      />
    );

    expect(screen.getByAltText("Generated chart")).toHaveAttribute(
      "src",
      "https://cdn.example.test/chart.png"
    );
  });
});
