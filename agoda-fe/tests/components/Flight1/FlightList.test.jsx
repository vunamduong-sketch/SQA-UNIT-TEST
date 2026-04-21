import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FlightList from "src-under-test/components/Flight1/FlightList";

jest.mock("react-icons/fa", () => ({
  FaChevronDown: () => <span>down</span>,
  FaChevronUp: () => <span>up</span>,
}));

describe("Flight1 FlightList", () => {
  it("renders static flight cards", () => {
    // TC_FLIGHT1_06
    render(<FlightList />);

    expect(screen.getAllByText("10.104.858 đ")).toHaveLength(3);
    expect(screen.getByText("Vietnam Airlines")).toBeInTheDocument();
    expect(screen.getAllByText("SGN - RIZ")).toHaveLength(3);
  });

  it("expands flight details when clicking a flight card", () => {
    // TC_FLIGHT1_07
    render(<FlightList />);

    fireEvent.click(screen.getAllByText("China Eastern Airlines")[0]);

    expect(screen.getByText("Hồ Chí Minh (SGN) - Sân bay Quốc tế Tân Sơn Nhất")).toBeInTheDocument();
    expect(screen.getByText("Thêm vào xe đẩy hàng")).toBeInTheDocument();
  });
});
