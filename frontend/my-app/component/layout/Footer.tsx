import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Data Lens</h3>
            <p className="text-sm leading-relaxed">
              Extract structured website data from URLs and screenshots.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 rounded-sm">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 rounded-sm">
                    Extract Data
                  </a>
                </li>
                <li>
                  <a href="#" className="transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 rounded-sm">
                    GitHub
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="space-y-3">
            <p className="text-sm">Built for developers and data teams.</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-xs">
          <p>© 2026 DataLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
