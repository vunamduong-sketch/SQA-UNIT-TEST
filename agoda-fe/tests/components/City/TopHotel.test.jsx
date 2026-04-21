import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TopHotel from "src-under-test/components/City/TopHotel/index";

const mockCallFetchHotel = jest.fn();
const mockMessageError = jest.fn();

jest.mock("config/api", () => ({
  callFetchHotel: (...args) => mockCallFetchHotel(...args),
}));

jest.mock("react-router-dom", () => ({
  useParams: () => ({ cityId: "2" }),
}), { virtual: true });

jest.mock("utils/slugHelpers", () => ({
  createHotelSlug: (name, id) => `${name}-${id}`,
}));

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value || "fallback.jpg",
}));

jest.mock("constants/hotel", () => ({
  RANGE_PRICE_HOTEL: 100000,
}));

jest.mock("antd", () => {
  const React = require("react");
  const Empty = ({ description }) => <div>{description}</div>;
  Empty.PRESENTED_IMAGE_SIMPLE = "empty";
  return {
    Empty,
    Pagination: ({ current, total }) => (
      <div>{`pagination-${current}-${total}`}</div>
    ),
    Slider: ({ value, onChange }) => (
      <input
        aria-label="price-slider"
        value={value.join(",")}
        onChange={() => onChange?.([0, 50])}
      />
    ),
    Spin: () => <div>Loading...</div>,
    message: { error: (...args) => mockMessageError(...args) },
  };
});

jest.mock("src-under-test/components/City/TopHotel/FilterGroup", () => ({
  __esModule: true,
  default: ({ title, group, filterSearch, setFilterSearch }) => (
    <div>
      <span>{title}</span>
      <button
        onClick={() =>
          setFilterSearch({ ...filterSearch, [group.key]: group.options[0].value })
        }
      >
        set-filter
      </button>
    </div>
  ),
}));

jest.mock("src-under-test/components/City/TopHotel/SortBar", () => ({
  __esModule: true,
  default: ({ sorts, setValueSort }) => (
    <div>
      {sorts.map((sort) => (
        <button key={sort.value} onClick={() => setValueSort(sort.value)}>
          {sort.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("src-under-test/components/City/TopHotel/HotelCard", () => ({
  __esModule: true,
  default: ({ hotel }) => <div>{hotel.name}</div>,
}));

describe("City TopHotel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches hotels for the city and renders transformed data", async () => {
    // TC_CITY_03
    mockCallFetchHotel.mockResolvedValue({
      isSuccess: true,
      data: [
        {
          id: 1,
          name: "Hotel A",
          images: [{ image: "/hotel-a.jpg" }],
          avg_star: 4.5,
          location: "Da Nang",
          facilities: "<table><tr><td>Pool</td><td>Wifi</td></tr></table>",
          best_comment: "Rat tot",
          review_count: 10,
          min_price: 1500000,
          city: { id: 2, name: "Da Nang" },
        },
      ],
      meta: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 1,
        totalPages: 1,
      },
    });

    render(<TopHotel />);

    await waitFor(() =>
      expect(mockCallFetchHotel).toHaveBeenCalledWith(
        expect.objectContaining({
          cityId: "2",
          current: 1,
          pageSize: 10,
          recommended: true,
          min_avg_price: 0,
          max_avg_price: 10000000,
        })
      )
    );
    expect(await screen.findByText("Hotel A")).toBeInTheDocument();
  });

  it("shows empty state when the API returns no hotel", async () => {
    // TC_CITY_04
    mockCallFetchHotel.mockResolvedValue({
      isSuccess: true,
      data: [],
      meta: {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1,
      },
    });

    render(<TopHotel />);

    expect(await screen.findByText("Không tìm thấy khách sạn nào")).toBeInTheDocument();
  });
});
