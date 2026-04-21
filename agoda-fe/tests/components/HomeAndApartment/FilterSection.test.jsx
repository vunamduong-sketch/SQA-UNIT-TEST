import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FilterSection from "src-under-test/components/HomeAndApartment/FilterSection";

jest.mock("@mui/icons-material", () => ({
  Tune: () => <span>tune</span>,
}));

describe("HomeAndApartment FilterSection", () => {
  it("toggles a filter selection", () => {
    // TC_HOMEAPT_03
    render(<FilterSection />);

    const button = screen.getByText("Không hút thuốc (5)").closest("button");
    fireEvent.click(button);

    expect(button.className).toContain("bg-blue-600");
  });

  it("clears all selected filters", () => {
    // TC_HOMEAPT_04
    render(<FilterSection />);

    const smokeButton = screen.getByText("Không hút thuốc (5)").closest("button");
    const seaButton = screen.getByText("Hướng biển (3)").closest("button");
    fireEvent.click(smokeButton);
    fireEvent.click(seaButton);
    fireEvent.click(screen.getByText("Xóa hết"));

    expect(smokeButton.className).not.toContain("bg-blue-600");
    expect(seaButton.className).not.toContain("bg-blue-600");
  });
});
