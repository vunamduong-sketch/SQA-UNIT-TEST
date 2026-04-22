import { describe, it, expect, vi } from 'vitest';
import { emitEvent, onEvent } from '@/utils/eventEmitter';

describe('eventEmitter Utility', () => {

    it('UTL-TC-004: Should emit and listen to custom events', () => {
        const spy = vi.fn();
        onEvent('test-event', spy);
        emitEvent('test-event', { data: 123 });
        expect(spy).toHaveBeenCalledWith({ data: 123 });
    });

    it('UTL-TC-005: Should unsubscribe correctly', () => {
        const spy = vi.fn();
        const unsub = onEvent('unsub-event', spy);
        unsub();
        emitEvent('unsub-event', {});
        expect(spy).not.toHaveBeenCalled();
    });

    it('UTL-TC-006: Should support multiple listeners for same event', () => {
        const spy1 = vi.fn();
        const spy2 = vi.fn();
        onEvent('multi-event', spy1);
        onEvent('multi-event', spy2);
        emitEvent('multi-event', 'hello');
        expect(spy1).toHaveBeenCalledWith('hello');
        expect(spy2).toHaveBeenCalledWith('hello');
    });
});
