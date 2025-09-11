import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import FilterBar from '@/components/dashboard/FilterBar';
import PropertyOverview from '@/components/dashboard/PropertyOverview';
import ReviewCard from '@/components/dashboard/ReviewCard';
import Layout from '@/components/ui/Layout';
import GoToTopButton from '@/components/ui/GoToTopButton';
import { Filters, NormalizedReview, PropertyStats } from '@/lib/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CategoryStats from '@/components/dashboard/CategoryStats';

export default function Dashboard() {
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [properties, setProperties] = useState<PropertyStats[]>([]);
  const [filters, setFilters] = useState<Filters>({
    property: '',
    channel: '',
    rating: '',
    startDate: '',
    endDate: '',
    status: 'all',
  });
  const [error, setError] = useState<string | null>(null);
  const reviewsAbortRef = useRef<AbortController | null>(null);

  const buildQuery = (f: Filters) => {
    const params = new URLSearchParams();
    if (f.property) params.set('property', f.property);
    if (f.channel) params.set('channel', f.channel);
    if (f.rating) params.set('rating', String(f.rating));
    if (f.startDate) params.set('startDate', f.startDate);
    if (f.endDate) params.set('endDate', f.endDate);
    if (f.status && f.status !== 'all') params.set('status', f.status);
    if (f.category) params.set('category', f.category);
    if (f.minCategory) params.set('minCategory', f.minCategory);
    params.set('sort', f.sort ?? 'date_desc');
    return params.toString();
  };

  const fetchReviews = useCallback(
    async (signal?: AbortSignal) => {
      setError(null);
      const qs = buildQuery(filters);
      const res = await fetch(`/api/reviews/hostaway?${qs}`, { signal });
      if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);
      const data = await res.json();
      if (data.status === 'success') setReviews(data.data || []);
      else throw new Error(data.message || 'Unknown error');
    },
    [filters],
  );

  const fetchPropertyStats = useCallback(async () => {
    const res = await fetch('/api/properties');
    if (!res.ok) throw new Error(`Failed to fetch properties: ${res.status}`);
    const data = await res.json();
    if (data.status === 'success') setProperties(data.data || []);
    else throw new Error(data.message || 'Unknown error');
  }, []);

  useEffect(() => {
    // cancel any in-flight reviews request before starting a new one
    reviewsAbortRef.current?.abort();
    const controller = new AbortController();
    reviewsAbortRef.current = controller;

    Promise.all([fetchReviews(controller.signal), fetchPropertyStats()]).catch((e) => {
      if (e.name !== 'AbortError') {
        console.error(e);
        setError('Something went wrong while loading data.');
      }
    });

    return () => controller.abort();
  }, [fetchReviews, fetchPropertyStats]);

  // Publish review
  const handleApprove = async (reviewId: string) => {
    const res = await fetch('/api/reviews/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId }),
    });
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: 'approved' } : r)));
    }
  };

  // Reset to pending
  const handleReset = async (reviewId: string) => {
    const res = await fetch('/api/reviews/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId }),
    });
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, status: 'pending' } : r)));
    }
  };

  const stats = useMemo(() => {
    const approved = reviews.filter((r) => r.status === 'approved');
    const avg = approved.length
      ? approved.reduce((s, r) => s + (Number.isFinite(r.rating) ? Number(r.rating) : 0), 0) /
      approved.length
      : 0;

    return {
      totalReviews: reviews.length,
      pendingReviews: reviews.filter((r) => r.status === 'pending').length,
      approvedReviews: approved.length,
      averageRating: avg,
    };
  }, [reviews]);

  return (
    <Layout title="Reviews Dashboard - Flex Living">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Reviews Dashboard</h1>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.totalReviews}</div>
              <div className="text-sm text-gray-900">Total Reviews</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</div>
              <div className="text-sm text-gray-900">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.approvedReviews}</div>
              <div className="text-sm text-gray-900">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-900">Avg Rating</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <FilterBar filters={filters} onFiltersChange={setFilters} />
            <div className="space-y-4">
              {error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-900">No reviews found</div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onApprove={() => handleApprove(review.id)}
                    onReset={() => handleReset(review.id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <PropertyOverview properties={properties} />
            <CategoryStats reviews={reviews} />
            <AnalyticsChart reviews={reviews} granularity="day" onlyApproved={false} />
          </div>
        </div>
      </div>
      <GoToTopButton />
    </Layout>
  );
}
