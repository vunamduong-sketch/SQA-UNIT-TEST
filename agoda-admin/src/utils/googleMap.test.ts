import { describe, it, expect } from 'vitest';
import { toRad, haversine } from '@/utils/googleMap';

/**
 * FNC: Google Map Haversine Logic (Distance Calculation)
 */
describe('googleMap Utility', () => {

    // MAP-TC-001: Chuyển đổi độ sang Radian (Equivalence Class)
    it('UTL-TC-017: Should convert 180 degrees to PI', () => {
        expect(toRad(180)).toBeCloseTo(Math.PI);
    });

    // MAP-TC-002: Khoảng cách giữa 2 điểm (Equivalence Class)
    it('UTL-TC-018: Should calculate distance between Hanoi and HCM correctly', () => {
        // Hanoi: 21.0285, 105.8542
        // HCM: 10.8231, 106.6297
        const distance = haversine(21.0285, 105.8542, 10.8231, 106.6297);
        // Khoảng cách chim bay thực tế ~1130km
        expect(distance).toBeGreaterThan(1100);
        expect(distance).toBeLessThan(1200);
    });

    // MAP-TC-003: Khoảng cách giữa 2 điểm trùng nhau (Boundary Value)
    it('UTL-TC-019: Should return 0 if points are identical', () => {
        expect(haversine(21, 105, 21, 105)).toBe(0);
    });

    // BUG-MAP-001: Tọa độ ngoài dải cho phép (Negative Testing)
    it('UTL-TC-020: [BUG HUNTER] Should handle invalid coordinates gracefully', () => {
        // Vĩ độ > 90 hoặc < -90 là không hợp lệ
        const distance = haversine(100, 200, 10, 10);
        // Mong muốn: Trả về 0 hoặc NaN thay vì tính toán sai lệch khủng khiếp
        expect([0, NaN]).toContain(distance);
    });

    // BUG-MAP-002: Tọa độ bằng null/undefined
    it('UTL-TC-021: [BUG HUNTER] Should not crash with null inputs', () => {
        const distance = haversine(null as any, undefined as any, 10, 10);
        expect(distance).toBeDefined(); // Đảm bảo không văng lỗi hệ thống
    });
});
