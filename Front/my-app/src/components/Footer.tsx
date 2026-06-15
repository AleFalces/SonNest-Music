"use client";

import { useState } from "react";
import { Mail, Linkedin, ChevronDown, ChevronUp } from "lucide-react";

const Footer: React.FC = () => {
  const [showFrontend, setShowFrontend] = useState(false);
  const [showBackend, setShowBackend] = useState(false);

  return (
    <footer className="bg-gray-900 text-white py-8 mt-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
        <div>
          <h2 className="text-xl text-amber-100 font-semibold mb-4">
            Technologies Used
          </h2>

          <div className="space-y-4">
            <div>
              <button
                onClick={() => setShowFrontend(!showFrontend)}
                className="flex items-center gap-2 hover:text-amber-200 transition-colors focus:outline-none"
              >
                <span>Front-end</span>
                {showFrontend ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              {showFrontend && (
                <ul className="list-disc ml-6 mt-2 text-gray-300 text-sm space-y-1">
                  <li>TypeScript</li>
                  <li>Next.js</li>
                  <li>Tailwind CSS</li>
                  <li>SweetAlert2</li>
                  <li>Lucide React</li>
                </ul>
              )}
            </div>

            <div>
              <button
                onClick={() => setShowBackend(!showBackend)}
                className="flex items-center gap-2 hover:text-amber-200 transition-colors focus:outline-none"
              >
                <span>Back-end</span>
                {showBackend ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
              {showBackend && (
                <ul className="list-disc ml-6 mt-2 text-gray-300 text-sm space-y-1">
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

        {/* Contacto */}
        <div>
          <h2 className="text-xl font-semibold text-amber-100  mb-4">
            Contact
          </h2>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex items-center gap-2 hover:text-amber-200">
              <Linkedin size={16} />
              <a
                href="https://www.linkedin.com/in/alexis-falces-95b892252/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Alexis Falces
              </a>
            </li>
            <li className="flex items-center gap-2 hover:text-amber-200">
              <Mail size={16} />
              <a href="mailto:alefalces@gmail.com">alefalces@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
