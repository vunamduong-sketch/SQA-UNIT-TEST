import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useGoBack from '@/hooks/useGoBack';
import { useNavigate } from 'react-router';

vi.mock('react-router', () => ({ useNavigate: vi.fn() }));

describe('useGoBack Hook', () => {

    it('NAV-TC-001: Should navigate(-1) if history state exists', () => {
        const mockNavigate = vi.fn();
        (useNavigate as any).mockReturnValue(mockNavigate);
        Object.defineProperty(window, 'history', { value: { state: { idx: 1 } }, writable: true });
        const { result } = renderHook(() => useGoBack());
        result.current();
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('NAV-TC-002: Should navigate("/") if no history exists', () => {
        const mockNavigate = vi.fn();
        (useNavigate as any).mockReturnValue(mockNavigate);
        Object.defineProperty(window, 'history', { value: { state: null }, writable: true });
        const { result } = renderHook(() => useGoBack());
        result.current();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('NAV-TC-03: Should handle edge case with missing state object', () => {
        const mockNavigate = vi.fn();
        (useNavigate as any).mockReturnValue(mockNavigate);
        Object.defineProperty(window, 'history', { value: {}, writable: true });
        const { result } = renderHook(() => useGoBack());
        result.current();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
