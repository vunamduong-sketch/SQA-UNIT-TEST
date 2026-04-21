import React from "react";
import { render, screen } from "@testing-library/react";
import ActivityAllTab from "src-under-test/components/Cart/ActivityTab/ActivityAllTab";
import ActivityTourTab from "src-under-test/components/Cart/ActivityTab/ActivityTourTab";
import ActivityExperienceTab from "src-under-test/components/Cart/ActivityTab/ActivityExperienceTab";
import ActivityDriveTab from "src-under-test/components/Cart/ActivityTab/ActivityDriveTab";
import ActivityFoodTab from "src-under-test/components/Cart/ActivityTab/ActivityFoodTab";
import ActivityLocationTab from "src-under-test/components/Cart/ActivityTab/ActivityLocationTab";
import ActivityTravelEssentialTab from "src-under-test/components/Cart/ActivityTab/ActivityTravelEssentialTab";

jest.mock("swiper/react", () => ({
  Swiper: ({ children }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }) => <div data-testid="swiper-slide">{children}</div>,
}), { virtual: true });

jest.mock("swiper/modules", () => ({
  Navigation: {},
  Pagination: {},
}), { virtual: true });

jest.mock("antd", () => ({
  Tag: ({ children }) => <span>{children}</span>,
}));

jest.mock("react-icons/io", () => ({
  IoIosStar: () => <span />,
}));

jest.mock("react-icons/bs", () => ({
  BsLightningChargeFill: () => <span />,
}));

const cases = [
  ["TC_CART_03", ActivityAllTab],
  ["TC_CART_04", ActivityTourTab],
  ["TC_CART_05", ActivityExperienceTab],
  ["TC_CART_06", ActivityDriveTab],
  ["TC_CART_07", ActivityFoodTab],
  ["TC_CART_08", ActivityLocationTab],
  ["TC_CART_09", ActivityTravelEssentialTab],
];

describe("Cart Activity Tabs", () => {
  it.each(cases)("%s renders the activity card list", (_caseId, Component) => {
    render(<Component />);

    expect(screen.getAllByTestId("swiper-slide")).toHaveLength(15);
    expect(
      screen.getAllByText("Da Nang Airport Transfer to Da Nang Hotel by Private Car")[0]
    ).toBeInTheDocument();
    expect(screen.getAllByText("Hủy miễn phí")[0]).toBeInTheDocument();
  });
});
