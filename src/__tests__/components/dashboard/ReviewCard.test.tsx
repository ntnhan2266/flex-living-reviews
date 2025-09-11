import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewCard from '@/components/dashboard/ReviewCard';
import { NormalizedReview } from '@/lib/types';

function makeReview(overrides: Partial<NormalizedReview> = {}): NormalizedReview {
  return {
    id: 'r1',
    propertyName: 'Spacious 2 Bed',
    guestName: 'Jane Doe',
    rating: 4.2,
    comment: 'Lovely stay, clean and convenient.',
    date: new Date('2025-01-08T10:00:00Z'),
    channel: 'hostaway',
    categories: { cleanliness: 5, communication: 4, location: undefined },
    status: 'pending',
    ...overrides,
  };
}

describe('<ReviewCard />', () => {
  it('renders key information', () => {
    const review = makeReview();
    render(<ReviewCard review={review} onApprove={jest.fn()} onReset={jest.fn()} />);

    // Title, guest, channel badge, date
    expect(screen.getByText('Spacious 2 Bed')).toBeInTheDocument();
    expect(screen.getByText(/by Jane Doe/i)).toBeInTheDocument();
    expect(screen.getByText('hostaway')).toBeInTheDocument();

    // Rating number shown to 1 decimal
    expect(screen.getByText('4.2')).toBeInTheDocument();

    // Pending badge
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    // Approve button visible for pending
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
  });

  it('calls onApprove when Approve is clicked (pending status)', async () => {
    const user = userEvent.setup();
    const review = makeReview({ status: 'pending' });
    const onApprove = jest.fn();
    render(<ReviewCard review={review} onApprove={onApprove} onReset={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /Approve/i }));
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('shows Revoke when approved and calls onReset on click', async () => {
    const user = userEvent.setup();
    const review = makeReview({ status: 'approved' });
    const onReset = jest.fn();
    render(<ReviewCard review={review} onApprove={jest.fn()} onReset={onReset} />);

    // Approved badge
    expect(screen.getByText(/Approved/i)).toBeInTheDocument();
    // Revoke button visible
    const revoke = screen.getByRole('button', { name: /Revoke/i });
    expect(revoke).toBeInTheDocument();

    await user.click(revoke);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('renders category ratings only for defined entries', () => {
    const review = makeReview({
      categories: { cleanliness: 5, communication: 4, location: undefined, value: 0 },
    });
    render(<ReviewCard review={review} onApprove={jest.fn()} onReset={jest.fn()} />);

    // cleanliness & communication visible
    expect(screen.getByText(/cleanliness/i)).toBeInTheDocument();
    expect(screen.getByText(/communication/i)).toBeInTheDocument();

    // location is undefined -> not rendered
    expect(screen.queryByText(/location/i)).not.toBeInTheDocument();

    // value = 0 is falsy, component filters out -> not rendered
    expect(screen.queryByText(/\bvalue\b/i)).not.toBeInTheDocument();
  });

  it('shows "Show more/Show less" toggle for long comments', async () => {
    const user = userEvent.setup();
    const longComment = 'A'.repeat(200);
    const review = makeReview({ comment: longComment });
    render(<ReviewCard review={review} onApprove={jest.fn()} onReset={jest.fn()} />);

    const toggle = screen.getByRole('button', { name: /Show more/i });
    expect(toggle).toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByRole('button', { name: /Show less/i })).toBeInTheDocument();
  });

  it('renders the correct number of filled stars based on rounded rating', () => {
    // rating 3.6 rounds to 4
    const review = makeReview({ rating: 3.6 });
    render(<ReviewCard review={review} onApprove={jest.fn()} onReset={jest.fn()} />);

    const ratingContainer = screen.getByText('3.6').closest('div')!;
    expect(ratingContainer).toContainElement(ratingContainer.querySelector('svg.text-yellow-400.fill-yellow-400'));
    expect(ratingContainer).toContainElement(ratingContainer.querySelector('svg.text-gray-300'));
  });

  it('shows a hyphen for non-finite rating', () => {
    const review = makeReview({ rating: NaN });
    render(<ReviewCard review={review} onApprove={jest.fn()} onReset={jest.fn()} />);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('applies hostaway channel color classes on the badge', () => {
    const review = makeReview({ channel: 'hostaway' });
    render(<ReviewCard review={review} onApprove={jest.fn()} onReset={jest.fn()} />);

    const badge = screen.getByText('hostaway');
    // The mapping uses: bg-blue-100 text-blue-800 for hostaway
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  it('matches snapshot', () => {
    const review = makeReview();
    const { asFragment } = render(<ReviewCard review={review} onApprove={jest.fn()} onReset={jest.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
