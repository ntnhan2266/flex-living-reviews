import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PropertyGallery from '@/components/property/PropertyGallery';

// Mock next/image to a regular img so JSDOM can render it
jest.mock('next/image', () => {
  return function MockNextImage(props: { src: string; alt?: string } & { [key: string]: unknown }) {
    const { src, alt = '', ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === 'string' ? src : ''} alt={alt} {...rest} />;
  };
});

// Mock the Lightbox component so we can assert it is shown and receives props
type LightboxProps = {
  images: { src: string; alt?: string }[];
  startIndex: number;
  onClose: () => void;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LightboxMock = jest.fn((_props: LightboxProps) => <div data-testid="lightbox">LIGHTBOX</div>);
jest.mock('@/components/ui/Lightbox', () => ({
  __esModule: true,
  default: (props: LightboxProps) => LightboxMock(props),
}));

const makeImages = (n: number): { src: string; alt: string }[] =>
  Array.from({ length: n }).map((_, i) => ({
    src: `/img/${i + 1}.jpg`,
    alt: `Photo ${i + 1}`,
  }));

describe('<PropertyGallery />', () => {
  beforeEach(() => {
    LightboxMock.mockClear();
  });

  it('renders empty state when images array is empty', () => {
    render(<PropertyGallery images={[]} />);
    expect(screen.getByText(/No images available/i)).toBeInTheDocument();
  });

  it('renders hero image and up to 4 side images (max 5 thumbnails total)', () => {
    const images = makeImages(10);
    render(<PropertyGallery images={images} />);

    // Hero button has aria-label "Open photo 1"
    expect(screen.getByRole('button', { name: /Open photo 1/i })).toBeInTheDocument();

    // Four side-image buttons with aria-labels "Open photo 2..5"
    for (let i = 2; i <= 5; i++) {
      expect(screen.getByRole('button', { name: new RegExp(`Open photo ${i}`, 'i') })).toBeInTheDocument();
    }

    // There should NOT be a button for photo 6 in the grid
    expect(screen.queryByRole('button', { name: /Open photo 6/i })).not.toBeInTheDocument();
  });

  it('shows "View all photos" overlay when images.length > 5', () => {
    render(<PropertyGallery images={makeImages(6)} />);
    expect(screen.getByRole('button', { name: /View all photos/i })).toBeInTheDocument();
  });

  it('does not show "View all photos" when images.length <= 5', () => {
    render(<PropertyGallery images={makeImages(5)} />);
    expect(screen.queryByRole('button', { name: /View all photos/i })).not.toBeInTheDocument();
  });

  it('opens Lightbox at index 0 when clicking hero image; calls onOpenAll', async () => {
    const user = userEvent.setup();
    const images = makeImages(6);
    const onOpenAll = jest.fn();

    render(<PropertyGallery images={images} onOpenAll={onOpenAll} />);

    await user.click(screen.getByRole('button', { name: /Open photo 1/i }));

    // Lightbox should render
    expect(await screen.findByTestId('lightbox')).toBeInTheDocument();

    // Assert Lightbox props (from our mock)
    expect(LightboxMock).toHaveBeenCalledTimes(1);
    const call = LightboxMock.mock.calls[0][0] as LightboxProps;
    expect(call.images).toHaveLength(6);
    expect(call.startIndex).toBe(0);
    expect(typeof call.onClose).toBe('function');

    // onOpenAll should be called
    expect(onOpenAll).toHaveBeenCalledTimes(1);
  });

  it('opens Lightbox at correct index for side image click', async () => {
    const user = userEvent.setup();
    const images = makeImages(6);
    render(<PropertyGallery images={images} />);

    // Click the third button (which corresponds to "Open photo 3")
    await user.click(screen.getByRole('button', { name: /Open photo 3/i }));

    expect(await screen.findByTestId('lightbox')).toBeInTheDocument();
    const call = LightboxMock.mock.calls[0][0] as LightboxProps;
    expect(call.startIndex).toBe(2); // zero-based index for photo 3
  });

  it('opens Lightbox via "View all photos" overlay button', async () => {
    const user = userEvent.setup();
    render(<PropertyGallery images={makeImages(8)} />);

    await user.click(screen.getByRole('button', { name: /View all photos/i }));

    expect(await screen.findByTestId('lightbox')).toBeInTheDocument();
    const call = LightboxMock.mock.calls[0][0] as LightboxProps;
    expect(call.startIndex).toBe(0);
  });
});
