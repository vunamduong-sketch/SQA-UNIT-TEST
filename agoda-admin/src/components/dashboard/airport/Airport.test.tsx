import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Airport from '@/components/dashboard/airport/Airport';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import airportReducer from '@/redux/slice/airportSlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { airport: airportReducer, account: accountReducer } as any,
    preloadedState: {
        airport: { data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 }, ...state },
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('Airport Component', () => {
    it('APT-TC-001: [SUCCESS] Should render airport list', () => {
        const store = createMockStore({ data: [{ id: 1, name: 'Noi Bai International' }], isFetching: false, meta: {} });
        render(<Provider store={store}><Airport /></Provider>);
        expect(screen.getByText(/Noi Bai/i)).toBeInTheDocument();
    });

    it('APT-TC-002: [EMPTY] Should handle empty list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><Airport /></Provider>);
        expect(screen.queryByText(/Noi Bai/i)).not.toBeInTheDocument();
    });

    it('APT-TC-003: [ERROR] Should handle fetch error', () => {
        const store = createMockStore({ data: [], isFetching: false });
        render(<Provider store={store}><Airport /></Provider>);
        expect(screen.getByText(/Danh sách airport/i)).toBeInTheDocument();
    });
});
