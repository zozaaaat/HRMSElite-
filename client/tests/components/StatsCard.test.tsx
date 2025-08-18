import {render, screen} from '@testing-library/react';
import {StatsCard} from '@/components/stats-card';

describe('StatsCard', () => {
  it('renders provided title and value', () => {
    render(<StatsCard title="Employees" value={42} />);
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
