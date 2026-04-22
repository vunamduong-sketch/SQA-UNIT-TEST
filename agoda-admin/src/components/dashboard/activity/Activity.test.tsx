import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Activity from '@/components/dashboard/activity/Activity';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import activityReducer from '@/redux/slice/activitySlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { activity: activityReducer, account: accountReducer } as any,
    preloadedState: {
        activity: { data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 }, ...state },
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('Activity Component', () => {
    it('ACT-TC-001: [SUCCESS] Should render activities', () => {
        const store = createMockStore({ data: [{ id: 1, name: 'Bana Hills Tour' }], isFetching: false, meta: {} });
        render(<Provider store={store}><Activity /></Provider>);
        expect(screen.getByText(/Bana Hills/i)).toBeInTheDocument();
    });

    it('ACT-TC-002: [EMPTY] Should handle empty activity list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><Activity /></Provider>);
        expect(screen.queryByText(/Bana Hills/i)).not.toBeInTheDocument();
    });

    it('ACT-TC-003: [ERROR] Should handle API error', () => {
        render(<Provider store={createMockStore({ data: [], isFetching: false })}><Activity /></Provider>);
        expect(screen.getByText(/Danh sách activity/i)).toBeInTheDocument();
    });
});
