import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HotelList from "src-under-test/components/Search/HotelList";

jest.mock("src-under-test/components/Search/HotelCard", () => ({
  __esModule: true,
  default: ({ hotel }) => <div data-testid="hotel-card">{hotel.name}</div>,
}));

jest.mock("@ant-design/icons", () => ({
  AppstoreOutlined: () => null,
  UnorderedListOutlined: () => null,
  SortAscendingOutlined: () => null,
}));

jest.mock("antd", () => ({
  Row: ({ children }) => <div>{children}</div>,
  Col: ({ children }) => <div>{children}</div>,
  Spin: () => <div>Loading Spinner</div>,
  Empty: ({ description }) => <div>{description}</div>,
  Select: ({ children }) => <div>{children}</div>,
  Button: ({ children }) => <button type="button">{children}</button>,
}));

describe("HotelList", () => {
  it("shows the loading state while data is being fetched", () => {
    // TC_SEARCH_04
    render(<HotelList hotels={[]} loading />);

    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  it("shows the empty state when there are no hotels", () => {
    // TC_SEARCH_05
    render(<HotelList hotels={[]} loading={false} />);

    expect(
      screen.getByText("Không tìm thấy khách sạn nào phù hợp")
    ).toBeInTheDocument();
  });

  it("renders hotel cards and updates the selected sort option", () => {
    // TC_SEARCH_06
    render(
      <HotelList
        hotels={[
          { id: 1, name: "Hotel Alpha" },
          { id: 2, name: "Hotel Beta" },
        ]}
      />
    );

    expect(screen.getAllByTestId("hotel-card")).toHaveLength(2);
    expect(screen.getByText("2 khách sạn")).toBeInTheDocument();

    const sortButton = screen.getByRole("button", { name: "Giá cao nhất" });
    fireEvent.click(sortButton);

    expect(sortButton.className).toContain("bg-blue-100");
  });
});
