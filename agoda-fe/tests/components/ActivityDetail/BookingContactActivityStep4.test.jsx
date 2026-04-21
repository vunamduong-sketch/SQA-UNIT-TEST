import React from "react";
import { render, screen } from "@testing-library/react";
import BookingContactActivityStep4 from "src-under-test/components/ActivityDetail/BookingContactActivityStep4";

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }),
  { virtual: true }
);

jest.mock("lucide-react", () => new Proxy({}, { get: () => () => null }), { virtual: true });

describe("BookingContactActivityStep4", () => {
  it("renders booking confirmation information", () => {
    // TC_ACTIVITYDETAIL_05
    window.scrollTo = jest.fn();
    render(<BookingContactActivityStep4 />);
    expect(screen.getByText("Đặt chỗ thành công!")).toBeInTheDocument();
    expect(screen.getByText("Mã đặt chỗ của bạn")).toBeInTheDocument();
    expect(screen.getByText("AG-354319176")).toBeInTheDocument();
  });
});
