import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TravelGuideCity from "src-under-test/components/TravelGuide/TravelGuideCity";

const mockCallFetchHandbook = jest.fn();
const mockCallFetchCityDetail = jest.fn();

Object.defineProperty(window, "scrollTo", { value: jest.fn(), writable: true });

jest.mock("config/api", () => ({
  callFetchHandbook: (...args) => mockCallFetchHandbook(...args),
  callFetchCityDetail: (...args) => mockCallFetchCityDetail(...args),
}));

jest.mock("constants/handbook", () => ({
  HANDBOOK_CATEGORIES: [
    { value: "all", label: "Tất cả" },
    { value: "culture", label: "Văn hóa" },
  ],
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useParams: () => ({ cityId: "10" }),
}), { virtual: true });

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value,
}));

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => <span>search-icon</span>,
}));

jest.mock("antd", () => {
  const Select = ({ value, onChange, options }) => (
    <select aria-label="city-category" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
  return {
    Card: ({ children }) => <div>{children}</div>,
    Empty: ({ description }) => <div>{description}</div>,
    Input: ({ placeholder, value, onChange }) => <input aria-label={placeholder} value={value} onChange={onChange} />,
    Pagination: ({ onChange }) => <button onClick={() => onChange(2, 10)}>page-2</button>,
    Select,
  };
});

describe("TravelGuideCity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads city detail and featured guides", async () => {
    // TC_TRAVELGUIDE_05
    mockCallFetchCityDetail.mockResolvedValue({ isSuccess: true, data: { id: 10, name: "Da Nang", country: { id: 84, name: "Viet Nam" }, image_handbook: "dn.jpg" } });
    mockCallFetchHandbook
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 1, title: "Guide DN", image: "g.jpg", city: { id: 10, country: { id: 84 } } }] })
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 2, title: "Guide City", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } });

    render(<TravelGuideCity />);

    await waitFor(() => {
      expect(mockCallFetchCityDetail).toHaveBeenCalledWith("10");
      expect(mockCallFetchHandbook).toHaveBeenCalledWith("current=1&pageSize=3&city_id=10&recommended=true");
    });

    expect(await screen.findByText("Guide DN")).toBeInTheDocument();
    expect(await screen.findByText("Guide City")).toBeInTheDocument();
  });

  it("updates category and pagination for city guides", async () => {
    // TC_TRAVELGUIDE_06
    mockCallFetchCityDetail.mockResolvedValue({ isSuccess: true, data: { id: 10, name: "Da Nang", country: { id: 84 } } });
    mockCallFetchHandbook
      .mockResolvedValueOnce({ isSuccess: true, data: [] })
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 2, title: "Guide City", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } })
      .mockResolvedValue({ isSuccess: true, data: [{ id: 3, title: "Guide Culture", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } });

    render(<TravelGuideCity />);

    fireEvent.change(await screen.findByLabelText("city-category"), {
      target: { value: "culture" },
    });

    await waitFor(() => {
      expect(mockCallFetchHandbook).toHaveBeenLastCalledWith(
        "current=1&pageSize=10&city_id=10&category=culture&recommended=true"
      );
    });
  });
});
