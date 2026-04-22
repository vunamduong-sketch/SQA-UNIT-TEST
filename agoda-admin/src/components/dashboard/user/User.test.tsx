import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import User from '@/components/dashboard/user/User';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/redux/slice/userSlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { user: userReducer, account: accountReducer } as any,
    preloadedState: {
        user: { data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 }, ...state },
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('User Component (3-Case Standard)', () => {
    it('USR-TC-001: [SUCCESS] Should render user list table', () => {
        const store = createMockStore({ data: [{ id: 1, username: 'tester' }], isFetching: false, meta: {} });
        render(<Provider store={store}><User /></Provider>);
        expect(screen.getByText(/tester/i)).toBeInTheDocument();
    });

    it('USR-TC-002: [EMPTY] Should handle empty user list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><User /></Provider>);
        expect(screen.queryByText(/tester/i)).not.toBeInTheDocument();
    });

    it('USR-TC-003: [ERROR] Should handle fetching error state', () => {
        const store = createMockStore({ data: [], isFetching: false, error: 'Failed' });
        render(<Provider store={store}><User /></Provider>);
        expect(screen.getByText(/Danh sách user/i)).toBeInTheDocument();
    });

    it('USR-TC-004: [VULNERABILITY] Should hide delete/edit actions for non-admin roles', () => {
        // Giả lập người dùng chỉ có quyền USER
        const guestStore = configureStore({
            reducer: { user: userReducer, account: accountReducer } as any,
            preloadedState: {
                user: { data: [{ id: 1, username: 'tester' }], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } },
                account: { user: { role: 'USER' } } as any
            }
        });

        render(<Provider store={guestStore}><User /></Provider>);

        // KỲ VỌNG: Nút xóa phải ẩn đi (NOT in document)
        // THỰC TẾ: Nút xóa vẫn hiện -> Test FAIL -> it.fails chuyển thành PASS (màu xanh)
        const deleteIcon = screen.queryByRole('img', { name: /delete/i });
        expect(deleteIcon).not.toBeInTheDocument();
    });

    it('USR-TC-005: [BUG HUNTER] Should handle extremely long usernames without breaking layout', () => {
        const longName = 'a'.repeat(255); // Tên siêu dài
        const store = createMockStore({ data: [{ id: 2, username: longName }], isFetching: false });

        render(<Provider store={store}><User /></Provider>);
        // Kiểm tra xem trang có bị vỡ hoặc nổ lỗi không
        expect(screen.getByText(new RegExp(longName, 'i'))).toBeInTheDocument();
    });
});
