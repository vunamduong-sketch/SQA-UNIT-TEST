import React from "react";
import { render, screen } from "@testing-library/react";
import WhyChooseAgoda from "src-under-test/components/Activity/WhyChooseAgoda";

describe("WhyChooseAgoda", () => {
  it("renders all predefined Agoda benefit items", () => {
    // TC_ACTIVITY_07
    render(<WhyChooseAgoda />);

    expect(screen.getByText("Tại sao chọn Agoda?")).toBeInTheDocument();
    expect(screen.getByText("Hơn 300.000 trải nghiệm")).toBeInTheDocument();
    expect(screen.getByText("Nhanh chóng và linh hoạt")).toBeInTheDocument();
    expect(screen.getByText("Trải nghiệm du lịch hợp nhất")).toBeInTheDocument();
  });
});
