import { describe, it, expect, vi } from 'vitest';
import accountReducer, { 
    fetchAccount, 
    setUserLoginInfo, 
    setLogoutAction, 
    setActiveMenu 
} from '@/redux/slice/accountSlide';

describe('accountSlide Redux Logic (Combined)', () => {
    const initialState = {
        isAuthenticated: false,
        isLoading: true,
        isRefreshToken: false,
        errorRefreshToken: "",
        user: { id: 0, username: "", role: "USER" },
        activeMenu: 'dashboard'
    } as any;

    // --- ASYNC THUNK TESTS (TECHNICAL) ---
    describe('Async Thunk: fetchAccount', () => {
        it('SLI-TC-001: Should set isLoading to true when pending', () => {
            const state = accountReducer(initialState, { type: fetchAccount.pending.type });
            expect(state.isLoading).toBe(true);
        });

        it('SLI-TC-002: Should update user data when fulfilled', () => {
            const payload = { isSuccess: true, data: { id: 1, username: "admin", role: "ADMIN" } };
            const state = accountReducer(initialState, { type: fetchAccount.fulfilled.type, payload });
            expect(state.user.id).toBe(1);
            expect(state.isLoading).toBe(false);
            expect(state.isAuthenticated).toBe(true);
        });

        it('SLI-TC-003: Should set isLoading to false when rejected', () => {
            const state = accountReducer(initialState, { type: fetchAccount.rejected.type });
            expect(state.isLoading).toBe(false);
            expect(state.isAuthenticated).toBe(false);
        });
    });

    // --- SYNC REDUCER TESTS (BUSINESS LOGIC) ---
    describe('Sync Actions: Login/Logout/Menu', () => {
        it('SLI-TC-004: [SUCCESS] Should update state with user info upon login', () => {
            const payload = { id: 1, username: "admin", email: "admin@agoda.com", role: "ADMIN" };
            const nextState = accountReducer(initialState, setUserLoginInfo(payload));
            expect(nextState.isAuthenticated).toBe(true);
            expect(nextState.user.id).toBe(1);
        });

        it('SLI-TC-005: [SUCCESS] Should clear user state and isAuthenticated on logout', () => {
            const loggedInState = { ...initialState, isAuthenticated: true, user: { id: 1, username: "admin" } };
            
            // Mock localStorage
            global.localStorage = { removeItem: vi.fn(), getItem: vi.fn(), setItem: vi.fn() } as any;

            const nextState = accountReducer(loggedInState as any, setLogoutAction({}));
            expect(nextState.isAuthenticated).toBe(false);
            expect(nextState.user.id).toBe(0);
        });

        it('SLI-TC-006: [SUCCESS] Should update activeMenu correctly', () => {
            const nextState = accountReducer(initialState, setActiveMenu("bookings"));
            expect(nextState.activeMenu).toBe("bookings");
        });
    });
});
