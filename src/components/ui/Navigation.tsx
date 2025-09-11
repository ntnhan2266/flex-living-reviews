import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  const isActive = (path: string) => router.asPath === path || router.asPath.startsWith(path + '/');

  const linkClass = (active: boolean) =>
    `px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      active ? 'bg-blue-100 text-blue-700' : 'text-gray-900 hover:text-gray-700'
    }`;

  return (
    <nav
      className="bg-white shadow-sm border-b border-gray-200"
      role="navigation"
      aria-label="Primary"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/dashboard"
            aria-label="Flex Living Reviews, home"
            className="inline-flex items-center"
          >
            <Image
              src="/images/logo.png"
              alt="Flex Living Reviews"
              width={100}
              height={25}
              priority
            />
          </Link>

          <div className="flex space-x-2">
            <Link
              href="/dashboard"
              className={linkClass(isActive('/dashboard'))}
              aria-current={isActive('/dashboard') ? 'page' : undefined}
            >
              Dashboard
            </Link>

            <Link
              href="/property/1"
              className={linkClass(isActive('/property'))}
              aria-current={isActive('/property') ? 'page' : undefined}
            >
              Property View
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
