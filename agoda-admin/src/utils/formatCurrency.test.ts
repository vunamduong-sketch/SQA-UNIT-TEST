import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/utils/formatCurrency';

describe('formatCurrency - Logic Accuracy Test', () => {

    it('UTL-TC-007: Should handle very large numbers (Billionaires case)', () => {
        const result = formatCurrency(1000000000);
        expect(result).toContain('1.000.000.000');
    });

    it('UTL-TC-008: Should handle decimal numbers accurately', () => {
        const result = formatCurrency(1234567.89);
        // Ứng dụng đang giữ nguyên phần thập phân theo định dạng VN
        expect(result).toContain('1.234.567,89'); 
    });

    it('UTL-TC-009: Should return "0" for null/undefined to prevent UI crash', () => {
        expect(formatCurrency(null as any)).toBe('0');
        expect(formatCurrency(undefined as any)).toBe('0');
    });

    it('UTL-TC-010: [BUG HUNTER] Should handle extreme/invalid numeric values', () => {
        // Test số âm (thường tiền tệ không nên âm trong hiển thị này)
        expect(formatCurrency(-1000)).toContain('-1.000');
        
        // Test NaN (Not a Number) - Thường do lỗi tính toán lây lan
        expect(formatCurrency(NaN)).toBe('0'); // Mong muốn: Không hiển thị "NaN" ra UI
        
        // Test Infinity
        expect(formatCurrency(Infinity)).toBe('0');
    });

    it('UTL-TC-011: [BUG HUNTER] Should handle non-numeric input gracefully', () => {
        // Nếu truyền vào một chuỗi thay vì số
        expect(formatCurrency("1000000" as any)).toBe('1.000.000');
        expect(formatCurrency("abc" as any)).toBe('0');
    });
});
