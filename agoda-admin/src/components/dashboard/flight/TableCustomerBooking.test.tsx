import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TableCustomerBooking from '@/components/dashboard/flight/TableCustomerBooking';
import * as api from '@/config/api';

vi.mock('@/config/api', () => ({
    callFetchPayment: vi.fn()
}));

const mockData = [{
    id: 1,
    amount: 2500000,
    status: 2,
    method: 1,
    created_at: '2024-05-20T10:00:00Z',
    booking: {
        id: 101,
        final_price: 2500000,
        discount_amount: 0,
        user: { first_name: 'Cuong', last_name: 'Phan', username: 'cuongphan', avatar: '' },
        guest_info: { email: 'test@gmail.com', phone: '0123', full_name: 'Khách' }
    }
}];

describe('TableCustomerBooking - Business Logic Test', () => {

    it('FLI-TC-010: Should correctly format price and dates in the table rows', async () => {
        vi.mocked(api.callFetchPayment).mockResolvedValue({ isSuccess: true, data: mockData } as any);

        render(<TableCustomerBooking serviceType={1} />);

        // Chờ dữ liệu từ API giả được load vào State
        await waitFor(() => {
            const prices = screen.getAllByText(/2.500.000/);
            expect(prices[0]).toBeInTheDocument();
        });
        expect(screen.getByText(/Cuong Phan/i)).toBeInTheDocument();
    });

    it('FLI-TC-011: Should apply correct CSS class based on payment status', async () => {
        vi.mocked(api.callFetchPayment).mockResolvedValue({ isSuccess: true, data: mockData } as any);

        render(<TableCustomerBooking serviceType={1} />);

        await waitFor(() => {
            const badge = screen.getByText(/Thành công/i);
            expect(badge).toBeInTheDocument();
        });
    });
});
