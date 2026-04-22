import { describe, it, expect } from 'vitest';
import userReducer, { fetchUser } from '@/redux/slice/userSlide';

describe('userSlide Redux Slice', () => {
    const initialState = {
        isFetching: true,
        meta: { currentPage: 1, itemsPerPage: 10, totalPages: 0, totalItems: 0 },
        data: []
    };

    it('SLI-TC-058: Should set isFetching to true when pending', () => {
        const state = userReducer(initialState, { type: fetchUser.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-059: Should update data when fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: { totalItems: 100 } };
        const state = userReducer(initialState, { type: fetchUser.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
        expect(state.isFetching).toBe(false);
    });

    it('SLI-TC-060: Should handle API error (Rejected)', () => {
        const state = userReducer(initialState, { type: fetchUser.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
