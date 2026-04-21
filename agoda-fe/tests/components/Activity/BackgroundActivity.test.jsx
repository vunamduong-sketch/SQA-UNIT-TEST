import React from "react";
import { render, screen } from "@testing-library/react";
import BackgroundActivity from "src-under-test/components/Activity/BackgroundActivity";

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => null,
}));

jest.mock("antd", () => ({
  Button: ({ children }) => <button type="button">{children}</button>,
  Input: ({ placeholder }) => <input placeholder={placeholder} />,
}));

describe("BackgroundActivity", () => {
  it("renders the hero section with search input and button", () => {
    // TC_ACTIVITY_03
    render(<BackgroundActivity />);

    expect(
      screen.getByText("Tìm cuộc phiêu lưu tiếp theo của quý khách")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Đà Nẵng")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tìm kiếm" })).toBeInTheDocument();
  });
});
