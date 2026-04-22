import { describe, it, expect, vi } from 'vitest';
import { getUserAvatar, getImage } from '@/utils/imageUrl';

/**
 * FNC: Image URL Resolution
 */
describe('imageUrl Utility', () => {

    // IMG-TC-001: Trả về URL đầy đủ khi có tên ảnh (Equivalence Class)
    it('UTL-TC-022: Should append BE_URL to image name', () => {
        vi.stubEnv('VITE_BE_URL', 'http://localhost:8000');
        const result = getUserAvatar('/uploads/user.png');
        expect(result).toBe('http://localhost:8000/uploads/user.png');
    });

    // IMG-TC-002: Trả về ảnh mặc định khi không có tên (Boundary Value)
    it('UTL-TC-023: Should return default avatar if name is undefined', () => {
        const result = getUserAvatar(undefined);
        expect(result).toContain('default-avatar.png');
    });

    // IMG-TC-003: Xử lý file ảnh thông thường (getImage)
    it('UTL-TC-024: Should return not-found image if name is missing', () => {
        const result = getImage(undefined);
        expect(result).toContain('not-found.jpg');
    });
});
