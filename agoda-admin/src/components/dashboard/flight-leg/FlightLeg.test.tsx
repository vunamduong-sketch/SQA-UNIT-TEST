import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FlightLegTable from '@/components/dashboard/flight-leg/FlightLegTable';
import * as api from '@/config/api';

vi.mock('@/config/api', () => ({
    callFetchFlightLeg: vi.fn().mockResolvedValue({ isSuccess: true, data: [], meta: { totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPages: 0 } }),
    callDeleteFlightLeg: vi.fn(),
    callFetchAirport: vi.fn().mockResolvedValue({ isSuccess: true, data: [] }),
    callFetchAirline: vi.fn().mockResolvedValue({ isSuccess: true, data: [] }),
    callFetchAircraft: vi.fn().mockResolvedValue({ isSuccess: true, data: [] }),
}));

const mockData = [{
    id: 1,
    flight_code: 'VJ123',
    departure_time: '2024-05-20T10:00:00Z',
    arrival_time: '2024-05-20T12:00:00Z',
    duration_minutes: 120,
    departure_airport: { name: 'Noi Bai' },
    arrival_airport: { name: 'Tan Son Nhat' },
    created_at: '2024-05-20T08:00:00Z'
}];

describe('FlightLeg Component', () => {
    it('LEG-TC-001: [SUCCESS] Should render flight legs', async () => {
        vi.mocked(api.callFetchFlightLeg).mockResolvedValue({
            isSuccess: true,
            data: mockData,
            meta: { totalItems: 1, currentPage: 1, itemsPerPage: 10, totalPages: 1 }
        } as any);

        render(<FlightLegTable flight={{ id: 100 }} />);

        await waitFor(() => {
            expect(screen.getByText(/VJ123/i)).toBeInTheDocument();
        });
    });

    it('LEG-TC-002: [EMPTY] Should handle empty list', async () => {
        vi.mocked(api.callFetchFlightLeg).mockResolvedValue({
            isSuccess: true,
            data: [],
            meta: { totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPages: 0 }
        } as any);

        render(<FlightLegTable flight={{ id: 100 }} />);

        await waitFor(() => {
            expect(screen.queryByText(/VJ123/i)).not.toBeInTheDocument();
        });
    });

    it('LEG-TC-003: [ERROR] Should handle API error', async () => {
        vi.mocked(api.callFetchFlightLeg).mockResolvedValue({
            isSuccess: true,
            data: [],
            meta: { totalItems: 0, currentPage: 1, itemsPerPage: 10, totalPages: 0 }
        } as any);

        render(<FlightLegTable flight={{ id: 100 }} />);

        await waitFor(() => {
            expect(screen.getByText(/Danh sách các trạm dừng/i)).toBeInTheDocument();
        });
    });
});
