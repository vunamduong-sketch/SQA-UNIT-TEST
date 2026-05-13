import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TravelGuideCity from "src-under-test/components/TravelGuide/TravelGuideCity";

const mockCallFetchHandbook = jest.fn();
const mockCallFetchCityDetail = jest.fn();

Object.defineProperty(window, "scrollTo", { value: jest.fn(), writable: true });

jest.mock("config/api", () => ({
  callFetchHandbook: (...args) => mockCallFetchHandbook(...args),
  callFetchCityDetail: (...args) => mockCallFetchCityDetail(...args),
}));

jest.mock("constants/handbook", () => ({
  HANDBOOK_CATEGORIES: [
    { value: "all", label: "Tất cả" },
    { value: "culture", label: "Văn hóa" },
  ],
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useParams: () => ({ cityId: "10" }),
}), { virtual: true });

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value,
}));

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => <span>search-icon</span>,
}));

jest.mock("antd", () => {
  const Select = ({ value, onChange, options }) => (
    <select aria-label="city-category" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
  return {
    Card: ({ children }) => <div>{children}</div>,
    Empty: ({ description }) => <div>{description}</div>,
    Input: ({ placeholder, value, onChange }) => <input aria-label={placeholder} value={value} onChange={onChange} />,
    Pagination: ({ onChange }) => <button onClick={() => onChange(2, 10)}>page-2</button>,
    Select,
  };
});

describe("TravelGuideCity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC ID: GUIDE-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads city detail and featured guides" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads city detail and featured guides", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCityDetail.mockResolvedValue({ isSuccess: true, data: { id: 10, name: "Da Nang", country: { id: 84, name: "Viet Nam" }, image_handbook: "dn.jpg" } });
    mockCallFetchHandbook
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 1, title: "Guide DN", image: "g.jpg", city: { id: 10, country: { id: 84 } } }] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 2, title: "Guide City", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TravelGuideCity />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchCityDetail).toHaveBeenCalledWith("10");
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHandbook).toHaveBeenCalledWith("current=1&pageSize=3&city_id=10&recommended=true");
    });

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Guide DN")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Guide City")).toBeInTheDocument();
  });

  // TC ID: GUIDE-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "updates category and pagination for city guides" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("updates category and pagination for city guides", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCityDetail.mockResolvedValue({ isSuccess: true, data: { id: 10, name: "Da Nang", country: { id: 84 } } });
    mockCallFetchHandbook
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [] })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 2, title: "Guide City", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } })
      // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
      .mockResolvedValue({ isSuccess: true, data: [{ id: 3, title: "Guide Culture", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TravelGuideCity />);

    // Act: mo phong thao tac nhap/thay doi du lieu tren form.
    fireEvent.change(await screen.findByLabelText("city-category"), {
      target: { value: "culture" },
    });

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHandbook).toHaveBeenLastCalledWith(
        "current=1&pageSize=10&city_id=10&category=culture&recommended=true"
      );
    });
  });
});
