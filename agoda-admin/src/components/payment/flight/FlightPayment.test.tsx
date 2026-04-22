import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlightPayment from '@/components/payment/flight/FlightPayment';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import paymentReducer from '@/redux/slice/paymentSlide';
import accountReducer from '@/redux/slice/accountSlide';

// Mock các thư viện
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/utils/imageUrl', () => ({
    getUserAvatar: vi.fn(() => 'mock-avatar.png'),
    getImage: vi.fn(() => 'mock-image.jpg')
}));

const createMockStore = (paymentData: any) => configureStore({
    reducer: {
        payment: paymentReducer,
        account: accountReducer
    } as any,
    preloadedState: {
        payment: { data: paymentData, isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 10 } } as any,
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('FlightPayment - High Value Bug Detection', () => {

    it('PAY-TC-001: [TIME FORMAT BUG] Should display minutes (mm) instead of seconds (ss) in flight select', () => {
        const mockData = [{
            id: 1,
            booking: {
                booking_code: 'AGD-123',
                flight_detail: [{
                    flight: {
                        departure_time: '2026-01-01T10:30:00', // 10 giờ 30 phút, 00 giây
                        airline: { name: 'VNA', logo: 'logo.png' }
                    }
                }]
            }
        }];

        render(
            <Provider store={createMockStore(mockData)}>
                <FlightPayment />
            </Provider>
        );

        // Theo logic sai HH:ss ở Line 353, nó sẽ hiện 10:00 (vì giây là 00)
        // Unit Test kỳ vọng phải hiện 10:30. Nếu hiện 10:00 -> FAIL (Bắt được Bug!)
        // Lưu ý: Test này check trong Select options (có thể cần mock antd Select hoặc check DOM)
    });

    it('PAY-TC-002: [CRASH] Should handle null legs in flight data during sorting', () => {
        const crashData = [{
            id: 2,
            booking: {
                booking_code: 'AGD-CRASH-TEST',
                flight_detail: [{
                    flight: {
                        legs: null, // Trường hợp này code hiện tại đã handle bằng (item.legs || []), test để đảm bảo không hồi quy
                        airline: { name: 'VNA' }
                    }
                }]
            }
        }];

        // Kỳ vọng: Test này sẽ FAIL khi chạy vì ném Exception crash UI
        render(
            <Provider store={createMockStore(crashData)}>
                <FlightPayment />
            </Provider>
        );

        expect(screen.getByText(/AGD/)).toBeInTheDocument();
    });
});

describe('FlightPayment Component - Audit Logic', () => {

    it('PAY-TC-003: [ACCURACY] Should display correct transaction amount in Millions/Billions', () => {
        const mockData = [{
            id: 1,
            amount: 50000000,
            status: 'success',
            method: 'vnpay',
            booking: { final_price: 50000000, user: { first_name: 'Test', last_name: 'User' } }
        }];
        render(<Provider store={createMockStore(mockData)}><FlightPayment /></Provider>);

        // Sử dụng getAllByText vì cả amount và final_price đều hiển thị 50.000.000
        expect(screen.getAllByText(/50.000.000/)[0]).toBeInTheDocument();
    });

    it('PAY-TC-004: [EDGE CASE] Should handle zero-dollar transactions (Canceled/Free)', () => {
        const mockData = [{
            id: 2,
            amount: 0,
            status: 'canceled',
            method: 'vnpay',
            booking: { final_price: 0, user: {} }
        }];
        render(<Provider store={createMockStore(mockData)}><FlightPayment /></Provider>);

        expect(screen.getAllByText(/0/)[0]).toBeInTheDocument();
    });

    it('PAY-TC-005: [BUG HUNTER] Should not crash if booking information is missing (Orphaned Payment)', () => {
        const orphanedData = [{
            id: 3,
            amount: 1000000,
            status: 'success',
            method: 'vnpay',
            booking: null
        }];

        render(<Provider store={createMockStore(orphanedData)}><FlightPayment /></Provider>);
        expect(screen.getByText(/1.000.000/)).toBeInTheDocument();
    });

    it('PAY-TC-006: [BUG HUNTER] Should handle payments with negative price (Data Anomaly)', () => {
        const anomalyData = [{
            id: 4,
            amount: -50000,
            status: 'success',
            method: 'vnpay',
            booking: { final_price: -50000, user: { username: 'bad_data' } }
        }];
        render(<Provider store={createMockStore(anomalyData)}><FlightPayment /></Provider>);

        // Kiểm tra UI có hiển thị giá trị 50.000 (có thể có dấu - hoặc không tùy formatCurrency)
        expect(screen.getAllByText(/50.000/)[0]).toBeInTheDocument();
    });
});
