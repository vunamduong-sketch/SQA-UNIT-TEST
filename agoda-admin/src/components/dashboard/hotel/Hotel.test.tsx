import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hotel from '@/components/dashboard/hotel/Hotel';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import hotelReducer from '@/redux/slice/hotelSlide';
import accountReducer from '@/redux/slice/accountSlide';

// Mock các thư viện và ảnh tĩnh
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/utils/imageUrl', () => ({
    getUserAvatar: vi.fn(() => 'mock-avatar.png'),
    getImage: vi.fn(() => 'mock-image.jpg')
}));
vi.mock('/images/user/default-avatar.png', () => ({ default: 'mock-avatar.png' }));
vi.mock('/images/error/not-found.jpg', () => ({ default: 'mock-image.jpg' }));

const createMockStore = (hotelData: any) => configureStore({
    reducer: {
        hotel: hotelReducer,
        account: accountReducer
    } as any,
    preloadedState: {
        hotel: { data: hotelData, isFetching: false, meta: {} } as any,
        account: { user: { role: 'ADMIN' } } as any
    }
});

describe('Hotel Component - Crash Vulnerability Testing', () => {

    it('HTL-TC-001: [IMAGE CRASH] Should handle empty image arrays without crashing', () => {
        const brokenData = [{
            id: 1,
            name: 'Broken Hotel',
            images: [], // Mảng rỗng - Điểm yếu tại Line 158
            city: { name: 'Hanoi' },
            owner: { first_name: 'John', last_name: 'Doe' }
        }];

        // Nếu test này ném lỗi "Cannot read property 'image' of undefined", nghĩa là bug đã được xác nhận
        render(
            <Provider store={createMockStore(brokenData)}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        expect(screen.getByText(/Broken Hotel/i)).toBeInTheDocument();
    });

    it('HTL-TC-002: [RELATION CRASH] Should handle missing city relationship', () => {
        const noCityData = [{
            id: 2,
            name: 'No City Hotel',
            images: [{ image: 'test.jpg' }],
            city: null, // Thiếu thành phố - Điểm yếu tại Line 98
            owner: { first_name: 'Jane', last_name: 'Doe' }
        }];

        render(
            <Provider store={createMockStore(noCityData)}>
                <Hotel canCreate={true} canUpdate={true} canDelete={true} />
            </Provider>
        );

        expect(screen.getByText(/No City Hotel/i)).toBeInTheDocument();
    });
});
