import { describe, it, expect } from 'vitest';
import cityReducer, { fetchCity } from '@/redux/slice/citySlide';

describe('citySlide Redux Slice', () => {
    it('SLI-TC-028: Should handle pending', () => {
        const state = cityReducer(undefined, { type: fetchCity.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-029: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = cityReducer(undefined, { type: fetchCity.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-030: Should handle rejected', () => {
        const state = cityReducer(undefined, { type: fetchCity.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
