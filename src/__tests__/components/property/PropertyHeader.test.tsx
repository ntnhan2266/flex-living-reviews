import React from 'react';
import { render, screen, within } from '@testing-library/react';
import PropertyHeader from '@/components/property/PropertyHeader';

// Mock StarRating to avoid rendering SVGs and to assert props
const StarRatingMock = jest.fn(({ rating }: { rating: number }) => (
  <div data-testid="star-rating">STAR {rating}</div>
));
jest.mock('@/components/ui/StarRating', () => ({
  __esModule: true,
  StarRating: (props: { rating: number }) => StarRatingMock(props),
}));

describe('<PropertyHeader />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title only when optional props are absent', () => {
    render(<PropertyHeader title="Spacious 2 Bed Balcony Flat" />);

    expect(
      screen.getByRole('heading', { name: 'Spacious 2 Bed Balcony Flat', level: 1 })
    ).toBeInTheDocument();

    // No subtitle text present
    expect(screen.queryByText(/Amenities/i)).not.toBeInTheDocument();
    // StarRating should not be called when no rating
    expect(StarRatingMock).not.toHaveBeenCalled();
    // No "(n reviews)" without reviewsCount
    expect(screen.queryByText(/\(\d+ reviews\)/i)).not.toBeInTheDocument();
  });

  it('renders rating block with StarRating and reviews count', () => {
    render(
      <PropertyHeader
        title="Spacious 2 Bed Balcony Flat"
        subtitle="Comfortable apartment perfect for business travelers and couples."
        rating={4.26}
        reviewsCount={11}
      />
    );

    // Subtitle present
    expect(
      screen.getByText('Comfortable apartment perfect for business travelers and couples.')
    ).toBeInTheDocument();

    // StarRating called with the numeric rating
    expect(StarRatingMock).toHaveBeenCalledTimes(1);

    // Numeric rating text is shown to 1 decimal via .toFixed(1)
    expect(screen.getByText('4.3')).toBeInTheDocument();

    // Reviews count text
    expect(screen.getByText('(11 reviews)')).toBeInTheDocument();
  });

  it('renders facts as a description list with label/value pairs', () => {
    const facts = [
      { label: 'Guests', value: '5' },
      { label: 'Bedrooms', value: '2' },
      { label: 'Bathrooms', value: '2' },
      { label: 'Area', value: '65 m²' },
    ];
    render(<PropertyHeader title="Flat" facts={facts} />);

    // The facts dl exists; assert a couple of pairs
    for (const f of facts) {
      const card = screen.getByText(f.label).closest('div');
      expect(card).toBeInTheDocument();
      expect(within(card as HTMLElement).getByText(f.value)).toBeInTheDocument();
    }
  });

  it('renders amenities label and caps visible items to 6', () => {
    const amenities = [
      'Kitchen',
      'Free WiFi',
      'Washing machine',
      'Air conditioning',
      'Smoke detector',
      'Hair dryer',
      'Dishwasher',
      'Coffee machine',
    ];
    render(<PropertyHeader title="Flat" amenities={amenities} />);

    // Section label
    expect(screen.getByText('Amenities')).toBeInTheDocument();

    // Only 6 list items are rendered
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(6);

    // First six present, later ones not present
    for (const name of amenities.slice(0, 6)) {
      expect(screen.getByText(new RegExp(name))).toBeInTheDocument();
    }
    for (const name of amenities.slice(6)) {
      expect(screen.queryByText(new RegExp(name))).not.toBeInTheDocument();
    }
  });

  it('renders CTA with correct href and aria-label', () => {
    render(<PropertyHeader title="Flat" ctaHref="/book/123" />);

    const cta = screen.getByRole('link', { name: /Check availability/i });
    expect(cta).toHaveAttribute('href', '/book/123');
  });

  it('does not render rating block if rating is null but reviewsCount exists', () => {
    render(<PropertyHeader title="Flat" rating={null} reviewsCount={3} />);

    // StarRating not rendered
    expect(StarRatingMock).not.toHaveBeenCalled();
    // Reviews count still shows because reviewsCount is provided
    expect(screen.getByText('(3 reviews)')).toBeInTheDocument();
  });

  it('does not render rating block if rating is NaN', () => {
    render(<PropertyHeader title="Flat" rating={NaN} reviewsCount={10} />);
    expect(StarRatingMock).not.toHaveBeenCalled();
    // Still shows "(10 reviews)"
    expect(screen.getByText('(10 reviews)')).toBeInTheDocument();
  });
});
