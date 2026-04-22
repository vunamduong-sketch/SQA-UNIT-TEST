import { describe, it, expect } from 'vitest';
import { getOtherUser } from '@/utils/conversation';

describe('conversation Utility', () => {

    it('UTL-TC-001: Should return user2 if currentUser is user1', () => {
        const conversation = { user1: { id: 1 }, user2: { id: 2 } };
        expect(getOtherUser(conversation, { id: 1 }).id).toBe(2);
    });

    it('UTL-TC-002: Should return user1 if currentUser is user2', () => {
        const conversation = { user1: { id: 1 }, user2: { id: 2 } };
        expect(getOtherUser(conversation, { id: 2 }).id).toBe(1);
    });

    it('UTL-TC-003: Should handle edge case where conversation is missing users', () => {
        const conversation = { user1: { id: 1 } };
        // Giả sử logic trả về undefined hoặc user1 nếu thiếu
        const result = getOtherUser(conversation, { id: 5 });
        expect(result.id).toBe(1);
    });
});
