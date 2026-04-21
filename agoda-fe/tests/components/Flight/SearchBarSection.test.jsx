import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchBarSection from "src-under-test/components/Flight/SearchBarSection";

jest.mock("lucide-react", () => ({
  Check: () => <span>check</span>,
  ChevronDown: () => <span>down</span>,
  ChevronUp: () => <span>up</span>,
}));

jest.mock("antd", () => {
  const React = require("react");
  const Select = ({ value, onChange, placeholder, children }) => (
    <select
      aria-label={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
  );
  Select.Option = ({ value, children }) => <option value={value}>{children}</option>;
  return { Select };
});

const airports = [
  { id: 1, code: "SGN", city: { name: "Ho Chi Minh" }, name: "Tan Son Nhat" },
  { id: 2, code: "HAN", city: { name: "Ha Noi" }, name: "Noi Bai" },
];

describe("Flight SearchBarSection", () => {
  beforeEach(() => {
    delete window.location;
    window.location = { href: "" };
  });

  it("swaps origin and destination when clicking the swap button", async () => {
    // TC_FLIGHT_01
    render(
      <SearchBarSection
        defaultOrigin="1"
        defaultDestination="2"
        airports={airports}
      />
    );

    fireEvent.click(screen.getByLabelText("Đảo chiều đi/đến"));
    fireEvent.click(screen.getByText("Tìm"));

    await waitFor(() => {
      expect(window.location.href).toContain("origin=2");
      expect(window.location.href).toContain("destination=1");
    });
  });

  it("updates passenger count from the guest picker", async () => {
    // TC_FLIGHT_02
    render(<SearchBarSection defaultPassengers={2} airports={airports} />);

    fireEvent.click(screen.getByText("2 khách"));
    fireEvent.click(screen.getByText("+"));

    await waitFor(() => {
      expect(screen.getByText("3 khách")).toBeInTheDocument();
    });
  });

  it("builds the flight search URL when searching", () => {
    // TC_FLIGHT_03
    render(
      <SearchBarSection
        defaultOrigin="1"
        defaultDestination="2"
        defaultDepartureDate="2026-05-01"
        defaultReturnDate="2026-05-05"
        defaultPassengers={2}
        defaultSeatClass="business"
        defaultPromotionId="99"
        airports={airports}
      />
    );

    fireEvent.click(screen.getByText("Tìm"));

    expect(window.location.href).toContain("/flight?");
    expect(window.location.href).toContain("origin=1");
    expect(window.location.href).toContain("destination=2");
    expect(window.location.href).toContain("departureDate=2026-05-01");
    expect(window.location.href).toContain("returnDate=2026-05-05");
    expect(window.location.href).toContain("passengers=2");
    expect(window.location.href).toContain("seatClass=business");
    expect(window.location.href).toContain("tripType=round-trip");
    expect(window.location.href).toContain("promotion_id=99");
  });
});
