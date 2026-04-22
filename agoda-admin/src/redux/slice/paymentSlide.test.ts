import { describe, it, expect } from 'vitest';
import paymentReducer, { fetchPayment } from '@/redux/slice/paymentSlide';

describe('paymentSlide Redux Slice', () => {
    it('SLI-TC-049: Should handle pending', () => {
        const state = paymentReducer(undefined, { type: fetchPayment.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-050: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = paymentReducer(undefined, { type: fetchPayment.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-051: Should handle rejected', () => {
        const state = paymentReducer(undefined, { type: fetchPayment.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
