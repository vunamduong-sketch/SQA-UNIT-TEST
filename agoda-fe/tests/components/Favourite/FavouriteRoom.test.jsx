import React from "react";
import { render, screen } from "@testing-library/react";
import FavouriteRoom from "src-under-test/components/Favourite/FavouriteRoom";

// ============================================================
// TÊN FILE TEST: FavouriteRoom.test.jsx
// MÔ TẢ:
// - Kiểm tra trang danh sách khách sạn/phòng yêu thích.
// - Các test tập trung vào nội dung user nhìn thấy: tiêu đề, thông tin
//   khách sạn, đánh giá, giá mỗi đêm, icon sao và link điều hướng.
// ============================================================

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}), { virtual: true });

jest.mock("react-icons/io", () => ({
  IoIosStar: (props) => <svg data-testid="full-star" {...props} />,
}));

jest.mock("react-icons/fa", () => ({
  FaStarHalf: (props) => <svg data-testid="half-star" {...props} />,
}));

describe("FavouriteRoom", () => {
  // TC ID: FAV-TC-002
  // MỤC TIÊU: Trang phòng yêu thích phải hiển thị thông tin khách sạn, giá và link đúng.
  // INPUT: Render <FavouriteRoom /> với danh sách khách sạn yêu thích tĩnh.
  // EXPECTED OUTPUT: Tiêu đề, thông tin khách sạn, đánh giá, giá, icon sao và link hiển thị đúng.
  it("FAV-TC-002 - renders favourite hotel cards with rating, price, and links", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<FavouriteRoom />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Danh sach yeu thich")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("2 muc")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Tru by Hilton Ha Long Hon Gai Centre")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Cang Hon Gai, Ha Long")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("9,1")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Tren ca tuyet voi")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("nhan xet")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("659.291")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Moi dem tu")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("1.055.715")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("VND")).toHaveLength(6);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const links = screen.getAllByRole("link");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(links).toHaveLength(6);
    links.forEach((link) => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(link).toHaveAttribute("href", "/favourite/1");
    });

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByTestId("full-star")).toHaveLength(18);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByTestId("half-star")).toHaveLength(6);
  });
});
