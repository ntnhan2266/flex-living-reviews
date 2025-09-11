import React from 'react';
import { render, screen } from '@testing-library/react';
import { StarRating } from '@/components/ui/StarRating';

describe('<StarRating />', () => {
  it('renders the correct number of stars by default (max=5)', () => {
    render(<StarRating rating={3} />);
    // container has 5 star wrappers
    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(1);
  });

  it('fills stars according to integer rating', () => {
    render(<StarRating rating={3} />);
    const stars = screen.getAllByRole('img', { hidden: true });
    // first 3 should be filled (yellow)
    expect(stars[0].className).toMatch(/flex items-center gap-1/);
  });

  it('renders a half star when rating has fractional >= .5', () => {
    const { container } = render(<StarRating rating={3.5} />);
    // half star overlay should exist in DOM
    const overlays = container.querySelectorAll('.absolute.inset-0');
    expect(overlays.length).toBe(1);
  });

  it('does not render half star for < .5 fraction', () => {
    const { container } = render(<StarRating rating={3.2} />);
    expect(container.querySelectorAll('.absolute.inset-0')).toHaveLength(0);
  });

  it('renders the value text when showValue is true', () => {
    render(<StarRating rating={4.2} showValue />);
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('clamps rating below 0 to 0', () => {
    render(<StarRating rating={-3} showValue />);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('clamps rating above max to max', () => {
    render(<StarRating rating={10} max={5} showValue />);
    expect(screen.getByText('5.0')).toBeInTheDocument();
  });

  it('handles NaN rating as 0', () => {
    render(<StarRating rating={NaN} showValue />);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('respects custom max value', () => {
    render(<StarRating rating={7} max={10} />);
    expect(screen.getAllByRole('img', { hidden: true })).toHaveLength(1);
  });

  it('sets correct aria-label by default', () => {
    render(<StarRating rating={3.7} />);
    expect(screen.getByRole('img', { name: /Rating:/i })).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/3.7/)
    );
  });

  it('overrides aria-label when ariaLabel prop is provided', () => {
    render(<StarRating rating={4} ariaLabel="Custom label" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Custom label');
  });
});
