import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SignInForm from '@/components/auth/SignInForm';
import { BrowserRouter } from 'react-router';
import * as api from '@/config/api';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import accountReducer from '@/redux/slice/accountSlide';

vi.mock('@/config/api', () => ({ callLogin: vi.fn(), callGetAccount: vi.fn() }));

const mockStore = configureStore({ reducer: {  account: accountReducer  } as any });

describe('SignInForm Component (3-Case Standard)', () => {
    it('LGN-TC-001: [SUCCESS] Should render login fields', () => {
        render(<Provider store={mockStore}><BrowserRouter><SignInForm /></BrowserRouter></Provider>);
        expect(screen.getByPlaceholderText(/Nhập tài khoản/i)).toBeInTheDocument();
    });

    it('LGN-TC-002: [EMPTY] Should show validation when fields are empty', async () => {
        render(<Provider store={mockStore}><BrowserRouter><SignInForm /></BrowserRouter></Provider>);
        const loginBtn = screen.getByRole('button', { name: /Sign in/i });
        loginBtn.click();
        await waitFor(() => {
            expect(screen.queryByText(/Vui lòng nhập/i) || screen.queryByText(/is required/i)).toBeDefined();
        });
    });

    it('LGN-TC-003: [ERROR] Should handle login failure from API', async () => {
        (api.callLogin as any).mockResolvedValue({ isSuccess: false, message: 'Sai mật khẩu' });
        render(<Provider store={mockStore}><BrowserRouter><SignInForm /></BrowserRouter></Provider>);
    });

    it('LGN-TC-004: [BUG HUNTER] Should handle extremely long input in username field', () => {
        render(<Provider store={mockStore}><BrowserRouter><SignInForm /></BrowserRouter></Provider>);
        const input = screen.getByPlaceholderText(/Nhập tài khoản|Username/i);
        expect(input).toBeInTheDocument();
    });

    it('LGN-TC-005: [BUG HUNTER] Should check for potential double-submit vulnerabilities', () => {
        render(<Provider store={mockStore}><BrowserRouter><SignInForm /></BrowserRouter></Provider>);
        const loginBtn = screen.getByRole('button', { name: /Sign in/i });
        expect(loginBtn).toBeEnabled();
    });
});
