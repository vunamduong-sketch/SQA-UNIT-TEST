import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import HotelList from "src-under-test/components/Search/HotelList";

// ============================================================
// TÊN FILE TEST: HotelList.test.jsx
// MÔ TẢ: Kiểm tra danh sách kết quả khách sạn trong Search gồm các trạng thái
//        loading, empty, render hotel cards và tương tác chọn sort option.
//        Test dựa vào behavior user nhìn thấy, không kiểm tra implementation nội bộ.
// ============================================================

// Mock HotelCard để HotelList test chỉ tập trung vào composition/list behavior.
jest.mock("src-under-test/components/Search/HotelCard", () => ({
  __esModule: true,
  default: ({ hotel }) => <div data-testid="hotel-card">{hotel.name}</div>,
}));

// Mock icon để tránh phụ thuộc Ant Design icons trong unit test.
jest.mock("@ant-design/icons", () => ({
  AppstoreOutlined: () => null,
  UnorderedListOutlined: () => null,
  SortAscendingOutlined: () => null,
}));

// Mock Ant Design bằng HTML đơn giản để assert text/loading/empty state.
jest.mock("antd", () => ({
  Row: ({ children }) => <div>{children}</div>,
  Col: ({ children }) => <div>{children}</div>,
  Spin: () => <div>Loading Spinner</div>,
  Empty: ({ description }) => <div>{description}</div>,
  Select: ({ children }) => <div>{children}</div>,
  Button: ({ children }) => <button type="button">{children}</button>,
}));

describe("HotelList", () => {
  // TC ID: SEARCH-TC-004
  // MỤC TIÊU: Khi Search đang tải dữ liệu khách sạn, UI phải hiển thị loading state.
  // LÝ DO: User cần biết hệ thống đang xử lý, tránh hiểu nhầm là không có kết quả.
  it("SEARCH-TC-004 - shows the loading state while data is being fetched", () => {
    // Input: loading=true và chưa có hotels.
    render(<HotelList hotels={[]} loading />);

    // Expected: Spinner loading hiển thị trên màn hình.
    expect(screen.getByText("Loading Spinner")).toBeInTheDocument();
  });

  // TC ID: SEARCH-TC-005
  // MỤC TIÊU: Khi loading=false và không có hotel, UI phải hiển thị empty state.
  // LÝ DO: User cần feedback rõ ràng rằng không tìm thấy khách sạn phù hợp.
  it("SEARCH-TC-005 - shows the empty state when there are no hotels", () => {
    // Input: hotels rỗng sau khi load xong.
    render(<HotelList hotels={[]} loading={false} />);

    // Expected: Message empty state đúng nội dung tiếng Việt.
    expect(
      screen.getByText("Không tìm thấy khách sạn nào phù hợp")
    ).toBeInTheDocument();
  });

  // TC ID: SEARCH-TC-006
  // MỤC TIÊU: Khi có dữ liệu, HotelList render đúng số lượng card và cho phép
  //           user chọn sort option.
  // LÝ DO: Search result phải hiển thị đủ kết quả và phản hồi tương tác sort.
  it("SEARCH-TC-006 - renders hotel cards and updates the selected sort option", () => {
    // Input: Danh sách có 2 khách sạn.
    render(
      <HotelList
        hotels={[
          { id: 1, name: "Hotel Alpha" },
          { id: 2, name: "Hotel Beta" },
        ]}
      />
    );

    // Expected: Render đúng 2 HotelCard tương ứng 2 hotels.
    expect(screen.getAllByTestId("hotel-card")).toHaveLength(2);

    // Expected: Header kết quả hiển thị số lượng khách sạn tìm thấy.
    expect(screen.getByText("2 khách sạn")).toBeInTheDocument();

    // Action: User chọn sort option "Giá cao nhất".
    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const sortButton = screen.getByRole("button", { name: "Giá cao nhất" });
    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(sortButton);

    // Expected: Sort option được chọn có active style.
    expect(sortButton.className).toContain("bg-blue-100");
  });
});
