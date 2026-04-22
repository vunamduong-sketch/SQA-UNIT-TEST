import { describe, it, expect } from 'vitest';
import conversationReducer, { fetchConversation } from '@/redux/slice/conversationSlide';

describe('conversationSlide Redux Slice', () => {
    it('SLI-TC-031: Should handle pending', () => {
        const state = conversationReducer(undefined, { type: fetchConversation.pending.type });
        expect(state.isFetching).toBe(true);
    });

    it('SLI-TC-032: Should handle fulfilled', () => {
        const payload = { isSuccess: true, data: [{ id: 1 }], meta: {} };
        const state = conversationReducer(undefined, { type: fetchConversation.fulfilled.type, payload });
        expect(state.data).toHaveLength(1);
    });

    it('SLI-TC-033: Should handle rejected', () => {
        const state = conversationReducer(undefined, { type: fetchConversation.rejected.type });
        expect(state.isFetching).toBe(false);
    });
});
