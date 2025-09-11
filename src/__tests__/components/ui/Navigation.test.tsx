import React from 'react';
import { render, screen } from '@testing-library/react';
import Navigation from '@/components/ui/Navigation';

// Mock next/router to control router.asPath
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next/image to render a simple img for testing
// eslint-disable-next-line react/display-name
jest.mock('next/image', () => (props: Record<string, unknown>) => {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt as string} />;
});

const { useRouter } = jest.requireMock('next/router') as { useRouter: jest.Mock };

describe('<Navigation />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo with link to /dashboard', () => {
    useRouter.mockReturnValue({ asPath: '/dashboard' });
    render(<Navigation />);

    const logoLink = screen.getByRole('link', { name: /flex living reviews, home/i });
    expect(logoLink).toHaveAttribute('href', '/dashboard');

    const logoImg = screen.getByAltText(/Flex Living Reviews/i);
    expect(logoImg).toBeInTheDocument();
  });

  it('renders Dashboard and Property links', () => {
    useRouter.mockReturnValue({ asPath: '/' });
    render(<Navigation />);

    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Property View/i })).toBeInTheDocument();
  });

  it('marks Dashboard link as active when on /dashboard', () => {
    useRouter.mockReturnValue({ asPath: '/dashboard' });
    render(<Navigation />);

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
  expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  expect(dashboardLink).toHaveClass('bg-blue-100');

    const propertyLink = screen.getByRole('link', { name: /Property View/i });
    expect(propertyLink).not.toHaveAttribute('aria-current');
  });

  it('marks Property View link as active when on /property/1', () => {
    useRouter.mockReturnValue({ asPath: '/property/1' });
    render(<Navigation />);

    const propertyLink = screen.getByRole('link', { name: /Property View/i });
  expect(propertyLink).toHaveAttribute('aria-current', 'page');
  expect(propertyLink).toHaveClass('bg-blue-100');

    const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
    expect(dashboardLink).not.toHaveAttribute('aria-current');
  });
});
