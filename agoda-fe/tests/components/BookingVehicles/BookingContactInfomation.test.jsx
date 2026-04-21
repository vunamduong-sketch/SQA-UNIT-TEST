import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import BookingContactInfomation from "src-under-test/components/BookingVehicles/BookingContactInfomation";

jest.mock("redux/hooks", () => ({
  useAppSelector: jest.fn((selector) =>
    selector({
      account: {
        user: {
          first_name: "An",
          last_name: "Nguyen",
          email: "an@example.com",
          phone_number: "0123456789",
        },
      },
    })
  ),
}));

jest.mock("react-router-dom", () => ({
  useLocation: () => ({
    state: null,
  }),
}), { virtual: true });

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div />,
}));

jest.mock("react-leaflet-cluster", () => ({ children }) => <div>{children}</div>);
jest.mock("leaflet", () => ({ Icon: jest.fn() }));
jest.mock("@ant-design/icons", () => {
  const React = require("react");
  const MockIcon = (props) => <span {...props} />;
  return new Proxy(
    {},
    {
      get: () => MockIcon,
    }
  );
});
jest.mock("react-icons/md", () => ({ MdOutlineFreeCancellation: () => <span /> }));

jest.mock("antd", () => {
  const React = require("react");
  const InputComponent = React.forwardRef(({ children, ...props }, ref) => (
    <input ref={ref} {...props}>{children}</input>
  ));
  InputComponent.Group = ({ children }) => <div>{children}</div>;
  const Select = ({ children, value, defaultValue, onChange, ...props }) => (
    <select
      aria-label={props["aria-label"] || props.placeholder || "select"}
      value={value ?? defaultValue ?? ""}
      onChange={(event) => onChange?.(event.target.value)}
    >
      {children}
    </select>
  );
  Select.Option = ({ children, value }) => (
    <option value={value}>{typeof children === "string" ? children : value}</option>
  );
  const Checkbox = ({ children, checked, onChange }) => (
    <label>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(event) => onChange?.({ target: { checked: event.target.checked } })}
      />
      {children}
    </label>
  );
  return {
    Input: InputComponent,
    Select,
    Button: ({ children, disabled, ...props }) => (
      <button disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Card: ({ children }) => <div>{children}</div>,
    Checkbox,
    Divider: () => <div />,
  };
});

describe("BookingContactInfomation", () => {
  it("prefills user information from the store", () => {
    // TC_BOOKINGVEHICLES_03
    render(<BookingContactInfomation />);

    expect(screen.getByDisplayValue("An")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nguyen")).toBeInTheDocument();
    expect(screen.getByDisplayValue("an@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0123456789")).toBeInTheDocument();
  });

  it("enables the booking button after the terms checkbox is checked", () => {
    // TC_BOOKINGVEHICLES_04
    render(<BookingContactInfomation />);

    const submitButton = screen.getByRole("button", { name: "Đặt bây giờ →" });
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox"));

    expect(submitButton).toBeEnabled();
  });
});
