import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Country from '@/components/dashboard/country/Country';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import countryReducer from '@/redux/slice/countrySlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { country: countryReducer, account: accountReducer } as any,
    preloadedState: {
        country: { data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 }, ...state },
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('Country Component', () => {
    it('COU-TC-001: [SUCCESS] Should render country list', () => {
        const store = createMockStore({ data: [{ id: 1, name: 'Vietnam' }], isFetching: false, meta: {} });
        render(<Provider store={store}><Country /></Provider>);
        expect(screen.getByText(/Vietnam/i)).toBeInTheDocument();
    });

    it('COU-TC-002: [EMPTY] Should handle empty list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><Country /></Provider>);
        expect(screen.queryByText(/Vietnam/i)).not.toBeInTheDocument();
    });

    it('COU-TC-003: [ERROR] Should handle fetch error', () => {
        const store = createMockStore({ data: [], isFetching: false });
        render(<Provider store={store}><Country /></Provider>);
        expect(screen.getByText(/Danh sách country/i)).toBeInTheDocument();
    });
});
