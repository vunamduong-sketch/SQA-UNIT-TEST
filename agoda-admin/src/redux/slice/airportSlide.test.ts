import { describe, it, expect } from 'vitest';
import airportReducer, { fetchAirport } from '@/redux/slice/airportSlide';

describe('airportSlide Redux Slice', () => {
    it('SLI-TC-022: Should handle pending', () => {
        const state = airportReducer(undefined, { type: fetchAirport.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-023: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = airportReducer(undefined, { type: fetchAirport.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-024: Should handle rejected', () => {
        const state = airportReducer(undefined, { type: fetchAirport.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
