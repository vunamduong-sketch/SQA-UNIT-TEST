import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchBarSection from "src-under-test/components/HomeAndApartment/SearchBarSection";

jest.mock("@mui/icons-material", () => ({
  CalendarToday: () => <span>calendar</span>,
  People: () => <span>people</span>,
  Search: () => <span>search</span>,
}));

describe("HomeAndApartment SearchBarSection", () => {
  it("updates room and guest counts from the dropdown", async () => {
    // TC_HOMEAPT_01
    render(<SearchBarSection />);

    fireEvent.click(screen.getByText("1 người lớn, 1 phòng"));
    fireEvent.click(screen.getAllByText("+")[0]);
    fireEvent.click(screen.getAllByText("+")[1]);

    await waitFor(() => {
      expect(screen.getByText((_, node) => node.textContent === "2 người lớn, 2 phòng")).toBeInTheDocument();
    });
  });

  it("updates the first selected date from the date picker", async () => {
    // TC_HOMEAPT_02
    render(<SearchBarSection />);

    fireEvent.click(screen.getByText("22 tháng 8 2025"));
    fireEvent.click(screen.getByText("25"));

    await waitFor(() => {
      expect(screen.getByText("25 tháng 8 2025")).toBeInTheDocument();
    });
  });
});
