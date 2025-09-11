import { StarRating } from '../ui/StarRating';

type Fact = { label: string; value: string };
type Props = {
  title: string;
  subtitle?: string;
  rating?: number | null; // 0..5
  reviewsCount?: number;
  facts?: Fact[];
  amenities?: string[];
  ctaHref?: string;
};

export default function PropertyHeader({
  title,
  subtitle,
  rating,
  reviewsCount,
  facts = [],
  amenities = [],
  ctaHref = '#',
}: Props) {
  const hasRating = typeof rating === 'number' && !Number.isNaN(rating);

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Title & badges */}
      <div className="lg:col-span-3">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-gray-700">{subtitle}</p>}

        {(hasRating || reviewsCount) && (
          <div className="mt-2 text-sm text-gray-800 flex items-center gap-2">
            {hasRating ? <StarRating rating={rating!} /> : null}
            <span className="inline-flex items-baseline gap-1">
              {hasRating && <span>{rating!.toFixed(1)}</span>}
              {reviewsCount != null && <span>({reviewsCount} reviews)</span>}
            </span>
          </div>
        )}

        {/* Fact grid as a description list */}
        {!!facts.length && (
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                <dt className="text-xs text-gray-500">{f.label}</dt>
                <dd className="text-sm font-medium text-gray-900">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Amenities compact list */}
        {!!amenities.length && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-900">Amenities</div>
            <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700 sm:grid-cols-3">
              {amenities.slice(0, 6).map((a) => (
                <li key={a}>✓ {a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Booking CTA (placeholder) */}
      <aside className="lg:col-span-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-gray-900">Book your stay</div>
          <p className="mt-1 text-sm text-gray-600">Select dates to see the total price</p>
          <a
            href={ctaHref}
            aria-label="Check availability"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Check availability
          </a>
        </div>
      </aside>
    </section>
  );
}
