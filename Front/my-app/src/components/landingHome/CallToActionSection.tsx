"use client";

import Link from "next/link";
import { Rocket, UserPlus, ArrowRight } from "lucide-react";

const CallToActionSection: React.FC = () => {
  return (
    <section className="bg-bordo px-6 py-16 text-center">
      <div className="section">
        <h2 className="flex items-center justify-center gap-2 text-3xl text-cream-100 md:text-4xl">
          <Rocket size={28} />
          Ready to get started?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-cream-200/80">
          Discover our products right now and find your next instrument.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/products" className="btn btn-accent px-6 py-3 text-base">
            View Products
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/registerUser"
            className="btn px-6 py-3 text-base text-cream-100 ring-1 ring-cream-100/40 hover:bg-cream-100/10"
          >
            <UserPlus size={18} />
            Sign Up Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
