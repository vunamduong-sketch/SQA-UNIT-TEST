import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Alert from '@/components/ui/alert/Alert';

describe('UI Alert Component', () => {
    it('ALT-TC-001: [SUCCESS] Should render alert title and message', () => {
        render(<Alert variant="success" title="Success!" message="Operation completed." />);
        expect(screen.getByText(/Success!/i)).toBeInTheDocument();
        expect(screen.getByText(/Operation completed./i)).toBeInTheDocument();
    });

    it('ALT-TC-002: [EMPTY] Should still render even with empty strings', () => {
        const { container } = render(<Alert variant="info" title="" message="" />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it('ALT-TC-003: [ERROR] Should apply correct Tailwind classes for error type', () => {
        const { container } = render(<Alert variant="error" title="Error" message="Failed" />);
        expect(container.firstChild).toHaveClass('border-error-500'); 
    });
});
