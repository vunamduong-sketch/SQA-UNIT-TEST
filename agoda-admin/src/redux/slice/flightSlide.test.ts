import { describe, it, expect } from 'vitest';
import flightReducer, { fetchFlight } from '@/redux/slice/flightSlide';

describe('flightSlide Redux Slice', () => {
    const initialState = { isFetching: true, meta: {}, data: [] };

    it('SLI-TC-040: Should be fetching when pending', () => {
        const state = flightReducer(undefined, { type: fetchFlight.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-041: Should store flights when fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 101 }], meta: { totalItems: 1 } };
        const state = flightReducer(undefined, { type: fetchFlight.fulfilled.type, payload });
        expect(state.data[0].id).toBe(101);
    });

    it('SLI-TC-042: Should stop fetching when rejected', () => {
        const state = flightReducer(undefined, { type: fetchFlight.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
