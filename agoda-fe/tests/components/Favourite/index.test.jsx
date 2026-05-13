import React from "react";
import { render, screen } from "@testing-library/react";
import Favourite from "src-under-test/components/Favourite";

// ============================================================
// TÊN FILE TEST: index.test.jsx
// MÔ TẢ:
// - Kiểm tra trang Favourite hiển thị danh sách địa điểm yêu thích.
// - Các test tập trung vào thông tin user nhìn thấy: tiêu đề, số lượng,
//   card địa điểm, ảnh và link điều hướng sang trang chi tiết favourite.
// ============================================================

jest.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}), { virtual: true });

describe("Favourite", () => {
  // TC ID: FAV-TC-001
  // MỤC TIÊU: Trang danh sách yêu thích phải hiển thị đúng nội dung chính và link card.
  // INPUT: Render <Favourite /> với dữ liệu tĩnh hiện tại của component.
  // EXPECTED OUTPUT: Tiêu đề, số lượng, card địa điểm và link "/favourite/1" hiển thị đúng.
  it("FAV-TC-001 - renders saved destination cards with detail links", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<Favourite />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("Danh sach yeu thich")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByText("2 muc")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("Ha Long, Viet Nam")).toHaveLength(6);
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByText("2 khach san")).toHaveLength(6);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const cards = screen.getAllByRole("link");
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(cards).toHaveLength(6);
    cards.forEach((card) => {
      // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
      expect(card).toHaveAttribute("href", "/favourite/1");
    });
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getAllByRole("img")).toHaveLength(6);
  });
});
