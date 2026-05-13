import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ActivityCity from "src-under-test/components/ActivityCity";
import { callFetchActivity } from "config/api";

// ============================================================
// TÊN FILE TEST: index.test.jsx
// MÔ TẢ: Kiểm tra trang danh sách hoạt động theo city: gọi API với query
//        ban đầu, render activity cards, tìm kiếm theo keyword, phân trang,
//        filter category/sort/price và xử lý response thất bại.
//        Test dựa trên specification/user-facing behavior, không kiểm tra
//        className hoặc cấu trúc JSX nội bộ.
// ============================================================

const mockSetSearchParams = jest.fn();
const mockUseLocation = jest.fn();
const mockUseParams = jest.fn();
const mockUseSearchParams = jest.fn();

// Mock API danh sách activity để kiểm tra contract query và dữ liệu render.
jest.mock("config/api", () => ({
  callFetchActivity: jest.fn(),
}));

// Mock hằng số giá để query price range deterministic trong test.
jest.mock(
  "constants/activity",
  () => ({
    RANGE_PRICE: 100000,
  }),
  { virtual: true }
);

// Mock formatCurrency để assertion giá không phụ thuộc Intl/browser locale.
jest.mock("utils/formatCurrency", () => ({
  formatCurrency: jest.fn((value) => `formatted-${value}`),
}));

// Mock icon để unit test không phụ thuộc thư viện icon.
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

// Mock router để kiểm soát cityId, location state, query params và link href.
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

// Mock Ant Design bằng control HTML đơn giản để tương tác như user.
jest.mock("antd", () => {
  const React = require("react");

  const renderLabel = (label) =>
    typeof label === "string" || typeof label === "number" ? label : label;

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
          <span>{renderLabel(option.label)}</span>
        </label>
      ))}
    </div>
  );

  const Slider = ({ value, onChange }) => (
    <button type="button" onClick={() => onChange([10, 50])}>
      slider-{value.join("-")}
    </button>
  );

  const Collapse = ({ items = [] }) => (
    <div>
      {items.map((item) => (
        <div key={item.key}>
          {item.label}
          {item.children}
        </div>
      ))}
    </div>
  );

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

const successfulActivityResponse = {
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
};

