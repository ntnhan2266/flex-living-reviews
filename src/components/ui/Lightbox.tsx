import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

type Img = { src: string; alt?: string };
type Props = {
  images: Img[];
  startIndex?: number;
  onClose: () => void;
};

export default function Lightbox({ images, startIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(
    Math.min(Math.max(startIndex, 0), Math.max(0, images.length - 1)),
  );
  const backdropRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const prev = useCallback(() => {
    setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (images.length ? (i + 1) % images.length : 0));
  }, [images.length]);

  // focus management + scroll lock
  useEffect(() => {
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);

    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    // focus the dialog for SR/arrow keys
    backdropRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = originalOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [next, onClose, prev]);

  const clickBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  if (!images || images.length === 0) {
    // Fail-safe
    return null;
  }

  const active = images[index];

  return (
    <div
      ref={backdropRef}
      onClick={clickBackdrop}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm m-0 outline-none"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery (press Escape to close)"
      tabIndex={-1}
    >
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 text-white">
          <div className="text-sm" aria-live="polite">
            {index + 1} / {images.length}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-white/30 px-3 py-1 text-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close gallery"
          >
            Close
          </button>
        </div>

        {/* Main image */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={prev}
            className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Previous image"
          >
            ‹
          </button>

          <div className="absolute inset-0 m-auto flex items-center justify-center">
            <Image
              key={active.src}
              src={active.src}
              alt={active.alt ?? 'Property photo'}
              fill
              className="object-contain"
              sizes="90vw"
              style={{ maxHeight: '80vh' }}
              priority
            />
          </div>

          <button
            type="button"
            onClick={next}
            className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Next image"
          >
            ›
          </button>
        </div>

        {/* Thumbnails */}
        <div className="mx-auto mb-4 flex max-w-5xl gap-2 overflow-x-auto px-4">
          {images.map((img, i) => {
            const activeThumb = i === index;
            return (
              <button
                key={img.src + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={[
                  'relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md border',
                  activeThumb
                    ? 'border-white ring-2 ring-white'
                    : 'border-white/30 hover:border-white/60',
                ].join(' ')}
              >
                <Image
                  src={img.src}
                  alt={img.alt ?? ''}
                  fill
                  className="object-cover"
                  sizes="96px"
                  style={{ borderRadius: 'inherit' }}
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
