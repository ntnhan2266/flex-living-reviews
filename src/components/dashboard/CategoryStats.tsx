// src/components/dashboard/CategoryStats.tsx
import { NormalizedReview } from '@/lib/types';

const CATEGORIES: Array<keyof NormalizedReview['categories']> = [
  'cleanliness',
  'communication',
  'location',
  'accuracy',
  'checkin',
  'value',
];

export default function CategoryStats({ reviews }: { reviews: NormalizedReview[] }) {
  if (!reviews.length) return null;

  const avg = (key: keyof NormalizedReview['categories']) => {
    const vals = reviews
      .map((r) => r.categories?.[key])
      .filter((n): n is number => typeof n === 'number');
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
      {CATEGORIES.map((cat) => (
        <div key={cat} className="bg-white p-3 rounded-lg shadow-sm text-center">
          <div className="text-sm text-gray-500 capitalize">{cat}</div>
          <div className="text-lg font-semibold text-gray-900">
            {avg(cat) ?? '-'}
          </div>
        </div>
      ))}
    </div>
  );
}
