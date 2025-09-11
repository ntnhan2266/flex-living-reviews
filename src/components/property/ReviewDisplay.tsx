import { NormalizedReview } from '@/lib/types';
import { Star } from 'lucide-react';

interface ReviewDisplayProps {
  reviews: NormalizedReview[];
  loading: boolean;
}

const StarRating = ({ rating }: { rating: number }) => {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${n <= rounded ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

export default function ReviewDisplay({ reviews, loading }: ReviewDisplayProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 p-6 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reviews?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-900 mb-2">No reviews available yet</div>
        <div className="text-sm text-gray-400">Be the first to leave a review!</div>
      </div>
    );
  }

  const safe = reviews.filter((r) => Number.isFinite(r.rating));
  const averageRating = safe.length
    ? safe.reduce((sum, r) => sum + Number(r.rating), 0) / safe.length
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Guest Reviews</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <StarRating rating={averageRating} />
            <span className="font-semibold text-lg text-gray-700">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-900">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map((review) => (
          <article key={review.id} className="bg-gray-50 rounded-lg p-6">
            <header className="flex items-center justify-between mb-4">
              <div>
                <div className="font-bold text-gray-900">{review.guestName}</div>
                <time
                  className="text-sm font-light text-gray-500"
                  dateTime={new Date(review.date).toISOString()}
                >
                  {new Date(review.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <StarRating rating={review.rating} />
            </header>

            <p className="text-gray-700 mb-4">{review.comment}</p>

            {review.categories && Object.values(review.categories).some(Boolean) && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(review.categories).map(([category, rating]) =>
                    rating ? (
                      <div key={category} className="flex justify-between">
                        <span className="capitalize text-gray-700">
                          {category.replace(/_/g, ' ')}:
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-gray-700">{rating}</span>
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
