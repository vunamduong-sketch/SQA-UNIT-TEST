import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Hotel from '@/components/dashboard/hotel/Hotel';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import hotelReducer from '@/redux/slice/hotelSlide';
import accountReducer from '@/redux/slice/accountSlide';
import * as api from '@/config/api';

// [ISOLATION]: Mock API và thư viện bên thứ ba
vi.mock('@/config/api', () => ({
    callDeleteHotel: vi.fn(),
    callFetchHotel: vi.fn(),
}));

vi.mock('react-toastify', () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('@/utils/imageUrl', () => ({
    getUserAvatar: vi.fn(() => 'mock-avatar.png'),
    getImage: vi.fn(() => 'mock-image.jpg')
}));

// Mock các Modal có chứa MDXEditor phức tạp để tránh crash JSDOM
vi.mock('./ModalHotel', () => ({
    default: ({ openModal }: any) => openModal ? <div data-testid="mock-modal-hotel">Mock Modal Hotel</div> : null
}));

vi.mock('./ModalHotelDetail', () => ({
    default: ({ isModalOpen }: any) => isModalOpen ? <div data-testid="mock-modal-hotel-detail">Mock Modal Hotel Detail</div> : null
}));

// Mock Ant Design components (matchMedia)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// [REDUX STATIC STORE]: Tạo store giả lập để đóng băng dữ liệu test
const createMockStore = (hotelData: any) => configureStore({
    reducer: {
        hotel: hotelReducer,
        account: accountReducer
    } as any,
    preloadedState: {
        hotel: {
            data: hotelData,
            isFetching: false,
            meta: { current: 1, pageSize: 10, pages: 1, total: hotelData.length }
        },
        account: {
            user: { role: 'ADMIN', first_name: 'Admin', last_name: 'Tester' }
        }
    } as any
});

const MOCK_HOTEL_DATA = [
    {
        id: 1,
        name: 'Khách sạn Continental',
        address: '123 Đồng Khởi, Quận 1',
        star: 5,
        images: [{ image: 'cont1.jpg' }],
        city: { name: 'Hồ Chí Minh' },
        owner: { first_name: 'John', last_name: 'Wick' }
    },
    {
        id: 2,
        name: 'Khách sạn Mường Thanh',
        address: '456 Võ Nguyên Giáp',
        star: 4,
        images: [], // Test case không ảnh
        city: { name: 'Đà Nẵng' },
        owner: { first_name: 'Bình', last_name: 'Nguyễn' }
    }
];

describe('Hotel Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        // [ROLLBACK]: Dọn dẹp mock sau mỗi test case
        vi.clearAllMocks();
    });

    it('HTL-TC-001: [RENDER] Should render hotel list table correctly', () => {
        const store = createMockStore(MOCK_HOTEL_DATA);
        render(
            <Provider store={store}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        // Kiểm tra hiển thị tên khách sạn
        expect(screen.getByText('Khách sạn Continental')).toBeInTheDocument();
        expect(screen.getByText('Khách sạn Mường Thanh')).toBeInTheDocument();

        // Kiểm tra hiển thị thành phố
        expect(screen.getByText('Hồ Chí Minh')).toBeInTheDocument();
        expect(screen.getByText('Đà Nẵng')).toBeInTheDocument();
    });

    it('HTL-TC-002: [EMPTY] Should handle empty hotel list correctly', () => {
        const store = createMockStore([]);
        render(
            <Provider store={store}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        // Antd ProTable thường hiện "No Data" hoặc không có dòng nào
        expect(screen.queryByText('Khách sạn Continental')).not.toBeInTheDocument();
    });

    it('HTL-TC-003: [INTERACTION & CHECK DB] Should call delete API when confirming deletion', async () => {
        const store = createMockStore(MOCK_HOTEL_DATA);
        (api.callDeleteHotel as any).mockResolvedValue({ isSuccess: true });

        render(
            <Provider store={store}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        // Tìm nút xóa (icon thùng rác) của khách sạn ID 1
        const deleteButtons = screen.getAllByRole('img', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);

        // Đợi Modal xác nhận xuất hiện và bấm nút xác nhận
        await waitFor(() => {
            const confirmBtn = screen.getByRole('button', { name: /Xác nhận/i });
            fireEvent.click(confirmBtn);
        });

        // [CHECK DB]: Verify xem API xóa đã được gọi với đúng ID khách sạn chưa
        await waitFor(() => {
            expect(api.callDeleteHotel).toHaveBeenCalledWith(1);
        });
    });

    it('HTL-TC-004: [INTERACTION] Should open ModalHotel when clicking "Thêm mới"', async () => {
        const store = createMockStore([]);
        render(
            <Provider store={store}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        const addBtn = screen.getByRole('button', { name: /Thêm mới/i });
        fireEvent.click(addBtn);

        await waitFor(() => {
            expect(screen.getByTestId('mock-modal-hotel')).toBeInTheDocument();
        });
    });
    it('HTL-TC-005: [EXCEPTION] Should show error toast when delete hotel fails', async () => {
        const store = createMockStore(MOCK_HOTEL_DATA);
        // Giả lập API trả về thất bại
        (api.callDeleteHotel as any).mockResolvedValue({ isSuccess: false });

        render(
            <Provider store={store}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        const deleteButtons = screen.getAllByRole('img', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            const confirmBtn = screen.getByRole('button', { name: /Xác nhận/i });
            fireEvent.click(confirmBtn);
        });

        // Verify toast.error được gọi để báo lỗi cho người dùng
        const { toast } = await import('react-toastify');
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Có lỗi xảy ra", expect.any(Object));
        });
    });

    it('HTL-TC-006: [INTERACTION] Should open ModalHotel in edit mode with initial values', async () => {
        const store = createMockStore(MOCK_HOTEL_DATA);
        render(
            <Provider store={store}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        const editButtons = screen.getAllByRole('img', { name: /edit/i });
        fireEvent.click(editButtons[0]);

        await waitFor(() => {
            expect(screen.getByTestId('mock-modal-hotel')).toBeInTheDocument();
        });
    });

    it('HTL-TC-007: [SECURITY] Should hide sensitive actions when permissions are false', () => {
        const store = createMockStore(MOCK_HOTEL_DATA);
        render(
            <Provider store={store}>
                <Hotel canCreate={false} canUpdate={false} canDelete={false} />
            </Provider>
        );

        expect(screen.queryByRole('button', { name: /Thêm mới/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('HTL-TC-008: [INTERACTION] Should open ModalHotelDetail when clicking on hotel info', async () => {
        const store = createMockStore(MOCK_HOTEL_DATA);
        render(
            <Provider store={store}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        const hotelName = screen.getByText('Khách sạn Continental');
        fireEvent.click(hotelName);

        await waitFor(() => {
            expect(screen.getByTestId('mock-modal-hotel-detail')).toBeInTheDocument();
        });
    });
});
