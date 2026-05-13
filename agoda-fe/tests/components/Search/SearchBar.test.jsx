import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import SearchBar from "src-under-test/components/Search/SearchBar";
import { getCities } from "config/api";

// ============================================================
// TÊN FILE TEST: SearchBar.test.jsx
// MÔ TẢ: Kiểm tra form tìm kiếm khách sạn: submit search values,
//        debounce gọi API gợi ý thành phố, auto-search khi chọn city,
//        và không gọi API với query quá ngắn.
//        Test dựa trên specification/user-facing behavior, tránh phụ thuộc JSX nội bộ.
// ============================================================

// Mock API city suggestion để test contract gọi API mà không request network thật.
jest.mock("config/api", () => ({
  getCities: jest.fn(),
}));

// Mock icon để unit test không phụ thuộc package icon.
jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => null,
  EnvironmentOutlined: () => null,
  UserOutlined: () => null,
  PlusOutlined: () => null,
  MinusOutlined: () => null,
}));

// Mock Ant Design thành các HTML control đơn giản để test theo tương tác user.
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
  // --- Setup chung ---
  beforeEach(() => {
    // Xóa mock trước mỗi TC để call count API/onSearch độc lập.
    jest.clearAllMocks();
    // Mặc định API trả danh sách rỗng nếu test không override.
    getCities.mockResolvedValue({ data: [] });
    // Dùng fake timers để kiểm soát debounce 300ms một cách deterministic.
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Dọn timer pending rồi trả Jest về timer thật để không ảnh hưởng test khác.
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // TC ID: SEARCH-TC-001
  // MỤC TIÊU: Khi user click nút "Tìm kiếm", form gửi đúng các giá trị hiện tại.
  // LÝ DO: Search result phụ thuộc trực tiếp vào location, ngày, số khách/phòng và loại lưu trú.
  it("SEARCH-TC-001 - submits the current search values when the search button is clicked", () => {
    const onSearch = jest.fn();

    // Input: Form được khởi tạo với đầy đủ thông tin tìm kiếm.
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

    // Action: User bấm nút tìm kiếm.
    fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }));

    // Expected: onSearch được gọi đúng một lần.
    expect(onSearch).toHaveBeenCalledTimes(1);

    // Expected: Payload chứa đúng location/cityId/số khách/số phòng/loại lưu trú.
    expect(onSearch.mock.calls[0][0]).toMatchObject({
      location: "Nha Trang",
      cityId: 56,
      adults: 2,
      children: 1,
      rooms: 2,
      stay_type: "dayuse",
    });

    // Expected: Date range có đủ ngày nhận/trả phòng.
    expect(onSearch.mock.calls[0][0].dates).toHaveLength(2);
  });

  // TC ID: SEARCH-TC-002
  // MỤC TIÊU: Sau debounce 300ms, component gọi API gợi ý city và tự search
  //           khi user chọn một city hợp lệ.
  // LÝ DO: Đây là flow chính giúp user chọn đúng điểm đến từ suggestion backend.
  it("SEARCH-TC-002 - fetches city suggestions after debounce and auto-searches when a city is selected", async () => {
    const onSearch = jest.fn();
    // Input: API trả về một city suggestion.
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

    // Action: User focus và nhập query đủ 2 ký tự.
    const locationInput = screen.getByPlaceholderText("Chọn điểm đến");
    fireEvent.focus(locationInput);
    fireEvent.change(locationInput, { target: { value: "Ho" } });

    // Action: Cho debounce 300ms chạy xong.
    await act(async () => {
      jest.advanceTimersByTime(300);
      await Promise.resolve();
    });

    // Expected: API city suggestion được gọi đúng params.
    await waitFor(() =>
      expect(getCities).toHaveBeenCalledWith({ name: "Ho" })
    );

    // Action: User chọn city suggestion từ popover.
    fireEvent.click(await screen.findByText("Ho Chi Minh City"));

    // Expected: Sau khi chọn city, onSearch tự chạy với city name và cityId đã chọn.
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch.mock.calls[0][0]).toMatchObject({
      location: "Ho Chi Minh City",
      cityId: 79,
      adults: 1,
    });
  });

  // TC ID: SEARCH-TC-003
  // MỤC TIÊU: Không gọi API suggestion khi query ngắn hơn 2 ký tự.
  // LÝ DO: Tránh request thừa, giảm tải backend và hạn chế kết quả không hữu ích.
  it("SEARCH-TC-003 - does not fetch suggestions when the query is shorter than two characters", () => {
    render(<SearchBar onSearch={jest.fn()} />);

    // Action: User nhập query chỉ có 1 ký tự.
    fireEvent.change(screen.getByPlaceholderText("Chọn điểm đến"), {
      target: { value: "H" },
    });

    // Action: Cho debounce chạy hết 300ms.
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Expected: API không được gọi vì query không đủ điều kiện.
    expect(getCities).not.toHaveBeenCalled();
  });
});
