import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from '@/hooks/useModal';

/**
 * FNC: Modal State Management Hook
 */
describe('useModal Hook', () => {

    // MOD-TC-001: Trạng thái mặc định (Initial State)
    it('HKS-TC-004: Should initialize with default value', () => {
        const { result } = renderHook(() => useModal(true));
        expect(result.current.isOpen).toBe(true);
    });

    // MOD-TC-002: Logic đóng/mở (State Transition)
    it('HKS-TC-005: Should open and close modal correctly', () => {
        const { result } = renderHook(() => useModal(false));

        act(() => {
            result.current.openModal();
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.closeModal();
        });
        expect(result.current.isOpen).toBe(false);
    });

    // MOD-TC-003: Logic Toggle (Branch Coverage)
    it('HKS-TC-006: Should toggle the state', () => {
        const { result } = renderHook(() => useModal(false));
        act(() => {
            result.current.toggleModal();
        });
        expect(result.current.isOpen).toBe(true);
    });
});
