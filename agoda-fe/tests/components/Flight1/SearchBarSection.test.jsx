import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchBarSection from "src-under-test/components/Flight1/SearchBarSection";

jest.mock("lucide-react", () => ({
  Check: () => <span>check</span>,
  ChevronDown: () => <span>down</span>,
  ChevronUp: () => <span>up</span>,
}));

describe("Flight1 SearchBarSection", () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });

  it("updates origin and destination inputs", () => {
    // TC_FLIGHT1_01
    render(<SearchBarSection />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Ha Noi (HAN)" } });
    fireEvent.change(inputs[1], { target: { value: "Da Nang (DAD)" } });

    expect(inputs[0]).toHaveValue("Ha Noi (HAN)");
    expect(inputs[1]).toHaveValue("Da Nang (DAD)");
  });

  it("updates guest count after changing passenger numbers", async () => {
    // TC_FLIGHT1_02
    render(<SearchBarSection />);

    fireEvent.click(screen.getByText("1 khách"));
    fireEvent.click(screen.getAllByText("+")[1]);

    await waitFor(() => {
      expect(screen.getByText("2 khách")).toBeInTheDocument();
    });
  });

  it("shows search summary in alert when clicking search", () => {
    // TC_FLIGHT1_03
    render(<SearchBarSection />);

    fireEvent.click(screen.getByText("Tìm"));

    expect(window.alert).toHaveBeenCalled();
    expect(window.alert.mock.calls[0][0]).toContain("From: Hồ Chí Minh (SGN)");
    expect(window.alert.mock.calls[0][0]).toContain("To: Nhật Chiếu (RIZ)");
    expect(window.alert.mock.calls[0][0]).toContain("Class: Phổ thông");
  });
});
