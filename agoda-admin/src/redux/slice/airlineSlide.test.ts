import { describe, it, expect } from 'vitest';
import airlineReducer, { fetchAirline } from '@/redux/slice/airlineSlide';

describe('airlineSlide Redux Slice', () => {
    it('SLI-TC-019: Should handle pending', () => {
        const state = airlineReducer(undefined, { type: fetchAirline.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-020: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = airlineReducer(undefined, { type: fetchAirline.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-021: Should handle rejected', () => {
        const state = airlineReducer(undefined, { type: fetchAirline.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
