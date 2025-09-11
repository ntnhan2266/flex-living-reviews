import { NormalizedReview } from '@/lib/types';
import { CheckCircle, Clock, Star } from 'lucide-react';
import { useState } from 'react';

type ReviewCardProps = {
  review: NormalizedReview;
  onApprove: () => void;
  onReset: () => void;
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-4 h-4 ${n <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ))}
    <span className="text-sm text-gray-600 ml-1">
      {Number.isFinite(rating) ? rating.toFixed(1) : '-'}
    </span>
  </div>
);

export default function ReviewCard({ review, onApprove, onReset }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getChannelColor = (channel: string) => {
    const colors = {
      hostaway: 'bg-blue-100 text-blue-800',
      airbnb: 'bg-red-100 text-red-800',
      booking: 'bg-purple-100 text-purple-800',
      google: 'bg-green-100 text-green-800',
    } as const;
    return (colors as Record<string, string>)[channel] ?? 'bg-gray-100 text-gray-800';
  };

  const dateStr = new Date(review.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{review.propertyName}</h4>
          <p className="text-sm text-gray-600">by {review.guestName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`capitalize px-2 py-1 text-xs rounded-full font-medium ${getChannelColor(review.channel)}`}
          >
            {review.channel}
          </span>
          <span className="text-sm text-gray-900">{dateStr}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={review.rating} />
      </div>

      {/* Comment */}
      {review.comment && (
        <>
          <p className={`text-gray-700 mb-2 ${expanded ? '' : 'line-clamp-3'}`}>{review.comment}</p>
          {review.comment.length > 160 && (
            <button
              onClick={() => setExpanded((s) => !s)}
              className="text-sm text-blue-600 hover:underline"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </>
      )}

      {/* Category Ratings */}
      {review.categories && Object.values(review.categories).some(Boolean) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
          {Object.entries(review.categories).map(([category, rating]) =>
            rating ? (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-900 capitalize">{category.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium text-gray-700">{rating}</span>
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}

      {/* Status and Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {review.status === 'approved' && (
            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Approved
            </span>
          )}
          {review.status === 'pending' && (
            <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Pending
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {review.status === 'pending' ? (
            <>
              <button
                onClick={onApprove}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
            </>
          ) : (
            <button
              onClick={onReset}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
            >
              Revoke
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
