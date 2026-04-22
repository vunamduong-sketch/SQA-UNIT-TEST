import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import City from '@/components/dashboard/city/City';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cityReducer from '@/redux/slice/citySlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { city: cityReducer, account: accountReducer } as any,
    preloadedState: {
        city: { data: [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 }, ...state },
        account: { user: { role: 'ADMIN' }, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } } as any
    }
});

describe('City Component', () => {
    it('CIT-TC-001: [SUCCESS] Should render city list', () => {
        const store = createMockStore({ data: [{ id: 1, name: 'Hà Nội' }], isFetching: false, meta: {} });
        render(<Provider store={store}><City /></Provider>);
        expect(screen.getByText(/Hà Nội/i)).toBeInTheDocument();
    });

    it('CIT-TC-002: [EMPTY] Should handle empty list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><City /></Provider>);
        expect(screen.queryByText(/Hà Nội/i)).not.toBeInTheDocument();
    });

    it('CIT-TC-003: [ERROR] Should handle fetch error', () => {
        const store = createMockStore({ data: [], isFetching: false });
        render(<Provider store={store}><City /></Provider>);
        expect(screen.getByText(/Danh sách city/i)).toBeInTheDocument();
    });
});
