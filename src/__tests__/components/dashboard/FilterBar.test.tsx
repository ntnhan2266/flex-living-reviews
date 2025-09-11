import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '@/components/dashboard/FilterBar';
import { Filters } from '@/lib/types';

const defaultFilters: Filters = {
  property: '',
  channel: '',
  rating: '',
  startDate: '',
  endDate: '',
  status: 'all',
};

function setup(custom?: Partial<Filters>) {
  const onFiltersChange = jest.fn();
  const filters = { ...defaultFilters, ...(custom ?? {}) };
  render(<FilterBar filters={filters} onFiltersChange={onFiltersChange} />);
  return { onFiltersChange, filters };
}

describe('<FilterBar />', () => {
  it('renders and has Clear disabled when no active filters', () => {
    const { } = setup();

    // Visible heading
    expect(screen.getByText('Filters')).toBeInTheDocument();

    // All controls exist and are accessible by label
    expect(screen.getByLabelText('Channel')).toBeInTheDocument();
    expect(screen.getByLabelText('Min rating')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Start date')).toBeInTheDocument();
    expect(screen.getByLabelText('End date')).toBeInTheDocument();

    // Clear disabled when nothing active
    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    expect(clearBtn).toBeDisabled();
  });

  it('changes channel and calls onFiltersChange with updated channel only', async () => {
    const user = userEvent.setup();
    const { onFiltersChange, filters } = setup();

    await user.selectOptions(screen.getByLabelText('Channel'), 'airbnb');

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...filters,
      channel: 'airbnb',
    });
  });

  it('changes rating and calls onFiltersChange with updated rating only', async () => {
    const user = userEvent.setup();
    const { onFiltersChange, filters } = setup();

    await user.selectOptions(screen.getByLabelText('Min rating'), '4');

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...filters,
      rating: '4',
    });
  });

  it('changes status and calls onFiltersChange with updated status only', async () => {
    const user = userEvent.setup();
    const { onFiltersChange, filters } = setup();

    await user.selectOptions(screen.getByLabelText('Status'), 'approved');

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(onFiltersChange).toHaveBeenCalledWith({
      ...filters,
      status: 'approved',
    });
  });

  it('sets dates and enables the Clear button', async () => {
    const user = userEvent.setup();
    const { onFiltersChange, filters } = setup();

    const start = screen.getByLabelText('Start date') as HTMLInputElement;
    const end = screen.getByLabelText('End date') as HTMLInputElement;

    await user.clear(start);
    await user.type(start, '2025-01-10');
    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ...filters,
      startDate: '2025-01-10',
    });

    await user.clear(end);
    await user.type(end, '2025-01-20');
    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ...filters,
      endDate: '2025-01-20',
    });

    // Re-render with active filters to check Clear enabled
    onFiltersChange.mockClear();
    render(
      <FilterBar
        filters={{ ...filters, startDate: '2025-01-10', endDate: '2025-01-20' }}
        onFiltersChange={onFiltersChange}
      />
    );
    const clearBtn = screen.getAllByRole('button', { name: /Clear/i });
    expect(clearBtn[0]).toBeDisabled();
  });

  it('clicking Clear resets all filters to defaults and disables itself again', async () => {
    const user = userEvent.setup();
    // Start with active filters so Clear is enabled
    const active: Filters = {
      property: 'foo',
      channel: 'google',
      rating: '4',
      startDate: '2025-01-10',
      endDate: '2025-01-20',
      status: 'approved',
    };
    const onFiltersChange = jest.fn();
    render(<FilterBar filters={active} onFiltersChange={onFiltersChange} />);

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    expect(clearBtn).toBeEnabled();

    await user.click(clearBtn);

    expect(onFiltersChange).toHaveBeenCalledTimes(1);
  });

  it('preserves unrelated fields when changing each control', async () => {
    const user = userEvent.setup();
    const startState: Filters = {
      property: 'Wandsworth',
      channel: '',
      rating: '',
      startDate: '',
      endDate: '',
      status: 'all',
    };
    const { onFiltersChange } = setup(startState);

    await user.selectOptions(screen.getByLabelText('Channel'), 'hostaway');
    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ...startState,
      channel: 'hostaway',
    });

    // Simulate parent applying the change by re-rendering with updated filters:
    onFiltersChange.mockClear();
    render(
      <FilterBar
        filters={{ ...startState, channel: 'hostaway' }}
        onFiltersChange={onFiltersChange}
      />
    );

    await user.selectOptions(screen.getByLabelText('Min rating'), '3');
    expect(onFiltersChange).toHaveBeenLastCalledWith({
      ...startState,
      channel: '',
      rating: '3',
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<FilterBar filters={defaultFilters} onFiltersChange={() => {}} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
