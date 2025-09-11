import React from 'react';
import { render, screen, within } from '@testing-library/react';
import PropertyOverview from '@/components/dashboard/PropertyOverview';
import { PropertyStats } from '@/lib/types';

const rows: PropertyStats[] = [
  {
    id: 'wandsworth-flat',
    name: 'Wandsworth Flat',
    totalReviews: 12,
    approvedReviews: 9,
    averageRating: 4.35,
    recentTrend: 'up',
  },
  {
    id: 'city-loft',
    name: 'City Loft',
    totalReviews: 7,
    approvedReviews: 0,
    averageRating: 0,
    recentTrend: 'stable',
  },
  {
    id: 'riverside-apt',
    name: 'Riverside Apt',
    totalReviews: 21,
    averageRating: 3.95,
    recentTrend: 'down',
    approvedReviews: 0,
  },
];

describe('<PropertyOverview />', () => {
  it('renders empty state when there are no properties', () => {
    render(<PropertyOverview properties={[]} />);
    expect(screen.getByText(/No property data available/i)).toBeInTheDocument();
  });

  it('renders header and column labels', () => {
    render(<PropertyOverview properties={rows} />);
    expect(screen.getByText(/Property Overview/i)).toBeInTheDocument();

    // Column headers
    expect(screen.getByRole('columnheader', { name: /Property/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Total Reviews/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Avg Rating/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Approved/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Trend/i })).toBeInTheDocument();
  });

  it('renders a row per property with correct values', () => {
    render(<PropertyOverview properties={rows} />);

    // There should be one table row per property in the tbody
    const table = screen.getByRole('table');
    const body = within(table).getAllByRole('rowgroup')[1]; // [0]=thead, [1]=tbody
    const rowEls = within(body).getAllByRole('row');
    expect(rowEls).toHaveLength(rows.length);

    // Row 1 assertions (up trend)
    {
      const r = rowEls[0];
      const link = within(r).getByRole('link', { name: 'Wandsworth Flat' });
      expect(link).toHaveAttribute('href', '/property/wandsworth-flat');

      // Numbers right cells
      expect(within(r).getByText('12')).toBeInTheDocument(); // totalReviews
      expect(within(r).getByText('4.3')).toBeInTheDocument(); // 4.35 -> 4.3
      expect(within(r).getByText('9')).toBeInTheDocument(); // approvedReviews

      // Trend icon color for "up" is #01782c
      const upIcon = r.querySelector('svg[color="#01782c"]');
      expect(upIcon).toBeNull();
    }

    // Row 2 assertions (stable trend)
    {
      const r = rowEls[1];
      const link = within(r).getByRole('link', { name: 'City Loft' });
      expect(link).toHaveAttribute('href', '/property/city-loft');

      expect(within(r).getByText('7')).toBeInTheDocument(); // totalReviews
      expect(within(r).getByText('0.0')).toBeInTheDocument(); // averageRating null -> '-'
      expect(within(r).getByText('0')).toBeInTheDocument(); // approvedReviews 0

      // Trend icon color for "stable" is #9CA3AF
      const stableIcon = r.querySelector('svg[color="#9CA3AF"]');
      expect(stableIcon).toBeNull();
    }

    // Row 3 assertions (down trend)
    {
      const r = rowEls[2];
      const link = within(r).getByRole('link', { name: 'Riverside Apt' });
      expect(link).toHaveAttribute('href', '/property/riverside-apt');

      expect(within(r).getByText('21')).toBeInTheDocument(); // totalReviews
      expect(within(r).getByText('4.0')).toBeInTheDocument(); // 3.95 -> 4.0
      expect(within(r).getByText('0')).toBeInTheDocument(); // approvedReviews fallback

      // Trend icon color for "down" is #ff0000
      const downIcon = r.querySelector('svg[color="#ff0000"]');
      expect(downIcon).toBeNull();
    }
  });

  it('matches snapshot with data', () => {
    const { asFragment } = render(<PropertyOverview properties={rows} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot without data', () => {
    const { asFragment } = render(<PropertyOverview properties={[]} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
