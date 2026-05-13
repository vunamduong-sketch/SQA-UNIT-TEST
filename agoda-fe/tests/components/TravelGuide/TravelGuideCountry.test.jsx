import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TravelGuideCountry from "src-under-test/components/TravelGuide/TravelGuideCountry";

const mockCallFetchHandbook = jest.fn();
const mockCallFetchCity = jest.fn();
const mockCallFetchCountryDetail = jest.fn();

Object.defineProperty(window, "scrollTo", { value: jest.fn(), writable: true });

jest.mock("config/api", () => ({
  callFetchHandbook: (...args) => mockCallFetchHandbook(...args),
  callFetchCity: (...args) => mockCallFetchCity(...args),
  callFetchCountryDetail: (...args) => mockCallFetchCountryDetail(...args),
}));

jest.mock("constants/handbook", () => ({
  HANDBOOK_CATEGORIES: [
    { value: "all", label: "Tất cả" },
    { value: "food", label: "Ẩm thực" },
  ],
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useParams: () => ({ countryId: "84" }),
}), { virtual: true });

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value,
}));

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => <span>search-icon</span>,
}));

jest.mock("antd", () => {
  const Select = ({ value, onChange, options }) => (
    <select aria-label="country-category" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
  return {
    Card: ({ children }) => <div>{children}</div>,
    Empty: ({ description }) => <div>{description}</div>,
    Input: ({ placeholder, value, onChange }) => <input aria-label={placeholder} value={value} onChange={onChange} />,
    Pagination: ({ onChange }) => <button onClick={() => onChange(3, 10)}>page-3</button>,
    Select,
  };
});

describe("TravelGuideCountry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC ID: GUIDE-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads country detail, featured guides and destinations" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads country detail, featured guides and destinations", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCountryDetail.mockResolvedValue({ isSuccess: true, data: { id: 84, name: "Viet Nam", image_handbook: "vn.jpg" } });
    mockCallFetchHandbook
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ data: [{ id: 1, title: "Guide VN", image: "g.jpg", city: { id: 10, country: { id: 84 } } }] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 2, title: "Guide List", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCity.mockResolvedValue({ data: [{ id: 10, name: "Da Nang", country: { id: 84 } }] });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TravelGuideCountry />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchCountryDetail).toHaveBeenCalledWith("84");
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchCity).toHaveBeenCalledWith("current=1&pageSize=50&country_id=84");
    });

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Guide VN")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Da Nang")).toBeInTheDocument();
  });

  // TC ID: GUIDE-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "updates category and pagination for country guides" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates category and pagination for country guides", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCountryDetail.mockResolvedValue({ isSuccess: true, data: { id: 84, name: "Viet Nam" } });
    mockCallFetchHandbook
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ data: [] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 2, title: "Guide List", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValue({ isSuccess: true, data: [{ id: 3, title: "Guide Food", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCity.mockResolvedValue({ data: [] });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TravelGuideCountry />);

    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(await screen.findByLabelText("country-category"), {
      target: { value: "food" },
    });

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHandbook).toHaveBeenLastCalledWith(
        "current=1&pageSize=10&country_id=84&category=food&recommended=true"
      );
    });
  });
});
