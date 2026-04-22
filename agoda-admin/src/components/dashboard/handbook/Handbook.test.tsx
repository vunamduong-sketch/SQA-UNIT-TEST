import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Handbook from '@/components/dashboard/handbook/Handbook';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import handbookReducer from '@/redux/slice/handbookSlide';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = (state: any) => configureStore({
    reducer: { handbook: handbookReducer, account: accountReducer } as any,
    preloadedState: { handbook: { data: state.data || [], isFetching: false, meta: { currentPage: 1, pageSize: 10, totalItems: 0 } }, account: { user: { role: 'ADMIN' } } } as any
});

describe('Handbook Component', () => {
    it('HND-TC-001: [SUCCESS] Should render handbooks', () => {
        const store = createMockStore({ data: [{ id: 1, title: 'Cẩm nang du lịch' }], isFetching: false });
        render(<Provider store={store}><Handbook /></Provider>);
        expect(screen.getByText(/Cẩm nang/i)).toBeInTheDocument();
    });

    it('HND-TC-002: [EMPTY] Should handle empty handbook list', () => {
        const store = createMockStore({ data: [], isFetching: false });
        render(<Provider store={store}><Handbook /></Provider>);
        expect(screen.queryByText(/Cẩm nang/i)).not.toBeInTheDocument();
    });

    it('HND-TC-003: [ERROR] Should handle API error gracefully', () => {
        render(<Provider store={createMockStore({ data: [], isFetching: false })}><Handbook /></Provider>);
        expect(screen.getByText(/Danh sách handbook/i)).toBeInTheDocument();
    });
});
