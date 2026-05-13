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

  // TC ID: FLIGHT-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "swaps origin and destination when clicking the swap button" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("swaps origin and destination when clicking the swap button", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(
      <SearchBarSection
        defaultOrigin="1"
        defaultDestination="2"
        airports={airports}
      />
    );

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByLabelText("Đảo chiều đi/đến"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Tìm"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(window.location.href).toContain("origin=2");
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(window.location.href).toContain("destination=1");
    });
  });

  // TC ID: FLIGHT-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "updates passenger count from the guest picker" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates passenger count from the guest picker", async () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<SearchBarSection defaultPassengers={2} airports={airports} />);

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("2 khách"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("+"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(screen.getByText("3 khách")).toBeInTheDocument();
    });
  });

  // TC ID: TC_FLIGHT_03

  // MỤC TIÊU: Kiểm tra kịch bản "builds the flight search URL when searching".
  // LÝ DO: Đảm bảo test case có mã nhận diện rõ ràng và tập trung vào hành vi người dùng.
  it("builds the flight search URL when searching", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
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

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Tìm"));

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("/flight?");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("origin=1");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("destination=2");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("departureDate=2026-05-01");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("returnDate=2026-05-05");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("passengers=2");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("seatClass=business");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("tripType=round-trip");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(window.location.href).toContain("promotion_id=99");
  });
});
