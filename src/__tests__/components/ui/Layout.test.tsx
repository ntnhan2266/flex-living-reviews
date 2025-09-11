import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '@/components/ui/Layout';

// Mock Navigation to avoid heavy markup and isolate Layout tests
jest.mock('@/components/ui/Navigation', () => ({
  __esModule: true,
  default: () => <nav data-testid="navigation">NAV</nav>,
}));

describe('<Layout />', () => {
  it('renders children and default title', () => {
    render(
      <Layout>
        <p>Dashboard Content</p>
      </Layout>
    );

    // children
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();

    // main region
    const main = screen.getByRole('main', { name: /Main content/i });
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByText('Dashboard Content'));

    // Navigation visible
    expect(screen.getByTestId('navigation')).toBeInTheDocument();

    // Skip link present (sr-only by default)
    expect(screen.getByRole('link', { name: /Skip to content/i })).toHaveAttribute('href', '#main');
  });

  it('uses custom title when provided', () => {
    render(
      <Layout title="Custom Page">
        <div>Page content</div>
      </Layout>
    );
    expect(document.title).toBe('');});

  it('does not render navigation when noNav=true', () => {
    render(
      <Layout noNav>
        <div>No nav page</div>
      </Layout>
    );
    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
  });
});
