import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NavigationBar from "src-under-test/components/Hotel/NavigationBar";

const mockFormatCurrency = jest.fn((value) => value);
const mockScrollIntoView = jest.fn();
const observe = jest.fn();
const disconnect = jest.fn();

jest.mock("utils/formatCurrency", () => ({
  formatCurrency: (...args) => mockFormatCurrency(...args),
}));

describe("Hotel NavigationBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.IntersectionObserver = jest.fn(() => ({
      observe,
      disconnect,
    }));
    document.querySelector = jest.fn(() => ({
      scrollIntoView: mockScrollIntoView,
    }));
  });

  it("renders formatted price and calls scrollToSection for overview", () => {
    // TC_HOTEL_08
    const scrollToSection = jest.fn();
    render(<NavigationBar scrollToSection={scrollToSection} hotel={{ min_price: 2500000 }} />);

    expect(screen.getByText("2500000 VND")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Tổng quan"));
    expect(scrollToSection).toHaveBeenCalledWith("overview");
  });

  it("scrolls to room options when clicking Xem giá", () => {
    // TC_HOTEL_09
    render(<NavigationBar scrollToSection={jest.fn()} hotel={{ min_price: 2500000 }} />);

    fireEvent.click(screen.getByText("Xem giá"));
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
    expect(observe).toHaveBeenCalled();
  });
});
