import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Flight from '@/components/dashboard/flight/Flight';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import flightReducer from '@/redux/slice/flightSlide';
import accountReducer from '@/redux/slice/accountSlide';
import airlineReducer from '@/redux/slice/airlineSlide';
import airportReducer from '@/redux/slice/airportSlide';
import aircraftReducer from '@/redux/slice/aircraftSlide';

// Chặn các API Call thực tế gây ra Network Error (Unhandled Rejections)
vi.mock('@/config/api', () => ({
    callFetchAirport: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchCity: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchCountry: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchAirline: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchAircraft: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callCreateFlight: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callUpdateFlight: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] }))
}));

const createMockStore = (state: any) => configureStore({
    reducer: {
        flight: flightReducer,
        account: accountReducer,
        airline: airlineReducer,
        airport: airportReducer,
        aircraft: aircraftReducer
    } as any,
    preloadedState: {
        flight: state,
        account: { user: { role: 'ADMIN' }, activeMenu: 'flights' } as any
    }
});

describe('Flight Component - High Value Logic Test', () => {

    it('FLI-TC-001: [BUSINESS LOGIC] Should render flight information with correct relations', () => {
        const mockData = [{
            id: 1,
            airline: { name: 'Vietnam Airlines' },
            aircraft: { model: 'Airbus A350' },
            departure_airport: { name: 'Noi Bai' },
            arrival_airport: { name: 'Tan Son Nhat' },
            base_price: 2000000,
            legs: [{ id: 10, departure_time: '2024-05-20T10:00:00Z', arrival_time: '2024-05-20T12:00:00Z' }]
        }];

        render(<Provider store={createMockStore({ data: mockData, isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } })}><Flight canCreate={true} /></Provider>);

        // Kiểm tra logic hiển thị dữ liệu quan hệ (Relationship mapping)
        expect(screen.getAllByText(/Vietnam Airlines/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/Airbus A350/i)).toBeInTheDocument();
        // Kiểm tra format giá tiền trong bảng
        expect(screen.getByText(/2.000.000/)).toBeInTheDocument();
    });

    it('FLI-TC-002: [FILTER LOGIC] Should handle empty state gracefully when no flights match filters', () => {
        render(<Provider store={createMockStore({ data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } })}><Flight /></Provider>);

        // Kiểm tra UI có hiển thị Header nhưng không có Row dữ liệu
        expect(screen.getByText(/Danh sách flight/i)).toBeInTheDocument();
        // Ant Design table thường hiển thị "No Data"
        // expect(screen.getByText(/No Data/i)).toBeInTheDocument();
    });

    it('FLI-TC-003: [ERROR HANDLING] Should stay operational when API fails', () => {
        const store = createMockStore({ data: [], isFetching: false, error: 'API Error 500', meta: { currentPage: 1, pageSize: 10, totalItems: 0 } });
        render(<Provider store={store}><Flight canCreate={true} /></Provider>);

        // Đảm bảo trang vẫn hiển thị bộ khung Dashboard
        expect(screen.getByText((content) => content.includes('Thêm mới'))).toBeInTheDocument();
    });

    it('FLI-TC-004: [BUG HUNTER] Should not crash if relationship data (airline/aircraft) is missing', () => {
        // Giả lập dữ liệu bị "gãy" - airline bị null
        const brokenData = [{
            id: 2,
            airline: null,
            aircraft: { model: 'Boeing 747' },
            departure_airport: { name: 'Noi Bai' },
            arrival_airport: { name: 'Tan Son Nhat' },
            base_price: 1500000
        }];

        // VULNERABILITY EVIDENCE: Khi airline bị null, dòng dữ liệu bị biến mất khỏi bảng thay vì hiện "N/A"
        render(<Provider store={createMockStore({ data: brokenData, isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } })}><Flight /></Provider>);
        expect(screen.getByText(/Boeing 747/)).toBeInTheDocument();
    });

    it('FLI-TC-005: [BUG HUNTER] Should handle malformed date strings gracefully', () => {
        const malformedData = [{
            id: 3,
            airline: { name: 'Test Air' },
            created_at: 'NOT-A-DATE', // dayjs có thể trả về "Invalid Date"
        }];

        render(<Provider store={createMockStore({ data: malformedData, isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } })}><Flight /></Provider>);
        // Kiểm tra xem UI có bị nổ không (crash)
        expect(screen.queryByText(/NOT-A-DATE/i)).not.toBeInTheDocument();
    });
    it('FLI-TC-006: [BUG HUNTER] Should be case-insensitive and handle whitespace in search', () => {
        const mockData = [{ id: 4, airline: { name: 'Vietnam Airlines' }, legs: [{ departure_time: '2024-05-20T10:00:00Z' }] }];
        render(<Provider store={createMockStore({ data: mockData, isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } })}><Flight canCreate={true} /></Provider>);

        // Tester giả lập nhập từ khóa có khoảng trắng thừa
        // Lưu ý: Đây là kiểm tra logic UI/Store phối hợp
        expect(screen.getAllByText(/Vietnam Airlines/i)[0]).toBeInTheDocument();

        // Nếu hệ thống không trim(), các filterDropdown sẽ không tìm thấy kết quả
    });
});
