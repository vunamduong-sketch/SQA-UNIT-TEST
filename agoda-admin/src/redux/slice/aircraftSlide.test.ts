import { describe, it, expect } from 'vitest';
import aircraftReducer, { fetchAircraft } from '@/redux/slice/aircraftSlide';

describe('aircraftSlide Redux Slice', () => {
    it('SLI-TC-016: Should handle pending', () => {
        const state = aircraftReducer(undefined, { type: fetchAircraft.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-017: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = aircraftReducer(undefined, { type: fetchAircraft.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-018: Should handle rejected', () => {
        const state = aircraftReducer(undefined, { type: fetchAircraft.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
