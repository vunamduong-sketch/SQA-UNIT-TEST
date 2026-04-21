import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BookingVehicles from "src-under-test/components/BookingVehicles/index";

const mockNavigate = jest.fn();
const mockCallFetchCar = jest.fn();
const mockCreate = jest.fn();

jest.mock("redux/hooks", () => ({
  useAppSelector: jest.fn((selector) =>
    selector({
      account: {
        user: {
          id: 1,
          first_name: "An",
          last_name: "Nguyen",
          email: "an@example.com",
          phone_number: "0123456789",
        },
      },
    })
  ),
}));

jest.mock("config/api", () => ({
  callFetchCar: (...args) => mockCallFetchCar(...args),
  callBook: jest.fn(),
  callFetchDetailUserCarInteractionByCarId: jest.fn(),
  callUpsertUserCarInteraction: jest.fn(),
  callFetchAirport: jest.fn().mockResolvedValue({ isSuccess: true, data: [] }),
  callFetchLocationMapInAllWorld: jest
    .fn()
    .mockResolvedValue({ isSuccess: true, data: [] }),
  callFetchHotelQuery: jest.fn().mockResolvedValue({ isSuccess: true, data: [] }),
}));

jest.mock("groq-sdk", () =>
  jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: (...args) => mockCreate(...args),
      },
    },
  }))
);

jest.mock("react-router-dom", () => ({
  createSearchParams: jest.fn(),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      option: "from-airport",
      formFromAirportIn: {
        airportIn: { name: "Noi Bai", lat: 21.2189, lng: 105.8048 },
        locationTo: { name: "My Dinh", lat: 21.0285, lng: 105.7835 },
        timeStart: "2025-10-06T10:00:00.000Z",
        capacity: 2,
      },
      formFromLocationIn: {
        locationIn: { name: "Hanoi", lat: 21.0285, lng: 105.8542 },
        airportTo: { name: "Noi Bai", lat: 21.2189, lng: 105.8048 },
        timeStart: "2025-10-06T10:00:00.000Z",
        capacity: 2,
      },
    },
    search: "",
  }),
}), { virtual: true });

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

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
jest.mock("react-icons/bs", () => ({ BsFillLightningChargeFill: () => <span /> }));
jest.mock("react-icons/io5", () => ({
  IoAirplaneOutline: () => <span />,
  IoLocationOutline: () => <span />,
}));
jest.mock("react-icons/hi2", () => ({ HiOutlineUsers: () => <span /> }));

jest.mock("antd", () => {
  const React = require("react");
  const InputComponent = React.forwardRef(({ children, ...props }, ref) => (
    <input ref={ref} {...props}>{children}</input>
  ));
  InputComponent.Group = ({ children }) => <div>{children}</div>;
  const Select = ({ children, value, defaultValue, onChange, ...props }) => (
    <select
      data-testid={props["data-testid"]}
      value={value ?? defaultValue ?? ""}
      onChange={(event) => onChange?.(event.target.value)}
    >
      {children}
    </select>
  );
  Select.Option = ({ children, value }) => <option value={value}>{children}</option>;
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
    DatePicker: (props) => <input aria-label={props.placeholder || "date-picker"} />,
    Button: ({ children, onClick, disabled, ...props }) => (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Card: ({ children, onClick }) => <div onClick={onClick}>{children}</div>,
    Rate: () => <div />,
    Tag: ({ children }) => <span>{children}</span>,
    Input: InputComponent,
    Divider: () => <div />,
    Badge: ({ children }) => <div>{children}</div>,
    InputNumber: ({ value, onChange }) => (
      <input
        type="number"
        value={value ?? ""}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
    ),
    Checkbox,
    Radio: {
      Group: ({ children }) => <div>{children}</div>,
      Button: ({ children, value, onClick }) => (
        <button data-value={value} onClick={onClick}>
          {children}
        </button>
      ),
    },
    Popover: ({ children }) => <div>{children}</div>,
    Spin: () => <div>Loading...</div>,
    Empty: ({ description }) => <div>{description}</div>,
    Select,
  };
});

describe("BookingVehicles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Ha Noi" } }],
    });
    mockCallFetchCar.mockResolvedValue({ isSuccess: true, data: [] });
  });

  it("fetches car data and renders the empty state when no car is available", async () => {
    // TC_BOOKINGVEHICLES_01
    render(<BookingVehicles />);

    await waitFor(() =>
      expect(mockCallFetchCar).toHaveBeenCalledWith(
        "current=1&pageSize=20&driver_status=idle&driver_area_name=Ha Noi&recommended=true"
      )
    );
    expect(screen.getByText("Chưa có xe taxi")).toBeInTheDocument();
  });

  it("opens the extras section when the user clicks Add extras", async () => {
    // TC_BOOKINGVEHICLES_02
    render(<BookingVehicles />);

    await screen.findByText("Add extras");
    fireEvent.click(screen.getByText("Add extras"));

    expect(screen.getByText("Điểm dừng thêm")).toBeInTheDocument();
    expect(screen.getByText("Vật nuôi")).toBeInTheDocument();
  });
});
