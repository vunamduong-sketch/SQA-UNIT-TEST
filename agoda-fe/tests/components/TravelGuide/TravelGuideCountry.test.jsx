import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import TravelGuideCountry from "src-under-test/components/TravelGuide/TravelGuideCountry";

const mockCallFetchHandbook = jest.fn();
const mockCallFetchCity = jest.fn();
const mockCallFetchCountryDetail = jest.fn();

Object.defineProperty(window, "scrollTo", { value: jest.fn(), writable: true });

jest.mock("config/api", () => ({
  callFetchHandbook: (...args) => mockCallFetchHandbook(...args),
  callFetchCity: (...args) => mockCallFetchCity(...args),
  callFetchCountryDetail: (...args) => mockCallFetchCountryDetail(...args),
}));

jest.mock("constants/handbook", () => ({
  HANDBOOK_CATEGORIES: [
    { value: "all", label: "Tất cả" },
    { value: "food", label: "Ẩm thực" },
  ],
}));

jest.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useParams: () => ({ countryId: "84" }),
}), { virtual: true });

jest.mock("utils/imageUrl", () => ({
  getImage: (value) => value,
}));

jest.mock("@ant-design/icons", () => ({
  SearchOutlined: () => <span>search-icon</span>,
}));

jest.mock("antd", () => {
  const Select = ({ value, onChange, options }) => (
    <select aria-label="country-category" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
  return {
    Card: ({ children }) => <div>{children}</div>,
    Empty: ({ description }) => <div>{description}</div>,
    Input: ({ placeholder, value, onChange }) => <input aria-label={placeholder} value={value} onChange={onChange} />,
    Pagination: ({ onChange }) => <button onClick={() => onChange(3, 10)}>page-3</button>,
    Select,
  };
});

describe("TravelGuideCountry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads country detail, featured guides and destinations", async () => {
    // TC_TRAVELGUIDE_03
    mockCallFetchCountryDetail.mockResolvedValue({ isSuccess: true, data: { id: 84, name: "Viet Nam", image_handbook: "vn.jpg" } });
    mockCallFetchHandbook
      .mockResolvedValueOnce({ data: [{ id: 1, title: "Guide VN", image: "g.jpg", city: { id: 10, country: { id: 84 } } }] })
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 2, title: "Guide List", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } });
    mockCallFetchCity.mockResolvedValue({ data: [{ id: 10, name: "Da Nang", country: { id: 84 } }] });

    render(<TravelGuideCountry />);

    await waitFor(() => {
      expect(mockCallFetchCountryDetail).toHaveBeenCalledWith("84");
      expect(mockCallFetchCity).toHaveBeenCalledWith("current=1&pageSize=50&country_id=84");
    });

    expect(await screen.findByText("Guide VN")).toBeInTheDocument();
    expect(await screen.findByText("Da Nang")).toBeInTheDocument();
  });

  it("updates category and pagination for country guides", async () => {
    // TC_TRAVELGUIDE_04
    mockCallFetchCountryDetail.mockResolvedValue({ isSuccess: true, data: { id: 84, name: "Viet Nam" } });
    mockCallFetchHandbook
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ isSuccess: true, data: [{ id: 2, title: "Guide List", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } })
      .mockResolvedValue({ isSuccess: true, data: [{ id: 3, title: "Guide Food", city: { id: 10, country: { id: 84 } } }], meta: { totalItems: 1, totalPages: 1 } });
    mockCallFetchCity.mockResolvedValue({ data: [] });

    render(<TravelGuideCountry />);

    fireEvent.change(await screen.findByLabelText("country-category"), {
      target: { value: "food" },
    });

    await waitFor(() => {
      expect(mockCallFetchHandbook).toHaveBeenLastCalledWith(
        "current=1&pageSize=10&country_id=84&category=food&recommended=true"
      );
    });
  });
});
