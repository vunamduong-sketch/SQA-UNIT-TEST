import React from "react";
import { render, screen } from "@testing-library/react";
import Favourite from "src-under-test/components/Favourite";

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}), { virtual: true });

describe("Favourite", () => {
  it("renders the favourite list title and item count", () => {
    // TC_FAVOURITE_01
    render(<Favourite />);

    expect(screen.getByText("Danh sach yeu thich")).toBeInTheDocument();
    expect(screen.getByText("2 muc")).toBeInTheDocument();
  });

  it("renders six destination cards linked to the favourite detail page", () => {
    // TC_FAVOURITE_02
    render(<Favourite />);

    const cards = screen.getAllByRole("link");
    expect(cards).toHaveLength(6);
    cards.forEach((card) => {
      expect(card).toHaveAttribute("href", "/favourite/1");
    });
    expect(screen.getAllByText("Ha Long, Viet Nam")).toHaveLength(6);
  });
});
