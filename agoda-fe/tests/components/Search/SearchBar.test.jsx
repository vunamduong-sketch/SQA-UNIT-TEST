import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchBar from "src-under-test/components/Search/SearchBar";
import { getCities } from "config/api";

jest.mock("config/api", () => ({
  getCities: jest.fn(),
}));

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => null,
  EnvironmentOutlined: () => null,
  UserOutlined: () => null,
  PlusOutlined: () => null,
  MinusOutlined: () => null,
}));

jest.mock("antd", () => {
  const React = require("react");

  const Input = ({ value, onChange, placeholder, onFocus, readOnly }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={onFocus}
      readOnly={readOnly}
    />
  );

  const Button = ({ children, onClick, disabled }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );

  const Popover = ({ children, content, open }) => (
    <div>
      {children}
      {open ? <div>{content}</div> : null}
    </div>
  );

  const Select = ({ value, onChange, children }) => (
    <select
      aria-label="Loai luu tru"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {children}
    </select>
  );

  Select.Option = ({ value, children }) => (
    <option value={value}>{children}</option>
  );

  const RangePicker = ({ onChange }) => (
    <button
      type="button"
      onClick={() =>
        onChange([
          { format: () => "01/05/2026" },
          { format: () => "03/05/2026" },
        ])
      }
    >
      Pick Dates
    </button>
  );

  return {
    Card: ({ children }) => <div>{children}</div>,
    Row: ({ children }) => <div>{children}</div>,
    Col: ({ children }) => <div>{children}</div>,
    DatePicker: { RangePicker },
    Button,
    Input,
    Popover,
    Divider: () => <hr />,
    Select,
  };
});

describe("SearchBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCities.mockResolvedValue({ data: [] });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("submits the current search values when the search button is clicked", () => {
    // TC_SEARCH_01
    const onSearch = jest.fn();

    render(
      <SearchBar
        onSearch={onSearch}
        initialValues={{
          location: "Nha Trang",
          cityId: 56,
          startDate: "2026-05-01",
          endDate: "2026-05-03",
          adult: 2,
          child: 1,
          room: 2,
          stay_type: "dayuse",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch.mock.calls[0][0]).toMatchObject({
      location: "Nha Trang",
      cityId: 56,
      adults: 2,
      children: 1,
      rooms: 2,
      stay_type: "dayuse",
    });
    expect(onSearch.mock.calls[0][0].dates).toHaveLength(2);
  });

  it("fetches city suggestions after debounce and auto-searches when a city is selected", async () => {
    // TC_SEARCH_02
    const onSearch = jest.fn();
    getCities.mockResolvedValue({
      data: [{ id: 79, name: "Ho Chi Minh City" }],
    });

    render(
      <SearchBar
        onSearch={onSearch}
        initialValues={{
          startDate: "2026-05-01",
          endDate: "2026-05-03",
          adult: 1,
        }}
      />
    );

    const locationInput = screen.getByPlaceholderText("Chọn điểm đến");
    fireEvent.focus(locationInput);
    fireEvent.change(locationInput, { target: { value: "Ho" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    await waitFor(() =>
      expect(getCities).toHaveBeenCalledWith({ name: "Ho" })
    );

    fireEvent.click(await screen.findByText("Ho Chi Minh City"));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch.mock.calls[0][0]).toMatchObject({
      location: "Ho Chi Minh City",
      cityId: 79,
      adults: 1,
    });
  });

  it("does not fetch suggestions when the query is shorter than two characters", () => {
    // TC_SEARCH_03
    render(<SearchBar onSearch={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Chọn điểm đến"), {
      target: { value: "H" },
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(getCities).not.toHaveBeenCalled();
  });
});
