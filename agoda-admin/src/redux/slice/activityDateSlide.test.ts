import { describe, it, expect } from 'vitest';
import activityDateReducer, { fetchActivityDate } from '@/redux/slice/activityDateSlide';

describe('activityDateSlide Redux Slice', () => {
    it('SLI-TC-007: Should handle pending', () => {
        const state = activityDateReducer(undefined, { type: fetchActivityDate.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-008: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = activityDateReducer(undefined, { type: fetchActivityDate.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-009: Should handle rejected', () => {
        const state = activityDateReducer(undefined, { type: fetchActivityDate.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
