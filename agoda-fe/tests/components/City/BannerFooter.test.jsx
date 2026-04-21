import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Banner from "src-under-test/components/City/Banner";
import Footer from "src-under-test/components/City/Footer";

const mockCallFetchHotelQuery = jest.fn();
const mockCallFetchHandbook = jest.fn();

jest.mock("config/api", () => ({
  callFetchHotelQuery: (...args) => mockCallFetchHotelQuery(...args),
  callFetchHandbook: (...args) => mockCallFetchHandbook(...args),
}));

jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock("src-under-test/components/Search/SearchBar", () => ({
  __esModule: true,
  default: ({ activeInput, setActiveInput, handleBackdropClick }) => (
    <div>
      <button onClick={() => setActiveInput("destination")}>Open search</button>
      <span>{activeInput || "closed"}</span>
      <button onClick={handleBackdropClick}>Close search</button>
    </div>
  ),
}));

jest.mock("utils/imageUrl", () => ({
  getImage: jest.fn((value) => value),
}));

describe("City Banner and Footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.matchMedia =
      window.matchMedia ||
      function () {
        return {
          matches: false,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
      };
  });

  it("renders the city banner and closes the backdrop when clicked", () => {
    // TC_CITY_01
    const { container } = render(
      <Banner city={{ image: "/uploads/city.jpg", name: "Da Nang" }} />
    );

    expect(screen.getByText("Khách sạn và nơi để ở")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Open search"));
    expect(screen.getByText("destination")).toBeInTheDocument();
    fireEvent.click(container.querySelector('[data-selenium="backdrop"]'));
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("fetches footer data and renders hotel and handbook links", async () => {
    // TC_CITY_02
    mockCallFetchHotelQuery.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 1, name: "Hotel A" }],
    });
    mockCallFetchHandbook.mockResolvedValue({
      isSuccess: true,
      data: [
        { id: 5, title: "Cam nang Da Nang", city: { id: 2, country: { id: 9 } } },
      ],
    });

    render(<Footer city={{ id: 2, name: "Da Nang" }} />);

    await waitFor(() =>
      expect(mockCallFetchHotelQuery).toHaveBeenCalledWith(
        "current=1&pageSize=100&cityId=2&recommended=true"
      )
    );
    expect(mockCallFetchHandbook).toHaveBeenCalledWith(
      "current=1&pageSize=100&city_id=2"
    );
    expect(await screen.findByText("Hotel A")).toBeInTheDocument();
    expect(screen.getByText("Cam nang Da Nang")).toBeInTheDocument();
  });
});
