import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Room from '@/components/dashboard/room/Room';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import roomReducer from '@/redux/slice/roomSlide';
import accountReducer from '@/redux/slice/accountSlide';
import * as api from '@/config/api';

// [ ISOLATION]: Mock API và Utility
vi.mock('@/config/api', () => ({
    callDeleteRoom: vi.fn(),
    callFetchRoom: vi.fn(),
    callFetchHotel: vi.fn(() => Promise.resolve({ isSuccess: true, data: [] })),
}));

// Mock các Modal con để tránh crash do MDXEditor
vi.mock('./ModalRoom', () => ({
    __esModule: true,
    default: ({ openModal }: any) => openModal ? <div data-testid="mock-modal-room">Modal Room Open</div> : null
}));

vi.mock('./ModalRoomDetail', () => ({
    __esModule: true,
    default: ({ isModalOpen }: any) => isModalOpen ? <div data-testid="mock-modal-room-detail">Modal Detail Open</div> : null
}));

vi.mock('react-toastify', () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('@/utils/imageUrl', () => ({
    getUserAvatar: vi.fn(() => 'mock-avatar.png'),
    getImage: vi.fn(() => 'mock-image.jpg')
}));

// Giả lập biến môi trường
vi.stubEnv('VITE_BE_URL', 'http://localhost:8000');

// Mock Ant Design matchMedia
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

// [REDUX STATIC STORE]: Đóng băng dữ liệu đầu vào cho Test
const createMockStore = (roomData: any) => configureStore({
    reducer: {
        room: roomReducer,
        account: accountReducer
    } as any,
    preloadedState: {
        room: {
            data: roomData,
            isFetching: false,
            meta: { currentPage: 1, itemsPerPage: 10, totalItems: roomData.length }
        },
        account: {
            user: { role: 'ADMIN' }
        }
    } as any
});

const MOCK_ROOM_DATA = [
    {
        id: 101,
        room_type: 'King Suite Deluxe',
        stay_type: 'OVERNIGHT',
        price_per_night: 2000000,
        area_m2: 50,
        beds: 1,
        available: true,
        hotel: { name: 'Continental Hotel', thumbnail: 'thumb.jpg' },
        images: [{ image: 'room1.jpg' }],
        description: 'Phòng cực đẹp'
    }
];

describe('Room Component Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        // [ROLLBACK]: Đảm bảo dọn dẹp mock sạch sẽ
        vi.clearAllMocks();
    });

    it('ROO-TC-001: [RENDER] Should render room list table correctly', () => {
        const store = createMockStore(MOCK_ROOM_DATA);
        render(
            <Provider store={store}>
                <Room canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        expect(screen.getByText('King Suite Deluxe')).toBeInTheDocument();
        expect(screen.getByText('Continental Hotel')).toBeInTheDocument();
    });

    it('ROO-TC-002: [INTERACTION] Should open ModalRoomDetail when clicking on room name', async () => {
        const store = createMockStore(MOCK_ROOM_DATA);
        render(
            <Provider store={store}>
                <Room canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        // Click vào tên phòng để xem chi tiết
        const roomLink = screen.getByText('King Suite Deluxe');
        fireEvent.click(roomLink);

        // Kiểm tra xem Modal chi tiết đã mở chưa thông qua TestId của Mock
        await waitFor(() => {
            expect(screen.getByTestId('mock-modal-room-detail')).toBeInTheDocument();
        });
    });

    it('ROO-TC-003: [INTERACTION & CHECK DB] Should call delete API when confirming deletion', async () => {
        const store = createMockStore(MOCK_ROOM_DATA);
        (api.callDeleteRoom as any).mockResolvedValue({ isSuccess: true });

        render(
            <Provider store={store}>
                <Room canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        // Tìm nút xóa (icon thùng rác)
        const deleteButtons = screen.getAllByRole('img', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);

        // Xác nhận xóa trong Modal Popconfirm (AntD)
        await waitFor(() => {
            const confirmBtn = screen.getByRole('button', { name: /Xác nhận/i });
            fireEvent.click(confirmBtn);
        });

        // [CHECK DB]: Verify API được gọi với đúng Room ID 101
        await waitFor(() => {
            expect(api.callDeleteRoom).toHaveBeenCalledWith(101);
        });
    });

    it('ROO-TC-004: [INTERACTION] Should open ModalRoom when clicking "Thêm mới"', async () => {
        const store = createMockStore([]);
        render(
            <Provider store={store}>
                <Room canCreate={true} />
            </Provider>
        );

        const addBtn = screen.getByRole('button', { name: /Thêm mới/i });
        fireEvent.click(addBtn);

        // Kiểm tra xem Modal Thêm mới đã mở chưa thông qua TestId của Mock
        await waitFor(() => {
            expect(screen.getByTestId('mock-modal-room')).toBeInTheDocument();
        });
    });
    it('ROO-TC-005: [EMPTY] Should handle empty room list correctly', () => {
        const store = createMockStore([]);
        render(
            <Provider store={store}>
                <Room canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        // Đảm bảo không hiển thị tên phòng từ dữ liệu mock cũ
        expect(screen.queryByText('King Suite Deluxe')).not.toBeInTheDocument();
    });

    it('ROO-TC-006: [EXCEPTION] Should show error toast when delete room fails', async () => {
        const store = createMockStore(MOCK_ROOM_DATA);
        // Giả lập lỗi API
        (api.callDeleteRoom as any).mockResolvedValue({ isSuccess: false });

        render(
            <Provider store={store}>
                <Room canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        const deleteButtons = screen.getAllByRole('img', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            const confirmBtn = screen.getByRole('button', { name: /Xác nhận/i });
            fireEvent.click(confirmBtn);
        });

        // Đảm bảo có Toast thông báo lỗi tới người dùng
        const { toast } = await import('react-toastify');
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Có lỗi xảy ra", expect.any(Object));
        });
    });

    it('ROO-TC-007: [INTERACTION] Should open ModalRoom in edit mode when clicking edit icon', async () => {
        const store = createMockStore(MOCK_ROOM_DATA);
        render(
            <Provider store={store}>
                <Room canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        // Bấm nút sửa phòng
        const editButtons = screen.getAllByRole('img', { name: /edit/i });
        fireEvent.click(editButtons[0]);

        // Đảm bảo Mock Modal (sửa) đã được gọi
        await waitFor(() => {
            expect(screen.getByTestId('mock-modal-room')).toBeInTheDocument();
        });
    });

    it('ROO-TC-008: [SECURITY] Should hide sensitive actions when permissions are false', () => {
        const store = createMockStore(MOCK_ROOM_DATA);
        render(
            <Provider store={store}>
                {/* User không có quyền Create/Update/Delete */}
                <Room canCreate={false} canUpdate={false} canDelete={false} />
            </Provider>
        );

        // Không một nút nhạy cảm nào được lọt ra giao diện
        expect(screen.queryByRole('button', { name: /Thêm mới/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /delete/i })).not.toBeInTheDocument();
    });
});
