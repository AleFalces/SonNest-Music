"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Linkedin, ChevronDown, ChevronUp } from "lucide-react";

const Footer: React.FC = () => {
  const [showFrontend, setShowFrontend] = useState(false);
  const [showBackend, setShowBackend] = useState(false);

  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 bg-night text-cream-100">
      <div className="section grid grid-cols-1 gap-10 py-12 md:grid-cols-3">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-cream-100"
          >
            Sound<span className="text-gold">Nest</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-200/70">
            A boutique store for musical instruments — crafted gear, fair stock,
            and a smooth checkout.
          </p>
        </div>

        {/* Technologies */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gold">
            Technologies Used
          </h2>
          <div className="space-y-3">
            <div>
              <button
                onClick={() => setShowFrontend((v) => !v)}
                className="flex items-center gap-2 text-sm text-cream-100 transition-colors hover:text-gold"
                aria-expanded={showFrontend}
              >
                <span>Front-end</span>
                {showFrontend ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showFrontend && (
                <ul className="ml-4 mt-2 space-y-1 text-sm text-cream-200/70">
                  <li>TypeScript</li>
                  <li>Next.js</li>
                  <li>Tailwind CSS</li>
                  <li>React Hot Toast</li>
                  <li>Lucide React</li>
                </ul>
              )}
            </div>

            <div>
              <button
                onClick={() => setShowBackend((v) => !v)}
                className="flex items-center gap-2 text-sm text-cream-100 transition-colors hover:text-gold"
                aria-expanded={showBackend}
              >
                <span>Back-end</span>
                {showBackend ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showBackend && (
                <ul className="ml-4 mt-2 space-y-1 text-sm text-cream-200/70">
                  <li>Express</li>
                  <li>TypeScript</li>
                  <li>PostgreSQL</li>
                  <li>JWT</li>
                  <li>TypeORM</li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-gold">Contact</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="https://www.linkedin.com/in/alexis-falces-95b892252/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-cream-100 transition-colors hover:text-gold"
              >
                <Linkedin size={16} />
                <span>Alexis Falces</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:alefalces@gmail.com"
                className="flex items-center gap-2 text-cream-100 transition-colors hover:text-gold"
              >
                <Mail size={16} />
                <span>alefalces@gmail.com</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="section flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream-200/60 sm:flex-row">
          <span>© {year} SoundNest. All rights reserved.</span>
          <span>Built by Alexis Falces</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
