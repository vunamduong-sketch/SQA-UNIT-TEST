import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import BookingContactInfomation from "src-under-test/components/BookingVehicles/BookingContactInfomation";

// ============================================================
// TÊN FILE TEST: BookingContactInfomation.test.jsx
// MỤC ĐÍCH:
// - Kiểm thử form thông tin liên hệ ở bước đặt xe.
// - Giữ test vừa đủ: prefill user info và bật nút đặt khi user đồng ý điều khoản.
// - Test dựa trên input/button user nhìn thấy, không phụ thuộc layout/CSS.
// ============================================================

// Mock Redux user để kiểm tra form tự điền thông tin liên hệ từ store.
jest.mock("redux/hooks", () => ({
  useAppSelector: jest.fn((selector) =>
    selector({
      account: {
        user: {
          first_name: "An",
          last_name: "Nguyen",
          email: "an@example.com",
          phone_number: "0123456789",
        },
      },
    })
  ),
}));

// Component đọc location.state để lấy thông tin booking xe.
// Ở 2 test này chỉ kiểm tra form contact nên state=null là đủ.
jest.mock("react-router-dom", () => ({ useLocation: () => ({ state: null }) }), { virtual: true });

// Mock map và icon libraries để tránh lỗi jsdom khi render map/icon thật.
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  TileLayer: () => <div />,
}));
jest.mock("react-leaflet-cluster", () => ({ children }) => <div>{children}</div>);
jest.mock("leaflet", () => ({ Icon: jest.fn() }));
jest.mock("@ant-design/icons", () => {
  const MockIcon = (props) => <span {...props} />;
  return new Proxy({}, { get: () => MockIcon });
});
jest.mock("react-icons/md", () => ({ MdOutlineFreeCancellation: () => <span /> }));

// Mock Ant Design bằng HTML đơn giản để dễ query input/select/button.
jest.mock("antd", () => {
  const React = require("react");
  const InputComponent = React.forwardRef(({ children, ...props }, ref) => <input ref={ref} {...props}>{children}</input>);
  InputComponent.Group = ({ children }) => <div>{children}</div>;
  const Select = ({ children, value, defaultValue, onChange, ...props }) => (
    <select aria-label={props["aria-label"] || props.placeholder || "select"} value={value ?? defaultValue ?? ""} onChange={(event) => onChange?.(event.target.value)}>
      {children}
    </select>
  );
  Select.Option = ({ children, value }) => <option value={value}>{typeof children === "string" ? children : value}</option>;
  const Checkbox = ({ children, checked, onChange }) => (
    <label>
      <input type="checkbox" checked={!!checked} onChange={(event) => onChange?.({ target: { checked: event.target.checked } })} />
      {children}
    </label>
  );
  return {
    Input: InputComponent,
    Select,
    Button: ({ children, disabled, ...props }) => <button disabled={disabled} {...props}>{children}</button>,
    Card: ({ children }) => <div>{children}</div>,
    Checkbox,
    Divider: () => <div />,
  };
});

describe("BookingContactInfomation", () => {
  // TC ID: BOOKVEH-TC-004
  // MỤC TIÊU: Form contact tự điền thông tin user từ Redux store.
  // INPUT: Redux user có first_name, last_name, email, phone_number.
  // EXPECTED OUTPUT: Các input hiển thị đúng giá trị user.
  it("BOOKVEH-TC-004 - prefills user information from the store", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<BookingContactInfomation />);

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByDisplayValue("An")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByDisplayValue("Nguyen")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByDisplayValue("an@example.com")).toBeInTheDocument();
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(screen.getByDisplayValue("0123456789")).toBeInTheDocument();
  });

  // TC ID: BOOKVEH-TC-005
  // MỤC TIÊU: Nút đặt xe chỉ được bật sau khi user đồng ý điều khoản.
  // INPUT: Click checkbox terms.
  // EXPECTED OUTPUT: Button "Đặt bây giờ →" chuyển từ disabled sang enabled.
  it("BOOKVEH-TC-005 - enables booking button after terms checkbox is checked", () => {
    // Act: render component de bat dau mo phong luong nguoi dung trong test.
    render(<BookingContactInfomation />);

    // Arrange: chuan bi du lieu hoac mock function dung rieng cho test case.
    const submitButton = screen.getByRole("button", { name: "Đặt bây giờ →" });
    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(submitButton).toBeDisabled();

    // Act: mo phong thao tac click giong hanh dong that cua nguoi dung.
    fireEvent.click(screen.getByRole("checkbox"));

    // Assert: kiem tra ket qua hien thi/callback/dieu huong dung voi expected output.
    expect(submitButton).toBeEnabled();
  });
});
