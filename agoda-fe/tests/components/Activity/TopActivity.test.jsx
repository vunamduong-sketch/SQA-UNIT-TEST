import React from "react";
import { render, screen } from "@testing-library/react";
import TopActivity from "src-under-test/components/Activity/TopActivity";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { fetchActivity } from "redux/slice/activitySlide";

const mockDispatch = jest.fn();

jest.mock("redux/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("redux/slice/activitySlide", () => ({
  fetchActivity: jest.fn(),
}));

jest.mock("utils/formatCurrency", () => ({
  formatCurrency: jest.fn((value) => `formatted-${value}`),
}));

jest.mock("swiper/react", () => ({
  Swiper: ({ children }) => <div>{children}</div>,
  SwiperSlide: ({ children }) => <div>{children}</div>,
}), { virtual: true });

jest.mock("swiper/modules", () => ({
  Navigation: {},
}), { virtual: true });

jest.mock("react-icons/io", () => ({
  IoIosStar: () => null,
}), { virtual: true });

jest.mock("react-icons/bs", () => ({
  BsLightningChargeFill: () => null,
}), { virtual: true });

jest.mock("antd", () => ({
  Tag: ({ children }) => <span>{children}</span>,
}));

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }),
  { virtual: true }
);

describe("TopActivity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppDispatch.mockReturnValue(mockDispatch);
    fetchActivity.mockReturnValue({ type: "activity/fetchActivity" });
  });

  it("dispatches the recommended activity query on mount", () => {
    // TC_ACTIVITY_05
    useAppSelector.mockImplementation((selector) =>
      selector({ activity: { data: [] } })
    );

    render(<TopActivity />);

    expect(fetchActivity).toHaveBeenCalledWith({
      query: "current=1&pageSize=10&recommended=true",
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "activity/fetchActivity",
    });
  });

  it("renders activity cards from store data", () => {
    // TC_ACTIVITY_06
    useAppSelector.mockImplementation((selector) =>
      selector({
        activity: {
          data: [
            {
              id: 11,
              name: "Bà Nà Hills",
              avg_star: 4.5,
              avg_price: 1200000,
              images: [{ image: "/bana.jpg" }],
            },
          ],
        },
      })
    );

    render(<TopActivity />);

    expect(screen.getByText("Bà Nà Hills")).toBeInTheDocument();
    expect(screen.getByText("formatted-1200000")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Bà Nà Hills/i })
    ).toHaveAttribute("href", "/activity/detail/11");
  });
});
