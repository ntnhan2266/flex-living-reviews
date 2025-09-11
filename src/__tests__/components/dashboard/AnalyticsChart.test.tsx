import { render, screen } from '@testing-library/react';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { NormalizedReview } from '@/lib/types';

const base: NormalizedReview = {
  id: '1',
  propertyName: 'Flat A',
  guestName: 'Jane Doe',
  rating: 4,
  comment: 'Great stay',
  date: new Date('2025-01-08'),
  channel: 'hostaway',
  categories: {},
  status: 'approved',
};

describe('<AnalyticsChart />', () => {
  it('renders empty state when no reviews', () => {
    render(<AnalyticsChart reviews={[]} />);
    expect(screen.getByText(/No analytics data available/i)).toBeInTheDocument();
  });

  it('renders chart title when reviews are provided', () => {
    render(<AnalyticsChart reviews={[base]} />);
    expect(screen.getByText(/Review Analytics/i)).toBeInTheDocument();
  });

  it('shows granularity options', () => {
    render(<AnalyticsChart reviews={[base]} />);
    expect(screen.getByText(/DAY/i)).toBeInTheDocument();
  });

  it('matches snapshot with reviews', () => {
    const { asFragment } = render(<AnalyticsChart reviews={[base]} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('matches snapshot without reviews', () => {
    const { asFragment } = render(<AnalyticsChart reviews={[]} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
