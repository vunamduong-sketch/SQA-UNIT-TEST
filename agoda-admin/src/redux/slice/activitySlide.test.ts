import { describe, it, expect } from 'vitest';
import activityReducer, { fetchActivity } from '@/redux/slice/activitySlide';

describe('activitySlide Redux Slice', () => {
    it('SLI-TC-013: Should handle pending', () => {
        const state = activityReducer(undefined, { type: fetchActivity.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-014: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = activityReducer(undefined, { type: fetchActivity.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-015: Should handle rejected', () => {
        const state = activityReducer(undefined, { type: fetchActivity.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
