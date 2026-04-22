import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlightPromotion from '@/components/promotion/flight-promotion/FlightPromotion';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import promotionReducer from '@/redux/slice/promotionSlide';
import accountReducer from '@/redux/slice/accountSlide';

// Mock dependencies
vi.mock('../../../config/api', () => ({
    callFetchFlightPromotion: vi.fn(),
    callDeleteFlightPromotion: vi.fn()
}));

const mockStore = configureStore({
    reducer: {
        promotion: promotionReducer,
        account: accountReducer
    } as any
});

/**
 * FNC: Flight Promotion Management
 */
describe('FlightPromotion Component', () => {

    // PRO-TC-001: Hiển thị giao diện quản lý khuyến mãi bay (Equivalence Class)
    it('PRO-TC-001: Should render Promotion Management header', () => {
        render(
            <Provider store={mockStore}>
                <FlightPromotion />
            </Provider>
        );
        expect(screen.getByText(/Quản lý khuyến mãi/i)).toBeInTheDocument();
    });
});
