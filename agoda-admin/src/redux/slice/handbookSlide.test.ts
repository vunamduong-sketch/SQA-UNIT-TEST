import { describe, it, expect } from 'vitest';
import handbookReducer, { fetchHandbook } from '@/redux/slice/handbookSlide';

describe('handbookSlide Redux Slice', () => {
    it('SLI-TC-043: Should handle pending', () => {
        const state = handbookReducer(undefined, { type: fetchHandbook.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-044: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = handbookReducer(undefined, { type: fetchHandbook.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-045: Should handle rejected', () => {
        const state = handbookReducer(undefined, { type: fetchHandbook.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
