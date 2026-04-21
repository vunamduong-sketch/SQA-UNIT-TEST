import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FilterSideBar from "src-under-test/components/Flight1/FilterSideBar";

describe("Flight1 FilterSideBar", () => {
  it("expands airline list and shows all airlines", () => {
    // TC_FLIGHT1_04
    render(<FilterSideBar />);

    expect(screen.queryByText("Vietnam Airlines")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Hiện tất cả 6 hãng hàng không"));
    expect(screen.getByText("Vietnam Airlines")).toBeInTheDocument();
  });

  it("selects all airlines and clears baggage filter", () => {
    // TC_FLIGHT1_05
    render(<FilterSideBar />);

    fireEvent.click(screen.getByLabelText("Đã gồm hành lý ký gửi"));
    expect(screen.getByLabelText("Đã gồm hành lý ký gửi")).toBeChecked();

    fireEvent.click(screen.getByText("Chọn tất cả"));
    expect(screen.getByLabelText("Air China")).toBeChecked();
    expect(screen.getByLabelText("Asiana Airlines")).toBeChecked();

    fireEvent.click(screen.getAllByText("Xóa")[0]);
    expect(screen.getByLabelText("Đã gồm hành lý ký gửi")).not.toBeChecked();
  });
});
