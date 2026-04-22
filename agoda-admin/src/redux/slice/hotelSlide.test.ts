import { describe, it, expect } from 'vitest';
import hotelReducer, { fetchHotel } from '@/redux/slice/hotelSlide';

describe('hotelSlide Redux Slice', () => {
    it('SLI-TC-046: Should handle pending', () => {
        const state = hotelReducer(undefined, { type: fetchHotel.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-047: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = hotelReducer(undefined, { type: fetchHotel.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-048: Should handle rejected', () => {
        const state = hotelReducer(undefined, { type: fetchHotel.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
