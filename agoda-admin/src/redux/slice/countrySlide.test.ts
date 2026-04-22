import { describe, it, expect } from 'vitest';
import countryReducer, { fetchCountry } from '@/redux/slice/countrySlide';

describe('countrySlide Redux Slice', () => {
    it('SLI-TC-034: Should handle pending', () => {
        const state = countryReducer(undefined, { type: fetchCountry.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-035: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = countryReducer(undefined, { type: fetchCountry.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-036: Should handle rejected', () => {
        const state = countryReducer(undefined, { type: fetchCountry.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
