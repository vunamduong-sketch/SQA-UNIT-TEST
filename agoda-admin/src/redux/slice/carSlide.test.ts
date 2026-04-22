import { describe, it, expect } from 'vitest';
import carReducer, { fetchCar } from '@/redux/slice/carSlide';

describe('carSlide Redux Slice', () => {
    it('SLI-TC-025: Should handle pending', () => {
        const state = carReducer(undefined, { type: fetchCar.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-026: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = carReducer(undefined, { type: fetchCar.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-027: Should handle rejected', () => {
        const state = carReducer(undefined, { type: fetchCar.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
