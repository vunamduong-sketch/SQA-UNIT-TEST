export const formatCurrency = jest.fn((value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value))
);
