import mock from '@/data/hostaway-mock.json';
import { attachStatus, getStatusMap } from '@/lib/server/approvals';
import { ApiResponse, HostawayReview, NormalizedReview, ReviewStatus } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

function toInt(v: string | undefined, fallback: number): number {
  const n = Number.parseInt(v ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
}
function toDateOrNull(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

// Convert 10-pt category ratings to 5-pt average
function calculateAverageRating(categories: { category: string; rating: number }[] = []): number {
  if (!categories?.length) return 0;
  const sum = categories.reduce(
    (acc, cat) => acc + (Number.isFinite(cat.rating) ? cat.rating : 0),
    0,
  );
  return Math.round(sum / Math.max(1, categories.length) / 2);
}

// Normalize Hostaway -> our shape (without status; we attach it from DB)
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
    categories: {
      cleanliness: review.reviewCategory.find((c) => c.category === 'cleanliness')?.rating
        ? Math.round(review.reviewCategory.find((c) => c.category === 'cleanliness')!.rating / 2)
        : undefined,
      communication: review.reviewCategory.find((c) => c.category === 'communication')?.rating
        ? Math.round(review.reviewCategory.find((c) => c.category === 'communication')!.rating / 2)
        : undefined,
      location: review.reviewCategory.find((c) => c.category === 'location')?.rating
        ? Math.round(review.reviewCategory.find((c) => c.category === 'location')!.rating / 2)
        : undefined,
      accuracy: review.reviewCategory.find((c) => c.category === 'accuracy')?.rating
        ? Math.round(review.reviewCategory.find((c) => c.category === 'accuracy')!.rating / 2)
        : undefined,
      checkin: review.reviewCategory.find((c) => c.category === 'checkin')?.rating
        ? Math.round(review.reviewCategory.find((c) => c.category === 'checkin')!.rating / 2)
        : undefined,
      value: review.reviewCategory.find((c) => c.category === 'value')?.rating
        ? Math.round(review.reviewCategory.find((c) => c.category === 'value')!.rating / 2)
        : undefined,
    },
  }));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<NormalizedReview[]>>,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const {
      property,
      channel,
      rating,
      startDate,
      endDate,
      status,
      limit = '50',
      offset = '0',
      category,
      minCategory,
      sort = 'date_desc',
    } = req.query as Record<string, string | undefined>;

    // 1) Normalize from mock
    let reviews = normalizeHostawayReviews(mock as HostawayReview[]) as NormalizedReview[];

    // 2) Attach DB status (default pending)
    const statusMap = await getStatusMap(reviews.map((r) => r.id));
    reviews = attachStatus(reviews, statusMap);

    // 3) Filters
    if (property) {
      const needle = property.toLowerCase();
      reviews = reviews.filter((r) => r.propertyName.toLowerCase().includes(needle));
    }
    if (channel) {
      const ch = channel.toLowerCase();
      reviews = reviews.filter((r) => r.channel.toLowerCase() === ch);
    }
    if (rating) {
      const min = toInt(rating, 0);
      reviews = reviews.filter((r) => (r.rating ?? 0) >= min);
    }
    const start = toDateOrNull(startDate);
    const end = toDateOrNull(endDate);
    if (start) reviews = reviews.filter((r) => r.date >= start);
    if (end) reviews = reviews.filter((r) => r.date <= end);

    if (status && status !== 'all') {
      const s = status as ReviewStatus;
      reviews = reviews.filter((r) => r.status === s);
    }

    if (category) {
      const min = Number.isFinite(Number(minCategory)) ? Number(minCategory) : 1;
      reviews = reviews.filter((r) => {
        const sub = r.categories?.[category as keyof typeof r.categories];
        return typeof sub === 'number' ? sub >= min : false;
      });
    }

    // 4) Sort + paginate
    switch (sort) {
      case 'date_asc':
        reviews.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case 'rating_desc':
        reviews.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'rating_asc':
        reviews.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
        break;
      case 'date_desc':
      default:
        reviews.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
    }

    const limitNum = clamp(toInt(limit, 50), 1, 200);
    const offsetNum = Math.max(toInt(offset, 0), 0);
    const total = reviews.length;
    const data = reviews.slice(offsetNum, offsetNum + limitNum);

    // Optional: small caching to reduce CPU on repeated loads of mock data
    res.setHeader('Cache-Control', 'max-age=30, s-maxage=60');

    return res.status(200).json({ status: 'success', data, total });
  } catch (e) {
    console.error('GET /reviews/hostaway error:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch reviews' });
  }
}
