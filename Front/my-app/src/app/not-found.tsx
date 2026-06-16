import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="section flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-bold text-gold md:text-8xl">404</p>
      <h1 className="mt-4 text-3xl md:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        The page you are looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary px-6 py-3 text-base">
          <Home size={18} />
          Back home
        </Link>
        <Link href="/products" className="btn btn-outline px-6 py-3 text-base">
          <Search size={18} />
          Browse products
        </Link>
      </div>
    </div>
  );
}
