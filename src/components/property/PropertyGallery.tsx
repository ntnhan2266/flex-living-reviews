import { useState, useMemo } from 'react';
import Image from 'next/image';
import Lightbox from '@/components/ui/Lightbox';

type Props = {
  images: { src: string; alt?: string }[];
  onOpenAll?: () => void;
};

export default function PropertyGallery({ images = [], onOpenAll }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const grid = useMemo(() => images.slice(0, 5), [images]);

  if (!images.length) {
    return (
      <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 grid place-items-center text-gray-500">
        No images available
      </div>
    );
  }

  const openAt = (i: number) => {
    setStartIndex(i);
    setLightboxOpen(true);
    onOpenAll?.();
  };

  return (
    <>
      <div className="relative grid grid-cols-4 grid-rows-2 gap-3">
        {/* Hero */}
        <button
          type="button"
          className="cursor-pointer relative col-span-2 row-span-2 overflow-hidden rounded-xl aspect-[4/3] bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => openAt(0)}
          aria-label="Open photo 1"
        >
          <Image
            src={images[0].src}
            alt={images[0].alt ?? 'Property'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ borderRadius: 'inherit' }}
            priority
          />
        </button>

        {/* Four side images */}
        {grid.slice(1).map((img, idx) => (
          <button
            key={img.src + idx}
            type="button"
            className="cursor-pointer relative overflow-hidden rounded-xl aspect-[4/3] bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => openAt(idx + 1)}
            aria-label={`Open photo ${idx + 2}`}
          >
            <Image
              src={img.src}
              alt={img.alt ?? 'Property'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 25vw"
              style={{ borderRadius: 'inherit' }}
              loading="lazy"
            />
          </button>
        ))}

        {/* View all overlay */}
        {images.length > 5 && (
          <button
            type="button"
            onClick={() => openAt(0)}
            className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-gray-900 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View all photos
          </button>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox images={images} startIndex={startIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
