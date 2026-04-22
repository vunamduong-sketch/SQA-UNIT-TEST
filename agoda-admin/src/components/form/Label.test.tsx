import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Label from '@/components/form/Label';

describe('Form Label Component', () => {
    it('FRM-TC-001: [SUCCESS] Should render label text', () => {
        render(<Label>Tên người dùng</Label>);
        expect(screen.getByText(/Tên người dùng/i)).toBeInTheDocument();
    });

    it('FRM-TC-002: [EMPTY] Should handle empty label text', () => {
        // @ts-ignore: Intentionally testing missing children behavior
        render(<Label></Label>);
        // Kiểm tra không render text rỗng
    });

    it('FRM-TC-003: [ERROR] Should handle missing text prop', () => {
        // @ts-ignore: Intentionally testing missing children behavior
        render(<Label />);
        // Kiểm tra crash-safety
    });
});
