import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FilterGroup from "src-under-test/components/City/TopHotel/FilterGroup";
import SortBar from "src-under-test/components/City/TopHotel/SortBar";
import HotelCard from "src-under-test/components/City/TopHotel/HotelCard";

jest.mock("react-router-dom", () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock("@ant-design/icons", () => ({
  EnvironmentOutlined: () => <span />,
}));

jest.mock("react-icons/fa", () => ({
  FaStar: () => <span>*</span>,
}));

jest.mock("utils/formatCurrency", () => ({
  formatCurrency: (value) => value,
}));

describe("City TopHotel children", () => {
  it("updates filterSearch when a radio option is selected", () => {
    // TC_CITY_05
    const setFilterSearch = jest.fn();
    render(
      <FilterGroup
        title="Đánh giá sao"
        group={{
          key: "avg_star",
          options: [{ label: "5 sao", value: 5 }],
        }}
        filterSearch={{ avg_star: -1 }}
        setFilterSearch={setFilterSearch}
      />
    );

    fireEvent.click(screen.getByLabelText("5 sao"));
    expect(setFilterSearch).toHaveBeenCalledWith({ avg_star: 5 });
  });

  it("updates the selected sort option when a sort button is clicked", () => {
    // TC_CITY_06
    const setValueSort = jest.fn();
    render(
      <SortBar
        sorts={[{ label: "Giá thấp nhất trước", value: "sort=min_price-asc" }]}
        valueSort="recommended=true"
        setValueSort={setValueSort}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Giá thấp nhất trước" }));
    expect(setValueSort).toHaveBeenCalledWith("sort=min_price-asc");
  });

  it("toggles the review expansion in the hotel card", () => {
    // TC_CITY_07
    render(
      <HotelCard
        hotel={{
          slug: "hotel-a-1",
          image: "/hotel.jpg",
          name: "Hotel A",
          englishName: "Hotel A EN",
          stars: 4,
          city: { id: 2, name: "Da Nang" },
          mapUrl: "https://maps.google.com/?q=1,2",
          facilities: ["Pool", "Wifi"],
          review:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(6),
          ratingText: "Tuyệt hảo",
          ratingCount: 22,
          rating: "9.0",
          price: 1500000,
          thumbnails: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg", "/6.jpg", "/7.jpg", "/8.jpg"],
        }}
      />
    );

    expect(screen.getByText("Hotel A")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xem thêm ▼" }));
    expect(screen.getByRole("button", { name: "Ẩn ▲" })).toBeInTheDocument();
  });
});