describe("ActivityCity", () => {
  // --- Setup chung ---
  beforeEach(() => {
    // Xóa mock để từng TC độc lập về API calls và search params.
    jest.clearAllMocks();
    // Thiết lập keyword từ navigation state để query ban đầu có name=beach.
    mockUseLocation.mockReturnValue({ state: { keyword: "beach" } });
    // Thiết lập cityId trên route /activity/city/:cityId.
    mockUseParams.mockReturnValue({ cityId: "5" });
    // Thiết lập query params ban đầu current=1, category=all.
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
    // Mock scrollTo vì component gọi khi page/query thay đổi.
    window.scrollTo = jest.fn();
    process.env.REACT_APP_BE_URL = "https://cdn.example.test";
    callFetchActivity.mockResolvedValue(successfulActivityResponse);
  });

  // TC ID: ACTCITY-TC-001
  // MỤC TIÊU: Khi trang mount, component gọi API với cityId, keyword,
  //           recommended sort và filter mặc định; sau đó render card activity.
  // LÝ DO: Đây là luồng chính để user thấy danh sách hoạt động theo thành phố.
  it("ACTCITY-TC-001 - fetches activities with the expected initial query and renders result items", async () => {
    render(<ActivityCity />);

    // Expected: API được gọi đúng query mặc định từ route/search params/state.
    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenCalledWith(
        "current=1&pageSize=30&city_id=5&name=beach&recommended=true&min_avg_price=0&max_avg_price=10000000&min_total_time=0"
      )
    );

    // Expected: Activity name, giá format và pagination render cho user.
    expect(await screen.findByText("Island Tour")).toBeInTheDocument();
    expect(screen.getByText("formatted-500000")).toBeInTheDocument();
    expect(screen.getByText("Trang 1 trên 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Island Tour/i })).toHaveAttribute(
      "href",
      "/activity/detail/101"
    );
  });

  // TC ID: ACTCITY-TC-002
  // MỤC TIÊU: Khi user đổi keyword trong ô tìm kiếm, component gọi lại API
  //           với name mới và giữ các filter mặc định còn lại.
  // LÝ DO: User cần lọc activity theo từ khóa ngay trên trang city.
  it("ACTCITY-TC-002 - updates the query when the keyword changes", async () => {
    render(<ActivityCity />);

    // Action: User nhập keyword mới.
    const searchInput = screen.getByPlaceholderText("Tìm kiếm");
    fireEvent.change(searchInput, { target: { value: "museum" } });

    // Expected: API call cuối cùng dùng name=museum.
    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenLastCalledWith(
        "current=1&pageSize=30&city_id=5&name=museum&recommended=true&min_avg_price=0&max_avg_price=10000000&min_total_time=0"
      )
    );
  });

  // TC ID: ACTCITY-TC-003
  // MỤC TIÊU: Khi user bấm "Tiếp theo", component cập nhật URL params và
  //           gọi API với current page mới.
  // LÝ DO: Pagination phải giữ đúng category hiện tại và tải đúng trang tiếp theo.
  it("ACTCITY-TC-003 - moves to the next page and updates search params", async () => {
    render(<ActivityCity />);

    // Action: User bấm nút trang tiếp theo.
    fireEvent.click(await screen.findByText("Tiếp theo"));

    // Expected: URL search params được cập nhật current=2, category=all.
    await waitFor(() =>
      expect(mockSetSearchParams).toHaveBeenCalledWith({
        current: 2,
        category: "all",
      })
    );

    // Expected: API gọi lại với current=2.
    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenLastCalledWith(
        "current=2&pageSize=30&city_id=5&name=beach&recommended=true&min_avg_price=0&max_avg_price=10000000&min_total_time=0"
      )
    );
  });

  // TC ID: ACTCITY-TC-004
  // MỤC TIÊU: Khi user chọn category "Chuyến tham quan", component cập nhật
  //           search params và gọi API với category=journey.
  // LÝ DO: Category filter giúp user thu hẹp danh sách activity theo nhu cầu.
  it("ACTCITY-TC-004 - filters activities by selected category", async () => {
    render(<ActivityCity />);

    // Action: User chọn category Chuyến tham quan ở filter.
    fireEvent.click((await screen.findAllByText("Chuyến tham quan"))[0]);

    // Expected: URL params lưu category mới.
    await waitFor(() =>
      expect(mockSetSearchParams).toHaveBeenCalledWith(
        expect.objectContaining({ category: "journey" })
      )
    );

    // Expected: API query có category=journey.
    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenLastCalledWith(
        "current=1&pageSize=30&city_id=5&category=journey&name=beach&recommended=true&min_avg_price=0&max_avg_price=10000000&min_total_time=0"
      )
    );
  });

  // TC ID: ACTCITY-TC-005
  // MỤC TIÊU: Khi user chọn sort "Giá thấp nhất trước", component gọi API
  //           với sort=avg_price-asc.
  // LÝ DO: Sort giá thấp giúp user tìm hoạt động phù hợp ngân sách.
  it("ACTCITY-TC-005 - sorts activities by lowest price first", async () => {
    render(<ActivityCity />);

    // Action: User chọn sort giá thấp nhất trước.
    fireEvent.click(await screen.findByText("Giá thấp nhất trước"));

    // Expected: API query chuyển từ recommended sang sort=avg_price-asc.
    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenLastCalledWith(
        "current=1&pageSize=30&city_id=5&name=beach&sort=avg_price-asc&min_avg_price=0&max_avg_price=10000000&min_total_time=0"
      )
    );
  });

  // TC ID: ACTCITY-TC-006
  // MỤC TIÊU: Khi user thay đổi price slider, component gọi API với min/max
  //           price mới dựa trên RANGE_PRICE.
  // LÝ DO: Price filter là điều kiện quan trọng để user giới hạn kết quả theo ngân sách.
  it("ACTCITY-TC-006 - applies the selected price range to the API query", async () => {
    render(<ActivityCity />);

    // Action: Mock slider đổi value từ [0,100] sang [10,50].
    fireEvent.click(await screen.findByText("slider-0-100"));

    // Expected: Query có min_avg_price=1.000.000 và max_avg_price=5.000.000.
    await waitFor(() =>
      expect(callFetchActivity).toHaveBeenLastCalledWith(
        "current=1&pageSize=30&city_id=5&name=beach&recommended=true&min_avg_price=1000000&max_avg_price=5000000&min_total_time=0"
      )
    );
  });

  // TC ID: ACTCITY-TC-007
  // MỤC TIÊU: Khi API trả isSuccess=false, component không render stale data.
  // LÝ DO: User không nên thấy dữ liệu không được backend xác nhận thành công.
  it("ACTCITY-TC-007 - does not render activity cards when API response is unsuccessful", async () => {
    // Input: API thất bại nhưng payload vẫn có data giả.
    callFetchActivity.mockResolvedValue({
      isSuccess: false,
      data: [
        {
          id: 999,
          name: "Stale Activity",
          avg_star: 5,
          avg_price: 999000,
          images: [{ image: "/stale.jpg" }],
        },
      ],
      meta: { currentPage: 1, totalPages: 1 },
    });

    render(<ActivityCity />);

    // Expected: API đã được gọi nhưng data không render vì isSuccess=false.
    await waitFor(() => expect(callFetchActivity).toHaveBeenCalledTimes(1));
    expect(screen.queryByText("Stale Activity")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Stale Activity/i })).not.toBeInTheDocument();
  });
});
