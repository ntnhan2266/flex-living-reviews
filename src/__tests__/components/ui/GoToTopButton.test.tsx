
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoToTopButton from '@/components/ui/GoToTopButton';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true });
}

describe('<GoToTopButton />', () => {
  let originalRAF: typeof window.requestAnimationFrame;
  let originalScrollTo: typeof window.scrollTo;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalRAF = window.requestAnimationFrame;
    originalScrollTo = window.scrollTo;
    originalMatchMedia = window.matchMedia;

    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 1 as unknown as number;
    };
    setScrollY(0);
    window.scrollTo = jest.fn();
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRAF;
    window.scrollTo = originalScrollTo;
    window.matchMedia = originalMatchMedia;
    jest.clearAllMocks();
  });

  it('should not render when scrollY is below threshold', () => {
    render(<GoToTopButton threshold={200} />);
    act(() => {
      setScrollY(100);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.queryByRole('button', { name: /go to top/i })).toBeNull();
  });

  it('should render when scrollY is above threshold', () => {
    render(<GoToTopButton threshold={100} />);
    act(() => {
      setScrollY(150);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByRole('button', { name: /go to top/i })).toBeInTheDocument();
  });

  it('should scroll to top smoothly by default', async () => {
    render(<GoToTopButton threshold={0} />);
    act(() => {
      setScrollY(300);
      window.dispatchEvent(new Event('scroll'));
    });
    const btn = screen.getByRole('button', { name: /go to top/i });
    await userEvent.click(btn);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should scroll to top with auto if prefers-reduced-motion', async () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    render(<GoToTopButton threshold={0} />);
    act(() => {
      setScrollY(300);
      window.dispatchEvent(new Event('scroll'));
    });
    const btn = screen.getByRole('button', { name: /go to top/i });
    await userEvent.click(btn);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('should respect custom right and bottom props', () => {
    render(<GoToTopButton threshold={0} right={99} bottom={77} />);
    act(() => {
      setScrollY(300);
      window.dispatchEvent(new Event('scroll'));
    });
    const btn = screen.getByRole('button', { name: /go to top/i });
    expect(btn).toHaveStyle({ right: '99px', bottom: '77px' });
  });

  it('should add and remove scroll event listeners', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<GoToTopButton />);
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
