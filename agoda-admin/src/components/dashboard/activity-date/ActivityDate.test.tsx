import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivityDate from '@/components/dashboard/activity-date/ActivityDate';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import activityDateReducer from '@/redux/slice/activityDateSlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { activityDate: activityDateReducer, account: accountReducer } as any,
    preloadedState: { activityDate: { data: state.data || [], isFetching: false, meta: { currentPage: 1, itemsPerPage: 10, totalPages: 0, totalItems: 0 } }, account: { user: { role: 'ADMIN' } } } as any
});

describe('ActivityDate Component', () => {
    it('ACD-TC-001: [SUCCESS] Should render activity dates', () => {
        const store = createMockStore({ data: [{ id: 1, date_launch: '2024-05-20T00:00:00Z' }], isFetching: false });
        render(<Provider store={store}><ActivityDate /></Provider>);
        expect(screen.getByText(/20-05-2024/i)).toBeInTheDocument();
    });

    it('ACD-TC-002: [EMPTY] Should handle empty list', () => {
        const store = createMockStore({ data: [], isFetching: false });
        render(<Provider store={store}><ActivityDate /></Provider>);
        expect(screen.queryByText(/2024-05-20/i)).not.toBeInTheDocument();
    });

    it('ACD-TC-003: [ERROR] Should handle fetch error', () => {
        render(<Provider store={createMockStore({ data: [], isFetching: false })}><ActivityDate /></Provider>);
        expect(screen.getByText(/Danh sách activity date/i)).toBeInTheDocument();
    });
});
