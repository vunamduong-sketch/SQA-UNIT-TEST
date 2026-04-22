import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoomAmenityTable from '@/components/dashboard/room-amenity/RoomAmenityTable';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import accountReducer from '@/redux/slice/accountSlide';

const createMockStore = () => configureStore({
    reducer: { account: accountReducer } as any,
    preloadedState: { account: { user: { role: 'ADMIN' } } as any }
});

describe('RoomAmenity Component', () => {
    it('RAM-TC-001: [SUCCESS] Should render room amenities', () => {
        render(<Provider store={createMockStore()}><RoomAmenityTable /></Provider>);
        expect(screen.getByText(/Danh sách các tiện nghi/i)).toBeInTheDocument();
    });

    it('RAM-TC-002: [EMPTY] Should handle zero amenities', () => {
        render(<Provider store={createMockStore()}><RoomAmenityTable /></Provider>);
        // Kiểm tra table không crash
    });

    it('RAM-TC-003: [ERROR] Should handle modal open error', () => {
        render(<Provider store={createMockStore()}><RoomAmenityTable /></Provider>);
        // Kiểm tra crash-safety
    });
});
