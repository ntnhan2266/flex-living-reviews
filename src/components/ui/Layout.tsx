import { ReactNode } from 'react';
import Head from 'next/head';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  noNav?: boolean;
}

export default function Layout({
  children,
  title = 'Flex Living Reviews',
  noNav = false,
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Flex Living Reviews Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <div className="min-h-screen bg-gray-50">
        {!noNav && <Navigation />}
        <main
          id="main"
          role="main"
          aria-label="Main content"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8"
        >
          {children}
        </main>
      </div>
    </>
  );
}
