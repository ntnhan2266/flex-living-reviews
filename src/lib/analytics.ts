// src/lib/analytics.ts
import { NormalizedReview, ReviewStatus } from '@/lib/types';

export type Granularity = 'day' | 'week' | 'month';

export type TimeseriesDatum = {
  date: string; // "YYYY-MM-DD" for day/week start/month start
  count: number; // number of reviews in bucket
  avgRating: number; // 0..5 average in bucket (0 when no ratings)
};

/**
 * Buckets a JS Date into an ISO key by granularity:
 * - day  -> YYYY-MM-DD
 * - week -> YYYY-MM-DD of the week's Monday
 * - month-> YYYY-MM-01
 */
export function bucketKey(d: Date, granularity: Granularity): string {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);

  if (granularity === 'week') {
    // Monday as week start
    const day = dt.getDay() || 7; // 1..7 (Mon..Sun)
    if (day !== 1) dt.setDate(dt.getDate() - (day - 1));
  } else if (granularity === 'month') {
    dt.setDate(1);
  }

  // fastest way to get YYYY-MM-DD without deps
  return dt.toISOString().slice(0, 10);
}

/**
 * Build a timeseries for reviews.
 * @param reviews - list of reviews
 * @param options.statuses - optional statuses to include (e.g. ['approved'])
 * @param options.granularity - day|week|month (default 'day')
 */
export function getReviewTimeseries(
  reviews: NormalizedReview[],
  options?: { statuses?: ReviewStatus[]; granularity?: Granularity },
): TimeseriesDatum[] {
  const allowed = new Set(options?.statuses ?? []);
  const gran = options?.granularity ?? 'day';

  const grouped: Record<string, { count: number; sum: number; withRating: number }> = {};

  for (const r of reviews) {
    if (allowed.size && !allowed.has(r.status)) continue;

    // normalize date (handle string | Date)
    const d = r.date instanceof Date ? r.date : new Date(r.date);
    const key = bucketKey(d, gran);
    if (!grouped[key]) grouped[key] = { count: 0, sum: 0, withRating: 0 };

    grouped[key].count += 1;

    const val = Number(r.rating);
    if (Number.isFinite(val)) {
      grouped[key].sum += val;
      grouped[key].withRating += 1;
    }
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, { count, sum, withRating }]) => ({
      date,
      count,
      avgRating: withRating ? Number((sum / withRating).toFixed(2)) : 0,
    }));
}
