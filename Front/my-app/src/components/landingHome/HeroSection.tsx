"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative flex min-h-[88vh] items-center justify-center px-6"
      style={{
        backgroundImage: "url(/instruments.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Real gradient overlay for legibility (the old bg-opacity div did nothing). */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink/85" />

      <div
        className={`relative max-w-3xl text-center transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <span className="badge badge-gold mb-5">Musical instruments · est. 2026</span>

        <h1 className="font-display text-4xl font-bold leading-tight text-cream-100 drop-shadow-md md:text-6xl">
          Find the instrument that sounds like you
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-cream-200/90 drop-shadow md:text-xl">
          Explore a curated selection of guitars, basses and more — quality gear,
          honest stock and a checkout that just works.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/products" className="btn btn-accent px-6 py-3 text-base">
            Shop now
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/about"
            className="btn px-6 py-3 text-base text-cream-100 ring-1 ring-cream-100/40 hover:bg-cream-100/10"
          >
            <Info size={18} />
            About us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
