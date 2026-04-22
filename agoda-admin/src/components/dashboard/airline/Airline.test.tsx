import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Airline from '@/components/dashboard/airline/Airline';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import airlineReducer from '@/redux/slice/airlineSlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { airline: airlineReducer, account: accountReducer } as any,
    preloadedState: {
        airline: { data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 }, ...state },
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('Airline Component', () => {
    it('ALN-TC-001: [SUCCESS] Should render airline list', () => {
        const store = createMockStore({ data: [{ id: 1, name: 'Vietnam Airlines' }], isFetching: false, meta: {} });
        render(<Provider store={store}><Airline /></Provider>);
        expect(screen.getByText(/Vietnam Airlines/i)).toBeInTheDocument();
    });

    it('ALN-TC-002: [EMPTY] Should handle empty list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><Airline /></Provider>);
        expect(screen.queryByText(/Vietnam Airlines/i)).not.toBeInTheDocument();
    });

    it('ALN-TC-003: [ERROR] Should handle fetch error', () => {
        const store = createMockStore({ data: [], isFetching: false });
        render(<Provider store={store}><Airline /></Provider>);
        expect(screen.getByText(/Danh sách airline/i)).toBeInTheDocument();
    });
});
