import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

describe('UI Table Component', () => {
    it('UI-TC-001: [SUCCESS] Should render table structure correctly', () => {
        render(
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableCell isHeader>Name</TableCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>John Doe</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        );
        expect(screen.getByText(/Name/i)).toBeInTheDocument();
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        
        // Kiểm tra xem isHeader có gen ra thẻ th không
        const thElement = screen.getByText(/Name/i);
        expect(thElement.tagName).toBe('TH');
        
        const tdElement = screen.getByText(/John Doe/i);
        expect(tdElement.tagName).toBe('TD');
    });

    it('UI-TC-002: [EMPTY] Should handle empty table components', () => {
        const { container } = render(
            <Table>
                <TableBody>{null}</TableBody>
            </Table>
        );
        expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('UI-TC-003: [ERROR] Should handle missing children gracefully', () => {
        // @ts-ignore: Intentionally testing missing children behavior
        const { container } = render(<Table />);
        // Kiểm tra component không crash
        expect(container.querySelector('table')).toBeInTheDocument();
    });
});
