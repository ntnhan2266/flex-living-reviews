import { Filter, X } from 'lucide-react';
import { Filters } from '@/lib/types';

const CATEGORY_OPTIONS: Array<{ label: string; value: NonNullable<Filters['category']> }> = [
  { label: 'Cleanliness', value: 'cleanliness' },
  { label: 'Communication', value: 'communication' },
  { label: 'Location', value: 'location' },
  { label: 'Accuracy', value: 'accuracy' },
  { label: 'Check-in', value: 'checkin' },
  { label: 'Value', value: 'value' },
];

export default function FilterBar({
  filters,
  onFiltersChange,
}: {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
}) {
  const clearFilters = () =>
    onFiltersChange({
      property: '',
      channel: '',
      rating: '',
      startDate: '',
      endDate: '',
      status: 'all',
      category: '',
      minCategory: '',
      sort: 'date_desc',
    });

  const hasActive = Object.entries(filters).some(
    ([k, v]) =>
      // treat defaults as inactive
      (v && v !== 'all') &&
      !(
        (k === 'sort' && v === 'date_desc') ||
        (k === 'category' && v === '') ||
        (k === 'minCategory' && v === '')
      )
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-900" aria-hidden />
          <span className="text-sm font-medium text-gray-900">Filters</span>
        </div>

        {/* Channel */}
        <label className="sr-only" htmlFor="channel">Channel</label>
        <select
          id="channel"
          value={filters.channel}
          onChange={(e) => onFiltersChange({ ...filters, channel: e.target.value as Filters['channel'] })}
          className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All channels</option>
          <option value="hostaway">Hostaway</option>
          <option value="airbnb">Airbnb</option>
          <option value="booking">Booking.com</option>
          <option value="google">Google</option>
        </select>

        {/* Min overall rating */}
        <label className="sr-only" htmlFor="rating">Min rating</label>
        <select
          id="rating"
          value={filters.rating}
          onChange={(e) => onFiltersChange({ ...filters, rating: e.target.value as Filters['rating'] })}
          className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>

        {/* Status */}
        <label className="sr-only" htmlFor="status">Status</label>
        <select
          id="status"
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as Filters['status'] })}
          className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* NEW: Category */}
        <label className="sr-only" htmlFor="category">Category</label>
        <select
          id="category"
          value={filters.category ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as NonNullable<Filters['category']> })}
          className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* NEW: Min sub-score for that category */}
        <label className="sr-only" htmlFor="minCategory">Min sub-score</label>
        <select
          id="minCategory"
          value={filters.minCategory ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, minCategory: e.target.value as NonNullable<Filters['minCategory']> })}
          className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!filters.category}
          title={filters.category ? 'Minimum sub-score for selected category' : 'Select a category first'}
        >
          <option value="">Any</option>
          <option value="5">5</option>
          <option value="4">4+</option>
          <option value="3">3+</option>
          <option value="2">2+</option>
          <option value="1">1+</option>
        </select>

        {/* NEW: Sort */}
        <label className="sr-only" htmlFor="sort">Sort</label>
        <select
          id="sort"
          value={filters.sort ?? 'date_desc'}
          onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value as NonNullable<Filters['sort']> })}
          className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date_desc">Newest</option>
          <option value="date_asc">Oldest</option>
          <option value="rating_desc">Rating: High → Low</option>
          <option value="rating_asc">Rating: Low → High</option>
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="startDate">Start date</label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
            className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">to</span>
          <label className="sr-only" htmlFor="endDate">End date</label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
            className="border border-gray-300 text-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={clearFilters}
          disabled={!hasActive}
          className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
        >
          <X className="w-4 h-4" aria-hidden />
          Clear
        </button>
      </div>
    </div>
  );
}
