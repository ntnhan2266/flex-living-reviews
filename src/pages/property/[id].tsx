import Layout from '@/components/ui/Layout';
import PropertyGallery from '@/components/property/PropertyGallery';
import PropertyHeader from '@/components/property/PropertyHeader';
import ReviewDisplay from '@/components/property/ReviewDisplay';
import { NormalizedReview } from '@/lib/types';
import { useEffect, useState } from 'react';

type Property = {
  id: string;
  name: string;
  description?: string;
  images: { src: string; alt?: string }[];
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  amenities?: string[];
};

export default function PropertyPage() {
  const [property, setProperty] = useState<Property | null>(null);
  const [reviews, setReviews] = useState<NormalizedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Replace these with your real APIs
    const fetchProperty = async (): Promise<Property> => {
      return {
        id: 'slug-or-id',
        name: 'Spacious 2 Bed Balcony Flat in Wandsworth',
        description: 'Comfortable apartment perfect for business travelers and couples.',
        images: [
          { src: '/images/sample/1.jpeg', alt: 'Living room' },
          { src: '/images/sample/2.jpeg', alt: 'Bedroom' },
          { src: '/images/sample/3.jpeg', alt: 'Bedroom 2' },
          { src: '/images/sample/4.jpeg', alt: 'Bathroom' },
          { src: '/images/sample/5.jpeg', alt: 'Bathroom 2' },
          { src: '/images/sample/6.jpeg', alt: 'Kitchen' },
          { src: '/images/sample/7.jpeg', alt: 'Building exterior' },
          { src: '/images/sample/8.jpeg', alt: 'Living room 2' },
          { src: '/images/sample/9.jpeg', alt: 'Living room 3' },
          { src: '/images/sample/10.jpeg', alt: 'Living room 4' },
        ],
        guests: 5,
        bedrooms: 2,
        bathrooms: 2,
        area: '65 m²',
        amenities: [
          'Kitchen',
          'Free WiFi',
          'Washing machine',
          'Air conditioning',
          'Smoke detector',
          'Hair dryer',
        ],
      };
    };

    const fetchReviews = async (): Promise<NormalizedReview[]> => {
      const res = await fetch(`/api/reviews/hostaway?status=approved`);
      if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`);
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Unknown error');
      return json.data as NormalizedReview[];
    };

    Promise.all([fetchProperty(), fetchReviews()])
      .then(([p, r]) => {
        setProperty(p);
        setReviews(r);
      })
      .catch((e) => {
        console.error(e);
        setError('Failed to load property or reviews.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Property">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-24 rounded-xl bg-white shadow animate-pulse" />
          <div className="h-40 rounded-xl bg-white shadow animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout title="Property">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl bg-red-50 text-red-700 p-4">
            {error ?? 'Property not found.'}
          </div>
        </div>
      </Layout>
    );
  }

  const facts = [
    { label: 'Guests', value: `${property.guests ?? '-'}` },
    { label: 'Bedrooms', value: `${property.bedrooms ?? '-'}` },
    { label: 'Bathrooms', value: `${property.bathrooms ?? '-'}` },
    { label: 'Area', value: property.area ?? '-' },
  ];

  const ratingValues = reviews
    .filter((r) => Number.isFinite(r.rating))
    .map((r) => Number(r.rating));
  const avg = ratingValues.length
    ? ratingValues.reduce((s, x) => s + x, 0) / ratingValues.length
    : null;

  return (
    <Layout title={property.name}>
      <div className="mx-auto max-w-6xl space-y-8">
        <PropertyGallery images={property.images} />
        <PropertyHeader
          title={property.name}
          subtitle={property.description}
          rating={avg}
          reviewsCount={ratingValues.length}
          facts={facts}
          amenities={property.amenities}
        />

        <hr className="my-6 border-gray-200" />

        <ReviewDisplay loading={false} reviews={reviews} />
      </div>
    </Layout>
  );
}
