import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChatbotMessage } from "src-under-test/components/Chatbot/ChatbotMessage";

jest.mock("marked", () => ({
  marked: (value) => value,
}));

describe("ChatbotMessage", () => {
  it("toggles SQL result visibility", () => {
    // TC_CHATBOT_06
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

  it("renders user text content and streaming cursor", () => {
    // TC_CHATBOT_07
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
});
