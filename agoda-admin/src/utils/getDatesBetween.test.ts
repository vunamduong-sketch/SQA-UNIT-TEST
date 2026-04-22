import { describe, it, expect } from 'vitest';
import { getDatesBetween, formatDuration } from '@/utils/getDatesBetween';

/**
 * Combined Tests for Date & Duration Utility Logic
 */
describe('Date & Duration Utility Logic (Combined)', () => {

    describe('getDatesBetween() - Logic', () => {
        // DAT-TC-001: Lấy danh sách ngày trong khoảng 1 tuần (Equivalence Class)
        it('UTL-TC-012: Should return correct 7 days in YYYY-MM-DD format', () => {
            const start = '2024-05-01';
            const end = '2024-05-07';
            const result = getDatesBetween(start, end);
            
            expect(result).toHaveLength(7);
            expect(result[0]).toBe('2024-05-01');
            expect(result[6]).toBe('2024-05-07');
        });

        // DAT-TC-002: Ngày bắt đầu trùng ngày kết thúc (Boundary Value)
        it('UTL-TC-013: Should return 1 day if start and end are the same', () => {
            const date = '2024-05-01';
            const result = getDatesBetween(date, date);
            expect(result).toEqual(['2024-05-01']);
        });

        // DAT-TC-003: Ngày kết thúc trước ngày bắt đầu (Error Case)
        it('UTL-TC-014: [ERROR] Should return empty array if end is before start', () => {
            const start = '2024-05-10';
            const end = '2024-05-01';
            const result = getDatesBetween(start, end);
            expect(result).toEqual([]);
        });
    });

    describe('formatDuration() - Logic', () => {
        // DUR-TC-001: Định dạng thời gian từ phút sang Giờ-Phút (Equivalence Class)
        it('UTL-TC-015: Should format 150 minutes to 2h 30m', () => {
            expect(formatDuration(150)).toBe('2h 30m');
        });

        // DUR-TC-002: Định dạng thời gian nhỏ hơn 60 phút (Boundary Value)
        it('UTL-TC-016: Should format 45 minutes to 0h 45m', () => {
            expect(formatDuration(45)).toBe('0h 45m');
        });
    });
});
