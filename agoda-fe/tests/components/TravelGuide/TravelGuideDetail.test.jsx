import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import TravelGuideDetail from "src-under-test/components/TravelGuide/TravelGuideDetail";

const mockCallFetchHandbookDetail = jest.fn();
const mockCallFetchHandbook = jest.fn();
const mockCallFetchInteraction = jest.fn();
const mockCallUpsertInteraction = jest.fn();
const mockCallFetchCountryDetail = jest.fn();
const mockCallFetchCityDetail = jest.fn();

Object.defineProperty(window, "scrollTo", { value: jest.fn(), writable: true });

jest.mock("config/api", () => ({
  callFetchHandbookDetail: (...args) => mockCallFetchHandbookDetail(...args),
  callFetchHandbook: (...args) => mockCallFetchHandbook(...args),
  callFetchDetailUserHandbookInteractionByHandbookId: (...args) => mockCallFetchInteraction(...args),
  callUpsertUserHandbookInteraction: (...args) => mockCallUpsertInteraction(...args),
  callFetchCountryDetail: (...args) => mockCallFetchCountryDetail(...args),
  callFetchCityDetail: (...args) => mockCallFetchCityDetail(...args),
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useParams: () => ({ countryId: "84", cityId: "10", travelId: "100" }),
}), { virtual: true });

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value,
  getUserAvatar: (value) => value,
}));

jest.mock("@ant-design/icons", () => ({
  RightOutlined: () => <span>right-icon</span>,
}));

jest.mock("antd", () => ({
  Breadcrumb: ({ items }) => <div>{items.map((item, i) => <span key={i}>{item.title}</span>)}</div>,
  Card: ({ children }) => <div>{children}</div>,
}));

describe("TravelGuideDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC ID: GUIDE-TC-001
  // MỤC TIÊU: Kiểm tra kịch bản "loads handbook detail, related articles and updates click interaction" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("loads handbook detail, related articles and updates click interaction", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCountryDetail.mockResolvedValue({ isSuccess: true, data: { id: 84, name: "Viet Nam" } });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCityDetail.mockResolvedValue({ isSuccess: true, data: { id: 10, name: "Da Nang", country: { id: 84 } } });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchHandbookDetail.mockResolvedValue({
      isSuccess: true,
      data: {
        id: 100,
        title: "Guide Detail",
        description: "<p>Detail content</p>",
        author: { id: 7, first_name: "A", last_name: "B", avatar: "a.jpg" },
      },
    });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchHandbook.mockResolvedValue({
      isSuccess: true,
      data: [{ id: 101, title: "Related Guide", image: "r.jpg", city: { id: 10, country: { id: 84 } } }],
    });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchInteraction.mockResolvedValue({
      isSuccess: true,
      data: { click_count: 2, positive_count: 1, negative_count: 0, neutral_count: 0 },
    });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TravelGuideDetail />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHandbookDetail).toHaveBeenCalledWith("100");
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallFetchHandbook).toHaveBeenCalledWith("current=1&pageSize=20&city_id=10&recommended=true");
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallUpsertInteraction).toHaveBeenCalledWith({
        handbook_id: 100,
        click_count: 3,
        positive_count: 1,
        negative_count: 0,
        neutral_count: 0,
      });
    });

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Guide Detail")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Tác giả: B A")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(await screen.findByText("Related Guide")).toBeInTheDocument();
  });

  // TC ID: GUIDE-TC-002
  // MỤC TIÊU: Kiểm tra kịch bản "creates initial interaction when handbook has no previous interaction" theo hành vi người dùng.
  // LÝ DO: Giúp dễ truy vết test case và xác nhận component đáp ứng đúng yêu cầu nghiệp vụ.
  it("creates initial interaction when handbook has no previous interaction", async () => {
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCountryDetail.mockResolvedValue({ isSuccess: true, data: { id: 84, name: "Viet Nam" } });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchCityDetail.mockResolvedValue({ isSuccess: true, data: { id: 10, name: "Da Nang", country: { id: 84 } } });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchHandbookDetail.mockResolvedValue({
      isSuccess: true,
      data: { id: 100, title: "Guide Detail", description: "<p>Detail content</p>" },
    });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchHandbook.mockResolvedValue({ isSuccess: true, data: [] });
    // Arrange: gia lap du lieu API tra ve de component chay theo dung kich ban test.
    mockCallFetchInteraction.mockResolvedValue({ isSuccess: false });

    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<TravelGuideDetail />);

    // Assert: cho dieu kien bat dong bo hoan tat truoc khi kiem tra ket qua.
    await waitFor(() => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(mockCallUpsertInteraction).toHaveBeenCalledWith({
        handbook_id: 100,
        click_count: 1,
        positive_count: 0,
        negative_count: 0,
        neutral_count: 0,
      });
    });
  });
});
