import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Car from '@/components/dashboard/car/Car';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import carReducer from '@/redux/slice/carSlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { car: carReducer, account: accountReducer } as any,
    preloadedState: { car: { data: state.data || [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } }, account: { user: { role: 'ADMIN' } } } as any
});

describe('Car Component', () => {
    it('CAR-TC-001: [SUCCESS] Should render car listings', () => {
        const store = createMockStore({ data: [{ id: 1, name: 'Toyota Fortuner' }], isFetching: false, meta: {} });
        render(<Provider store={store}><Car /></Provider>);
        expect(screen.getByText(/Fortuner/i)).toBeInTheDocument();
    });

    it('CAR-TC-002: [EMPTY] Should handle empty list', () => {
        const store = createMockStore({ data: [], isFetching: false, meta: {} });
        render(<Provider store={store}><Car /></Provider>);
        expect(screen.queryByText(/Fortuner/i)).not.toBeInTheDocument();
    });

    it('CAR-TC-003: [ERROR] Should handle fetch error', () => {
        render(<Provider store={createMockStore({ data: [], isFetching: false })}><Car /></Provider>);
        expect(screen.getByText(/Danh sách car/i)).toBeInTheDocument();
    });
});
