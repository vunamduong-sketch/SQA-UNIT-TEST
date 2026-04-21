import React from "react";
import { render, screen } from "@testing-library/react";
import FavouriteRoom from "src-under-test/components/Favourite/FavouriteRoom";

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}), { virtual: true });

jest.mock("react-icons/io", () => ({
  IoIosStar: (props) => <svg data-testid="full-star" {...props} />,
}));

jest.mock("react-icons/fa", () => ({
  FaStarHalf: (props) => <svg data-testid="half-star" {...props} />,
}));

describe("FavouriteRoom", () => {
  it("renders hotel cards with rating and review information", () => {
    // TC_FAVOURITE_03
    render(<FavouriteRoom />);

    expect(screen.getAllByText("Tru by Hilton Ha Long Hon Gai Centre")).toHaveLength(6);
    expect(screen.getAllByText("9,1")).toHaveLength(6);
    expect(screen.getAllByText("Tren ca tuyet voi")).toHaveLength(6);
  });

  it("renders the nightly price section and navigation links", () => {
    // TC_FAVOURITE_04
    render(<FavouriteRoom />);

    expect(screen.getAllByText("659.291")).toHaveLength(6);
    expect(screen.getAllByText("Moi dem tu")).toHaveLength(6);
    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(screen.getAllByTestId("full-star")).toHaveLength(18);
    expect(screen.getAllByTestId("half-star")).toHaveLength(6);
  });
});
