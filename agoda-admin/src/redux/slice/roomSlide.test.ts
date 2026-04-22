import { describe, it, expect } from 'vitest';
import roomReducer, { fetchRoom } from '@/redux/slice/roomSlide';

describe('roomSlide Redux Slice', () => {
    it('SLI-TC-055: Should handle pending', () => {
        const state = roomReducer(undefined, { type: fetchRoom.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-056: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = roomReducer(undefined, { type: fetchRoom.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-057: Should handle rejected', () => {
        const state = roomReducer(undefined, { type: fetchRoom.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
