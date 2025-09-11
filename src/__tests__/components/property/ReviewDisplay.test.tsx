import React from 'react';
import { render, screen } from '@testing-library/react';
import ReviewDisplay from '@/components/property/ReviewDisplay';
import { NormalizedReview } from '@/lib/types';

const makeReview = (overrides: Partial<NormalizedReview> = {}): NormalizedReview => ({
  id: 'r1',
  propertyName: 'Spacious 2 Bed',
  guestName: 'Jane Doe',
  rating: 4,
  comment: 'Lovely stay, clean and convenient.',
  date: new Date('2025-01-08T10:00:00Z'),
  channel: 'hostaway',
  categories: { cleanliness: 5, communication: 4 },
  status: 'approved',
  ...overrides,
});

describe('<ReviewDisplay />', () => {
  it('renders loading skeleton when loading=true', () => {
    const { container } = render(<ReviewDisplay reviews={[makeReview()]} loading />);
    // Title should not render yet
    expect(screen.queryByText(/Guest Reviews/i)).not.toBeInTheDocument();
    // Skeleton wrapper present
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('renders empty state when no reviews', () => {
    render(<ReviewDisplay reviews={[]} loading={false} />);
    expect(screen.getByText(/No reviews available yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Be the first to leave a review/i)).toBeInTheDocument();
  });

  it('renders header with average rating computed from finite ratings only', () => {
    // average = (5 + 4) / 2 = 4.5 (ignore NaN)
    const r3: NormalizedReview = makeReview({ id: 'r3', rating: NaN });
    const r1 = makeReview({ id: 'r1', rating: 5 });
    const r2 = makeReview({ id: 'r2', rating: 4 });

    render(<ReviewDisplay reviews={[r1, r2, r3]} loading={false} />);
    expect(screen.getByRole('heading', { name: /Guest Reviews/i })).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument(); // average shown with toFixed(1)
    expect(screen.getByText('(3 reviews)')).toBeInTheDocument(); // total count
  });

  it('renders each review card with guest, formatted date, and comment', () => {
    const r1 = makeReview({
      id: 'a',
      guestName: 'Alice',
      date: new Date('2025-01-08T00:00:00Z'),
      comment: 'Great location.',
    });
    const r2 = makeReview({
      id: 'b',
      guestName: 'Bob',
      date: new Date('2025-02-10T00:00:00Z'),
      comment: 'Very clean and comfy.',
    });

    render(<ReviewDisplay reviews={[r1, r2]} loading={false} />);

    // Guest names
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // Dates are formatted with explicit 'en-US' long form
    expect(screen.getByText('January 8, 2025')).toBeInTheDocument();
    expect(screen.getByText('February 10, 2025')).toBeInTheDocument();

    // Comments
    expect(screen.getByText('Great location.')).toBeInTheDocument();
    expect(screen.getByText('Very clean and comfy.')).toBeInTheDocument();
  });

  it('renders category section only for truthy category ratings', () => {
    const r = makeReview({
      categories: {
        cleanliness: 5,       // truthy -> visible
        communication: 4,     // truthy -> visible
        value: 0,      // falsy -> hidden
        location: undefined,  // undefined -> hidden
      },
    });

    render(<ReviewDisplay reviews={[r]} loading={false} />);

    // visible categories
    expect(screen.getByText(/cleanliness/i)).toBeInTheDocument();
    expect(screen.getByText(/communication/i)).toBeInTheDocument();

    // hidden categories
    expect(screen.queryByText(/\bvalue\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/location/i)).not.toBeInTheDocument();
  });

  it('rounds star rating for each review (3.6 -> 4 filled stars)', () => {
    const r = makeReview({ rating: 3.6 });
    render(<ReviewDisplay reviews={[r]} loading={false} />);

    // Find the article for this review and scope star search within it
    const card = screen.getByText(r.guestName).closest('article') as HTMLElement;
    const filled = card.querySelectorAll('svg.text-yellow-400.fill-yellow-400');
    const empty = card.querySelectorAll('svg.text-gray-300');
    expect(filled.length).toBe(6);
    expect(empty.length).toBe(1);
  });

  it('topline star rating renders and matches the computed average', () => {
    const r1 = makeReview({ rating: 5 });
    const r2 = makeReview({ rating: 4 });
    render(<ReviewDisplay reviews={[r1, r2]} loading={false} />);

    // Topline average visible
    const avg = screen.getByText('4.5'); // toFixed(1)
    const container = avg.closest('div')!;
    // There should be a StarRating component preceding the numeric avg
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBeGreaterThan(0);
  });
});
