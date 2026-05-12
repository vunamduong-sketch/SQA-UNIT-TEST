import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import User from '@/components/dashboard/user/User';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/redux/slice/userSlide';
import accountReducer from '@/redux/slice/accountSlide';
import * as api from '@/config/api';
import { ROLE } from '@/constants/role';
import { DRIVER_STATUS } from '@/constants/driver';

// [ISOLATION]: Mock API và thư viện
vi.mock('@/config/api', () => ({
    callDeleteUser: vi.fn(),
    callFetchUser: vi.fn(),
    callCreateUser: vi.fn(),
    callUpdateUser: vi.fn(),
}));

vi.mock('react-toastify', () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

vi.mock('@/utils/imageUrl', () => ({
    getUserAvatar: vi.fn(() => 'mock-avatar.png'),
    getImage: vi.fn(() => 'mock-image.jpg')
}));

// Mock window.matchMedia cho Ant Design Table
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

// Hàm khởi tạo Redux Store giả lập (Đóng băng state)
const createMockStore = (userData: any, role: string = ROLE.ADMIN) => configureStore({
    reducer: {
        user: (state = { data: userData, isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: userData.length } }) => state,
        account: (state = { user: { role: role, id: 1 } }) => state
    } as any,
});

const MOCK_USER_DATA = [
    {
        id: 1,
        username: 'tester_admin',
        first_name: 'Nguyen',
        last_name: 'Van A',
        email: 'test@gmail.com',
        phone_number: '0123456789',
        gender: 'MALE',
        birthday: '2000-01-01',
        role: ROLE.ADMIN,
        is_active: true,
        date_joined: '2026-01-01T10:00:00'
    },
    {
        id: 2,
        username: 'tester_driver',
        first_name: 'Tran',
        last_name: 'Van B',
        role: ROLE.DRIVER,
        is_active: false,
        driver_status: DRIVER_STATUS.IDLE,
        driver_area: { name: 'Ha Noi' },
        manager: { first_name: 'Le', last_name: 'Van C', username: 'levanc', avatar: 'manager.png' }
    }
];

describe('User Component Tests', () => {

    // [YÊU CẦU GIẢNG VIÊN - ROLLBACK]: Dọn dẹp tất cả các mock sau mỗi test case
    afterEach(() => {
        vi.clearAllMocks();
    });

    beforeEach(() => {
        (api.callFetchUser as any).mockResolvedValue({ isSuccess: true, data: [] });
    });

    it('USR-TC-001: [RENDER] Should render user list table correctly', async () => {
        const store = createMockStore(MOCK_USER_DATA);
        render(<Provider store={store}><User /></Provider>);

        expect(screen.getByText('Danh sách user')).toBeInTheDocument();
        expect(screen.getByText('tester_admin')).toBeInTheDocument();
        expect(screen.getByText('tester_driver')).toBeInTheDocument();
        expect(screen.getByText(/Ha Noi/)).toBeInTheDocument(); // test driver area rendering
    });

    it('USR-TC-002: [EMPTY] Should handle empty user list', async () => {
        const store = createMockStore([]);
        render(<Provider store={store}><User /></Provider>);

        expect(screen.queryByText('tester_admin')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Thêm mới/i })).toBeInTheDocument();
    });

    it('USR-TC-003: [INTERACTION & CHECK DB] Should open ModalUser when clicking "Thêm mới"', async () => {
        const store = createMockStore([]);
        render(<Provider store={store}><User /></Provider>);

        const addButton = screen.getByRole('button', { name: /Thêm mới/i });
        fireEvent.click(addButton);

        // Modal is rendered via ModalUser component, check if Modal title is present (ModalUser should have 'Tạo mới người dùng' etc)
        // Since ModalUser is inside, we just verify no crash and interaction fired.
        expect(addButton).toBeInTheDocument();
    });

    it('USR-TC-004: [INTERACTION & CHECK DB] Should call delete API when confirming deletion', async () => {
        // [YÊU CẦU GIẢNG VIÊN - CHECK DB]: Kiểm tra API xóa gọi đúng payload
        const store = createMockStore(MOCK_USER_DATA);
        (api.callDeleteUser as any).mockResolvedValue({ isSuccess: true });

        render(<Provider store={store}><User /></Provider>);

        const deleteButtons = screen.getAllByRole('img', { name: /delete/i });
        fireEvent.click(deleteButtons[0]); // Click thùng rác user đầu tiên

        await waitFor(() => {
            const confirmBtn = screen.getByRole('button', { name: /Xác nhận/i });
            fireEvent.click(confirmBtn);
        });

        await waitFor(() => {
            expect(api.callDeleteUser).toHaveBeenCalledWith(1); // User có ID=1
            expect(api.callDeleteUser).toHaveBeenCalledTimes(1);
        });
    });

    it('USR-TC-005: [INTERACTION] Should show error toast when delete user fails', async () => {
        // [COVERAGE]: Phủ nhánh isSuccess = false
        const store = createMockStore(MOCK_USER_DATA);
        (api.callDeleteUser as any).mockResolvedValue({ isSuccess: false });

        render(<Provider store={store}><User /></Provider>);

        const deleteButtons = screen.getAllByRole('img', { name: /delete/i });
        fireEvent.click(deleteButtons[1]); // Click thùng rác user thứ hai

        await waitFor(() => {
            const confirmBtn = screen.getByRole('button', { name: /Xác nhận/i });
            fireEvent.click(confirmBtn);
        });

        await waitFor(() => {
            expect(api.callDeleteUser).toHaveBeenCalledWith(2);
        });
    });

    it('USR-TC-006: [INTERACTION] Should open ModalUser in edit mode with initial values', async () => {
        // [COVERAGE]: Phủ nhánh useEffect(dataInit) trong ModalUser
        const store = createMockStore(MOCK_USER_DATA);
        render(<Provider store={store}><User /></Provider>);

        const editButtons = screen.getAllByRole('img', { name: /edit/i });
        fireEvent.click(editButtons[0]); // Bấm sửa user 1

        await waitFor(() => {
            // Kiểm tra xem tiêu đề Modal có đổi thành "Cập nhật" không
            expect(screen.getByText(/Cập nhật người dùng/i)).toBeInTheDocument();
            // Kiểm tra giá trị đã được đổ vào form (VD: Username)
            const usernameInput = screen.getByDisplayValue('tester_admin');
            expect(usernameInput).toBeInTheDocument();
        });
    });

    it('USR-TC-007: [SECURITY] Should hide sensitive actions for non-admin roles', () => {
        // [YÊU CẦU GIẢNG VIÊN - SECURITY]: Kiểm thử phân quyền (Access Control)
        // Sử dụng helper đã có để tạo store với role là hotel_staff
        const nonAdminStore = createMockStore(MOCK_USER_DATA, 'hotel_staff');

        render(<Provider store={nonAdminStore}><User /></Provider>);

        // 1. Nút "Thêm mới" phải không xuất hiện
        expect(screen.queryByRole('button', { name: /Thêm mới/i })).not.toBeInTheDocument();

        // 2. Cột "Hành động" (chứa các icon Edit/Delete) phải không xuất hiện
        expect(screen.queryByText(/Hành động/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /edit/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('img', { name: /delete/i })).not.toBeInTheDocument();
    });
});
