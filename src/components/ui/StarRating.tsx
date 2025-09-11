import { Star } from 'lucide-react';

type Props = {
  rating: number; // 0..max
  max?: number; // default 5
  showValue?: boolean;
  ariaLabel?: string; // override the default aria label
};

export function StarRating({ rating, max = 5, showValue = false, ariaLabel }: Props) {
  const safeMax = Math.max(1, max);
  const safeRating = Number.isFinite(rating) ? Math.min(Math.max(rating, 0), safeMax) : 0;
  const full = Math.floor(safeRating);
  const hasHalf = safeRating - full >= 0.5;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={ariaLabel ?? `Rating: ${safeRating.toFixed(1)} out of ${safeMax}`}
    >
      {Array.from({ length: safeMax }).map((_, i) => {
        const filled = i < full;
        const half = !filled && i === full && hasHalf;
        // For half, we can simulate with a gradient mask; kept simple with 50% overlay.
        return (
          <div key={i} className="relative w-4 h-4">
            <Star
              className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
            {half && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
            )}
          </div>
        );
      })}
      {showValue && <span className="text-sm text-gray-700">{safeRating.toFixed(1)}</span>}
    </div>
  );
}
