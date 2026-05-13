import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TravelGuide from "src-under-test/components/TravelGuide/TravelGuide";

const mockCallFetchCountry = jest.fn();
const mockCallFetchCity = jest.fn();
const mockCallFetchHandbook = jest.fn();

jest.mock("config/api", () => ({
  callFetchCountry: (...args) => mockCallFetchCountry(...args),
  callFetchCity: (...args) => mockCallFetchCity(...args),
  callFetchHandbook: (...args) => mockCallFetchHandbook(...args),
}));

jest.mock("constants/handbook", () => ({
  HANDBOOK_CATEGORIES: [
    { value: "all", label: "Tất cả" },
    { value: "food", label: "Ẩm thực" },
  ],
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value,
}));

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => <span>search-icon</span>,
}));

jest.mock("antd", () => {
  const Select = ({ value, onChange, options }) => (
    <select aria-label="category-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
  return {
    Card: ({ children }) => <div>{children}</div>,
    Input: ({ placeholder, value, onChange }) => (
      <input aria-label={placeholder} value={value} onChange={onChange} />
    ),
    Pagination: ({ onChange }) => <button onClick={() => onChange(2, 20)}>page-2</button>,
    Select,
  };
});

describe("TravelGuide", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC ID: GUIDE-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads featured guides, countries, cities and recommendations" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads featured guides, countries, cities and recommendations", async () => {
    mockCallFetchHandbook
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 1, title: "Guide A", image: "a.jpg", city: { id: 2, country: { id: 3 } } }] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 5, title: "Guide B", image: "b.jpg", city: { id: 4, country: { id: 6 } } }], meta: { totalItems: 1, totalPages: 1 } })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValue({ isSuccess: true, data: [{ id: 5, title: "Guide B", image: "b.jpg", city: { id: 4, country: { id: 6 } } }], meta: { totalItems: 1, totalPages: 1 } });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCountry.mockResolvedValue({ isSuccess: true, data: [{ id: 9, name: "Viet Nam" }] });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCity.mockResolvedValue({ isSuccess: true, data: [{ id: 10, name: "Da Nang", country: { id: 9, name: "Viet Nam" } }] });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TravelGuide />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHandbook).toHaveBeenCalledWith("current=1&pageSize=3&recommended=true");
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchCountry).toHaveBeenCalledWith("current=1&pageSize=50");
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchCity).toHaveBeenCalledWith("current=1&pageSize=50");
    });

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Guide A")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Viet Nam")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Da Nang, Viet Nam")).toBeInTheDocument();
  });

  // TC ID: GUIDE-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "updates category and pagination query for recommendations" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates category and pagination query for recommendations", async () => {
    mockCallFetchHandbook
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [], meta: { totalItems: 0, totalPages: 0 } })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValue({ isSuccess: true, data: [], meta: { totalItems: 0, totalPages: 0 } });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCountry.mockResolvedValue({ isSuccess: true, data: [] });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCity.mockResolvedValue({ isSuccess: true, data: [] });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TravelGuide />);

    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(await screen.findByLabelText("category-select"), {
      target: { value: "food" },
    });
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByText("page-2"));

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHandbook).toHaveBeenLastCalledWith(
        "current=2&pageSize=20&category=food&recommended=true"
      );
    });
  });
});
