import { describe, it, expect } from 'vitest';
import activityPackageReducer, { fetchActivityPackage } from '@/redux/slice/activityPackageSlide';

describe('activityPackageSlide Redux Slice', () => {
    it('SLI-TC-010: Should handle pending', () => {
        const state = activityPackageReducer(undefined, { type: fetchActivityPackage.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-011: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = activityPackageReducer(undefined, { type: fetchActivityPackage.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-012: Should handle rejected', () => {
        const state = activityPackageReducer(undefined, { type: fetchActivityPackage.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
