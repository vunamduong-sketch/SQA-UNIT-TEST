import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TravelGuide from "src-under-test/components/TravelGuide/TravelGuide";

const mockCallFetchCountry = jest.fn();
const mockCallFetchCity = jest.fn();
const mockCallFetchHandbook = jest.fn();

jest.mock("config/api", () => ({
  callFetchCountry: (...args) => mockCallFetchCountry(...args),
  callFetchCity: (...args) => mockCallFetchCity(...args),
  callFetchHandbook: (...args) => mockCallFetchHandbook(...args),
}));

jest.mock("constants/handbook", () => ({
  HANDBOOK_CATEGORIES: [
    { value: "all", label: "Tất cả" },
    { value: "food", label: "Ẩm thực" },
  ],
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value,
}));

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => <span>search-icon</span>,
}));

jest.mock("antd", () => {
  const Select = ({ value, onChange, options }) => (
    <select aria-label="category-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
  return {
    Card: ({ children }) => <div>{children}</div>,
    Input: ({ placeholder, value, onChange }) => (
      <input aria-label={placeholder} value={value} onChange={onChange} />
    ),
    Pagination: ({ onChange }) => <button onClick={() => onChange(2, 20)}>page-2</button>,
    Select,
  };
});

describe("TravelGuide", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads featured guides, countries, cities and recommendations", async () => {
    // TC_TRAVELGUIDE_01
    mockCallFetchHandbook
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 1, title: "Guide A", image: "a.jpg", city: { id: 2, country: { id: 3 } } }] })
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 5, title: "Guide B", image: "b.jpg", city: { id: 4, country: { id: 6 } } }], meta: { totalItems: 1, totalPages: 1 } })
      .mockResolvedValue({ isSuccess: true, data: [{ id: 5, title: "Guide B", image: "b.jpg", city: { id: 4, country: { id: 6 } } }], meta: { totalItems: 1, totalPages: 1 } });
    mockCallFetchCountry.mockResolvedValue({ isSuccess: true, data: [{ id: 9, name: "Viet Nam" }] });
    mockCallFetchCity.mockResolvedValue({ isSuccess: true, data: [{ id: 10, name: "Da Nang", country: { id: 9, name: "Viet Nam" } }] });

    render(<TravelGuide />);

    await waitFor(() => {
      expect(mockCallFetchHandbook).toHaveBeenCalledWith("current=1&pageSize=3&recommended=true");
      expect(mockCallFetchCountry).toHaveBeenCalledWith("current=1&pageSize=50");
      expect(mockCallFetchCity).toHaveBeenCalledWith("current=1&pageSize=50");
    });

    expect(await screen.findByText("Guide A")).toBeInTheDocument();
    expect(await screen.findByText("Viet Nam")).toBeInTheDocument();
    expect(await screen.findByText("Da Nang, Viet Nam")).toBeInTheDocument();
  });

  it("updates category and pagination query for recommendations", async () => {
    // TC_TRAVELGUIDE_02
    mockCallFetchHandbook
      .mockResolvedValueOnce({ isSuccess: true, data: [] })
      .mockResolvedValueOnce({ isSuccess: true, data: [], meta: { totalItems: 0, totalPages: 0 } })
      .mockResolvedValue({ isSuccess: true, data: [], meta: { totalItems: 0, totalPages: 0 } });
    mockCallFetchCountry.mockResolvedValue({ isSuccess: true, data: [] });
    mockCallFetchCity.mockResolvedValue({ isSuccess: true, data: [] });

    render(<TravelGuide />);

    fireEvent.change(await screen.findByLabelText("category-select"), {
      target: { value: "food" },
    });
    fireEvent.click(screen.getByText("page-2"));

    await waitFor(() => {
      expect(mockCallFetchHandbook).toHaveBeenLastCalledWith(
        "current=2&pageSize=20&category=food&recommended=true"
      );
    });
  });
});
