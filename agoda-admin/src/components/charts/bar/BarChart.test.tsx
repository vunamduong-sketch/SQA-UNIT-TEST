import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BarChartOne from '@/components/charts/bar/BarChartOne';

// Mock apexcharts to prevent "Getting bbox of element" error in jsdom
vi.mock('react-apexcharts', () => ({
    default: vi.fn(() => <div data-testid="mock-apex-chart" />),
}));

describe('BarChart Component - Data Visualization Logic', () => {

    it('CHT-TC-001: [SUCCESS] Should render chart when data is provided', () => {
        const { container } = render(<BarChartOne />);
        // Verify the chart wrapper renders
        expect(container.firstChild).toBeInTheDocument();
    });

    it('CHT-TC-002: [EMPTY] Should render the chart component without crashing', () => {
        render(<BarChartOne />);
        // Kiểm tra mock chart được render thay vì cố tìm canvas/svg thật
        expect(screen.getByTestId('mock-apex-chart')).toBeInTheDocument();
    });
});

