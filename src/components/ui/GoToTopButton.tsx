import { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

type GoToTopButtonProps = {
  threshold?: number; // px scrolled before showing
  right?: number; // px from right
  bottom?: number; // px from bottom
};

export default function GoToTopButton({ threshold = 300, right = 24, bottom = 24 }: GoToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  // Scroll handler with requestAnimationFrame for performance
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > threshold);
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initialize on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  // Scroll to top with reduced motion support
  const scrollToTop = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Go to top"
      onClick={scrollToTop}
      style={{ right, bottom }}
      className="cursor-pointer fixed z-50 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
