import mock from '@/data/hostaway-mock.json';
import { attachStatus, getStatusMap } from '@/lib/server/approvals';
import { ApiResponse, HostawayReview, NormalizedReview, PropertyStats } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

// Helper: same as reviews endpoint (consider extracting to a shared module)
function calculateAverageRating(categories: { category: string; rating: number }[] = []): number {
  if (!categories?.length) return 0;
  const sum = categories.reduce(
    (acc, cat) => acc + (Number.isFinite(cat.rating) ? cat.rating : 0),
    0,
  );
  return Math.round(sum / Math.max(1, categories.length) / 2);
}
function normalizeHostawayReviews(reviews: HostawayReview[]): Omit<NormalizedReview, 'status'>[] {
  return reviews.map((review) => ({
    id: String(review.id),
    propertyName: review.listingName,
    guestName: review.guestName,
    rating: Number.isFinite(review.rating)
      ? (review.rating as number)
      : calculateAverageRating(review.reviewCategory),
    comment: review.publicReview,
    date: new Date(review.submittedAt),
    channel: 'hostaway',
    categories: {},
  }));
}

// Make a simple slug from name; replace with listingId if available in your data
function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PropertyStats[]>>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    // 1) normalize & attach status
    let reviews = normalizeHostawayReviews(mock as HostawayReview[]) as NormalizedReview[];
    const statusMap = await getStatusMap(reviews.map((r) => r.id));
    reviews = attachStatus(reviews, statusMap);

    // 2) group by propertyName
    const byProperty = new Map<string, NormalizedReview[]>();
    for (const r of reviews) {
      if (!byProperty.has(r.propertyName)) byProperty.set(r.propertyName, []);
      byProperty.get(r.propertyName)!.push(r);
    }

    // 3) compute stats
    const data: PropertyStats[] = Array.from(byProperty.entries()).map(([propertyName, list]) => {
      const totalReviews = list.length;
      const approved = list.filter((r) => r.status === 'approved');
      const approvedReviews = approved.length;
      const avg = approvedReviews
        ? approved.reduce((sum, r) => sum + (Number.isFinite(r.rating) ? Number(r.rating) : 0), 0) /
          approvedReviews
        : 0;

      // Calculate recentTrend: compare average rating of last 3 approved reviews vs previous 3
      let recentTrend: 'up' | 'down' | 'stable' = 'stable';
      if (approved.length >= 6) {
        // Sort approved reviews by date descending
        const sorted = [...approved].sort((a, b) => b.date.getTime() - a.date.getTime());
        const last3 = sorted.slice(0, 3);
        const prev3 = sorted.slice(3, 6);
        const avgLast3 =
          last3.reduce((sum, r) => sum + (Number.isFinite(r.rating) ? Number(r.rating) : 0), 0) / 3;
        const avgPrev3 =
          prev3.reduce((sum, r) => sum + (Number.isFinite(r.rating) ? Number(r.rating) : 0), 0) / 3;
        if (avgLast3 > avgPrev3 + 0.05) recentTrend = 'up';
        else if (avgLast3 < avgPrev3 - 0.05) recentTrend = 'down';
      }

      return {
        id: slugify(propertyName),
        name: propertyName,
        totalReviews,
        approvedReviews,
        averageRating: avg,
        recentTrend,
      };
    });

    return res.status(200).json({ status: 'success', data, total: data.length });
  } catch (e) {
    console.error('GET /properties error:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to compute property stats' });
  }
}
