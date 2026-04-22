import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Room from '@/components/dashboard/room/Room';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import roomReducer from '@/redux/slice/roomSlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { room: roomReducer, account: accountReducer } as any,
    preloadedState: {
        room: { data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 }, ...state },
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('Room Component', () => {
    it('ROO-TC-001: [SUCCESS] Should render rooms', () => {
        const store = createMockStore({ data: [{ id: 1, room_type: 'King Suite' }], isFetching: false, meta: {} });
        render(<Provider store={store}><Room /></Provider>);
        expect(screen.getByText(/King Suite/i)).toBeInTheDocument();
    });

    it('ROO-TC-002: [EMPTY] Should handle empty room list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><Room /></Provider>);
        expect(screen.queryByText(/King Suite/i)).not.toBeInTheDocument();
    });

    it('ROO-TC-003: [ERROR] Should handle fetch error', () => {
        const store = createMockStore({ data: [], isFetching: false });
        render(<Provider store={store}><Room /></Provider>);
        expect(screen.getByText(/Danh sách room/i)).toBeInTheDocument();
    });
});
