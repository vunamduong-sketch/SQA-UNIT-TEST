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

  // TC ID: HOTEL-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads location suggestions and selects one" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads location suggestions and selects one", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallLocationSuggestions.mockResolvedValue({
      data: [{ name: "Da Nang Riverside" }],
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(
      <SearchBarSection
        setFocusDatePicker={jest.fn()}
        initialValues={{ location: "Hotel Test" }}
      />
    );

    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(screen.getByPlaceholderText("Nhập tên khách sạn..."), {
      target: { value: "Da N" },
    });

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallLocationSuggestions).toHaveBeenCalledWith("Da N", "hotel");
    });

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const suggestion = await screen.findByText("Da Nang Riverside");
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(suggestion);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(screen.queryByText("Da Nang Riverside")).not.toBeInTheDocument();
    });
  });

  // TC ID: HOTEL-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "submits search data with returned hotel rooms" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("submits search data with returned hotel rooms", async () => {
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const onSearch = jest.fn();
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const setFocusDatePicker = jest.fn();
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallSearchRoomQuery.mockResolvedValue({
      data: { id: 77, rooms: [{ id: 1 }] },
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(
      <SearchBarSection
        onSearch={onSearch}
        setFocusDatePicker={setFocusDatePicker}
        initialValues={{ location: "Hotel Test", stay_type: "overnight" }}
      />
    );

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("choose-range"));
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("Cập nhật"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallSearchRoomQuery).toHaveBeenCalled();
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(onSearch).toHaveBeenCalledWith(expect.objectContaining({
        hotelId: 77,
        rooms: [{ id: 1 }],
        startDate: "2026-05-01",
        endDate: "2026-05-03",
      }));
    });
  });
});
