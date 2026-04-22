import { describe, it, expect } from 'vitest';
import flightLegReducer, { fetchFlightLeg } from '@/redux/slice/flightLegSlide';

describe('flightLegSlide Redux Slice', () => {
    it('SLI-TC-037: Should handle pending', () => {
        const state = flightLegReducer(undefined, { type: fetchFlightLeg.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-038: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 501 }], meta: {} };
        const state = flightLegReducer(undefined, { type: fetchFlightLeg.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-039: Should handle rejected', () => {
        const state = flightLegReducer(undefined, { type: fetchFlightLeg.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
