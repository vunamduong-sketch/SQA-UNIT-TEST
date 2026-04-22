import { describe, it, expect } from 'vitest';
import promotionReducer, { fetchPromotion } from '@/redux/slice/promotionSlide';

describe('promotionSlide Redux Slice', () => {
    it('SLI-TC-052: Should handle pending', () => {
        const state = promotionReducer(undefined, { type: fetchPromotion.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-053: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = promotionReducer(undefined, { type: fetchPromotion.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-054: Should handle rejected', () => {
        const state = promotionReducer(undefined, { type: fetchPromotion.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
