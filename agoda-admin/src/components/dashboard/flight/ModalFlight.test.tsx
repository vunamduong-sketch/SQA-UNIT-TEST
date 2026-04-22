import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModalFlight from '@/components/dashboard/flight/ModalFlight';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import flightReducer from '@/redux/slice/flightSlide';
import accountReducer from '@/redux/slice/accountSlide';

// Mock các thư viện và API
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/utils/imageUrl', () => ({
    getUserAvatar: vi.fn(() => 'mock-avatar.png'),
    getImage: vi.fn(() => 'mock-image.jpg')
}));
vi.mock('/images/user/default-avatar.png', () => ({ default: 'mock-avatar.png' }));
vi.mock('/images/error/not-found.jpg', () => ({ default: 'mock-image.jpg' }));
vi.mock('@/config/api', () => ({
    callCreateFlight: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callUpdateFlight: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    fetchAirlineList: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    fetchAircraftList: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchAirport: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchCity: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchCountry: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchAirline: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
    callFetchAircraft: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] }))
}));

const createMockStore = () => configureStore({
    reducer: {
        flight: flightReducer,
        account: accountReducer
    } as any,
    preloadedState: {
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('ModalFlight - Business Logic Gap Testing', () => {

    it('FLI-TC-007: [NEGATIVE PRICE] Should NOT allow negative base price', async () => {
        render(
            <Provider store={createMockStore()}>
                <ModalFlight openModal={true} setOpenModal={vi.fn()} reloadTable={vi.fn()} setDataInit={vi.fn()} dataInit={null} />
            </Provider>
        );

        const priceInput = screen.getByLabelText(/Giá cơ sở/i);
        fireEvent.change(priceInput, { target: { value: '-1000000' } });

        const submitBtn = screen.getByRole('button', { name: /Thêm mới/i });
        fireEvent.click(submitBtn);

        // KỲ VỌNG: Hệ thống phải hiện thông báo lỗi. 
        // THỰC TẾ: Không hiện -> FAIL (Để làm chứng)
        await waitFor(() => {
            expect(screen.queryByText(/giá phải lớn hơn 0/i)).toBeInTheDocument();
        });
    });

    it('FLI-TC-008: [EMPTY RELATION] Should NOT allow creating flight without legs/seats', async () => {
        render(
            <Provider store={createMockStore()}>
                <ModalFlight openModal={true} setOpenModal={vi.fn()} reloadTable={vi.fn()} setDataInit={vi.fn()} dataInit={null} />
            </Provider>
        );

        const submitBtn = screen.getByRole('button', { name: /Thêm mới/i });
        fireEvent.click(submitBtn);

        // KỲ VỌNG: Hệ thống phải bắt lỗi chưa có chặng bay.
        await waitFor(() => {
            expect(screen.queryByText(/chưa có chặng bay/i)).toBeInTheDocument();
        });
    });
});
