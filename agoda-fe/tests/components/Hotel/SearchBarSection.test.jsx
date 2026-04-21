import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchBarSection from "src-under-test/components/Hotel/SearchBarSection";

const mockCallSearchRoomQuery = jest.fn();
const mockCallLocationSuggestions = jest.fn();

jest.mock("config/api", () => ({
  callSearchRoomQuery: (...args) => mockCallSearchRoomQuery(...args),
  callLocationSuggestions: (...args) => mockCallLocationSuggestions(...args),
}));

jest.mock("redux/hooks", () => ({
  useAppSelector: (selector) =>
    selector({
      hotel: { hotelDetail: { name: "Hotel Test" } },
      account: { user: {} },
    }),
}));

jest.mock("@mui/icons-material", () => ({
  People: () => <span>people</span>,
  Search: () => <span>search</span>,
}));

jest.mock("antd", () => {
  const React = require("react");
  const Select = ({ value, onChange, children }) => (
    <select aria-label="stay-type" value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  );
  Select.Option = ({ value, children }) => <option value={value}>{children}</option>;
  const DatePicker = ({ onChange }) => (
    <input aria-label="single-date" onChange={(e) => onChange({ format: () => e.target.value })} />
  );
  DatePicker.RangePicker = ({ onChange }) => (
    <button onClick={() => onChange([], ["2026-05-01", "2026-05-03"])}>choose-range</button>
  );
  const Popover = ({ children, content, open }) => (
    <div>
      {children}
      {open ? content : null}
    </div>
  );
  const List = ({ dataSource, renderItem }) => <div>{dataSource.map((item, idx) => <div key={idx}>{renderItem(item)}</div>)}</div>;
  List.Item = ({ children, onClick }) => <button onClick={onClick}>{children}</button>;
  return { DatePicker, Select, Popover, List };
});

describe("Hotel SearchBarSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads location suggestions and selects one", async () => {
    // TC_HOTEL_01
    mockCallLocationSuggestions.mockResolvedValue({
      data: [{ name: "Da Nang Riverside" }],
    });

    render(
      <SearchBarSection
        setFocusDatePicker={jest.fn()}
        initialValues={{ location: "Hotel Test" }}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Nhập tên khách sạn..."), {
      target: { value: "Da N" },
    });

    await waitFor(() => {
      expect(mockCallLocationSuggestions).toHaveBeenCalledWith("Da N", "hotel");
    });

    const suggestion = await screen.findByText("Da Nang Riverside");
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(screen.queryByText("Da Nang Riverside")).not.toBeInTheDocument();
    });
  });

  it("submits search data with returned hotel rooms", async () => {
    // TC_HOTEL_02
    const onSearch = jest.fn();
    const setFocusDatePicker = jest.fn();
    mockCallSearchRoomQuery.mockResolvedValue({
      data: { id: 77, rooms: [{ id: 1 }] },
    });

    render(
      <SearchBarSection
        onSearch={onSearch}
        setFocusDatePicker={setFocusDatePicker}
        initialValues={{ location: "Hotel Test", stay_type: "overnight" }}
      />
    );

    fireEvent.click(screen.getByText("choose-range"));
    fireEvent.click(screen.getByText("Cập nhật"));

    await waitFor(() => {
      expect(mockCallSearchRoomQuery).toHaveBeenCalled();
      expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
        hotelId: 77,
        rooms: [{ id: 1 }],
        startDate: "2026-05-01",
        endDate: "2026-05-03",
      }));
    });
  });
});
