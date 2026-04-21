import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ActivityCity from "src-under-test/components/ActivityCity";
import { callFetchActivity } from "config/api";

const mockSetSearchParams = jest.fn();
const mockUseLocation = jest.fn();
const mockUseParams = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock("config/api", () => ({
  callFetchActivity: jest.fn(),
}));

jest.mock("constants/activity", () => ({
  RANGE_PRICE: 100000,
}));

jest.mock("utils/formatCurrency", () => ({
  formatCurrency: jest.fn((value) => `formatted-${value}`),
}));

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => null,
}));

jest.mock("react-icons/bs", () => ({
  BsLightningChargeFill: () => null,
}), { virtual: true });

jest.mock("react-icons/fa", () => ({
  FaCar: () => null,
  FaStar: () => null,
}), { virtual: true });

jest.mock("react-icons/fa6", () => ({
  FaTent: () => null,
}), { virtual: true });

jest.mock("react-icons/im", () => ({
  ImSpoonKnife: () => null,
}), { virtual: true });

jest.mock("react-icons/io", () => ({
  IoIosStar: () => null,
  IoMdMusicalNote: () => null,
}), { virtual: true });

jest.mock("react-icons/md", () => ({
  MdTour: () => null,
  MdWindow: () => null,
}), { virtual: true });

jest.mock("react-icons/pi", () => ({
  PiListChecksFill: () => null,
}), { virtual: true });

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
    useLocation: () => mockUseLocation(),
    useParams: () => mockUseParams(),
    useSearchParams: () => mockUseSearchParams(),
  }),
  { virtual: true }
);

jest.mock("antd", () => {
  const React = require("react");

  const Input = ({ value, onChange, placeholder }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  );

  const RadioGroup = ({ options = [], value, onChange, className }) => (
    <div className={className}>
      {options.map((option) => (
        <label key={String(option.value)}>
          <input
            type="radio"
            name={`radio-${className || "group"}`}
            checked={value === option.value}
            onChange={() => onChange({ target: { value: option.value } })}
          />
          <span>{typeof option.label === "string" ? option.label : option.value}</span>
        </label>
      ))}
    </div>
  );

  const Slider = ({ value, onChange }) => (
    <button type="button" onClick={() => onChange([10, 50])}>
      slider-{value.join("-")}
    </button>
  );

  const Collapse = () => <div>Collapse</div>;
  const Tag = ({ children }) => <span>{children}</span>;

  return {
    Checkbox: ({ children }) => <label>{children}</label>,
    Collapse,
    Input,
    Radio: { Group: RadioGroup },
    Slider,
    Tag,
  };
});

describe("ActivityCity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ state: { keyword: "beach" } });
    mockUseParams.mockReturnValue({ cityId: "5" });
    mockUseSearchParams.mockReturnValue([
      {
        get: (key) => {
          if (key === "current") return "1";
          if (key === "category") return "all";
          return null;
        },
      },
      mockSetSearchParams,
    ]);
    window.scrollTo = jest.fn();
    callFetchActivity.mockResolvedValue({
      isSuccess: true,
      data: [
        {
          id: 101,
          name: "Island Tour",
          avg_star: 4.2,
          avg_price: 500000,
          images: [{ image: "/tour.jpg" }],
        },
      ],
      meta: {
        totalItems: 50,
        currentPage: 1,
        itemsPerPage: 30,
        totalPages: 2,
      },
    });
  });

  it("fetches activities with the expected initial query and renders result items", async () => {
    // TC_ACTIVITYCITY_01
    render(<ActivityCity />);

    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenCalledWith(
        "current=1&pageSize=30&city_id=5&name=beach&recommended=true&min_avg_price=0&max_avg_price=10000000&min_total_time=0"
      )
    );

    expect(await screen.findByText("Island Tour")).toBeInTheDocument();
    expect(screen.getByText("formatted-500000")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 trên 2")).toBeInTheDocument();
  });

  it("updates the query when the keyword changes", async () => {
    // TC_ACTIVITYCITY_02
    render(<ActivityCity />);

    const searchInput = screen.getByPlaceholderText("Tìm kiếm");
    fireEvent.change(searchInput, { target: { value: "museum" } });

    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenLastCalledWith(
        "current=1&pageSize=30&city_id=5&name=museum&recommended=true&min_avg_price=0&max_avg_price=10000000&min_total_time=0"
      )
    );
  });

  it("moves to the next page and updates search params", async () => {
    // TC_ACTIVITYCITY_03
    render(<ActivityCity />);

    fireEvent.click(await screen.findByText("Tiếp theo"));

    await waitFor(() =>
      expect(mockSetSearchParams).toHaveBeenCalledWith({
        current: 2,
        category: "all",
      })
    );

    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenLastCalledWith(
        "current=2&pageSize=30&city_id=5&name=beach&recommended=true&min_avg_price=0&max_avg_price=10000000&min_total_time=0"
      )
    );
  });
});
