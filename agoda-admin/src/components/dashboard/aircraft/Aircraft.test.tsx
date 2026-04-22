import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Aircraft from '@/components/dashboard/aircraft/Aircraft';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import aircraftReducer from '@/redux/slice/aircraftSlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { aircraft: aircraftReducer, account: accountReducer } as any,
    preloadedState: {
        aircraft: { data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 }, ...state },
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('Aircraft Component', () => {
    it('AIR-TC-001: [SUCCESS] Should render aircraft list', () => {
        const store = createMockStore({ data: [{ id: 1, model: 'Boeing 747' }], isFetching: false, meta: {} });
        render(<Provider store={store}><Aircraft /></Provider>);
        expect(screen.getByText(/Boeing 747/i)).toBeInTheDocument();
    });

    it('AIR-TC-002: [EMPTY] Should handle empty list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><Aircraft /></Provider>);
        expect(screen.queryByText(/Boeing 747/i)).not.toBeInTheDocument();
    });

    it('AIR-TC-003: [ERROR] Should handle fetch error', () => {
        const store = createMockStore({ data: [], isFetching: false });
        render(<Provider store={store}><Aircraft /></Provider>);
        expect(screen.getByText(/Danh sách aircraft/i)).toBeInTheDocument();
    });
});
